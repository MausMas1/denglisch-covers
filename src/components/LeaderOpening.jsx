import { motion } from 'framer-motion';
import QRCode from './QRCode';

/**
 * Opening animation shown on Display when leader song is playing
 * Shows QR code prominently with festive animation
 */
function LeaderOpening() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-[#1a1a2e] to-christmas-green-dark flex flex-col items-center justify-center"
        >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-4xl"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: '110%',
                            opacity: 0.6
                        }}
                        animate={{
                            y: '-10%',
                            rotate: 360
                        }}
                        transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: 'linear'
                        }}
                    >
                        {['🎄', '🎁', '⭐', '🎵', '🎉', '❄️', '🔔'][i % 7]}
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
                {/* Title */}
                <motion.h1
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl md:text-7xl font-bold text-white mb-4"
                >
                    🎄 Denglisch Covers 🎄
                </motion.h1>

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
