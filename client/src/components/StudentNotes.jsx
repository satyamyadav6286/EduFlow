import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Save, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const LOCAL_STORAGE_KEY = 'EduFlow_StudentNotes';

const StudentNotes = ({ courseId, lectureId }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        
        // Filter notes for current course and lecture
        const relevantNotes = parsedNotes.filter(
          note => note.courseId === courseId && note.lectureId === lectureId
        );
        
        setNotes(relevantNotes);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
      }
    }
  }, [courseId, lectureId]);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      // Get existing notes for other courses/lectures
      const savedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
      let allNotes = [];
      
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          // Filter out notes for current course/lecture since we'll replace them
          allNotes = parsedNotes.filter(
            note => note.courseId !== courseId || note.lectureId !== lectureId
          );
        } catch (error) {
          console.error('Error parsing saved notes:', error);
        }
      }
      
      // Combine with current notes and save
      const combinedNotes = [...allNotes, ...notes];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combinedNotes));
    }
  }, [notes, courseId, lectureId]);
  
  const handleSaveNote = () => {
    if (!currentNote.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    
    if (isEditing && editingIndex !== null) {
      // Update existing note
      const updatedNotes = [...notes];
      updatedNotes[editingIndex] = {
        ...updatedNotes[editingIndex],
        content: currentNote,
        updatedAt: new Date().toISOString()
      };
      
      setNotes(updatedNotes);
      toast.success("Note updated!");
    } else {
      // Add new note
      const newNote = {
        id: Date.now().toString(),
        courseId,
        lectureId,
        content: currentNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setNotes([...notes, newNote]);
      toast.success("Note saved!");
    }
    
    // Reset state
    setCurrentNote('');
    setIsEditing(false);
    setEditingIndex(null);
  };
  
  const handleEditNote = (index) => {
    setCurrentNote(notes[index].content);
    setEditingIndex(index);
    setIsEditing(true);
  };
  
  const handleDeleteNote = (index) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
    
    // If currently editing the note being deleted, reset
    if (editingIndex === index) {
      setCurrentNote('');
      setIsEditing(false);
      setEditingIndex(null);
    }
    
    toast.success("Note deleted");
  };
  
  const handleCancelEdit = () => {
    setCurrentNote('');
    setIsEditing(false);
    setEditingIndex(null);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>Lecture Notes</CardTitle>
        <CardDescription>Take notes while watching this lecture</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="write">
              {isEditing ? "Edit Note" : "Write Note"}
            </TabsTrigger>
            <TabsTrigger value="view">
              View Notes ({notes.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Write/Edit Note Tab */}
          <TabsContent value="write" className="space-y-4">
            <Textarea
              placeholder="Write your notes here..."
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="min-h-[150px]"
            />
            
            <div className="flex justify-end gap-2">
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
              
              <Button 
                onClick={handleSaveNote}
                className="flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    Update Note
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* View Notes Tab */}
          <TabsContent value="view">
            {notes.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {notes.map((note, index) => (
                  <Card key={note.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          {formatDate(note.updatedAt)}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditNote(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteNote(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No notes yet. Start writing!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-3 pb-2">
        <p className="text-xs text-gray-500">
          Notes are saved locally in your browser
        </p>
      </CardFooter>
    </Card>
  );
};

export default StudentNotes; 