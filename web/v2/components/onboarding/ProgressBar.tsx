type Props = { step: 1 | 2 | 3 | 4 };

export default function ProgressBar({ step }: Props) {
  return (
    <div className="relative h-1.5 w-full bg-[rgba(102,12,13,0.08)] rounded-full mb-8 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
        style={{
          width: `${(step / 4) * 100}%`,
          background: "linear-gradient(90deg, #8A3F37 0%, #621414 55%, #3F0D0D 100%)",
        }}
      />
    </div>
  );
}
