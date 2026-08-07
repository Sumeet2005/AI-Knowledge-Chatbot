import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const LandingBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse coordinates motion values for interactive radial spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 120 };
  const lightX = useSpring(mouseX, springConfig);
  const lightY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Parallax scroll listener
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // High-Performance 2D Canvas Particle Connection Network (550 nodes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse on canvas for attraction/repulsion physics
    const mousePos = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Initialize particles
    const count = 780;
    const items: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        size: 0.6 + Math.random() * 1.5,
        alpha: 0.08 + Math.random() * 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const p = items[i];
        
        // Base drift velocity
        p.x += p.vx;
        p.y += p.vy;

        // Subtle mouse repulsion parallax
        const dx = p.x - mousePos.x;
        const dy = p.y - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (1 - dist / 150) * 0.08;
          p.x += dx * force;
          p.y += dy * force;
        }

        // Loop boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Render point node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < count; j++) {
          const p2 = items[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < 55) {
            const alphaLine = (1 - dist2 / 55) * 0.065;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alphaLine})`;
            ctx.lineWidth = 0.35;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none animate-fade-in"
    >
      {/* ==================================================
          LAYER 1: Animated Blueprint Grid
          ================================================== */}
      <div 
        style={{ 
          transform: `translate3d(0, ${scrollY * 0.12}px, 0)`,
          backgroundSize: '60px 60px',
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.038) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.038) 1px, transparent 1px)
          `
        }}
        className="absolute inset-0 w-full h-[150%] grid-move-slow opacity-100 pointer-events-none z-0"
      />

      {/* ==================================================
          LAYER 2: Huge Blueprint Engineering Schematic (Center right behind orb)
          ================================================== */}
      <div 
        style={{ transform: `translate3d(-50%, calc(-50% + ${scrollY * 0.06}px), 0)` }}
        className="absolute top-[30%] left-[75%] w-[1400px] h-[1400px] opacity-[0.09] dark:opacity-[0.082] z-10 select-none pointer-events-none flex items-center justify-center animate-spin-extremely-slow"
      >
        <svg className="w-full h-full text-slate-900 dark:text-cyan-400" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="500" cy="500" r="480" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 12" />
          <circle cx="500" cy="500" r="390" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="500" cy="500" r="310" stroke="currentColor" strokeWidth="0.8" strokeDasharray="16 6" />
          <circle cx="500" cy="500" r="230" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="500" cy="500" r="140" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 5" />
          <ellipse cx="500" cy="500" rx="480" ry="180" stroke="currentColor" strokeWidth="0.6" strokeDasharray="8 8" transform="rotate(-35 500 500)" />
          <ellipse cx="500" cy="500" rx="480" ry="180" stroke="currentColor" strokeWidth="0.6" strokeDasharray="8 8" transform="rotate(35 500 500)" />
          <ellipse cx="500" cy="500" rx="230" ry="80" stroke="currentColor" strokeWidth="0.5" transform="rotate(-15 500 500)" />
          <ellipse cx="500" cy="500" rx="230" ry="80" stroke="currentColor" strokeWidth="0.5" transform="rotate(15 500 500)" />
          <line x1="50" y1="500" x2="950" y2="500" stroke="currentColor" strokeWidth="0.8" />
          <line x1="500" y1="50" x2="500" y2="950" stroke="currentColor" strokeWidth="0.8" />
          <line x1="180" y1="180" x2="820" y2="820" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="820" y1="180" x2="180" y2="820" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* ==================================================
          LAYER 3: Secondary Overlay Schematic (Offset scaled blueprint)
          ================================================== */}
      <div 
        style={{ transform: `translate3d(-50%, calc(-50% + ${scrollY * 0.08}px), 0)` }}
        className="absolute top-[28%] left-[75%] w-[850px] h-[850px] opacity-[0.055] dark:opacity-[0.045] z-10 select-none pointer-events-none flex items-center justify-center animate-spin-extremely-slow-reverse"
      >
        <svg className="w-full h-full text-slate-800 dark:text-cyan-400" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="300" cy="300" r="200" stroke="currentColor" strokeWidth="0.6" />
          <ellipse cx="300" cy="300" rx="280" ry="110" stroke="currentColor" strokeWidth="0.5" transform="rotate(45 300 300)" />
          <ellipse cx="300" cy="300" rx="280" ry="110" stroke="currentColor" strokeWidth="0.5" transform="rotate(-45 300 300)" />
        </svg>
      </div>

      {/* ==================================================
          LAYER 4: High-Density Canvas Particles & Connection Lines
          ================================================== */}
      <canvas 
        ref={canvasRef} 
        style={{ transform: `translate3d(0, ${scrollY * 0.04}px, 0)` }}
        className="absolute inset-0 w-full h-[120%] z-10 pointer-events-none opacity-[0.85]" 
      />

      {/* ==================================================
          LAYER 5: Neural Network constellations
          ================================================== */}
      <div 
        style={{ transform: `translate3d(-50%, calc(-50% + ${scrollY * 0.05}px), 0)` }}
        className="absolute top-[32%] left-[75%] w-[1000px] h-[1000px] opacity-[0.022] dark:opacity-[0.015] z-10 flex items-center justify-center animate-spin-extremely-slow-reverse"
      >
        <svg className="w-full h-full text-slate-800 dark:text-cyan-400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 100 L200 50 L300 100 L350 200 L300 300 L200 350 L100 300 L50 200 Z" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
          <path d="M100 100 L200 200 L300 100 M200 50 L200 350 M50 200 L350 200 M100 300 L200 200 L300 300" stroke="currentColor" strokeWidth="0.4" />
          <circle cx="100" cy="100" r="2.5" fill="currentColor" />
          <circle cx="200" cy="50" r="2.5" fill="currentColor" />
          <circle cx="300" cy="100" r="2.5" fill="currentColor" />
          <circle cx="350" cy="200" r="2.5" fill="currentColor" />
          <circle cx="300" cy="300" r="2.5" fill="currentColor" />
          <circle cx="200" cy="350" r="2.5" fill="currentColor" />
          <circle cx="100" cy="300" r="2.5" fill="currentColor" />
          <circle cx="50" cy="200" r="2.5" fill="currentColor" />
          <circle cx="200" cy="200" r="3.5" fill="currentColor" />
        </svg>
      </div>

      {/* ==================================================
          LAYER 6: Ambient Glows & Mouse spotlight (breathing glows spread wide)
          ================================================== */}
      <div 
        style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0)` }}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >
        {/* Massive Cyan Volumetric Bloom behind the Orb core */}
        <div className="absolute top-[12%] left-[65%] w-[1200px] h-[1200px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/[0.065] blur-[190px] animate-glow-breath" />
        {/* Soft Cyan Bloom */}
        <div className="absolute top-[8%] left-[50%] w-[1000px] h-[1000px] rounded-full bg-cyan-500/12 dark:bg-cyan-500/[0.04] blur-[180px] animate-glow-breath" />
        {/* Deep Blue Glow */}
        <div className="absolute top-[18%] left-[20%] w-[850px] h-[850px] rounded-full bg-blue-500/8 dark:bg-blue-600/[0.022] blur-[160px] animate-glow-breath" />
        {/* Teal Haze */}
        <div className="absolute top-[30%] left-[58%] w-[750px] h-[750px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/[0.015] blur-[140px] animate-glow-breath" />
        {/* Soft White Bloom */}
        <div className="absolute top-[14%] left-[45%] w-[600px] h-[600px] rounded-full bg-white/6 dark:bg-white/[0.022] blur-[150px] animate-glow-breath" />
      </div>

      {/* Dynamic Cursor Spotlight (reactive hover light) */}
      <motion.div
        style={{ 
          left: lightX, 
          top: lightY,
          transform: 'translate3d(-50%, -50%, 0)'
        }}
        className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/[0.055] dark:bg-cyan-400/[0.022] blur-[120px] pointer-events-none z-20"
      />

      {/* Soft Vignette Screen Cover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.01)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.24)_100%)] pointer-events-none z-20" />
      
      {/* Film Grain Texture layer */}
      <div className="absolute inset-0 noise-bg opacity-[0.02] dark:opacity-[0.015] z-20 pointer-events-none" />

    </div>
  );
};

export default LandingBackground;
