const { Socket } = require('dgram');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
let cors = require('cors');
app.use(cors());
const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'dr54a7gze',
  api_key: '868275163814591',
  api_secret: 'U0-E-H34SF1Dl1vpyroUU361AUQ',
});

const port = 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const dotenv = require('dotenv');
const hostname = '127.0.0.1';
dotenv.config();

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', (socket) => {
  console.log(`a user connected ${socket.id}`);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    socket.broadcast.emit('recive message', msg);
  });
});

const userRoutes = require('./routers/userRouter');
const postRoutes = require('./routers/postRouter');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const mongoose = require('mongoose');
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.2d9ffmd.mongodb.net/socialmedia`;
console.log(uri)
const connect = async () => {
  try {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('connected to mongodb');
  } catch (error) {
    console.error(error);
  }
};
app.use('/auth', userRoutes);
connect();
app.use('/posts', postRoutes);

// socket.io

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}`);
  console.log(`Example app listening on port ${port}`);
});

// const { Socket } = require('dgram');
// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require('socket.io');
// const cors = require('cors');
// app.use(cors());
// const dotenv = require('dotenv');
// const hostname = '127.0.0.1';
// dotenv.config();
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3001',
//     methods: ['GET', 'POST'],
//   },
// });
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });
// io.on('connection', (socket) => {
//   console.log(`a user connected`);
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
//   socket.on('chat message', (msg) => {
//     console.log('message: ' + msg);
//     socket.broadcast.emit('recive message', msg);
//   });
// });
// const userRoutes = require('./routers/userRouter');
// const postRoutes = require('./routers/postRouter');
// const cookieParser = require('cookie-parser');

// app.use(cookieParser());

// const mongoose = require('mongoose');
// const uri = 'mongodb://localhost:27017/socialmedia';
// const connect = async () => {
//   try {
//     mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//     console.log('connected to mongodb');
//   } catch (error) {
//     console.error(error);
//   }
// };
// app.use('/auth', userRoutes);
// connect();
// app.use('/posts', postRoutes);

// server.listen(3000, () => {
//   console.log('listening on *:3000');
// });
