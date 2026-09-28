'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Clock,
  Train,
  Share2,
  Bell,
  MapPin,
  RefreshCw,
  Edit2,
  ChevronDown,
  Navigation2,
  Map,
} from 'lucide-react';
import { TrainDetails, StationStop } from '@/types';

interface WhereIsMyTrainStatusProps {
  train: TrainDetails;
  onBack: () => void;
  onToggleMap: () => void;
  showMap: boolean;
}

export default function WhereIsMyTrainStatus({
  train,
  onBack,
  onToggleMap,
  showMap,
}: WhereIsMyTrainStatusProps) {
  const [dayFilter, setDayFilter] = useState('Yesterday');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStationAlarm, setSelectedStationAlarm] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${train.trainNumber} - ${train.trainName}`,
        text: `Live status: Train ${train.trainNumber} is currently ${train.currentStatus.statusText}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Status link copied to clipboard!');
    }
  };

  // Group stops by day
  const stopsByDay: Record<number, StationStop[]> = {};
  train.stops.forEach((stop) => {
    const day = stop.day || 1;
    if (!stopsByDay[day]) stopsByDay[day] = [];
    stopsByDay[day].push(stop);
  });

  const dayDates: Record<number, string> = {
    1: 'Day 1 - Sep 27, Sun',
    2: 'Day 2 - Sep 28, Mon',
    3: 'Day 3 - Sep 29, Tue',
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0a0f1d] text-white rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden font-sans relative pb-20">
      {/* Top Header Bar (From screenshot) */}
      <div className="bg-[#1e293b] px-3.5 py-3 flex items-center justify-between border-b border-slate-700/60 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0 mr-2">
          <button
            onClick={onBack}
            className="p-1 text-slate-300 hover:text-white transition rounded-full hover:bg-slate-700/50"
            title="Back to Search"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-white truncate tracking-wide">
            {train.trainNumber} - {train.trainName}
          </h2>
        </div>

        <button className="p-1 text-slate-300 hover:text-white transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Action Chips Bar (Yesterday, Alarm, Coach, Share) */}
      <div className="bg-[#131d2f] px-3.5 py-2.5 flex items-center space-x-2 overflow-x-auto border-b border-slate-800 scrollbar-none">
        {/* Day Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDayFilter(dayFilter === 'Yesterday' ? 'Today' : 'Yesterday')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1e293b] hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition shrink-0"
          >
            <span>{dayFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Alarm button */}
        <button
          onClick={() => {
            alert(`Station Alarm set for next stoppage: ${train.currentStatus.nextStationName}`);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1e293b] hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition shrink-0"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Alarm</span>
        </button>

        {/* Coach button */}
        <button
          onClick={() => {
            alert(`Coach Layout for Train ${train.trainNumber}:\n[ENG] [GEN] [S1] [S2] [B1] [B2] [B3] [A1] [GEN] [SLR]`);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1e293b] hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition shrink-0"
        >
          <Train className="w-3.5 h-3.5 text-cyan-400" />
          <span>Coach</span>
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#1e293b] hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition shrink-0"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Share</span>
        </button>

        {/* Toggle Map View button */}
        <button
          onClick={onToggleMap}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition shrink-0 ${
            showMap
              ? 'bg-blue-600 text-white border-blue-400'
              : 'bg-[#1e293b] hover:bg-slate-700 text-white border-slate-700'
          }`}
        >
          <Map className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showMap ? 'Hide Map' : 'View Map'}</span>
        </button>
      </div>

      {/* Arrival / Day / Departure Subheader */}
      <div className="bg-[#0f172a] px-4 py-2 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 border-b border-slate-800/80">
        <span className="w-16">Arrival</span>
        <span className="text-white text-xs">{dayDates[1]}</span>
        <span className="w-16 text-right">Departure</span>
      </div>

      {/* Station List with Blue Vertical Track Line (From screenshot) */}
      <div className="relative p-2 sm:p-4">
        {/* Solid Blue Vertical Railway Track Line */}
        <div className="absolute left-[88px] sm:left-[96px] top-6 bottom-6 w-[5px] bg-[#0284c7] rounded-full shadow-sm z-0"></div>

        {Object.entries(stopsByDay).map(([dayStr, dayStops]) => {
          const dayNum = parseInt(dayStr, 10);

          return (
            <div key={dayNum} className="space-y-4 mb-4">
              {/* Day Divider (e.g. Day 2 - Sep 28, Mon) */}
              {dayNum > 1 && (
                <div className="flex items-center justify-center my-6 relative z-10">
                  <div className="bg-[#1e293b] px-4 py-1 rounded-full text-[11px] font-bold text-slate-300 border border-slate-700 shadow-md">
                    {dayDates[dayNum] || `Day ${dayNum}`}
                  </div>
                </div>
              )}

              {dayStops.map((stop: StationStop, idx: number) => {
                const isOrigin = idx === 0 && dayNum === 1;
                const isPassed = stop.status === 'passed';
                const isCurrent = stop.status === 'current';

                return (
                  <div
                    key={stop.stationCode}
                    className="relative flex items-start py-2 group hover:bg-slate-800/20 rounded-xl px-1 transition"
                  >
                    {/* Left: Arrival Times */}
                    <div className="w-16 sm:w-20 text-right pr-2 shrink-0 font-mono text-xs">
                      {isOrigin ? (
                        <span className="text-slate-500 font-sans text-[11px]">Origin</span>
                      ) : (
                        <>
                          <div className="text-white font-semibold">{stop.arrivalTime}</div>
                          <div className="text-[#f87171] font-bold text-[11px]">
                            {stop.actualArrival || stop.arrivalTime}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Track Node (Circle on the blue line) */}
                    <div className="relative z-10 flex items-center justify-center w-6 h-6 shrink-0 -ml-1 mr-3">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white transition shadow-md ${
                          isCurrent
                            ? 'bg-[#38bdf8] scale-125 shadow-cyan-500 animate-pulse'
                            : isPassed
                            ? 'bg-[#0284c7]'
                            : 'bg-white'
                        }`}
                      ></div>
                    </div>

                    {/* Center: Station Name, Distance & Platform */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                        {stop.stationName}
                      </h4>

                      <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                        <span>{stop.distanceKm} km</span>
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900/60 text-[11px] text-slate-300">
                          <span>Platform {stop.platform || '1'}</span>
                          <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Get Directions feature for Origin station (From screenshot) */}
                      {isOrigin && (
                        <div className="mt-2 text-xs">
                          <p className="text-slate-400 text-[11px] mb-1">Find your way to the station</p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              stop.stationName + ' railway station'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1e293b] hover:bg-slate-700 text-cyan-300 border border-slate-700 transition font-medium"
                          >
                            <span className="text-base">📍</span>
                            <span>Get directions</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right: Departure Times */}
                    <div className="w-16 sm:w-20 text-right shrink-0 font-mono text-xs">
                      {stop.departureTime === 'Destination' ? (
                        <span className="text-slate-500 font-sans text-[11px]">Dest.</span>
                      ) : (
                        <>
                          <div className="text-white font-semibold">{stop.departureTime}</div>
                          <div className="text-[#f87171] font-bold text-[11px]">
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

      {/* Floating Buttons: Map Pin Toggle (Bottom Left) & Refresh (Bottom Right) */}
      <div className="fixed sm:absolute bottom-20 left-4 z-40">
        <button
          onClick={onToggleMap}
          className="w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center shadow-2xl border-2 border-slate-700 transition active:scale-95 group"
          title="Toggle Full Satellite Map View"
        >
          <span className="text-2xl group-hover:scale-110 transition">📍</span>
        </button>
      </div>

      <div className="fixed sm:absolute bottom-20 right-4 z-40">
        <button
          onClick={handleRefresh}
          className="w-12 h-12 rounded-full bg-[#38bdf8] hover:bg-[#0284c7] text-[#0a0f1d] flex items-center justify-center shadow-2xl transition active:scale-95"
          title="Refresh Live Status"
        >
          <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Bottom Live Tracking Status Drawer (From screenshot) */}
      <div className="fixed sm:absolute bottom-0 left-0 right-0 bg-[#162032] border-t border-slate-800 px-5 py-3.5 z-30 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-[#f87171] flex items-center space-x-1.5">
              <span>●</span>
              <span>{train.currentStatus.statusText || `3 km to ${train.currentStatus.nextStationName}`}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {train.currentStatus.lastUpdated || 'Updated few seconds ago'}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 font-mono text-cyan-400 font-bold text-xs border border-slate-700">
              ⚡ {train.currentStatus.speedKmH} km/h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
