import FriendRequest from "../models/FriendRequest.js";

export const getIncomingRequests = async (req, res) => {
  try {
    const incomingRequests = await FriendRequest.find({
      receiverId: req.user._id,
      status: "pending",
    })
      .populate("senderId", "fullName email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(incomingRequests);
  } catch (error) {
    console.error("Error fetching incoming friend requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOutgoingRequests = async (req, res) => {
  try {
    const outgoingRequests = await FriendRequest.find({
      senderId: req.user._id,
      status: "pending",
    })
      .populate("receiverId", "fullName email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
//   res.status(200).json({ message: "Friend request route is ready" });

    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    try{
        if(senderId.toString() === receiverId){
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        });

        if(existingRequest){
            return res.status(400).json({ message: "Friend request already exists between these users" });
        }

        const newRequest = new FriendRequest({
          senderId,
          receiverId
        });

        await newRequest.save();

        res.status(201).json({ message: "Friend request sent successfully", request: newRequest });

    }catch(err){

        console.error("Error sending friend request:", err);
        res.status(500).json({ message: "Internal server error" });

    }

};

export const acceptFriendRequest = async (req, res) => {
  const { id: requestId } = req.params;
  const userId = req.user._id;

  try {
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiverId: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    request.status = "accepted";
    await request.save();

    res.status(200).json({ message: "Friend request accepted", request });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  const { id: requestId } = req.params;
  const userId = req.user._id;

  try {
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiverId: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Friend request rejected", request });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};