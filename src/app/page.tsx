'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import UnifiedSearchBar from '@/components/UnifiedSearchBar';
import UnifiedRouteTimeline from '@/components/UnifiedRouteTimeline';
import StationBoard from '@/components/StationBoard';
import PnrChecker from '@/components/PnrChecker';
import SeatFareInquiry from '@/components/SeatFareInquiry';
import { POPULAR_TRAINS } from '@/data/trainData';
import { TrainDetails } from '@/types';
import {
  Wifi,
  Train,
  CheckCircle2,
  Map,
  List,
  Columns,
  Sparkles,
} from 'lucide-react';

const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-3xl bg-slate-900/90 flex items-center justify-center border border-white/10 text-cyan-400">
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span className="text-sm font-semibold">Loading Live Satellite Radar Map...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedTrain, setSelectedTrain] = useState<TrainDetails>(POPULAR_TRAINS[5] || POPULAR_TRAINS[0]);
  const [activeView, setActiveView] = useState<'tracker' | 'board' | 'pnr' | 'fare'>('tracker');
  const [trackerMode, setTrackerMode] = useState<'timeline' | 'map' | 'split'>('timeline');
  const [isLiveTelemetryActive, setIsLiveTelemetryActive] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Fetch real-time live train data whenever a train is selected or searched
  const fetchLiveStatusForTrain = async (trainNo: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/live-status?trainNo=${trainNo}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedTrain(json.data);
        setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

  const isWideContainer = activeView === 'tracker' && trackerMode === 'split';

  return (
    <div className="min-h-screen flex flex-col bg-[#070d1d] selection:bg-blue-600 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {/* Live Telemetry Status Bar */}
      <div className="bg-slate-950/70 border-b border-white/5 py-2.5">
        <div className={`mx-auto px-4 sm:px-6 ${isWideContainer ? 'max-w-6xl' : 'max-w-4xl'}`}>
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
              {/* Tracker Display Switcher (Timeline vs Map vs Split) */}
              {activeView === 'tracker' && (
                <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-xl border border-white/5">
                  <button
                    onClick={() => setTrackerMode('timeline')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      trackerMode === 'timeline'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Timeline Focus"
                  >
                    <List className="w-3 h-3" />
                    <span className="hidden sm:inline">Timeline</span>
                  </button>
                  <button
                    onClick={() => setTrackerMode('map')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      trackerMode === 'map'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Live Radar Map"
                  >
                    <Map className="w-3 h-3" />
                    <span className="hidden sm:inline">GPS Map</span>
                  </button>
                  <button
                    onClick={() => setTrackerMode('split')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      trackerMode === 'split'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Split Screen"
                  >
                    <Columns className="w-3 h-3" />
                    <span className="hidden sm:inline">Split</span>
                  </button>
                </div>
              )}

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
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 ${isWideContainer ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {/* Universal Search Bar (Always visible in tracker mode) */}
        {activeView === 'tracker' && (
          <UnifiedSearchBar
            selectedTrain={selectedTrain}
            onSelectTrain={handleSelectTrain}
            onSearchTrainNumber={handleSearchTrainNumber}
          />
        )}

        {/* PRIMARY VIEW: Live Tracker */}
        {activeView === 'tracker' && (
          <div className="w-full">
            {trackerMode === 'timeline' && (
              <UnifiedRouteTimeline
                train={selectedTrain}
                onRefresh={() => fetchLiveStatusForTrain(selectedTrain.trainNumber)}
                isRefreshing={isRefreshing}
              />
            )}

            {trackerMode === 'map' && (
              <div className="space-y-4">
                <LiveMap train={selectedTrain} />
              </div>
            )}

            {trackerMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div>
                  <UnifiedRouteTimeline
                    train={selectedTrain}
                    onRefresh={() => fetchLiveStatusForTrain(selectedTrain.trainNumber)}
                    isRefreshing={isRefreshing}
                  />
                </div>
                <div className="sticky top-20">
                  <LiveMap train={selectedTrain} />
                </div>
              </div>
            )}
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
        <div className={`mx-auto px-4 sm:px-6 ${isWideContainer ? 'max-w-6xl' : 'max-w-3xl'}`}>
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
