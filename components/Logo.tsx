/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Smart Logo: Home portal anchor with game progress badge
 * Click behavior:
 *   - From landing: No effect (you're home)
 *   - From game/external: Portal animation + restore state
 *   - Shows progress badge if game active
 */

import React, { useState, useEffect } from 'react';
import { useGamePortal, useHasActiveProgress } from '../hooks/useGamePortal';

interface LogoProps {
  className?: string;
  showBadge?: boolean;
  onNavigate?: () => void; // Optional callback for parent
  isLanding?: boolean; // Prop to tell if we are currently on landing
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showBadge = true,
  isLanding = false,
  onNavigate
}) => {
  const { hasProgress, progressLabel } = useHasActiveProgress();
  const { activatePortal } = useGamePortal();
  const [portalActive, setPortalActive] = useState(false);

  /**
   * Portal animation: visual feedback that state is being restored
   */
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isLanding) {
      // Already home, just pulse
      setPortalActive(true);
      setTimeout(() => setPortalActive(false), 400);
      return;
    }

    // Trigger portal effect
    setPortalActive(true);
    activatePortal(); // Update global state to tell App to show Landing

    if (onNavigate) onNavigate();
    
    // Reset animation state after transition
    setTimeout(() => {
      setPortalActive(false);
    }, 400);
  };

  return (
    <div className={`logo-wrapper ${portalActive ? 'portal-active' : ''} ${className}`}>
      <a
        href="#"
        onClick={handleLogoClick}
        className="logo-anchor"
        title={hasProgress ? `Resume: ${progressLabel}` : 'Home'}
      >
        {/* Logo text */}
        <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-amethyst-500)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-amethyst-500)]"></span>
            </div>
            <span className="logo-text font-[var(--font-display)] text-2xl text-[var(--text-primary)] tracking-widest leading-none mt-1">
                INDRA-AI.DEV
            </span>
        </div>

        {/* Progress badge (only show if game active and not on landing) */}
        {hasProgress && showBadge && !isLanding && (
          <div className="progress-badge">
            <span className="badge-icon">🎮</span>
            <span className="badge-text">{progressLabel}</span>
          </div>
        )}
      </a>

      <style>{`
        .logo-wrapper {
          position: relative;
          display: inline-block;
        }

        .logo-anchor {
          position: relative;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-anchor:hover {
          opacity: 0.8;
          transform: scale(1.02);
        }

        .logo-text {
          display: inline-block;
        }

        /* Portal activation animation */
        .logo-wrapper.portal-active .logo-text {
          animation: portalPulse 0.4s ease-out;
        }

        @keyframes portalPulse {
          0% {
            opacity: 1;
            transform: scale(1);
            text-shadow: 0 0 0 var(--accent-amethyst-500);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.95);
            text-shadow: 0 0 20px var(--accent-amethyst-500);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            text-shadow: 0 0 0 var(--accent-amethyst-500);
          }
        }

        /* Progress badge styling */
        .progress-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.6rem;
          background: rgba(0, 255, 150, 0.1);
          border: 1px solid rgba(0, 255, 150, 0.3);
          border-radius: 9999px;
          font-size: 0.7rem;
          color: var(--accent-emerald-500);
          animation: badgeGlow 3s ease-in-out infinite;
        }

        .badge-icon {
          font-size: 0.8rem;
        }

        .badge-text {
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: bold;
        }

        @keyframes badgeGlow {
          0%, 100% { border-color: rgba(0, 255, 150, 0.3); }
          50% { border-color: rgba(0, 255, 150, 0.8); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .progress-badge {
            display: none; /* Hide on mobile header to save space */
          }
        }
      `}</style>
    </div>
  );
};

export default Logo;