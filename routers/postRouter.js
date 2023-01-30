const express = require('express');
const {
  getAllPosts,
  getPostById,
  addPost,
  addComment,
  addLike,
  getNotification,
} = require('../controllers/postController');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const jwtToken = require('../generateAccessToken');
const path = require('path');
const PostModel = require('../models/PostModel');
const router = express.Router();

// for photoupload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
let upload = multer({ storage, fileFilter });

// getall posts
router.get('/', getAllPosts);

// get postById
router.get('/userId/:email', getPostById);

// get notification
router.get('/notification/:email', getNotification);

// add post
router.post('/', upload.single('image'), tokenValidation, addPost);

// middleware for tokenValidation
function tokenValidation(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.send('invalid user');
  }
  jwt.verify(authHeader, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.send('invalid user');
    req.user = user;
    next();
  });
}

// add comment
router.put('/comment', addComment);
router.put('/like', addLike);

module.exports = router;
// module.exports = storage;
