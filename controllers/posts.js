const Posts = require('../models/Posts');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc Show all Posts
// @route GET /api/v1/posts
// @route GET /api/v1/user/:userId/posts
// @access Private

exports.getPosts = asyncHandler(async (req,res,next) => {   

    let query;
    if(req.params.userId){
        query = Posts.find({user:req.params.userId}) 
    } else {
        query = Posts.find().populate({
            path:'creator',
            select:'username'
        });
    }
    const posts = await query
    res.status(200).json({success:true, count:posts.length ,data:posts})
});

// @desc Get a single Post
// @route GET /api/v1/posts/:id
// @access Private

exports.getPost = asyncHandler(async (req,res,next) => {
    const post = await Posts.findById(req.params.id).populate({
        path:'creator',
        select:'username'
    })
    if (!post) {
        return next(
          new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
        );
      }
    res.status(200).json({success:true,data:post})
});

// @desc create a  Post
// @route POST /api/v1/post/
// @access Private

exports.createPost = asyncHandler(async (req,res,next) => {
    const post = await Posts.create(req.body);
    res.status(201).json({
            success:true,
            data:post
    })
});

// @desc Update a  Post
// @route PUT /api/v1/post/
// @access Private

exports.updatePost = asyncHandler(async (req,res,next) => {
    const post = await Posts.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        if(!post){
            next(ErrorResponse(`Post Not Found of Id ${req.params.id}`,404));
        }else{
            res.status(200).json({success:true,data:post });
        }
});

// @desc Delete a  Post
// @route DELETE /api/v1/post/
// @access Private

exports.deletePost = asyncHandler(async (req,res,next) => {    
        const post = await Posts.findByIdAndDelete(req.params.id);
        if(!post){
            return next(ErrorResponse(`Post Not Found of Id ${req.params.id}`,404));
        }else{
            res.status(200).json({success:true, data:{} });
        } 
});


// @desc Upload a  Phot0
// @route put /api/v1/post/photo
// @access Private

exports.postPhotoUpload = asyncHandler(async (req,res,next) => {    
   
    if(!req.files){
        return next(ErrorResponse(`Please Upload Profile photo`,404));
    }
    const file = req.files.file;
    // make sure proper format
    if(!file.mimetype.startsWith('image')){
        return next(ErrorResponse(`Please Upload an Image file`,404));
    }
    //CHECK FILESIZE
    if(file.size > process.env.MAX_FILE_UPLOAD_SIZE){
        return next(ErrorResponse(`Please Upload an Image file less than ${process.env.MAX_FILE_UPLOAD_SIZE}`,400));
    }

    // create custome filename
    file.name = `photo_${posts._id}${posts.title}and${Date.now}${path.parse(file.name).ext}`;

    //move file
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err =>{
        if(err){
            console.err(err);
            return next(ErrorResponse(`Problem with file upload`,500));
        }
        await User.findByIdAndUpdate(req.params.id,{photo:file.name});
        res.status(200).json({
            success:true,
            data:file.name
        })
    })

});

