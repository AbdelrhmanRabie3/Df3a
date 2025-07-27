import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { Navigate } from "react-router";

function AuthProtect({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return null;
  }
  if (user) {
    return <Navigate to="/" />;
  }
  return children;
}

export default AuthProtect;
