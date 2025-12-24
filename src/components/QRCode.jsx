import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

function QRCode({ size = 200, minimal = false }) {
    // Get the current host for the QR code URL
    const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
    const playPath = `${baseUrl}/play`;

    const playUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${playPath}`
        : playPath;

    // Minimal version - just the QR code without wrapper
    if (minimal) {
        return (
            <QRCodeSVG
                value={playUrl}
                size={size}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
                level="M"
                includeMargin={false}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 text-center"
        >
            <h3 className="text-gray-800 font-bold mb-4 flex items-center justify-center gap-2">
                📱 Scan om mee te doen
            </h3>

            <div className="bg-white rounded-xl p-4 inline-block">
                <QRCodeSVG
                    value={playUrl}
                    size={size}
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    level="M"
                    includeMargin={false}
                />
            </div>

            <p className="text-snow/60 text-sm mt-4">
                Of ga naar: <span className="text-christmas-gold font-mono">{playPath}</span>
            </p>
        </motion.div>
    );
}

export default QRCode;

