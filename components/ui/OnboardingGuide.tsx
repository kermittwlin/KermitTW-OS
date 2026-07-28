"use client";

import React, { useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const guideRef = React.useRef<HTMLDivElement>(null);
  const arrowRef = React.useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    if (guideRef.current) {
      gsap.to(guideRef.current, {
        opacity: 0, y: -10, duration: 0.5, ease: "power2.in",
        onComplete: () => {
          setDismissed(true);
          setVisible(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissed) setVisible(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [dismissed]);

  useEffect(() => {
    if (visible && guideRef.current) {
      gsap.fromTo(guideRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      if (arrowRef.current) {
        gsap.to(arrowRef.current, {
          y: -8, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1
        });
      }
      const autoHide = setTimeout(() => handleDismiss(), 8000);
      return () => clearTimeout(autoHide);
    }
  }, [visible, handleDismiss]);

  if (!visible || dismissed) return null;

  return (
    <div
      ref={guideRef}
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto cursor-pointer"
      style={{ opacity: 0 }}
      onClick={handleDismiss}
    >
      <div className="relative pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <div
          className="px-8 py-6 rounded-2xl backdrop-blur-xl max-w-sm text-center"
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 40px rgba(96, 165, 250, 0.1)',
          }}
        >
          <div ref={arrowRef} className="mb-3">
            <svg width="32" height="32" viewBox="0 0 32 32" className="mx-auto">
              <path
                d="M8 8 L16 20 L14 20 L14 26 L20 26 L20 20 L18 20 Z"
                fill="rgba(96, 165, 250, 0.6)"
                transform="rotate(30, 16, 16)"
              />
            </svg>
          </div>

          <h3 className="text-white text-sm font-medium tracking-wider mb-2">
            WELCOME TO KERMIT OS
          </h3>
          <p className="text-white/50 text-xs leading-relaxed mb-4">
            這是 Kermit 的知識宇宙。每個節點代表一個探索領域。
          </p>

          <div className="flex flex-col gap-2 text-left mb-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
              <span className="text-white/60">點擊<span className="text-white/90">藍色節點</span> → AI 實驗室</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />
              <span className="text-white/60">點擊<span className="text-white/90">紫色節點</span> → Web3 世界</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#f472b6]" />
              <span className="text-white/60">點擊<span className="text-white/90">粉色節點</span> → 知識檔案</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#fbbf24]" />
              <span className="text-white/60">點擊<span className="text-white/90">金色節點</span> → 探索者</span>
            </div>
          </div>

          <p className="text-white/30 text-[10px] mb-3">
            <span className="hidden sm:inline">拖曳旋轉視角 · 滾輪縮放 · 點擊中央回到原點</span>
            <span className="sm:hidden">拖曳旋轉 · 雙指縮放 · 點擊節點探索</span>
          </p>

          <button
            onClick={handleDismiss}
            className="px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase rounded-full transition-all hover:bg-white/10 min-h-[44px]"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
          >
            開始探索
          </button>
        </div>
      </div>
    </div>
  );
}
