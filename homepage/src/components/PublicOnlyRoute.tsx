import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <section className="page-section">
        <div className="container route-loading">Checking your session...</div>
      </section>
    );
  }

  if (user) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
