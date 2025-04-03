import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGenerateCertificateMutation, useDownloadCertificateMutation } from '@/features/api/certificateApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Award, Copy, ExternalLink, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const Certificate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [certificate, setCertificate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  
  // Get courseId from query params
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get('courseId');
  
  // API hooks
  const [generateCertificate, { isLoading: isGeneratingCertificate }] = useGenerateCertificateMutation();
  const [downloadCertificate, { isLoading: isDownloading }] = useDownloadCertificateMutation();
  
  // Generate certificate on component mount if courseId is provided
  useEffect(() => {
    if (courseId && !certificate && !isGenerating) {
      handleGenerateCertificate();
    }
  }, [courseId, certificate]);
  
  const handleGenerateCertificate = async () => {
    if (!courseId) {
      toast.error('Course ID is required to generate a certificate');
      navigate('/my-learning');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await generateCertificate(courseId).unwrap();
      setCertificate(response.certificate);
      toast.success('Certificate generated successfully!');
    } catch (error) {
      toast.error(error.data?.message || 'Failed to generate certificate. Please ensure you have completed the course.');
      navigate(`/course-progress/${courseId}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    if (!certificate?.id) {
      toast.error('Certificate not found');
      return;
    }
    
    try {
      const response = await downloadCertificate(certificate.id).unwrap();
      
      // Create a blob URL and trigger download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EduFlow_Certificate_${certificate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };
  
  const handlePrint = () => {
    if (!certificate?.downloadUrl) {
      toast.error('Certificate PDF not available');
      return;
    }
    
    const printWindow = window.open(certificate.downloadUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    } else {
      toast.error('Please allow pop-ups to print the certificate');
    }
  };
  
  const handleCopyVerificationLink = () => {
    const verificationUrl = `${window.location.origin}/verify-certificate?id=${certificate.id}`;
    navigator.clipboard.writeText(verificationUrl)
      .then(() => toast.success('Verification link copied to clipboard'))
      .catch(() => toast.error('Failed to copy verification link'));
  };
  
  // Loading state
  if (isGenerating || isGeneratingCertificate) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="border-2 border-blue-100 dark:border-blue-900">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Generating Your Certificate</CardTitle>
            <CardDescription>
              Please wait while we prepare your certificate...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // No certificate state
  if (!certificate) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="border-2 border-red-100 dark:border-red-900">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Certificate Not Available</CardTitle>
            <CardDescription>
              Unable to generate or find your certificate. Please ensure you have completed the course requirements.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate(`/course-progress/${courseId}`)}>
              Return to Course
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Certificate found state
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
          <div className="bg-white dark:bg-gray-800 border rounded-lg overflow-hidden my-6 relative">
            {certificate.downloadUrl ? (
              <>
                {!pdfLoaded && (
                  <div className="absolute inset-0 flex justify-center items-center bg-gray-50 dark:bg-gray-800">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <iframe 
                  src={`${certificate.downloadUrl}#toolbar=0`}
                  className="w-full min-h-[500px]" 
                  title="Certificate Preview"
                  onLoad={() => setPdfLoaded(true)}
                />
              </>
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-3">Certificate of Completion</h3>
                <p className="text-lg mb-2">This certifies that</p>
                <p className="text-2xl font-bold mb-2">{user?.name}</p>
                <p className="mb-4">has successfully completed the course</p>
                <p className="text-xl font-bold mb-6">{certificate.course}</p>
                <div className="flex justify-center mb-4">
                  <div className="h-px w-32 bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <p className="text-sm">Date: {new Date(certificate.completionDate || certificate.issuedDate).toLocaleDateString()}</p>
                <p className="text-sm mt-2">Certificate ID: {certificate.id}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificate ID</p>
              <p className="font-medium flex items-center gap-2">
                {certificate.id}
                <button 
                  onClick={handleCopyVerificationLink} 
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Issued On</p>
              <p className="font-medium">
                {new Date(certificate.completionDate || certificate.issuedDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-3 justify-center">
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading} 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Certificate
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/verify-certificate')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Verify Certificate
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate(`/course-progress/${courseId}`)}
            className="flex items-center gap-2"
          >
            Back to Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Certificate; 