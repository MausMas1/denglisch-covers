import { motion } from 'framer-motion';
import { Coins, Plus, Minus } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function PointsSettings() {
    const { gameState, setPointsPerAnswer } = useGame();
    const points = gameState.pointsPerAnswer || 1;

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                <Coins size={16} className="text-christmas-gold" />
                Punten per Goed Antwoord
            </h3>

            <div className="flex items-center justify-center gap-4">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPointsPerAnswer(points - 1)}
                    disabled={points <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50"
                >
                    <Minus size={20} />
                </motion.button>

                <div className="text-center">
                    <span className="text-4xl font-bold text-christmas-gold">{points}</span>
                    <p className="text-gray-500 text-xs">punt{points !== 1 ? 'en' : ''}</p>
                </div>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPointsPerAnswer(points + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                    <Plus size={20} />
                </motion.button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
                Titel goed = {points} pt • Artiest goed = {points} pt • Max = {points * 2} pt
            </p>
        </div>
    );
}

export default PointsSettings;
