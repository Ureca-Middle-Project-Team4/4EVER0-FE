import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { Sooner } from '@/components/Sooner';

const Layout = (): React.ReactElement => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat' || location.pathname.includes('/chat');

  return (
    <section className="relative min-h-[100dvh] w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-full sm:max-w-[600px] bg-background pt-[56px] pb-[56px]">
        <TopNav />
        <main
          className={`px-4 sm:px-6 py-4 ${isChatPage ? '' : 'overflow-y-auto'}`}
          style={{
            height: 'calc(100dvh - 112px)',
            ...(isChatPage
              ? {}
              : {
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }),
          }}
        >
          <Outlet />
        </main>
        <BottomNav />
        <Sooner position="top-center" richColors duration={2000} />
      </div>
    </section>
  );
};

export default Layout;
