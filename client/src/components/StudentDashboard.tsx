import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { DashboardLayout } from './DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { CourseRecommendations } from "./CourseRecommendations";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BookOpen, Calendar, GraduationCap, Library, Settings, User } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar-trigger";
import NotificationsSystem from './NotificationSystem';
import AttendancePage from '../pages/attendance';

interface Course {
  id: number;
  title: string;
  progress: number;
  nextLesson: string;
}

const performanceData = [
  { name: "Week 1", score: 85 },
  { name: "Week 2", score: 78 },
  { name: "Week 3", score: 90 },
  { name: "Week 4", score: 88 },
  { name: "Week 5", score: 92 },
];

const subjectData = [
  { name: "Mathematics", completed: 78 },
  { name: "Science", completed: 65 },
  { name: "History", completed: 90 },
  { name: "English", completed: 85 },
];

const currentCourses: Course[] = [
  {
    id: 1,
    title: "Advanced Mathematics",
    progress: 65,
    nextLesson: "Calculus Fundamentals",
  },
  {
    id: 2,
    title: "Physics 101",
    progress: 78,
    nextLesson: "Newtonian Mechanics",
  },
  {
    id: 3,
    title: "Data Science Fundamentals",
    progress: 42,
    nextLesson: "Regression Analysis",
  },
];

// Placeholder components for different sections
const Courses = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">My Courses</h2>
    <p>Course management and enrollment will be implemented here.</p>
  </div>
);

const Schedule = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Class Schedule</h2>
    <p>Class schedule and timetable will be implemented here.</p>
  </div>
);

const Assignments = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Assignments</h2>
    <p>Assignment tracking and submission will be implemented here.</p>
  </div>
);

const Grades = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Grades</h2>
    <p>Grade tracking and academic performance will be implemented here.</p>
  </div>
);

const Profile = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Profile</h2>
    <p>Student profile and settings will be implemented here.</p>
  </div>
);

const StudentDashboard: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("courses");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8100/user', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        if (userData.role !== 'Student') {
          if (userData.role === 'Faculty') {
            window.location.href = '/faculty-dashboard';
          }
          window.location.href = '/';
        }
        setUserInfo(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/';
      }
    };

    fetchUser();
  }, []);

  if (!userInfo) {
    return <div className="p-6">Loading...</div>;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "courses":
        return <Courses />;
      case "schedule":
        return <Schedule />;
      case "assignments":
        return <Assignments />;
      case "grades":
        return <Grades />;
      case "profile":
        return <Profile />;
      case "notifications":
        return <NotificationsSystem/>
      case "attendance":
        return <AttendancePage/>
      default:
        return <Courses />;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <aside className="w-64 border-r border-border bg-background">
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveSection("courses")}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
              activeSection === "courses"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Courses</span>
          </button>
          <button
            onClick={() => setActiveSection("schedule")}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
              activeSection === "schedule"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Schedule</span>
          </button>
          <button
            onClick={() => setActiveSection("assignments")}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
              activeSection === "assignments"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <Library className="h-5 w-5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => setActiveSection("grades")}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
              activeSection === "grades"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <GraduationCap className="h-5 w-5" />
            <span>Grades</span>
          </button>
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
              activeSection === "profile"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveSection("attendance")}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
              activeSection === "attendance"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setActiveSection("notifications")}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
              activeSection === "notifications"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Notifications</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="flex h-16 items-center gap-4 border-b border-border bg-background px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              {userInfo.name?.charAt(0) || 'S'}
            </div>
          </div>
        </div>
        <div className="container py-6">{renderActiveSection()}</div>
      </main>
    </div>
  );
};

export default StudentDashboard; 