import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useOrderStore } from "../store/orderStore";
import * as socketService from "../services/socketService";
import { useAuth } from "../hooks/useAuth";

const riderIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
const states = [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
];

function FollowRider({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: false });
  }, [map, position]);
  return null;
}

export default function OrderTracking() {
  const { id } = useParams();
  const { tracking, fetchTracking, isLoading, error } = useOrderStore();
  const { token } = useAuth();
  const [live, setLive] = useState(null);
  useEffect(() => {
    setLive(null);
    fetchTracking(id);
    if (!token) return;
    socketService.connect(token);
    const leave = socketService.joinOrderRoom(id);
    const unsubscribe = socketService.onTrackingUpdate((update) => {
      if (String(update.order_id) === String(id)) setLive(update);
    });
    return () => {
      unsubscribe();
      leave();
    };
  }, [id, fetchTracking, token]);

  if (isLoading)
    return (
      <p role="status" className="p-8 text-center">
        Loading tracking details…
      </p>
    );
  if (error || !tracking)
    return (
      <div role="alert" className="rounded-2xl border p-6">
        <p>{error || "Tracking is unavailable."}</p>
        <button
          className="mt-3 min-h-11 underline"
          onClick={() => fetchTracking(id)}
        >
          Try again
        </button>
      </div>
    );
  const current = { ...tracking, ...live };
  const status = String(current.status || "pending").toLowerCase();
  const coordinates =
    current.rider_lat != null && current.rider_lng != null
      ? [Number(current.rider_lat), Number(current.rider_lng)]
      : null;
  const position = coordinates?.every(Number.isFinite) ? coordinates : null;
  const eta = current.eta_seconds == null ? null : Number(current.eta_seconds);
  const activeStep = states.indexOf(status);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="content-wrap text-2xl font-bold">
        Track order #{String(id).slice(-6).toUpperCase()}
      </h1>
      <section className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 sm:p-8">
        <p role="status" className="mb-5 font-semibold capitalize">
          {status.replaceAll("_", " ")}
        </p>
        {status !== "cancelled" && (
          <ol
            aria-label="Order progress"
            className="grid grid-cols-1 gap-3 sm:grid-cols-5"
          >
            {states.map((state, index) => (
              <li
                key={state}
                aria-current={status === state ? "step" : undefined}
                className="flex items-center gap-3 sm:flex-col sm:items-start"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${index <= activeStep ? "bg-[#6366F1] text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}
                >
                  {index + 1}
                </span>
                <span className="text-xs font-semibold capitalize">
                  {state.replaceAll("_", " ")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
      {position ? (
        <div className="relative z-0 h-[320px] overflow-hidden rounded-3xl border border-[var(--border-default)]">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={riderIcon}>
              <Popup>Rider location</Popup>
            </Marker>
            <FollowRider position={position} />
          </MapContainer>
        </div>
      ) : (
        <p className="rounded-2xl bg-[var(--bg-card)] p-6 text-sm text-[var(--text-secondary)]">
          The live map will appear when your rider’s location is available.
        </p>
      )}
      <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-center">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
          Estimated delivery
        </h2>
        <p className="mt-2 text-2xl font-bold">
          {status === "delivered"
            ? "Delivered"
            : status === "cancelled"
              ? "Order cancelled"
              : eta > 0
                ? `About ${Math.ceil(eta / 60)} min`
                : "We’ll update you as your order progresses"}
        </p>
      </div>
    </div>
  );
}
