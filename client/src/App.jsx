import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import HeroSection from "./pages/student/HeroSection";
import MainLayout from "./layout/MainLayout";
import Courses from "./pages/student/Courses";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Bookmarks from "./pages/student/Bookmarks";
import Certificate from "./pages/student/Certificate";
import QuizCertificate from "./pages/student/QuizCertificate";
import VerifyQuizCertificate from "./pages/student/VerifyQuizCertificate";
import Sidebar from "./pages/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import CourseTable from "./pages/admin/course/CourseTable";
import AddCourse from "./pages/admin/course/AddCourse";
import EditCourse from "./pages/admin/course/EditCourse";
import CreateLecture from "./pages/admin/lecture/CreateLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import QuizEditor from "./pages/admin/course/QuizEditor";
import CourseDetail from "./pages/student/CourseDetail";
import CourseProgress from "./pages/student/CourseProgress";
import SearchPage from "./pages/student/SearchPage";
import ContactMessages from "./pages/admin/ContactMessages";
import Instructors from "./pages/admin/Instructors";
import Testimonials from "./components/Testimonials";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import VerifyCertificate from "./pages/VerifyCertificate";
import {
  AdminRoute,
  AuthenticatedUser,
  ProtectedRoute,
} from "./components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import { ErrorBoundary, NotFound } from "./components/ErrorBoundary";
import QuizScorecard from "./pages/student/QuizCertificate";
import { ApiUrlLogger } from "./utils/ApiUrlLogger";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
            <Testimonials />
            <ContactForm />
            <Footer />
          </>
        ),
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookmarks",
        element: (
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-detail/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
            <CourseProgress />
            </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "verify-certificate",
        element: <VerifyCertificate />,
      },
      {
        path: "verify",
        element: <VerifyCertificate />,
      },
      {
        path: "certificate",
        element: (
          <ProtectedRoute>
            <Certificate />
          </ProtectedRoute>
        ),
      },
      {
        path: "quiz-certificate",
        element: (
          <ProtectedRoute>
            <QuizScorecard />
          </ProtectedRoute>
        ),
      },
      {
        path: "verify-quiz/:certificateId",
        element: <VerifyQuizCertificate />,
      },

      // admin routes start from here
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "course",
            element: <CourseTable />,
          },
          {
            path: "course/create",
            element: <AddCourse />,
          },
          {
            path: "course/:courseId",
            element: <EditCourse />,
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />,
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },
          {
            path: "course/:courseId/quiz",
            element: <QuizEditor />,
          },
          {
            path: "messages",
            element: <ContactMessages />,
          },
          {
            path: "instructors",
            element: <Instructors />,
          },
        ],
      },
      // Catch-all route for 404 errors
      {
        path: "*",
        element: <NotFound />
      }
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="eduflow-ui-theme">
      <RouterProvider router={appRouter} />
      <ApiUrlLogger />
    </ThemeProvider>
  );
}
