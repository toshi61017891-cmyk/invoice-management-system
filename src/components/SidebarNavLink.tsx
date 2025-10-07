"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface SidebarNavLinkProps {
  href: string;
  icon: string;
  children: ReactNode;
}

export function SidebarNavLink({ href, icon, children }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const base = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors";
  const active = "bg-gray-800 text-white";
  const inactive = "hover:bg-gray-800 text-white";

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`${base} ${isActive ? active : inactive}`}
    >
      <span className="text-xl">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
