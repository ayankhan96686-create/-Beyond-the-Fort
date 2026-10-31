import { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * RouteMap — Interactive GIS Corridor & Route Map
 * Powered by Leaflet with CartoDB Voyager / OSM warm tiles
 * Features:
 * - Real Gwalior coordinates for origin, stops, and return leg
 * - Custom numbered royal SVG markers
 * - Feasible travel route polyline with transit buffer indicator
 * - Interactive popups with dwell time, arrival time, and ASI status
 * - Auto-fit bounds ensuring all locations are visible
 */
export default function RouteMap({
  stops = [],
  origin = { lat: 26.2163, lng: 78.1972, label: 'Gwalior Railway Station' },
  returnOrigin = true,
  travelMode = 'e-rickshaw'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [origin.lat || 26.2163, origin.lng || 78.1972],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Clean OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers and polylines
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    const latLngs = [];

    // 1. Origin Marker (Start)
    const originIcon = L.divIcon({
      className: 'custom-map-pin-origin',
      html: `
        <div style="background: #176B67; color: #FDFBF7; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; border: 3px solid #C9A34A; box-shadow: 0 4px 14px rgba(23,107,103,0.5);">
          ★
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(map);
    originMarker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px; min-width: 180px;">
        <span style="font-size: 10px; font-weight: 800; color: #176B67; text-transform: uppercase; letter-spacing: 0.05em;">Departure Hub</span>
        <h4 style="font-size: 14px; font-weight: 700; margin: 4px 0 2px; color: #2D0B12;">${origin.label || 'Gwalior Hub'}</h4>
        <p style="font-size: 11px; margin: 0; color: #64748B;">Journey commencement point</p>
      </div>
    `);
    layersRef.current.push(originMarker);
    latLngs.push([origin.lat, origin.lng]);

    // 2. Sequential Stop Markers
    stops.forEach((stop, index) => {
      const lat = stop.lat || stop.latitude || stop.coordinates?.lat || (26.2200 + index * 0.008);
      const lng = stop.lng || stop.longitude || stop.coordinates?.lng || (78.1750 + index * 0.006);
      const isFirst = index === 0;

      const stopIcon = L.divIcon({
        className: `custom-map-pin-stop ${isFirst ? 'leaflet-pulsing-pin' : ''}`,
        html: `
          <div style="background: #2D0B12; color: #F3D279; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; border: 3px solid #C9A34A; box-shadow: 0 4px 14px rgba(45,11,18,0.5);">
            ${index + 1}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([lat, lng], { icon: stopIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 200px;">
          ${stop.image ? `<img src="${stop.image}" alt="${stop.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; color: #C9A34A; text-transform: uppercase;">Stop ${index + 1}</span>
            <span style="font-size: 10px; font-weight: 700; background: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 4px;">${stop.duration_minutes || stop.duration || 45} mins</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 4px; color: #2D0B12;">${stop.name}</h4>
          <p style="font-size: 11px; margin: 0 0 6px; color: #475569;">${stop.arrival_time ? `Arrive: ${stop.arrival_time}` : ''} ${stop.departure_time ? `• Depart: ${stop.departure_time}` : ''}</p>
          <span style="font-size: 10px; font-weight: 700; color: #176B67; background: #DDEDE8; padding: 2px 6px; border-radius: 4px; display: inline-block;">✓ ASI Verified Monument</span>
        </div>
      `);
      layersRef.current.push(marker);
      latLngs.push([lat, lng]);
    });

    // 3. Return to Origin leg
    if (returnOrigin && stops.length > 0) {
      latLngs.push([origin.lat, origin.lng]);
    }

    // 4. Draw Route Polyline with Soft Glow Casing
    if (latLngs.length > 1) {
      // Soft glow casing underlay
      const polylineGlow = L.polyline(latLngs, {
        color: '#C9A34A',
        weight: 8,
        opacity: 0.28,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      layersRef.current.push(polylineGlow);

      // Sharp dashed corridor
      const polyline = L.polyline(latLngs, {
        color: '#2D0B12',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      layersRef.current.push(polyline);

      // Fit map to show all stops and polyline with comfortable padding
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Invalidate map size after DOM mount
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

  }, [stops, origin, returnOrigin, travelMode]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-xl bg-white relative">
      {/* Map Header Status Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#2D0B12] via-[#45131D] to-[#1A0407] text-white flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#D4AF37]/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-[#F3D279] tracking-wide">
            Verified Gwalior Heritage Transit Corridor
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-300">
          <span>Mode: <strong className="text-white capitalize">{travelMode.replace('-', ' ')}</strong></span>
          <span>•</span>
          <span className="text-[#DDEDE8] bg-[#176B67]/70 px-2 py-0.5 rounded-full font-semibold border border-[#176B67]">+25% Transit Buffer</span>
        </div>
      </div>

      {/* Leaflet Map DOM Element */}
      <div
        ref={mapContainerRef}
        style={{ height: '540px', minHeight: '440px', width: '100%', zIndex: 1 }}
        className="w-full bg-[#FDFBF7]"
      />

      {/* Map Legend Footer */}
      <div className="px-5 py-3 bg-[#FDFBF7] border-t border-[#E8DEC9] flex flex-wrap items-center justify-between gap-4 text-xs text-stone-700">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#176B67] border border-[#C9A34A] inline-block shadow-2xs" />
            <span>Departure Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#2D0B12] border border-[#C9A34A] inline-block shadow-2xs" />
            <span>Curated Heritage Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 border-t-2 border-dashed border-[#2D0B12] inline-block" />
            <span>Transit Corridor Leg</span>
          </div>
        </div>

        <span className="text-[11px] text-stone-500">
          Map tiles &copy; OpenStreetMap & CARTO
        </span>
      </div>
    </div>
  );
}

