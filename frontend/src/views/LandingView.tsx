import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { PipelineSection } from '../components/landing/PipelineSection';
import { WorkspaceMockup } from '../components/landing/WorkspaceMockup';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { Architecture } from '../components/landing/Architecture';
import { TechStack } from '../components/landing/TechStack';
import { PerformanceDashboard } from '../components/landing/PerformanceDashboard';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingBackground } from '../components/landing/LandingBackground';

export const LandingView = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Lenis Smooth Scroll only when Landing Page mounts (isolated from Workspace)
  useEffect(() => {
    if (!scrollRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: scrollRef.current,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="relative w-screen h-screen overflow-y-auto overflow-x-hidden bg-workspace-bg-light dark:bg-workspace-bg-dark text-slate-900 dark:text-white transition-colors duration-300 font-sans"
    >
      {/* 6-Layer Interactive Enterprise RAG Background */}
      <LandingBackground />

      {/* Landing Content Canvas */}
      <div className="relative w-full z-10 flex flex-col min-h-screen">
        {/* Sticky Glass Navbar */}
        <LandingNavbar />

        {/* Fullscreen Hero Section */}
        <HeroSection />

        {/* Interactive AI Pipeline Section */}
        <PipelineSection />

        {/* Live Workspace Showcase Section */}
        <WorkspaceMockup />

        {/* Product Features & Why Atlas Section */}
        <FeaturesSection />

        {/* Enterprise AI Architecture Section */}
        <Architecture />

        {/* Technology Stack Grid Section */}
        <TechStack />

        {/* Performance & Capabilities Section */}
        <PerformanceDashboard />

        {/* Premium CTA & Footer Section */}
        <LandingFooter />
      </div>

    </div>
  );
};

export default LandingView;
