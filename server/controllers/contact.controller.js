import { Contact } from "../models/contact.model.js";

export const createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required fields"
            });
        }
        
        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });
        
        return res.status(201).json({
            success: true,
            contact,
            message: "Your message has been received. We'll get back to you soon!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit contact form"
        });
    }
};

export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            contacts
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contacts"
        });
    }
};

export const markContactAsRead = async (req, res) => {
    try {
        const { contactId } = req.params;
        
        const contact = await Contact.findById(contactId);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }
        
        contact.isRead = true;
        await contact.save();
        
        return res.status(200).json({
            success: true,
            message: "Contact marked as read"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark contact as read"
        });
    }
}; 