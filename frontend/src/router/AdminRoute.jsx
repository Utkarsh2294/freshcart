import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
