import { BadgeCheck, MoreHorizontal, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { useAuth } from "@clerk/react";

function StoryViewer({ viewStory, setViewStory }) {
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const handleDeleteStory = async (storyId) => {
    try {
      const token = await getToken();
      const { data } = await api.delete(`/api/story/delete/${storyId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        toast.success("Story deleted");
        setViewStory(null);
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let timer, progressInterval;
    if (viewStory && viewStory.media_type !== "video") {
      setProgress(0);
      const duration = 10000;
      const setTime = 100;
      let elapsed = 0;
      progressInterval = setInterval(() => {
        elapsed += setTime;
        setProgress((elapsed / duration) * 100);
      }, setTime);
      // close story after duration(10-sec)
      timer = setTimeout(() => {
        setViewStory(null);
      }, duration);
    }
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [viewStory, setViewStory]);

  const handleClose = () => {
    setViewStory(null);
  };

  if (!viewStory) return null;

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt=""
            className="max-w-full max-h-screen object-contain"
          />
        );
      case "video":
        return (
          <video
            onEnded={() => setViewStory(null)}
            src={viewStory.media_url}
            className="max-h-screen"
            controls
            autoPlay
          />
        );
      case "text":
        return <div>{viewStory.content}</div>;
      default:
        return null;
    }
  };
  return (
    <div
      className="fixed inset-0 h-screen bg-linear-to-r from-cyan-500 to-blue-500 bg-opacity-90 z-110 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "bg-linear-to-b from-gray-900 to-black",
      }}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div
          className="h-full bg-white transition-all duration-100 linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {/* User info-top left */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50">
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />
        <div>
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>
      {/* Close Button */}
      {currentUser?._id === viewStory.user?._id && (
        <div className="absolute top-4 right-16 z-50">
          <MoreHorizontal
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-7 h-7 text-white cursor-pointer"
          />

          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg">
              <button
                onClick={() => handleDeleteStory(viewStory._id)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>

      {/* Content Wrapper */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

export default StoryViewer;
