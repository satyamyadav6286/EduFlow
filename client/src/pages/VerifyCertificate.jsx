import React, { useState } from 'react';
import { useVerifyCertificateQuery } from '@/features/api/certificateApi';
import { useVerifyScorecardQuery } from '@/features/api/quizApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Check, Search, X, FileText, BarChart3, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [scorecardId, setScorecardId] = useState('');
  const [skipCert, setSkipCert] = useState(true);
  const [skipScorecard, setSkipScorecard] = useState(true);
  const [activeTab, setActiveTab] = useState('certificate');
  
  const { register: registerCert, handleSubmit: handleSubmitCert, formState: { errors: errorsCert }, reset: resetCert } = useForm();
  const { register: registerScorecard, handleSubmit: handleSubmitScorecard, formState: { errors: errorsScorecard }, reset: resetScorecard } = useForm();
  
  // Certificate verification query
  const { 
    data: certData, 
    isLoading: isLoadingCert, 
    isError: isErrorCert, 
    error: errorCert 
  } = useVerifyCertificateQuery(certificateId, { skip: skipCert });
  
  // Scorecard verification query
  const { 
    data: scorecardData, 
    isLoading: isLoadingScorecard, 
    isError: isErrorScorecard, 
    error: errorScorecard 
  } = useVerifyScorecardQuery(scorecardId, { skip: skipScorecard });
  
  const onSubmitCertificate = (formData) => {
    setCertificateId(formData.certificateId);
    setSkipCert(false);
  };
  
  const onSubmitScorecard = (formData) => {
    setScorecardId(formData.scorecardId);
    setSkipScorecard(false);
  };
  
  const handleTabChange = (value) => {
    setActiveTab(value);
    // Reset previous search results when switching tabs
    if (value === 'certificate') {
      setSkipScorecard(true);
      resetScorecard();
    } else {
      setSkipCert(true);
      resetCert();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Verification Portal</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Verify the authenticity of EduFlow certificates and quiz scorecards by entering their unique identifiers below.
        </p>
      </div>

      <Tabs defaultValue="certificate" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="certificate" className="flex items-center gap-2">
            <Award size={18} />
            Course Certificate
          </TabsTrigger>
          <TabsTrigger value="scorecard" className="flex items-center gap-2">
            <FileText size={18} />
            Quiz Scorecard
          </TabsTrigger>
        </TabsList>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <TabsContent value="certificate">
            <form onSubmit={handleSubmitCert(onSubmitCertificate)} className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    {...registerCert("certificateId", { 
                      required: "Certificate ID is required",
                      pattern: {
                        value: /^[A-Fa-f0-9]{16}$/,
                        message: "Please enter a valid certificate ID (16 characters, letters and numbers only)"
                      }
                    })}
                    placeholder="Enter Certificate ID (e.g., A1B2C3D4E5F6G7H8)"
                    className="w-full"
                  />
                  {errorsCert.certificateId && (
                    <p className="text-red-500 text-sm mt-1">{errorsCert.certificateId.message}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoadingCert}
                  className="whitespace-nowrap"
                >
                  <Search size={16} className="mr-2" />
                  {isLoadingCert ? 'Verifying...' : 'Verify Certificate'}
                </Button>
              </div>
            </form>

            {!skipCert && (
              <div className="mt-8">
                {isLoadingCert ? (
                  <div className="flex justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : isErrorCert ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <div className="rounded-full bg-red-100 dark:bg-red-900 p-2">
                      <X size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-400">Certificate Not Valid</h3>
                      <p className="text-red-600 dark:text-red-300 mt-1">
                        {errorCert?.data?.message || "The certificate ID you entered could not be verified. Please check the ID and try again."}
                      </p>
                    </div>
                  </div>
                ) : certData?.success ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                        <Check size={32} className="text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-center font-bold text-xl text-green-700 dark:text-green-400 mb-3">Certificate Verified!</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Certificate ID</p>
                        <p className="font-medium">{certData.certificate.id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Student Name</p>
                        <p className="font-medium">{certData.certificate.student}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                        <p className="font-medium">{certData.certificate.course}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completion Date</p>
                        <p className="font-medium">
                          {new Date(certData.certificate.completionDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm text-blue-700 dark:text-blue-300">
                        <Award size={14} className="mr-1" /> Official EduFlow Certificate
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="scorecard">
            <form onSubmit={handleSubmitScorecard(onSubmitScorecard)} className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    {...registerScorecard("scorecardId", { 
                      required: "Scorecard ID is required",
                      pattern: {
                        value: /^[A-Za-z0-9]{24}$/,
                        message: "Please enter a valid Scorecard ID (24 characters)"
                      }
                    })}
                    placeholder="Enter Scorecard ID (e.g., 67eed1fc0e6662d597cdb429)"
                    className="w-full"
                  />
                  {errorsScorecard.scorecardId && (
                    <p className="text-red-500 text-sm mt-1">{errorsScorecard.scorecardId.message}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoadingScorecard}
                  className="whitespace-nowrap"
                >
                  <Search size={16} className="mr-2" />
                  {isLoadingScorecard ? 'Verifying...' : 'Verify Scorecard'}
                </Button>
              </div>
            </form>

            {!skipScorecard && (
              <div className="mt-8">
                {isLoadingScorecard ? (
                  <div className="flex justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : isErrorScorecard ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <div className="rounded-full bg-red-100 dark:bg-red-900 p-2">
                      <X size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-400">Scorecard Not Valid</h3>
                      <p className="text-red-600 dark:text-red-300 mt-1">
                        {errorScorecard?.data?.message || "The scorecard ID you entered could not be verified. Please check the ID and try again."}
                      </p>
                    </div>
                  </div>
                ) : scorecardData?.success ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                        <Check size={32} className="text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-center font-bold text-xl text-green-700 dark:text-green-400 mb-3">Scorecard Verified!</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Scorecard ID</p>
                        <p className="font-medium">{scorecardData.submission._id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Student Name</p>
                        <p className="font-medium">{scorecardData.submission.userName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quiz</p>
                        <p className="font-medium">{scorecardData.submission.quizTitle}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                        <p className="font-medium font-mono">
                          {Math.round(scorecardData.submission.score)}%
                          {scorecardData.submission.isPassed 
                            ? <span className="text-green-600 ml-2 text-xs font-bold">PASSED</span> 
                            : <span className="text-amber-600 ml-2 text-xs font-bold">NOT PASSED</span>}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completion Date</p>
                        <p className="font-medium">
                          {new Date(scorecardData.submission.completedAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                        <p className="font-medium">
                          {Math.floor(scorecardData.submission.timeSpent / 60)} minutes
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm text-blue-700 dark:text-blue-300">
                        <BarChart3 size={14} className="mr-1" /> Official EduFlow Quiz Scorecard
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">How to Verify Documents</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Ask for the unique ID found on the certificate or scorecard</li>
          <li>Select the correct document type (certificate or scorecard)</li>
          <li>Enter the ID in the field above and click "Verify"</li>
          <li>The system will confirm if the document is authentic and display the details</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          All certificates and scorecards issued by EduFlow contain a unique identifier and are stored securely in our database.
        </p>
      </div>
    </div>
  );
};

export default VerifyCertificate; 