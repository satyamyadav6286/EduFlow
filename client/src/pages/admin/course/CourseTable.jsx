import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useGetCreatorCourseQuery, useRemoveCourseMutation } from "@/features/api/courseApi";
import { Edit, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

const CourseTable = () => {
  const { data, isLoading, isError, refetch } = useGetCreatorCourseQuery();
  const [removeCourse, { isSuccess, isError: isRemoveError, error }] = useRemoveCourseMutation();
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Course deleted successfully");
      refetch();
    }
    if (isRemoveError) {
      toast.error(error?.data?.message || "Failed to delete course");
    }
  }, [isSuccess, isRemoveError, error, refetch]);

  const handleDeleteCourse = async () => {
    if (courseToDelete) {
      await removeCourse(courseToDelete);
      setCourseToDelete(null);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (isError) return (
    <div className="text-center p-10">
      <h2 className="text-xl text-red-500 mb-4">Failed to load courses</h2>
      <Button onClick={() => refetch()}>Try Again</Button>
    </div>
  );

  // Add null check for data
  const courses = data?.courses || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Button onClick={() => navigate(`create`)}>Create a new course</Button>
      </div>

      {courses.length > 0 ? (
        <Table>
          <TableCaption>A list of your recent courses.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course?._id}>
                <TableCell className="font-medium">₹{course?.coursePrice || "NA"}</TableCell>
                <TableCell>
                  <Badge variant={course?.isPublished ? "success" : "secondary"}>
                    {course?.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>{course?.courseTitle || "Untitled Course"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => navigate(`${course?._id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => setCourseToDelete(course?._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            course "{course?.courseTitle || 'this course'}" and all its lectures.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteCourse}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-10 border rounded-lg">
          <p className="text-gray-500">You haven't created any courses yet.</p>
          <Button 
            onClick={() => navigate(`create`)} 
            className="mt-4"
          >
            Create your first course
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseTable;
