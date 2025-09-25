// src/components/NotificationIcon.tsx
import * as LucideIcons from "lucide-react";

type Props = {
  icon?: string | null;
  size?: number;
  color?: string;
};

export default function NotificationIcon({ icon, size = 18, color }: Props) {
  // shopping-cart → ShoppingCart
  const normalize = (name: string) =>
    name.charAt(0).toUpperCase() +
    name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  let Icon;
  if (icon) {
    Icon = (LucideIcons as any)[normalize(icon)];
  }

  const Fallback = LucideIcons.Bell;

  const Comp = Icon || Fallback;
  return <Comp size={size} color={color} />;
}
