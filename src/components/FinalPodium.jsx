import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';

// Animated confetti emojis
const CONFETTI = ['🎉', '🏆', '⭐', '🥇', '🎊', '✨', '👏'];

function FinalPodium() {
    const { gameState } = useGame();

    // Get sorted teams by score
    const sortedTeams = useMemo(() => {
        const teams = gameState.teams || [];
        return [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));
    }, [gameState.teams]);

    const top3 = sortedTeams.slice(0, 3);
    const rest = sortedTeams.slice(3);

    // Confetti particles
    const particles = useMemo(() =>
        [...Array(25)].map((_, i) => ({
            id: i,
            emoji: CONFETTI[i % CONFETTI.length],
            left: `${(i * 4) % 100}%`,
            startY: 100 + (i * 12) % 50,
            delay: (i * 0.3) % 6,
            duration: 8 + (i % 5) * 2,
        })), []
    );

    // Podium order: 2nd, 1st, 3rd (for visual display)
    const podiumOrder = [
        { place: 2, team: top3[1], height: 'h-32', color: 'from-gray-400 to-gray-500', medal: '🥈', delay: 0.3 },
        { place: 1, team: top3[0], height: 'h-44', color: 'from-yellow-400 to-yellow-600', medal: '🥇', delay: 0 },
        { place: 3, team: top3[2], height: 'h-24', color: 'from-amber-600 to-amber-700', medal: '🥉', delay: 0.5 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-[#1a1a2e] to-blue-900 flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute text-4xl"
                        style={{ left: particle.left }}
                        initial={{ y: `${particle.startY}%`, opacity: 0.7 }}
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

            {/* Title */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8 z-10"
            >
                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text mb-2">
                    🏆 EINDSTAND 🏆
                </h1>
                <p className="text-2xl text-purple-300">Denglisch Covers Quiz</p>
            </motion.div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-4 md:gap-8 mb-8 z-10">
                {podiumOrder.map((item, index) => (
                    item.team && (
                        <motion.div
                            key={item.place}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + item.delay, type: 'spring', bounce: 0.4 }}
                            className="flex flex-col items-center"
                        >
                            {/* Medal and team info */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: item.delay }}
                                className="text-center mb-2"
                            >
                                <span className="text-5xl md:text-6xl">{item.medal}</span>
                                <p className="text-white font-bold text-lg md:text-xl mt-2 max-w-[120px] truncate">
                                    {item.team.name}
                                </p>
                                <p className="text-yellow-400 font-bold text-2xl md:text-3xl">
                                    {item.team.score || 0}
                                </p>
                            </motion.div>

                            {/* Podium block */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                transition={{ delay: 0.8 + item.delay, duration: 0.5 }}
                                className={`${item.height} w-24 md:w-32 bg-gradient-to-b ${item.color} rounded-t-lg flex items-end justify-center pb-2`}
                            >
                                <span className="text-white font-bold text-3xl">{item.place}</span>
                            </motion.div>
                        </motion.div>
                    )
                ))}
            </div>

            {/* Honorable mentions */}
            {rest.length > 0 && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="z-10 max-w-2xl w-full px-4"
                >
                    <div className="text-center mb-4">
                        <h2 className="text-xl text-purple-300 flex items-center justify-center gap-2">
                            <Award size={20} />
                            Eervolle Vermeldingen
                            <Award size={20} />
                        </h2>
                    </div>
                    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {rest.map((team, index) => (
                                <motion.div
                                    key={team.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.8 + index * 0.1 }}
                                    className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-sm">#{index + 4}</span>
                                        <span className="text-white text-sm truncate max-w-[80px]">{team.name}</span>
                                    </div>
                                    <span className="text-christmas-gold font-bold">{team.score || 0}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Pulsing border */}
            <motion.div
                className="absolute inset-4 border-4 border-yellow-500/20 rounded-3xl pointer-events-none"
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.005, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />
        </motion.div>
    );
}

export default FinalPodium;
