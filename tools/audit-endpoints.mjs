import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import * as ts from 'typescript'

const DEFAULT_SWAGGER_PATH = 'C:\\Users\\USER\\Documents\\api-docs-essebills.json'

const HTTP_METHODS = /** @type {const} */ ([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
])

const FETCH_CALLEES = new Set([
  'apiFetch',
  'voidFetch',
  'multipartFetch',
  'fileFetch',
  'fetchWithBase',
  // Admin wrappers
  'adminJsonFetch',
  'adminVoidFetch',
  'adminFileFetch',
])

/**
 * @param {string} p
 */
function normalizeSwaggerPath(p) {
  const withLeadingSlash = p.startsWith('/') ? p : `/${p}`
  // Normalize {id} / {userId} to {param} to match the earlier report format.
  const normalizedParams = withLeadingSlash.replaceAll(/\{[^}]+\}/g, '{param}')
  // Normalize trailing slashes to reduce false "unused" matches.
  return normalizedParams.length > 1 ? normalizedParams.replace(/\/+$/, '') : normalizedParams
}

/**
 * @param {string} p
 */
function stripQueryString(p) {
  const idx = p.indexOf('?')
  return idx >= 0 ? p.slice(0, idx) : p
}

/**
 * @param {string} s
 */
function normalizeUsedPath(s) {
  // Keep paths as relative (no origin); strip query; normalize swagger-style params.
  const trimmed = s.trim()
  if (!trimmed) return ''
  const withoutQuery = stripQueryString(trimmed)
  const ensuredSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  // Convert `${...}` placeholders already rendered as `{param}` in our evaluator.
  const normalizedParams = ensuredSlash.replaceAll(/\{[^}]+\}/g, '{param}')
  let normalized = normalizedParams.length > 1 ? normalizedParams.replace(/\/+$/, '') : normalizedParams

  // If a template placeholder was used to represent a query-string suffix (e.g.
  // `/v1/service-charges/applicable${...}`), our evaluator often produces a
  // trailing `{param}` with no preceding slash. Strip that so it matches Swagger.
  if (normalized.endsWith('{param}') && !normalized.endsWith('/{param}')) {
    normalized = normalized.slice(0, -'{param}'.length)
  }

  return normalized
}

/**
 * @param {ts.Expression} expr
 * @returns {string | null}
 */
function evalStaticString(expr) {
  if (ts.isStringLiteral(expr)) return expr.text
  if (ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text

  if (ts.isTemplateExpression(expr)) {
    let out = expr.head.text
    for (const span of expr.templateSpans) {
      out += '{param}'
      out += span.literal.text
    }
    return out
  }

  if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = evalStaticString(expr.left)
    const right = evalStaticString(expr.right)
    if (left == null || right == null) return null
    return left + right
  }

  return null
}

/**
 * Turn an ArrowFunction (or FunctionExpression) that returns a string into a `{param}`-templated path.
 * This intentionally only supports simple cases (template string / string literal / concatenation).
 *
 * @param {ts.ArrowFunction | ts.FunctionExpression} fn
 * @returns {string | null}
 */
function evalEndpointFunctionReturn(fn) {
  if (ts.isBlock(fn.body)) {
    // Use the last return statement in the function, if any.
    /** @type {ts.ReturnStatement | null} */
    let lastReturn = null
    fn.body.statements.forEach((st) => {
      if (ts.isReturnStatement(st)) lastReturn = st
    })
    if (!lastReturn?.expression) return null
    const s = evalStaticString(lastReturn.expression)
    if (s == null) return null
    // Many endpoint builders append query strings; keep only the base path.
    return stripQueryString(s)
  }

  const s = evalStaticString(fn.body)
  if (s == null) return null
  return stripQueryString(s)
}

/**
 * @typedef {{ kind: 'string', value: string } | { kind: 'fn', value: string } | { kind: 'obj', value: Record<string, EndpointValue> }} EndpointValue
 */

/**
 * @param {ts.ObjectLiteralExpression} obj
 * @returns {Record<string, EndpointValue>}
 */
function parseEndpointsObject(obj) {
  /** @type {Record<string, EndpointValue>} */
  const result = {}

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    const key = ts.isIdentifier(prop.name)
      ? prop.name.text
      : ts.isStringLiteral(prop.name)
        ? prop.name.text
        : null
    if (!key) continue

    const init = prop.initializer
    if (ts.isObjectLiteralExpression(init)) {
      result[key] = { kind: 'obj', value: parseEndpointsObject(init) }
      continue
    }

    const str = evalStaticString(init)
    if (str != null) {
      result[key] = { kind: 'string', value: stripQueryString(str) }
      continue
    }

    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
      const fnPath = evalEndpointFunctionReturn(init)
      if (fnPath) result[key] = { kind: 'fn', value: fnPath }
    }
  }

  return result
}

