import React, { useEffect, useState } from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "../context/SocketContext.jsx";
import { fetchRoadRoute } from "../utils/mapUtils.js";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return;

    map.invalidateSize();

    const normalizedPoints = points.map(([lat, lon]) => L.latLng(lat, lon));
    const bounds = L.latLngBounds(normalizedPoints);
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    const samePoint =
      Math.abs(northEast.lat - southWest.lat) < 0.000001 &&
      Math.abs(northEast.lng - southWest.lng) < 0.000001;

    if (samePoint) {
      map.setView([northEast.lat, northEast.lng], 17, { animate: true });
      return;
    }

    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

const DeliveryBoyTracking = ({ data, orderId }) => {
  const socket = useSocket();
  const [liveLocation, setLiveLocation] = useState({
    lat: data?.deliveryBoyLocation?.lat,
    lon: data?.deliveryBoyLocation?.lon,
  });
  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    setLiveLocation({
      lat: data?.deliveryBoyLocation?.lat,
      lon: data?.deliveryBoyLocation?.lon,
    });
  }, [data?.deliveryBoyLocation?.lat, data?.deliveryBoyLocation?.lon]);

  useEffect(() => {
    const actualId = orderId || data?._id;
    if (!socket || !actualId) return;

    const eventName = `locationUpdate-${actualId}`;

    const joinOrderRoom = () => {
      socket.emit("joinOrder", actualId);
    };

    const handleLocationUpdate = (newCoords) => {
      setLiveLocation((prev) => {
        if (prev?.lat === newCoords.lat && prev?.lon === newCoords.lon) {
          return prev;
        }

        return { lat: newCoords.lat, lon: newCoords.lon };
      });
    };

    joinOrderRoom();
    socket.on("connect", joinOrderRoom);
    socket.on(eventName, handleLocationUpdate);

    return () => {
      socket.off("connect", joinOrderRoom);
      socket.off(eventName, handleLocationUpdate);
    };
  }, [socket, orderId, data?._id]);

  useEffect(() => {
    const controller = new AbortController();

    const updateRoute = async () => {
      if (
        liveLocation?.lat == null ||
        liveLocation?.lon == null ||
        data?.customerLocation?.lat == null ||
        data?.customerLocation?.lon == null
      ) {
        setRoutePath([]);
        return;
      }

      try {
        const route = await fetchRoadRoute(
          { lat: liveLocation.lat, lon: liveLocation.lon },
          {
            lat: data.customerLocation.lat,
            lon: data.customerLocation.lon,
          },
          controller.signal,
        );

        setRoutePath(
          route.length > 1
            ? route
            : [
                [liveLocation.lat, liveLocation.lon],
                [data.customerLocation.lat, data.customerLocation.lon],
              ],
        );
      } catch (error) {
        if (error.name === "AbortError") return;

        setRoutePath([
          [liveLocation.lat, liveLocation.lon],
          [data.customerLocation.lat, data.customerLocation.lon],
        ]);
      }
    };

    updateRoute();

    return () => {
      controller.abort();
    };
  }, [
    liveLocation?.lat,
    liveLocation?.lon,
    data?.customerLocation?.lat,
    data?.customerLocation?.lon,
  ]);

  if (liveLocation.lat == null || data?.customerLocation?.lat == null) return null;

  const fallbackPath = [
    [liveLocation.lat, liveLocation.lon],
    [data.customerLocation.lat, data.customerLocation.lon],
  ];
  const path = routePath.length > 1 ? routePath : fallbackPath;
  const fitPoints = [
    [liveLocation.lat, liveLocation.lon],
    [data.customerLocation.lat, data.customerLocation.lon],
    ...path,
  ];

  return (
    <div className="h-[500px] min-h-[500px] w-full rounded-2xl overflow-hidden shadow-inner">
      <MapContainer
        className="w-full h-full"
        center={[liveLocation.lat, liveLocation.lon]}
        zoom={15}
        scrollWheelZoom={false}
        key={`${liveLocation.lat}-${liveLocation.lon}-${data.customerLocation.lat}-${data.customerLocation.lon}`}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={fitPoints} />

        <Marker
          position={[liveLocation.lat, liveLocation.lon]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy (Live)</Popup>
        </Marker>

        <Marker
          position={[data.customerLocation.lat, data.customerLocation.lon]}
          icon={customerIcon}
        >
          <Popup>Customer Location</Popup>
        </Marker>

        <Polyline
          positions={path}
          color="#ff4d2d"
          weight={4}
          dashArray="10, 10"
        />
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
