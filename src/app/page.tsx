'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UnifiedSearchBar from '@/components/UnifiedSearchBar';
import UnifiedRouteTimeline from '@/components/UnifiedRouteTimeline';
import StationBoard from '@/components/StationBoard';
import PnrChecker from '@/components/PnrChecker';
import SeatFareInquiry from '@/components/SeatFareInquiry';
import { POPULAR_TRAINS } from '@/data/trainData';
import { TrainDetails } from '@/types';
import {
  Activity,
  Wifi,
  Train,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [selectedTrain, setSelectedTrain] = useState<TrainDetails>(POPULAR_TRAINS[0]);
  const [activeView, setActiveView] = useState<'tracker' | 'board' | 'pnr' | 'fare'>('tracker');
  const [isLiveTelemetryActive, setIsLiveTelemetryActive] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch real-time live train data whenever a train is selected or searched
  const fetchLiveStatusForTrain = async (trainNo: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/live-status?trainNo=${trainNo}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedTrain(json.data);
      }
    } catch (err) {
      console.warn('Failed to fetch real-time train status:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLiveStatusForTrain('12835');
  }, []);

  // Periodic live telemetry refresh every 15 seconds
  useEffect(() => {
    if (!isLiveTelemetryActive || activeView !== 'tracker') return;

    const interval = setInterval(() => {
      fetchLiveStatusForTrain(selectedTrain.trainNumber);
    }, 15000);

    return () => clearInterval(interval);
  }, [isLiveTelemetryActive, selectedTrain.trainNumber, activeView]);

  const handleSelectTrain = (train: TrainDetails) => {
    setSelectedTrain(train);
    fetchLiveStatusForTrain(train.trainNumber);
    setActiveView('tracker');
  };

  const handleSearchTrainNumber = (trainNumber: string) => {
    fetchLiveStatusForTrain(trainNumber);
    setActiveView('tracker');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d1d] selection:bg-blue-600 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {/* Live Telemetry Status Bar */}
      <div className="bg-slate-950/70 border-b border-white/5 py-2.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold tracking-wide">
                INDIAN RAILWAYS LIVE TELEMETRY &bull; 100% REAL TIME
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLiveTelemetryActive(!isLiveTelemetryActive)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-[11px] font-semibold transition ${
                  isLiveTelemetryActive
                    ? 'bg-blue-600/20 text-cyan-300 border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Wifi className="w-3 h-3" />
                <span>Live Feed: {isLiveTelemetryActive ? 'SYNCING (15s)' : 'PAUSED'}</span>
              </button>
              <span className="text-slate-400 hidden sm:inline">RTIS Live Feed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Universal Search Bar (Always visible in tracker mode) */}
        {activeView === 'tracker' && (
          <UnifiedSearchBar
            selectedTrain={selectedTrain}
            onSelectTrain={handleSelectTrain}
            onSearchTrainNumber={handleSearchTrainNumber}
          />
        )}

        {/* PRIMARY VIEW: Full-Focus Route Timeline (Map removed as requested) */}
        {activeView === 'tracker' && (
          <div className="w-full">
            <UnifiedRouteTimeline
              train={selectedTrain}
              onRefresh={() => fetchLiveStatusForTrain(selectedTrain.trainNumber)}
              isRefreshing={isRefreshing}
            />
          </div>
        )}

        {/* VIEW 2: Station Electronic Display Board */}
        {activeView === 'board' && (
          <div className="space-y-6">
            <StationBoard />
          </div>
        )}

        {/* VIEW 3: Live PNR Status Check */}
        {activeView === 'pnr' && (
          <div className="space-y-6">
            <PnrChecker />
          </div>
        )}

        {/* VIEW 4: Seat Availability & Fares */}
        {activeView === 'fare' && (
          <div className="space-y-6">
            <SeatFareInquiry />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-cyan-400">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Where is My Train &bull; RailTrack</p>
                <p className="text-[11px] text-slate-400">Real-time Indian Railways Live Train Running Schedule</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
