import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, Eye, EyeOff, Save, Check } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue, set } from 'firebase/database';

const DEFAULT_ACCESS_CODE = '5555';
const DEFAULT_ADMIN_PIN = '1230';

function AccessCodeSettings() {
    const [accessCode, setAccessCode] = useState(DEFAULT_ACCESS_CODE);
    const [adminPin, setAdminPin] = useState(DEFAULT_ADMIN_PIN);
    const [showAccessCode, setShowAccessCode] = useState(false);
    const [showAdminPin, setShowAdminPin] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Load codes from Firebase
    useEffect(() => {
        const codesRef = ref(db, 'accessCodes');
        const unsubscribe = onValue(codesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setAccessCode(data.accessCode || DEFAULT_ACCESS_CODE);
                setAdminPin(data.adminPin || DEFAULT_ADMIN_PIN);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        await set(ref(db, 'accessCodes'), {
            accessCode,
            adminPin
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleLogoutAll = () => {
        // This clears localStorage for all users on next visit
        // by changing the codes
        if (confirm('Dit zal alle gebruikers uitloggen. Doorgaan?')) {
            handleSave();
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50"
            >
                <div className="flex items-center gap-2">
                    <Lock size={16} className="text-christmas-gold" />
                    <span className="text-white font-medium text-sm">Toegangscodes</span>
                </div>
                <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-gray-400"
                >
                    ▼
                </motion.span>
            </button>

            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="p-4 pt-0 space-y-4"
                >
                    {/* General Access Code */}
                    <div>
                        <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Key size={12} />
                            Algemene Toegangscode
                        </label>
                        <div className="relative">
                            <input
                                type={showAccessCode ? 'text' : 'password'}
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm pr-10"
                                placeholder="Toegangscode..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowAccessCode(!showAccessCode)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showAccessCode ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Voor deelnemers en display</p>
                    </div>

                    {/* Admin PIN */}
                    <div>
                        <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Lock size={12} />
                            Admin PIN
                        </label>
                        <div className="relative">
                            <input
                                type={showAdminPin ? 'text' : 'password'}
                                value={adminPin}
                                onChange={(e) => setAdminPin(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm pr-10"
                                placeholder="Admin PIN..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowAdminPin(!showAdminPin)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showAdminPin ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Alleen voor de quizmaster</p>
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${saved
                                ? 'bg-green-600 text-white'
                                : 'bg-christmas-gold text-black hover:bg-christmas-gold-light'
                            }`}
                    >
                        {saved ? (
                            <>
                                <Check size={16} />
                                <span>Opgeslagen!</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Codes Opslaan</span>
                            </>
                        )}
                    </motion.button>

                    <p className="text-gray-500 text-xs text-center">
                        Wijzigingen gelden voor nieuwe bezoekers
                    </p>
                </motion.div>
            )}
        </div>
    );
}

export default AccessCodeSettings;
