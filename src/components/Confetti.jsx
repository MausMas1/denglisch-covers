import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Confetti({ isActive }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (isActive) {
            const colors = ['#f59e0b', '#b91c1c', '#166534', '#fbbf24', '#dc2626', '#22c55e', '#ffffff'];
            const newParticles = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 12 + 6,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 0.5,
                rotation: Math.random() * 360,
                shape: Math.random() > 0.5 ? 'circle' : 'square',
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [isActive]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{
                            y: -50,
                            x: `${particle.x}vw`,
                            rotate: 0,
                            opacity: 1
                        }}
                        animate={{
                            y: '110vh',
                            rotate: particle.rotation + 720,
                            x: `${particle.x + (Math.random() - 0.5) * 20}vw`,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: particle.duration,
                            delay: particle.delay,
                            ease: 'easeIn',
                        }}
                        style={{
                            position: 'absolute',
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            borderRadius: particle.shape === 'circle' ? '50%' : '2px',
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

export default Confetti;
