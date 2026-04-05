import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import { socketAuthMiddleware } from '../middlewares/socket.auth.middleware.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin : process.env.CLIENT_URL,
        credentials : true
    },
});

io.use(socketAuthMiddleware);



const userSocketsMap = {};

export function getReceiverSocketId(userId){
    return userSocketsMap[userId];
}

export function emitToUser(userId,eventName,payload){
    const socketId = getReceiverSocketId(userId);
    if(!socketId){
        return false;
    }
    io.to(socketId).emit(eventName,payload);
    return true;
}

io.on("connection", (socket) => {
    console.log("A user connected : ",socket.user.fullName);

    const userId = socket.userId;
    userSocketsMap[userId] = socket.id;


    io.emit("getOnlineUsers" , Object.keys(userSocketsMap));

    socket.on("typing:start", ({ toUserId } = {}) => {
        if (!toUserId) return;
        if (String(toUserId) === String(userId)) return;

        emitToUser(String(toUserId), "typing:started", {
            fromUserId: userId,
        });
    });

    socket.on("typing:stop", ({ toUserId } = {}) => {
        if (!toUserId) return;
        if (String(toUserId) === String(userId)) return;

        emitToUser(String(toUserId), "typing:stopped", {
            fromUserId: userId,
        });
    });

    socket.on("disconnect" , () => { 
        console.log("A user disconnected : ", socket.user.fullName);
        delete userSocketsMap[userId];
        io.emit("getOnlineUsers" , Object.keys(userSocketsMap));
    });

});

export {io, app, server}