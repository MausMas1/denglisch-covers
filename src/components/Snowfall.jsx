import { useMemo } from 'react';

function Snowfall() {
    // Generate snowflakes only once
    const snowflakes = useMemo(() =>
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: Math.random() * 8 + 4,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 10,
            opacity: Math.random() * 0.6 + 0.2,
            drift: Math.random() * 40 - 20,
        }))
        , []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0);
          }
          25% {
            transform: translateY(27.5vh) translateX(var(--drift));
          }
          50% {
            transform: translateY(55vh) translateX(calc(var(--drift) * -0.5));
          }
          75% {
            transform: translateY(82.5vh) translateX(var(--drift));
          }
          100% {
            transform: translateY(110vh) translateX(0);
          }
        }
        .snowflake {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: snowfall var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
      `}</style>
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                        left: `${flake.left}%`,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        '--duration': `${flake.duration}s`,
                        '--delay': `-${flake.delay}s`,
                        '--drift': `${flake.drift}px`,
                    }}
                />
            ))}
        </div>
    );
}

export default Snowfall;
