const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const path = require('path');


// @desc Show all Users
// @route GET /api/v1/user
// @access Private

exports.getAllUsers = asyncHandler(async (req,res,next) => {   

   
    res.status(200).json(res.advancedResults);
});

// @desc Get a single User
// @route GET /api/v1/user/:id
// @access Private

exports.getUser = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(
          new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
        );
      }
    res.status(200).json({success:true,data:user})
});

// @desc create a  User
// @route POST /api/v1/user/
// @access Private

exports.createUser = asyncHandler(async (req,res,next) => {
    const user = await User.create(req.body);
    res.status(201).json({
            success:true,
            data:user
    })
});

// @desc Update a  User
// @route PUT /api/v1/user/
// @access Private

exports.updateUser = asyncHandler(async (req,res,next) => {
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        if(!user){
            next(ErrorResponse(`User Not Found of Id ${req.params.id}`,404));
        }else{
            res.status(200).json({success:true,data:user });
        }
});

// @desc Delete a  User
// @route DELETE /api/v1/user/
// @access Private

exports.deleteUser = asyncHandler(async (req,res,next) => {    
        const user = await User.findById(req.params.id);
        if(!user){
            return next(ErrorResponse(`User Not Found of Id ${req.params.id}`,404));
        }else{
            User.remove();
            res.status(200).json({success:true, data:{} });
        } 
});



// @desc Get a  User with in radius
// @route DELETE /api/v1/user/radius/:zipcode/distance
// @access Private

exports.getNearByUsers = asyncHandler(async (req,res,next) => {    
    const {zipcode,distance} = req.params;


    //Get lat,lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // calculare radius
    //Divid distance by radius of Earth
    //Earth radius = 3,963 mi / 6,378 km
    const radius = distance / 6378;
    const users = await User.find({
        location:{ $geoWithin: {$centerSphere: [[lng,lat],radius]}}
    });

    res.status(200).json({
        success:true,
        count:users.length,
        data:users
    })

});


// @desc Upload a  Phot0
// @route put /api/v1/post/:id/photo
// @access Private

exports.profilePhotoUpload = asyncHandler(async (req,res,next) => {    
    const user = await User.findById(req.params.id);
    if(!user){
        return next(ErrorResponse(`User Not Found of Id ${req.params.id}`,404));
    }
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
    file.name = `photo_${user._id}and${Date.now}${path.parse(file.name).ext}`;

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


