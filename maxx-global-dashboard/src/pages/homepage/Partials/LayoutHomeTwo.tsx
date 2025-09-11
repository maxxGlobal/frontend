import { useState } from "react";
import type { ReactNode } from "react";
import DiscountBanner from "../HomeTwo/DiscountBanner";
import Drawer from "../Mobile/Drawer";
import Footer from "./Footers/FooterTwo";
import HeaderFour from "./Headers/HeaderFour";

type LayoutHomeTwoProps = {
  children: ReactNode;
  childrenClasses?: string;
};

export default function LayoutHomeTwo({
  children,
  childrenClasses,
}: LayoutHomeTwoProps) {
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <Drawer open={drawer} action={() => setDrawer(!drawer)} />
      <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
        <HeaderFour drawerAction={() => setDrawer(!drawer)} />

        <main
          className={`flex-1 w-full ${
            childrenClasses || "pt-[30px] pb-[60px]"
          }`}
        >
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}
