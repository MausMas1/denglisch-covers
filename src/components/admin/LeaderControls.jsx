import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, StopCircle, Loader } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useFirebaseStorageFiles } from '../../hooks/useFirebaseStorageFiles';

function LeaderControls() {
    const { gameState, updateGameState } = useGame();
    const { files: leaderFiles, loading } = useFirebaseStorageFiles('leader');

    const isLeaderPlaying = gameState.leaderPlaying || false;
    const selectedLeader = gameState.leaderUrl || '';

    const handleSelectLeader = (url) => {
        updateGameState({ leaderUrl: url });
    };

    const handlePlayLeader = () => {
        if (!selectedLeader) return;
        updateGameState({ leaderPlaying: true });
    };

    const handleStopLeader = () => {
        updateGameState({ leaderPlaying: false });
    };

    return (
        <div className="glass rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
                <Music className="text-purple-400" size={20} />
                <span className="text-white font-medium">🎉 Opening Nummer</span>
            </div>

            <div className="space-y-3">
                {/* Leader file selector */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Selecteer opening nummer</label>
                    <select
                        value={selectedLeader}
                        onChange={(e) => handleSelectLeader(e.target.value)}
                        disabled={isLeaderPlaying}
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
                    onClick={isLeaderPlaying ? handleStopLeader : handlePlayLeader}
                    disabled={!selectedLeader && !isLeaderPlaying}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isLeaderPlaying
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50'
                        }`}
                >
                    {isLeaderPlaying ? (
                        <>
                            <StopCircle size={20} />
                            <span>Stop Opening</span>
                        </>
                    ) : loading ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            <span>Laden...</span>
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            <span>🎉 Start Opening</span>
                        </>
                    )}
                </motion.button>

                {isLeaderPlaying && (
                    <p className="text-purple-300 text-xs text-center animate-pulse">
                        ✨ Opening speelt af op het TV-scherm...
                    </p>
                )}
            </div>
        </div>
    );
}

export default LeaderControls;
