import { useMemo } from 'react';

function SpringPetals() {
    const petals = useMemo(
        () =>
            Array.from({ length: 28 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                size: Math.random() * 16 + 10,
                duration: Math.random() * 10 + 14,
                delay: Math.random() * 12,
                drift: Math.random() * 120 - 60,
                rotate: Math.random() * 180 - 90,
                opacity: Math.random() * 0.35 + 0.35,
                hue: i % 3,
            })),
        []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <style>{`
        @keyframes petal-drift {
          0% {
            transform: translate3d(0, -12vh, 0) rotate(0deg) scale(0.95);
          }
          30% {
            transform: translate3d(calc(var(--drift) * 0.35), 28vh, 0) rotate(calc(var(--rotate) * 0.4)) scale(1);
          }
          65% {
            transform: translate3d(var(--drift), 68vh, 0) rotate(calc(var(--rotate) * 0.85)) scale(1.04);
          }
          100% {
            transform: translate3d(calc(var(--drift) * 0.65), 115vh, 0) rotate(var(--rotate)) scale(0.92);
          }
        }

        .spring-petal {
          position: absolute;
          border-radius: 70% 30% 65% 35%;
          animation: petal-drift var(--duration) ease-in infinite;
          animation-delay: var(--delay);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.08);
          filter: blur(0.2px);
        }
      `}</style>

            {petals.map((petal) => {
                const backgrounds = [
                    'linear-gradient(135deg, rgba(255, 244, 214, 0.95), rgba(255, 204, 213, 0.82))',
                    'linear-gradient(135deg, rgba(255, 234, 182, 0.95), rgba(255, 255, 255, 0.8))',
                    'linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(187, 247, 208, 0.8))',
                ];

                return (
                    <div
                        key={petal.id}
                        className="spring-petal"
                        style={{
                            left: `${petal.left}%`,
                            top: '-12vh',
                            width: `${petal.size}px`,
                            height: `${petal.size * 0.72}px`,
                            opacity: petal.opacity,
                            background: backgrounds[petal.hue],
                            '--duration': `${petal.duration}s`,
                            '--delay': `-${petal.delay}s`,
                            '--drift': `${petal.drift}px`,
                            '--rotate': `${petal.rotate}deg`,
                        }}
                    />
                );
            })}
        </div>
    );
}

export default SpringPetals;