/**
 * @param {string} filePath
 * @param {string} varName
 * @returns {Promise<Record<string, EndpointValue>>}
 */
async function loadEndpointsMap(filePath, varName) {
  const src = await fs.readFile(filePath, 'utf8')
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  /** @type {Record<string, EndpointValue>} */
  let map = {}

  sf.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== varName) continue
      // Handle `const X = { ... } as const` (AsExpression) or direct object.
      let init = decl.initializer
      if (!init) continue
      if (ts.isAsExpression(init)) init = init.expression
      if (!ts.isObjectLiteralExpression(init)) continue
      map = parseEndpointsObject(init)
    }
  })

  return map
}

/**
 * Resolve something like `API_ENDPOINTS.customer.transactions.byId(...)`
 * into the underlying string pattern (e.g. `/v1/customer/transactions/{param}`).
 *
 * @param {ts.Expression} expr
 * @param {Record<string, EndpointValue>} apiMap
 * @param {Record<string, EndpointValue>} adminMap
 * @returns {string | null}
 */
function resolveEndpointExpression(expr, apiMap, adminMap) {
  // Prefer endpoint references over the naive template evaluator, because many
  // call sites build URLs like `${API_ENDPOINTS.x}?${query}`.
  // This resolver tries to understand template expressions and conditionals.

  /**
   * @param {EndpointValue | undefined} node
   * @param {string[]} keys
   */
  function walk(node, keys) {
    if (!node) return null
    if (keys.length === 0) {
      if (node.kind === 'string' || node.kind === 'fn') return node.value
      return null
    }
    if (node.kind !== 'obj') return null
    const [k, ...rest] = keys
    return walk(node.value[k], rest)
  }

  /**
   * @param {ts.Expression} e
   * @returns {{ root: 'API' | 'ADMIN', keys: string[], call: boolean } | null}
   */
  function getChain(e) {
    // CallExpression: <chain>(...)
    if (ts.isCallExpression(e)) {
      const inner = getChain(e.expression)
      if (!inner) return null
      return { ...inner, call: true }
    }

    // PropertyAccessExpression: x.y
    if (ts.isPropertyAccessExpression(e)) {
      const inner = getChain(e.expression)
      if (!inner) return null
      return { ...inner, keys: [...inner.keys, e.name.text] }
    }

    if (ts.isIdentifier(e)) {
      if (e.text === 'API_ENDPOINTS') return { root: 'API', keys: [], call: false }
      if (e.text === 'ADMIN_ENDPOINTS') return { root: 'ADMIN', keys: [], call: false }
    }

    return null
  }

  const chain = getChain(expr)
  if (!chain) return null

  const rootMap = chain.root === 'API' ? apiMap : adminMap
  const node = walk({ kind: 'obj', value: rootMap }, chain.keys)
  if (!node) return null

  // If it was a property call, we stored the function return as a pattern already.
  return node
}

/**
 * Evaluate a URL expression into one or more path patterns.
 * Handles conditionals and template expressions that embed endpoint constants.
 *
 * @param {ts.Expression} expr
 * @param {Record<string, EndpointValue>} apiMap
 * @param {Record<string, EndpointValue>} adminMap
 * @returns {string[]}
 */
function resolveUrlExpression(expr, apiMap, adminMap) {
  const unwrapped = ts.isParenthesizedExpression(expr) ? expr.expression : expr

  if (ts.isConditionalExpression(unwrapped)) {
    const a = resolveUrlExpression(unwrapped.whenTrue, apiMap, adminMap)
    const b = resolveUrlExpression(unwrapped.whenFalse, apiMap, adminMap)
    return Array.from(new Set([...a, ...b])).filter(Boolean)
  }

  if (ts.isTemplateExpression(unwrapped)) {
    let out = unwrapped.head.text
    for (const span of unwrapped.templateSpans) {
      const embedded = resolveEndpointExpression(span.expression, apiMap, adminMap)
      out += embedded ? embedded : '{param}'
      out += span.literal.text
    }
    return [stripQueryString(out)]
  }

  const endpointRef = resolveEndpointExpression(unwrapped, apiMap, adminMap)
  if (endpointRef) return [endpointRef]

  const direct = evalStaticString(unwrapped)
  if (direct) return [direct]

  if (
    ts.isBinaryExpression(unwrapped) &&
    unwrapped.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = resolveUrlExpression(unwrapped.left, apiMap, adminMap)
    const right = resolveUrlExpression(unwrapped.right, apiMap, adminMap)
    /** @type {string[]} */
    const combined = []
    for (const l of left) for (const r of right) combined.push(`${l}${r}`)
    return combined
  }

  return []
}

