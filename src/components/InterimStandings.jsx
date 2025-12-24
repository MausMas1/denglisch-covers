import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useEffect, useRef } from 'react';

function InterimStandings() {
    const { gameState } = useGame();
    const audioRef = useRef(null);

    // Get sorted teams
    const sortedTeams = [...(gameState.teams || [])]
        .sort((a, b) => (b.score || 0) - (a.score || 0));

    // Handle interim music playback
    useEffect(() => {
        if (gameState.interimPlaying && gameState.interimMusicUrl) {
            audioRef.current = new Audio(gameState.interimMusicUrl);
            audioRef.current.volume = 0.7;
            audioRef.current.play().catch(console.error);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [gameState.interimPlaying, gameState.interimMusicUrl]);

    const getMedal = (position) => {
        if (position === 0) return '🥇';
        if (position === 1) return '🥈';
        if (position === 2) return '🥉';
        return `${position + 1}.`;
    };

    const getRowStyle = (position) => {
        if (position === 0) return 'bg-yellow-500/20 border-yellow-500/50';
        if (position === 1) return 'bg-gray-400/20 border-gray-400/50';
        if (position === 2) return 'bg-amber-600/20 border-amber-600/50';
        return 'bg-white/5 border-white/20';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="glass rounded-3xl p-8 max-w-2xl w-full mx-4 border border-blue-500/30"
            >
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                >
                    <div className="text-5xl mb-2">📊</div>
                    <h1 className="text-3xl font-bold text-white">Tussenstand</h1>
                </motion.div>

                {/* Scoreboard */}
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {sortedTeams.map((team, index) => (
                        <motion.div
                            key={team.name}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`flex items-center justify-between p-4 rounded-xl border ${getRowStyle(index)}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl w-10 text-center">
                                    {getMedal(index)}
                                </span>
                                <span className={`text-xl font-medium ${index < 3 ? 'text-white' : 'text-gray-300'
                                    }`}>
                                    {team.name}
                                </span>
                            </div>
                            <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' :
                                    index === 1 ? 'text-gray-300' :
                                        index === 2 ? 'text-amber-500' :
                                            'text-white'
                                }`}>
                                {team.score || 0}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {sortedTeams.length === 0 && (
                    <p className="text-gray-400 text-center py-8">Nog geen teams</p>
                )}
            </motion.div>
        </motion.div>
    );
}

export default InterimStandings;
