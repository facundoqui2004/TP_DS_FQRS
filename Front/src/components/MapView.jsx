import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({
  lat,
  lng,
  zoom = 13,
  readOnly = false,
  onLocationChange,
  height = "300px",
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationChangeRef = useRef(onLocationChange);

  // Mantiene el callback actualizado sin re-crear el mapa en cada render del padre
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  // 1. Crear mapa una sola vez y limpiarlo al desmontar
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initialLat = lat ?? -32.9468; // fallback ej. Rosario
    const initialLng = lng ?? -60.6393;

    const map = L.map(container).setView([initialLat, initialLng], zoom);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (lat != null && lng != null) {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }

    const handleMapClick = (e) => {
      if (readOnly) return;
      const { lat: clickedLat, lng: clickedLng } = e.latlng;
      onLocationChangeRef.current?.({ lat: clickedLat, lng: clickedLng });
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // Solo al montar y desmontar

  // 2. Actualizar marcador y vista cuando cambian lat/lng desde el padre
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat == null || lng == null) return;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    map.panTo([lat, lng]);
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      data-testid="map-view"
    />
  );
};

export default MapView;