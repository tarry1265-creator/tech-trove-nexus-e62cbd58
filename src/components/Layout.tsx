import { ReactNode } from "react";
import DesktopNav from "./DesktopNav";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showBottomNav?: boolean;
}

const Layout = ({ children, showNav = true, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="page-container">
      {showNav && <DesktopNav />}
      <main className="min-h-screen lg:pb-0 pb-20">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
