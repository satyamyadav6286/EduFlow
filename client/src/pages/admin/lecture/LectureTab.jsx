import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import MediaDisplay from "@/components/MediaDisplay";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import { useUploadMediaMutation } from "@/features/api/mediaApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const params = useParams();
  const { courseId, lectureId } = params;

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  // Use the new mediaApi mutation hook
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo({
        videoUrl: lecture.videoUrl,
        publicId: lecture.publicId
      });
    }
  }, [lecture]);

  const [editLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();
  const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) return 95;
            return prev + 5;
          });
        }, 500);

        const result = await uploadMedia(formData).unwrap();
        
        clearInterval(interval);
        setUploadProgress(100);

        if (result.success) {
          setUploadVideoInfo({
            videoUrl: result.data.url,
            publicId: result.data.public_id,
          });
          setBtnDisable(false);
          toast.success(result.message);
        } else {
          toast.error(result.message || "Video upload failed");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Video upload failed");
      }
    }
  };

  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle,
      videoInfo: uploadVideInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data?.message || "Failed to update lecture");
    }
  }, [isSuccess, error, data]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess, removeData]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={removeLoading} variant="destructive" onClick={removeLectureHandler}>
            {
              removeLoading ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </> : "Remove Lecture"
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>

        {/* Preview current video if exists */}
        {uploadVideInfo?.videoUrl && (
          <div className="my-5">
            <Label>Current Video</Label>
            <div className="mt-2 aspect-video w-full max-w-md">
              <MediaDisplay
                type="video"
                src={uploadVideInfo.videoUrl}
                className="rounded-lg overflow-hidden"
                videoProps={{
                  width: "100%",
                  height: "100%",
                  controls: true
                }}
              />
            </div>
          </div>
        )}
        
        <div className="my-5">
          <Label>
            Upload New Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="Ex. Introduction to Javascript"
            className="w-fit"
            disabled={isUploading}
          />
        </div>
        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isFree} onCheckedChange={setIsFree} id="free-video" />
          <Label htmlFor="free-video">Is this video FREE</Label>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        <div className="mt-4">
          <Button disabled={isLoading || isUploading} onClick={editLectureHandler}>
            {
              isLoading ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </> : "Update Lecture"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
