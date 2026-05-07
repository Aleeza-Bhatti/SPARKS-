import Image from "next/image";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100svh] flex-1 flex-col bg-[#FAF8F5]">
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-5">
        <Image src="/sparks-logo.png" alt="Sparks" width={180} height={58} className="h-14 w-auto sm:h-16" priority />
      </div>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-start px-4 pb-5 pt-24 sm:px-6 sm:pb-8 sm:pt-28 lg:justify-center">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
