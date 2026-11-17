"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Clock, ShieldCheck, ExternalLink } from "lucide-react";

interface RouteMapProps {
  origin: string;
  destination: string;
  waypoints?: string[];
  distanceMiles?: number;
  estimatedTimeMins?: number;
  className?: string;
}

export default function RouteMap({
  origin,
  destination,
  waypoints = [],
  distanceMiles,
  estimatedTimeMins,
  className = "h-56",
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const isKeyValid = Boolean(
    apiKey &&
    apiKey.length > 10 &&
    !apiKey.includes("sample") &&
    !apiKey.includes("your_")
  );

  useEffect(() => {
    if (!isKeyValid || !mapRef.current) return;

    let isMounted = true;

    // Helper to render Directions
    const renderRoute = () => {
      if (!window.google || !window.google.maps || !mapRef.current) return;

      try {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: new window.google.maps.Map(mapRef.current, {
            zoom: 10,
            center: { lat: 51.5074, lng: -0.1278 }, // London default
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }),
          polylineOptions: {
            strokeColor: "#FFCC00",
            strokeWeight: 5,
            strokeOpacity: 0.9,
          },
        });

        const formattedWaypoints = (waypoints || []).map((w) => ({
          location: w,
          stopover: true,
        }));

        directionsService.route(
          {
            origin,
            destination,
            waypoints: formattedWaypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (isMounted) {
              if (status === window.google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
                setMapLoaded(true);
              } else {
                console.warn("Google Directions error:", status);
                setMapError(true);
              }
            }
          }
        );
      } catch (err) {
        console.error("RouteMap render error:", err);
        setMapError(true);
      }
    };

    // Check if script is already present
    if (window.google && window.google.maps) {
      renderRoute();
      return;
    }

    const scriptId = "google-maps-js-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) renderRoute();
      };
      script.onerror = () => {
        if (isMounted) setMapError(true);
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", renderRoute);
    }

    return () => {
      isMounted = false;
    };
  }, [origin, destination, waypoints, isKeyValid, apiKey]);

  // If real Google Maps is enabled and loaded cleanly
  if (isKeyValid && !mapError) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100 ${className}`}>
        <div ref={mapRef} className="w-full h-full min-h-[220px]" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 text-xs text-gray-500 font-medium">
            Loading Google Live Route...
          </div>
        )}
      </div>
    );
  }

  // Graceful Fallback Interactive Schematic Route Map
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-neutral-900 text-white p-5 flex flex-col justify-between ${className}`}>
      {/* Background road aesthetic grid */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFCC00_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-ots-yellow" />
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow">
            Direct Route Overview
          </span>
        </div>
        <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono">
          UK Highway Grid
        </span>
      </div>

      {/* Schematic Route Line */}
      <div className="relative z-10 my-4 space-y-3">
        {/* Origin */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            A
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Pick-up</span>
            <p className="text-xs font-bold text-white truncate">{origin}</p>
          </div>
        </div>

        {/* Waypoints if any */}
        {waypoints.map((wp, i) => (
          <div key={i} className="flex items-start space-x-3 ml-1 pl-5 border-l-2 border-dashed border-ots-yellow/40">
            <div className="w-4 h-4 rounded-full bg-ots-yellow text-black flex items-center justify-center text-[9px] font-bold flex-shrink-0">
              {i + 1}
            </div>
            <p className="text-xs text-gray-300 truncate">Via: {wp}</p>
          </div>
        ))}

        {/* Destination */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            B
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Drop-off</span>
            <p className="text-xs font-bold text-white truncate">{destination}</p>
          </div>
        </div>
      </div>

      {/* Bottom Route Metrics */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center space-x-3">
          {distanceMiles && (
            <span className="font-semibold text-ots-yellow">
              {distanceMiles} miles
            </span>
          )}
          {estimatedTimeMins && (
            <span className="flex items-center space-x-1 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>~{estimatedTimeMins} mins</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          Fixed Rate Guarantee
        </span>
      </div>
    </div>
  );
}

// Global declaration for TypeScript
declare global {
  interface Window {
    google?: any;
  }
}
