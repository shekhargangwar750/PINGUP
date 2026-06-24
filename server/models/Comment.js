import mongoose from "mongoose";

const commentSchema=new mongoose.Schema(
  {
    post:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Post",
      required:true
    },
    user:{
      type:String,
      required:true
    },
    full_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
      required: true,
    },
    text:{
      type:String,
      required:true,
      trim:true,
    }
  },
  {timestamps:true}
)
const Comment=mongoose.model("Comment",commentSchema);
export default Comment;