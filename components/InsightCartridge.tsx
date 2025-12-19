
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { InsightCartridge } from '../lib/insight-object';

interface Props {
    cartridge: InsightCartridge;
    className?: string;
}

export const InsightCartridgeVisual: React.FC<Props> = ({ cartridge, className = '' }) => {
    return (
        <div className={`cartridge-slot p-4 flex flex-col gap-4 ${className}`}>
            <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-2">
                <span className="font-mono text-xs text-[var(--accent-topaz-500)] tracking-widest">
                    ID: {cartridge.id.slice(0, 8)}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                    STATUS: {cartridge.status}
                </span>
            </div>

            {/* Tension Meter */}
            <div className="relative h-2 bg-[var(--bg-void)] rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--accent-emerald-500)] via-[var(--accent-amethyst-500)] to-[var(--accent-ruby-500)]"
                    style={{ width: `${cartridge.tension}%`, opacity: 0.8 }}
                />
            </div>

            {/* 4-Quadrant System Mirror */}
            <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Strategy */}
                <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-soft)]">
                    <div className="text-[10px] font-mono text-[var(--accent-amethyst-500)] mb-1">STRATEGY</div>
                    <div className="h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-amethyst-500)]" style={{ width: `${cartridge.quadrants.strategy.level}%` }}></div>
                    </div>
                </div>
                 {/* Creative */}
                 <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-soft)]">
                    <div className="text-[10px] font-mono text-[var(--accent-emerald-500)] mb-1">CREATIVE</div>
                    <div className="h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-emerald-500)]" style={{ width: `${cartridge.quadrants.creative.level}%` }}></div>
                    </div>
                </div>
                 {/* Producing */}
                 <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-soft)]">
                    <div className="text-[10px] font-mono text-[var(--accent-sapphire-500)] mb-1">PRODUCING</div>
                    <div className="h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-sapphire-500)]" style={{ width: `${cartridge.quadrants.producing.level}%` }}></div>
                    </div>
                </div>
                 {/* Media */}
                 <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-soft)]">
                    <div className="text-[10px] font-mono text-[var(--accent-ruby-500)] mb-1">MEDIA</div>
                    <div className="h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-ruby-500)]" style={{ width: `${cartridge.quadrants.media.level}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
