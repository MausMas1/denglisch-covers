import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';

function SongCard() {
    const { currentSong } = useGame();

    if (!currentSong) return null;

    // Get correct cover URL
    const getCoverUrl = () => {
        if (!currentSong.coverImage) return 'https://placehold.co/80x80/1a1a2e/f59e0b?text=🎵';
        if (currentSong.coverImage.startsWith('/') || currentSong.coverImage.startsWith('http')) {
            return currentSong.coverImage;
        }
        return `/covers/${currentSong.coverImage}`;
    };

    return (
        <motion.div
            layout
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700"
        >
            <div className="flex items-center gap-4">
                <img
                    src={getCoverUrl()}
                    alt={currentSong.titleOriginal}
                    className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg truncate">
                        {currentSong.titleOriginal}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                        {currentSong.artistOriginal}
                    </p>
                    <div className="mt-2">
                        <span className="inline-block bg-christmas-gold/20 text-christmas-gold text-xs px-2 py-1 rounded-full">
                            {currentSong.genre}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default SongCard;

