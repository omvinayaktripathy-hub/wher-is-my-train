'use client';

import React, { useState } from 'react';
import {
  Menu,
  Mic,
  ArrowUpDown,
  Search,
  Train,
  X,
  ChevronRight,
  Ticket,
  MapPin,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { MAJOR_STATIONS, POPULAR_TRAINS } from '@/data/trainData';
import { TrainDetails } from '@/types';

interface WhereIsMyTrainHomeProps {
  onSelectTrain: (train: TrainDetails) => void;
  onOpenPnr: () => void;
  onOpenTickets: () => void;
  onOpenStationBoard: (stationCode: string) => void;
}

export default function WhereIsMyTrainHome({
  onSelectTrain,
  onOpenPnr,
  onOpenTickets,
  onOpenStationBoard,
}: WhereIsMyTrainHomeProps) {
  const [tabType, setTabType] = useState<'Express' | 'Metro'>('Express');

  // Origin and destination states (defaulted to screenshot values)
  const [fromStation, setFromStation] = useState({
    code: 'JSG',
    name: 'Jharsuguda Junction',
  });
  const [toStation, setToStation] = useState({
    code: 'SMVB',
    name: 'SMVT Bengaluru',
  });

  // Direct train number / name input
  const [trainQuery, setTrainQuery] = useState('');

  // Live station input
  const [stationQuery, setStationQuery] = useState({
    code: 'LOGH',
    name: 'Lottegollahalli',
  });

  // Autocomplete dropdowns
  const [fromDropdown, setFromDropdown] = useState(false);
  const [toDropdown, setToDropdown] = useState(false);
  const [stationDropdown, setStationDropdown] = useState(false);

  // Swap origin and destination
  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Find trains between from and to stations
  const handleFindTrains = () => {
    // Find matching train or default to 12835
    const matched = POPULAR_TRAINS.find(
      (t) =>
        (t.sourceCode === fromStation.code && t.destCode === toStation.code) ||
        (t.destCode === fromStation.code && t.sourceCode === toStation.code) ||
        t.trainNumber === '12835'
    );
    onSelectTrain(matched || POPULAR_TRAINS[0]);
  };

  // Direct train search
  const handleDirectTrainSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = trainQuery.trim();
    if (!query) return;

    // Check if matched in preset
    const matched = POPULAR_TRAINS.find(
      (t) =>
        t.trainNumber.toLowerCase() === query.toLowerCase() ||
        t.trainName.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      onSelectTrain(matched);
    } else {
      // Query dynamic real-time data for ANY train number
      onSelectTrain({
        ...POPULAR_TRAINS[0],
        trainNumber: query,
        trainName: `Train #${query}`,
        currentStatus: {
          ...POPULAR_TRAINS[0].currentStatus,
          statusText: `Fetching live GPS telemetry for Train #${query}...`,
        },
      });
    }
  };

  // Direct station search
  const handleStationSearch = () => {
    onOpenStationBoard(stationQuery.code);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0f172a] text-white rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden font-sans">
      {/* Top App Bar (Header from screenshot) */}
      <div className="bg-[#1e293b] px-4 py-3.5 flex items-center justify-between border-b border-slate-700/60 shadow-md">
        <div className="flex items-center space-x-3.5">
          <button className="p-1 text-slate-300 hover:text-white transition">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold tracking-wide text-white">Where is My Train</h1>
        </div>
        <button
          onClick={() => alert('Listening for train name or number... Speak now.')}
          className="p-1.5 text-slate-300 hover:text-cyan-400 transition"
          title="Voice Search"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* Express / Metro Pill Segment */}
      <div className="bg-[#131d2f] px-4 py-2.5 flex items-center justify-center space-x-4 border-b border-slate-800">
        <button
          onClick={() => setTabType('Express')}
          className={`px-8 py-1.5 rounded-full text-sm font-semibold transition ${
            tabType === 'Express'
              ? 'bg-[#1e293b] text-white shadow-inner border border-slate-600/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Express
        </button>
        <button
          onClick={() => setTabType('Metro')}
          className={`px-8 py-1.5 rounded-full text-sm font-semibold transition ${
            tabType === 'Metro'
              ? 'bg-[#1e293b] text-white shadow-inner border border-slate-600/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Metro
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Station-to-Station Card (From screenshot) */}
        <div className="bg-[#162032] rounded-2xl p-4 border border-slate-800 shadow-xl relative">
          <div className="relative">
            {/* Origin Station Row */}
            <div className="relative flex items-center justify-between py-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-3 flex-1">
                <span className="w-4 h-4 rounded-full border-2 border-slate-400 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                </span>
                <span className="bg-[#0284c7] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                  {fromStation.code}
                </span>
                <input
                  type="text"
                  value={fromStation.name}
                  onChange={(e) => {
                    setFromStation({ code: 'STN', name: e.target.value });
                    setFromDropdown(true);
                  }}
                  onFocus={() => setFromDropdown(true)}
                  className="bg-transparent text-white font-medium text-sm focus:outline-none w-full"
                  placeholder="From Station"
                />
              </div>
              <button
                onClick={() => setFromStation({ code: '', name: '' })}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>

              {/* From Station Autocomplete */}
              {fromDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                  {MAJOR_STATIONS.map((st) => (
                    <div
                      key={st.code}
                      onClick={() => {
                        setFromStation({ code: st.code, name: st.name });
                        setFromDropdown(false);
                      }}
                      className="px-3.5 py-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-white">{st.name}</span>
                      <span className="bg-blue-600/30 text-cyan-300 px-2 py-0.5 rounded font-bold">
                        {st.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button (Floating green circular button on the right) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={handleSwap}
                className="w-9 h-9 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center justify-center shadow-lg transition active:scale-95 border-2 border-[#162032]"
                title="Swap Stations"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Dotted Track Connector */}
            <div className="absolute left-[7px] top-[26px] bottom-[26px] w-[2px] border-l-2 border-dotted border-slate-600 pointer-events-none"></div>

            {/* Destination Station Row */}
            <div className="relative flex items-center justify-between py-2 pt-3">
              <div className="flex items-center space-x-3 flex-1">
                <span className="w-4 h-4 rounded-full border-2 border-slate-400 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                </span>
                <span className="bg-[#0284c7] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                  {toStation.code}
                </span>
                <input
                  type="text"
                  value={toStation.name}
                  onChange={(e) => {
                    setToStation({ code: 'STN', name: e.target.value });
                    setToDropdown(true);
                  }}
                  onFocus={() => setToDropdown(true)}
                  className="bg-transparent text-white font-medium text-sm focus:outline-none w-full"
                  placeholder="To Station"
                />
              </div>
              <button
                onClick={() => setToStation({ code: '', name: '' })}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>

              {/* To Station Autocomplete */}
              {toDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                  {MAJOR_STATIONS.map((st) => (
                    <div
                      key={st.code}
                      onClick={() => {
                        setToStation({ code: st.code, name: st.name });
                        setToDropdown(false);
                      }}
                      className="px-3.5 py-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-white">{st.name}</span>
                      <span className="bg-blue-600/30 text-cyan-300 px-2 py-0.5 rounded font-bold">
                        {st.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Big Green "Find trains" Button */}
          <button
            onClick={handleFindTrains}
            className="w-full mt-4 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-base shadow-lg shadow-emerald-900/40 transition active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            <span>Find trains</span>
          </button>
        </div>

        {/* Train No. / Train Name Search Bar (Box 2 from screenshot) */}
        <form
          onSubmit={handleDirectTrainSearch}
          className="bg-[#162032] rounded-2xl p-2.5 pl-3.5 border border-slate-800 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center space-x-3 flex-1">
            <Train className="w-5 h-5 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={trainQuery}
              onChange={(e) => setTrainQuery(e.target.value)}
              placeholder="Train No. / Train Name"
              className="bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none w-full"
            />
          </div>
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center justify-center shadow-md shrink-0 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Live Station Board Search (Box 3 from screenshot) */}
        <div className="relative bg-[#162032] rounded-2xl p-2.5 pl-3.5 border border-slate-800 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2.5 flex-1 mr-2">
            <span className="bg-[#0284c7] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm shrink-0">
              {stationQuery.code}
            </span>
            <input
              type="text"
              value={stationQuery.name}
              onChange={(e) => {
                setStationQuery({ code: 'STN', name: e.target.value });
                setStationDropdown(true);
              }}
              onFocus={() => setStationDropdown(true)}
              placeholder="Station Name"
              className="bg-transparent text-white text-sm font-medium focus:outline-none w-full"
            />
            {stationQuery.name && (
              <button
                onClick={() => setStationQuery({ code: '', name: '' })}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleStationSearch}
            className="w-10 h-10 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center justify-center shadow-md shrink-0 transition"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Station Autocomplete */}
          {stationDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
              {MAJOR_STATIONS.map((st) => (
                <div
                  key={st.code}
                  onClick={() => {
                    setStationQuery({ code: st.code, name: st.name });
                    setStationDropdown(false);
                    onOpenStationBoard(st.code);
                  }}
                  className="px-3.5 py-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{st.name}</span>
                  <span className="bg-blue-600/30 text-cyan-300 px-2 py-0.5 rounded font-bold">
                    {st.code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH HISTORY (Section 4 from screenshot) */}
        <div className="bg-[#162032] rounded-2xl p-4 border border-slate-800 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            SEARCH HISTORY
          </h3>

          <div className="divide-y divide-slate-800/80">
            {/* History Item 1 (Exact from screenshot) */}
            <div
              onClick={() => {
                const t = POPULAR_TRAINS.find((tr) => tr.trainNumber === '12835');
                if (t) onSelectTrain(t);
              }}
              className="py-3 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer px-1 rounded-lg transition"
            >
              <div>
                <span className="font-bold text-white text-sm">12835 SMVT Bengaluru SF E...</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <span>JSG - SMVB</span>
                <ChevronRight className="w-4 h-4 text-[#16a34a]" />
              </div>
            </div>

            {/* History Item 2 (Exact from screenshot) */}
            <div
              onClick={() => {
                const t = POPULAR_TRAINS.find((tr) => tr.trainNumber === '66595');
                if (t) onSelectTrain(t);
              }}
              className="py-3 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer px-1 rounded-lg transition"
            >
              <div>
                <span className="font-bold text-white text-sm">66595 Yesvantpur - Hosur ...</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <span>LOGH - HSRA</span>
                <ChevronRight className="w-4 h-4 text-[#16a34a]" />
              </div>
            </div>

            {/* History Item 3: Vande Bharat */}
            <div
              onClick={() => {
                const t = POPULAR_TRAINS.find((tr) => tr.trainNumber === '22436');
                if (t) onSelectTrain(t);
              }}
              className="py-3 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer px-1 rounded-lg transition"
            >
              <div>
                <span className="font-bold text-white text-sm">22436 Vande Bharat Express</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <span>NDLS - BSB</span>
                <ChevronRight className="w-4 h-4 text-[#16a34a]" />
              </div>
            </div>

            {/* History Item 4: Mumbai Rajdhani */}
            <div
              onClick={() => {
                const t = POPULAR_TRAINS.find((tr) => tr.trainNumber === '12951');
                if (t) onSelectTrain(t);
              }}
              className="py-3 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer px-1 rounded-lg transition"
            >
              <div>
                <span className="font-bold text-white text-sm">12951 Mumbai Rajdhani</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <span>MMCT - NDLS</span>
                <ChevronRight className="w-4 h-4 text-[#16a34a]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: PNR & TICKETS (From screenshot) */}
      <div className="bg-[#1e293b] grid grid-cols-2 divide-x divide-slate-700/60 border-t border-slate-700/60 text-sm font-semibold">
        <button
          onClick={onOpenPnr}
          className="py-3.5 flex items-center justify-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition"
        >
          <Search className="w-4 h-4" />
          <span>PNR</span>
        </button>
        <button
          onClick={onOpenTickets}
          className="py-3.5 flex items-center justify-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition"
        >
          <Ticket className="w-4 h-4" />
          <span>TICKETS</span>
        </button>
      </div>
    </div>
  );
}
