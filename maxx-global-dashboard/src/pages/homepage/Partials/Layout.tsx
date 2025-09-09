import { useState, ReactNode } from "react";
import DiscountBanner from "../HomeTwo/DiscountBanner";
import Drawer from "../Mobile/Drawer";
import Footer from "./Footers/Footer";
import Header from "./Headers/HeaderFour";

type LayoutProps = {
  children: ReactNode;
  childrenClasses?: string;
};

export default function Layout({ children, childrenClasses }: LayoutProps) {
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <Drawer open={drawer} action={() => setDrawer(!drawer)} />
      <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
        <Header drawerAction={() => setDrawer(!drawer)} />
        <main
          className={`flex-1 w-full ${
            childrenClasses || "pt-[30px] pb-[60px]"
          }`}
        >
          {children}
        </main>
        <DiscountBanner />
        <Footer />
      </div>
    </>
  );
}
