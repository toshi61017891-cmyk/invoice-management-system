import type { ReactNode } from "react";

/**
 * 共通バッジコンポーネント
 *
 * ステータス表示などに使用します。
 */
interface BadgeProps {
  children: ReactNode;
  variant?: "gray" | "blue" | "green" | "yellow" | "red";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "gray", size = "md" }: BadgeProps) {
  const variantStyles = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
