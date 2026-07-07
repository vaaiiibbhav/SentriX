import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import { getRiskColor, getMaturityLabel } from '../../utils/helpers';

interface ComplianceScoreRingProps {
  score: number;
  maturityLevel?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showMaturity?: boolean;
  delay?: number;
}

export default function ComplianceScoreRing({
  score,
  maturityLevel = 3,
  size = 200,
  strokeWidth = 12,
  label,
  showMaturity = true,
  delay = 0,
}: ComplianceScoreRingProps) {
  const [animate, setAnimate] = useState(false);
  const displayScore = useCountUp(animate ? score : 0, 2000);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const color = getRiskColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-primary-600)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animate ? circumference * (1 - score / 100) : circumference }}
            transition={{ duration: 2, ease: 'easeOut', delay: delay / 1000 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="score-display text-4xl font-bold" style={{ color }}>
            {displayScore}%
          </span>
          {label && (
            <span className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </span>
          )}
        </div>
      </div>
      {showMaturity && maturityLevel && (
        <div className="text-center">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Level {maturityLevel} — {getMaturityLabel(maturityLevel)}
          </span>
        </div>
      )}
    </div>
  );
}
