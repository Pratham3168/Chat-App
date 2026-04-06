import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChat } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChat },
        { senderId: userToChat, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
        {
            senderId: userToChat,
            receiverId: myId,
            status: {$ne: "read"},
        },
        { $set: { status: "read" } }
    );

    // Emit socket event to notify sender that messages are read
    const userSocketId = getReceiverSocketId(userToChat);
    if (userSocketId) {
      io.to(userSocketId).emit("messagesRead", {
        senderId: userToChat,
        receiverId: myId,
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;
    const { id: receiverId } = req.params;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required" });
    }

    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({
          message: "Can't send message to yourSelf, feature coming soon",
        });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found!" });
    }

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: "sent",
    });

    await newMessage.save();

    const senderSocketId = getReceiverSocketId(senderId);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      newMessage.status = "delivered";
      await newMessage.save();

      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    if(senderSocketId){
        io.to(senderSocketId).emit("messageStatusUpdated", {
          messageId: newMessage._id,
          status: newMessage.status,
        });
      }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // SECURITY FIX: Only return friends, not message-based partners
    const user = await User.findById(loggedInUserId).populate('friends', '-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only include friends who have messages with the user (recent conversations)
    const friendIds = user.friends?.map((friend) => friend._id) || [];

    // Get most recent message with each friend (for ordering)
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: { $in: friendIds } },
        { receiverId: loggedInUserId, senderId: { $in: friendIds } },
      ],
    }).sort({ createdAt: -1 });

    // Get unique friend IDs that have messages
    const friendsWithMessages = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    // Return friends with messages (most recent first)
    const chatPartners = await User.find({
      _id: { $in: friendsWithMessages },
    }).select("-password");

    // Sort by most recent message
    const sortedPartners = chatPartners.sort((a, b) => {
      const msgA = messages.find(
        (msg) =>
          (msg.senderId.toString() === a._id.toString() ||
            msg.receiverId.toString() === a._id.toString()),
      );
      const msgB = messages.find(
        (msg) =>
          (msg.senderId.toString() === b._id.toString() ||
            msg.receiverId.toString() === b._id.toString()),
      );
      return new Date(msgB?.createdAt || 0) - new Date(msgA?.createdAt || 0);
    });

    res.status(200).json(sortedPartners);
  } catch (error) {
    console.error("Error fetching chat partners:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
