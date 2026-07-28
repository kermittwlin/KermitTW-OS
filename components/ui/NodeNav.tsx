"use client";

import React, { useState } from 'react';
import { moments, getMomentsByCategory } from '@/data/moments';
import { CATEGORIES, MomentCategory } from '@/types/moment';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface NodeNavProps {
  onNodeSelect: (nodeId: string) => void;
  activeNodeId?: string | null;
  isDark: boolean;
}

export default function NodeNav({ onNodeSelect, activeNodeId, isDark }: NodeNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MomentCategory | null>(null);

  const categories = Object.keys(CATEGORIES) as MomentCategory[];
  const filteredMoments = activeCategory ? getMomentsByCategory(activeCategory) : moments;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-3 transition-all duration-300 pointer-events-auto min-h-[44px] min-w-[44px] flex items-center justify-center ${
          isOpen ? 'right-[85vw] max-right-[280px]' : 'right-0'
        } ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/50' : 'bg-black/5 hover:bg-black/10 text-gray-600'}`}
        style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
      >
        {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[280px] z-40 pointer-events-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundColor: isDark ? 'rgba(8, 12, 28, 0.95)' : 'rgba(240, 244, 248, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className={isDark ? 'text-white/40' : 'text-gray-500'} />
              <span className={`text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                Navigator
              </span>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-2.5 py-1.5 rounded-full text-[10px] tracking-wider transition-all min-h-[32px] ${
                  activeCategory === null
                    ? 'bg-white/15 text-white'
                    : isDark ? 'text-white/30 hover:text-white/50' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ALL
              </button>
              {categories.filter(c => c !== 'identity').map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-2.5 py-1.5 rounded-full text-[10px] tracking-wider transition-all min-h-[32px] ${
                    activeCategory === cat
                      ? 'text-white'
                      : isDark ? 'text-white/30 hover:text-white/50' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={activeCategory === cat ? { backgroundColor: `${CATEGORIES[cat].color}40` } : {}}
                >
                  {CATEGORIES[cat].icon} {CATEGORIES[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Node list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1.5">
            {filteredMoments.map(moment => {
              const hasContent = moment.media || moment.id === 'ABOUT_ME';
              const isActive = activeNodeId === moment.id;
              return (
                <button
                  key={moment.id}
                  onClick={() => { onNodeSelect(moment.id); }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive ? 'ring-1' : 'hover:bg-white/5'
                  }`}
                  style={isActive ? {
                    backgroundColor: `${moment.color}12`,
                    borderColor: `${moment.color}30`,
                  } : {}}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: hasContent ? moment.color : 'transparent',
                        border: `1.5px solid ${hasContent ? moment.color : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                        boxShadow: hasContent ? `0 0 8px ${moment.color}60` : 'none',
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        {moment.title}
                      </div>
                      {moment.subtitle && (
                        <div className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                          {moment.subtitle}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${CATEGORIES[moment.category].color}15`,
                        color: CATEGORIES[moment.category].color,
                      }}
                    >
                      {CATEGORIES[moment.category].icon}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <div className={`text-[9px] tracking-wider text-center ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
              {moments.filter(m => m.media || m.id === 'ABOUT_ME').length} / {moments.length} MOMENTS EXPLORED
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
