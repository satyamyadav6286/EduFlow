import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetQuizCertificateDetailsQuery } from '@/features/api/quizApi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const VerifyQuizCertificate = () => {
  const { certificateId } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, valid, invalid
  
  const { 
    data: details, 
    isLoading, 
    isError, 
    error 
  } = useGetQuizCertificateDetailsQuery(certificateId, { skip: !certificateId });
  
  useEffect(() => {
    if (isError) {
      setVerificationStatus('invalid');
    } else if (details?.success) {
      setVerificationStatus('valid');
    }
  }, [details, isError]);
  
  if (isLoading || verificationStatus === 'verifying') {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verifying Quiz Certificate</CardTitle>
            <CardDescription>Please wait while we verify the certificate authenticity...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (verificationStatus === 'invalid') {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4">
        <Card className="border-red-200">
          <CardHeader className="text-center bg-red-50">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-600">Invalid Certificate</CardTitle>
            <CardDescription className="text-red-500">
              {error?.data?.message || "This quiz certificate could not be verified or does not exist."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p>The certificate ID <strong>{certificateId}</strong> is not valid. Please check the ID and try again.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Valid certificate
  const certificate = details?.certificate;
  const userData = certificate?.user || {};
  const quizData = certificate?.quiz || {};
  const courseData = certificate?.course || {};
  
  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <Card className="border-green-200">
        <CardHeader className="text-center bg-green-50">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-700">Verified Quiz Certificate</CardTitle>
          <CardDescription className="text-green-600">
            This quiz achievement certificate is authentic and valid
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center p-6 bg-blue-50 rounded-full">
              <FileText className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">{userData.name}</h2>
              <p className="text-gray-500">has successfully demonstrated knowledge in</p>
              <h3 className="text-lg font-semibold mt-2">{quizData.title || 'Quiz'}</h3>
              <p className="text-sm text-gray-500 mt-1">from the course: {courseData.title || 'Course'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Quiz Score</p>
                <p className="font-medium">{Math.round(certificate?.score || 0)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">{certificate?.isPassed ? 'PASSED' : 'COMPLETED'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-medium">{new Date(certificate?.issuedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-medium font-mono text-xs">{certificate?.id || certificateId}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700">About This Certificate</h4>
                  <p className="text-sm mt-1">
                    This quiz achievement certificate verifies that the student has successfully completed 
                    and demonstrated knowledge in the subject matter through an evaluation process. 
                    The certificate is issued by EduFlow Learning Platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyQuizCertificate; 