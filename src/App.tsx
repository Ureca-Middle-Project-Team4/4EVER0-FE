import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { GlobalModalProvider } from './provider/GlobalModalProvider/GlobalModalProvider';
import { Sooner } from '@/components/Sooner/Sonner';
import { ThemeProvider } from '@/provider/ThemeProvider';
import router from './routes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <GlobalModalProvider />
        <Sooner position="bottom-center" style={{ bottom: '80px' }} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