/**
 * @param {ts.ObjectLiteralExpression} obj
 */
function readMethodFromOptionsObject(obj) {
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) continue
    const key = ts.isIdentifier(p.name)
      ? p.name.text
      : ts.isStringLiteral(p.name)
        ? p.name.text
        : null
    if (key !== 'method') continue
    const val = p.initializer
    if (ts.isStringLiteral(val) || ts.isNoSubstitutionTemplateLiteral(val)) return val.text.toUpperCase()
  }
  return null
}

/**
 * @param {string} filePath
 * @param {Record<string, EndpointValue>} apiMap
 * @param {Record<string, EndpointValue>} adminMap
 * @returns {Promise<Set<string>>}
 */
async function extractUsedOperationsFromFile(filePath, apiMap, adminMap) {
  const text = await fs.readFile(filePath, 'utf8')
  const kind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, kind)

  /** @type {Set<string>} */
  const ops = new Set()

  /**
   * @param {ts.Node} node
   */
  function visit(node) {
    // Capture calls to fetch wrappers.
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression) && FETCH_CALLEES.has(node.expression.text)) {
        const calleeName = node.expression.text
        const urlExpr = node.arguments[0]
        if (urlExpr) {
          const candidates = resolveUrlExpression(urlExpr, apiMap, adminMap)
          for (const c of candidates) {
            const rawPath = c ? normalizeUsedPath(c) : ''
            if (!rawPath) continue
            let method = 'GET'
            // apiFetch(url, { method: 'POST' })
            const optionsExpr =
              calleeName === 'multipartFetch' ? node.arguments[2] : node.arguments[1]
            if (optionsExpr && ts.isObjectLiteralExpression(optionsExpr)) {
              const m = readMethodFromOptionsObject(optionsExpr)
              if (m) method = m
            }
            if (HTTP_METHODS.includes(method)) ops.add(`${method} ${rawPath}`)
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sf)
  return ops
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listSourceFiles(dir) {
  /** @type {string[]} */
  const out = []

  /**
   * @param {string} current
   */
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      if (!entry.isFile()) continue
      if (full.endsWith('.ts') || full.endsWith('.tsx')) {
        if (full.endsWith('.d.ts')) continue
        out.push(full)
      }
    }
  }

  await walk(dir)
  return out
}

/**
 * @param {string} swaggerPath
 * @returns {Promise<Set<string>>}
 */
async function loadSwaggerOperations(swaggerPath) {
  const raw = await fs.readFile(swaggerPath, 'utf8')
  const spec = JSON.parse(raw)
  /** @type {Set<string>} */
  const ops = new Set()

  const paths = spec?.paths && typeof spec.paths === 'object' ? spec.paths : {}
  for (const [p, def] of Object.entries(paths)) {
    if (!def || typeof def !== 'object') continue
    for (const method of Object.keys(def)) {
      const up = method.toUpperCase()
      if (!HTTP_METHODS.includes(up)) continue
      const normalized = normalizeSwaggerPath(String(p))
      ops.add(`${up} ${normalized}`)
    }
  }
  return ops
}

/**
 * @param {string} op
 * @returns {{method: string, path: string}}
 */
function parseOp(op) {
  const m = op.match(/^(\w+)\s+(.+)$/)
  if (!m) return { method: 'GET', path: op }
  return { method: m[1], path: m[2] }
}

/**
 * @param {string} endpointPath
 * @returns {{ endpointsFile: string, serviceFile: string, notes?: string }}
 */
