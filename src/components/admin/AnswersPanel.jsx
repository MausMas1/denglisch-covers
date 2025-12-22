import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, Check, X, ChevronDown, ChevronUp, Music } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useGame } from '../../context/GameContext';

function AnswersPanel({ songId, songTitle }) {
    const { gradeAnswer, songs } = useGame();
    const [allAnswers, setAllAnswers] = useState({});
    const [expandedSong, setExpandedSong] = useState(songId);

    // Listen to all answers
    useEffect(() => {
        const answersRef = ref(db, 'answers');

        const unsubscribe = onValue(answersRef, (snapshot) => {
            const data = snapshot.val();
            setAllAnswers(data || {});
        });

        return () => unsubscribe();
    }, []);

    // Auto-expand current song
    useEffect(() => {
        if (songId) setExpandedSong(songId);
    }, [songId]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getSongTitle = (id) => {
        const song = songs.find(s => s.id === parseInt(id));
        return song?.titleOriginal || `Nummer ${id}`;
    };

    const handleGrade = async (answerId, teamName, field, isCorrect) => {
        await gradeAnswer(answerId, teamName, field, isCorrect);
    };

    const sortedSongIds = Object.keys(allAnswers).sort((a, b) => {
        // Current song first, then by ID descending
        if (parseInt(a) === songId) return -1;
        if (parseInt(b) === songId) return 1;
        return parseInt(b) - parseInt(a);
    });

    return (
        <div className="space-y-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <MessageSquare size={16} className="text-christmas-gold" />
                Binnenkomende Antwoorden
            </h3>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sortedSongIds.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-4">
                        Nog geen antwoorden ingediend...
                    </div>
                ) : (
                    sortedSongIds.map((answerId) => {
                        const songAnswers = allAnswers[answerId];
                        const isExpanded = expandedSong === parseInt(answerId);
                        const isCurrent = parseInt(answerId) === songId;
                        const answerCount = Object.keys(songAnswers || {}).length;

                        return (
                            <div key={answerId} className="bg-gray-800 rounded-xl overflow-hidden">
                                {/* Song header - clickable to expand */}
                                <button
                                    onClick={() => setExpandedSong(isExpanded ? null : parseInt(answerId))}
                                    className={`w-full p-3 flex items-center justify-between text-left ${isCurrent ? 'bg-christmas-gold/10 border-l-4 border-christmas-gold' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Music size={14} className={isCurrent ? 'text-christmas-gold' : 'text-gray-500'} />
                                        <span className={`font-medium ${isCurrent ? 'text-christmas-gold' : 'text-gray-300'}`}>
                                            {getSongTitle(answerId)}
                                        </span>
                                        <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                                            {answerCount} antwoord{answerCount !== 1 ? 'en' : ''}
                                        </span>
                                        {isCurrent && (
                                            <span className="bg-christmas-green text-white text-xs px-2 py-0.5 rounded-full">
                                                NU
                                            </span>
                                        )}
                                    </div>
                                    {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>

                                {/* Expanded answers */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-3 pt-0 space-y-2">
                                                {Object.entries(songAnswers || {})
                                                    .sort(([, a], [, b]) => (a.submittedAt || 0) - (b.submittedAt || 0))
                                                    .map(([teamName, answer]) => (
                                                        <div key={teamName} className="bg-gray-700/50 rounded-lg p-3">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <span className="text-white font-medium">{teamName}</span>
                                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {formatTime(answer.submittedAt)}
                                                                </span>
                                                            </div>

                                                            {/* Title row with grading */}
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex-1">
                                                                    <span className="text-gray-500 text-xs">Titel: </span>
                                                                    <span className="text-christmas-gold">{answer.title}</span>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'title', true)}
                                                                        className={`p-1 rounded ${answer.titleCorrect === true
                                                                                ? 'bg-christmas-green text-white'
                                                                                : 'bg-gray-600 text-gray-400 hover:bg-green-600 hover:text-white'
                                                                            }`}
                                                                    >
                                                                        <Check size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'title', false)}
                                                                        className={`p-1 rounded ${answer.titleCorrect === false
                                                                                ? 'bg-red-600 text-white'
                                                                                : 'bg-gray-600 text-gray-400 hover:bg-red-600 hover:text-white'
                                                                            }`}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Artist row with grading */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <span className="text-gray-500 text-xs">Artiest: </span>
                                                                    <span className="text-gray-300">{answer.artist}</span>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'artist', true)}
                                                                        className={`p-1 rounded ${answer.artistCorrect === true
                                                                                ? 'bg-christmas-green text-white'
                                                                                : 'bg-gray-600 text-gray-400 hover:bg-green-600 hover:text-white'
                                                                            }`}
                                                                    >
                                                                        <Check size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'artist', false)}
                                                                        className={`p-1 rounded ${answer.artistCorrect === false
                                                                                ? 'bg-red-600 text-white'
                                                                                : 'bg-gray-600 text-gray-400 hover:bg-red-600 hover:text-white'
                                                                            }`}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default AnswersPanel;
