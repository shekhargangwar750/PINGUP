import express from 'express'
import { getChatMessages, sendMesage, sseController,sharePost} from '../controllers/messageController.js';
import { upload } from '../config/multer.js';
import { protect } from '../middlewares/auth.js';



const messageRouter=express.Router();

messageRouter.get('/:userId',sseController);
messageRouter.post('/send',upload.single('image'),protect,sendMesage)
messageRouter.post('/get',protect,getChatMessages)

messageRouter.post("/share-post", protect,sharePost);

export default messageRouter;