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
