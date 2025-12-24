import { motion } from 'framer-motion';
import { Trophy, Play, StopCircle, Loader, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useFirebaseStorageFiles } from '../../hooks/useFirebaseStorageFiles';

function FinalControls() {
    const { gameState, updateGameState } = useGame();
    const { files: leaderFiles, loading } = useFirebaseStorageFiles('leader');

    const isFinalPlaying = gameState.finalPlaying || false;
    const isNamesRevealed = gameState.finalNamesRevealed || false;
    const selectedFinal = gameState.finalUrl || '';

    const handleSelectFinal = (url) => {
        updateGameState({ finalUrl: url });
    };

    // Stage 1: Start podium (music + blurred names)
    const handleStartPodium = () => {
        if (!selectedFinal) return;
        updateGameState({
            finalPlaying: true,
            finalNamesRevealed: false
        });
    };

    // Stage 2: Reveal names
    const handleRevealNames = () => {
        updateGameState({ finalNamesRevealed: true });
    };

    // Stop everything
    const handleStopFinal = () => {
        updateGameState({
            finalPlaying: false,
            finalNamesRevealed: false
        });
    };

    return (
        <div className="glass rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-yellow-400" size={20} />
                <span className="text-white font-medium">🏆 Eindstand Reveal</span>
            </div>

            <div className="space-y-3">
                {/* Final music selector */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Selecteer eindstand muziek</label>
                    <select
                        value={selectedFinal}
                        onChange={(e) => handleSelectFinal(e.target.value)}
                        disabled={isFinalPlaying}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                    >
                        <option value="">Selecteer...</option>
                        {loading ? (
                            <option disabled>Laden...</option>
                        ) : (
                            leaderFiles.map((file) => (
                                <option key={file.url} value={file.url}>
                                    {file.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Stage 1: Start Podium button */}
                {!isFinalPlaying && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartPodium}
                        disabled={!selectedFinal}
                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-yellow-500 to-amber-600 text-black disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                <span>Laden...</span>
                            </>
                        ) : (
                            <>
                                <Play size={20} />
                                <span>🎬 Start Podium</span>
                            </>
                        )}
                    </motion.button>
                )}

                {/* Stage 2: Reveal Names button (only when podium is active but names hidden) */}
                {isFinalPlaying && !isNamesRevealed && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRevealNames}
                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse"
                    >
                        <Sparkles size={20} />
                        <span>✨ Onthul Winnaars!</span>
                    </motion.button>
                )}

                {/* Stop button (when podium is active) */}
                {isFinalPlaying && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStopFinal}
                        className="w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-600 to-red-700 text-white"
                    >
                        <StopCircle size={18} />
                        <span>Stop Eindstand</span>
                    </motion.button>
                )}

                {/* Status indicators */}
                {isFinalPlaying && !isNamesRevealed && (
                    <p className="text-yellow-300 text-xs text-center animate-pulse">
                        🎬 Podium actief - wacht op reveal...
                    </p>
                )}
                {isFinalPlaying && isNamesRevealed && (
                    <p className="text-green-300 text-xs text-center">
                        ✨ Winnaars onthuld!
                    </p>
                )}
            </div>
        </div>
    );
}

export default FinalControls;

