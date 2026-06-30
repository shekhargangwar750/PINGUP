import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { X } from "lucide-react";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";

function ShareModal({ open, onClose, postId, onShared }) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  useEffect(() => {
    if (!open) return;

    const fetchFollowing = async () => {
      setLoading(true);

      try {
        const res = await api.get("/api/user/following", {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });
        setFollowing(res.data.following);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [open]);

  const handleShare = async (to_user_id) => {
    try {
      const { data } = await api.post(
        "/api/message/share-post",
        {
          to_user_id,
          post_id: postId,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success("Post shared successfully");
        onShared();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-100 p-4"
      >
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold mb-4">Share Post</h2>
          <X
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-black text-xl"
          />
        </div>
        <input
          placeholder="Search..."
          className="w-full border rounded-lg px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {following.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between py-3 border-b last:border-none"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profile_picture}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleShare(user._id)}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 cursor-pointer"
                >
                  Send
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareModal;
