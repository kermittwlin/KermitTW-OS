"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export type Theme = 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large';
export type PanelPosition = 'left' | 'right';

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  panelPosition: PanelPosition;
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        setIsHidden(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      if (isOpen) {
        gsap.fromTo(panelRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
        );
      } else {
        gsap.to(panelRef.current,
          { opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: "power2.in" }
        );
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (buttonRef.current && isHidden) {
      gsap.fromTo(buttonRef.current,
        { scale: 1.3 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" }
      );
    }
  }, [isHidden]);

  const update = (key: keyof Settings, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const panelBg = isDark ? 'rgba(8, 12, 28, 0.95)' : 'rgba(240, 244, 248, 0.95)';
  const panelBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const mutedColor = isDark ? 'text-white/50' : 'text-gray-500';
  const btnActiveBg = isDark ? 'bg-white/15' : 'bg-black/15';
  const btnInactiveBg = isDark ? 'bg-white/5' : 'bg-black/5';
  const btnHoverBg = isDark ? 'hover:bg-white/10' : 'hover:bg-black/10';

  if (isHidden) {
    return (
      <button
        ref={buttonRef}
        onClick={() => setIsHidden(false)}
        className={`fixed bottom-6 left-6 z-[60] w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer ${
          isDark
            ? 'bg-white/15 border-white/25 text-white/70 hover:text-white/90 hover:bg-white/25'
            : 'bg-black/15 border-black/25 text-gray-600 hover:text-gray-900 hover:bg-black/25'
        }`}
        title="顯示設定"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-[60]">
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute bottom-14 left-0 w-64 rounded-xl overflow-hidden pointer-events-auto z-[60]"
          style={{
            backgroundColor: panelBg,
            border: `1px solid ${panelBorder}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <h3 className={`${textColor} text-xs font-medium tracking-wider`}>設定</h3>
          </div>

          {/* Theme */}
          <div className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
            <label className={`${mutedColor} text-[10px] uppercase tracking-wider block mb-2`}>主題</label>
            <div className="flex gap-1.5">
              {(['dark', 'light'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => update('theme', t)}
                  className={`flex-1 px-2 py-2.5 rounded text-[10px] transition-all cursor-pointer min-h-[44px] ${
                    settings.theme === t
                      ? `${btnActiveBg} ${textColor} border ${isDark ? 'border-white/20' : 'border-black/20'}`
                      : `${btnInactiveBg} ${mutedColor} border border-transparent ${btnHoverBg}`
                  }`}
                >
                  {t === 'dark' ? '深色' : '亮色'}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
            <label className={`${mutedColor} text-[10px] uppercase tracking-wider block mb-2`}>字體大小</label>
            <div className="flex gap-1.5">
              {(['small', 'medium', 'large'] as FontSize[]).map(s => (
                <button
                  key={s}
                  onClick={() => update('fontSize', s)}
                  className={`flex-1 px-2 py-2.5 rounded text-[10px] transition-all cursor-pointer min-h-[44px] ${
                    settings.fontSize === s
                      ? `${btnActiveBg} ${textColor} border ${isDark ? 'border-white/20' : 'border-black/20'}`
                      : `${btnInactiveBg} ${mutedColor} border border-transparent ${btnHoverBg}`
                  }`}
                >
                  {s === 'small' ? '小' : s === 'medium' ? '中' : '大'}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Position */}
          <div className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
            <label className={`${mutedColor} text-[10px] uppercase tracking-wider block mb-2`}>面板位置</label>
            <div className="flex gap-1.5">
              {(['left', 'right'] as PanelPosition[]).map(p => (
                <button
                  key={p}
                  onClick={() => update('panelPosition', p)}
                  className={`flex-1 px-2 py-2.5 rounded text-[10px] transition-all cursor-pointer min-h-[44px] ${
                    settings.panelPosition === p
                      ? `${btnActiveBg} ${textColor} border ${isDark ? 'border-white/20' : 'border-black/20'}`
                      : `${btnInactiveBg} ${mutedColor} border border-transparent ${btnHoverBg}`
                  }`}
                >
                  {p === 'left' ? '左側' : '右側'}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3">
            <button
              onClick={() => setIsHidden(true)}
              className={`w-full px-3 py-2.5 rounded-lg border text-[10px] transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px] ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                  : 'bg-black/5 border-black/10 text-gray-500 hover:bg-black/10 hover:text-gray-700'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              隱藏設定
              <span className={`${isDark ? 'text-white/20' : 'text-gray-400'} ml-1 hidden sm:inline`}>Ctrl + .</span>
            </button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? isDark ? 'bg-white/20 border-white/30 text-white/90' : 'bg-black/20 border-black/30 text-gray-800'
            : isDark ? 'bg-white/15 border-white/25 text-white/70 hover:text-white/90 hover:bg-white/25' : 'bg-black/15 border-black/25 text-gray-600 hover:text-gray-900 hover:bg-black/25'
        }`}
        title="設定"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}
