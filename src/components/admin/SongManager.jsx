import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music, Image, Trash2, Plus, FileText,
    ChevronDown, ChevronUp, Play, Pause, RefreshCw, AlertCircle, Save, Cloud
} from 'lucide-react';
import { db } from '../../firebase';
import { ref, set, onValue } from 'firebase/database';
import { useFirebaseStorageFiles } from '../../hooks/useFirebaseStorageFiles';

function SongManager() {
    const [songs, setSongs] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const [playingType, setPlayingType] = useState(null);
    const [audioFiles, setAudioFiles] = useState([]);
    const [coverFiles, setCoverFiles] = useState([]);
    const [lyricsFiles, setLyricsFiles] = useState([]);
    const [apiError, setApiError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const audioRef = useRef(null);

    // Fetch Firebase Storage files from specific folders
    const { files: firebaseFilesEnglish, refresh: refreshEnglish } = useFirebaseStorageFiles('Songs ENG');
    const { files: firebaseFilesDutch, refresh: refreshDutch } = useFirebaseStorageFiles('Songs NL');
    const { files: firebaseCovers, refresh: refreshCovers } = useFirebaseStorageFiles('albumcover');

    // Load songs from Firebase
    useEffect(() => {
        const songsRef = ref(db, 'songs');
        const unsubscribe = onValue(songsRef, (snapshot) => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
                setSongs(data);
            } else if (data) {
                // Convert object to array if needed
                const songsArray = Object.values(data);
                setSongs(songsArray);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch available files from API
    useEffect(() => {
        const fetchFiles = async () => {
            setIsLoading(true);
            try {
                const [audioRes, coverRes] = await Promise.all([
                    fetch('http://localhost:3001/api/files/audio'),
                    fetch('http://localhost:3001/api/files/covers')
                ]);

                if (audioRes.ok && coverRes.ok) {
                    setAudioFiles(await audioRes.json());
                    setCoverFiles(await coverRes.json());
                    setApiError(false);
                } else {
                    setApiError(true);
                }

                // Try to fetch lyrics files
                try {
                    const lyricsRes = await fetch('http://localhost:3001/api/files/lyrics');
                    if (lyricsRes.ok) {
                        setLyricsFiles(await lyricsRes.json());
                    }
                } catch {
                    // Lyrics API might not exist yet
                    setLyricsFiles([]);
                }
            } catch (error) {
                console.error('Failed to fetch files:', error);
                setApiError(true);
            }
            setIsLoading(false);
        };

        fetchFiles();
    }, []);

    // Refresh file lists
    const refreshFiles = async () => {
        setIsLoading(true);
        try {
            const [audioRes, coverRes] = await Promise.all([
                fetch('http://localhost:3001/api/files/audio'),
                fetch('http://localhost:3001/api/files/covers')
            ]);

            if (audioRes.ok && coverRes.ok) {
                setAudioFiles(await audioRes.json());
                setCoverFiles(await coverRes.json());
                setApiError(false);
            }

            try {
                const lyricsRes = await fetch('http://localhost:3001/api/files/lyrics');
                if (lyricsRes.ok) {
                    setLyricsFiles(await lyricsRes.json());
                }
            } catch {
                setLyricsFiles([]);
            }
        } catch (error) {
            console.error('Failed to refresh files:', error);
        }
        setIsLoading(false);
    };

    // Save songs to Firebase
    const saveSongsToFirebase = async (newSongs) => {
        setSongs(newSongs);
        setHasChanges(true);
        await set(ref(db, 'songs'), newSongs);
        // Also save to localStorage as backup
        localStorage.setItem('xmas-songs-meta', JSON.stringify(newSongs));
        setHasChanges(false);
    };

    // Update a song field
    const updateSong = (id, updates) => {
        const updated = songs.map(song =>
            song.id === id ? { ...song, ...updates } : song
        );
        saveSongsToFirebase(updated);
    };

    // Add new song
    const addSong = () => {
        const newId = Math.max(0, ...songs.map(s => s.id)) + 1;
        const newSong = {
            id: newId,
            titleOriginal: `Nieuw Nummer ${newId}`,
            artistOriginal: "Onbekend",
            coverImage: "",
            audioFileEnglish: "",
            audioFileDutch: "",
            lyricsFileEnglish: "",
            lyricsFileDutch: "",
            genre: "Pop",
        };
        saveSongsToFirebase([...songs, newSong]);
        setExpandedId(newId);
    };

    // Delete song
    const deleteSong = (id) => {
        if (confirm('Weet je zeker dat je dit nummer wilt verwijderen?')) {
            saveSongsToFirebase(songs.filter(s => s.id !== id));
        }
    };

    // Play audio preview
    const togglePlay = (song, type) => {
        const filename = type === 'dutch' ? song.audioFileDutch : song.audioFileEnglish;
        if (!filename) return;

        // Handle both local files and external URLs (Firebase Storage)
        const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
        let audioUrl = filename;
        if (!filename.startsWith('http')) {
            const cleanPath = filename.startsWith('/') ? filename.slice(1) : `audio/${filename}`;
            audioUrl = `${baseUrl}/${cleanPath}`;
        }

        if (playingId === song.id && playingType === type) {
            audioRef.current?.pause();
            setPlayingId(null);
            setPlayingType(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play().catch(console.error);
                setPlayingId(song.id);
                setPlayingType(type);
            }
        }
    };

    // Stop audio
    const stopAudio = () => {
        audioRef.current?.pause();
        setPlayingId(null);
        setPlayingType(null);
    };

    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
            <audio ref={audioRef} onEnded={stopAudio} crossOrigin="anonymous" />

            {/* Header - Collapsible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50"
            >
                <div className="flex items-center gap-3">
                    <Music size={20} className="text-christmas-gold" />
                    <span className="text-white font-bold">Nummers Beheren</span>
                    <span className="text-gray-500 text-sm">({songs.length} nummers)</span>
                </div>
                {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 space-y-4">
                            {/* API Error Warning - Only show on localhost */}
                            {apiError && window.location.hostname === 'localhost' && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-900/50 rounded-lg text-yellow-300 text-sm">
                                    <AlertCircle size={16} />
                                    <span>Lokale API niet bereikbaar (alleen voor lokale bestanden). Gebruik Firebase voor online gebruik.</span>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addSong}
                                    className="flex items-center gap-2 px-3 py-2 bg-christmas-green rounded-lg text-white text-sm"
                                >
                                    <Plus size={16} />
                                    <span>Nieuw Nummer</span>
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={refreshFiles}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-gray-300 text-sm"
                                >
                                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                    <span>Ververs Bestanden</span>
                                </motion.button>
                            </div>

                            {/* Songs List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {songs.map((song) => (
                                    <motion.div
                                        key={song.id}
                                        layout
                                        className="bg-gray-900 rounded-lg overflow-hidden"
                                    >
                                        {/* Song Header */}
                                        <div
                                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800"
                                            onClick={() => setExpandedId(expandedId === song.id ? null : song.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-christmas-gold font-bold text-sm w-6">
                                                    #{song.id}
                                                </span>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{song.titleOriginal}</p>
                                                    <p className="text-gray-500 text-xs">{song.artistOriginal}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {song.audioFileEnglish && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded">EN</span>
                                                )}
                                                {song.audioFileDutch && (
                                                    <span className="text-xs px-2 py-0.5 bg-orange-900/50 text-orange-300 rounded">NL</span>
                                                )}
                                                {(song.lyricsFileEnglish || song.lyricsFileDutch) && (
                                                    <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">LRC</span>
                                                )}
                                                {expandedId === song.id ? (
                                                    <ChevronUp size={16} className="text-gray-400" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {expandedId === song.id && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-3 pt-0 space-y-3 border-t border-gray-800">
                                                        {/* Title & Artist */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs text-gray-500">Titel (Origineel)</label>
                                                                <input
                                                                    type="text"
                                                                    value={song.titleOriginal}
                                                                    onChange={(e) => updateSong(song.id, { titleOriginal: e.target.value })}
                                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500">Artiest (Origineel)</label>
                                                                <input
                                                                    type="text"
                                                                    value={song.artistOriginal}
                                                                    onChange={(e) => updateSong(song.id, { artistOriginal: e.target.value })}
                                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Genre */}
                                                        <div>
                                                            <label className="text-xs text-gray-500">Genre</label>
                                                            <input
                                                                type="text"
                                                                value={song.genre || ''}
                                                                onChange={(e) => updateSong(song.id, { genre: e.target.value })}
                                                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                            />
                                                        </div>

                                                        {/* Audio Files */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Music size={12} /> Audio Engels (Quiz)
                                                                </label>
                                                                <div className="flex gap-1">
                                                                    <select
                                                                        value={song.audioFileEnglish || ''}
                                                                        onChange={(e) => updateSong(song.id, { audioFileEnglish: e.target.value })}
                                                                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                                    >
                                                                        <option value="">Selecteer...</option>
                                                                        {firebaseFilesEnglish.length > 0 && (
                                                                            <optgroup label="☁️ Songs ENG">
                                                                                {firebaseFilesEnglish.map(f => (
                                                                                    <option key={f.url} value={f.url}>{f.name}</option>
                                                                                ))}
                                                                            </optgroup>
                                                                        )}
                                                                        {audioFiles.length > 0 && (
                                                                            <optgroup label="📁 Lokale bestanden">
                                                                                {audioFiles.map(f => (
                                                                                    <option key={f} value={f}>{f}</option>
                                                                                ))}
                                                                            </optgroup>
                                                                        )}
                                                                    </select>
                                                                    {song.audioFileEnglish && (
                                                                        <button
                                                                            onClick={() => togglePlay(song, 'english')}
                                                                            className="p-1 bg-blue-600 rounded"
                                                                        >
                                                                            {playingId === song.id && playingType === 'english' ? (
                                                                                <Pause size={14} className="text-white" />
                                                                            ) : (
                                                                                <Play size={14} className="text-white" />
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Music size={12} /> Audio NL (Reveal)
                                                                </label>
                                                                <div className="flex gap-1">
                                                                    <select
                                                                        value={song.audioFileDutch || ''}
                                                                        onChange={(e) => updateSong(song.id, { audioFileDutch: e.target.value })}
                                                                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                                    >
                                                                        <option value="">Selecteer...</option>
                                                                        {firebaseFilesDutch.length > 0 && (
                                                                            <optgroup label="☁️ Songs NL">
                                                                                {firebaseFilesDutch.map(f => (
                                                                                    <option key={f.url} value={f.url}>{f.name}</option>
                                                                                ))}
                                                                            </optgroup>
                                                                        )}
                                                                        {audioFiles.length > 0 && (
                                                                            <optgroup label="📁 Lokale bestanden">
                                                                                {audioFiles.map(f => (
                                                                                    <option key={f} value={f}>{f}</option>
                                                                                ))}
                                                                            </optgroup>
                                                                        )}
                                                                    </select>
                                                                    {song.audioFileDutch && (
                                                                        <button
                                                                            onClick={() => togglePlay(song, 'dutch')}
                                                                            className="p-1 bg-orange-600 rounded"
                                                                        >
                                                                            {playingId === song.id && playingType === 'dutch' ? (
                                                                                <Pause size={14} className="text-white" />
                                                                            ) : (
                                                                                <Play size={14} className="text-white" />
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Cover Image */}
                                                        <div>
                                                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Image size={12} /> Cover Image
                                                            </label>
                                                            <select
                                                                value={song.coverImage || ''}
                                                                onChange={(e) => updateSong(song.id, { coverImage: e.target.value })}
                                                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                            >
                                                                <option value="">Selecteer...</option>
                                                                {firebaseCovers.length > 0 && (
                                                                    <optgroup label="☁️ Albumcovers">
                                                                        {firebaseCovers.map(f => (
                                                                            <option key={f.url} value={f.url}>{f.name}</option>
                                                                        ))}
                                                                    </optgroup>
                                                                )}
                                                                {coverFiles.length > 0 && (
                                                                    <optgroup label="📁 Lokale bestanden">
                                                                        {coverFiles.map(f => (
                                                                            <option key={f} value={f}>{f}</option>
                                                                        ))}
                                                                    </optgroup>
                                                                )}
                                                            </select>
                                                        </div>

                                                        {/* Lyrics Files */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <FileText size={12} /> 🇬🇧 Lyrics Engels
                                                                </label>
                                                                <select
                                                                    value={song.lyricsFileEnglish || ''}
                                                                    onChange={(e) => updateSong(song.id, { lyricsFileEnglish: e.target.value })}
                                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                                >
                                                                    <option value="">Geen lyrics</option>
                                                                    {lyricsFiles.map(f => (
                                                                        <option key={f} value={f}>{f}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <FileText size={12} /> 🇳🇱 Lyrics Nederlands
                                                                </label>
                                                                <select
                                                                    value={song.lyricsFileDutch || ''}
                                                                    onChange={(e) => updateSong(song.id, { lyricsFileDutch: e.target.value })}
                                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                                                                >
                                                                    <option value="">Geen lyrics</option>
                                                                    {lyricsFiles.map(f => (
                                                                        <option key={f} value={f}>{f}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => deleteSong(song.id)}
                                                            className="flex items-center gap-1 text-red-400 text-xs hover:text-red-300"
                                                        >
                                                            <Trash2 size={12} />
                                                            <span>Verwijder nummer</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}

                                {songs.length === 0 && (
                                    <div className="text-center text-gray-500 py-8">
                                        Geen nummers. Klik op &quot;Nieuw Nummer&quot; om te beginnen.
                                    </div>
                                )}
                            </div>

                            {/* Save indicator */}
                            {hasChanges && (
                                <div className="flex items-center gap-2 text-christmas-gold text-sm">
                                    <Save size={14} className="animate-pulse" />
                                    <span>Opslaan naar Firebase...</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SongManager;
