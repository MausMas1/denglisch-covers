import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Gift, SkipForward, SkipBack, AlertTriangle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';

function GameControls() {
    const { gameState, toggleLyrics, reveal, nextSong, prevSong, songs, currentSong } = useGame();
    const [pendingCount, setPendingCount] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);

    // Listen to answers for current song to count pending
    useEffect(() => {
        if (!currentSong?.id) return;

        const answersRef = ref(db, `answers/${currentSong.id}`);
        const unsubscribe = onValue(answersRef, (snapshot) => {
            const answers = snapshot.val() || {};
            const pending = Object.values(answers).filter(a =>
                a.titleCorrect === undefined || a.artistCorrect === undefined
            ).length;
            setPendingCount(pending);
        });

        return () => unsubscribe();
    }, [currentSong?.id]);

    // Calculate current position
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id) + 1;
    const totalSongs = songs.length;

    const handleRevealClick = () => {
        if (pendingCount > 0 && !gameState.isRevealed) {
            setShowConfirm(true);
        } else {
            reveal();
        }
    };

    const confirmReveal = () => {
        setShowConfirm(false);
        reveal();
    };

    return (
        <div className="space-y-3">
            {/* Pending answers warning confirmation */}
            {showConfirm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-900/50 border border-yellow-600 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 text-yellow-400 mb-3">
                        <AlertTriangle size={20} />
                        <span className="font-bold">Let op!</span>
                    </div>
                    <p className="text-white text-sm mb-4">
                        Er zijn nog <span className="font-bold text-yellow-400">{pendingCount}</span> ongecheckte antwoorden.
                        Wil je toch onthullen?
                    </p>
                    <div className="flex gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white text-sm"
                        >
                            Annuleer
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={confirmReveal}
                            className="flex-1 py-2 px-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white text-sm font-bold"
                        >
                            Toch Onthullen
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Song Navigation */}
            <div className="flex items-center gap-2">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={prevSong}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white"
                >
                    <SkipBack size={20} />
                    <span>Vorige</span>
                </motion.button>

                <div className="px-4 py-3 bg-gray-800 rounded-xl text-center min-w-[80px]">
                    <span className="text-christmas-gold font-bold">{currentIndex}</span>
                    <span className="text-gray-500"> / {totalSongs}</span>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={nextSong}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-christmas-green hover:bg-green-600 rounded-xl text-white font-bold"
                >
                    <span>Volgende</span>
                    <SkipForward size={20} />
                </motion.button>
            </div>

            {/* Toggle Lyrics */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleLyrics}
                disabled={gameState.isRevealed}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all ${gameState.showLyrics
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                    } ${gameState.isRevealed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <FileText size={24} />
                <span>📝 {gameState.showLyrics ? 'Verberg Lyrics' : 'Toon Lyrics'}</span>
            </motion.button>

            {/* Reveal Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRevealClick}
                disabled={gameState.isRevealed}
                className={`w-full flex items-center justify-center gap-3 px-6 py-6 rounded-xl font-bold text-xl transition-all relative ${gameState.isRevealed
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-christmas-gold to-yellow-500 hover:from-yellow-500 hover:to-christmas-gold text-christmas-red-dark animate-pulse-glow'
                    }`}
            >
                <Gift size={28} />
                <span>🎁 {gameState.isRevealed ? 'ONTHULD!' : 'ONTHUL!'}</span>
                {/* Pending badge */}
                {pendingCount > 0 && !gameState.isRevealed && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                        ?{pendingCount}
                    </span>
                )}
            </motion.button>
        </div>
    );
}

export default GameControls;

