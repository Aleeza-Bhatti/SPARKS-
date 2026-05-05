type VerificationCheck = { status: "ok" | "warn"; text: string };

export default function VerificationChecks({ checks }: { checks: VerificationCheck[] }) {
  return (
    <ul className="space-y-1">
      {checks.map((check, i) => (
        <li key={i} className="flex items-start gap-1.5">
          <span className={`text-xs mt-0.5 flex-shrink-0 ${check.status === "ok" ? "text-brand" : "text-brand-amber"}`}>
            {check.status === "ok" ? "✓" : "!"}
          </span>
          <span className="text-xs text-brand-soft leading-relaxed">{check.text}</span>
        </li>
      ))}
    </ul>
  );
}
