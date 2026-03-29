import { Navigate } from "react-router-dom";
import { SpinnerGap } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-black">
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-sm text-[#a8a8a8]">
          <SpinnerGap className="h-5 w-5 animate-spin text-accent" />
          <span>Loading your session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
