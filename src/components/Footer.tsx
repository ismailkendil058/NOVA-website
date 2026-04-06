import { MapPin, Phone, Clock, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer className="bg-secondary/10 pt-16 pb-20 px-6 mt-12 border-t border-primary/5">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-12 text-center">

                {/* Brand & Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8 flex flex-col items-center"
                >
                    <div className="flex flex-col items-center">
                        <h2 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            NOVA DECO
                        </h2>
                        <p className="text-sm text-primary/60 font-medium tracking-[0.2em] uppercase mt-2">
                            MODERN INTERIORS
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
                        <div className="flex items-center justify-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-tight">Ouled Hedadj</p>
                                <p className="text-xs text-muted-foreground font-medium">Boumerdès, Algeria</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <a href="tel:0556732499" className="text-sm font-bold hover:text-primary transition-colors block" dir="ltr">
                                    0556 73 24 99
                                </a>
                                <p className="text-xs text-muted-foreground font-medium">Direct Line</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-tight">08:00 - 17:30</p>
                                <p className="text-xs text-muted-foreground font-medium">Sat - Thu</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Simplified Map Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-full max-w-2xl group"
                >
                    <div className="h-[250px] rounded-3xl overflow-hidden shadow-sm border border-primary/10 bg-muted">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.0000!2d3.336214!3d36.7152759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128e5b0021a85a4f%3A0xe2a2f0d7c3c28356!2sNova%20Deco!5e0!3m2!1sfr!2sdz!4v1714571234567!5m2!1sfr!2sdz"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full transition-all duration-700 hover:opacity-90"
                        ></iframe>
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Connect with us</p>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://wa.me/213556732499"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#25D366] text-white hover:shadow-lg transition-all duration-300"
                        >
                            <MessageCircle className="w-5 h-5 fill-white" />
                            <span className="text-sm font-bold">Contact us on WhatsApp</span>
                        </motion.a>
                    </div>
                </motion.div>
            </div>

            <div className="mt-16 pt-8 border-t border-primary/5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                    © {new Date().getFullYear()} NOVA DECO · ALL RIGHTS RESERVED
                </p>
            </div>
        </footer>
    );
};

export default Footer;
