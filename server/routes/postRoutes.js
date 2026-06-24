import express from 'express'
import {upload} from '../config/multer.js'
import { addPost, deletePost, getFeedPosts, likePost } from '../controllers/postController.js'
import { protect } from '../middlewares/auth.js'
import { addComment, getComments } from '../controllers/commentController.js'

const postRouter=express.Router()



postRouter.post('/add',upload.array('images',4),protect,addPost)

postRouter.get('/feed',protect,getFeedPosts)

postRouter.post('/like',protect,likePost)

postRouter.delete("/delete/:postId",deletePost)

postRouter.post('/comment',protect,addComment);

postRouter.get('/comments/:postId',getComments);


export default postRouter