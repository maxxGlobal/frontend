import { useState } from "react";
import type { ReactNode } from "react";
import DiscountBanner from "../HomeTwo/DiscountBanner";
import Drawer from "../Mobile/Drawer";
import HeaderFour from "./Headers/HeaderFour";
import FooterFour from "./Footers/FooterFour";

type LayoutHomeFourProps = {
  children: ReactNode;
  childrenClasses?: string;
  type?: number;
};

export default function LayoutHomeFour({
  children,
  childrenClasses,
  type = 4,
}: LayoutHomeFourProps) {
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <Drawer open={drawer} action={() => setDrawer(!drawer)} />
      <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
        <HeaderFour type={type} drawerAction={() => setDrawer(!drawer)} />

        <main
          className={`flex-1 w-full ${
            childrenClasses || "pt-[30px] pb-[60px]"
          }`}
        >
          {children}
        </main>

        <DiscountBanner />
        <FooterFour />
      </div>
    </>
  );
}
