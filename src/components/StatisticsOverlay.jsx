import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Zap, Target, X, TrendingUp } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useGame } from '../context/GameContext';

function StatisticsOverlay() {
    const { gameState, songs } = useGame();
    const teams = gameState.teams || [];
    const [allAnswers, setAllAnswers] = useState({});
    const [isExpanded, setIsExpanded] = useState(false);

    // Listen to all answers
    useEffect(() => {
        const answersRef = ref(db, 'answers');
        const unsubscribe = onValue(answersRef, (snapshot) => {
            const data = snapshot.val();
            setAllAnswers(data || {});
        });
        return () => unsubscribe();
    }, []);

    // Calculate statistics
    const calculateStats = () => {
        const stats = {
            teamStats: {},
            fastestTeam: null,
            fastestTime: Infinity,
            mostAccurate: null,
            highestAccuracy: 0,
            totalAnswers: 0,
            totalCorrect: 0,
            hotStreak: null,
            hotStreakCount: 0
        };

        // Initialize team stats
        teams.forEach(team => {
            stats.teamStats[team.name] = {
                answers: 0,
                correct: 0,
                averageTime: 0,
                totalTime: 0,
                streak: 0,
                currentStreak: 0
            };
        });

        // Process answers for each song
        Object.entries(allAnswers).forEach(([songId, songAnswers]) => {
            if (!songAnswers) return;

            Object.entries(songAnswers).forEach(([teamName, answer]) => {
                if (!stats.teamStats[teamName]) return;

                const teamStat = stats.teamStats[teamName];
                teamStat.answers++;
                stats.totalAnswers++;

                // Check correctness
                const titleCorrect = answer.titleCorrect === true;
                const artistCorrect = answer.artistCorrect === true;
                const bothCorrect = titleCorrect && artistCorrect;

                if (titleCorrect) {
                    teamStat.correct++;
                    stats.totalCorrect++;
                    teamStat.currentStreak++;
                } else {
                    teamStat.currentStreak = 0;
                }

                if (artistCorrect) {
                    teamStat.correct++;
                    stats.totalCorrect++;
                }

                // Track streaks
                if (teamStat.currentStreak > teamStat.streak) {
                    teamStat.streak = teamStat.currentStreak;
                }

                // Calculate response time if available
                if (answer.submittedAt) {
                    const responseTime = answer.submittedAt;
                    teamStat.totalTime += responseTime;
                }
            });
        });

        // Calculate derived statistics
        let bestAccuracy = 0;
        let bestAccuracyTeam = null;

        Object.entries(stats.teamStats).forEach(([teamName, stat]) => {
            if (stat.answers > 0) {
                stat.averageTime = stat.totalTime / stat.answers;
                const accuracy = (stat.correct / (stat.answers * 2)) * 100; // *2 because title+artist

                if (accuracy > bestAccuracy) {
                    bestAccuracy = accuracy;
                    bestAccuracyTeam = teamName;
                }

                if (stat.streak > stats.hotStreakCount) {
                    stats.hotStreakCount = stat.streak;
                    stats.hotStreak = teamName;
                }
            }
        });

        stats.mostAccurate = bestAccuracyTeam;
        stats.highestAccuracy = bestAccuracy;

        return stats;
    };

    const stats = calculateStats();
    const completedSongs = Object.keys(allAnswers).length;
    const totalSongsCount = songs.length;

    if (teams.length === 0) return null;

    return (
        <div className="fixed top-6 left-6 z-40">
            {/* Toggle Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`glass rounded-xl p-3 border transition-all ${isExpanded ? 'border-christmas-gold' : 'border-white/20'
                    }`}
            >
                <BarChart2
                    size={20}
                    className={isExpanded ? 'text-christmas-gold' : 'text-white'}
                />
            </motion.button>

            {/* Expanded Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className="absolute top-0 left-14 glass rounded-xl p-4 min-w-[280px] border border-christmas-gold/30"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <BarChart2 size={16} className="text-christmas-gold" />
                                Live Statistieken
                            </h3>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="mb-4 bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Voortgang</span>
                                <span className="text-white">{completedSongs}/{totalSongsCount}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-christmas-red to-christmas-green rounded-full"
                                    initial={false}
                                    animate={{ width: `${(completedSongs / totalSongsCount) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {stats.mostAccurate && (
                                <div className="bg-green-500/10 rounded-lg p-2">
                                    <div className="flex items-center gap-1 text-green-400 text-xs mb-1">
                                        <Target size={12} />
                                        <span>Meest Accuraat</span>
                                    </div>
                                    <div className="text-white text-sm font-medium truncate">
                                        {stats.mostAccurate}
                                    </div>
                                    <div className="text-green-400 text-xs">
                                        {Math.round(stats.highestAccuracy)}%
                                    </div>
                                </div>
                            )}

                            {stats.hotStreak && stats.hotStreakCount > 1 && (
                                <div className="bg-orange-500/10 rounded-lg p-2">
                                    <div className="flex items-center gap-1 text-orange-400 text-xs mb-1">
                                        <Zap size={12} />
                                        <span>Hot Streak</span>
                                    </div>
                                    <div className="text-white text-sm font-medium truncate">
                                        {stats.hotStreak}
                                    </div>
                                    <div className="text-orange-400 text-xs">
                                        🔥 {stats.hotStreakCount}x correct
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Team Accuracy Bars */}
                        <div className="space-y-2">
                            <div className="text-gray-400 text-xs uppercase tracking-wider">
                                Team Accuraatheid
                            </div>
                            {teams.slice(0, 5).map(team => {
                                const teamStat = stats.teamStats[team.name];
                                const accuracy = teamStat && teamStat.answers > 0
                                    ? (teamStat.correct / (teamStat.answers * 2)) * 100
                                    : 0;

                                return (
                                    <div key={team.id} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-snow/80 truncate">{team.name}</span>
                                            <span className="text-christmas-gold">{Math.round(accuracy)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-christmas-gold rounded-full"
                                                initial={false}
                                                animate={{ width: `${accuracy}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StatisticsOverlay;
