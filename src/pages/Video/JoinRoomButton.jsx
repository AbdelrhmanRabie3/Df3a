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
      <div className="relative group  w-full flex justify-center mx-auto">
        <button
          onClick={handleJoin}
          // disabled={!isAvailable || loading}
          className={`  font-medium px-6 py-3 rounded-full transition duration-200 mt-2 ${baseStyle} ${className}`}
        >
          {loading ? "Loading..." : "🎥 Start"}
        </button>
        {!isAvailable && (
          <p className="text-sm text-gray-500 mt-1 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            This button will be active when the meeting starts at {StartTime}
          </p>
        )}
      </div>
    </>
  );
}
