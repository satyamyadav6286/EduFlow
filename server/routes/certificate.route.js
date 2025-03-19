import express from "express";
import {
  generateCertificate,
  downloadCertificate,
  verifyCertificate
} from "../controllers/certificate.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Generate certificate for a course (protected - only for the user who completed the course)
router.route("/:courseId/generate").post(isAuthenticated, generateCertificate);

// Download certificate (protected - only for the owner of the certificate)
router.route("/:certificateId/download").get(isAuthenticated, downloadCertificate);

// Verify certificate (public - anyone can verify a certificate)
router.route("/:certificateId/verify").get(verifyCertificate);

export default router; 