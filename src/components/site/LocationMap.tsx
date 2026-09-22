"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Brand pin as an inline SVG divIcon — avoids Leaflet's broken default marker
// asset paths under bundlers and matches the Bit Bladi accent colour.
const pin = L.divIcon({
  className: "",
  html: `<svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 29 17 29s17-17 17-29C34 7.6 26.4 0 17 0z" fill="#b23a13"/>
    <circle cx="17" cy="17" r="6.5" fill="#f5efe3"/>
  </svg>`,
  iconSize: [34, 46],
  iconAnchor: [17, 46],
  popupAnchor: [0, -42],
});

export default function LocationMap({
  lat,
  lng,
  name,
  address,
  label,
}: {
  lat: number;
  lng: number;
  name: string;
  address: string;
  label: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label={label}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker position={[lat, lng]} icon={pin}>
        <Popup>
          <strong>{name}</strong>
          <br />
          {address}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
