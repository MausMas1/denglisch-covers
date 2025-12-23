import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, User, ChevronDown, ChevronUp, Check, X, Music } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useGame } from '../../context/GameContext';

function AnswerHistory() {
    const { songs, gameState } = useGame();
    const [allAnswers, setAllAnswers] = useState({});
    const [expandedTeam, setExpandedTeam] = useState(null);
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

    const teams = gameState.teams || [];

    // Get all answers for a specific team
    const getTeamAnswers = (teamName) => {
        const teamAnswers = [];
        Object.entries(allAnswers).forEach(([songId, songAnswers]) => {
            if (songAnswers && songAnswers[teamName]) {
                const song = songs.find(s => s.id === parseInt(songId));
                teamAnswers.push({
                    songId: parseInt(songId),
                    songTitle: song?.titleOriginal || `Nummer ${songId}`,
                    ...songAnswers[teamName]
                });
            }
        });
        return teamAnswers.sort((a, b) => a.songId - b.songId);
    };

    // Calculate team stats
    const getTeamStats = (teamName) => {
        const answers = getTeamAnswers(teamName);
        const total = answers.length;
        const correct = answers.filter(a => a.titleCorrect && a.artistCorrect).length;
        const partial = answers.filter(a =>
            (a.titleCorrect || a.artistCorrect) && !(a.titleCorrect && a.artistCorrect)
        ).length;
        return { total, correct, partial };
    };

    if (teams.length === 0) return null;

    return (
        <div className="bg-gray-800/50 rounded-xl p-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-2">
                    <History className="text-purple-400" size={18} />
                    <span className="text-white font-medium">Antwoord Geschiedenis</span>
                    <span className="text-gray-500 text-sm">({teams.length} teams)</span>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                            {teams.map((team) => {
                                const stats = getTeamStats(team.name);
                                const isTeamExpanded = expandedTeam === team.name;
                                const teamAnswers = getTeamAnswers(team.name);

                                return (
                                    <div key={team.name} className="bg-gray-700/50 rounded-lg overflow-hidden">
                                        {/* Team header */}
                                        <button
                                            onClick={() => setExpandedTeam(isTeamExpanded ? null : team.name)}
                                            className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-700/80"
                                        >
                                            <div className="flex items-center gap-3">
                                                <User size={16} className="text-gray-400" />
                                                <span className="text-white font-medium">{team.name}</span>
                                                <span className="text-christmas-gold font-bold">{team.score || 0} pts</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Stats badges */}
                                                <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                                                    {stats.total} antw
                                                </span>
                                                {stats.correct > 0 && (
                                                    <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded">
                                                        ✓{stats.correct}
                                                    </span>
                                                )}
                                                {stats.partial > 0 && (
                                                    <span className="text-xs bg-yellow-700 text-white px-2 py-0.5 rounded">
                                                        ½{stats.partial}
                                                    </span>
                                                )}
                                                {isTeamExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                                            </div>
                                        </button>

                                        {/* Team answers */}
                                        <AnimatePresence>
                                            {isTeamExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-3 pb-3 space-y-2">
                                                        {teamAnswers.length === 0 ? (
                                                            <p className="text-gray-500 text-sm">Nog geen antwoorden</p>
                                                        ) : (
                                                            teamAnswers.map((answer) => (
                                                                <div key={answer.songId} className="bg-gray-800/50 rounded-lg p-2 text-sm">
                                                                    <div className="flex items-center gap-2 mb-1 text-gray-400">
                                                                        <Music size={12} />
                                                                        <span className="text-xs">{answer.songTitle}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div>
                                                                            <span className="text-gray-500 text-xs">Titel</span>
                                                                            <div className="flex items-center gap-1">
                                                                                {answer.titleCorrect === true && <Check size={12} className="text-green-400" />}
                                                                                {answer.titleCorrect === false && <X size={12} className="text-red-400" />}
                                                                                <span className={`truncate ${answer.titleCorrect === true ? 'text-green-400' :
                                                                                    answer.titleCorrect === false ? 'text-red-400' : 'text-gray-300'
                                                                                    }`}>
                                                                                    {answer.title}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500 text-xs">Artiest</span>
                                                                            <div className="flex items-center gap-1">
                                                                                {answer.artistCorrect === true && <Check size={12} className="text-green-400" />}
                                                                                {answer.artistCorrect === false && <X size={12} className="text-red-400" />}
                                                                                <span className={`truncate ${answer.artistCorrect === true ? 'text-green-400' :
                                                                                    answer.artistCorrect === false ? 'text-red-400' : 'text-gray-300'
                                                                                    }`}>
                                                                                    {answer.artist}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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

export default AnswerHistory;
