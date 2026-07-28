"use client";

import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'init' | 'loading' | 'done'>('init');

  useEffect(() => {
    // Start loading after a brief pause
    const startTimer = setTimeout(() => setPhase('loading'), 300);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 12 + 3;
        if (next >= 100) {
          clearInterval(interval);
          setPhase('done');
          setTimeout(onComplete, 600);
          return 100;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-500 ${
        phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* K symbol */}
      <div className="relative mb-8">
        <svg width="80" height="80" viewBox="0 0 80 80" className="animate-pulse">
          {/* Diamond frame */}
          <polygon
            points="40,5 75,40 40,75 5,40"
            fill="none"
            stroke="rgba(96, 165, 250, 0.3)"
            strokeWidth="1"
          />
          <polygon
            points="40,15 65,40 40,65 15,40"
            fill="none"
            stroke="rgba(96, 165, 250, 0.2)"
            strokeWidth="0.5"
          />
          {/* K letter */}
          <line x1="28" y1="22" x2="28" y2="58" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="40" x2="52" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="40" x2="52" y2="58" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-white/80 text-lg tracking-[0.3em] font-light mb-2">
        KERMIT<span className="text-xs align-top ml-1 text-white/40">OS</span>
      </h1>
      <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase mb-8">
        Digital Identity Universe
      </p>

      {/* Progress bar */}
      <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/60 to-blue-400/40 transition-all duration-200"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Status text */}
      <p className="text-white/15 text-[9px] tracking-[0.15em] mt-4 font-mono">
        {progress < 30 ? 'INITIALIZING SYSTEMS...' :
         progress < 60 ? 'LOADING MOMENTS...' :
         progress < 90 ? 'PREPARING UNIVERSE...' :
         'SYSTEM READY'}
      </p>
    </div>
  );
}
