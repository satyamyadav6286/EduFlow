import React, { useState } from 'react';
import { useVerifyCertificateQuery } from '@/features/api/certificateApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Check, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [skip, setSkip] = useState(true);
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const { data, isLoading, isError, error } = useVerifyCertificateQuery(
    certificateId, 
    { skip }
  );
  
  const onSubmit = (formData) => {
    setCertificateId(formData.certificateId);
    setSkip(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Certificate Verification</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter the certificate ID to verify its authenticity. Each certificate issued by EduFlow has a unique identifier that can be used to confirm it's legitimate.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                {...register("certificateId", { 
                  required: "Certificate ID is required",
                  pattern: {
                    value: /^[A-F0-9]{16}$/,
                    message: "Please enter a valid certificate ID (16 characters, uppercase letters and numbers only)"
                  }
                })}
                placeholder="Enter Certificate ID (e.g., A1B2C3D4E5F6G7H8)"
                className="w-full"
              />
              {errors.certificateId && (
                <p className="text-red-500 text-sm mt-1">{errors.certificateId.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              <Search size={16} className="mr-2" />
              {isLoading ? 'Verifying...' : 'Verify Certificate'}
            </Button>
          </div>
        </form>

        {!skip && (
          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <div className="rounded-full bg-red-100 dark:bg-red-900 p-2">
                  <X size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-400">Certificate Not Valid</h3>
                  <p className="text-red-600 dark:text-red-300 mt-1">
                    {error?.data?.message || "The certificate ID you entered could not be verified. Please check the ID and try again."}
                  </p>
                </div>
              </div>
            ) : data?.success ? (
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
                    <p className="font-medium">{data.certificate.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Student Name</p>
                    <p className="font-medium">{data.certificate.student}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                    <p className="font-medium">{data.certificate.course}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completion Date</p>
                    <p className="font-medium">
                      {new Date(data.certificate.completionDate).toLocaleDateString('en-US', {
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
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">How to Verify a Certificate</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Ask the certificate holder for their unique Certificate ID</li>
          <li>Enter the ID in the field above and click "Verify Certificate"</li>
          <li>The system will confirm if the certificate is authentic and display the details</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          All certificates issued by EduFlow contain a unique identifier and are stored securely in our database.
        </p>
      </div>
    </div>
  );
};

export default VerifyCertificate; 