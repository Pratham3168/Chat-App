import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

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

io.on("connection", (socket) => {
    console.log("A user connected : ",socket.user.fullName);

    const userId = socket.userId;
    userSocketsMap[userId] = socket.id;


    io.emit("getOnineUsers" , Object.keys(userSocketMap));

    socket.on("disconnect" , () => { 
        console.log("A user disconnected : ", socket.user.fullName);
        delete userSocketsMap[userId];
        io.emit("getOnlineUsers" , Object.keys(userSocketsMap));
    });

});

export {io, app, server}