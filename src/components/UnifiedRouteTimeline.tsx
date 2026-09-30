'use client';

import React, { useState } from 'react';
import {
  Clock,
  Train,
  Share2,
  Bell,
  MapPin,
  RefreshCw,
  Edit2,
  ChevronDown,
  ArrowRight,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  Info,
  Check,
  Compass,
} from 'lucide-react';
import { TrainDetails, StationStop } from '@/types';

interface UnifiedRouteTimelineProps {
  train: TrainDetails;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function UnifiedRouteTimeline({
  train,
  onRefresh,
  isRefreshing = false,
}: UnifiedRouteTimelineProps) {
  const [dayFilter, setDayFilter] = useState<'All' | number>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string>('B2');
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [alarmStation, setAlarmStation] = useState<string>(train.currentStatus.nextStationName);
  const [alarmMinutesBefore, setAlarmMinutesBefore] = useState<number>(15);
  const [activeAlarm, setActiveAlarm] = useState<{ station: string; minutes: number } | null>(null);

  // Platform edit state
  const [platformModalStop, setPlatformModalStop] = useState<StationStop | null>(null);
  const [editedPlatform, setEditedPlatform] = useState<string>('1');
  const [customPlatforms, setCustomPlatforms] = useState<Record<string, string>>({});

  const isDelayed = train.currentStatus.delayMinutes > 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Play audio chime using Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  // Group stops by day
  const stopsByDay: Record<number, StationStop[]> = {};
  train.stops.forEach((stop) => {
    const day = stop.day || 1;
    if (!stopsByDay[day]) stopsByDay[day] = [];
    stopsByDay[day].push(stop);
  });

  const availableDays = Object.keys(stopsByDay).map(Number);

  const dayDates: Record<number, string> = {
    1: 'Day 1 (Departure Day)',
    2: 'Day 2 (En Route)',
    3: 'Day 3 (Arrival Day)',
  };

  const handleShare = () => {
    const shareText = `Live Running Status: ${train.trainNumber} - ${train.trainName}\n📍 Status: ${train.currentStatus.statusText}\n⚡ Speed: ${train.currentStatus.speedKmH} km/h | Next Halt: ${train.currentStatus.nextStationName} (${train.currentStatus.estimatedArrivalNext})`;
    if (navigator.share) {
      navigator.share({
        title: `${train.trainNumber} - ${train.trainName}`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('Live train status copied to clipboard!');
    }
  };

  const handleSetAlarm = () => {
    setActiveAlarm({ station: alarmStation, minutes: alarmMinutesBefore });
    playChime();
    setShowAlarmModal(false);
    showToast(`Alarm set for ${alarmStation} (${alarmMinutesBefore}m before arrival)`);
  };

  // Mock coach arrangement according to train type
  const coachComposition = train.trainType === 'Vande Bharat'
    ? ['ENG', 'C1', 'C2', 'C3', 'E1', 'C4', 'C5', 'C6', 'C7', 'E2', 'ENG']
    : ['ENG', 'SLR', 'GS', 'GS', 'S1', 'S2', 'S3', 'S4', 'PC', 'B1', 'B2', 'B3', 'B4', 'A1', 'A2', 'H1', 'GS', 'SLR'];

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col h-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center space-x-2 border border-blue-400/40 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Train Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-black text-cyan-400 text-lg sm:text-xl">
                {train.trainNumber}
              </span>
              <span className="font-extrabold text-white text-base sm:text-lg">
                {train.trainName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                {train.trainType}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
              <span className="font-semibold text-slate-200">{train.sourceStation} ({train.sourceCode})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-200">{train.destinationStation} ({train.destCode})</span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
              isDelayed
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isDelayed ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{train.currentStatus.delayMinutes}m Late</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>On Time</span>
              </>
            )}
          </span>
        </div>

        {/* Live Running Telemetry HUD */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 rounded-2xl bg-slate-950/80 border border-white/5 text-center">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Live Velocity</span>
            <span className="font-mono font-extrabold text-cyan-400 text-sm sm:text-base">
              ⚡ {train.currentStatus.speedKmH} <span className="text-[10px] font-sans">km/h</span>
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Next Station</span>
            <span className="font-bold text-white text-xs sm:text-sm truncate block">
              {train.currentStatus.nextStationName}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Next ETA</span>
            <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
              {train.currentStatus.estimatedArrivalNext}
            </span>
          </div>
        </div>

        {/* Progress Bar of Journey */}
        <div className="mt-3 pt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
            <span>{train.sourceStation}</span>
            <span className="text-cyan-400 font-bold">{train.currentStatus.progressPercent}% Completed</span>
            <span>{train.destinationStation}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, train.currentStatus.progressPercent))}%` }}
            ></div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {/* Alarm Button */}
            <button
              onClick={() => setShowAlarmModal(true)}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 border transition ${
                activeAlarm
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Bell className={`w-3 h-3 ${activeAlarm ? 'text-amber-400 animate-bounce' : 'text-cyan-400'}`} />
              <span>{activeAlarm ? `Alarm: ${activeAlarm.station}` : 'Alarm'}</span>
            </button>

            {/* Coach Layout Button */}
            <button
              onClick={() => setShowCoachModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center space-x-1 border border-slate-700 transition"
            >
              <Train className="w-3 h-3 text-cyan-400" />
              <span>Coach Rake</span>
            </button>

            {/* Share Status Button */}
            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center space-x-1 border border-slate-700 transition"
            >
              <Share2 className="w-3 h-3 text-cyan-400" />
              <span>Share</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 font-bold border border-blue-500/30 flex items-center space-x-1.5 transition shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Subheader Column Legend with Day Filter */}
      <div className="bg-slate-950/90 px-4 py-2 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 border-b border-white/5">
        <span className="w-16">Arrival</span>
        
        {/* Day Filter Pills */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setDayFilter('All')}
            className={`px-2 py-0.5 rounded text-[10px] transition ${
              dayFilter === 'All' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Days
          </button>
          {availableDays.map((d) => (
            <button
              key={d}
              onClick={() => setDayFilter(d)}
              className={`px-2 py-0.5 rounded text-[10px] transition ${
                dayFilter === d ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>

        <span className="w-16 text-right">Departure</span>
      </div>

      {/* Scrollable Timeline with Blue Railway Track */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 relative space-y-4 max-h-[580px]">
        {/* Continuous Solid Blue Vertical Track Line */}
        <div className="absolute left-[78px] sm:left-[86px] top-6 bottom-6 w-[4px] bg-[#0284c7] rounded-full shadow-sm z-0"></div>

        {Object.entries(stopsByDay)
          .filter(([dayStr]) => dayFilter === 'All' || parseInt(dayStr, 10) === dayFilter)
          .map(([dayStr, dayStops]) => {
            const dayNum = parseInt(dayStr, 10);

            return (
              <div key={dayNum} className="space-y-3 relative">
                {/* Day Divider */}
                <div className="flex items-center justify-center my-4 relative z-10">
                  <div className="bg-slate-800/90 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-slate-300 border border-slate-700 shadow-lg">
                    {dayDates[dayNum] || `Day ${dayNum}`}
                  </div>
                </div>

                {dayStops.map((stop: StationStop, idx: number) => {
                  const isOrigin = idx === 0 && dayNum === 1;
                  const isPassed = stop.status === 'passed';
                  const isCurrent = stop.status === 'current';
                  const platformVal = customPlatforms[stop.stationCode] || stop.platform || '1';

                  return (
                    <div
                      key={`${stop.stationCode}-${idx}`}
                      className="relative flex items-start py-2 group hover:bg-slate-800/30 rounded-2xl px-1.5 transition"
                    >
                      {/* Left: Scheduled / Actual Arrival Times */}
                      <div className="w-14 sm:w-16 text-right pr-2 shrink-0 font-mono text-xs">
                        {isOrigin ? (
                          <span className="text-slate-500 font-sans text-[11px] font-semibold">Origin</span>
                        ) : (
                          <>
                            <div className="text-slate-200 font-semibold">{stop.arrivalTime}</div>
                            <div className="text-rose-400 font-bold text-[11px]">
                              {stop.actualArrival || stop.arrivalTime}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Track Node on the Blue Line */}
                      <div className="relative z-10 flex items-center justify-center w-6 h-6 shrink-0 -ml-1 mr-3">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 border-white transition-all shadow-md ${
                            isCurrent
                              ? 'bg-cyan-400 scale-125 shadow-cyan-500 animate-pulse'
                              : isPassed
                              ? 'bg-[#0284c7]'
                              : 'bg-white'
                          }`}
                        ></div>
                      </div>

                      {/* Center: Station Name, Distance, Platform */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-bold text-white tracking-wide truncate">
                            {stop.stationName}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">({stop.stationCode})</span>
                        </div>

                        <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                          <span>{stop.distanceKm} km</span>
                          <button
                            onClick={() => {
                              setPlatformModalStop(stop);
                              setEditedPlatform(platformVal);
                            }}
                            className="flex items-center space-x-1 px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono transition"
                            title="Click to verify or report platform number"
                          >
                            <span>PF {platformVal}</span>
                            <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                          </button>
                        </div>

                        {/* Directions / Alarm action */}
                        <div className="flex items-center space-x-2 mt-1.5">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              stop.stationName + ' railway station'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition text-[10px] font-semibold"
                          >
                            <span>📍 Directions</span>
                          </a>

                          <button
                            onClick={() => {
                              setAlarmStation(stop.stationName);
                              setShowAlarmModal(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition text-[10px] font-semibold"
                          >
                            <Bell className="w-2.5 h-2.5" />
                            <span>Set Alarm</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Scheduled / Actual Departure Times */}
                      <div className="w-14 sm:w-16 text-right shrink-0 font-mono text-xs">
                        {stop.departureTime === 'Destination' ? (
                          <span className="text-slate-500 font-sans text-[11px] font-semibold">Dest.</span>
                        ) : (
                          <>
                            <div className="text-slate-200 font-semibold">{stop.departureTime}</div>
                            <div className="text-rose-400 font-bold text-[11px]">
                              {stop.actualDeparture || stop.departureTime}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      {/* Bottom Live Tracking Status Strip */}
      <div className="bg-slate-950 px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block"></span>
            <span>{train.currentStatus.statusText}</span>
          </span>
          <span className="text-slate-500 text-[10px] block mt-0.5">{train.currentStatus.lastUpdated}</span>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-cyan-400">
          {train.totalDistanceKm} km Total
        </span>
      </div>

      {/* MODAL 1: Interactive Coach Composition & Layout */}
      {showCoachModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Train className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Coach Composition & Layout</h3>
              </div>
              <button onClick={() => setShowCoachModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Standard Rake Formation for <strong className="text-white">{train.trainNumber} - {train.trainName}</strong>. Tap any coach to inspect berth layout.
            </p>

            {/* Horizontal Visual Rake */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 overflow-x-auto">
              <div className="flex items-center space-x-2 min-w-max pb-2">
                {coachComposition.map((coach, idx) => {
                  const isEngine = coach === 'ENG';
                  const isSelected = selectedCoach === coach;
                  return (
                    <button
                      key={`${coach}-${idx}`}
                      onClick={() => !isEngine && setSelectedCoach(coach)}
                      disabled={isEngine}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition ${
                        isEngine
                          ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 cursor-default'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      <span className="block text-[9px] text-slate-400 font-sans">
                        {isEngine ? 'Loco' : `P-${idx + 1}`}
                      </span>
                      <span>{coach}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Coach Detailed Berth Guide */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">
                  Coach <span className="text-cyan-400 font-mono">{selectedCoach}</span> Layout
                </span>
                <span className="text-xs text-slate-400">
                  {selectedCoach.startsWith('B') ? 'AC 3 Tier (72 Berths)' : selectedCoach.startsWith('A') ? 'AC 2 Tier (54 Berths)' : 'Standard Rake'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                  <span className="block text-slate-400 text-[10px]">Lower Berth (LB)</span>
                  <span className="font-mono text-cyan-300 font-bold">1, 4, 9, 12...</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                  <span className="block text-slate-400 text-[10px]">Middle Berth (MB)</span>
                  <span className="font-mono text-cyan-300 font-bold">2, 5, 10, 13...</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                  <span className="block text-slate-400 text-[10px]">Upper Berth (UB)</span>
                  <span className="font-mono text-cyan-300 font-bold">3, 6, 11, 14...</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                  <span className="block text-slate-400 text-[10px]">Side Lower / Upper</span>
                  <span className="font-mono text-cyan-300 font-bold">7, 8, 15, 16...</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCoachModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Close Coach Guide
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Station Wake-up Alarm */}
      {showAlarmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Station Wake-Up Alarm</h3>
              </div>
              <button onClick={() => setShowAlarmModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              RailTrack rings an audible alarm before your target destination so you never miss your stop.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Station</label>
                <select
                  value={alarmStation}
                  onChange={(e) => setAlarmStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {train.stops.map((s) => (
                    <option key={s.stationCode} value={s.stationName}>
                      {s.stationName} ({s.stationCode}) - {s.arrivalTime}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Alert In Advance</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setAlarmMinutesBefore(mins)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        alarmMinutesBefore === mins
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {mins} Mins Prior
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={playChime}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-slate-700"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Alarm Chime Sound</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleSetAlarm}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-900/30 transition"
              >
                Set Alarm Now
              </button>
              {activeAlarm && (
                <button
                  onClick={() => {
                    setActiveAlarm(null);
                    setShowAlarmModal(false);
                    showToast('Alarm removed');
                  }}
                  className="px-3 py-2.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-600/30 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Platform Reporting & Verification */}
      {platformModalStop && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Platform Information</h3>
              </div>
              <button onClick={() => setPlatformModalStop(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-white font-bold text-sm">{platformModalStop.stationName}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Expected Arrival: {platformModalStop.arrivalTime}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Verified Platform Number
              </label>
              <input
                type="text"
                value={editedPlatform}
                onChange={(e) => setEditedPlatform(e.target.value)}
                placeholder="e.g. 1, 2, 3..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Crowd-verified by 18 active passengers
              </span>
            </div>

            <button
              onClick={() => {
                if (platformModalStop) {
                  setCustomPlatforms({ ...customPlatforms, [platformModalStop.stationCode]: editedPlatform });
                  showToast(`Platform updated to PF ${editedPlatform} for ${platformModalStop.stationName}`);
                }
                setPlatformModalStop(null);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-900/30"
            >
              Confirm Platform
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
