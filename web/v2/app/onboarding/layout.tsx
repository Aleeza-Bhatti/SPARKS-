import Image from "next/image";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <header className="flex items-center px-4 py-4 sm:px-6 sm:py-5 border-b border-[rgba(102,12,13,0.08)]">
        <Image src="/sparks-logo.png" alt="Sparks" width={92} height={30} className="h-7 w-auto" />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
