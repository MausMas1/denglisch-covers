import { motion } from 'framer-motion';
import { Music, Check } from 'lucide-react';
import { useGame } from '../../context/GameContext';

// Helper to get correct cover URL
const getCoverUrl = (coverImage) => {
    if (!coverImage) return 'https://placehold.co/48x48/1a1a2e/f59e0b?text=🎵';
    if (coverImage.startsWith('/') || coverImage.startsWith('http')) {
        return coverImage;
    }
    return `/covers/${coverImage}`;
};

function SongSelector() {
    const { songs, gameState, selectSong } = useGame();

    return (
        <div className="space-y-2">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                <Music size={16} className="text-christmas-gold" />
                Nummer Selectie
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {songs.map((song) => (
                    <motion.button
                        key={song.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectSong(song.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${gameState.currentSongId === song.id
                            ? 'bg-christmas-green/30 border-2 border-christmas-green'
                            : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                            }`}
                    >
                        <img
                            src={getCoverUrl(song.coverImage)}
                            alt={song.titleOriginal}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                                #{song.id} - {song.genre}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                                {song.titleOriginal}
                            </p>
                        </div>
                        {gameState.currentSongId === song.id && (
                            <Check size={20} className="text-christmas-green flex-shrink-0" />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

export default SongSelector;
