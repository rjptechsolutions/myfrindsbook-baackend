const mongoose = require('mongoose');
const slugify = require('slugify');
const PostsSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Please add Post Title'],
        trim:true,
        maxlength:[50,'Post title canot be more than 50 charector']
    },
    slug:String,
    description:{
        type:String,
        required:[true, 'Please add a description'],       
        maxlength:[100, 'Description must be less than 100 charectors']
    },
    likes:{
        type:Number
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    photo:{
        type: String,
        default: 'no-photo.jpg'
    },
    creator:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required:true
    }

},{
    timestamps:true,    
});

//Create posts slug from the title
PostsSchema.pre('save',function(next){
    this.slug = slugify(this.title,{lower:true});
    next();
})




module.exports = mongoose.model('Posts',PostsSchema);