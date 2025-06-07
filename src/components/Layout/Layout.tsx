import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/provider/ThemeProvider";

const Layout = (): React.ReactElement => {
  return (
    <ThemeProvider>
      <section className="min-h-[100dvh] w-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        <div className="mx-auto w-full max-w-[375px] min-h-[100dvh] flex flex-col relative">
          {/* <TopNav /> */}
          <main className="flex-1 min-h-0 overflow-y-auto px-safe pt-safe pb-safe border border-red-200">
            <Outlet />
          </main>
          {/* <BottomNav /> */}
        </div>
      </section>
    </ThemeProvider>
  );
};

export default Layout;
