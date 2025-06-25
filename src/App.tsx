// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { GlobalModalProvider } from './provider/GlobalModalProvider/GlobalModalProvider';
import { Sooner } from '@/components/Sooner/Sonner';
import { ThemeProvider } from '@/provider/ThemeProvider';
import { usePerformanceMonitor } from '@/utils/performance';
import router from './routes';

const queryClient = new QueryClient();

function App() {
  // 성능 모니터링 초기화 (개발 환경에서만)
  if (import.meta.env.NODE_ENV === 'development') {
    usePerformanceMonitor();
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <GlobalModalProvider />
        <Sooner position="bottom-center" style={{ bottom: '80px' }} />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
