import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
dotenv.config();

import authRoutes from './routes/auth.routes.js'
import messageRoutes from './routes/message.routes.js'


const PORT = process.env.PORT || 3000;


const app = express();

const __dirname = path.resolve();

app.use(cors({origin:process.env.CLIENT_URL, credentials:true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth',authRoutes);
app.use('/api/message',messageRoutes);


// MAKING READY FOR PRODUCTION
if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname,'../Client/dist')));

  app.get('/{*splat}',(req,res)=>{
        res.sendFile(path.join(__dirname,'../Client/dist/index.html'));
    });
}





app.listen(PORT,()=>{
  console.log(`Server is Listening on port ${PORT}`);
    connectDB();
 });