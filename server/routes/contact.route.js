import express from "express";
import { createContact, getContacts, markContactAsRead } from "../controllers/contact.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isInstructor } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route for creating a contact submission
router.route("/").post(createContact);

// Protected routes for instructors
router.route("/").get(isAuthenticated, isInstructor, getContacts);
router.route("/:contactId").patch(isAuthenticated, isInstructor, markContactAsRead);

export default router; 