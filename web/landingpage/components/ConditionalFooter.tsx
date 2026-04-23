"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDE_ON = ["/waitlist", "/login", "/"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p)) return null;
  return <Footer />;
}
