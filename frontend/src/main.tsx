import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './assets/styles/index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
// import 'sonner/dist/styles.css';
import FontSizeProvider from './06_providers/font-size-provider.tsx';
import ThemeProvider from './06_providers/theme-provider.tsx';
import App from './App.tsx';
import { Toaster } from './components/ui/sonner.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          expand={true}
          duration={3000}
          richColors
          closeButton
        />
        <ThemeProvider />
        <FontSizeProvider />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
