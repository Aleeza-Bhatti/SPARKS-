import Image from "next/image";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <header className="flex items-center px-6 py-4 border-b border-[rgba(102,12,13,0.08)]">
        <Image src="/sparks-logo.png" alt="Sparks" width={80} height={26} className="h-6 w-auto" />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
