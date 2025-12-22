import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function Soundboard() {
    const { playSFX } = useGame();

    const sfxButtons = [
        { id: 'correct', label: '✅ Goed!', color: 'bg-green-600 hover:bg-green-500' },
        { id: 'wrong', label: '❌ Fout!', color: 'bg-red-600 hover:bg-red-500' },
        { id: 'drumroll', label: '🥁 Drumroll', color: 'bg-purple-600 hover:bg-purple-500' },
        { id: 'applaus', label: '👏 Applaus', color: 'bg-blue-600 hover:bg-blue-500' },
    ];

    return (
        <div className="space-y-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Volume2 size={16} className="text-christmas-gold" />
                Soundboard
            </h3>

            <div className="grid grid-cols-2 gap-2">
                {sfxButtons.map((btn) => (
                    <motion.button
                        key={btn.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => playSFX(btn.id)}
                        className={`${btn.color} text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-95`}
                    >
                        {btn.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

export default Soundboard;