function suggestPlacement(endpointPath) {
  const p = endpointPath

  if (p.startsWith('/api/v2/esolutions')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/admin/services/esolutionsV2.service.ts',
      notes: 'Add a new v2 service (legacy/sidecar endpoints).',
    }
  }

  if (p.startsWith('/system/v1/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/systemLookups.service.ts',
      notes: 'New lightweight lookup service for by-code lookups.',
    }
  }

  if (p.startsWith('/opn/v1/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/products.service.ts',
      notes: 'Public (no-auth) endpoints; keep under API_ENDPOINTS.products/opn.',
    }
  }

  if (p.startsWith('/v1/admin/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/features/admin/services/admin.endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/admin/services/*',
      notes: 'Admin-only endpoints; add wrapper in the closest admin service file.',
    }
  }

  if (p.startsWith('/v1/access-control/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/accessControl.service.ts',
      notes: 'Shared access-control endpoints; admin pages may call via ADMIN_ENDPOINTS too.',
    }
  }

  if (p.startsWith('/v1/analytics/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/analytics.service.ts',
      notes: 'If you need dedicated wrappers, create analytics.service.ts.',
    }
  }

  if (p.startsWith('/v1/agent/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/agent/services/agent.service.ts',
    }
  }

  if (p.startsWith('/v1/biller/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/biller/services/biller-api.service.ts',
    }
  }

  if (p.startsWith('/v1/customer/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/customer/services/customer-api.service.ts',
    }
  }

  if (p.startsWith('/v1/country-currencies')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/features/admin/services/admin.endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/admin/services/adminLookups.service.ts',
      notes: 'Mostly admin lookups (country-currency bindings).',
    }
  }

  if (p.startsWith('/v1/currencies') || p.startsWith('/v1/countries') || p.startsWith('/v1/banks')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/products.service.ts',
      notes: 'Shared lookups are currently implemented in products.service.ts.',
    }
  }

  if (p.startsWith('/v1/esebills-accounts')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/wallet.service.ts',
    }
  }

  if (p.startsWith('/v1/payment-transactions') || p.startsWith('/v1/portal/product-payment')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/transactions.service.ts',
    }
  }

  if (p.startsWith('/v1/pesepay-integration-credentials') || p.startsWith('/v1/pesepay/')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/integrations.service.ts',
    }
  }

  if (p.startsWith('/v1/product-fields')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/features/admin/services/admin.endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/admin/services/adminModules.service.ts',
      notes: 'Admin management of provider-required field catalog.',
    }
  }

  if (p.startsWith('/v1/product-categories') || p.startsWith('/v1/products')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/products.service.ts',
    }
  }

  if (p.startsWith('/v1/providers')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/features/admin/services/admin.endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/admin/services/adminModules.service.ts',
    }
  }

  if (p.startsWith('/v1/service-charges')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/serviceCharge.service.ts',
    }
  }

  if (p.startsWith('/v1/donations') || p.startsWith('/v1/donation-campaigns')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/donations.service.ts',
    }
  }

  if (p.startsWith('/v1/whatsapp')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/features/admin/services/admin.endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/features/admin/services/adminModules.service.ts',
    }
  }

  if (p.startsWith('/v1/sms')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/sms.service.ts',
      notes: 'New service (no current usage in UI).',
    }
  }

  if (p.startsWith('/v1/user/bank-top-ups')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/wallet.service.ts',
    }
  }

  if (p.startsWith('/v1/users') || p.startsWith('/v1/groups')) {
    return {
      endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
      serviceFile: 'esseBills/essebills-web/src/services/users.service.ts',
    }
  }

  return {
    endpointsFile: 'esseBills/essebills-web/src/api/endpoints.ts',
    serviceFile: 'esseBills/essebills-web/src/services/index.ts',
    notes: 'No obvious existing service; consider creating a new one.',
  }
}

/**
 * @param {string} title
 * @param {string[]} ops
 */
