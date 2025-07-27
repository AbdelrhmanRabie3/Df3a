import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";

function StudentProtect({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/" />;
  }
  if (user.role !== "student") {
    return <Navigate to="/" />;
  }
  return children;
}

export default StudentProtect;
