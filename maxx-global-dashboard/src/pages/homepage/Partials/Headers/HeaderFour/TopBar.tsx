import { Link } from "react-router-dom";
import Arrow from "../../../Helpers/icons/Arrow";
import Selectbox from "../../../Helpers/Selectbox";
type TopbarProps = {
  className?: string;
  compareCount?: number;
  wishlistCount?: number;
  cartCount?: number;
};
export default function TopBar({ className }: TopbarProps) {
  return (
    <>
      <div
        className={`w-full bg-white h-10 border-b border-qgray-border ${
          className || ""
        }`}
      ></div>
    </>
  );
}
