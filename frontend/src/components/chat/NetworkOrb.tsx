import { motion } from 'framer-motion';

export const NetworkOrb = () => {
  return (
    <div className="relative w-72 h-72 flex items-center justify-center select-none pointer-events-none mb-6">
      
      {/* Layer 1: Layered breathing backdrop glows for depth and outer bloom */}
      <motion.div
        animate={{
          scale: [0.93, 1.07, 0.93],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-56 h-56 rounded-full bg-cyan-500/12 dark:bg-cyan-500/[0.04] blur-[55px] z-0"
      />
      
      <motion.div
        animate={{
          scale: [1.08, 0.92, 1.08],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-44 h-44 rounded-full bg-purple-500/8 dark:bg-purple-500/[0.02] blur-[45px] z-0"
      />

      {/* Layer 2: Ultra soft white central reflection bloom */}
      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-28 h-28 rounded-full bg-white/20 dark:bg-white/[0.04] blur-[30px] z-0 mix-blend-overlay"
      />

      {/* Layer 3: Glass Donut & Constellation Vector Canvas */}
      <motion.svg 
        animate={{
          y: [-3, 3, -3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-full h-full z-10 filter drop-shadow-[0_8px_24px_rgba(6,182,212,0.15)] dark:drop-shadow-[0_12px_36px_rgba(0,0,0,0.5)]" 
        viewBox="0 0 240 240" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyan Glow filter */}
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Purple Glow filter */}
          <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Core donut glass gradient (Light mode) */}
          <radialGradient id="donut-glass" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#e2e8f0" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.8" />
          </radialGradient>

          {/* Core donut glass gradient (Dark mode) */}
          <radialGradient id="donut-glass-dark" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="25%" stopColor="#1e293b" stopOpacity="0.2" />
            <stop offset="65%" stopColor="#0f172a" stopOpacity="0.75" />
            <stop offset="90%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.75" />
          </radialGradient>
        </defs>

        {/* 1. RADIAL SPOKES (faint guides connecting donut center to orbit tracks) */}
        <g stroke="currentColor" className="text-cyan-500/10 dark:text-cyan-400/[0.06]" strokeWidth="0.6">
          <line x1="120" y1="120" x2="120" y2="15" />
          <line x1="120" y1="120" x2="120" y2="225" />
          <line x1="120" y1="120" x2="15" y2="120" />
          <line x1="120" y1="120" x2="225" y2="120" />
          
          <line x1="120" y1="120" x2="46" y2="46" />
          <line x1="120" y1="120" x2="194" y2="194" />
          <line x1="120" y1="120" x2="194" y2="46" />
          <line x1="120" y1="120" x2="46" y2="194" />
        </g>

        {/* 2. CONCENTRIC ORBIT RINGS (Slow, anti-aliased rotating lines) */}
        
        {/* Orbit Track 1 (r = 50, fast) */}
        <motion.circle
          cx="120"
          cy="120"
          r="50"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800/40"
          strokeWidth="0.8"
          strokeDasharray="4 6"
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
        />

        {/* Orbit Track 2 (r = 78, medium-slow counter-rotate) */}
        <motion.circle
          cx="120"
          cy="120"
          r="78"
          stroke="currentColor"
          className="text-slate-200/80 dark:text-slate-800/25"
          strokeWidth="1.2"
          strokeDasharray="12 8"
          animate={{ rotate: -360 }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
        />

        {/* Orbit Track 3 (r = 100, slow) */}
        <motion.circle
          cx="120"
          cy="120"
          r="100"
          stroke="currentColor"
          className="text-slate-100/50 dark:text-slate-850/15"
          strokeWidth="0.6"
          strokeDasharray="2 10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
        />

        {/* Orbit Track 4 (r = 114, thick glass ring style outer boundary) */}
        <motion.circle
          cx="120"
          cy="120"
          r="114"
          stroke="currentColor"
          className="text-slate-200/30 dark:text-slate-800/10"
          strokeWidth="1.5"
          strokeDasharray="30 15"
          animate={{ rotate: -180 }}
          transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
        />

        {/* 3. CONSTELLATION NETWORK LINES (Inter-connecting particles dynamically) */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
          className="opacity-40 dark:opacity-25"
          stroke="#06b6d4"
          strokeWidth="0.5"
        >
          {/* Inner mesh connections */}
          <line x1="120" y1="70" x2="70" y2="120" />
          <line x1="70" y1="120" x2="120" y2="170" />
          <line x1="120" y1="170" x2="170" y2="120" />
          <line x1="170" y1="120" x2="120" y2="70" />

          {/* Outer diagonal connections */}
          <line x1="120" y1="70" x2="185" y2="60" />
          <line x1="170" y1="120" x2="185" y2="60" />
          <line x1="70" y1="120" x2="55" y2="185" />
          <line x1="120" y1="170" x2="55" y2="185" />
        </motion.g>

        {/* 4. NETWORK NODES & ACCENT PARTICLES (Cyan stars & Purple accents) */}
        
        {/* Track 1 Particles (Inner system) */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
        >
          <circle cx="120" cy="70" r="3.5" fill="#06b6d4" filter="url(#glow-cyan)" />
          <circle cx="120" cy="170" r="3" fill="#10b981" />
          <circle cx="70" cy="120" r="2.5" fill="#0891b2" />
          <circle cx="170" cy="120" r="2.5" fill="#06b6d4" />
        </motion.g>

        {/* Track 2 Particles (Middle system with purple accent) */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
        >
          <circle cx="120" cy="42" r="4.5" fill="#06b6d4" filter="url(#glow-cyan)" />
          <circle cx="120" cy="198" r="3" fill="#10b981" />
          <circle cx="185" cy="60" r="4" fill="#a855f7" filter="url(#glow-purple)" /> {/* Purple Accent 1 */}
          <circle cx="55" cy="180" r="3" fill="#06b6d4" />
          <circle cx="180" cy="170" r="2" fill="#94a3b8" />
          <circle cx="60" cy="70" r="2" fill="#0891b2" />
        </motion.g>

        {/* Track 3 Particles (Outer system with size variations and second purple accent) */}
        <motion.g
          animate={{ rotate: 180 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ originX: '120px', originY: '120px' }}
        >
          <circle cx="120" cy="20" r="5" fill="#06b6d4" filter="url(#glow-cyan)" /> {/* Large star */}
          <circle cx="120" cy="220" r="3.5" fill="#a855f7" filter="url(#glow-purple)" /> {/* Purple Accent 2 */}
          <circle cx="220" cy="120" r="3" fill="#10b981" />
          <circle cx="20" cy="120" r="2.5" fill="#06b6d4" />
          <circle cx="190" cy="50" r="2.5" fill="#94a3b8" />
          <circle cx="50" cy="190" r="2" fill="#06b6d4" />
        </motion.g>

        {/* 5. CENTER GLASS DONUT CORE */}
        <motion.g
          animate={{
            scale: [0.97, 1.03, 0.97],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glass donut outer border glow bloom */}
          <circle cx="120" cy="120" r="27" stroke="#06b6d4" strokeWidth="2.5" strokeOpacity="0.4" filter="url(#glow-cyan)" />

          {/* Thick Glass Donut surface layer (radial gradient fill) */}
          <circle cx="120" cy="120" r="27" fill="url(#donut-glass)" className="dark:hidden" />
          <circle cx="120" cy="120" r="27" fill="url(#donut-glass-dark)" className="hidden dark:block" />

          {/* Hairline glossy edge reflection highlight */}
          <circle cx="120" cy="120" r="26.5" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.45" />

          {/* Dark Inner core (creates the physical donut hole/aperture) */}
          <circle cx="120" cy="120" r="13" fill="#ffffff" className="dark:fill-[#08090d] fill-[#fafbfc]" />

          {/* Donut hole inner shadow outline */}
          <circle cx="120" cy="120" r="13" stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/80" strokeWidth="1.5" />
          <circle cx="120" cy="120" r="12.5" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.5" />
        </motion.g>

      </motion.svg>
    </div>
  );
};
export default NetworkOrb;
