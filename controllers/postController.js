const mongoose = require('mongoose');
const cloudinary = require('cloudinary');

const postModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');
const NotificationModel = require('../models/NotificationModel');
const PostModel = require('../models/PostModel');

const getAllPosts = async (req, res) => {
  const allPosts = await postModel.find({}).populate('user');
  res.json({
    allPosts,
  });
};

const getPostById = async (req, res) => {
  const withoutQuotesEmail = req.params.email.replaceAll('"', '');
  const postByID = await postModel
    .find({ email: withoutQuotesEmail })
    .populate('user');
  res.json({
    postByID,
  });
};
const addPost = async (req, res) => {
  try{
    const withoutQuotesEmail = req.body?.email?.replaceAll('"', '');
    const userId = await UserModel.find({ gmail: withoutQuotesEmail });
    const user_id = await UserModel.findOne({ gmail: withoutQuotesEmail });
    if (req.file) {
      await cloudinary.uploader
        .upload(req.file.path, (result) => {
          // This will return the output after the code is exercuted both in the terminal and web browser
          // When successful, the output will consist of the metadata of the uploaded file one after the other. These include the name, type, size and many more.
          console.log(result);
        })
        .then(async (result) => {
          const newPost = await postModel.create({
            email: withoutQuotesEmail,
            title: req.body.title,
            content: req.body.content,
            tags: req.body.tags,
            image: result.secure_url,
            user: user_id,
          });
          const users = await UserModel.findOneAndUpdate(
            {
              gmail: withoutQuotesEmail,
            },
            {
              $push: { posts: newPost },
            }
          );
          res.send('added to db');
        });
    } else {
      const newPost = await postModel.create({
        email: withoutQuotesEmail,
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
        image: '',
        user: user_id,
      });
      const users = await UserModel.findOneAndUpdate(
        {
          gmail: withoutQuotesEmail,
        },
        {
          $push: { posts: newPost },
        }
      );
      res.send('added to db');
    }
  }
  catch(err){
    console.log(err)
   res.json(err.message)
  }
 
};

// add Comment to post
const addComment = async (req, res) => {
  try{
    const withoutQuotesEmail = req.body.email.replaceAll('"', '');
    const data = await postModel.findByIdAndUpdate(
      {
        _id: req.body.id,
      },
      {
        $push: {
          comments: { email: withoutQuotesEmail, comment: req.body.comment },
        },
      }
    );
  
    const notification = await NotificationModel.create({
      content: `${withoutQuotesEmail} has commented: ${req.body.comment} `,
      post: data._id,
    });
    const notificationID = await PostModel.findByIdAndUpdate(
      { _id: data._id },
      {
        $push: { notification: notification },
      }
    );
    if (notification) {
      res.json({
        message: 'notification saved',
      });
    }
  }
  catch(err){
   res.json(err)
  }
 
};

const addLike = async (req, res) => {
  try{
    const withoutQuotesEmail = req.body.email?.replaceAll('"', '');
    const { likes, _id } = await postModel.findById({ _id: req.body.id });
    const check = likes.filter((item) => {
      if (item.email === withoutQuotesEmail) {
        return item;
      }
    });
  
    if (check.length === 0) {
      const data = await postModel.findByIdAndUpdate(
        { _id: req.body.id, 'likes.email': withoutQuotesEmail },
        {
          $push: {
            likes: { email: withoutQuotesEmail, like: true },
          },
        }
      );
      const notification = await NotificationModel.create({
        content: `${withoutQuotesEmail} has liked your post `,
        post: data._id,
      });
      const notificationID = await PostModel.findByIdAndUpdate(
        { _id: data._id },
        {
          $push: { notification: notification },
        }
      );
      if (data) {
        res.json({
          status: true,
          // postId: req.body.id,
        });
      }
    } else {
      const data = await postModel.updateOne(
        { _id: req.body.id, 'likes.email': withoutQuotesEmail },
        { $pull: { likes: { email: withoutQuotesEmail, like: true } } },
        { multi: true }
      );
      if (data) {
        res.json({
          status: true,
          // postId: req.body.id,
        });
      }
    }
  }
  catch(err){
res.json(err)
  }
  

  // const notification = await NotificationModel.create({
  //   content: `${withoutQuotesEmail} has liked your post`,
  //   post: _id,
  // });
  // const notificationID = await PostModel.findByIdAndUpdate(
  //   { _id: _id },
  //   {
  //     notification: notification._id,
  //   }
  // );
};
const getNotification = async (req, res) => {
  const email = req.params.email;

  const data = await PostModel.find({
    email: email,
  }).populate('notification');
  const allNotification = data.map((item, id) => {
    return item.notification;
  });
  const concatNotification = Array.prototype.concat(allNotification);
  const merged = concatNotification.filter((item, id) => {
    return item;
  });

  const notification = merged.map((item, id) => {
    return item.map((item, id) => {
      return item;
    });
  });

  const notify = notification.flat(1);

  const sortedNotification = notify.sort((a, b) => {
    return b.created_at - a.created_at;
  });
  const onlyContentOfNotification = sortedNotification.map((item) => {
    return item.content;
  });

  res.json({
    notification: onlyContentOfNotification,
  });
};

module.exports = {
  getAllPosts,
  getPostById,
  addPost,
  addComment,
  addLike,
  getNotification,
};
