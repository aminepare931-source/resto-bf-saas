const PARTICLE_POSITIONS = [
  { top: 10, left: 66 },
  { top: 80, left: 85 },
  { top: 24, left: 44 },
  { top: 67, left: 44 },
  { top: 19, left: 31 },
  { top: 23, left: 64 },
  { top: 24, left: 3 },
  { top: 63, left: 33 },
];

export function Particles({ count = 8 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const pos = PARTICLE_POSITIONS[i % PARTICLE_POSITIONS.length];
        return (
          <span
            key={i}
            className="particle"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }}
          />
        );
      })}
    </div>
  );
}
