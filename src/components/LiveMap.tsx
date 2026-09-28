'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TrainDetails, StationStop } from '@/types';
import { Layers, Navigation, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface LiveMapProps {
  train: TrainDetails;
}

// Controller component to smoothly pan/zoom when the selected train or coordinates change
function MapCenterController({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 7, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

// Helper: Fit bounds to show entire route comfortably
function FitBoundsController({ routeCoords }: { routeCoords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 1) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [routeCoords, map]);
  return null;
}

// Clean, sleek, non-cluttering realistic Locomotive Icon
const createCleanLocomotiveIcon = (trainNumber: string, speed: number) => {
  return L.divIcon({
    className: 'custom-clean-train',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
        
        <!-- Compact Floating Speed & Number Badge (Single Clean Pill) -->
        <div style="
          background: #020617;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          font-family: ui-monospace, SFMono-Regular, monospace;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1.5px solid #38bdf8;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 4px;
          z-index: 50;
        ">
          <span style="color: #4ade80;">●</span>
          <span style="color: #38bdf8;">${trainNumber}</span>
          <span style="color: #fbbf24;">${speed} km/h</span>
        </div>

        <!-- Train Locomotive Engine Container -->
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <!-- Radar Pulse Wave -->
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(14, 165, 233, 0.35);
            animation: radar-pulse 2s infinite;
          "></div>

          <!-- Realistic Aerodynamic High-Speed Bullet Locomotive -->
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #0284c7, #0f172a);
            border: 2px solid #ffffff;
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
          ">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="8" width="28" height="32" rx="7" fill="url(#locoGrad2)" stroke="#38bdf8" stroke-width="1.5"/>
              <path d="M14 13C14 11.3431 15.3431 10 17 10H31C32.6569 10 34 11.3431 34 13V18H14V13Z" fill="#090d16" stroke="#38bdf8" stroke-width="0.8"/>
              <circle cx="16" cy="22" r="2.2" fill="#fef08a"/>
              <circle cx="32" cy="22" r="2.2" fill="#fef08a"/>
              <line x1="16" y1="28" x2="32" y2="28" stroke="#38bdf8" stroke-width="1.5"/>
              <defs>
                <linearGradient id="locoGrad2" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#ffffff"/>
                  <stop offset="0.4" stop-color="#7dd3fc"/>
                  <stop offset="1" stop-color="#0284c7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -28],
  });
};

// Clean, compact, non-overlapping station pin
// Uses sleek dot with a clean, unobtrusive label that avoids giant black boxes!
const createCleanStationIcon = (
  status: 'passed' | 'current' | 'upcoming',
  name: string,
  code: string,
  platform: string,
  isMajor: boolean
) => {
  let pinColor = '#94a3b8'; // upcoming: slate
  let glowColor = 'rgba(148, 163, 184, 0.4)';

  if (status === 'passed') {
    pinColor = '#10b981'; // emerald
    glowColor = 'rgba(16, 185, 129, 0.6)';
  } else if (status === 'current') {
    pinColor = '#38bdf8'; // cyan
    glowColor = 'rgba(56, 189, 248, 0.9)';
  }

  // Shorten name if too long to prevent horizontal clutter
  const displayName = name.replace(' Junction', ' Jn').replace(' Central', ' Ctrl');

  return L.divIcon({
    className: 'custom-station-clean',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
        
        <!-- Compact, non-overlapping station chip -->
        <div style="
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(4px);
          border: 1px solid ${pinColor};
          border-radius: 6px;
          padding: 1px 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          pointer-events: auto;
          margin-bottom: 3px;
        ">
          <span style="font-size: 10px; font-weight: 700; color: #ffffff;">${displayName}</span>
          <span style="font-size: 8px; font-weight: 800; color: #38bdf8; background: #020617; padding: 0.5px 3px; border-radius: 3px;">${code}</span>
          ${platform && platform !== '0' ? `<span style="font-size: 8px; font-weight: 700; color: #fbbf24;">P${platform}</span>` : ''}
        </div>

        <!-- Sleek Halt Dot on Railway Track -->
        <div style="
          width: ${status === 'current' ? '12px' : '9px'};
          height: ${status === 'current' ? '12px' : '9px'};
          border-radius: 50%;
          background: ${pinColor};
          border: 1.5px solid #ffffff;
          box-shadow: 0 0 6px ${glowColor};
          transition: transform 0.2s;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -18],
  });
};

export default function LiveMap({ train }: LiveMapProps) {
  const currentCoords = train.currentStatus.currentCoordinates;
  const routeCoords: [number, number][] = train.stops.map((s) => s.coordinates);

  const [mapTile, setMapTile] = useState<'esri-dark' | 'esri-street' | 'osm'>('esri-dark');
  const [livePos, setLivePos] = useState<[number, number]>(currentCoords);

  useEffect(() => {
    setLivePos(train.currentStatus.currentCoordinates);
  }, [train]);

  const tileUrls = {
    'esri-dark': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    'esri-street': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0f1d]">
      {/* Floating Info Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-extrabold text-white tracking-wide">
            {train.trainNumber} - {train.trainName}
          </span>
        </div>
        <p className="text-xs text-cyan-300 mt-0.5 font-medium">
          {train.currentStatus.statusText}
        </p>
      </div>

      {/* Floating Style Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-[400] flex items-center space-x-2">
        <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border border-white/10 flex items-center space-x-1 shadow-2xl">
          <button
            onClick={() => setMapTile('esri-dark')}
            className={`px-3 py-1.5 text-xs rounded-xl font-bold transition ${
              mapTile === 'esri-dark' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Night Radar
          </button>
          <button
            onClick={() => setMapTile('esri-street')}
            className={`px-3 py-1.5 text-xs rounded-xl font-bold transition ${
              mapTile === 'esri-street' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Railway Lines
          </button>
          <button
            onClick={() => setMapTile('osm')}
            className={`px-3 py-1.5 text-xs rounded-xl font-bold transition ${
              mapTile === 'osm' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            OpenStreetMap
          </button>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={currentCoords}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap'
          url={tileUrls[mapTile]}
        />

        <MapCenterController coords={livePos} />
        <FitBoundsController routeCoords={routeCoords} />

        {/* Clean Railway Track Route Polyline */}
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: '#38bdf8',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8',
          }}
        />

        {/* Clean, Realistic Locomotive Train Marker */}
        <Marker
          position={livePos}
          icon={createCleanLocomotiveIcon(train.trainNumber, train.currentStatus.speedKmH)}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
                <span className="font-mono font-bold text-white text-base">{train.trainNumber}</span>
                <span className="text-cyan-400 text-xs font-semibold">{train.trainName}</span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                <p className="flex justify-between">
                  <span className="text-slate-400">Current Velocity:</span>{' '}
                  <strong className="text-cyan-400 font-mono font-bold">{train.currentStatus.speedKmH} km/h</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Next Station:</span>{' '}
                  <strong className="text-white">{train.currentStatus.nextStationName}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Next ETA:</span>{' '}
                  <strong className="text-emerald-400">{train.currentStatus.estimatedArrivalNext}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Status:</span>{' '}
                  <span className={train.currentStatus.delayMinutes > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {train.currentStatus.delayMinutes > 0 ? `${train.currentStatus.delayMinutes}m Late` : 'Right Time'}
                  </span>
                </p>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Non-overlapping, clean station pins */}
        {train.stops.map((stop: StationStop, idx: number) => {
          const isMajor = idx === 0 || idx === train.stops.length - 1 || stop.status === 'current';

          return (
            <Marker
              key={`${stop.stationCode}-${idx}`}
              position={stop.coordinates}
              icon={createCleanStationIcon(stop.status, stop.stationName, stop.stationCode, stop.platform, isMajor)}
            >
              <Popup>
                <div className="p-1 text-xs text-slate-200 min-w-[190px]">
                  <div className="font-bold text-white text-sm border-b border-slate-800 pb-1">
                    {stop.stationName} ({stop.stationCode})
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Platform:</span>{' '}
                      <strong className="text-cyan-400 font-mono text-sm">PF {stop.platform || '1'}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Scheduled Arrival:</span>{' '}
                      <span className="font-mono">{stop.arrivalTime}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Scheduled Departure:</span>{' '}
                      <span className="font-mono">{stop.departureTime}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Status:</span>{' '}
                      <span
                        className={`font-bold capitalize ${
                          stop.status === 'passed'
                            ? 'text-emerald-400'
                            : stop.status === 'current'
                            ? 'text-cyan-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {stop.status === 'passed' ? 'Departed' : stop.status === 'current' ? 'Halting Now' : 'Upcoming'}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Track Distance:</span>{' '}
                      <span className="font-mono">{stop.distanceKm} km</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Clean Bottom Legend Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 font-medium">Departed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300 font-medium">Train Location</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span className="text-slate-300 font-medium">Upcoming Halt</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-300 font-medium">
          <span>
            Total Track: <strong className="text-white font-mono">{train.totalDistanceKm} km</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Duration: <strong className="text-white font-mono">{train.travelDuration}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
