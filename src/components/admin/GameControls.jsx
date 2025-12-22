import { motion } from 'framer-motion';
import { FileText, Gift, SkipForward, SkipBack } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function GameControls() {
    const { gameState, toggleLyrics, reveal, nextSong, prevSong, songs, currentSong } = useGame();

    // Calculate current position
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id) + 1;
    const totalSongs = songs.length;

    return (
        <div className="space-y-3">
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
                onClick={reveal}
                disabled={gameState.isRevealed}
                className={`w-full flex items-center justify-center gap-3 px-6 py-6 rounded-xl font-bold text-xl transition-all ${gameState.isRevealed
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-christmas-gold to-yellow-500 hover:from-yellow-500 hover:to-christmas-gold text-christmas-red-dark animate-pulse-glow'
                    }`}
            >
                <Gift size={28} />
                <span>🎁 {gameState.isRevealed ? 'ONTHULD!' : 'ONTHUL!'}</span>
            </motion.button>
        </div>
    );
}

export default GameControls;
