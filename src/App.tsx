import { RouterProvider } from 'react-router-dom'
import { GoeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import { router } from './router'
import { ErrorBoundary } from './features/shared/components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import { ConfirmDialogContainer } from './features/shared/components/ConfirmDialog'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
        <GoeyToaster position="top-right" bounce={0.3} />
        <ConfirmDialogContainer />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
