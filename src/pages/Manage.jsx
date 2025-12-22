import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Home, Music, Image, Save, Trash2, Plus,
    ChevronDown, ChevronUp, Play, Pause, RefreshCw, AlertCircle
} from 'lucide-react';

function Manage() {
    // Load songs from localStorage (only metadata)
    const [songs, setSongs] = useState(() => {
        const saved = localStorage.getItem('xmas-songs-meta');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    });

    const [expandedId, setExpandedId] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const [playingType, setPlayingType] = useState(null);
    const [audioFiles, setAudioFiles] = useState([]);
    const [coverFiles, setCoverFiles] = useState([]);
    const [apiError, setApiError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef(null);

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
        } catch (error) {
            console.error('Failed to refresh files:', error);
        }
        setIsLoading(false);
    };

    // Save metadata to localStorage
    const saveSongs = (newSongs) => {
        setSongs(newSongs);
        localStorage.setItem('xmas-songs-meta', JSON.stringify(newSongs));
    };

    // Update a song field
    const updateSong = (id, updates) => {
        const updated = songs.map(song =>
            song.id === id ? { ...song, ...updates } : song
        );
        saveSongs(updated);
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
            genre: "Genre",
            lyricsSnippet: "Lyrics hier...",
        };
        saveSongs([...songs, newSong]);
        setExpandedId(newId);
    };

    // Delete song
    const deleteSong = (id) => {
        if (confirm('Weet je zeker dat je dit nummer wilt verwijderen?')) {
            saveSongs(songs.filter(s => s.id !== id));
        }
    };

    // Play audio preview
    const togglePlay = (song, type) => {
        const filename = type === 'dutch' ? song.audioFileDutch : song.audioFileEnglish;
        if (!filename) return;

        const audioUrl = `/audio/${filename}`;

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

    // Export songs to JSON
    const exportSongs = () => {
        const blob = new Blob([JSON.stringify(songs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'xmas-songs.json';
        a.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Hidden audio element for preview */}
            <audio
                ref={audioRef}
                onEnded={() => { setPlayingId(null); setPlayingType(null); }}
            />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" onClick={stopAudio}>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            <Home size={20} />
                        </motion.button>
                    </Link>

                    <h1 className="text-lg font-bold text-gradient">🎵 Nummers Beheren</h1>

                    <div className="flex gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={refreshFiles}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                            title="Ververs bestandenlijst"
                        >
                            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={exportSongs}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                            title="Exporteer nummers"
                        >
                            <Save size={20} />
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-6 space-y-4 pb-24">
                {/* API Error Warning */}
                {apiError && (
                    <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 text-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-300 mb-1">⚠️ File API niet bereikbaar</p>
                                <p className="text-red-200/80">Start de file API met: <code className="bg-black/30 px-2 py-0.5 rounded">npm run file-api</code></p>
                                <p className="text-red-200/60 text-xs mt-1">Dit moet in een aparte terminal naast <code>npm run dev</code></p>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Stats */}
                {!apiError && (
                    <div className="bg-christmas-green/20 border border-christmas-green/40 rounded-xl p-4 text-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <span className="text-snow/80">
                                    🎵 <strong className="text-christmas-gold">{audioFiles.length}</strong> audio bestanden
                                </span>
                                <span className="text-snow/80">
                                    🖼️ <strong className="text-christmas-gold">{coverFiles.length}</strong> albumhoezen
                                </span>
                            </div>
                            <span className="text-snow/60 text-xs">
                                Bestanden in public/audio en public/covers
                            </span>
                        </div>
                    </div>
                )}

                {/* Song List */}
                {songs.map((song) => (
                    <motion.div
                        key={song.id}
                        layout
                        className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700"
                    >
                        {/* Song Header */}
                        <button
                            onClick={() => setExpandedId(expandedId === song.id ? null : song.id)}
                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {song.coverImage ? (
                                    <img
                                        src={`/covers/${song.coverImage}`}
                                        alt={song.titleOriginal}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <Music size={24} className="text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{song.titleOriginal}</p>
                                <p className="text-gray-400 text-sm truncate">{song.artistOriginal}</p>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    <span className="inline-block bg-christmas-gold/20 text-christmas-gold text-xs px-2 py-0.5 rounded-full">
                                        {song.genre}
                                    </span>
                                    {song.audioFileEnglish && (
                                        <span className="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                                            🇬🇧 ✓
                                        </span>
                                    )}
                                    {song.audioFileDutch && (
                                        <span className="inline-block bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                                            🇳🇱 ✓
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                {expandedId === song.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>

                        {/* Expanded Edit Panel */}
                        {expandedId === song.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-gray-700 p-4 space-y-4"
                            >
                                {/* Title */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Titel (Nederlands Origineel)</label>
                                    <input
                                        type="text"
                                        value={song.titleOriginal}
                                        onChange={(e) => updateSong(song.id, { titleOriginal: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-christmas-gold focus:outline-none"
                                    />
                                </div>

                                {/* Artist */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Artiest</label>
                                    <input
                                        type="text"
                                        value={song.artistOriginal}
                                        onChange={(e) => updateSong(song.id, { artistOriginal: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-christmas-gold focus:outline-none"
                                    />
                                </div>

                                {/* Genre */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Genre (Hint)</label>
                                    <input
                                        type="text"
                                        value={song.genre}
                                        onChange={(e) => updateSong(song.id, { genre: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-christmas-gold focus:outline-none"
                                    />
                                </div>

                                {/* Lyrics Snippet */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Lyrics Fragment (Engels)</label>
                                    <textarea
                                        value={song.lyricsSnippet}
                                        onChange={(e) => updateSong(song.id, { lyricsSnippet: e.target.value })}
                                        rows={2}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-christmas-gold focus:outline-none resize-none"
                                    />
                                </div>

                                {/* English Audio Dropdown */}
                                <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🇬🇧</span>
                                        <span className="text-sm font-medium text-blue-300">Engelse Versie (Suno AI)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={song.audioFileEnglish || ''}
                                            onChange={(e) => updateSong(song.id, { audioFileEnglish: e.target.value })}
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">-- Selecteer audio bestand --</option>
                                            {audioFiles.map(file => (
                                                <option key={file} value={file}>{file}</option>
                                            ))}
                                        </select>
                                        {song.audioFileEnglish && (
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => togglePlay(song, 'english')}
                                                className={`px-4 py-2 rounded-lg ${playingId === song.id && playingType === 'english'
                                                        ? 'bg-red-600'
                                                        : 'bg-blue-600 hover:bg-blue-500'
                                                    }`}
                                            >
                                                {playingId === song.id && playingType === 'english' ? <Pause size={16} /> : <Play size={16} />}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* Dutch Audio Dropdown */}
                                <div className="bg-orange-900/30 border border-orange-700/50 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🇳🇱</span>
                                        <span className="text-sm font-medium text-orange-300">Nederlandse Versie (Origineel)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={song.audioFileDutch || ''}
                                            onChange={(e) => updateSong(song.id, { audioFileDutch: e.target.value })}
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                                        >
                                            <option value="">-- Selecteer audio bestand --</option>
                                            {audioFiles.map(file => (
                                                <option key={file} value={file}>{file}</option>
                                            ))}
                                        </select>
                                        {song.audioFileDutch && (
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => togglePlay(song, 'dutch')}
                                                className={`px-4 py-2 rounded-lg ${playingId === song.id && playingType === 'dutch'
                                                        ? 'bg-red-600'
                                                        : 'bg-orange-600 hover:bg-orange-500'
                                                    }`}
                                            >
                                                {playingId === song.id && playingType === 'dutch' ? <Pause size={16} /> : <Play size={16} />}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* Cover Image Dropdown */}
                                <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Image size={18} className="text-purple-300" />
                                        <span className="text-sm font-medium text-purple-300">Albumhoes</span>
                                    </div>
                                    <select
                                        value={song.coverImage || ''}
                                        onChange={(e) => updateSong(song.id, { coverImage: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="">-- Selecteer albumhoes --</option>
                                        {coverFiles.map(file => (
                                            <option key={file} value={file}>{file}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Delete Button */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => deleteSong(song.id)}
                                    className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 py-3 rounded-xl transition-colors"
                                >
                                    <Trash2 size={18} />
                                    <span>Verwijder Nummer</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                ))}

                {/* Add Song Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={addSong}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-christmas-gold to-yellow-500 text-christmas-red-dark font-bold py-4 rounded-2xl"
                >
                    <Plus size={24} />
                    <span>Nieuw Nummer Toevoegen</span>
                </motion.button>
            </main>
        </div>
    );
}

export default Manage;
