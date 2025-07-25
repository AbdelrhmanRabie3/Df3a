import { useState } from "react";
import { getVideoToken } from "../../services/videoService";

export default function JoinVideoRoomButton({
  RoomId,
  StartTime,
  token,
  isAvailable,
  type,
  className,
}) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const videoToken = await getVideoToken(RoomId, token, type);
      window.open(`/videocall?token=${videoToken}`, "_blank");
    } catch (err) {
      console.error("Error getting video token:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };
  const baseStyle =
    !isAvailable || loading
      ? "bg-gray-400 cursor-not-allowed text-primary"
      : "btn-primary btn-primary:hover";
  return (
    <>
      <button
        onClick={handleJoin}
        disabled={!isAvailable || loading}
        className={`w-2/3 font-medium px-6 py-3 rounded-full transition duration-200 mt-2 ${baseStyle} ${className}`}
      >
        {loading ? "Loading..." : "🎥 Start"}
      </button>
      {!isAvailable && (
        <p className="text-sm text-gray-500 mt-1">
          This button will be active when the meeting starts at {StartTime}
        </p>
      )}
    </>
  );
}
