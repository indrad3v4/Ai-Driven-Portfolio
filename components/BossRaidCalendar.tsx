
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';

// --- TYPES ---
interface CalendarSlot {
    id: string;
    day: number; // Day of month
    month: number;
    year: number;
    time: string;
    status: 'AVAILABLE' | 'BOOKED' | 'RAIDING' | 'BLOCKED';
    bossName?: string; // If booked
}

// --- MOCK DATA ---
const INITIAL_SLOTS: CalendarSlot[] = [
    { id: '1', day: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear(), time: '14:00 CET', status: 'BOOKED', bossName: 'Entropy' },
    { id: '2', day: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear(), time: '16:00 CET', status: 'AVAILABLE' },
    { id: '3', day: new Date().getDate() + 1, month: new Date().getMonth(), year: new Date().getFullYear(), time: '10:00 CET', status: 'AVAILABLE' },
    { id: '4', day: new Date().getDate() + 1, month: new Date().getMonth(), year: new Date().getFullYear(), time: '18:00 CET', status: 'RAIDING', bossName: 'Procrastination' },
];

interface Props {
    onClose: () => void;
    isAdmin: boolean;
    onStartTechTask: () => void;
}

const BossRaidCalendar: React.FC<Props> = ({ onClose, isAdmin, onStartTechTask }) => {
    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
    const [slots, setSlots] = useState<CalendarSlot[]>(INITIAL_SLOTS);

    // Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Mon start

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    // Filter slots for selected day
    const daySlots = slots.filter(s => s.day === selectedDay && s.month === month && s.year === year);
    
    // Check status of a day for grid coloring
    const getDayStatus = (d: number) => {
        const s = slots.filter(slot => slot.day === d && slot.month === month && slot.year === year);
        if (s.length === 0) return 'EMPTY';
        if (s.some(slot => slot.status === 'AVAILABLE')) return 'OPEN';
        if (s.some(slot => slot.status === 'RAIDING')) return 'ACTIVE';
        return 'FULL';
    };

    // --- ACTIONS ---
    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleAdminToggleSlot = (id: string) => {
        setSlots(prev => prev.map(s => {
            if (s.id !== id) return s;
            const nextStatus = s.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
            return { ...s, status: nextStatus };
        }));
    };

    const handleAdminAddSlot = () => {
        if (!selectedDay) return;
        const newSlot: CalendarSlot = {
            id: Math.random().toString(),
            day: selectedDay,
            month: month,
            year: year,
            time: '12:00 CET', // Default
            status: 'AVAILABLE'
        };
        setSlots([...slots, newSlot]);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-void)]/95 backdrop-blur-xl flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300">
            <div className="max-w-4xl w-full bg-[var(--bg-canvas)] border-2 border-[var(--accent-amethyst-500)] rounded-[var(--radius-lg)] shadow-[var(--shadow-glow-amethyst)] overflow-hidden flex flex-col max-h-[95vh]">
                
                {/* --- HEADER: MISSION BRIEFING --- */}
                <div className="p-4 md:p-6 border-b border-[var(--line-soft)] bg-[var(--bg-surface)] relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                         <span className="text-9xl">📅</span>
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div className="max-w-2xl pr-8">
                            <h2 className="font-display text-3xl md:text-4xl text-[var(--accent-amethyst-500)] tracking-widest leading-none mb-4">
                                MISSION BRIEFING
                            </h2>
                            <div className="space-y-3 font-mono text-xs md:text-sm text-[var(--text-secondary)]">
                                <div className="flex gap-2">
                                    <span className="text-[var(--accent-ruby-500)] font-bold shrink-0">OBJECTIVE:</span>
                                    <span>NEUTRALIZE YOUR BOTTLENECK.</span>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <span className="text-[var(--accent-emerald-500)] font-bold shrink-0">METHOD:</span>
                                    <div className="flex flex-col gap-1">
                                        <p>1. <strong className="text-[var(--text-primary)]">IDENTIFY:</strong> You bring the problem (The Boss).</p>
                                        <p>2. <strong className="text-[var(--text-primary)]">ESTIMATE:</strong> We analyze & define hours needed.</p>
                                        <p>3. <strong className="text-[var(--text-primary)]">EXECUTE:</strong> We build the Pythonic solution together in real-time.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center mt-2">
                                     <button 
                                        onClick={onStartTechTask}
                                        className="px-3 py-1 bg-[var(--accent-topaz-500)] text-[var(--bg-void)] font-bold text-xs hover:bg-white transition-colors animate-pulse"
                                    >
                                        {">_"} PREPARE RAID BRIEF (TECH TASK)
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-void)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--line-soft)] shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* --- MAIN CONTENT GRID --- */}
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0">
                    
                    {/* LEFT: CALENDAR GRID */}
                    <div className="flex-[3] p-6 border-b md:border-b-0 md:border-r border-[var(--line-soft)]">
                        {/* Month Nav */}
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={handlePrevMonth} className="text-[var(--accent-sapphire-500)] hover:text-white font-display text-xl">{'<'} PREV</button>
                            <span className="font-display text-2xl text-[var(--text-primary)]">{monthNames[month]} {year}</span>
                            <button onClick={handleNextMonth} className="text-[var(--accent-sapphire-500)] hover:text-white font-display text-xl">NEXT {'>'}</button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                            {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
                                <span key={d} className="font-mono text-[10px] text-[var(--text-muted)]">{d}</span>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: offset }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square"></div>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const d = i + 1;
                                const status = getDayStatus(d);
                                const isSelected = d === selectedDay;
                                
                                let bgClass = 'bg-[var(--bg-surface)] border-[var(--line-soft)]';
                                let textClass = 'text-[var(--text-secondary)]';
                                
                                if (status === 'OPEN') {
                                    bgClass = 'bg-[var(--accent-emerald-500)]/10 border-[var(--accent-emerald-500)]/50 hover:bg-[var(--accent-emerald-500)]/20';
                                    textClass = 'text-[var(--accent-emerald-500)]';
                                } else if (status === 'FULL') {
                                    bgClass = 'bg-[var(--accent-ruby-500)]/5 border-[var(--accent-ruby-500)]/30';
                                    textClass = 'text-[var(--text-muted)]';
                                } else if (status === 'ACTIVE') {
                                    bgClass = 'bg-[var(--accent-amethyst-500)]/20 border-[var(--accent-amethyst-500)] animate-pulse';
                                    textClass = 'text-[var(--accent-amethyst-500)]';
                                }

                                if (isSelected) {
                                    bgClass = 'bg-[var(--accent-topaz-500)] border-[var(--accent-topaz-500)] shadow-[0_0_15px_rgba(245,158,11,0.4)]';
                                    textClass = 'text-[var(--bg-void)] font-bold';
                                }

                                return (
                                    <button
                                        key={d}
                                        onClick={() => setSelectedDay(d)}
                                        className={`aspect-square rounded border flex flex-col items-center justify-center transition-all relative group ${bgClass}`}
                                    >
                                        <span className={`font-mono text-sm ${textClass}`}>{d}</span>
                                        {status === 'OPEN' && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-emerald-500)] mt-1"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: SLOT DETAILS */}
                    <div className="flex-[2] p-6 bg-[var(--bg-surface)]/30 flex flex-col">
                        <h3 className="font-display text-xl text-[var(--text-primary)] mb-4 border-b border-[var(--line-soft)] pb-2">
                            {selectedDay ? `${selectedDay} ${monthNames[month]}` : "SELECT A DATE"}
                        </h3>

                        <div className="flex-1 space-y-3 overflow-y-auto">
                            {daySlots.length === 0 ? (
                                <div className="text-center py-8 text-[var(--text-muted)] font-mono text-xs">
                                    NO RAIDS SCHEDULED.
                                    {isAdmin && <div className="mt-2 text-[var(--accent-emerald-500)]">Admin: Add a slot</div>}
                                </div>
                            ) : (
                                daySlots.map(slot => (
                                    <div key={slot.id} className={`p-3 rounded border flex justify-between items-center ${
                                        slot.status === 'AVAILABLE' 
                                            ? 'bg-[var(--bg-canvas)] border-[var(--accent-emerald-500)] text-[var(--accent-emerald-500)]' 
                                            : (slot.status === 'BLOCKED' ? 'bg-[var(--bg-void)] border-[var(--line-soft)] opacity-50' : 'bg-[var(--bg-void)] border-[var(--accent-ruby-500)]')
                                    }`}>
                                        <div>
                                            <div className="font-bold font-display text-lg">{slot.time}</div>
                                            <div className="text-[10px] font-mono">
                                                {slot.status === 'AVAILABLE' && "OPEN SLOT"}
                                                {slot.status === 'BOOKED' && <span className="text-[var(--text-primary)]">VS. {slot.bossName}</span>}
                                                {slot.status === 'BLOCKED' && "BLOCKED"}
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        {isAdmin ? (
                                            <button 
                                                onClick={() => handleAdminToggleSlot(slot.id)}
                                                className="px-2 py-1 text-[9px] bg-[var(--bg-surface)] border border-[var(--line-soft)] hover:border-white transition-colors"
                                            >
                                                {slot.status === 'AVAILABLE' ? 'BLOCK' : 'OPEN'}
                                            </button>
                                        ) : (
                                            slot.status === 'AVAILABLE' && (
                                                <button className="px-3 py-1 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-bold text-xs hover:bg-white transition-colors">
                                                    BOOK
                                                </button>
                                            )
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {isAdmin && selectedDay && (
                            <button 
                                onClick={handleAdminAddSlot}
                                className="mt-4 w-full py-2 border border-dashed border-[var(--text-muted)] text-[var(--text-muted)] hover:border-[var(--accent-emerald-500)] hover:text-[var(--accent-emerald-500)] text-xs font-mono transition-colors"
                            >
                                + ADD SLOT (ADMIN)
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BossRaidCalendar;
