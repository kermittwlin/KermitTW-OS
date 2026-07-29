"use client";

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Scene from '@/components/canvas/Scene';
import ContentPanel from '@/components/ui/ContentPanel';
import OnboardingGuide from '@/components/ui/OnboardingGuide';
import SettingsPanel, { Settings } from '@/components/ui/SettingsPanel';
import NodeNav from '@/components/ui/NodeNav';
import Lightbox from '@/components/ui/Lightbox';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getMomentById } from '@/data/moments';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("UNIVERSAL_ORIGIN");
  const [uiVisible, setUiVisible] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    fontSize: 'medium',
    panelPosition: 'left',
  });
  const [lightbox, setLightbox] = useState<{ src: string; alt?: string } | null>(null);
  const flyToRef = useRef<((pos: [number, number, number], id: string) => void) | null>(null);
  const isTouchDevice = useIsTouchDevice();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
    setTimeout(() => setUiVisible(true), 500);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setActivePanel(nodeId);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setTimeout(() => setActivePanel(null), 300);
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    const moment = getMomentById(nodeId);
    if (moment && flyToRef.current) {
      flyToRef.current(moment.position, nodeId);
    }
  }, []);

  const handleImageClick = useCallback((src: string, alt?: string) => {
    setLightbox({ src, alt });
  }, []);

  const registerFlyTo = useCallback((fn: (pos: [number, number, number], id: string) => void) => {
    flyToRef.current = fn;
  }, []);

  if (!mounted) return <div className="h-screen w-full bg-[#020617]" />;

  const activeMoment = activePanel ? getMomentById(activePanel) : null;
  const isDark = settings.theme === 'dark';

  return (
    <main className={`h-screen w-full relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f0f4f8]'}`}>
      {/* UI Overlay */}
      <div className={`absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-8 transition-opacity duration-1000 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between items-start">
          <div className={isDark ? 'text-white' : 'text-gray-800'}>
            <h1 className="text-xl sm:text-2xl font-light tracking-widest opacity-80">KERMIT <span className="text-xs align-top">OS</span></h1>
            <p className="text-[10px] uppercase tracking-tighter opacity-40">Living Knowledge System v0.9</p>
          </div>
          <div className={`text-right opacity-40 text-[10px] font-mono ${isDark ? 'text-white' : 'text-gray-800'}`}>
            STATUS: SYSTEM_STABLE<br/>
            LOC: {location}
          </div>
        </div>
        <div className="flex justify-center mb-4 sm:mb-8">
          <div className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border backdrop-blur-md text-[10px] sm:text-xs tracking-wider pointer-events-auto cursor-default flex items-center gap-2 sm:gap-3 ${
            isDark
              ? 'border-white/15 bg-white/5 text-white/50'
              : 'border-black/10 bg-black/5 text-gray-600'
          }`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse" />
            <span className="hidden sm:inline">點擊發光節點探索各個領域</span>
            <span className="sm:hidden">點擊節點探索</span>
            <span className={isDark ? 'text-white/20' : 'text-black/20'}>|</span>
            <span className="text-[10px]">
              <span className="hidden sm:inline">拖曳旋轉 · 滾輪縮放</span>
              <span className="sm:hidden">拖曳旋轉 · 滑動縮放</span>
            </span>
          </div>
        </div>
      </div>

      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }} style={{ background: isDark ? '#020617' : '#f0f4f8' }} frameloop="always">
        <color attach="background" args={[isDark ? '#020617' : '#f0f4f8']} />
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 12]} 
          fov={50} 
        />
        <OrbitControls 
          enablePan={false} 
          enableDamping 
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={2} 
          maxDistance={20} 
          autoRotate 
          autoRotateSpeed={0.3}
        />
        <Suspense fallback={null}>
          <Scene 
            onLocationChange={setLocation}
            onNodeClick={handleNodeClick}
            onRegisterFlyTo={registerFlyTo}
            isTouchDevice={isTouchDevice}
            isDark={isDark}
            fontSize={settings.fontSize}
          />
        </Suspense>
      </Canvas>

      {/* Onboarding Guide */}
      <OnboardingGuide />

      {/* Settings Panel */}
      <SettingsPanel settings={settings} onSettingsChange={setSettings} />

      {/* Navigation Sidebar */}
      <NodeNav
        onNodeSelect={handleNodeSelect}
        activeNodeId={activePanel}
        isDark={isDark}
        panelOpen={panelOpen}
      />

      {/* Content Panel */}
      {activeMoment && (
        <ContentPanel
          key={`${activeMoment.id}-${settings.panelPosition}`}
          isOpen={panelOpen}
          onClose={closePanel}
          title={activeMoment.title}
          subtitle={activeMoment.subtitle}
          content={activeMoment.description}
          color={activeMoment.color}
          date={activeMoment.date}
          media={activeMoment.media}
          tags={activeMoment.tags}
          panelPosition={settings.panelPosition}
          fontSize={settings.fontSize}
          isDark={isDark}
          onImageClick={handleImageClick}
        />
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={!!lightbox}
        onClose={() => setLightbox(null)}
        src={lightbox?.src || ''}
        alt={lightbox?.alt}
      />

      {/* Loading Screen */}
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
    </main>
  );
}
