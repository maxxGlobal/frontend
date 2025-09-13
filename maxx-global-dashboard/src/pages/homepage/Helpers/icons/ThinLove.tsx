type ThinLoveProps = {
  className?: string;
  fillColor?: string; // opsiyonel
};

export default function ThinLove({ className, fillColor }: ThinLoveProps) {
  const fill = fillColor ?? "white"; // iç dolgu

  return (
    <svg
      width="26"
      height="22"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 3.22l-.61-.6a5.5 5.5 0 0 0-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 0 0-7.78-7.77l-.61.61z"
        fill={fill}
        stroke="black"
        strokeWidth={1}
      />
    </svg>
  );
}
