
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { InsightCartridge } from '../lib/insight-object';

interface Props {
    cartridge: InsightCartridge;
}

const ManifestVisualizer: React.FC<Props> = ({ cartridge }) => {
    const currentStage = cartridge.ambikaStage || 0;
    const stages = [
        { label: "NAME", color: "bg-[#D4E157]" },
        { label: "JOURNEY", color: "bg-[#FFEE58]" },
        { label: "PROBE", color: "bg-[#FFCA28]" },
        { label: "GOALS", color: "bg-[#FFA726]" },
        { label: "STRAT", color: "bg-[#FF7043]" },
        { label: "IDEA", color: "bg-[#EF5350]" },
        { label: "PROD", color: "bg-[#E53935]" },
        { label: "MEDIA", color: "bg-[#B71C1C]" },
        { label: "LOCK", color: "bg-[#880E4F]" }
    ];

    const data = cartridge.ambikaData || {};

    return (
        <div className="h-full w-full flex flex-col p-2 md:p-3 bg-[var(--bg-void)]/80 overflow-hidden font-mono">
            <div className="mb-1 flex justify-between items-end border-b border-[var(--line-soft)] pb-0.5">
                <h3 className="font-display text-[9px] md:text-xs text-white tracking-widest uppercase opacity-80">ARCHITECT_HUD</h3>
                <span className="text-[9px] text-[var(--accent-emerald-500)] font-bold">STAGE_{currentStage}/8</span>
            </div>

            <div className="h-[40px] md:flex-1 flex items-end justify-between gap-0.5 md:gap-1 mb-2">
                {stages.map((s, i) => {
                    const isActive = currentStage >= i;
                    const height = 20 + (i * 10); 
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                            <div 
                                className={`w-full transition-all duration-700 rounded-t-[1px] ${isActive ? s.color : 'bg-white/5 opacity-5'}`}
                                style={{ height: `${height}%` }}
                            />
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-1 py-0.5 text-[5px] rounded z-50 whitespace-nowrap">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-[var(--bg-surface)]/50 p-1.5 rounded border border-[var(--line-soft)]">
                <div className="text-[7px] text-[var(--accent-emerald-500)] mb-0.5 uppercase flex justify-between">
                    <span>SECTOR_SYNC</span>
                    <span>{cartridge.userName || 'PENDING'}</span>
                </div>
                <div className="text-[9px] text-[var(--text-secondary)] leading-tight italic line-clamp-2 md:line-clamp-5">
                    {data.insight || "ESTABLISHING ARCHITECTURAL PARAMETERS..."}
                </div>
            </div>
            
            <div className="mt-auto pt-1 text-[6px] text-[var(--text-muted)] flex justify-between uppercase border-t border-[var(--line-soft)] opacity-40">
                <span>MEM: ENCRYPTED</span>
                <span>IO: STREAMING</span>
            </div>
        </div>
    );
};

export default ManifestVisualizer;
