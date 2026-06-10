import {
  Gamepad2,
  House,
  Import,
  type LucideIcon,
  ScrollText,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: House, end: true },
  { label: "Games", href: "/games", icon: Gamepad2 },
  { label: "Guides", href: "/guides", icon: ScrollText },
  { label: "Import", href: "/import", icon: Import },
  { label: "Settings", href: "/settings", icon: Settings },
];

type PrimaryNavigationProps = {
  className?: string;
  mobile?: boolean;
  "aria-label"?: string;
};

export function PrimaryNavigation({
  className,
  mobile = false,
  "aria-label": ariaLabel = "Primary navigation",
}: PrimaryNavigationProps) {
  return (
    <nav aria-label={ariaLabel} className={cn(className)}>
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                mobile
                  ? "min-h-14 flex-col justify-center gap-1 px-1 text-[0.68rem]"
                  : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
            end={item.end}
            key={item.href}
            to={item.href}
          >
            <Icon
              aria-hidden="true"
              className={cn("size-4", mobile && "size-5")}
            />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
