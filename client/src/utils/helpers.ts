import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'var(--color-risk-low)';
  if (score >= 60) return 'var(--color-risk-medium)';
  if (score >= 40) return 'var(--color-risk-high)';
  return 'var(--color-risk-critical)';
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return 'Low Risk';
  if (score >= 60) return 'Medium Risk';
  if (score >= 40) return 'High Risk';
  return 'Critical';
}

export function getMaturityLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Ad-hoc',
    2: 'Defined',
    3: 'Managed',
    4: 'Quantified',
    5: 'Optimizing',
  };
  return labels[level] || 'Unknown';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}
