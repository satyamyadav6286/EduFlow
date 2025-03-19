import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";
import fs from "fs";

export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category} = req.body;
        if(!courseTitle || !category) {
            return res.status(400).json({
                message:"Course title and category is required."
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator:req.id
        });

        return res.status(201).json({
            course,
            message:"Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const searchCourse = async (req,res) => {
    try {
        const { query = "", categories = "", sortByPrice = "" } = req.query;
        
        // Parse categories from comma-separated string to array if needed
        const categoryArray = categories ? categories.split(',') : [];
        
        // create search query
        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ]
        };

        // if categories selected
        if(categoryArray.length > 0) {
            // Create an array of exact category matches
            searchCriteria.category = { $in: categoryArray };
            
            // Remove category from the $or search criteria to avoid duplicate results
            searchCriteria.$or = searchCriteria.$or.filter(field => !field.hasOwnProperty('category'));
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low") {
            sortOptions.coursePrice = 1; // sort by price in ascending
        } else if(sortByPrice === "high") {
            sortOptions.coursePrice = -1; // descending
        }

        let courses = await Course.find(searchCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error searching courses",
            error: error.message
        });
    }
}

export const getPublishedCourse = async (_,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if(!courses){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}
export const editCourse = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        console.log("Editing course:", courseId);
        console.log("Request body:", req.body);
        console.log("File:", thumbnail ? {
            fieldname: thumbnail.fieldname,
            originalname: thumbnail.originalname,
            mimetype: thumbnail.mimetype,
            size: thumbnail.size,
            path: thumbnail.path
        } : "No file uploaded");

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }

        // Build the update data object
        const updateData = {};
        if(courseTitle) updateData.courseTitle = courseTitle;
        if(subTitle) updateData.subTitle = subTitle;
        if(description) updateData.description = description;
        if(category) updateData.category = category;
        if(courseLevel) updateData.courseLevel = courseLevel;
        if(coursePrice) updateData.coursePrice = coursePrice;

        console.log("Update data (before thumbnail):", updateData);

        // Only process the thumbnail if one was uploaded
        if(thumbnail && thumbnail.path){
            try {
                // Delete old thumbnail if it exists
                if(course.courseThumbnail){
                    try {
                        const urlParts = course.courseThumbnail.split("/");
                        const publicIdWithExtension = urlParts[urlParts.length - 1];
                        const publicId = `eduflow/${publicIdWithExtension.split(".")[0]}`;
                        
                        console.log(`Deleting old thumbnail with public ID: ${publicId}`);
                        await deleteMediaFromCloudinary(publicId);
                        console.log("Old thumbnail deleted successfully");
                    } catch (deleteError) {
                        console.error("Error deleting old thumbnail:", deleteError);
                        // Continue with the upload even if delete fails
                    }
                }
                
                // Verify the file exists and is readable
                if (!fs.existsSync(thumbnail.path)) {
                    throw new Error(`Upload file not found at path: ${thumbnail.path}`);
                }

                const stats = fs.statSync(thumbnail.path);
                if (stats.size === 0) {
                    throw new Error("Uploaded file is empty");
                }

                // Upload the new thumbnail to Cloudinary
                console.log(`Uploading new thumbnail from path: ${thumbnail.path}`);
                const uploadResult = await uploadMedia(thumbnail.path);
                
                if (!uploadResult || !uploadResult.secure_url) {
                    throw new Error("Failed to get secure URL from Cloudinary");
                }
                
                updateData.courseThumbnail = uploadResult.secure_url;
                console.log("Thumbnail URL set to:", updateData.courseThumbnail);
            } catch (uploadError) {
                console.error("Error handling thumbnail:", uploadError);
                return res.status(500).json({
                    message: "Failed to process image upload",
                    error: uploadError.message
                });
            }
        }

        // Only update if there's something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No updates provided"
            });
        }
        
        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});
        console.log("Course updated successfully:", course._id);

        return res.status(200).json({
            course,
            message:"Course updated successfully."
        })

    } catch (error) {
        console.error("Course update error:", error);
        return res.status(500).json({
            message:"Failed to update course",
            error: error.message
        })
    }
}
export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        const course = await Course.findById(courseId);

        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle} = req.body;
        const {courseId} = req.params;

        if(!lectureTitle || !courseId){
            return res.status(400).json({
                message:"Lecture title is required"
            })
        };

        // create lecture
        const lecture = await Lecture.create({lectureTitle});

        const course = await Course.findById(courseId);
        if(course){
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message:"Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create lecture"
        })
    }
}
export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}
export const editLecture = async (req,res) => {
    try {
        const {lectureTitle, videoInfo, isPreviewFree} = req.body;
        
        const {courseId, lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            })
        }

        // update lecture
        if(lectureTitle) lecture.lectureTitle = lectureTitle;
        if(videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if(videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        // Ensure the course still has the lecture id if it was not aleardy added;
        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        };
        return res.status(200).json({
            lecture,
            message:"Lecture updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to edit lectures"
        })
    }
}
export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}


// publich unpublish course logic

export const togglePublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true, false
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update status"
        })
    }
}

export const removeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Check if the user is the creator of the course
    if (course.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course"
      });
    }
    
    // First delete all lectures associated with the course
    if (course.lectures && course.lectures.length > 0) {
      // Get all lecture details
      const lectures = await Lecture.find({ _id: { $in: course.lectures } });
      
      // Delete all videos from cloudinary
      for (const lecture of lectures) {
        if (lecture.videoUrl) {
          try {
            // Extract public_id from the URL
            const publicId = lecture.videoUrl.split('/').pop().split('.')[0];
            await deleteVideoFromCloudinary(publicId);
          } catch (error) {
            console.log("Error deleting lecture video:", error);
          }
        }
      }
      
      // Delete all lectures from database
      await Lecture.deleteMany({ _id: { $in: course.lectures } });
    }
    
    // Delete course thumbnail if exists
    if (course.courseThumbnail) {
      try {
        const publicId = course.courseThumbnail.split('/').pop().split('.')[0];
        await deleteMediaFromCloudinary(publicId);
      } catch (error) {
        console.log("Error deleting course thumbnail:", error);
      }
    }
    
    // Finally delete the course
    await Course.findByIdAndDelete(courseId);
    
    return res.status(200).json({
      success: true,
      message: "Course and all associated content deleted successfully"
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course"
    });
  }
}

export const editCourseTextOnly = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;

        console.log("Text-only course update for ID:", courseId);
        console.log("Request body:", req.body);

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }

        // Build the update data object with only text fields
        const updateData = {};
        if(courseTitle) updateData.courseTitle = courseTitle;
        if(subTitle) updateData.subTitle = subTitle;
        if(description) updateData.description = description;
        if(category) updateData.category = category;
        if(courseLevel) updateData.courseLevel = courseLevel;
        if(coursePrice) updateData.coursePrice = coursePrice;

        console.log("Update data:", updateData);
        
        // Only update if there's something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No updates provided"
            });
        }
        
        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});
        console.log("Course updated successfully:", course._id);

        return res.status(200).json({
            course,
            message:"Course updated successfully."
        })

    } catch (error) {
        console.error("Text-only course update error:", error);
        return res.status(500).json({
            message:"Failed to update course",
            error: error.message
        })
    }
}
