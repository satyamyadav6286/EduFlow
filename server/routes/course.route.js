import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeCourse, removeLecture, searchCourse, togglePublishCourse, editCourseTextOnly } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
const router = express.Router();

// Public routes
router.route("/search").get(searchCourse);
router.route("/published-courses").get(getPublishedCourse);

// Protected routes
router.route("/").post(isAuthenticated,createCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId").put(isAuthenticated, upload.single('courseThumbnail'), editCourse);
router.route("/:courseId/textupdate").put(isAuthenticated, editCourseTextOnly);
router.route("/:courseId").delete(isAuthenticated, removeCourse);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);

export default router;