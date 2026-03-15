import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  redirectTo?: string;
};

export default function ProtectedRoute({ redirectTo = "/login" }: ProtectedRouteProps) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="page-section">
        <div className="container route-loading">Checking your session...</div>
      </section>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <Outlet />;
}
