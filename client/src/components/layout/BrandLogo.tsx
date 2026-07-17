import type { CSSProperties } from 'react';

interface BrandLogoProps {
  compact?: boolean;
  showProductTag?: boolean;
  className?: string;
  markClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  style?: CSSProperties;
}

export default function BrandLogo({
  compact = false,
  showProductTag = false,
  className,
  markClassName,
  titleClassName,
  descriptionClassName,
  style,
}: BrandLogoProps) {
  return (
    <div className={['brand-lockup', compact ? 'compact' : '', className].filter(Boolean).join(' ')} style={style}>
      
      {/* SentriX Custom Inline Logo - Zero Broken File Imports */}
      <div className={['brand-mark', markClassName].filter(Boolean).join(' ')} aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="brand-mark-image" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M64 12 L110 34 V74 C110 100 89 116 64 122 C39 116 18 100 18 74 V34 Z" fill="url(#shieldGrad)" />
          <path d="M64 19 L102 38 V72 C102 94 84 108 64 113 C44 108 26 94 26 72 V38 Z" fill="#0f172a" />
          <path d="M64 25 L92 42 V68 C92 84 79 96 64 101 C49 96 36 84 36 68 V42 Z" fill="url(#glowGrad)" stroke="#1e293b" strokeWidth="1" />
          <circle cx="64" cy="45" r="5" fill="#38bdf8" />
          <circle cx="48" cy="65" r="4" fill="#38bdf8" />
          <circle cx="80" cy="65" r="4" fill="#38bdf8" />
          <circle cx="64" cy="85" r="5" fill="#38bdf8" />
          <path d="M64 50 L64 80 M48 65 L80 65 M64 45 L48 65 M64 45 L80 65 M48 65 L64 85 M80 65 L64 85" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>

      {!compact && (
        <div className="brand-copy">
          {/* Rebranded Title */}
          <div className={['brand-title', titleClassName].filter(Boolean).join(' ')}>
            Sentri<span style={{ color: '#0ea5e9' }}>X</span>
          </div>
          
          <div className={['brand-description', descriptionClassName].filter(Boolean).join(' ')}>
            {showProductTag
              ? 'Agentic AI compliance platform powered by the Claude 5th-Gen Agentic Engine.'
              : 'Multi-standard compliance intelligence workspace'}
          </div>
        </div>
      )}
    </div>
  );
}