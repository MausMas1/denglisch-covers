import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const DEFAULT_ACCESS_CODE = '5555';
const DEFAULT_ADMIN_PIN = '1230';
const AUTH_VERSION = 'v3'; // Change this to invalidate all sessions

function AccessGate({ children, requireAdmin = false }) {
    const PLAYER_KEY = `xmas-access-${AUTH_VERSION}`;
    const ADMIN_KEY = `xmas-admin-${AUTH_VERSION}`;

    // Check localStorage synchronously to determine initial unlock state
    const checkUnlockState = () => {
        if (requireAdmin) {
            return localStorage.getItem(ADMIN_KEY) === 'true';
        } else {
            return localStorage.getItem(PLAYER_KEY) === 'true' || localStorage.getItem(ADMIN_KEY) === 'true';
        }
    };

    const [accessCode, setAccessCode] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(checkUnlockState);
    const [error, setError] = useState('');
    const [correctCodes, setCorrectCodes] = useState({
        accessCode: DEFAULT_ACCESS_CODE,
        adminPin: DEFAULT_ADMIN_PIN
    });

    // Re-check unlock state when requireAdmin prop changes (navigation between routes)
    useEffect(() => {
        const shouldBeUnlocked = checkUnlockState();
        setIsUnlocked(shouldBeUnlocked);
    }, [requireAdmin]);

    // Listen to codes from Firebase
    useEffect(() => {
        const codesRef = ref(db, 'accessCodes');
        const unsubscribe = onValue(codesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCorrectCodes({
                    accessCode: data.accessCode || DEFAULT_ACCESS_CODE,
                    adminPin: data.adminPin || DEFAULT_ADMIN_PIN
                });
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (requireAdmin) {
            // Admin page: ONLY accept admin PIN
            if (accessCode === correctCodes.adminPin) {
                setIsUnlocked(true);
                localStorage.setItem(ADMIN_KEY, 'true');
            } else {
                setError('Onjuiste admin PIN');
                setAccessCode('');
            }
        } else {
            // Player pages: accept player code (or admin pin as bonus)
            if (accessCode === correctCodes.accessCode || accessCode === correctCodes.adminPin) {
                setIsUnlocked(true);
                localStorage.setItem(PLAYER_KEY, 'true');
                if (accessCode === correctCodes.adminPin) {
                    localStorage.setItem(ADMIN_KEY, 'true');
                }
            } else {
                setError('Onjuiste code');
                setAccessCode('');
            }
        }
    };

    if (isUnlocked) {
        return children;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-christmas-red-dark via-[#1a1a2e] to-christmas-green-dark flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-8 max-w-sm w-full text-center border border-christmas-gold/30"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-6"
                >
                    {requireAdmin ? '🔐' : '🔒'}
                </motion.div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    {requireAdmin ? 'Admin Toegang' : 'Toegangscode'}
                </h1>
                <p className="text-snow/60 mb-6">
                    {requireAdmin
                        ? 'Voer de admin PIN in om door te gaan'
                        : 'Voer de toegangscode in om mee te doen'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-christmas-gold" size={20} />
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder={requireAdmin ? 'Admin PIN...' : 'Code...'}
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-christmas-gold"
                            maxLength={10}
                            autoFocus
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-2 text-red-400 text-sm"
                            >
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!accessCode}
                        className="w-full bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Lock size={20} />
                        <span>Ontgrendel</span>
                    </motion.button>
                </form>

                <p className="text-snow/40 text-xs mt-6">
                    {requireAdmin
                        ? 'Alleen voor de quizmaster'
                        : 'Vraag de code aan de quizmaster'}
                </p>
            </motion.div>
        </div>
    );
}

export default AccessGate;
