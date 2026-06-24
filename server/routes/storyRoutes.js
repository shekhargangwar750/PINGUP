import express from 'express'
import { upload } from '../config/multer.js'
import { protect } from '../middlewares/auth.js'
import { addUserStory, deleteStory, getStories } from '../controllers/storyController.js'

const storyRouter=express.Router()

storyRouter.post('/create',protect,upload.single('media'),addUserStory)

storyRouter.get('/get',protect,getStories)

storyRouter.delete('/delete/:storyId',deleteStory)

export default storyRouter;