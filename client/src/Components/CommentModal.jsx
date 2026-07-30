import { MoreHorizontal, Trash2, X } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CommentModal({ post, onClose, setCommentCount }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showMenu, setShowMenu] = useState(null);

  const currentUser = useSelector((state) => state.user.value);
  // console.log(currentUser);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/api/post/comments/${post._id}`);

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchComments();
  }, []);

  const handleSend = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(
        "/api/post/comment",
        {
          postId: post._id,
          text: comment,
          full_name: currentUser.full_name,
          username: currentUser.username,
          profile_picture: currentUser.profile_picture,
          user_mongo_id: currentUser._id,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );
      if (data.success) {
        setComment("");
        fetchComments();
        setCommentCount((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const { data } = await api.delete(`/api/post/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        fetchComments();
        setCommentCount((prev) => prev - 1);
      }

      console.log("Deleting:", commentId);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Comments</h2>

          <X onClick={onClose} className="cursor-pointer" />
        </div>

        {/* Comments List */}
        <div className="h-80 overflow-y-auto py-4">
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet</p>
          ) : (
            comments.map((item) => (
              <div key={item._id} className=" flex border-b py-3 gap-3">
                <img
                  src={item.profile_picture}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${item.user}`);
                  }}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold cursor-pointer"
                          onClick={() => navigate(`/profile/${item.user}`)}
                        >
                          {item.full_name}
                        </span>

                        <span className="text-xs text-gray-500">
                          {moment(item.createdAt).fromNow()}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">@{item.username}</p>
                    </div>

                    {currentUser._id === item.user && (
                      <div className="relative">
                        <MoreHorizontal
                          onClick={() =>
                            setShowMenu(showMenu === item._id ? null : item._id)
                          }
                          className="w-4 h-4 cursor-pointer"
                        />

                        {showMenu === item._id && (
                          <div className="absolute right-0 bg-white shadow rounded-lg border">
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-gray-100"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-sm mt-1">{item.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="border-t pt-3">
          <textarea
            placeholder="Write a comment..."
            className="w-full border rounded-lg p-2 resize-none"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={handleSend}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
