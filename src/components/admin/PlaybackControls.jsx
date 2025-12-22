import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function PlaybackControls() {
    const { gameState, play, pause, restart } = useGame();

    const buttonClass = "flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-95";

    return (
        <div className="grid grid-cols-3 gap-3">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={restart}
                className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
            >
                <RotateCcw size={24} />
            </motion.button>

            {gameState.isPlaying ? (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={pause}
                    className={`${buttonClass} bg-christmas-red hover:bg-red-600 text-white col-span-2`}
                >
                    <Pause size={24} />
                    <span>Pauze</span>
                </motion.button>
            ) : (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={play}
                    className={`${buttonClass} bg-christmas-green hover:bg-green-600 text-white col-span-2`}
                >
                    <Play size={24} />
                    <span>Afspelen</span>
                </motion.button>
            )}
        </div>
    );
}

export default PlaybackControls;
