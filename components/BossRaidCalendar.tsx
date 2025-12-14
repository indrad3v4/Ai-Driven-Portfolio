
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
    estimation?: { hours: number; cost: number; locked: boolean };
}

const BossRaidCalendar: React.FC<Props> = ({ onClose, isAdmin, onStartTechTask, estimation }) => {
    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
    const [slots, setSlots] = useState<CalendarSlot[]>(INITIAL_SLOTS);
    const [bookingSlot, setBookingSlot] = useState<CalendarSlot | null>(null);

    // Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Mon start

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    // Dynamic Date Strings for Header
    const today = new Date();
    const currentMonthStr = monthNames[today.getMonth()];
    const currentDayStr = today.getDate();
    const currentYearStr = today.getFullYear();

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

    const handleConfirmBooking = () => {
        if (!bookingSlot) return;
        setSlots(prev => prev.map(s => {
            if (s.id === bookingSlot.id) return { ...s, status: 'BOOKED', bossName: 'New Client' };
            return s;
        }));
        setBookingSlot(null);
    };

    // Calculate financials safely
    const projectEstimate = (estimation && typeof estimation.cost === 'number') ? estimation.cost : 0; 
    const sessionCost = 50.00; // Standard Boss Raid Rate per hour

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-void)]/95 backdrop-blur-xl flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300">
            {/* PAYMENT MODAL */}
            {bookingSlot && (
                <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-canvas)] border border-[var(--accent-emerald-500)] p-6 max-w-sm w-full rounded shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-in zoom-in-95">
                        <h3 className="font-display text-2xl text-[var(--accent-emerald-500)] mb-4">SECURE UPLINK</h3>
                        <div className="space-y-4 font-mono text-xs">
                             <div className="flex justify-between border-b border-[var(--line-soft)] pb-2">
                                 <span className="text-[var(--text-secondary)]">SLOT TIME:</span>
                                 <span className="text-white font-bold">{bookingSlot.time}</span>
                             </div>
                             
                             {/* Show Project Context if coming from Tech Task */}
                             {projectEstimate > 0 && (
                                <div className="flex justify-between border-b border-[var(--line-soft)] pb-2 opacity-70">
                                    <span className="text-[var(--text-secondary)]">PROJECT EST:</span>
                                    <span className="text-white">€{projectEstimate.toFixed(0)}</span>
                                </div>
                             )}

                             <div className="flex justify-between items-center text-[var(--accent-topaz-500)] font-bold text-sm bg-[var(--bg-surface)] p-2 rounded">
                                 <span>SESSION FEE:</span>
                                 <span>€{sessionCost.toFixed(2)}</span>
                             </div>
                             
                             <div className="text-[var(--text-muted)] text-[10px] italic leading-tight">
                                 Payment locks this 1h session with Indradev.
                                 {projectEstimate > 0 && " Project deposits are handled after we agree on scope."}
                             </div>
                             
                             <button 
                                onClick={handleConfirmBooking}
                                className="w-full py-4 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-display font-bold text-lg rounded hover:brightness-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                             >
                                 PAY €{sessionCost.toFixed(2)} & LOCK
                             </button>
                             <button 
                                onClick={() => setBookingSlot(null)}
                                className="w-full py-2 text-[var(--text-muted)] hover:text-white transition-colors"
                             >
                                 CANCEL
                             </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl w-full bg-[var(--bg-canvas)] border-2 border-[var(--accent-amethyst-500)] rounded-[var(--radius-lg)] shadow-[var(--shadow-glow-amethyst)] overflow-hidden flex flex-col max-h-[95vh] relative">
                
                {/* CLOSE BUTTON (Absolute for cleaner header) */}
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-void)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--line-soft)] z-50"
                >
                    ✕
                </button>

                {/* --- HEADER: MISSION BRIEFING (THE CARD) --- */}
                <div className="border-b border-[var(--line-soft)] bg-[var(--bg-void)] shrink-0">
                    <div className="relative overflow-hidden bg-[var(--bg-surface)] border-b-4 border-[var(--accent-amethyst-500)] shadow-[var(--shadow-lg)]">
                        
                        {/* 1. Header Bar */}
                        <div className="bg-[var(--accent-amethyst-500)] px-4 py-1 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                 <span className="font-mono text-[10px] font-bold text-[var(--bg-void)] tracking-[0.2em] uppercase">MISSION BRIEFING</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <span className="font-mono text-[10px] text-[var(--bg-void)]/70 font-bold uppercase">{currentMonthStr} {currentDayStr}</span>
                                 <span className="font-mono text-[10px] text-[var(--bg-void)]/50">|</span>
                                 <span className="font-mono text-[10px] text-[var(--bg-void)]/70 font-bold">{currentYearStr}</span>
                             </div>
                        </div>

                        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center">
                             {/* 2. Text Content */}
                             <div className="flex-1 space-y-3 w-full">
                                 <div className="font-display text-2xl md:text-3xl text-[var(--text-primary)] leading-none tracking-wider">
                                     OBJECTIVE: <span className="text-[var(--accent-amethyst-500)] drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]">ANNIHILATE YOUR TASK.</span>
                                 </div>
                                 <div className="space-y-2 font-mono text-[10px] md:text-xs text-[var(--text-secondary)]">
                                     <div className="flex gap-2 items-start">
                                         <span className="text-[var(--accent-topaz-500)] font-bold shrink-0 min-w-[75px]">1. IDENTIFY:</span>
                                         <span>You bring the problem (The Boss).</span>
                                     </div>
                                     <div className="flex gap-2 items-start">
                                         <span className="text-[var(--accent-topaz-500)] font-bold shrink-0 min-w-[75px]">2. ESTIMATE:</span>
                                         <span>We analyze & define hours needed.</span>
                                     </div>
                                     <div className="flex gap-2 items-start">
                                         <span className="text-[var(--accent-topaz-500)] font-bold shrink-0 min-w-[75px]">3. EXECUTE:</span>
                                         <span className="leading-tight">We build the Pythonic solution together in real-time.</span>
                                     </div>
                                 </div>
                             </div>

                             {/* 3. The Action Button (Big, Topaz, High Contrast) */}
                             <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                                  {!estimation || (estimation.hours === 0 && estimation.cost === 0) ? (
                                      <button 
                                        onClick={onStartTechTask} 
                                        className="w-full md:w-[340px] group relative overflow-hidden bg-[var(--bg-void)] border border-[var(--accent-topaz-500)] rounded hover:bg-[var(--accent-topaz-500)]/5 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] text-left"
                                      >
                                           <div className="p-4 flex flex-col gap-1 relative z-10">
                                               <span className="font-display text-xl text-[var(--accent-topaz-500)] tracking-wide flex items-center gap-2 group-hover:text-[var(--text-primary)] transition-colors">
                                                   {'>_'} PREPARE RAID BRIEF
                                                   <span className="text-sm opacity-70">(TECH TASK)</span>
                                                   <span className="ml-auto text-2xl">💠</span>
                                               </span>
                                           </div>
                                           <div className="px-4 pb-3 relative z-10">
                                               <p className="text-[9px] font-mono text-[var(--text-secondary)] leading-tight opacity-90 border-t border-[var(--line-soft)] pt-2 group-hover:text-[var(--text-primary)] group-hover:border-[var(--accent-topaz-500)] transition-colors">
                                                   Don't have a plan? Architect your spec with AI Trinity before booking. <span className="text-[var(--accent-emerald-500)] font-bold">Free to start.</span>
                                               </p>
                                           </div>
                                           {/* Hover Fill Effect */}
                                           <div className="absolute inset-0 bg-[var(--accent-topaz-500)] translate-y-[100%] group-hover:translate-y-[98%] transition-transform duration-300 ease-out z-0 opacity-10"></div>
                                      </button>
                                  ) : (
                                      /* Resume State */
                                      <button 
                                        onClick={onClose}
                                        className="w-full md:w-[340px] group relative bg-[var(--accent-emerald-500)]/10 border border-[var(--accent-emerald-500)] rounded p-4 text-left hover:bg-[var(--accent-emerald-500)]/20 transition-all"
                                      >
                                          <div className="flex justify-between items-center mb-1">
                                              <span className="font-mono text-xs font-bold text-[var(--accent-emerald-500)] tracking-wider">
                                                  MANIFEST ACTIVE
                                              </span>
                                              <span className="text-xl">✅</span>
                                          </div>
                                          <div className="text-[10px] text-[var(--text-secondary)] leading-tight mb-2">
                                              Draft loaded. Est: €{estimation.cost.toFixed(0)} ({estimation.hours}h).
                                          </div>
                                          <div className="inline-block px-2 py-1 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-bold text-[9px] rounded">
                                              {'>_'} RETURN TO TERMINAL
                                          </div>
                                      </button>
                                  )}
                             </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT GRID --- */}
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0 bg-[var(--bg-canvas)]">
                    
                    {/* LEFT: CALENDAR GRID */}
                    <div className="flex-[3] p-6 border-b md:border-b-0 md:border-r border-[var(--line-soft)]">
                        {/* Month Nav */}
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={handlePrevMonth} className="text-[var(--accent-sapphire-500)] hover:text-white font-display text-xl tracking-wider">{'<'} PREV</button>
                            <span className="font-display text-2xl text-[var(--text-primary)] tracking-widest">{monthNames[month]} {year}</span>
                            <button onClick={handleNextMonth} className="text-[var(--accent-sapphire-500)] hover:text-white font-display text-xl tracking-wider">NEXT {'>'}</button>
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
                    <div className="flex-[2] p-6 bg-[var(--bg-surface)]/30 flex flex-col border-l border-[var(--line-soft)]">
                        <h3 className="font-display text-xl text-[var(--text-primary)] mb-4 border-b border-[var(--line-soft)] pb-2 tracking-widest">
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
                                            <div className="font-bold font-display text-lg tracking-wider">{slot.time}</div>
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
                                                <button 
                                                    onClick={() => setBookingSlot(slot)}
                                                    className="px-3 py-1 bg-[var(--accent-emerald-500)] text-[var(--bg-void)] font-bold text-xs hover:bg-white transition-colors rounded shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                >
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
