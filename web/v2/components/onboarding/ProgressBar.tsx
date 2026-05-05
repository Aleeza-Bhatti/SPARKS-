type Props = { step: 1 | 2 | 3 | 4 };

export default function ProgressBar({ step }: Props) {
  return (
    <div className="relative h-1.5 w-full bg-[rgba(102,12,13,0.08)] rounded-full mb-8 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
        style={{
          width: `${(step / 4) * 100}%`,
          background: "linear-gradient(90deg, #FBE1CC 0%, #C96F35 45%, #F2A15F 100%)",
        }}
      />
    </div>
  );
}
