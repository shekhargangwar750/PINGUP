
import fs from 'fs'
import imagekit from '../config/imageKit.js';
import Message from '../models/Message.js';
import Post from '../models/Post.js';


//create an empty object to store server side event connections
const connections={};

//controlllers function for the sse(server side event ) endpoint

export const sseController=(req,res)=>{
  const {userId}=req.params
  console.log('New client connected:',userId)

  // Set SSE headers
  res.setHeader('Content-Type','text/event-stream');
  res.setHeader('Cache-Control','no-cache');
  res.setHeader('Connection','keep-alive')
  res.setHeader('Access-Control-Allow-Origin','*');

  //Add the client's response object to the connections object
  connections[userId]=res

  //send an initial event to the client
  res.write('log:Connected to SSE stream\n\n');

  //Handle client disconnection
  req.on('close',()=>{
    //remove the client's response object from the connections array
    delete connections[userId];
    console.log('Client disconnected');
  }) 
}

//send Message
export const sendMesage =async (req,res)=>{
 try {
   const {userId}=req.auth();
   const {to_user_id,text}=req.body;
   const image=req.file;
   let media_url='';
   let message_type=image?'image':'text';

   if(image){
     const response=await imagekit.files.upload({
        file:fs.createReadStream(image.path),
        fileName:image.originalname,
       
      })
      media_url = imagekit.helper.buildSrc({
        urlEndpoint:process.env.IMAGEKIT_URL_ENDPOINT,
        src:response.filePath,
        transformation:[
          {quality:'auto'},
          {format:'webp'},
          {width:'1280'}
        ]
      })
   }

   
   
   const message=await Message.create({
    from_user_id:userId,
    to_user_id,
    text,
    message_type,
    media_url
   })
   res.json({success:true,message})

   //send message to to_user_id using sse
   const messageWithUserData=await Message.findById(message._id).populate('from_user_id');
    
   if(connections[to_user_id]){
     connections[to_user_id].write(`data:${JSON.stringify(messageWithUserData)}\n\n`)
   }

 } catch (error) {
   console.log(error);
   req.json({success:false,message:error.message});
 }
}


//Get Chat Messages
export const getChatMessages=async (req,res)=>{
  try {
    const {userId}=req.auth();
    const {to_user_id}=req.body;
    const message=await Message.find({
      $or:[
        {from_user_id:userId,to_user_id},
        {from_user_id:to_user_id,to_user_id:userId}
      ]
    }).populate("from_user_id")
.populate({
  path: "post_id",
  populate: {
    path: "user",
  },
}).sort({createdAt:-1})
  console.log(message);

    // mark message as seen
    await Message.updateMany({from_user_id:to_user_id,to_user_id:userId},{seen:true})

    res.json({success:true,message})
  } catch (error) {
     res.json({success:false,message:error.message})
  }
}

export const getUserRecentMessages=async (req,res)=>{
  try {
      const {userId}=req.auth();
      const messages=await Message.find({to_user_id:userId}).populate('from_user_id to_user_id').sort({createdAt:-1})

      res.json({success:true,messages})
  } catch (error) {
     res.json({success:false,message:error.message})
  }
}


export const sharePost = async (req, res) => {
  try {
    const { userId } =  req.auth();
    const { to_user_id, post_id } = req.body;

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      message_type: "post",
      post_id,
    });

    await Post.findByIdAndUpdate(post_id, {
      $inc: { shares_count: 1 },
    });

    const messageWithPost = await Message.findById(message._id)
      .populate("from_user_id")
      .populate({
        path: "post_id",
        populate: {
          path: "user",
        },
      });

    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data:${JSON.stringify(messageWithPost)}\n\n`
      );
    }

    res.json({
      success: true,
      message: "Post shared successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


