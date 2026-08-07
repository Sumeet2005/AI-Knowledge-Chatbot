import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { WorkspaceShell } from './layouts/WorkspaceShell';
import { WorkspaceView } from './views/WorkspaceView';
import { DocumentsView } from './views/DocumentsView';
import { Toaster } from 'react-hot-toast';

// Lazy load flagship Landing page to isolate bundle dependencies from main Workspace
const LandingView = lazy(() => import('./views/LandingView'));

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-xs font-semibold bg-white dark:bg-card-bg-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white rounded-xl shadow-md p-3 font-sans',
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
        <Router>
          <Suspense fallback={
            <div className="w-screen h-screen flex items-center justify-center bg-workspace-bg-light dark:bg-workspace-bg-dark select-none">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              {/* Fullscreen Interactive Landing Route */}
              <Route path="/" element={<LandingView />} />

              {/* Scoped Workspace App Container */}
              <Route element={<WorkspaceShell />}>
                <Route path="/workspace" element={<WorkspaceView />} />
                <Route path="/chat" element={<WorkspaceView />} />
                <Route path="/documents" element={<DocumentsView />} />
              </Route>

              {/* Redirect unmatched links to Landing Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
