import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Users, Music, Loader, Trophy, ChevronDown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { db } from '../firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';
import MobileTimer from '../components/MobileTimer';

// Available reaction emojis
const REACTION_EMOJIS = ['🎉', '🔥', '😂', '🎵', '❤️', '👏', '🙈', '🤔'];

function Play() {
    const { gameState, currentSong, submitAnswer, registerTeam, songs } = useGame();
    const [teamName, setTeamName] = useState(() => localStorage.getItem('xmas-team-name') || '');
    const [teamRegistered, setTeamRegistered] = useState(() => !!localStorage.getItem('xmas-team-name'));
    const [artistGuess, setArtistGuess] = useState('');
    const [titleGuess, setTitleGuess] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [myAnswer, setMyAnswer] = useState(null);
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);
    const lastSongIdRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Update typing indicator (debounced)
    const updateTypingStatus = (isTyping) => {
        if (!teamName || !currentSong?.id) return;
        const typingRef = ref(db, `typing/${currentSong.id}/${teamName}`);
        if (isTyping) {
            set(typingRef, { typing: true, timestamp: Date.now() });
            // Clear typing after 3 seconds of inactivity
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                remove(typingRef);
            }, 3000);
        } else {
            remove(typingRef);
        }
    };

    // Get existing teams from gameState
    const existingTeams = gameState.teams || [];

    // Validate saved team name against Firebase - reset if team no longer exists
    useEffect(() => {
        const savedTeamName = localStorage.getItem('xmas-team-name');
        if (savedTeamName && existingTeams.length > 0) {
            const teamExists = existingTeams.some(t => t.name === savedTeamName);
            if (!teamExists) {
                // Team was deleted from Firebase, reset registration
                console.log('Team no longer exists in game, resetting registration');
                localStorage.removeItem('xmas-team-name');
                setTeamName('');
                setTeamRegistered(false);
            }
        }
    }, [existingTeams]);

    // Calculate song progress
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id) + 1;
    const totalSongs = songs.length;

    // Reset submission state when song changes
    useEffect(() => {
        if (currentSong?.id !== lastSongIdRef.current) {
            lastSongIdRef.current = currentSong?.id;
            setHasSubmitted(false);
            setArtistGuess('');
            setTitleGuess('');
            setMyAnswer(null);
        }
    }, [currentSong?.id, gameState.isRevealed]);

    // Listen for audio progress from Firebase (since participant doesn't have audioRef)
    useEffect(() => {
        const progressRef = ref(db, 'audioProgress');
        const unsubscribe = onValue(progressRef, (snapshot) => {
            const progress = snapshot.val();
            if (progress !== null) {
                setAudioProgress(progress);
            }
        });
        return () => unsubscribe();
    }, []);

    // Listen for my answer and grading
    useEffect(() => {
        if (!currentSong?.id || !teamName) return;

        const answerRef = ref(db, `answers/${currentSong.id}/${teamName}`);
        const unsubscribe = onValue(answerRef, (snapshot) => {
            setMyAnswer(snapshot.val());
        });
        return () => unsubscribe();
    }, [currentSong?.id, teamName]);

    const handleRegister = async () => {
        if (teamName.trim()) {
            localStorage.setItem('xmas-team-name', teamName.trim());
            await registerTeam(teamName.trim());
            setTeamRegistered(true);
        }
    };

    const handleSelectTeam = (selectedTeam) => {
        setTeamName(selectedTeam);
        localStorage.setItem('xmas-team-name', selectedTeam);
        setTeamRegistered(true);
        setShowTeamDropdown(false);
    };

    const handleSubmit = async () => {
        if (!artistGuess.trim() || !titleGuess.trim() || hasSubmitted) return;
        updateTypingStatus(false); // Clear typing indicator
        await submitAnswer(teamName, currentSong?.id, artistGuess.trim(), titleGuess.trim());
        setHasSubmitted(true);
    };

    // Handle input change with typing indicator
    const handleTitleChange = (e) => {
        setTitleGuess(e.target.value);
        updateTypingStatus(true);
    };

    const handleArtistChange = (e) => {
        setArtistGuess(e.target.value);
        updateTypingStatus(true);
    };

    const handleChangeTeam = () => {
        localStorage.removeItem('xmas-team-name');
        setTeamRegistered(false);
        setTeamName('');
    };

    // Calculate earned points
    const getEarnedPoints = () => {
        if (!myAnswer) return 0;
        let points = 0;
        const ppa = gameState.pointsPerAnswer || 1;
        if (myAnswer.titleCorrect === true) points += ppa;
        if (myAnswer.artistCorrect === true) points += ppa;
        return points;
    };

    // Send emoji reaction to Firebase (flies on TV display)
    const sendEmoji = (emoji) => {
        push(ref(db, 'emojiReactions'), {
            emoji,
            team: teamName,
            timestamp: Date.now()
        });
    };

    // Team registration screen
    if (!teamRegistered) {
        return (
            <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-3xl p-8 max-w-md w-full text-center"
                >
                    <div className="text-6xl mb-4">🎄</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Denglisch Covers</h1>
                    <p className="text-snow/70 mb-6">Kies je team of maak een nieuw team aan!</p>

                    {/* Existing Teams Dropdown */}
                    {existingTeams.length > 0 && (
                        <div className="mb-4">
                            <p className="text-snow/60 text-sm mb-2">Bestaande teams:</p>
                            <div className="relative">
                                <button
                                    onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white flex items-center justify-between hover:bg-white/15"
                                >
                                    <span className="text-snow/70">Kies een team...</span>
                                    <ChevronDown size={20} className={`transition-transform ${showTeamDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showTeamDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto"
                                        >
                                            {existingTeams.map((team) => (
                                                <button
                                                    key={team.id}
                                                    onClick={() => handleSelectTeam(team.name)}
                                                    className="w-full px-4 py-3 text-left text-white hover:bg-christmas-green/30 flex items-center gap-3 border-b border-gray-700 last:border-0"
                                                >
                                                    <Users size={16} className="text-christmas-gold" />
                                                    <span>{team.name}</span>
                                                    <span className="ml-auto text-christmas-gold text-sm">{team.score} pt</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        {existingTeams.length > 0 && (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-white/20" />
                                <span className="text-snow/50 text-sm">of nieuw team</span>
                                <div className="flex-1 h-px bg-white/20" />
                            </div>
                        )}

                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                            placeholder="Nieuwe teamnaam..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-christmas-gold mb-4"
                        />

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRegister}
                            disabled={!teamName.trim()}
                            className="w-full bg-gradient-to-r from-christmas-red to-christmas-green text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Users size={20} />
                            <span>Doe Mee!</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Waiting for song to play
    if (!gameState.isPlaying && !gameState.isRevealed) {
        return (
            <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-3xl p-8 max-w-md w-full text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-6xl mb-4 inline-block"
                    >
                        🎵
                    </motion.div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        Welkom, {teamName}!
                    </h2>
                    <p className="text-snow/70 mb-4">Wachten tot het nummer begint...</p>

                    {/* Song progress */}
                    <div className="bg-white/10 rounded-xl p-3 mb-4">
                        <span className="text-christmas-gold font-bold">{currentIndex}</span>
                        <span className="text-gray-400"> / {totalSongs} nummers</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-christmas-gold">
                        <Loader className="animate-spin" size={20} />
                        <span>Showmaster start zo...</span>
                    </div>
                    <button
                        onClick={handleChangeTeam}
                        className="mt-6 text-sm text-snow/50 hover:text-snow/80"
                    >
                        Ander team? Klik hier
                    </button>
                </motion.div>
            </div>
        );
    }

    // Revealed state - show correct answer + points
    if (gameState.isRevealed) {
        const basePoints = getEarnedPoints();
        const awardedInfo = gameState.lastAwardedPoints?.[teamName];
        const totalPoints = awardedInfo?.points || basePoints;
        const speedBonus = totalPoints - basePoints;
        const medal = awardedInfo?.medal;

        return (
            <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-3xl p-8 max-w-md w-full text-center"
                >
                    <div className="text-6xl mb-4">✨</div>
                    <h2 className="text-xl font-bold text-white mb-4">Het antwoord was:</h2>

                    <div className="bg-christmas-gold/20 rounded-2xl p-6 mb-6">
                        <h3 className="text-3xl font-bold text-gradient mb-2">
                            {currentSong?.titleOriginal}
                        </h3>
                        <p className="text-xl text-snow/90">
                            {currentSong?.artistOriginal}
                        </p>
                    </div>

                    {/* Points earned */}
                    {totalPoints > 0 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                            className="bg-christmas-green/20 rounded-2xl p-4 mb-4 border border-christmas-green/50"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <Trophy className="text-christmas-gold" size={24} />
                                    <span className="text-2xl font-bold text-christmas-green">
                                        +{totalPoints} punt{totalPoints !== 1 ? 'en' : ''}!
                                    </span>
                                </div>
                                {/* Breakdown */}
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <span>🎵 {basePoints} basis</span>
                                    {speedBonus > 0 && (
                                        <span className="flex items-center gap-1">
                                            {medal === 'gold' && '🥇'}
                                            {medal === 'silver' && '🥈'}
                                            {medal === 'bronze' && '🥉'}
                                            +{speedBonus} snelheid
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* My answer with grading */}
                    {myAnswer && (
                        <div className="text-left bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/10">
                            <p className="text-snow/60 text-sm mb-2">Jouw antwoord:</p>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded font-medium ${myAnswer.titleCorrect === true
                                    ? 'bg-green-500/20 text-green-400'
                                    : myAnswer.titleCorrect === false
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {myAnswer.titleCorrect === true ? '✓' : myAnswer.titleCorrect === false ? '✗' : '•'} {myAnswer.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded font-medium ${myAnswer.artistCorrect === true
                                    ? 'bg-green-500/20 text-green-400'
                                    : myAnswer.artistCorrect === false
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-gray-500/20 text-gray-300'
                                    }`}>
                                    {myAnswer.artistCorrect === true ? '✓' : myAnswer.artistCorrect === false ? '✗' : '•'} {myAnswer.artist}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Emoji Reactions */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-snow/50 text-sm mb-3">Stuur een reactie naar de TV! 📺</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {REACTION_EMOJIS.map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileTap={{ scale: 0.8 }}
                                    whileHover={{ scale: 1.2 }}
                                    onClick={() => sendEmoji(emoji)}
                                    className="text-3xl p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-snow/60 mt-4">
                        <Music size={16} />
                        <span>Nummer {currentIndex} van {totalSongs}</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Active guessing state
    return (
        <div className="min-h-screen animated-gradient flex flex-col p-4 pb-20">
            {/* Header */}
            <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <span className="text-white font-medium">{teamName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{currentIndex}/{totalSongs}</span>
                    <span className="text-christmas-gold text-sm font-medium">
                        {currentSong?.genre}
                    </span>
                </div>
            </div>

            {/* Audio Progress bar */}
            <div className="glass rounded-xl p-3 mb-4">
                <div className="flex justify-between text-xs text-snow/60 mb-2">
                    <span>Voortgang nummer</span>
                    <span>{Math.round(audioProgress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green rounded-full"
                        animate={{ width: `${audioProgress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Timer display */}
            <MobileTimer />

            {/* Answer form */}
            <motion.div
                layout
                className="flex-1 glass rounded-3xl p-6 flex flex-col"
            >
                <AnimatePresence mode="wait">
                    {!hasSubmitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <h2 className="text-xl font-bold text-white text-center mb-6">
                                Wat is dit nummer? 🎵
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-snow/70 text-sm mb-2">Titel</label>
                                    <input
                                        type="text"
                                        value={titleGuess}
                                        onChange={handleTitleChange}
                                        placeholder="Naam van het nummer..."
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-christmas-gold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-snow/70 text-sm mb-2">Artiest</label>
                                    <input
                                        type="text"
                                        value={artistGuess}
                                        onChange={handleArtistChange}
                                        placeholder="Wie zingt dit..."
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-christmas-gold"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={!artistGuess.trim() || !titleGuess.trim()}
                                className="w-full bg-gradient-to-r from-christmas-green to-christmas-gold text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-6 mb-4"
                            >
                                <Send size={20} />
                                <span>Bevestig Antwoord</span>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="submitted"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                <CheckCircle size={80} className="text-christmas-green mb-4" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Antwoord Verstuurd!
                            </h2>
                            <p className="text-snow/70 mb-6">
                                Wachten op de onthulling...
                            </p>
                            <div className="bg-white/5 rounded-xl p-4 w-full">
                                <p className="text-snow/60 text-sm mb-1">Jouw antwoord:</p>
                                <p className="text-white text-lg">
                                    <span className="text-christmas-gold font-bold">{titleGuess}</span>
                                </p>
                                <p className="text-snow/80">{artistGuess}</p>
                            </div>

                            {/* Emoji Reactions while waiting */}
                            <div className="mt-6 pt-4 border-t border-white/10 w-full">
                                <p className="text-snow/50 text-sm mb-3">Stuur een reactie naar de TV! 📺</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {REACTION_EMOJIS.map((emoji) => (
                                        <motion.button
                                            key={emoji}
                                            whileTap={{ scale: 0.8 }}
                                            whileHover={{ scale: 1.2 }}
                                            onClick={() => sendEmoji(emoji)}
                                            className="text-3xl p-2 hover:bg-white/10 rounded-xl transition-colors"
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default Play;
