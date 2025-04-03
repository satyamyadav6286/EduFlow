import React, { useState } from 'react';
import { useCreateInstructorMutation, useGetAllInstructorsQuery } from '@/features/api/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

const Instructors = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // API hooks
  const [createInstructor, { isLoading: isCreating }] = useCreateInstructorMutation();
  const { data: instructorsData, isLoading: isLoadingInstructors, refetch } = useGetAllInstructorsQuery();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await createInstructor(formData).unwrap();
      toast.success('Success!', {
        description: response.message || 'Instructor created successfully',
      });
      
      // Reset form and refetch instructors list
      setFormData({ name: '', email: '', password: '' });
      refetch();
    } catch (error) {
      toast.error('Error', {
        description: error.data?.message || 'Failed to create instructor',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Instructors</h1>
      
      {/* Create Instructor Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Add New Instructor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter instructor name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Instructor'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Instructors List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingInstructors ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : instructorsData?.instructors?.length > 0 ? (
            <div className="divide-y">
              {instructorsData.instructors.map((instructor) => (
                <div key={instructor._id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{instructor.name}</p>
                    <p className="text-sm text-gray-500">{instructor.email}</p>
                  </div>
                  <div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Instructor
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No instructors found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Instructors; 