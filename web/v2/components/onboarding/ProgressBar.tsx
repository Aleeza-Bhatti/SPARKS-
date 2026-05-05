type Props = { step: 1 | 2 | 3 | 4 };

export default function ProgressBar({ step }: Props) {
  return (
    <div className="relative h-1.5 w-full bg-[rgba(102,12,13,0.08)] rounded-full mb-8 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
        style={{
          width: `${(step / 4) * 100}%`,
          background: "linear-gradient(90deg, #FFCFC5 0%, #E8605A 45%, #D07040 100%)",
        }}
      />
    </div>
  );
}
