import { useState, ReactNode } from "react";
import DiscountBanner from "../Home/DiscountBanner";
import Footer from "./Footers/Footer";
import Header from "./Headers/HeaderOne";
import DrawerThree from "../Mobile/DrawerThree";

type LayoutHomeThreeProps = {
  children: ReactNode;
  childrenClasses?: string;
  type?: number;
};

export default function LayoutHomeThree({
  children,
  childrenClasses,
  type = 3,
}: LayoutHomeThreeProps) {
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <DrawerThree open={drawer} action={() => setDrawer(!drawer)} />
      <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
        <Header type={type} drawerAction={() => setDrawer(!drawer)} />

        <main
          className={`flex-1 w-full ${
            childrenClasses || "pt-[30px] pb-[60px]"
          }`}
        >
          {children}
        </main>

        <DiscountBanner type={type} />
        <Footer type={type} />
      </div>
    </>
  );
}
