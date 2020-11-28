const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const crypto = require('crypto');
const uuid = require('uuid');

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true, 'Please add Post Title'],
        unique:true,
        trim:true,
        maxlength:[50,'Post title canot be more than 50 charector']
    },
    slug:String,
    publicname:{
        type:String,
        required:[true, 'Please add Post Title'],        
        trim:true,
        maxlength:[50,'Post title canot be more than 50 charector']
    },
    slug:String,
    bio:{
        type:String,
        required:[true, 'Please add a description'],       
        maxlength:[150, 'Description must be less than 150 charectors']
    },
    photo:{
        type: String,
        default: 'no-photo.jpg'       
    },
    website: {
        type: String,
        match: [
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        required:[true,'Add email id'],
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
      },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
      confirmEmailToken: String,
      isEmailConfirmed: {
        type: Boolean,
        default: false,
      },
      twoFactorCode: String,
      twoFactorCodeExpire: Date,
      twoFactorEnable: {
        type: Boolean,
        default: false,
      },
    role:{
        type:String,
        enum : ['user','admin'],
        default:'user'
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    friendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//Create posts slug from the title
UserSchema.pre('save',function(next){
    this.slug = slugify(this.username,{lower:true});
    next();
})

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  
  // Sign JWT and return
  UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };
  
  // Match user entered password to hashed password in database
  UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  // Generate and hash password token
  UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
  
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
  
  // Generate email confirm token
  UserSchema.methods.generateEmailConfirmToken = function (next) {
    // email confirmation token
    const confirmationToken = crypto.randomBytes(20).toString('hex');
  
    this.confirmEmailToken = crypto
      .createHash('sha256')
      .update(confirmationToken)
      .digest('hex');
  
    const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
    const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
    return confirmTokenCombined;
  };
  

//cascade delete all posts when user deleted
UserSchema.pre('remove', async function(next){
    await this.model('Posts').deleteMany({ creaator:this._id });
    next();
});

//Revers populate with virtuals
UserSchema.virtual('posts',{
    ref:'Posts',
    localField:'_id',
    foreignField:'creator',
    justOne:false
})

//GeoCoder
UserSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type:'Point',
        coordinates:[loc[0].latitude,loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street:loc[0].streetName,        
        city:loc[0].city,
        state:loc[0].state,
        zipcode:loc[0].zipcode,
        country:loc[0].country
    }
    //Do not save address
    this.address = undefined;
    next();
})

module.exports = mongoose.model('User',UserSchema);