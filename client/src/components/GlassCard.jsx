import { motion } from 'framer-motion';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function GlassCard({ children, className }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("glass-panel rounded-[2.5rem] p-8 relative z-10 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]", className)}
    >
      {children}
    </motion.div>
  );
}