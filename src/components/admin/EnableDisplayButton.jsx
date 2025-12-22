import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Volume2, Check } from 'lucide-react';
import { db } from '../../firebase';
import { ref, set } from 'firebase/database';

function EnableDisplayButton() {
    const [sent, setSent] = useState(false);

    const handleEnableDisplay = async () => {
        await set(ref(db, 'enableDisplayAudio'), {
            enabled: true,
            timestamp: Date.now()
        });
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleEnableDisplay}
            disabled={sent}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition-all ${sent
                    ? 'bg-christmas-green'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                }`}
        >
            {sent ? (
                <>
                    <Check size={20} />
                    <span>Signaal Verzonden!</span>
                </>
            ) : (
                <>
                    <Monitor size={20} />
                    <Volume2 size={16} />
                    <span>Activeer TV Audio</span>
                </>
            )}
        </motion.button>
    );
}

export default EnableDisplayButton;
