import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { Navigate } from "react-router";

function MentorProtect({ children }) {
   const { user,loading  } = useContext(AuthContext);
  if (loading) {
    return null
  }
  if (!user) {
    return <Navigate to="/" />;
  }
  if (user.role !== "mentor") {
    return <Navigate to="/" />;
  }
  return children;
}

export default MentorProtect;
