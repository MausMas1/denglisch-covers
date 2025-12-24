import { motion } from 'framer-motion';
import { useMemo } from 'react';
import QRCode from './QRCode';

// Emoji particles data - generated once
const EMOJIS = ['🎄', '🎁', '⭐', '🎵', '🎉', '❄️', '🔔'];

/**
 * Opening animation shown on Display when leader song is playing
 * Shows QR code prominently with festive animation
 */
function LeaderOpening() {
    // Generate stable random positions for particles
    const particles = useMemo(() =>
        [...Array(20)].map((_, i) => ({
            id: i,
            emoji: EMOJIS[i % EMOJIS.length],
            left: `${(i * 5) % 100}%`, // Spread evenly across width
            startY: 100 + (i * 15) % 60, // Stagger start: 100% to 160% (below screen)
            delay: (i * 0.4) % 8, // Stagger delays more
            duration: 10 + (i % 6) * 2, // Vary durations: 10-20s
        })), []
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-[#1a1a2e] to-christmas-green-dark flex flex-col items-center justify-center"
        >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute text-4xl"
                        style={{ left: particle.left }}
                        initial={{ y: `${particle.startY}%`, opacity: 0.6 }}
                        animate={{ y: '-10%', rotate: 360 }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: 'linear'
                        }}
                    >
                        {particle.emoji}
                    </motion.div>
                ))}
            </div>

            {/* Main content */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-center z-10"
            >
                {/* Logo */}
                <motion.img
                    src="/denglisch-covers/logo.jpg"
                    alt="Denglisch Covers"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-[500px] md:w-[650px] max-w-[90vw] mb-4 rounded-2xl shadow-2xl"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl md:text-3xl text-purple-300 mb-12"
                >
                    Scan de QR code om mee te doen!
                </motion.p>

                {/* QR Code */}
                <motion.div
                    animate={{
                        boxShadow: [
                            '0 0 20px rgba(168, 85, 247, 0.4)',
                            '0 0 40px rgba(168, 85, 247, 0.6)',
                            '0 0 20px rgba(168, 85, 247, 0.4)'
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block p-6 bg-white rounded-3xl"
                >
                    <QRCode size={280} showLabel={false} />
                </motion.div>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-12 space-y-2"
                >
                    <p className="text-xl text-white/80">
                        📱 Pak je telefoon
                    </p>
                    <p className="text-xl text-white/80">
                        📷 Scan de QR code
                    </p>
                    <p className="text-xl text-white/80">
                        🎮 Registreer je team
                    </p>
                </motion.div>
            </motion.div>

            {/* Pulsing border animation */}
            <motion.div
                className="absolute inset-4 border-4 border-purple-500/30 rounded-3xl pointer-events-none"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.01, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />
        </motion.div>
    );
}

export default LeaderOpening;
