const express = require('express');

const {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getNearByUsers,
    profilePhotoUpload
} = require('../controllers/user');
const User = require('../models/User');

//Include Resource router
const postsRouter = require('./posts');

const router = express.Router();

//model

const Posts = require('../models/Posts');
//advance bootcamp
const advanceResults = require('../middleware/advanceResults');


//Re-route to other resource route
router.use('/:userId/posts', postsRouter);

//Upload a profile photo
router.route('/:id/photo').put(profilePhotoUpload);

router.route('/radius/:zipcode/:distance').get(getNearByUsers);

router
    .route('/')
    .get(advanceResults(User,'posts'),getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router;