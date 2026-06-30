'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
  height?: string;
}

export default function LeafletMap({
  latitude,
  longitude,
  onChange,
  height = '240px'
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Leaflet scripts & styles from CDN dynamically to avoid compilation or SSR mismatches
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Leaflet is already loaded globally
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // 1. Inject Stylesheet
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // 2. Inject Script
    const scriptId = 'leaflet-cdn-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.onload = () => {
        setLeafletLoaded(true);
      };
      script.onerror = () => {
        setLoadError('Failed to load map library.');
      };
      document.body.appendChild(script);
    } else {
      // Script tag exists, wait for L to be defined
      const interval = setInterval(() => {
        if ((window as any).L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Initialize and update the Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const center: [number, number] = [latitude, longitude];

    // If map isn't initialized yet
    if (!mapInstanceRef.current) {
      // Fix marker icon broken paths due to bundlers
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // 1. Initialize Map
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(center, 16);

      // 2. Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // 3. Add Draggable Marker
      const marker = L.marker(center, {
        draggable: true
      }).addTo(map);

      // 4. Bind Drag End Event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange({
          latitude: position.lat,
          longitude: position.lng
        });
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    } else {
      // If map is already initialized, check if we need to update marker position
      // Only pan/setLatLng if coordinates changed significantly from user's manual drag
      const marker = markerInstanceRef.current;
      const currentPos = marker.getLatLng();
      
      const threshold = 0.00001; // Avoid small rounding updates causing pan loops
      if (Math.abs(currentPos.lat - latitude) > threshold || Math.abs(currentPos.lng - longitude) > threshold) {
        const center: [number, number] = [latitude, longitude];
        mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
        marker.setLatLng(center);
      }
    }
  }, [leafletLoaded, latitude, longitude, onChange]);

  // Handle container unmount specifically
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className="w-full bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl p-3 text-center">
        {loadError}
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/60 z-10">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%' }}
        className="z-0"
      />
    </div>
  );
}
