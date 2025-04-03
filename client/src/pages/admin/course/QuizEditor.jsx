import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  useCreateQuizMutation, 
  useGetQuizByCourseQuery, 
  useUpdateQuizMutation 
} from "@/features/api/quizApi";
import { useGetCourseByIdQuery } from "@/features/api/courseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { AlertCircle, Plus, Save, Trash2, Check, FileQuestion } from "lucide-react";

const QuizEditor = () => {
  const { courseId } = useParams();
  
  // State
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: 30,
    isActive: true,
    questions: [
      {
        tempId: Date.now(),
        question: "",
        explanation: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ]
      }
    ]
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // API hooks
  const { data: courseData } = useGetCourseByIdQuery(courseId);
  const { data: existingQuizData, isLoading: isLoadingQuiz } = useGetQuizByCourseQuery(courseId);
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  
  // Load existing quiz data if available
  useEffect(() => {
    if (existingQuizData?.quiz) {
      setQuiz(existingQuizData.quiz);
      setIsEditing(true);
    } else if (courseData?.course) {
      // Initialize with course title if no quiz exists
      setQuiz(prevState => ({
        ...prevState,
        title: `Quiz for ${courseData.course.courseTitle}`
      }));
      setIsEditing(false);
    }
  }, [existingQuizData, courseData]);
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePassingScoreChange = (value) => {
    setQuiz(prev => ({
      ...prev,
      passingScore: value[0]
    }));
  };
  
  const handleTimeLimitChange = (value) => {
    setQuiz(prev => ({
      ...prev,
      timeLimit: value[0]
    }));
  };
  
  const handleActiveToggle = () => {
    setQuiz(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };
  
  // Question handlers
  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: value
    };
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const handleOptionChange = (questionIndex, optionIndex, e) => {
    const { value } = e.target;
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      text: value
    };
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quiz.questions];
    
    // Set all options to false, then set the selected one to true
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optionIndex
    }));
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          tempId: Date.now(),
          question: "",
          explanation: "",
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
          ]
        }
      ]
    }));
  };
  
  const removeQuestion = (index) => {
    if (quiz.questions.length <= 1) {
      toast.error("Error", {
        description: "Quiz must have at least one question"
      });
      return;
    }
    
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(index, 1);
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate quiz
    if (quiz.title.trim() === "") {
      toast.error("Error", {
        description: "Please enter a quiz title."
      });
      return;
    }
    
    // Check if all questions and options are filled
    const invalidQuestions = quiz.questions.some(q => 
      !q.question.trim() || 
      q.options.some(opt => !opt.text.trim()) ||
      !q.options.some(opt => opt.isCorrect)
    );
    
    if (invalidQuestions) {
      toast.error("Error", {
        description: "All questions must have text and all options must be filled in."
      });
      return;
    }
    
    try {
      let response;
      
      // Format quiz data for submission
      const quizData = {
        courseId,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        isActive: quiz.isActive,
        questions: quiz.questions.map(q => ({
          question: q.question,
          explanation: q.explanation,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          }))
        }))
      };
      
      if (isEditing && existingQuizData?.quiz?._id) {
        // Update existing quiz
        response = await updateQuiz({ 
          quizId: existingQuizData.quiz._id, 
          quizData 
        }).unwrap();
      } else {
        // Create new quiz
        response = await createQuiz(quizData).unwrap();
      }
      
      toast.success(isEditing ? "Quiz Updated" : "Quiz Created", {
        description: response.message
      });
    } catch (error) {
      toast.error("Error", {
        description: error.data?.message || "Failed to save quiz"
      });
    }
  };
  
  if (isLoadingQuiz) {
    return (
      <div className="flex justify-center items-center my-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              {isEditing ? "Edit Quiz" : "Create Quiz"} for {courseData?.course?.courseTitle}
            </CardTitle>
            <CardDescription>
              Configure the quiz settings and add questions.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter quiz title"
                  value={quiz.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Quiz Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={quiz.isActive}
                      onCheckedChange={handleActiveToggle}
                    />
                    <span className={quiz.isActive ? "text-green-600" : "text-gray-400"}>
                      {quiz.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  When inactive, students cannot take this quiz.
                </p>
              </div>
            </div>
            
            {/* Quiz Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Quiz Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Instructions for students taking this quiz..."
                value={quiz.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            {/* Quiz Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>
                  Passing Score: {quiz.passingScore}%
                </Label>
                <Slider
                  value={[quiz.passingScore]}
                  min={50}
                  max={100}
                  step={5}
                  onValueChange={handlePassingScoreChange}
                />
              </div>
              
              <div className="space-y-4">
                <Label>
                  Time Limit: {quiz.timeLimit} minutes
                </Label>
                <Slider
                  value={[quiz.timeLimit]}
                  min={5}
                  max={120}
                  step={5}
                  onValueChange={handleTimeLimitChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quiz Questions</h2>
            <Button type="button" onClick={addQuestion} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
          
          {quiz.questions.map((question, questionIndex) => (
            <Card key={question._id || question.tempId} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Question Text */}
                <div className="space-y-2">
                  <Label htmlFor={`question-${questionIndex}`}>Question</Label>
                  <Textarea
                    id={`question-${questionIndex}`}
                    name="question"
                    placeholder="Enter your question here..."
                    value={question.question}
                    onChange={(e) => handleQuestionChange(questionIndex, e)}
                    rows={2}
                  />
                </div>
                
                {/* Options */}
                <div className="space-y-3">
                  <Label>Answer Options</Label>
                  
                  {question.options.map((option, optionIndex) => (
                    <div key={option._id || optionIndex} className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                        className={`h-8 w-8 p-0 ${option.isCorrect ? 'text-green-500 bg-green-50' : 'text-gray-400'}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e)}
                        className={option.isCorrect ? 'border-green-300 focus-visible:ring-green-300' : ''}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Explanation */}
                <div className="space-y-2">
                  <Label htmlFor={`explanation-${questionIndex}`}>
                    Explanation (Optional)
                  </Label>
                  <Textarea
                    id={`explanation-${questionIndex}`}
                    name="explanation"
                    placeholder="Explain why the correct answer is right..."
                    value={question.explanation || ""}
                    onChange={(e) => handleQuestionChange(questionIndex, e)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isCreating || isUpdating ? 'Saving...' : (isEditing ? 'Update Quiz' : 'Create Quiz')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizEditor;