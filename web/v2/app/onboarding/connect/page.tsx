import Image from "next/image";
import ProgressBar from "@/components/onboarding/ProgressBar";

export default function ConnectPage() {
  return (
    <div>
      <ProgressBar step={1} />

      <h2 className="text-3xl font-display font-medium text-brand tracking-tight mb-3">
        Show us what you love.
      </h2>
      <p className="text-brand-soft text-base leading-relaxed mb-8">
        Connect a Pinterest board of outfits, mood boards, anything. We&apos;ll
        learn your aesthetic in seconds.
      </p>

      <a
        href="/api/pinterest/auth"
        className="flex items-center gap-4 p-5 bg-white border border-[rgba(102,12,13,0.1)] rounded-2xl hover:border-[#E60023] hover:shadow-sm transition-all group mb-4"
      >
        <div className="w-12 h-12 rounded-full bg-[#E60023]/8 flex items-center justify-center group-hover:bg-[#E60023]/15 transition-colors flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#E60023">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-brand text-sm mb-0.5">
            Connect Pinterest
          </p>
          <p className="text-xs text-brand-soft">Takes about 10 seconds</p>
        </div>
        <span className="text-brand-soft group-hover:text-brand transition-colors">→</span>
      </a>

      {/* Privacy note */}
      <div className="flex items-start gap-2.5 bg-white border border-[rgba(102,12,13,0.08)] rounded-xl px-4 py-3 mb-6">
        <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 mt-0.5 opacity-60 flex-shrink-0" />
        <p className="text-xs text-brand-soft leading-relaxed">
          We only read the board you choose. We never post, share, or store your Pinterest credentials.
        </p>
      </div>

      <div className="text-center">
        <a
          href="/onboarding/swipe"
          className="text-sm text-brand-soft hover:text-brand transition-colors underline-offset-2 hover:underline"
        >
          Skip for now →
        </a>
      </div>
    </div>
  );
}
