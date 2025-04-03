import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearAllBookmarks } from '@/features/bookmarks/bookmarksSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import MediaDisplay from '@/components/MediaDisplay';
import { Bookmark, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Bookmarks = () => {
  const bookmarks = useSelector(state => state.bookmarks.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClearAllBookmarks = () => {
    dispatch(clearAllBookmarks());
    toast.success('All bookmarks cleared', {
      description: 'Your bookmarks have been cleared successfully',
      duration: 3000,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Bookmarked Courses</h1>
          <p className="text-muted-foreground">Courses you've saved for later</p>
        </div>
        
        {bookmarks.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all bookmarks?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove all your bookmarked courses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllBookmarks}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No bookmarked courses</h2>
          <p className="text-muted-foreground mb-6">
            You haven't bookmarked any courses yet. When you find a course you like, bookmark it to save it here.
          </p>
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.courseId} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-video">
                <MediaDisplay
                  type="image"
                  src={bookmark.courseThumbnail}
                  alt={bookmark.courseTitle}
                  fallbackImage="https://via.placeholder.com/600x400?text=Course+Image"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2 h-14">
                  {bookmark.courseTitle}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Bookmarked on {formatDate(bookmark.dateAdded)}</span>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => navigate(`/course-detail/${bookmark.courseId}`)}
                  className="w-full"
                >
                  View Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks; 