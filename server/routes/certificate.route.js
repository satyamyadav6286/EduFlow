import express from "express";
import {
  generateCertificate,
  downloadCertificate,
  verifyCertificate,
  getCertificateByCourseid
} from "../controllers/certificate.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { validateToken } from "../middlewares/tokenValidator.js";

const router = express.Router();

// Get certificate for a course (protected - only for the user who completed the course)
router.route("/:courseId").get(isAuthenticated, getCertificateByCourseid);

// Generate certificate for a course (protected - only for the user who completed the course)
router.route("/:courseId/generate").post(isAuthenticated, generateCertificate);

// Download certificate (public - anyone can download a certificate)
router.route("/:certificateId/download")
  .get(downloadCertificate)
  .post(downloadCertificate);

// Verify certificate (public - anyone can verify a certificate)
router.route("/:certificateId/verify").get(verifyCertificate);

export default router; 