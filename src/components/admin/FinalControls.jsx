import { motion } from 'framer-motion';
import { Trophy, Play, StopCircle, Loader } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useFirebaseStorageFiles } from '../../hooks/useFirebaseStorageFiles';

function FinalControls() {
    const { gameState, updateGameState } = useGame();
    const { files: leaderFiles, loading } = useFirebaseStorageFiles('leader');

    const isFinalPlaying = gameState.finalPlaying || false;
    const selectedFinal = gameState.finalUrl || '';

    const handleSelectFinal = (url) => {
        updateGameState({ finalUrl: url });
    };

    const handlePlayFinal = () => {
        if (!selectedFinal) return;
        updateGameState({ finalPlaying: true });
    };

    const handleStopFinal = () => {
        updateGameState({ finalPlaying: false });
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

                {/* Play/Stop button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={isFinalPlaying ? handleStopFinal : handlePlayFinal}
                    disabled={!selectedFinal && !isFinalPlaying}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isFinalPlaying
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black disabled:opacity-50'
                        }`}
                >
                    {isFinalPlaying ? (
                        <>
                            <StopCircle size={20} />
                            <span>Stop Eindstand</span>
                        </>
                    ) : loading ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            <span>Laden...</span>
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            <span>🏆 Toon Eindstand</span>
                        </>
                    )}
                </motion.button>

                {isFinalPlaying && (
                    <p className="text-yellow-300 text-xs text-center animate-pulse">
                        🏆 Podium wordt getoond op het TV-scherm...
                    </p>
                )}
            </div>
        </div>
    );
}

export default FinalControls;
