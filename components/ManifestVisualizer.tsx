
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { InsightCartridge, TechSection } from '../lib/insight-object';

interface Props {
    cartridge: InsightCartridge;
    activeSection?: string;
    onLockSlot?: () => void;
}

const ManifestVisualizer: React.FC<Props> = ({ cartridge, activeSection, onLockSlot }) => {
    
    // --- MODE: STRATEGY SESSION (AMBIKA 8-STAGE JOURNEY) ---
    if (cartridge.mode === 'STRATEGY_SESSION') {
        const currentStage = cartridge.ambikaStage || 0;
        const data = cartridge.ambikaData || {};
        const userName = cartridge.userName && cartridge.userName !== "UNDEFINED" ? cartridge.userName : "ARCHITECT";
        
        // Define the 8 Stages for visualization
        const stages = [
            { id: 0, label: 'INSIGHT', content: data.insight, persona: 'GOAL ARCHITECT' },
            { id: 1, label: 'SYSTEM', content: data.systemModel, persona: 'GOAL ARCHITECT' },
            { id: 2, label: 'RESOURCES', content: data.resources, persona: 'STRATEGY SPEC.' },
            { id: 3, label: 'IFR/BOSS', content: data.ifr, persona: 'CREATIVE SPEC.' },
            { id: 4, label: 'SOLUTION', content: data.solution, persona: 'PRODUCING SPEC.' },
            { id: 5, label: 'CHANNELS', content: data.channels, persona: 'MEDIA SPEC.' },
            { id: 6, label: 'BRIEF', content: data.briefSummary, persona: 'ASSEMBLY SPEC.' },
            { id: 7, label: 'COST', content: data.costEstimate ? `€${data.costEstimate.cost} (${data.costEstimate.hours}h)` : '', persona: 'CODE ARCHITECT' },
        ];

        const Connector = ({ active }: { active: boolean }) => (
            <div className={`h-3 w-[2px] mx-auto my-0.5 transition-colors duration-500 ${active ? 'bg-[var(--accent-emerald-500)] shadow-[0_0_8px_var(--accent-emerald-500)]' : 'bg-[var(--line-soft)]'}`}></div>
        );

        const Node = ({ label, index, active, done, content, persona }: { label: string, index: number, active: boolean, done: boolean, content?: string, persona: string }) => (
            <div className={`relative group transition-all duration-500 ${active ? 'scale-100 opacity-100' : done ? 'opacity-80' : 'opacity-40 grayscale'}`}>
                <div className={`
                    border-l-2 p-2 pl-3 transition-all duration-500 backdrop-blur-sm
                    ${active ? 'border-[var(--accent-amethyst-500)] bg-[var(--accent-amethyst-500)]/10' : 
                      done ? 'border-[var(--accent-emerald-500)] bg-[var(--accent-emerald-500)]/5' : 
                      'border-[var(--line-soft)] bg-transparent'}
                `}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`font-mono text-[8px] tracking-widest uppercase ${active ? 'text-[var(--accent-amethyst-500)]' : done ? 'text-[var(--accent-emerald-500)]' : 'text-[var(--text-muted)]'}`}>
                            {index}. {label}
                        </span>
                        {done && <span className="text-[8px] text-[var(--accent-emerald-500)]">✓</span>}
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amethyst-500)] animate-pulse"></span>}
                    </div>
                    
                    <div className={`font-mono text-[9px] leading-tight line-clamp-2 ${done ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] italic'}`}>
                        {content || (active ? "Analyzing..." : "Locked")}
                    </div>
                </div>
            </div>
        );

        return (
            <div className="h-full w-full flex flex-col relative overflow-hidden bg-[var(--bg-void)] border-r border-[var(--line-soft)]">
                
                {/* BACKGROUND GRID */}
                <div className="absolute inset-0 pointer-events-none opacity-10" 
                     style={{ backgroundImage: 'linear-gradient(var(--line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--line-soft) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {/* HEADER */}
                <div className="p-3 border-b border-[var(--line-soft)] backdrop-blur-md relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-mono text-[8px] text-[var(--accent-sapphire-500)] tracking-widest mb-1">AMBIKA ORCHESTRATOR</div>
                            <div className="font-display text-lg text-[var(--text-primary)] tracking-wider">{userName.toUpperCase()}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-mono text-[8px] text-[var(--text-muted)]">CREDITS</div>
                            <div className="font-mono text-lg font-bold text-[var(--accent-topaz-500)] animate-pulse">
                                {8 - currentStage}
                            </div>
                        </div>
                    </div>
                </div>

                {/* STAGES LIST */}
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin relative z-10 flex flex-col gap-0">
                    {stages.map((stage, i) => (
                        <React.Fragment key={i}>
                            <Node 
                                label={stage.label} 
                                index={i} 
                                active={currentStage === i} 
                                done={currentStage > i} 
                                content={stage.content} 
                                persona={stage.persona}
                            />
                            {i < stages.length - 1 && <Connector active={currentStage > i} />}
                        </React.Fragment>
                    ))}

                    {/* COMPLETION STATE */}
                    {currentStage === 8 && (
                        <div className="mt-4 p-4 border border-[var(--accent-emerald-500)] bg-[var(--accent-emerald-500)]/10 text-center animate-in zoom-in duration-500">
                            <div className="text-[var(--accent-emerald-500)] text-2xl mb-2">💎</div>
                            <div className="font-display text-lg text-[var(--text-primary)] tracking-widest">SPRINT LOCKED</div>
                            <div className="font-mono text-[9px] text-[var(--text-secondary)] mt-1">
                                TRANSMISSION SENT TO INDRA
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-2 border-t border-[var(--line-soft)] flex justify-between items-center text-[8px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)]">
                    <span>SYSTEM ID: {cartridge.id.slice(0,6)}</span>
                    <span className={currentStage === 8 ? 'text-[var(--accent-emerald-500)]' : ''}>
                        {currentStage === 8 ? 'LOCKED' : 'ACTIVE'}
                    </span>
                </div>
            </div>
        );
    }

    // --- MODE: TECH TASK (LEGACY) ---
    const task = cartridge.techTask;
    if (!task) return null;

    const mission = task.missionBrief || { status: 'PENDING', content: '' };
    const stack = task.techStack || { status: 'PENDING', content: '' };
    const flow = task.userFlow || { status: 'PENDING', content: '' };
    const roles = task.roles || { status: 'PENDING', content: '' };
    const admin = task.admin || { status: 'PENDING', content: '' };

    const renderSection = (title: string, data: TechSection | undefined, icon: string, colorClass: string, borderColorClass: string) => {
        if (!data) return null;
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
                        {(data.status || 'PENDING').replace('_', ' ')}
                    </span>
                </div>
                <div className="font-mono text-[9px] text-[var(--text-secondary)] line-clamp-3 leading-tight whitespace-pre-wrap">
                    {data.content || "..."}
                </div>
                {isInProgress && (
                    <div className="absolute bottom-0 left-0 h-[2px] bg-white animate-[width_2s_ease-in-out_infinite]" style={{width: '100%'}}></div>
                )}
                {isDone && (
                    <div className={`absolute bottom-0 left-0 h-[2px] w-full ${colorClass.replace('text-', 'bg-')}`}></div>
                )}
            </div>
        );
    };

    const hasEstimation = task.estimation && typeof task.estimation.cost === 'number' && task.estimation.cost > 0;
    const costDisplay = hasEstimation ? `€${task.estimation!.cost.toFixed(0)}` : 'CALCULATING...';

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
                    <div className="font-mono text-[9px] text-[var(--text-muted)]">LIVE ESTIMATION</div>
                    <div className={`font-mono text-lg font-bold ${hasEstimation ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] animate-pulse'}`}>
                        {costDisplay}
                    </div>
                </div>
            </div>
            
            <div className="px-2 pb-2">
                 <div className="flex items-center gap-2 font-mono text-[9px]">
                    <span className="text-[var(--text-muted)]">PROTOCOL STATUS:</span>
                    <span className="text-[var(--accent-emerald-500)] animate-pulse">
                         {mission.status === 'PENDING' ? 'INITIATED' : 'ACTIVE'}
                    </span>
                 </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
                {renderSection("MISSION BRIEF (HUMAN FIRST)", mission, "🧠", "text-[var(--accent-emerald-500)]", "border-[var(--accent-emerald-500)]")}
                {renderSection("TECH STACK (ARCHITECTURE)", stack, "💻", "text-[var(--accent-amethyst-500)]", "border-[var(--accent-amethyst-500)]")}
                {renderSection("USER FLOW (JOURNEY)", flow, "🗺️", "text-[var(--accent-sapphire-500)]", "border-[var(--accent-sapphire-500)]")}
                {renderSection("ROLES (AGENT SWARM)", roles, "💠", "text-[var(--accent-topaz-500)]", "border-[var(--accent-topaz-500)]")}
                {renderSection("ADMIN (GOD MODE)", admin, "🛡️", "text-[var(--accent-ruby-500)]", "border-[var(--accent-ruby-500)]")}
            </div>

            {hasEstimation && (
                 <div className="mt-2 p-3 bg-[var(--accent-emerald-500)]/10 border border-[var(--accent-emerald-500)] rounded animate-in slide-in-from-bottom duration-500">
                     <div className="flex justify-between items-center mb-2">
                         <span className="font-mono text-[10px] text-[var(--accent-emerald-500)] font-bold">READY TO REVIEW?</span>
                         <span className="font-mono text-[10px] text-white">
                             {task.estimation!.hours} HOURS EST.
                         </span>
                     </div>
                     <button 
                        onClick={onLockSlot}
                        className="w-full py-2 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-bold font-mono text-xs rounded hover:brightness-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                     >
                         BOOK FINAL REVIEW (1H)
                     </button>
                 </div>
            )}
        </div>
    );
};

export default ManifestVisualizer;
