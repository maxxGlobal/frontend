import { useState, ReactNode } from "react";
import DiscountBanner from "../HomeFive/DiscountBanner";
import Drawer from "../Mobile/Drawer";
import FooterFive from "./Footers/FooterFive";
import HeaderFive from "./Headers/HeaderFive";

type LayoutHomeFiveProps = {
  children: ReactNode;
  childrenClasses?: string;
};

export default function LayoutHomeFive({
  children,
  childrenClasses,
}: LayoutHomeFiveProps) {
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <Drawer open={drawer} action={() => setDrawer(!drawer)} />
      <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
        <HeaderFive drawerAction={() => setDrawer(!drawer)} />
        <main
          className={`flex-1 w-full ${
            childrenClasses || "pt-[30px] pb-[60px]"
          }`}
        >
          {children}
        </main>
        <DiscountBanner />
        <FooterFive />
      </div>
    </>
  );
}
