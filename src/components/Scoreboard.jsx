import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

function Scoreboard({ currentSongId }) {
    const { gameState } = useGame();
    const teams = gameState.teams || [];
    const [positionChanges, setPositionChanges] = useState({});
    const [submittedTeams, setSubmittedTeams] = useState({});
    const prevPositionsRef = useRef({});
    const prevScoresRef = useRef({});

    // Sort teams by score
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    // Get current positions map
    const getCurrentPositions = () => {
        const positions = {};
        sortedTeams.forEach((team, index) => {
            positions[team.id] = index;
        });
        return positions;
    };

    // Listen to answers for current song
    useEffect(() => {
        if (!currentSongId) {
            setSubmittedTeams({});
            return;
        }

        const answersRef = ref(db, `answers/${currentSongId}`);
        const unsubscribe = onValue(answersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // data is { teamName: { artist, title, ... }, ... }
                const submitted = {};
                Object.keys(data).forEach(teamName => {
                    submitted[teamName] = true;
                });
                setSubmittedTeams(submitted);
            } else {
                setSubmittedTeams({});
            }
        });

        return () => unsubscribe();
    }, [currentSongId]);

    // Detect position and score changes
    useEffect(() => {
        const currentPositions = getCurrentPositions();
        const newChanges = {};

        teams.forEach(team => {
            const prevPos = prevPositionsRef.current[team.id];
            const currentPos = currentPositions[team.id];
            const prevScore = prevScoresRef.current[team.id];

            // Only show position change if score actually changed (not just init)
            if (prevPos !== undefined && prevScore !== undefined && prevScore !== team.score) {
                if (currentPos < prevPos) {
                    newChanges[team.id] = 'up';
                } else if (currentPos > prevPos) {
                    newChanges[team.id] = 'down';
                }
            }

            prevScoresRef.current[team.id] = team.score;
        });

        if (Object.keys(newChanges).length > 0) {
            setPositionChanges(newChanges);
            // Clear position changes after 3 seconds
            setTimeout(() => setPositionChanges({}), 3000);
        }

        prevPositionsRef.current = currentPositions;
    }, [teams, JSON.stringify(sortedTeams.map(t => t.id))]);

    if (sortedTeams.length === 0) return null;

    const getPositionIcon = (teamId) => {
        const change = positionChanges[teamId];
        if (change === 'up') {
            return (
                <motion.div
                    initial={{ scale: 0, y: 5 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-green-400"
                >
                    <ArrowUp size={14} />
                </motion.div>
            );
        }
        if (change === 'down') {
            return (
                <motion.div
                    initial={{ scale: 0, y: -5 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-red-400"
                >
                    <ArrowDown size={14} />
                </motion.div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-6 right-6 z-40"
        >
            <div className="glass rounded-2xl p-4 min-w-[220px] border border-christmas-gold/30">
                <div className="flex items-center gap-2 mb-3 border-b border-white/20 pb-2">
                    <Trophy className="text-christmas-gold neon-glow-gold" size={20} />
                    <span className="text-white font-bold">Scorebord</span>
                </div>

                <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                        {sortedTeams.map((team, index) => (
                            <motion.div
                                key={team.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    backgroundColor: positionChanges[team.id] === 'up'
                                        ? 'rgba(34, 197, 94, 0.2)'
                                        : positionChanges[team.id] === 'down'
                                            ? 'rgba(239, 68, 68, 0.2)'
                                            : 'transparent'
                                }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{
                                    layout: { type: 'spring', stiffness: 350, damping: 25 }
                                }}
                                className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    {/* Position number */}
                                    <span className="text-christmas-gold font-bold text-xs w-4">
                                        {index + 1}.
                                    </span>
                                    {/* Crown for leader */}
                                    {index === 0 && sortedTeams.length > 1 && team.score > 0 && (
                                        <span className="text-christmas-gold">👑</span>
                                    )}
                                    <span className="text-snow/90 text-sm">{team.name}</span>
                                    {/* Position change indicator */}
                                    {getPositionIcon(team.id)}
                                    {/* Answer submitted indicator */}
                                    {submittedTeams[team.name] && !gameState.isRevealed && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-green-400"
                                        >
                                            <Check size={14} />
                                        </motion.div>
                                    )}
                                </div>
                                <motion.span
                                    key={`${team.id}-${team.score}`}
                                    initial={{ scale: 1.5, color: '#f59e0b' }}
                                    animate={{ scale: 1, color: '#ffffff' }}
                                    className="text-white font-bold text-lg tabular-nums"
                                >
                                    {team.score}
                                </motion.span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

export default Scoreboard;
