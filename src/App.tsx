import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import { router } from './router'
import { ErrorBoundary } from './features/shared/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
      <GoeyToaster position="bottom-center" bounce={0.3} />
    </ErrorBoundary>
  )
}

export default App
