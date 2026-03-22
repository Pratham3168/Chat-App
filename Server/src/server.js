import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes.js'
import messageRoutes from './routes/message.routes.js'


const PORT = process.env.PORT || 3000;


const app = express();

app.use('/api/auth',authRoutes);
app.use('/api/message',messageRoutes);





app.listen(PORT,()=>{
  console.log(`Server is Listening on port ${PORT}`);
 });