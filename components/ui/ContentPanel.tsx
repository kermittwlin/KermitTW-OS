"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MomentMedia } from '@/types/moment';

interface ContentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content: string;
  color: string;
  date?: string;
  media?: MomentMedia;
  tags?: string[];
  panelPosition?: 'left' | 'right';
  fontSize?: 'small' | 'medium' | 'large';
  onImageClick?: (src: string, alt?: string) => void;
}

const fontSizeMap = {
  small: { fontSize: '11px', lineHeight: '1.4' },
  medium: { fontSize: '13px', lineHeight: '1.6' },
  large: { fontSize: '15px', lineHeight: '1.7' },
};

function MediaEmbed({ media, color, onImageClick }: { media: MomentMedia; color: string; onImageClick?: (src: string, alt?: string) => void }) {
  if (media.type === 'youtube' && media.id) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', border: `1px solid ${color}20` }}>
        <iframe
          src={`https://www.youtube.com/embed/${media.id}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube embed"
        />
      </div>
    );
  }

  if (media.type === 'vimeo' && media.id) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', border: `1px solid ${color}20` }}>
        <iframe
          src={`https://player.vimeo.com/video/${media.id}?badge=0&autopause=0&player_id=0`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo embed"
        />
      </div>
    );
  }

  if (media.type === 'soundcloud' && media.url) {
    return (
      <div className="w-full rounded-lg overflow-hidden" style={{ border: `1px solid ${color}20` }}>
        <iframe
          width="100%"
          height="300"
          scrolling="no"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(media.url)}&color=${color.replace('#', '%23')}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
          className="border-0"
          title="SoundCloud embed"
        />
      </div>
    );
  }

  if (media.type === 'image' && media.src) {
    return (
      <div
        className="relative w-full rounded-lg overflow-hidden cursor-pointer group"
        style={{ border: `1px solid ${color}20` }}
        onClick={() => onImageClick?.(media.src!, media.caption)}
      >
        <img
          src={media.src}
          alt={media.caption || 'Image'}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {media.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white/70 text-[10px]">
            {media.caption}
          </div>
        )}
      </div>
    );
  }

  if (media.type === 'audio' && media.src) {
    return (
      <div className="w-full rounded-lg p-4" style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}>
        <audio controls className="w-full" style={{ filter: `hue-rotate(0deg)` }}>
          <source src={media.src} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return null;
}

export default function ContentPanel({ isOpen, onClose, title, subtitle, content, color, date, media, tags, panelPosition = 'right', fontSize = 'medium', onImageClick }: ContentPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      if (isOpen) {
        const xFrom = panelPosition === 'left' ? -40 : 40;
        gsap.fromTo(panelRef.current,
          { opacity: 0, x: xFrom, scale: 0.96 },
          { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "power3.out" }
        );
        if (contentRef.current) {
          gsap.fromTo(contentRef.current.children,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: "power2.out" }
          );
        }
      } else {
        const xTo = panelPosition === 'left' ? -40 : 40;
        gsap.to(panelRef.current,
          { opacity: 0, x: xTo, scale: 0.96, duration: 0.35, ease: "power2.in" }
        );
      }
    }
  }, [isOpen, panelPosition]);

  if (!isOpen) return null;

  const isLeft = panelPosition === 'left';

  return (
    <div className={`fixed inset-0 z-40 flex items-end p-3 sm:p-6 pointer-events-none ${isLeft ? 'justify-start sm:justify-start' : 'justify-end sm:justify-end'}`}>
      <div
        ref={panelRef}
        className="w-full sm:max-w-md max-h-[70vh] sm:max-h-[80vh] pointer-events-auto rounded-t-2xl sm:rounded-2xl overflow-y-auto scrollbar-thin"
        style={{
          ...fontSizeMap[fontSize],
          backgroundColor: 'rgba(8, 12, 28, 0.95)',
          border: `1px solid ${color}25`,
          boxShadow: `0 0 60px ${color}10, 0 20px 40px rgba(0,0,0,0.5)`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {/* Header with gradient */}
        <div
          className="relative p-6 pb-4"
          style={{
            background: `linear-gradient(135deg, ${color}12 0%, transparent 60%)`,
          }}
        >
          <div ref={contentRef} className="space-y-4">
            {/* Title area */}
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}80` }}
              />
              <div>
                <h2 className="font-medium tracking-wider text-white" style={{ fontSize: '1.15em' }}>{title}</h2>
                {subtitle && (
                  <p className="text-white/40 text-[11px] mt-0.5">{subtitle}</p>
                )}
              </div>
              {date && (
                <span className="ml-auto text-white/30 text-[10px] font-mono">{date}</span>
              )}
            </div>

            {/* Media */}
            {media && <MediaEmbed media={media} color={color} onImageClick={onImageClick} />}

            {/* Description */}
            <p className="text-white/60 leading-relaxed">
              {content}
            </p>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full tracking-wider uppercase"
                    style={{
                      fontSize: '0.75em',
                      backgroundColor: `${color}12`,
                      border: `1px solid ${color}25`,
                      color: `${color}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2 flex justify-between items-center">
          <div className="text-[9px] text-white/20 tracking-wider uppercase">
            KERMIT OS · {title}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase rounded-full transition-all hover:bg-white/5"
            style={{ border: `1px solid ${color}30`, color: `${color}` }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
