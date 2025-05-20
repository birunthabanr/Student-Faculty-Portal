import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  BookOpen,
  Clock,
  CheckCircle,
  BarChart,
  Book,
  Calendar,
  FileDown,
} from "lucide-react";
import API_CONFIG from "../lib/config";
import { generateCourseManagementReport } from "../lib/pdf-generator";

// Types for API response
interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  address: string | null;
  pho_num: string | null;
  email: string;
  birthdate: string | null;
  nic: string | null;
  created_date: string;
  role_id: string;
}

interface CourseProfile {
  id: string;
  course_id: string;
  student_id: string;
  avg_score: number;
  total_time_spent: number;
  courses_completed: number;
}

interface CourseDetails {
  id: string;
  name: string;
}

interface CourseProfileData {
  course_profile: CourseProfile;
  course_details: CourseDetails;
}

interface UserProfileResponse {
  student_info: StudentInfo;
  course_profiles: CourseProfileData[];
}

const StudentCourseManagement = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Function to generate mock data for development
  const generateMockData = (): UserProfileResponse => {
    return {
      student_info: {
        id: "mock-student-id",
        first_name: "John",
        last_name: "Doe",
        address: "123 Campus Street",
        pho_num: "123-456-7890",
        email: "john.doe@example.com",
        birthdate: "2000-01-15",
        nic: "ABC123456",
        created_date: new Date().toISOString(),
        role_id: "student"
      },
      course_profiles: [
        {
          course_profile: {
            id: "cp1",
            course_id: "course1",
            student_id: "mock-student-id",
            avg_score: 92.5,
            total_time_spent: 45,
            courses_completed: 5
          },
          course_details: {
            id: "course1",
            name: "Introduction to Computer Science"
          }
        },
        {
          course_profile: {
            id: "cp2",
            course_id: "course2",
            student_id: "mock-student-id",
            avg_score: 85.0,
            total_time_spent: 38,
            courses_completed: 4
          },
          course_details: {
            id: "course2",
            name: "Data Structures and Algorithms"
          }
        },
        {
          course_profile: {
            id: "cp3",
            course_id: "course3",
            student_id: "mock-student-id",
            avg_score: 78.5,
            total_time_spent: 32,
            courses_completed: 3
          },
          course_details: {
            id: "course3",
            name: "Database Systems"
          }
        },
        {
          course_profile: {
            id: "cp4",
            course_id: "course4",
            student_id: "mock-student-id",
            avg_score: 88.2,
            total_time_spent: 42,
            courses_completed: 4
          },
          course_details: {
            id: "course4",
            name: "Web Development"
          }
        }
      ]
    };
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the user_id from session or state
        const userIdFromLogin = localStorage.getItem("user_id") || "ddd3eb31-c06f-45ab-b464-632040419d82";

        const response = await axios.get(
          `${API_CONFIG.STUDENT_COURSES.PROFILE}/${userIdFromLogin}/course-profile`
        );
        
        setUserProfile(response.data);
        setUsingMockData(false);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        
        // Check if the error is "User profile not found"
        if (err.response && err.response.data && err.response.data.detail === "User profile not found") {
          console.log("Using mock data since user profile was not found");
          setUserProfile(generateMockData());
          setUsingMockData(true);
        } else {
          setError("Failed to load your profile information. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Helper function to get grade letter
  const getGradeLetter = (score: number): string => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  // Helper function to get color class based on score
  const getScoreColorClass = (score: number): string => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  // Sort courses by average score (highest first)
  const sortedCourses = userProfile?.course_profiles
    ? [...userProfile.course_profiles].sort(
        (a, b) => b.course_profile.avg_score - a.course_profile.avg_score
      )
    : [];

  // Calculate overall average score across all courses
  const overallAvgScore =
    sortedCourses.length > 0
      ? sortedCourses.reduce(
          (sum, course) => sum + course.course_profile.avg_score,
          0
        ) / sortedCourses.length
      : 0;

  // Calculate total courses completed
  const totalCoursesCompleted = sortedCourses.reduce(
    (sum, course) => sum + course.course_profile.courses_completed,
    0
  );

  // Calculate total time spent across all courses (in hours)
  const totalTimeSpent = sortedCourses.reduce(
    (sum, course) => sum + course.course_profile.total_time_spent,
    0
  );

  // Function to generate PDF report
  const handleGenerateReport = async () => {
    if (!userProfile) return;
    
    try {
      setIsGeneratingPdf(true);
      
      const studentName = `${userProfile.student_info.first_name} ${userProfile.student_info.last_name}`;
      const studentEmail = userProfile.student_info.email;
      
      await generateCourseManagementReport(
        studentName,
        studentEmail,
        overallAvgScore,
        totalCoursesCompleted,
        totalTimeSpent,
        sortedCourses
      );
      
    } catch (error) {
      console.error("Error generating PDF report:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 text-red-300 rounded-md p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Course Management</h1>
            <p className="text-gray-400">View and track your course performance</p>
            {usingMockData && (
              <div className="mt-2 px-3 py-1 bg-blue-900/30 border border-blue-500/50 text-blue-300 rounded-md text-sm">
                Using sample data for demonstration purposes
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-900/20 flex items-center gap-2"
            onClick={handleGenerateReport}
            disabled={isGeneratingPdf || !userProfile}
          >
            <FileDown className="h-4 w-4" />
            {isGeneratingPdf ? 'Generating...' : 'Generate PDF Report'}
          </Button>
        </div>
      </div>

      {userProfile && (
        <>
          {/* Student Profile Overview */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader className="border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white text-xl">
                    {userProfile.student_info.first_name} {userProfile.student_info.last_name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {userProfile.student_info.email}
                  </CardDescription>
                </div>
                <Badge className="bg-blue-600">Student</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <BarChart className="h-8 w-8 text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{overallAvgScore.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{totalCoursesCompleted}</div>
                  <div className="text-sm text-gray-400">Courses Completed</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <Clock className="h-8 w-8 text-yellow-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{totalTimeSpent}</div>
                  <div className="text-sm text-gray-400">Hours Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex-1"
          >
            <TabsList className="bg-gray-800 border-b border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Course Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Performance
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Completed Courses
              </TabsTrigger>
            </TabsList>

            {/* Course Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourses.map((course) => (
                  <Card 
                    key={course.course_profile.id} 
                    className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white">
                          {course.course_details.name}
                        </CardTitle>
                        <Badge 
                          className={`${
                            course.course_profile.avg_score >= 80 ? "bg-green-800 text-green-200" : 
                            course.course_profile.avg_score >= 70 ? "bg-blue-800 text-blue-200" :
                            "bg-yellow-800 text-yellow-200"
                          }`}
                        >
                          {getGradeLetter(course.course_profile.avg_score)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Average Score</span>
                          <span className={`font-medium ${getScoreColorClass(course.course_profile.avg_score)}`}>
                            {course.course_profile.avg_score.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Hours Spent</span>
                          <span className="text-white">{course.course_profile.total_time_spent}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Completed</span>
                          <span className="text-white">{course.course_profile.courses_completed}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-700 pt-4">
                      <Button 
                        variant="outline"
                        className="w-full bg-gray-900 text-gray-300 border-gray-500 hover:bg-gray-500 hover:text-white"
                      >
                        View Course Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Course Performance Analysis</CardTitle>
                  <CardDescription className="text-gray-400">
                    Compare your performance across all enrolled courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Performance bars */}
                    {sortedCourses.map((course) => (
                      <div key={course.course_profile.id} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">{course.course_details.name}</span>
                          <span className={getScoreColorClass(course.course_profile.avg_score)}>
                            {course.course_profile.avg_score.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              course.course_profile.avg_score >= 90 ? "bg-green-500" :
                              course.course_profile.avg_score >= 80 ? "bg-blue-500" :
                              course.course_profile.avg_score >= 70 ? "bg-yellow-500" :
                              course.course_profile.avg_score >= 60 ? "bg-orange-500" : "bg-red-500"
                            }`}
                            style={{ width: `${course.course_profile.avg_score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Study Time Distribution</CardTitle>
                  <CardDescription className="text-gray-400">
                    Hours spent on each course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Study time bars */}
                    {sortedCourses
                      .sort((a, b) => b.course_profile.total_time_spent - a.course_profile.total_time_spent)
                      .map((course) => (
                        <div key={course.course_profile.id} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{course.course_details.name}</span>
                            <span className="text-blue-400">
                              {course.course_profile.total_time_spent} hrs
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${(course.course_profile.total_time_spent / Math.max(...sortedCourses.map(c => c.course_profile.total_time_spent))) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Completed Courses Tab */}
            <TabsContent value="completed" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Completed Course Components</CardTitle>
                  <CardDescription className="text-gray-400">
                    Track your progress through each course's components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sortedCourses.map((course) => (
                      <div key={course.course_profile.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-white">{course.course_details.name}</h3>
                            <p className="text-sm text-gray-400">Components completed: {course.course_profile.courses_completed}</p>
                          </div>
                          <Badge 
                            className={course.course_profile.courses_completed >= 4 ? "bg-green-900 text-green-200" : "bg-blue-900 text-blue-200"}
                          >
                            {course.course_profile.courses_completed >= 4 ? "Advanced" : "In Progress"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-2 rounded-full ${
                                i < course.course_profile.courses_completed ? "bg-green-500" : "bg-gray-700"
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default StudentCourseManagement; 