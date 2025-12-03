
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { InsightCartridge, TechSection } from '../lib/insight-object';

interface Props {
    cartridge: InsightCartridge;
    activeSection?: string;
}

const ManifestVisualizer: React.FC<Props> = ({ cartridge, activeSection }) => {
    const task = cartridge.techTask;
    if (!task) return null;

    const renderSection = (title: string, data: TechSection, icon: string, colorClass: string, borderColorClass: string) => {
        const isDone = data.status === 'DONE';
        const isInProgress = data.status === 'IN_PROGRESS';
        
        return (
            <div className={`p-3 border rounded transition-all duration-300 relative overflow-hidden group ${
                isDone ? `${borderColorClass} bg-opacity-10 bg-white` : 
                isInProgress ? 'border-white bg-white/5' : 
                'border-[var(--line-soft)] opacity-60'
            }`}>
                <div className="flex justify-between items-center mb-1">
                    <span className={`font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 ${colorClass}`}>
                        {icon} {title}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-[var(--text-muted)]">
                        {data.status.replace('_', ' ')}
                    </span>
                </div>
                
                {/* Content Preview */}
                <div className="font-mono text-[9px] text-[var(--text-secondary)] line-clamp-2 leading-tight">
                    {data.content || "..."}
                </div>

                {/* Progress Bar */}
                {isInProgress && (
                    <div className="absolute bottom-0 left-0 h-[2px] bg-white animate-[width_2s_ease-in-out_infinite]" style={{width: '100%'}}></div>
                )}
                {isDone && (
                    <div className={`absolute bottom-0 left-0 h-[2px] w-full ${colorClass.replace('text-', 'bg-')}`}></div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-2 p-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <span className="text-9xl font-display text-[var(--text-primary)]">NAVY</span>
            </div>

            <div className="mb-2 border-b border-[var(--line-soft)] pb-2 flex justify-between items-end">
                <div>
                    <h3 className="font-display text-xl text-[var(--accent-sapphire-500)] tracking-widest">TECHNICAL MANIFEST</h3>
                    <p className="font-mono text-[9px] text-[var(--text-secondary)]">STRUCTURING CHAOS INTO CODE</p>
                </div>
                <div className="text-right">
                    <div className="font-mono text-[9px] text-[var(--text-muted)]">ESTIMATION</div>
                    <div className="font-mono text-lg font-bold text-[var(--text-primary)]">
                        {task.estimation ? `€${task.estimation.cost}` : '---'}
                    </div>
                </div>
            </div>
            
            {/* PROTOCOL STATUS INDICATOR */}
            <div className="px-2 pb-2">
                 <div className="flex items-center gap-2 font-mono text-[9px]">
                    <span className="text-[var(--text-muted)]">PROTOCOL STATUS:</span>
                    <span className="text-[var(--accent-emerald-500)] animate-pulse">
                         {task.generalInfo.status === 'PENDING' ? 'INITIATED' : 'ACTIVE'}
                    </span>
                 </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
                {renderSection("GENERAL INFO", task.generalInfo, "📋", "text-[var(--accent-emerald-500)]", "border-[var(--accent-emerald-500)]")}
                {renderSection("TECH STACK", task.techStack, "💻", "text-[var(--accent-amethyst-500)]", "border-[var(--accent-amethyst-500)]")}
                {renderSection("STRUCTURE", task.structure, "🏗️", "text-[var(--accent-sapphire-500)]", "border-[var(--accent-sapphire-500)]")}
                {renderSection("ROLES", task.roles, "👥", "text-[var(--accent-topaz-500)]", "border-[var(--accent-topaz-500)]")}
                {renderSection("ADMIN", task.admin, "🛡️", "text-[var(--accent-ruby-500)]", "border-[var(--accent-ruby-500)]")}
            </div>

            {task.estimation && (
                 <div className="mt-2 p-3 bg-[var(--accent-emerald-500)]/10 border border-[var(--accent-emerald-500)] rounded animate-in slide-in-from-bottom duration-500">
                     <div className="flex justify-between items-center mb-2">
                         <span className="font-mono text-[10px] text-[var(--accent-emerald-500)] font-bold">READY TO LOCK?</span>
                         <span className="font-mono text-[10px] text-white">{task.estimation.hours} HOURS</span>
                     </div>
                     <button className="w-full py-2 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-bold font-mono text-xs rounded hover:brightness-110 transition-all">
                         LOCK SLOT (50% PREPAY)
                     </button>
                 </div>
            )}
        </div>
    );
};

export default ManifestVisualizer;
