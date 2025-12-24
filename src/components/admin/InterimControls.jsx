import { motion } from 'framer-motion';
import { BarChart3, Play, StopCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useFirebaseStorageFiles } from '../../hooks/useFirebaseStorageFiles';

function InterimControls() {
    const { gameState, updateGameState } = useGame();
    const { files: leaderFiles, loading } = useFirebaseStorageFiles('leader');

    const isInterimPlaying = gameState.interimPlaying || false;
    const selectedInterim = gameState.interimMusicUrl || '';
    const showScores = gameState.showScoresOnDisplay !== false;

    const handleSelectInterim = (url) => {
        updateGameState({ interimMusicUrl: url });
    };

    const handlePlayInterim = () => {
        updateGameState({ interimPlaying: true });
    };

    const handleStopInterim = () => {
        updateGameState({ interimPlaying: false });
    };

    const toggleScoreVisibility = () => {
        updateGameState({ showScoresOnDisplay: !showScores });
    };

    return (
        <div className="glass rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-blue-400" size={20} />
                <span className="text-white font-medium">📊 Tussenstand & Scores</span>
            </div>

            <div className="space-y-3">
                {/* Score visibility toggle */}
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                    <span className="text-sm text-gray-300">Punten tonen op Display</span>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleScoreVisibility}
                        className={`p-2 rounded-lg transition-colors ${showScores
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                    >
                        {showScores ? <Eye size={18} /> : <EyeOff size={18} />}
                    </motion.button>
                </div>

                {/* Interim music selector */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Selecteer tussenstand muziek (optioneel)</label>
                    <select
                        value={selectedInterim}
                        onChange={(e) => handleSelectInterim(e.target.value)}
                        disabled={isInterimPlaying}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                    >
                        <option value="">Geen muziek</option>
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
                    onClick={isInterimPlaying ? handleStopInterim : handlePlayInterim}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isInterimPlaying
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        }`}
                >
                    {isInterimPlaying ? (
                        <>
                            <StopCircle size={20} />
                            <span>Sluit Tussenstand</span>
                        </>
                    ) : loading ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            <span>Laden...</span>
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            <span>📊 Toon Tussenstand</span>
                        </>
                    )}
                </motion.button>

                {isInterimPlaying && (
                    <p className="text-blue-300 text-xs text-center animate-pulse">
                        📊 Tussenstand wordt getoond op het TV-scherm...
                    </p>
                )}
            </div>
        </div>
    );
}

export default InterimControls;