function renderSection(title, ops) {
  const lines = [`## ${title}`, '']
  for (const op of ops) {
    const { method, path: p } = parseOp(op)
    const placement = suggestPlacement(p)
    const where = `- \`${method} ${p}\` -> \`${placement.serviceFile}\` (endpoints: \`${placement.endpointsFile}\`)`
    lines.push(where)
    if (placement.notes) lines.push(`  - ${placement.notes}`)
  }
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const swaggerPath = process.argv[2] || DEFAULT_SWAGGER_PATH
  const repoRoot = process.cwd()

  const apiEndpointsPath = path.join(repoRoot, 'src', 'api', 'endpoints.ts')
  const adminEndpointsPath = path.join(repoRoot, 'src', 'features', 'admin', 'services', 'admin.endpoints.ts')

  const [apiMap, adminMap] = await Promise.all([
    loadEndpointsMap(apiEndpointsPath, 'API_ENDPOINTS'),
    loadEndpointsMap(adminEndpointsPath, 'ADMIN_ENDPOINTS'),
  ])

  const srcDir = path.join(repoRoot, 'src')
  const files = await listSourceFiles(srcDir)

  /** @type {Set<string>} */
  const usedOps = new Set()
  for (const f of files) {
    const fileOps = await extractUsedOperationsFromFile(f, apiMap, adminMap)
    fileOps.forEach((op) => usedOps.add(op))
  }

  const swaggerOps = await loadSwaggerOperations(swaggerPath)

  // Normalize both sides to `{param}` paths
  /** @type {Set<string>} */
  const normalizedUsed = new Set()
  usedOps.forEach((op) => {
    const { method, path: p } = parseOp(op)
    normalizedUsed.add(`${method} ${normalizeSwaggerPath(normalizeUsedPath(p))}`)
  })

  /** @type {string[]} */
  const unused = []
  swaggerOps.forEach((op) => {
    if (!normalizedUsed.has(op)) unused.push(op)
  })
  unused.sort()

  // Heuristic: some Swagger operations are convenience aliases (e.g. `/all`,
  // `/active`) for endpoints the app already uses. Track these separately.
  /** @type {Array<{ unused: string, coveredBy: string }>} */
  const coveredByUsed = []
  /** @type {string[]} */
  const uncoveredUnused = []

  for (const op of unused) {
    const { method, path: p } = parseOp(op)
    /** @type {string[]} */
    const candidates = []

    if (p.endsWith('/all')) candidates.push(p.slice(0, -'/all'.length))
    if (p.endsWith('/active')) candidates.push(p.slice(0, -'/active'.length))
    if (p.endsWith('/all-active')) candidates.push(p.slice(0, -'/all-active'.length))

    let foundCover = null
    for (const cp of candidates) {
      const key = `${method} ${cp}`
      if (normalizedUsed.has(key)) {
        foundCover = key
        break
      }
    }

    if (foundCover) coveredByUsed.push({ unused: op, coveredBy: foundCover })
    else uncoveredUnused.push(op)
  }

  const docsDir = path.join(repoRoot, 'docs')
  await fs.mkdir(docsDir, { recursive: true })

  const usedOut = path.join(docsDir, 'endpoints-used.v2.txt')
  const unusedOut = path.join(docsDir, 'swagger-endpoints-unused.v2.txt')
  const unusedUncoveredOut = path.join(docsDir, 'swagger-endpoints-unused.uncovered.v2.txt')
  const unusedCoveredOut = path.join(docsDir, 'swagger-endpoints-unused.covered-by-used.v2.txt')
  const placementOut = path.join(docsDir, 'swagger-endpoints-unused-with-placement.md')

  await fs.writeFile(usedOut, Array.from(normalizedUsed).sort().join('\n') + '\n', 'utf8')
  await fs.writeFile(unusedOut, unused.join('\n') + '\n', 'utf8')
  await fs.writeFile(unusedUncoveredOut, uncoveredUnused.join('\n') + '\n', 'utf8')
  await fs.writeFile(
    unusedCoveredOut,
    coveredByUsed
      .slice()
      .sort((a, b) => a.unused.localeCompare(b.unused))
      .map((r) => `${r.unused}  (covered by: ${r.coveredBy})`)
      .join('\n') + '\n',
    'utf8'
  )

  // Group unused by a stable prefix for readability: /v1/admin, /v1/customer, etc.
  /** @type {Map<string, string[]>} */
  const groups = new Map()
  for (const op of unused) {
    const { path: p } = parseOp(op)
    const seg = normalizeUsedPath(p).replace(/^\/+/, '').split('/')
    const prefix = seg.length >= 2 ? `/${seg[0]}/${seg[1]}` : seg.length === 1 ? `/${seg[0]}` : '/'
    const arr = groups.get(prefix) ?? []
    arr.push(op)
    groups.set(prefix, arr)
  }

  const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => {
    const ca = groups.get(a)?.length ?? 0
    const cb = groups.get(b)?.length ?? 0
    return cb - ca || a.localeCompare(b)
  })

  const md = [
    '# Unused Swagger endpoints (v2)',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Swagger: ${swaggerPath}`,
    '',
    `Total unused operations: **${unused.length}**`,
    `Covered by similar used ops (heuristic): **${coveredByUsed.length}**`,
    `Uncovered (likely truly unused): **${uncoveredUnused.length}**`,
    '',
    'This list is based on static code scanning of fetch calls (including admin wrappers).',
    '',
    `See also: \`${path.relative(repoRoot, unusedCoveredOut).replaceAll('\\', '/')}\` and \`${path.relative(repoRoot, unusedUncoveredOut).replaceAll('\\', '/')}\`.`,
    '',
  ]

  for (const k of sortedGroupKeys) {
    const ops = (groups.get(k) ?? []).slice().sort()
    md.push(renderSection(k, ops))
  }

  await fs.writeFile(placementOut, md.join('\n'), 'utf8')

  // eslint-disable-next-line no-console
  console.log(
    `Wrote:\n- ${usedOut}\n- ${unusedOut}\n- ${unusedCoveredOut}\n- ${unusedUncoveredOut}\n- ${placementOut}\n`
  )
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exitCode = 1
})
