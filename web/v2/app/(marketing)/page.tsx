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
            <span className="text-brand">Find modest clothing that fits </span>
            <em className="not-italic sparks-gradient-text font-display">your style</em>
            <span className="text-brand">.</span>
          </h1>

          {/* Body */}
          <p className="text-base text-brand-soft leading-relaxed mb-10 max-w-sm mx-auto">
            Modest fashion, all in one place. Clothing matched to your personal
            style. Save, layer, and visualize complete outfits before you buy.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 mb-12">
            <a
              href="/onboarding/connect"
              className="inline-flex items-center gap-2.5 text-white font-semibold px-7 py-3.5 rounded-full text-sm bg-[#5A171A] transition-colors hover:bg-[#C96F35] shadow-md w-full max-w-xs justify-center"
            >
              <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 brightness-0 invert" />
              Get started
            </a>
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
      <section className="border-t border-[rgba(102,12,13,0.1)] py-8 px-4 sm:px-6 bg-white">
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
      </section>
    </div>
  );
}
