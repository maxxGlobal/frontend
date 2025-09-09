import type { ReactNode } from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

type SimpleSliderProps = {
  className?: string;
  settings?: Settings;
  children: ReactNode;
  selector?: React.RefObject<Slider>;
};

export default function SimpleSlider({
  className,
  settings,
  children,
  selector,
}: SimpleSliderProps) {
  return (
    <Slider ref={selector} className={`${className || ""}`} {...settings}>
      {children}
    </Slider>
  );
}
