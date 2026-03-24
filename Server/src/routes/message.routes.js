import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getAllContacts ,getChatPartners,getMessagesByUserId, sendMessage } from '../controllers/message.controller.js';
import { arcjetProtection } from '../middlewares/arcjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection,protectRoute); // Apply Arcjet protection and authentication middleware to all routes in this router

router.get('/contacts',getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id",  getMessagesByUserId);
router.post("/send/:id", sendMessage);

router.get('/send',(req,res)=>{
    res.send('Send Message Endpoint');
});


export default router;