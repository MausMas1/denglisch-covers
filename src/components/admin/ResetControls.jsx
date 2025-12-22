import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, AlertTriangle, Users } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function ResetControls() {
    const { resetGame, resetScores, clearAllTeams } = useGame();
    const [showConfirm, setShowConfirm] = useState(null); // 'game', 'scores', or 'teams'

    const handleResetGame = async () => {
        await resetGame();
        setShowConfirm(null);
    };

    const handleResetScores = async () => {
        await resetScores();
        setShowConfirm(null);
    };

    const handleClearTeams = async () => {
        await clearAllTeams();
        setShowConfirm(null);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                <RotateCcw size={16} className="text-red-400" />
                Reset Opties
            </h3>

            <div className="space-y-2">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirm('scores')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
                >
                    <RotateCcw size={16} />
                    <span>Reset Scores</span>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirm('teams')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-900/50 hover:bg-orange-800/50 border border-orange-500/30 rounded-lg text-orange-300 text-sm"
                >
                    <Users size={16} />
                    <span>Verwijder Alle Teams</span>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirm('game')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-500/30 rounded-lg text-red-300 text-sm"
                >
                    <AlertTriangle size={16} />
                    <span>Reset Heel Spel</span>
                </motion.button>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <AlertTriangle size={48} className={`mx-auto mb-3 ${showConfirm === 'teams' ? 'text-orange-400' : 'text-red-400'}`} />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {showConfirm === 'game' ? 'Reset Heel Spel?' :
                                        showConfirm === 'teams' ? 'Alle Teams Verwijderen?' :
                                            'Reset Scores?'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {showConfirm === 'game'
                                        ? 'Dit verwijdert alle antwoorden, zet scores op 0, en gaat terug naar nummer 1.'
                                        : showConfirm === 'teams'
                                            ? 'Dit verwijdert alle teams permanent. Deelnemers kunnen zich opnieuw registreren.'
                                            : 'Dit zet alle team scores op 0.'
                                    }
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowConfirm(null)}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white"
                                >
                                    Annuleren
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={showConfirm === 'game' ? handleResetGame : showConfirm === 'teams' ? handleClearTeams : handleResetScores}
                                    className={`flex-1 px-4 py-3 rounded-xl text-white font-bold ${showConfirm === 'teams' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-red-600 hover:bg-red-500'}`}
                                >
                                    {showConfirm === 'teams' ? 'Verwijderen' : 'Reset'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ResetControls;
