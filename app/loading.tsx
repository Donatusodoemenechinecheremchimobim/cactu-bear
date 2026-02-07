import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* soft blend */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]" />

      <div className="relative flex flex-col items-center gap-10">
        {/* Transparent logo only */}
        <Image
          src="/loading-logo.png"
          alt="Cactus Bear"
          width={520}
          height={260}
          priority
          className="opacity-95"
        />

        {/* thin luxury loader */}
        <div className="h-[2px] w-44 bg-white/10 overflow-hidden rounded">
          <div className="h-full w-1/3 bg-brand-neon/80 loading-bar" />
        </div>
      </div>
    </div>
  );
}
