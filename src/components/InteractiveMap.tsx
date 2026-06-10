import React, { useState, useEffect } from "react";
import { Compass, Navigation, Info } from "lucide-react";
import { Activity } from "../types";
import { LeafletMap, MapMarker } from "./LeafletMap";

interface InteractiveMapProps {
  activities: Activity[];
  destinationName: string;
}

export function InteractiveMap({ activities, destinationName }: InteractiveMapProps) {
  const [selectedPin, setSelectedPin] = useState<number | null>(0);

  // Auto-reset selection to the first activity stop when activities update
  useEffect(() => {
    if (activities.length > 0) {
      setSelectedPin(0);
    } else {
      setSelectedPin(null);
    }
  }, [activities]);

  // Estimate distance and travel sequence details based on coordinate delta
  const getTravelTimeAndDistance = () => {
    if (activities.length <= 1) return { distance: "N/A", transport: "Relaxed walking" };
    
    let totalDeg = 0;
    for (let i = 0; i < activities.length - 1; i++) {
      const dx = activities[i+1].lng - activities[i].lng;
      const dy = activities[i+1].lat - activities[i].lat;
      totalDeg += Math.sqrt(dx*dx + dy*dy);
    }
    const distanceKm = Math.max(1.8, Math.round(totalDeg * 111 * 10) / 10);
    const transport = distanceKm < 4 ? "Scenic sidewalk walk" : distanceKm < 15 ? "Eco-friendly metro / shuttle" : "Cab or tourist coaster";
    
    return {
      distance: `${distanceKm} km sequencing`,
      transport
    };
  };

  const { distance, transport } = getTravelTimeAndDistance();

  // Create markers compatible with LeafletMap
  const mapMarkers: MapMarker[] = activities.map((act, index) => ({
    lat: Number(act.lat),
    lng: Number(act.lng),
    title: `Stop ${index + 1}: ${act.activity}`,
    popupContent: `<span style="font-weight: 700; color: #006a61;">📍 ${act.location}</span><br/><span style="font-size:10px; color:#475569;">⏰ ${act.time} &bull; 💰 ${act.cost}</span>`,
    color: selectedPin === index ? "#EF4444" : "#006a61", // Highlight active point as terracotta red
    numberLabel: String(index + 1)
  }));

  const routeCoordinates = activities.map(act => [Number(act.lat), Number(act.lng)] as [number, number]);

  return (
    <div className="relative bg-[#0b1c30] text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col md:flex-row h-auto md:h-[500px]">
      
      {/* Real leafled-map section */}
      <div className="flex-1 relative bg-slate-950 h-[350px] md:h-auto min-h-[300px] md:min-h-full">
        {activities.length > 0 ? (
          <LeafletMap 
            markers={mapMarkers}
            route={routeCoordinates}
            theme="dark"
            heightClass="h-[350px] md:h-full"
            onMarkerClick={(index) => setSelectedPin(index)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <Compass className="w-12 h-12 text-slate-600 animate-pulse mb-3" />
            <p className="text-sm font-display tracking-wide text-slate-300">Ready to plot route vectors</p>
            <p className="text-xs text-slate-500 mt-1">Please insert a target destination in the planner panel</p>
          </div>
        )}
      </div>

      {/* Dynamic Activity Spotlight Panel on Right */}
      <div className="w-full md:w-[320px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-[#6af5e5] tracking-widest font-mono uppercase">
            <Navigation className="w-3.5 h-3.5" />
            <span>ITINERARY CODES</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200 truncate font-display">
              {destinationName || "Custom Expedition"}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              <span>{distance}</span> &bull; <span>{transport}</span>
            </p>
          </div>
 
          {/* Current Pin Spotlight details */}
          {activities.length > 0 && selectedPin !== null && activities[selectedPin] ? (
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 animate-fade-in space-y-2">
              <span className="inline-block bg-[#006a61]/35 text-[#6af5e5] text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold border border-[#006a61]/25">
                Stop {selectedPin + 1}: {activities[selectedPin].time}
              </span>
              <h5 className="text-xs font-bold text-slate-100 leading-normal">
                {activities[selectedPin].activity}
              </h5>
              <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                <span>📍</span> {activities[selectedPin].location}
              </p>
              
              <div className="border-t border-slate-800/80 pt-2.5 mt-2 flex flex-col gap-1.5 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Cost: <span className="font-bold text-slate-200">{activities[selectedPin].cost || "Free"}</span></span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg text-slate-300 leading-relaxed flex items-start gap-1.5 border border-slate-900">
                  <Info className="w-3.5 h-3.5 text-[#6af5e5] mt-0.5 flex-shrink-0" />
                  <span className="text-[9.5px] font-medium leading-relaxed">{activities[selectedPin].tips}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select a waypoint coordinate on the live map matrix to inspect cultural tips.</p>
          )}
        </div>
 
        {/* Index of waypoint buttons */}
        {activities.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[9px] font-mono font-bold text-slate-500 block mb-2 uppercase">Jump to Stop:</span>
            <div className="grid grid-cols-5 gap-1.5">
              {activities.map((_, idx) => (
                <button
                  key={`btn-idx-${idx}`}
                  onClick={() => setSelectedPin(idx)}
                  className={`py-1.5 text-xs font-mono font-extrabold rounded-lg transition-all cursor-pointer ${
                    selectedPin === idx
                      ? "bg-[#006a61] text-white shadow-md shadow-[#006a61]/30 border border-[#6af5e5]/20"
                      : "bg-slate-950 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
