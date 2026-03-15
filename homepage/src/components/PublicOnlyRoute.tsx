import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type PublicOnlyRouteProps = {
  authenticatedTo?: string;
};

export default function PublicOnlyRoute({ authenticatedTo = "/account" }: PublicOnlyRouteProps) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <section className="page-section">
        <div className="container route-loading">Checking your session...</div>
      </section>
    );
  }

  if (user) {
    return <Navigate to={authenticatedTo} replace />;
  }

  return <Outlet />;
}
