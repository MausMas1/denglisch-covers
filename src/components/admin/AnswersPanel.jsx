import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, Check, X, ChevronDown, ChevronUp, Music, CheckCircle, Zap } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useGame } from '../../context/GameContext';
import { fuzzyMatch } from '../../utils/fuzzyMatch';

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

    // Format time ago
    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        return formatTime(timestamp);
    };

    const getSong = (id) => songs.find(s => s.id === parseInt(id));
    const getSongTitle = (id) => getSong(id)?.titleOriginal || `Nummer ${id}`;

    const handleGrade = async (answerId, teamName, field, isCorrect) => {
        await gradeAnswer(answerId, teamName, field, isCorrect);
    };

    // Auto-grade using fuzzy matching
    const autoGradeAnswer = (song, answer) => {
        if (!song || !answer) return { title: null, artist: null };
        const titleMatch = fuzzyMatch(answer.title, song.titleOriginal, 3);
        const artistMatch = fuzzyMatch(answer.artist, song.artistOriginal, 3);
        return {
            title: titleMatch.autoApproved ? true : null,
            artist: artistMatch.autoApproved ? true : null,
        };
    };

    // Auto-grade pending answers
    const processedAnswersRef = useRef(new Set());
    useEffect(() => {
        Object.entries(allAnswers).forEach(([songIdStr, songAnswers]) => {
            const song = getSong(songIdStr);
            if (!song) return;
            Object.entries(songAnswers || {}).forEach(([teamName, answer]) => {
                const answerKey = `${songIdStr}-${teamName}`;
                const hasUngraded = answer.titleCorrect === undefined || answer.artistCorrect === undefined;
                if (hasUngraded && !processedAnswersRef.current.has(answerKey)) {
                    const autoGrade = autoGradeAnswer(song, answer);
                    if (autoGrade.title === true && answer.titleCorrect === undefined) {
                        gradeAnswer(songIdStr, teamName, 'title', true);
                    }
                    if (autoGrade.artist === true && answer.artistCorrect === undefined) {
                        gradeAnswer(songIdStr, teamName, 'artist', true);
                    }
                    processedAnswersRef.current.add(answerKey);
                }
            });
        });
    }, [allAnswers, songs, gradeAnswer]);

    // Get stats for a song's answers
    const getStats = (songAnswers) => {
        const entries = Object.values(songAnswers || {});
        const total = entries.length;
        const fullyGraded = entries.filter(a =>
            a.titleCorrect !== undefined && a.artistCorrect !== undefined
        ).length;
        const correct = entries.filter(a =>
            a.titleCorrect === true && a.artistCorrect === true
        ).length;
        const partial = entries.filter(a =>
            (a.titleCorrect === true || a.artistCorrect === true) &&
            !(a.titleCorrect === true && a.artistCorrect === true)
        ).length;
        const wrong = entries.filter(a =>
            a.titleCorrect === false && a.artistCorrect === false
        ).length;
        const pending = total - fullyGraded;
        return { total, correct, partial, wrong, pending };
    };

    // Get answer status for color coding
    const getAnswerStatus = (answer) => {
        const titleGraded = answer.titleCorrect !== undefined;
        const artistGraded = answer.artistCorrect !== undefined;
        if (!titleGraded || !artistGraded) return 'pending';
        if (answer.titleCorrect && answer.artistCorrect) return 'correct';
        if (answer.titleCorrect || answer.artistCorrect) return 'partial';
        return 'wrong';
    };

    const statusColors = {
        correct: 'bg-green-900/30 border-l-4 border-green-500',
        partial: 'bg-yellow-900/30 border-l-4 border-yellow-500',
        wrong: 'bg-red-900/30 border-l-4 border-red-500',
        pending: 'bg-gray-700/50 border-l-4 border-gray-500',
    };

    // Bulk approve all pending correct answers for a song
    const bulkApprove = async (answerId) => {
        const song = getSong(answerId);
        const songAnswers = allAnswers[answerId];
        if (!song || !songAnswers) return;

        for (const [teamName, answer] of Object.entries(songAnswers)) {
            const autoGrade = autoGradeAnswer(song, answer);
            if (answer.titleCorrect === undefined && autoGrade.title) {
                await gradeAnswer(answerId, teamName, 'title', true);
            }
            if (answer.artistCorrect === undefined && autoGrade.artist) {
                await gradeAnswer(answerId, teamName, 'artist', true);
            }
        }
    };

    const sortedSongIds = Object.keys(allAnswers).sort((a, b) => {
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
                        const stats = getStats(songAnswers);
                        const song = getSong(answerId);

                        // Sort answers: pending first, then by time
                        const sortedAnswers = Object.entries(songAnswers || {})
                            .sort(([, a], [, b]) => {
                                const statusA = getAnswerStatus(a);
                                const statusB = getAnswerStatus(b);
                                if (statusA === 'pending' && statusB !== 'pending') return -1;
                                if (statusB === 'pending' && statusA !== 'pending') return 1;
                                return (a.submittedAt || 0) - (b.submittedAt || 0);
                            });

                        return (
                            <div key={answerId} className="bg-gray-800 rounded-xl overflow-hidden">
                                {/* Song header */}
                                <button
                                    onClick={() => setExpandedSong(isExpanded ? null : parseInt(answerId))}
                                    className={`w-full p-3 flex items-center justify-between text-left ${isCurrent ? 'bg-christmas-gold/10 border-l-4 border-christmas-gold' : ''}`}
                                >
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Music size={14} className={isCurrent ? 'text-christmas-gold' : 'text-gray-500'} />
                                        <span className={`font-medium ${isCurrent ? 'text-christmas-gold' : 'text-gray-300'}`}>
                                            {getSongTitle(answerId)}
                                        </span>
                                        {isCurrent && (
                                            <span className="bg-christmas-green text-white text-xs px-2 py-0.5 rounded-full">NU</span>
                                        )}
                                        {/* Stats badges */}
                                        <div className="flex gap-1 text-xs">
                                            {stats.correct > 0 && <span className="bg-green-700 text-white px-1.5 py-0.5 rounded">✓{stats.correct}</span>}
                                            {stats.partial > 0 && <span className="bg-yellow-700 text-white px-1.5 py-0.5 rounded">½{stats.partial}</span>}
                                            {stats.wrong > 0 && <span className="bg-red-700 text-white px-1.5 py-0.5 rounded">✗{stats.wrong}</span>}
                                            {stats.pending > 0 && <span className="bg-gray-600 text-white px-1.5 py-0.5 rounded">?{stats.pending}</span>}
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>

                                {/* Expanded content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-3 pt-0 space-y-2">
                                                {/* Correct answer reference */}
                                                {song && (
                                                    <div className="text-xs text-gray-400 bg-gray-900/50 rounded-lg p-2 mb-2">
                                                        <span className="text-gray-500">Correct: </span>
                                                        <span className="text-christmas-gold">{song.titleOriginal}</span>
                                                        <span className="text-gray-500"> - </span>
                                                        <span className="text-gray-300">{song.artistOriginal}</span>
                                                    </div>
                                                )}

                                                {/* Bulk approve button */}
                                                {stats.pending > 0 && (
                                                    <motion.button
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => bulkApprove(answerId)}
                                                        className="w-full py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Keur matching antwoorden goed ({stats.pending} pending)
                                                    </motion.button>
                                                )}

                                                {/* Answers list */}
                                                {sortedAnswers.map(([teamName, answer]) => {
                                                    const status = getAnswerStatus(answer);
                                                    const song = getSong(answerId);
                                                    const wasAutoGraded = song && (
                                                        (answer.titleCorrect === true && fuzzyMatch(answer.title, song.titleOriginal, 3).autoApproved) ||
                                                        (answer.artistCorrect === true && fuzzyMatch(answer.artist, song.artistOriginal, 3).autoApproved)
                                                    );
                                                    return (
                                                        <div key={teamName} className={`rounded-lg p-3 ${statusColors[status]}`}>
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white font-medium">{teamName}</span>
                                                                    {wasAutoGraded && (
                                                                        <span title="Auto-goedgekeurd" className="text-yellow-400">
                                                                            <Zap size={12} />
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-gray-500 text-xs flex items-center gap-1" title={formatTime(answer.submittedAt)}>
                                                                    <Clock size={10} />
                                                                    {timeAgo(answer.submittedAt)}
                                                                </span>
                                                            </div>

                                                            {/* Title row */}
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex-1">
                                                                    <span className="text-gray-500 text-xs">Titel: </span>
                                                                    <span className="text-christmas-gold">{answer.title}</span>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'title', true)}
                                                                        className={`p-2 rounded ${answer.titleCorrect === true ? 'bg-christmas-green text-white' : 'bg-gray-600 text-gray-400 hover:bg-green-600 hover:text-white'}`}
                                                                    >
                                                                        <Check size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'title', false)}
                                                                        className={`p-2 rounded ${answer.titleCorrect === false ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-400 hover:bg-red-600 hover:text-white'}`}
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Artist row */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <span className="text-gray-500 text-xs">Artiest: </span>
                                                                    <span className="text-gray-300">{answer.artist}</span>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'artist', true)}
                                                                        className={`p-2 rounded ${answer.artistCorrect === true ? 'bg-christmas-green text-white' : 'bg-gray-600 text-gray-400 hover:bg-green-600 hover:text-white'}`}
                                                                    >
                                                                        <Check size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleGrade(answerId, teamName, 'artist', false)}
                                                                        className={`p-2 rounded ${answer.artistCorrect === false ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-400 hover:bg-red-600 hover:text-white'}`}
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                </div>
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
                    })
                )}
            </div>
        </div>
    );
}

export default AnswersPanel;
