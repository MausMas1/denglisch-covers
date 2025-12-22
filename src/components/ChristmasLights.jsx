import { useMemo } from 'react';

function ChristmasLights() {
    // Generate lights for all four edges
    const lights = useMemo(() => {
        const colors = ['#ff0000', '#00ff00', '#ffd700', '#0066ff', '#ff69b4'];
        const topLights = Array.from({ length: 30 }, (_, i) => ({
            id: `top-${i}`,
            position: 'top',
            offset: (i / 29) * 100,
            color: colors[i % colors.length],
            delay: i * 0.1,
        }));
        const bottomLights = Array.from({ length: 30 }, (_, i) => ({
            id: `bottom-${i}`,
            position: 'bottom',
            offset: (i / 29) * 100,
            color: colors[(i + 2) % colors.length],
            delay: i * 0.1,
        }));
        const leftLights = Array.from({ length: 15 }, (_, i) => ({
            id: `left-${i}`,
            position: 'left',
            offset: (i / 14) * 100,
            color: colors[(i + 1) % colors.length],
            delay: i * 0.15,
        }));
        const rightLights = Array.from({ length: 15 }, (_, i) => ({
            id: `right-${i}`,
            position: 'right',
            offset: (i / 14) * 100,
            color: colors[(i + 3) % colors.length],
            delay: i * 0.15,
        }));
        return [...topLights, ...bottomLights, ...leftLights, ...rightLights];
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            <style>{`
        @keyframes twinkle {
          0%, 100% { 
            opacity: 1; 
            filter: brightness(1.5) drop-shadow(0 0 8px var(--light-color));
          }
          50% { 
            opacity: 0.4; 
            filter: brightness(0.8) drop-shadow(0 0 2px var(--light-color));
          }
        }
        .christmas-light {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: twinkle 1.5s ease-in-out infinite;
          animation-delay: var(--delay);
        }
        .christmas-light::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #333;
          border-radius: 2px;
        }
      `}</style>

            {lights.map(light => {
                let style = {
                    '--light-color': light.color,
                    '--delay': `${light.delay}s`,
                    backgroundColor: light.color,
                };

                if (light.position === 'top') {
                    style.top = '8px';
                    style.left = `${light.offset}%`;
                    style.transform = 'translateX(-50%)';
                } else if (light.position === 'bottom') {
                    style.bottom = '8px';
                    style.left = `${light.offset}%`;
                    style.transform = 'translateX(-50%) rotate(180deg)';
                } else if (light.position === 'left') {
                    style.left = '8px';
                    style.top = `${light.offset}%`;
                    style.transform = 'translateY(-50%) rotate(-90deg)';
                } else if (light.position === 'right') {
                    style.right = '8px';
                    style.top = `${light.offset}%`;
                    style.transform = 'translateY(-50%) rotate(90deg)';
                }

                return (
                    <div
                        key={light.id}
                        className="christmas-light"
                        style={style}
                    />
                );
            })}
        </div>
    );
}

export default ChristmasLights;
