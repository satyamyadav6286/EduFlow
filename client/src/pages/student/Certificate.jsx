import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGenerateCertificateMutation, useGetCertificateQuery } from '@/features/api/certificateApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Award, Copy, ExternalLink, Printer, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const Certificate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId: pathCourseId } = useParams(); // Get courseId from path parameter
  const searchParams = new URLSearchParams(location.search);
  const queryCourseId = searchParams.get('courseId');
  
  // Use courseId from either path parameter or query parameter
  const courseId = pathCourseId || queryCourseId;
  
  const user = useSelector((state) => state.auth.user);
  
  const [isDownloading, setIsDownloading] = useState(false);
  
  // For API fallback
  const [generateCertificate] = useGenerateCertificateMutation();
  const { 
    data: certificateData, 
    isLoading, 
    error, 
    refetch 
  } = useGetCertificateQuery(courseId, { skip: !courseId });
  
  const certificate = certificateData?.data;
  
  // Try to generate certificate if not found
  useEffect(() => {
    if (error && courseId) {
      handleGenerateCertificate();
    }
  }, [error, courseId]);
  
  // Function to generate certificate with better error handling
  const handleGenerateCertificate = async () => {
    try {
      toast.info("Generating certificate...");
      await generateCertificate(courseId).unwrap();
      toast.success("Certificate generated successfully!");
      refetch();
    } catch (error) {
      console.error("Certificate generation error:", error);
      toast.error(error.data?.message || error.message || "Failed to generate certificate");
    }
  };

  const handleCopyLink = () => {
    if (!certificate?.id) {
      toast.error('Certificate not found');
      return;
    }
    
    const url = `${window.location.origin}/verify-certificate/${certificate.id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Certificate link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleShareToLinkedIn = () => {
    if (!certificate?.id) {
      toast.error('Certificate not found');
      return;
    }

    const certificateUrl = `${window.location.origin}/verify-certificate/${certificate.id}`;
    const title = `${certificate.course} - Course Completion Certificate`;
    const summary = `I've successfully completed the ${certificate.course} course on EduFlow Learning Platform`;
    
    const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    
    window.open(linkedinShareUrl, '_blank', 'width=600,height=600');
    toast.success('Opening LinkedIn sharing window');
  };

  // Direct download function
  const handleDownload = () => {
    if (!certificate?.id) {
      toast.error('Certificate not found');
      return;
    }
    
    try {
      setIsDownloading(true);
      toast.info("Preparing certificate...");
      
      // Generate a unique ID for this download to prevent caching
      const timestamp = Date.now();
      
      // Always use the direct URL from the server
      const directFileUrl = `${import.meta.env.VITE_API_URL}/certificates/file/${certificate.id}?t=${timestamp}`;
      
      console.log("Downloading certificate from:", directFileUrl);
      
      // Open in a new tab
      window.open(directFileUrl, '_blank');
      
      setTimeout(() => {
        setIsDownloading(false);
        toast.success("Certificate download initiated");
      }, 1000);
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);
      toast.error("Download failed. Please try again later.");
    }
  };
  
  // If no courseId is provided, show message
  if (!courseId) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Certificate Not Available</CardTitle>
            <CardDescription>
              No course ID was provided. Please go back to your course.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-8">
            <Button onClick={() => navigate('/my-learning')}>
              Go to My Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Loading Certificate</CardTitle>
            <CardDescription>
              Please wait while we retrieve your certificate...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="border-2 border-green-100 dark:border-green-900">
        <CardHeader className="text-center bg-green-50 dark:bg-green-900/20">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-800 rounded-full">
              <Award className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-300">Congratulations!</CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400">
            You have successfully completed the course and earned your certificate.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-6">
          {/* Certificate details view */}
          <div className="p-8 text-center border rounded-lg bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-3">Certificate of Completion</h3>
            <p className="text-lg mb-2">This certifies that</p>
            <p className="text-2xl font-bold mb-2">{user?.name}</p>
            <p className="mb-4">has successfully completed the course</p>
            <p className="text-xl font-bold mb-6">{certificate?.course || "Course"}</p>
            <div className="flex justify-center mb-4">
              <div className="h-px w-32 bg-gray-300 dark:bg-gray-600"></div>
            </div>
            <p className="text-sm">Date: {certificate?.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p className="text-sm mt-2">Certificate ID: {certificate?.id || "Pending"}</p>
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Certificate Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Student Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Course</p>
                  <p className="font-medium">{certificate?.course || "Course"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Issue Date</p>
                  <p className="font-medium">{certificate?.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Certificate ID</p>
                  <p className="font-medium">{certificate?.id || "Pending"}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-500" />
                Share Your Achievement
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Share your certificate with others or add it to your LinkedIn profile to showcase your new skills.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </Button>
                <Button size="sm" onClick={handleShareToLinkedIn} className="flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Add to LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleDownload} 
            className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
            disabled={isDownloading || !certificate?.id}
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Certificate
              </>
            )}
          </Button>
          <Button 
            onClick={() => certificate?.id && window.open(`${import.meta.env.VITE_API_URL}/certificates/file/${certificate.id}`, '_blank')} 
            variant="outline" 
            className="flex-1 flex items-center justify-center gap-2"
            disabled={!certificate?.id}
          >
            <ExternalLink className="h-4 w-4" />
            View Certificate
          </Button>
          <Button 
            onClick={() => navigate(`/course-progress/${courseId}`)} 
            variant="secondary" 
            className="flex-1"
          >
            Back to Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Certificate; 