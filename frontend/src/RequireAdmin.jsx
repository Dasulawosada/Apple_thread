import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

export default RequireAdmin;
