"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/nav/SiteFooter";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith("/onboarding");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
