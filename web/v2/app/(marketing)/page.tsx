import Image from "next/image";
import MarketingNav from "@/components/nav/MarketingNav";
import ClothingCarousel from "@/components/ClothingCarousel";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <MarketingNav />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6 text-center">
        <div className="w-full max-w-lg mx-auto">

          {/* Sparkle accent */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/assets/starline.svg" alt="" className="w-16 opacity-50" />
            <img src="/assets/sparkle.svg" alt="" className="w-5 h-5 sparkle-pulse" />
            <img src="/assets/starline.svg" alt="" className="w-16 opacity-50 scale-x-[-1]" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-display font-medium leading-tight tracking-tight mb-6">
            <span className="text-brand">Clothes that fit your style</span>{" "}
            <em className="not-italic sparks-gradient-text font-display">and</em>{" "}
            <span className="text-brand">your standards.</span>
          </h1>

          {/* Body */}
          <p className="text-base text-brand-soft leading-relaxed mb-10 max-w-sm mx-auto">
            Tell us where your boundaries are. We&apos;ll search hundreds of
            brands and bring back only what actually fits.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 mb-12">
            <a
              href="/api/pinterest/auth"
              className="inline-flex items-center gap-2.5 text-white font-semibold px-7 py-3.5 rounded-full text-sm bg-[#5A171A] transition-colors hover:bg-[#C96F35] shadow-md w-full max-w-xs justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
              Continue with Pinterest
            </a>

            <p className="text-xs text-brand-soft/40">
              Pinterest OAuth · we never post or share
            </p>
          </div>
        </div>

        {/* Clothing carousel */}
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #FAF8F5, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #FAF8F5, transparent)" }} />
            <ClothingCarousel />
          </div>
          <p className="text-xs text-brand-soft/40 text-center mt-4">
            From modest fashion brands you&apos;ll actually love
          </p>
        </div>
      </main>

      {/* Three-step strip */}
      <footer className="border-t border-[rgba(102,12,13,0.1)] py-8 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-center">
          {[
            { icon: "🔗", label: "Connect", desc: "Link a Pinterest board" },
            { icon: "✦", label: "Refine", desc: "Set your standards" },
            { icon: "✓", label: "Discover", desc: "Get matched picks" },
          ].map(({ icon, label, desc }) => (
            <div key={label}>
              <div className="w-8 h-8 rounded-full bg-[rgba(102,12,13,0.06)] text-brand text-sm flex items-center justify-center mx-auto mb-2">
                {icon}
              </div>
              <p className="text-sm font-medium text-brand">{label}</p>
              <p className="text-xs text-brand-soft mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
