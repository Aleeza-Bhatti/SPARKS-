import Link from "next/link";
import Image from "next/image";

export default function MarketingNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
      <Link href="/" className="flex items-center">
        <Image src="/sparks-logo.png" alt="Sparks" width={88} height={28} className="h-7 w-auto" priority />
      </Link>

      <div className="hidden sm:flex items-center gap-7 text-sm text-brand-soft">
        <Link href="/#how-it-works" className="hover:text-brand transition-colors">
          How it works
        </Link>
        <Link href="/#brands" className="hover:text-brand transition-colors">
          Brands
        </Link>
      </div>

      <a
        href="/api/pinterest/auth"
        className="text-sm font-medium text-brand border border-[rgba(102,12,13,0.2)] rounded-full px-4 py-1.5 hover:bg-[rgba(102,12,13,0.05)] transition-colors"
      >
        Sign in
      </a>
    </nav>
  );
}
