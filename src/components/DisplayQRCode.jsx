import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import QRCode from './QRCode';

function DisplayQRCode() {
    const { gameState } = useGame();
    const showQRCode = gameState.showQRCode || false;

    return (
        <AnimatePresence>
            {showQRCode && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed top-6 right-6 z-50"
                >
                    <div className="glass rounded-2xl p-4 border-2 border-christmas-gold/50 shadow-2xl">
                        <QRCode size={180} showLabel={true} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default DisplayQRCode;
