import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Snowflake, Music, Settings, Users } from 'lucide-react';
import Snowfall from '../components/Snowfall';
import QRCode from '../components/QRCode';

function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-christmas-red-dark via-[#1a1a2e] to-christmas-green-dark relative overflow-hidden">
            <Snowfall />

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 text-christmas-gold/20 animate-float">
                    <Snowflake size={60} />
                </div>
                <div className="absolute top-40 right-20 text-christmas-gold/20 animate-float" style={{ animationDelay: '1s' }}>
                    <Music size={50} />
                </div>
                <div className="absolute bottom-40 left-20 text-christmas-gold/20 animate-float" style={{ animationDelay: '2s' }}>
                    <Snowflake size={40} />
                </div>
            </div>



            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-4">
                        🎵 Denglisch Covers
                    </h1>
                    <p className="text-xl md:text-2xl text-snow/70">
                        Raad de originele nummers!
                    </p>
                </motion.div>

                {/* Role Buttons */}
                <div className="grid md:grid-cols-3 gap-6 mb-12 w-full max-w-5xl">
                    {/* Display Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link to="/display">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full group flex flex-col items-center gap-4 px-8 py-8 bg-gradient-to-br from-christmas-red to-christmas-red-dark rounded-3xl shadow-2xl border-2 border-christmas-gold/30 hover:border-christmas-gold transition-all duration-300"
                            >
                                <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                                    <Monitor size={40} className="text-christmas-gold" />
                                </div>
                                <div className="text-center">
                                    <span className="text-xl font-bold text-white block">📺 Groot Scherm</span>
                                    <span className="text-snow/60 text-sm mt-1 block">Voor op de TV</span>
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Admin Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Link to="/admin">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full group flex flex-col items-center gap-4 px-8 py-8 bg-gradient-to-br from-christmas-green to-christmas-green-dark rounded-3xl shadow-2xl border-2 border-christmas-gold/30 hover:border-christmas-gold transition-all duration-300"
                            >
                                <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                                    <Smartphone size={40} className="text-christmas-gold" />
                                </div>
                                <div className="text-center">
                                    <span className="text-xl font-bold text-white block">📱 Showmaster</span>
                                    <span className="text-snow/60 text-sm mt-1 block">Bestuur de quiz</span>
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Play Button - NEW */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link to="/play">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full group flex flex-col items-center gap-4 px-8 py-8 bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl shadow-2xl border-2 border-christmas-gold/30 hover:border-christmas-gold transition-all duration-300"
                            >
                                <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                                    <Users size={40} className="text-christmas-gold" />
                                </div>
                                <div className="text-center">
                                    <span className="text-xl font-bold text-white block">🎯 Deelnemer</span>
                                    <span className="text-snow/60 text-sm mt-1 block">Speel mee als team</span>
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>

                {/* QR Code Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                >
                    <QRCode size={140} />
                </motion.div>



                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 text-snow/40 text-sm"
                >
                    ✨ Nederlandse hits in een nieuw jasje ✨
                </motion.p>
            </div>
        </div>
    );
}

export default Landing;
