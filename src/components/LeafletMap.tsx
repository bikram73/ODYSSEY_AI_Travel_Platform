import React, { useEffect, useRef } from "react";
import L from "leaflet";

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  popupContent?: string | HTMLElement;
  color?: string; // Marker pin color, e.g. '#00355f' or hex
  numberLabel?: string; // Optional number label like '1', '2' inside pin
  safetyLevel?: "safe" | "moderate" | "risky"; // For styling circle boundaries
  scamsCount?: number;
}

interface LeafletMapProps {
  markers: MapMarker[];
  route?: [number, number][]; // Line coordinates tracking itineraries sequential order
  center?: [number, number]; // Fallback center coords
  zoom?: number; // Fallback zoom
  theme?: "standard" | "dark" | "muted" | "satellite";
  heightClass?: string; // e.g. "h-[400px]" or "h-full"
  showSafetyHeatCircles?: boolean;
  onMarkerClick?: (index: number) => void;
}

export function LeafletMap({
  markers,
  route,
  center,
  zoom,
  theme = "muted",
  heightClass = "h-[400px]",
  showSafetyHeatCircles = false,
  onMarkerClick,
}: LeafletMapProps) {
  const [activeTheme, setActiveTheme] = React.useState<"standard" | "dark" | "muted" | "satellite">(theme);

  useEffect(() => {
    setActiveTheme(theme);
  }, [theme]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Helper inside loop to render custom styled HTML/SVG leaflet marker pin
  const createCustomDivIcon = (color: string, label?: string) => {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          position: relative;
        ">
          <!-- Multi-ring pulse shadow effect for high craft feel -->
          <div style="
            position: absolute;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: ${color};
            opacity: 0.15;
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="34" height="34" style="
            position: absolute;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
          ">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          ${
            label
              ? `
            <span style="
              position: absolute;
              top: 5px;
              color: #ffffff;
              font-size: 11px;
              font-weight: 800;
              font-family: monospace;
              pointer-events: none;
              text-shadow: 0px 1px 2px rgba(0,0,0,0.4);
            ">${label}</span>
          `
              : ""
          }
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 38],
      popupAnchor: [0, -32],
    });
  };

  // Effect 1: Initialize raw map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing if container references mismatch somehow
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const initialCenter: L.LatLngExpression = center || [20, 0];
    const initialZoom = zoom || (center ? 12 : 2);

    const leafletMap = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      fadeAnimation: true,
    }).setView(initialCenter, initialZoom);

    mapRef.current = leafletMap;
    markerGroupRef.current = L.layerGroup().addTo(leafletMap);

    // Dynamic observer to auto-adjust dimensions when switching tabs
    const resizeObserver = new ResizeObserver(() => {
      leafletMap.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Force extra layout reflows immediately after mount to prevent blank loading issues
    const mountTimeout = setTimeout(() => {
      leafletMap.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(mountTimeout);
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount for absolute state persistence

  // Effect 1.5: Swap Tile Layers dynamically without destroying map, route lines, or marks
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attribution = '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

    if (activeTheme === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://carto.com/attributions">CartoDB</a>';
    } else if (activeTheme === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles &copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
    } else if (activeTheme === "muted") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://carto.com/attributions">CartoDB</a>';
    }

    const newLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [activeTheme]);

  // Effect 2: Update markers, routes, and overlays inside map
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    // Immediately trigger layout size invalidation before repainting
    map.invalidateSize();

    // Clear ghost markers prior to repainting
    markerGroup.clearLayers();

    const leafletMarkerInstances: L.Marker[] = [];

    markers.forEach((m, idx) => {
      if (isNaN(m.lat) || isNaN(m.lng)) return;

      const markerColor = m.color || "#0f4c81";
      const customIcon = createCustomDivIcon(markerColor, m.numberLabel);

      const marker = L.marker([m.lat, m.lng], { icon: customIcon });

      if (m.popupContent) {
        if (m.popupContent instanceof HTMLElement) {
          marker.bindPopup(m.popupContent);
        } else {
          marker.bindPopup(`
            <div style="font-family: inherit; min-width: 160px; max-width: 240px; padding: 4px;">
              <b style="font-size: 13px; color: #1e293b; display: block; margin-bottom: 4px;">${m.title}</b>
              <div style="font-size: 11px; color: #475569; line-height: 1.5;">${m.popupContent}</div>
            </div>
          `);
        }
      }

      if (onMarkerClick) {
        marker.on("click", () => {
          onMarkerClick(idx);
        });
      }

      marker.addTo(markerGroup);
      leafletMarkerInstances.push(marker);

      // Support for safety heatmap colored visual circles around risky/monitored coordinates
      if (showSafetyHeatCircles) {
        let circleColor = "#10B981"; // default safe green
        let circleOpacity = 0.15;
        let circleRadius = 500; // in meters

        if (m.safetyLevel === "risky") {
          circleColor = "#EF4444"; // red warning
          circleOpacity = 0.3;
          circleRadius = 800;
        } else if (m.safetyLevel === "moderate") {
          circleColor = "#F59E0B"; // orange warning
          circleOpacity = 0.22;
          circleRadius = 600;
        }

        L.circle([m.lat, m.lng], {
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: circleOpacity,
          radius: circleRadius,
          weight: 1.5,
          dashArray: m.safetyLevel === "risky" ? "5, 5" : undefined,
        }).addTo(markerGroup).bindPopup(`
          <div style="font-family: inherit; font-size: 11px; padding: 4px;">
            <span style="font-weight: 800; color: ${circleColor}; text-transform: uppercase; font-size: 9px; display: block;">
              ⚠️ Safety Buffer Zone (${m.safetyLevel})
            </span>
            <div style="margin-top: 4px; font-weight: 600; color: #334155;">
              Safety scanning registered ${m.scamsCount || 0} active advisory warnings in this local region.
            </div>
          </div>
        `);
      }
    });

    // Draw routing arrows and line connections
    if (route && route.length > 1) {
      // Draw solid backline polyline for aesthetic depth
      L.polyline(route, {
        color: "#1e293b",
        weight: 6,
        opacity: 0.15,
      }).addTo(markerGroup);

      // Main styled dashed itinerary connector polyline
      L.polyline(route, {
        color: "#006a61",
        weight: 3.5,
        opacity: 0.85,
        dashArray: "10, 8",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(markerGroup);

      // Stagger small circles in coordinates midpoint to indicate traversal direction arrow
      for (let i = 0; i < route.length - 1; i++) {
        const pt1 = route[i];
        const pt2 = route[i+1];
        const midLat = (pt1[0] + pt2[0]) / 2;
        const midLng = (pt1[1] + pt2[1]) / 2;
        
        L.circleMarker([midLat, midLng], {
          radius: 3.5,
          color: "#006a61",
          fillColor: "#ffffff",
          fillOpacity: 1,
          weight: 2,
        }).addTo(markerGroup).bindPopup(`
          <div style="font-family: inherit; font-size: 10px; font-weight: 600; text-align: center;">
            ➔ Route Leg ${i+1} to ${i+2}
          </div>
        `);
      }
    }

    // Auto fit bounds to enclose all coordinates perfectly with appropriate padding frames,
    // backed by a delayed size invalidation to ensure dynamic rendering dimensions have painted
    const mapBoundsTimeout = setTimeout(() => {
      if (!map) return;
      map.invalidateSize();
      if (leafletMarkerInstances.length > 1) {
        const group = L.featureGroup(leafletMarkerInstances);
        map.fitBounds(group.getBounds(), {
          padding: [42, 42],
          maxZoom: 15,
        });
      } else if (leafletMarkerInstances.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], 13);
      } else if (center) {
        map.setView(center, zoom || 12);
      }
    }, 150);

    return () => {
       clearTimeout(mapBoundsTimeout);
    };
  }, [markers, route, showSafetyHeatCircles, center, zoom]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/50 bg-[#eff4ff]/20 shadow-xs group ${heightClass}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {/* Floating Interactive Map Styles Switcher */}
      <div className="absolute top-3 right-3 z-30 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-md flex items-center gap-1 text-[10px] font-semibold text-slate-300">
        <span className="text-slate-400 select-none mr-1 font-mono uppercase tracking-wider text-[8px] border-r border-slate-800/80 pr-1.5 pl-1 hidden sm:inline-block">MAP STYLE</span>
        <button
          onClick={() => setActiveTheme("standard")}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[10px] ${
            activeTheme === "standard"
              ? "bg-[#0d9488] text-white font-bold"
              : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          Road
        </button>
        <button
          onClick={() => setActiveTheme("dark")}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[10px] ${
            activeTheme === "dark"
              ? "bg-[#0d9488] text-white font-bold"
              : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setActiveTheme("satellite")}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[10px] ${
            activeTheme === "satellite"
              ? "bg-[#0d9488] text-white font-bold"
              : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setActiveTheme("muted")}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[10px] ${
            activeTheme === "muted"
              ? "bg-[#0d9488] text-white font-bold"
              : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          Voyager
        </button>
      </div>

      {/* Decorative Compass watermark bottom-right */}
      <div className="absolute bottom-3 right-3 z-30 pointer-events-none bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-mono text-slate-500 font-bold border border-slate-200 shadow-2xs flex items-center gap-1">
        <span>🗺️ {activeTheme === "satellite" ? "ESRI IMAGERY" : activeTheme === "standard" ? "OPENSTREET MAP" : "CARTODB BASEMAP"}</span>
        <span className="text-slate-300 font-normal">|</span>
        <span className="text-[#006a61]">PORTAL ONLINE</span>
      </div>
    </div>
  );
}
