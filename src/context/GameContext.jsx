import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, update, get } from 'firebase/database';
import { songs as defaultSongs } from '../data/songs';

const GameContext = createContext(null);

const initialGameState = {
    currentSongId: 1,
    isPlaying: false,
    showLyrics: true,
    isRevealed: false,
    pointsPerAnswer: 1,
    lastAwardedPoints: null, // { teamName: points, ... } - for animation
    teams: [],
    // Timer settings
    timerDuration: 0,      // 0 = no timer, otherwise seconds
    timerEndTime: null,    // Timestamp when timer ends
    timerActive: false,    // Is timer currently running
    // QR Code visibility on Display
    showQRCode: false,
};

// Get songs from localStorage (metadata only) or use defaults
const getSavedSongs = () => {
    const saved = localStorage.getItem('xmas-songs-meta');
    if (saved) {
        return JSON.parse(saved);
    }
    return defaultSongs;
};

export function GameProvider({ children }) {
    const [gameState, setGameState] = useState(initialGameState);
    const [songs, setSongs] = useState(getSavedSongs);
    const [isConnected, setIsConnected] = useState(false);
    const audioRef = useRef(null);
    const sfxRef = useRef(null);

    // Sync songs from Firebase for all clients
    useEffect(() => {
        const songsRef = ref(db, 'songs');
        const unsubscribe = onValue(songsRef, (snapshot) => {
            const data = snapshot.val();
            if (data && Array.isArray(data) && data.length > 0) {
                setSongs(data);
            }
        });
        return () => unsubscribe();
    }, []);

    // Note: Songs are saved directly to Firebase by SongManager.jsx
    // No need for interval-based sync here

    // Get current song from songs array
    const currentSong = songs.find((s) => s.id === gameState.currentSongId) || songs[0];

    // Get audio URL based on current state
    const getActiveAudioUrl = (song, isRevealed) => {
        if (!song) return '';

        const getUrl = (file) => {
            if (!file) return '';
            if (file.startsWith('http')) return file;

            // Handle local files
            const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
            const cleanPath = file.startsWith('/') ? file.slice(1) : `audio/${file}`;
            return `${baseUrl}/${cleanPath}`;
        };

        if (isRevealed) {
            const dutchFile = song.audioFileDutch || song.audioUrlDutch;
            if (dutchFile) return getUrl(dutchFile);
        }

        const englishFile = song.audioFileEnglish || song.audioUrlEnglish || song.audioUrl;
        if (englishFile) return getUrl(englishFile);

        return '';
    };

    // Firebase listener
    useEffect(() => {
        const gameStateRef = ref(db, 'gameState');

        const unsubscribe = onValue(gameStateRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Migrate old scores format to new teams format
                if (data.scores && !data.teams) {
                    const teams = Object.entries(data.scores).map(([name, score], index) => ({
                        id: index + 1,
                        name,
                        score
                    }));
                    data.teams = teams;
                    delete data.scores;
                }
                setGameState(data);
                setIsConnected(true);
            } else {
                set(gameStateRef, initialGameState);
            }
        }, (error) => {
            console.error('Firebase connection error:', error);
            setIsConnected(false);
        });

        return () => unsubscribe();
    }, []);

    // Update game state in Firebase
    const updateGameState = async (updates) => {
        const gameStateRef = ref(db, 'gameState');
        try {
            await update(gameStateRef, updates);
        } catch (error) {
            console.error('Failed to update game state:', error);
        }
    };

    // Update score for a specific team by ID - using fresh data from Firebase
    const updateScore = async (teamId, delta) => {
        const gameStateRef = ref(db, 'gameState');
        try {
            // Get fresh data from Firebase to avoid stale state
            const snapshot = await get(gameStateRef);
            const currentData = snapshot.val();

            if (!currentData || !currentData.teams) return;

            const updatedTeams = currentData.teams.map(team =>
                team.id === teamId
                    ? { ...team, score: Math.max(0, team.score + delta) }
                    : team
            );

            await update(gameStateRef, { teams: updatedTeams });
        } catch (error) {
            console.error('Failed to update score:', error);
        }
    };

    // Add a new team (only if doesn't exist)
    const addTeam = async (name) => {
        const gameStateRef = ref(db, 'gameState');
        try {
            const snapshot = await get(gameStateRef);
            const currentData = snapshot.val();

            const teams = currentData?.teams || [];

            // Check if team already exists
            if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
                return false; // Team already exists
            }

            const newId = Math.max(0, ...teams.map(t => t.id)) + 1;
            const updatedTeams = [...teams, { id: newId, name, score: 0 }];

            await update(gameStateRef, { teams: updatedTeams });
            return true; // Successfully added
        } catch (error) {
            console.error('Failed to add team:', error);
            return false;
        }
    };

    // Register team from participant screen (auto-adds to scoreboard)
    const registerTeam = async (teamName) => {
        await addTeam(teamName);
        return true;
    };

    // Remove a team
    const removeTeam = async (teamId) => {
        const gameStateRef = ref(db, 'gameState');
        try {
            const snapshot = await get(gameStateRef);
            const currentData = snapshot.val();

            if (!currentData?.teams) return;

            const updatedTeams = currentData.teams.filter(t => t.id !== teamId);
            await update(gameStateRef, { teams: updatedTeams });
        } catch (error) {
            console.error('Failed to remove team:', error);
        }
    };

    // Rename a team
    const renameTeam = async (teamId, newName) => {
        const gameStateRef = ref(db, 'gameState');
        try {
            const snapshot = await get(gameStateRef);
            const currentData = snapshot.val();

            if (!currentData?.teams) return;

            const updatedTeams = currentData.teams.map(team =>
                team.id === teamId ? { ...team, name: newName } : team
            );

            await update(gameStateRef, { teams: updatedTeams });
        } catch (error) {
            console.error('Failed to rename team:', error);
        }
    };

    // Reset all scores
    const resetScores = async () => {
        const gameStateRef = ref(db, 'gameState');
        try {
            const snapshot = await get(gameStateRef);
            const currentData = snapshot.val();

            if (!currentData?.teams) return;

            const updatedTeams = currentData.teams.map(team => ({ ...team, score: 0 }));
            await update(gameStateRef, { teams: updatedTeams });
        } catch (error) {
            console.error('Failed to reset scores:', error);
        }
    };

    // Reset entire game (scores + answers)
    const resetGame = async () => {
        const gameStateRef = ref(db, 'gameState');
        const answersRef = ref(db, 'answers');
        try {
            // Reset scores
            const snapshot = await get(gameStateRef);
            const currentData = snapshot.val();

            if (currentData?.teams) {
                const updatedTeams = currentData.teams.map(team => ({ ...team, score: 0 }));
                await update(gameStateRef, {
                    teams: updatedTeams,
                    currentSongId: 1,
                    isRevealed: false,
                    showLyrics: false,
                    isPlaying: false,
                    lastAwardedPoints: null
                });
            }

            // Clear all answers
            await set(answersRef, null);
        } catch (error) {
            console.error('Failed to reset game:', error);
        }
    };

    // Clear all teams completely
    const clearAllTeams = async () => {
        const gameStateRef = ref(db, 'gameState');
        try {
            await update(gameStateRef, { teams: [] });
        } catch (error) {
            console.error('Failed to clear teams:', error);
        }
    };

    // Playback controls
    const play = () => updateGameState({ isPlaying: true });
    const pause = () => updateGameState({ isPlaying: false });
    const restart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
        updateGameState({ isPlaying: true });
    };

    // Game flow controls
    const toggleLyrics = () => updateGameState({ showLyrics: !gameState.showLyrics });

    // Reveal with auto-award points
    const reveal = async () => {
        const gameStateRef = ref(db, 'gameState');
        const answersRef = ref(db, `answers/${gameState.currentSongId}`);

        try {
            const [gameSnapshot, answersSnapshot] = await Promise.all([
                get(gameStateRef),
                get(answersRef)
            ]);

            const currentData = gameSnapshot.val();
            const answers = answersSnapshot.val() || {};
            const pointsPerAnswer = currentData?.pointsPerAnswer || 1;
            const teams = currentData?.teams || [];

            // Calculate points for each team
            const pointsAwarded = {};
            const updatedTeams = teams.map(team => {
                const teamAnswer = answers[team.name];
                let earnedPoints = 0;

                if (teamAnswer) {
                    if (teamAnswer.titleCorrect === true) earnedPoints += pointsPerAnswer;
                    if (teamAnswer.artistCorrect === true) earnedPoints += pointsPerAnswer;
                }

                if (earnedPoints > 0) {
                    pointsAwarded[team.name] = earnedPoints;
                }

                return {
                    ...team,
                    score: team.score + earnedPoints
                };
            });

            await update(gameStateRef, {
                isRevealed: true,
                isPlaying: true,
                teams: updatedTeams,
                lastAwardedPoints: Object.keys(pointsAwarded).length > 0 ? pointsAwarded : null
            });
        } catch (error) {
            console.error('Failed to reveal:', error);
            // Fallback to simple reveal
            updateGameState({ isRevealed: true, isPlaying: true });
        }
    };

    // Update points per answer setting
    const setPointsPerAnswer = (points) => {
        updateGameState({ pointsPerAnswer: Math.max(1, points) });
    };

    const selectSong = (songId) => updateGameState({
        currentSongId: songId,
        isRevealed: false,
        showLyrics: false,
        isPlaying: false,
        timerEndTime: null,
        timerActive: false
    });

    // Timer controls
    const startTimer = () => {
        if (gameState.timerDuration > 0) {
            const endTime = Date.now() + (gameState.timerDuration * 1000);
            updateGameState({ timerEndTime: endTime, timerActive: true });
        }
    };

    const stopTimer = () => {
        updateGameState({ timerEndTime: null, timerActive: false });
    };

    const setTimerDuration = (seconds) => {
        updateGameState({ timerDuration: Math.max(0, seconds) });
    };

    // Submit answer from participant
    const submitAnswer = async (teamName, songId, artist, title) => {
        const answerRef = ref(db, `answers/${songId}/${teamName}`);
        try {
            await set(answerRef, {
                artist,
                title,
                submittedAt: Date.now(),
                locked: true,
            });
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    };

    // Get all answers for a song
    const getAnswersForSong = async (songId) => {
        const answersRef = ref(db, `answers/${songId}`);
        try {
            const snapshot = await get(answersRef);
            return snapshot.val() || {};
        } catch (error) {
            console.error('Failed to get answers:', error);
            return {};
        }
    };

    // Get all answers for all songs
    const getAllAnswers = async () => {
        const answersRef = ref(db, 'answers');
        try {
            const snapshot = await get(answersRef);
            return snapshot.val() || {};
        } catch (error) {
            console.error('Failed to get all answers:', error);
            return {};
        }
    };

    // Grade an answer (mark artist/title as correct or incorrect)
    const gradeAnswer = async (songId, teamName, field, isCorrect) => {
        const gradeRef = ref(db, `answers/${songId}/${teamName}/${field}Correct`);
        try {
            await set(gradeRef, isCorrect);
        } catch (error) {
            console.error('Failed to grade answer:', error);
        }
    };

    // Go to next song
    const nextSong = () => {
        const currentIndex = songs.findIndex(s => s.id === gameState.currentSongId);
        const nextIndex = (currentIndex + 1) % songs.length;
        const nextSongId = songs[nextIndex]?.id || songs[0]?.id;
        selectSong(nextSongId);
    };

    // Go to previous song
    const prevSong = () => {
        const currentIndex = songs.findIndex(s => s.id === gameState.currentSongId);
        const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
        const prevSongId = songs[prevIndex]?.id || songs[0]?.id;
        selectSong(prevSongId);
    };

    // SFX URLs
    const sfxUrls = {
        correct: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        wrong: 'https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3',
        drumroll: 'https://www.soundjay.com/misc/sounds/drum-roll-01.mp3',
        applaus: 'https://www.soundjay.com/human/sounds/applause-01.mp3',
    };

    const playSFX = (type) => {
        if (sfxRef.current) {
            sfxRef.current.src = sfxUrls[type];
            sfxRef.current.play().catch(console.error);
        }
    };

    const value = {
        gameState,
        currentSong,
        isConnected,
        audioRef,
        sfxRef,
        updateGameState,
        updateScore,
        addTeam,
        removeTeam,
        renameTeam,
        resetScores,
        play,
        pause,
        restart,
        toggleLyrics,
        reveal,
        selectSong,
        playSFX,
        songs,
        getActiveAudioUrl,
        submitAnswer,
        getAnswersForSong,
        getAllAnswers,
        gradeAnswer,
        registerTeam,
        nextSong,
        prevSong,
        setPointsPerAnswer,
        resetGame,
        clearAllTeams,
        startTimer,
        stopTimer,
        setTimerDuration,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
            <audio ref={sfxRef} />
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
