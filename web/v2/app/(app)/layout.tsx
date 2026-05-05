import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AppNav from "@/components/nav/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
