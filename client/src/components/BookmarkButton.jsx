import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { addBookmark, removeBookmark } from '@/features/bookmarks/bookmarksSlice';

const BookmarkButton = ({ courseId, courseTitle, courseThumbnail }) => {
  const dispatch = useDispatch();
  const bookmarks = useSelector(state => state.bookmarks.items);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  useEffect(() => {
    // Check if this course is already bookmarked
    const bookmarkExists = bookmarks.some(bookmark => bookmark.courseId === courseId);
    setIsBookmarked(bookmarkExists);
  }, [bookmarks, courseId]);
  
  const handleToggleBookmark = () => {
    if (isBookmarked) {
      dispatch(removeBookmark(courseId));
      toast.info("Bookmark removed", {
        description: `${courseTitle} has been removed from your bookmarks`,
        duration: 3000,
      });
    } else {
      dispatch(addBookmark({
        courseId,
        courseTitle,
        courseThumbnail,
        dateAdded: new Date().toISOString()
      }));
      toast.success("Bookmark added", {
        description: `${courseTitle} has been added to your bookmarks`,
        duration: 3000,
      });
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleBookmark}
      className="flex items-center gap-2"
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4 text-primary" />
          <span className="sr-only md:not-sr-only md:inline-block">Bookmarked</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:inline-block">Bookmark</span>
        </>
      )}
    </Button>
  );
};

export default BookmarkButton; 