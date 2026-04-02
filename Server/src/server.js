import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
dotenv.config();

import authRoutes from './routes/auth.routes.js'
import messageRoutes from './routes/message.routes.js'
import friendRoutes from './routes/friend.routes.js'
import { app, server } from './lib/socket.js';


const PORT = process.env.PORT || 3000;


// const app = express();
const REQUEST_BODY_LIMIT = '10mb';

const __dirname = path.resolve();

app.use(cors({origin:process.env.CLIENT_URL, credentials:true}));
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
app.use(cookieParser());

app.use('/api/auth',authRoutes);
app.use('/api/message',messageRoutes);
app.use('/api/friend',friendRoutes);


// MAKING READY FOR PRODUCTION
if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname,'../Client/dist')));

  app.get('/{*splat}',(req,res)=>{
        res.sendFile(path.join(__dirname,'../Client/dist/index.html'));
    });
}





server.listen(PORT,()=>{
  console.log(`Server is Listening on port ${PORT}`);
    connectDB();
 });