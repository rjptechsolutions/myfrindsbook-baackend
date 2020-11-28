const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    context:{
        type:String,
        trim:true,
        maxlength:[70,'comment canot be more than 70 charector']
    },
    createdAt: {
        type: Date,
        default: Date.now
      },
      post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Posts',
        required: true
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      }

});

// Prevent user from submitting more than one review per post
CommentSchema.index({ post: 1, user: 1 }, { unique: true });


module.exports = mongoose.model('Comment',CommentSchema);