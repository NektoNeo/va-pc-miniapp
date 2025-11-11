"use client";

export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-background">
      {/* Grid Pattern - barely visible purple grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(147, 51, 234, 0.5) 0px, transparent 1px, transparent 40px, rgba(147, 51, 234, 0.5) 41px),
            repeating-linear-gradient(90deg, rgba(147, 51, 234, 0.5) 0px, transparent 1px, transparent 40px, rgba(147, 51, 234, 0.5) 41px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Purple Glows - Top Left */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, rgba(147, 51, 234, 0.4) 30%, transparent 70%)',
          opacity: 0.5,
          filter: 'blur(80px)',
        }}
      />

      {/* Purple Glows - Top Right */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80"
        style={{
          background: 'radial-gradient(circle, rgba(192, 38, 211, 0.8) 0%, rgba(192, 38, 211, 0.4) 30%, transparent 70%)',
          opacity: 0.4,
          filter: 'blur(100px)',
        }}
      />

      {/* Purple Glows - Bottom Left */}
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0.4) 30%, transparent 70%)',
          opacity: 0.5,
          filter: 'blur(90px)',
        }}
      />

      {/* Purple Glows - Center Right */}
      <div
        className="absolute top-1/2 -right-32 w-96 h-96"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.7) 0%, rgba(147, 51, 234, 0.35) 30%, transparent 70%)',
          opacity: 0.4,
          filter: 'blur(120px)',
        }}
      />
    </div>
  );
}
