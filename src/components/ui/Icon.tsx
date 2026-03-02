import {
  LayoutDashboard, ArrowLeftRight, Ticket, Wallet, Package,
  SlidersHorizontal, MessageSquare, UserCog, Signal, Key,
  GraduationCap, Building2, Store, CreditCard,
  BarChart2, CircleUser, Settings, HelpCircle, Home, ShoppingCart,
  Table2, User, Users, Users2, Landmark, Receipt, LogOut, Menu, X,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Bell, BellOff, CornerDownRight, Inbox,
  Plus, Download, Upload, Pencil, Eye, EyeOff, MoreVertical, Send,
  CheckCircle, AlertTriangle, Info, Trash2, RefreshCw, FilterX,
  History, Lock, LockOpen, ShieldCheck, ShieldOff, Flag, Building,
  Calendar, Filter, Search, ExternalLink, Copy, RotateCcw, XCircle,
  type LucideIcon, type LucideProps
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation / layout
  dashboard: LayoutDashboard,
  home: Home,
  menu: Menu,
  close: X,
  expand_more: ChevronDown,
  expand_less: ChevronUp,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  subdirectory_arrow_right: CornerDownRight,
  more_vert: MoreVertical,

  // Users & identity
  person: User,
  people: Users,
  group: Users2,
  account_circle: CircleUser,
  manage_accounts: UserCog,

  // Finance & payments
  account_balance_wallet: Wallet,
  account_balance: Landmark,
  payments: CreditCard,
  point_of_sale: ShoppingCart,
  confirmation_number: Ticket,
  receipt_long: Receipt,

  // Actions
  edit: Pencil,
  delete: Trash2,
  delete_forever: Trash2,
  visibility: Eye,
  visibility_off: EyeOff,
  download: Download,
  upload: Upload,
  send: Send,
  add_circle: Plus,
  add: Plus,
  refresh: RefreshCw,
  sync: RefreshCw,
  sync_alt: ArrowLeftRight,
  swap_horiz: ArrowLeftRight,
  rotate_left: RotateCcw,
  content_copy: Copy,
  open_in_new: ExternalLink,

  // Status & feedback
  check_circle: CheckCircle,
  cancel: XCircle,
  warning: AlertTriangle,
  info: Info,
  filter_alt_off: FilterX,
  filter_alt: Filter,
  search: Search,

  // Security
  lock: Lock,
  lock_open: LockOpen,
  verified_user: ShieldCheck,
  gpp_bad: ShieldOff,
  vpn_key: Key,

  // Business / org
  business: Building,
  corporate_fare: Building2,
  storefront: Store,
  inventory_2: Package,
  table_chart: Table2,

  // Comms
  sms: MessageSquare,
  mark_chat_read: CheckCircle,

  // Analytics & data
  analytics: BarChart2,
  history: History,
  calendar_today: Calendar,
  flag: Flag,

  // Misc
  school: GraduationCap,
  network_cell: Signal,
  tune: SlidersHorizontal,
  help: HelpCircle,
  notifications: Bell,
  notifications_off: BellOff,
  inbox: Inbox,
  logout: LogOut,
}

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  const Component = ICON_MAP[name]
  if (!Component) return null
  return <Component size={size} {...props} />
}

export default Icon
