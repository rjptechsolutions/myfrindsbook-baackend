const express = require('express');
const router = express.Router({mergeParams:true});

const {
    getPost,
    getPosts,
    createPost,
    updatePost,
    deletePost,
    postPhotoUpload
} = require('../controllers/posts')


//Upload a profile photo
router.route('/photo').put(postPhotoUpload);


router
    .route('/')
    .get(getPosts)
    .post(createPost);

router
    .route('/:id')
    .get(getPost)
    .put(updatePost)
    .delete(deletePost)

module.exports = router;