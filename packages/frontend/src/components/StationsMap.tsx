"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { divIcon, latLngBounds } from "leaflet";
import { formatPounds } from "@/utils/formatters";
import type { UserLocation, RankedStation } from "@/types";

type StationsMapProps = {
  stations: RankedStation[];
  userLocation: UserLocation | null;
};

function createPriceIcon(totalCost: number) {
  return divIcon({
    className: "ppm-price-marker",
    html: `<span>${formatPounds(totalCost)}</span>`,
    iconSize: [88, 32],
    iconAnchor: [44, 16],
  });
}

function FitMapToBounds({
  stations,
  userLocation,
}: {
  stations: RankedStation[];
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (stations.length === 0) {
      return;
    }

    const bounds = latLngBounds(
      stations.map((station) => [station.latitude, station.longitude] as [number, number])
    );

    if (userLocation) {
      bounds.extend([userLocation.latitude, userLocation.longitude]);
    }

    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, stations, userLocation]);

  return null;
}

export default function StationsMap({ stations, userLocation }: StationsMapProps) {
  const mapCenter = useMemo<[number, number]>(() => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }

    if (stations.length > 0) {
      return [stations[0].latitude, stations[0].longitude];
    }

    return [54.5, -3.2];
  }, [stations, userLocation]);

  return (
    <MapContainer center={mapCenter} zoom={12} className="h-[420px] w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitMapToBounds stations={stations} userLocation={userLocation} />

      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={createPriceIcon(station.totalCost)}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <h3 className="font-semibold">{station.name}</h3>
              <p>Cost per litre: {station.price.toFixed(1)}p</p>
              <p>Cost to fill: {formatPounds(station.costOfFillUp)}</p>
              <p>Cost to travel: {formatPounds(station.costToTravel)}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
