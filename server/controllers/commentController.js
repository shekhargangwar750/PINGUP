import Comment from "../models/Comment.js";
import Post from "../models/Post.js";



export const addComment=async (req,res)=>{
  try {
    const {userId}=req.auth();
    const {postId,text,full_name,username,profile_picture}=req.body;

    const comment=await Comment.create({
      post:postId,
      user:userId,
      text,
      full_name,
      username,
      profile_picture
    })

    await Post.findByIdAndUpdate(postId,{
      $inc:{comments_count:1},
    })
    res.json({success:true,comment});
  } catch (error) {
    res.json({success:false,message:error.message});
  }
}


export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};