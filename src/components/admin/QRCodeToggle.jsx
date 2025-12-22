import { motion } from 'framer-motion';
import { QrCode, Eye, EyeOff } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function QRCodeToggle() {
    const { gameState, updateGameState } = useGame();
    const showQRCode = gameState.showQRCode || false;

    const toggleQRCode = () => {
        updateGameState({ showQRCode: !showQRCode });
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleQRCode}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${showQRCode
                    ? 'bg-christmas-gold text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
        >
            <QrCode size={18} />
            <span>{showQRCode ? 'QR Verbergen' : 'QR Tonen'}</span>
            {showQRCode ? <EyeOff size={16} /> : <Eye size={16} />}
        </motion.button>
    );
}

export default QRCodeToggle;
