import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppNav from "@/components/nav/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="w-full max-w-[1800px] mx-auto px-3 py-5 sm:px-5 sm:py-6 lg:px-8">{children}</main>
    </div>
  );
}
