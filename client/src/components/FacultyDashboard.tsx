"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Calendar,
  Users,
  GraduationCap,
  LogOut,
  X,
  Menu,
  BookOpen,
  Database,
  Shield,
  Library,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react"
import Scheduler from "./Scheduler"
import ResourceManagement from "./ResourceManagement"
import CourseManagement from "./CourseManagement"
import ChatBot from "./ChatBot"
import API_CONFIG from "../lib/config"

// Simple Select Component
const Select = ({
  value,
  onValueChange,
  className = "",
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${className}`}
  >
    {children}
  </select>
)

// Simple Option Component
const SelectItem = ({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) => <option value={value}>{children}</option>

interface AttendanceRecord {
  attendance_id: number
  reg_number: string
  timestamp: string
  method: string
  status: string
  location: string
  course_code?: string
}

// Manual Attendance Component
const ManualAttendance = () => {
  const [regNumber, setRegNumber] = useState("")
  const [status, setStatus] = useState("present")
  const [courseCode, setCourseCode] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    // Fetch recent attendance records
    // This is a mock implementation - would be replaced with actual API call
    const mockRecords: AttendanceRecord[] = [
      {
        attendance_id: 1,
        reg_number: "S12345",
        timestamp: new Date().toISOString(),
        method: "manual",
        status: "present",
        location: "Lecture Hall A",
        course_code: "CS101",
      },
      {
        attendance_id: 2,
        reg_number: "S12346",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        method: "manual",
        status: "absent",
        location: "Lecture Hall B",
        course_code: "CS102",
      },
      {
        attendance_id: 3,
        reg_number: "S12347",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        method: "manual",
        status: "late",
        location: "Lab 3",
        course_code: "CS103",
      },
    ]

    setRecentRecords(mockRecords)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (!regNumber || !courseCode || !location) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_CONFIG.ATTENDANCE.MANUAL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reg_number: regNumber,
          status,
          course_code: courseCode,
          location,
        }),
        credentials: "include",
      });

      // Handle the case where the fetch itself completes but we don't get a response yet
      if (!response) {
        throw new Error("No response received");
      }
      
      const data = await response.json();

      if (response.ok) {
        // Success handling
        setMessage({ type: "success", text: data.message || "Attendance recorded successfully" });
        setPopupMessage({ type: "success", text: data.message || "Attendance recorded successfully" });
        setShowPopup(true);
        
        // Only update records if we got valid data back
        if (data.data) {
          setRecentRecords(prev => [data.data, ...prev]);
        }
        
        // Reset form fields
        setRegNumber("");
        setStatus("present");
        setCourseCode("");
        setLocation("");
      } else {
        // Error handling
        setMessage({ type: "error", text: data.message || "Failed to record attendance" });
        setPopupMessage({ type: "error", text: data.message || "Failed to record attendance" });
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
      setPopupMessage({ type: "error", text: "Network error. Please try again." });
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "late":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Popup/Modal for success/error messages */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-900 rounded-lg shadow-xl p-6 max-w-md border ${
            popupMessage?.type === "success" ? "border-green-500" : "border-red-500"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${
                popupMessage?.type === "success" ? "text-green-400" : "text-red-400"
              }`}>
                {popupMessage?.type === "success" ? "Success" : "Error"}
              </h3>
              <button 
                onClick={() => setShowPopup(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-white mb-5">{popupMessage?.text}</p>
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowPopup(false)} 
                className={`${
                  popupMessage?.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-gray-800 text-white border border-gray-700 overflow-hidden">
        <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
          <CardTitle className="text-white">Manual Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
            return false;
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="reg_number">
                Registration Number *
              </label>
              <Input
                id="reg_number"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. S12345"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="status">
                Status *
              </label>
              <Select value={status} onValueChange={setStatus} className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="course_code">
                Course Code *
              </label>
              <Input
                id="course_code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS101"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="location">
                Location *
              </label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lecture Hall A"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md ${
                  message.type === "success"
                    ? "bg-green-900/50 text-green-200 border border-green-700"
                    : "bg-red-900/50 text-red-200 border border-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button 
              type="button"
              onClick={handleSubmit} 
              disabled={isLoading} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Submitting..." : "Record Attendance"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 text-white border border-gray-700 overflow-hidden">
        <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
          <CardTitle className="text-white">Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-white">Reg #</th>
                  <th className="text-left py-3 px-4 font-medium text-white">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-white">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-white">Time</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {recentRecords.length > 0 ? (
                  recentRecords.map((record) => (
                    <tr key={record.attendance_id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4 text-white">{record.reg_number}</td>
                      <td className="py-3 px-4 text-white">{record.course_code}</td>
                      <td className="py-3 px-4 flex items-center text-white">
                        {getStatusIcon(record.status)}
                        <span className="ml-2 capitalize">{record.status}</span>
                      </td>
                      <td className="py-3 px-4 text-white">{record.location}</td>
                      <td className="py-3 px-4 text-gray-400">{formatDate(record.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No recent attendance records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder components for different sections
const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [reportType, setReportType] = useState("attendance");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Mock student data
  const students = [
    { id: "1", reg_number: "S12345", name: "John Doe", course: "CS101", email: "john.doe@example.com", attendance_rate: "85%" },
    { id: "2", reg_number: "S12346", name: "Jane Smith", course: "CS101", email: "jane.smith@example.com", attendance_rate: "92%" },
    { id: "3", reg_number: "S12347", name: "Alex Johnson", course: "CS102", email: "alex.j@example.com", attendance_rate: "78%" },
    { id: "4", reg_number: "S12348", name: "Maria Garcia", course: "CS102", email: "maria.g@example.com", attendance_rate: "95%" },
    { id: "5", reg_number: "S12349", name: "Raj Patel", course: "CS201", email: "raj.p@example.com", attendance_rate: "88%" },
    { id: "6", reg_number: "S12350", name: "Sarah Lee", course: "CS201", email: "sarah.l@example.com", attendance_rate: "90%" },
    { id: "7", reg_number: "S12351", name: "David Kim", course: "CS301", email: "david.k@example.com", attendance_rate: "82%" },
    { id: "8", reg_number: "S12352", name: "Michelle Wong", course: "CS301", email: "michelle.w@example.com", attendance_rate: "94%" },
  ];

  // Filter CS101 students for the mock report
  const cs101Students = students.filter(student => student.course === "CS101");

  // Mock course data
  const courses = [
    { id: "CS101", name: "Introduction to Computer Science" },
    { id: "CS102", name: "Programming Fundamentals" },
    { id: "CS201", name: "Data Structures and Algorithms" },
    { id: "CS301", name: "Database Systems" },
  ];
  
  // Mock attendance data for CS101 students
  const cs101AttendanceData = [
    { date: "2023-10-01", present: ["S12345", "S12346"], absent: [] },
    { date: "2023-10-03", present: ["S12345"], absent: ["S12346"] },
    { date: "2023-10-05", present: ["S12345", "S12346"], absent: [] },
    { date: "2023-10-08", present: ["S12346"], absent: ["S12345"] },
    { date: "2023-10-10", present: ["S12345", "S12346"], absent: [] },
  ];

  const handleDownloadCS101Report = () => {
    // Create mock HTML content for the PDF
    const htmlContent = `
      <html>
        <head>
          <title>CS101 Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333366; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
            th { background-color: #f2f2f2; }
            .present { color: green; }
            .absent { color: red; }
            .header { margin-bottom: 20px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CS101 - Introduction to Computer Science</h1>
            <h2>Attendance Report</h2>
            <p><strong>Period:</strong> October 1 - October 15, 2023</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
  </div>
          
          <h3>Student Attendance Summary</h3>
          <table>
            <tr>
              <th>Registration Number</th>
              <th>Student Name</th>
              <th>Total Classes</th>
              <th>Classes Attended</th>
              <th>Attendance Rate</th>
            </tr>
            <tr>
              <td>S12345</td>
              <td>John Doe</td>
              <td>5</td>
              <td>4</td>
              <td>80%</td>
            </tr>
            <tr>
              <td>S12346</td>
              <td>Jane Smith</td>
              <td>5</td>
              <td>4</td>
              <td>80%</td>
            </tr>
          </table>
          
          <h3>Attendance Details by Date</h3>
          <table>
            <tr>
              <th>Date</th>
              <th>S12345 (John Doe)</th>
              <th>S12346 (Jane Smith)</th>
            </tr>
            <tr>
              <td>Oct 1, 2023</td>
              <td class="present">Present</td>
              <td class="present">Present</td>
            </tr>
            <tr>
              <td>Oct 3, 2023</td>
              <td class="present">Present</td>
              <td class="absent">Absent</td>
            </tr>
            <tr>
              <td>Oct 5, 2023</td>
              <td class="present">Present</td>
              <td class="present">Present</td>
            </tr>
            <tr>
              <td>Oct 8, 2023</td>
              <td class="absent">Absent</td>
              <td class="present">Present</td>
            </tr>
            <tr>
              <td>Oct 10, 2023</td>
              <td class="present">Present</td>
              <td class="present">Present</td>
            </tr>
          </table>
          
          <div class="footer">
            <p>This is an automatically generated report. For any discrepancies, please contact the faculty office.</p>
  </div>
        </body>
      </html>
    `;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CS101_Attendance_Report.html';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleViewCS101Report = () => {
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  const filteredStudents = students.filter(student => {
    // Filter by search term
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.reg_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by course
    const matchesCourse = courseFilter === "all" || student.course === courseFilter;
    
    return matchesSearch && matchesCourse;
  });
  
  const handleCheckboxChange = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };
  
  const generateReport = () => {
    setIsGeneratingReport(true);
    // Mock API call
    setTimeout(() => {
      setIsGeneratingReport(false);
      // Would normally redirect to or display the report
      alert("Report generated successfully");
    }, 1500);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Report Preview Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">CS101 - Attendance Report</h3>
              <Button 
                onClick={closeReportModal} 
                variant="ghost" 
                className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <X size={20} />
              </Button>
  </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-900 text-gray-100">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">CS101 - Introduction to Computer Science</h1>
                <h2 className="text-xl font-semibold text-gray-200 mt-1">Attendance Report</h2>
                <p className="text-gray-300 mt-2"><strong>Period:</strong> October 1 - October 15, 2023</p>
                <p className="text-gray-300"><strong>Generated on:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-white">Student Attendance Summary</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 border border-gray-700">
                    <thead>
                      <tr className="bg-gray-700 text-gray-100">
                        <th className="py-2 px-4 border border-gray-600 text-left">Registration Number</th>
                        <th className="py-2 px-4 border border-gray-600 text-left">Student Name</th>
                        <th className="py-2 px-4 border border-gray-600 text-left">Total Classes</th>
                        <th className="py-2 px-4 border border-gray-600 text-left">Classes Attended</th>
                        <th className="py-2 px-4 border border-gray-600 text-left">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-4 border border-gray-700">S12345</td>
                        <td className="py-2 px-4 border border-gray-700">John Doe</td>
                        <td className="py-2 px-4 border border-gray-700">5</td>
                        <td className="py-2 px-4 border border-gray-700">4</td>
                        <td className="py-2 px-4 border border-gray-700">80%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border border-gray-700">S12346</td>
                        <td className="py-2 px-4 border border-gray-700">Jane Smith</td>
                        <td className="py-2 px-4 border border-gray-700">5</td>
                        <td className="py-2 px-4 border border-gray-700">4</td>
                        <td className="py-2 px-4 border border-gray-700">80%</td>
                      </tr>
                    </tbody>
                  </table>
  </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-white">Attendance Details by Date</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 border border-gray-700">
                    <thead>
                      <tr className="bg-gray-700 text-gray-100">
                        <th className="py-2 px-4 border border-gray-600 text-left">Date</th>
                        <th className="py-2 px-4 border border-gray-600 text-left">S12345 (John Doe)</th>
                        <th className="py-2 px-4 border border-gray-600 text-left">S12346 (Jane Smith)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-4 border border-gray-700">Oct 1, 2023</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border border-gray-700">Oct 3, 2023</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                        <td className="py-2 px-4 border border-gray-700 text-red-400 font-medium">Absent</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border border-gray-700">Oct 5, 2023</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border border-gray-700">Oct 8, 2023</td>
                        <td className="py-2 px-4 border border-gray-700 text-red-400 font-medium">Absent</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border border-gray-700">Oct 10, 2023</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                        <td className="py-2 px-4 border border-gray-700 text-green-400 font-medium">Present</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 mt-8">
                <p>This is an automatically generated report. For any discrepancies, please contact the faculty office.</p>
              </div>
            </div>
            <div className="bg-gray-800 px-6 py-3 flex justify-end border-t border-gray-700">
              <Button onClick={handleDownloadCS101Report} className="bg-blue-600 hover:bg-blue-700 mr-2">
                Download Report
              </Button>
              <Button onClick={closeReportModal} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Student Management</h1>
        <p className="text-gray-400">Manage your students and track their progress</p>
      </div>
      <Tabs defaultValue="attendance" className="flex-1">
        <TabsList className="bg-gray-800 border-b border-gray-700">
          <TabsTrigger value="attendance" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Student List
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-6 flex-1">
          <ManualAttendance />
        </TabsContent>
        
        {/* Student List Tab */}
        <TabsContent value="students" className="mt-6">
          <Card className="bg-gray-800 text-white border border-gray-700 overflow-hidden">
            <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
              <CardTitle className="text-white">Student List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Search Students
                  </label>
                  <Input
                    type="text"
                    placeholder="Search by name or reg number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Filter by Course
                  </label>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-gray-800 border-gray-700 text-white"
                  >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.id} - {course.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-white">#</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Reg Number</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Course</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Attendance</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4 text-white">{index + 1}</td>
                          <td className="py-3 px-4 text-white">{student.reg_number}</td>
                          <td className="py-3 px-4 text-white">{student.name}</td>
                          <td className="py-3 px-4 text-white">{student.course}</td>
                          <td className="py-3 px-4 text-white">{student.email}</td>
                          <td className="py-3 px-4 text-white">{student.attendance_rate}</td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-gray-500">
                          No students match the filter criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
                <div className="flex gap-2">
                  <Button className="bg-gray-800 hover:bg-gray-700" size="sm">
                    Previous
                  </Button>
                  <Button className="bg-gray-800 hover:bg-gray-700" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 text-white border border-gray-700 overflow-hidden">
              <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
                <CardTitle className="text-white">Generate Report</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); generateReport(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Report Type
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-gray-800 border-gray-700 text-white"
                    >
                      <option value="attendance">Attendance Report</option>
                      <option value="performance">Performance Report</option>
                      <option value="summary">Course Summary</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Select Course*
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-gray-800 border-gray-700 text-white"
                      required
                    >
                      <option value="">-- Select a Course --</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.id} - {course.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Report Format
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600 bg-gray-800 border-gray-700"
                          name="format"
                          value="pdf"
                          defaultChecked
                        />
                        <span className="ml-2 text-gray-300">PDF</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600 bg-gray-800 border-gray-700"
                          name="format"
                          value="excel"
                        />
                        <span className="ml-2 text-gray-300">Excel</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600 bg-gray-800 border-gray-700"
                          name="format"
                          value="csv"
                        />
                        <span className="ml-2 text-gray-300">CSV</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isGeneratingReport || !selectedCourse}
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                  >
                    {isGeneratingReport ? "Generating..." : "Generate Report"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 text-white border border-gray-700 overflow-hidden">
              <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
                <CardTitle className="text-white">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  <div className="border-b border-gray-700 p-4 hover:bg-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-white">CS101 Attendance Report</h3>
                      <span className="text-sm text-gray-400">Today</span>
                    </div>
                    <p className="text-sm text-gray-300">Attendance report for Introduction to Computer Science</p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/30 h-8 text-xs"
                        onClick={handleDownloadCS101Report}
                      >
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gray-800 hover:bg-gray-700 h-8 text-xs"
                        onClick={handleViewCS101Report}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-700 p-4 hover:bg-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-white">CS102 Performance Summary</h3>
                      <span className="text-sm text-gray-400">Yesterday</span>
                    </div>
                    <p className="text-sm text-gray-300">Performance statistics for Programming Fundamentals</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-900/30 h-8 text-xs">
                        Download
                      </Button>
                      <Button size="sm" className="bg-gray-800 hover:bg-gray-700 h-8 text-xs">
                        View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-700 p-4 hover:bg-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-white">CS201 Course Summary</h3>
                      <span className="text-sm text-gray-400">Last Week</span>
                    </div>
                    <p className="text-sm text-gray-300">Overall summary for Data Structures and Algorithms</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-900/30 h-8 text-xs">
                        Download
                      </Button>
                      <Button size="sm" className="bg-gray-800 hover:bg-gray-700 h-8 text-xs">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const Grades = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all available courses
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await fetch("http://localhost:8020/courses");
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const coursesData = await response.json();
        setCourses(coursesData || []);
        
        // Set the first course as selected by default if there are courses
        if (coursesData && coursesData.length > 0 && !selectedCourse) {
          setSelectedCourse(coursesData[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.message || "An error occurred while fetching courses");
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch student data for the selected course
  useEffect(() => {
    const fetchStudentsData = async () => {
      if (!selectedCourse) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8020/courses/${selectedCourse}/data`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        
        const data = await response.json();
        setStudentsData(data.students_data || []);
      } catch (err: any) {
        console.error("Error fetching student data:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourse) {
      fetchStudentsData();
    }
  }, [selectedCourse]);

  // Filter students based on search term
  const filteredStudents = studentsData.filter(student => 
    (student.student_info.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (student.student_info.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (student.student_info.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Calculate stats for the current course
  const calculateStats = () => {
    if (filteredStudents.length === 0) return { average: 0, highest: 0, lowest: 0, distribution: [0, 0, 0, 0, 0] };
    
    let sum = 0;
    let highest = 0;
    let lowest = 100;
    const distribution = [0, 0, 0, 0, 0]; // F, D, C, B, A
    
    filteredStudents.forEach(student => {
      const score = student.data.avg_score;
      sum += score;
      
      if (score > highest) highest = score;
      if (score < lowest) lowest = score;
      
      // Update distribution
      if (score >= 75) distribution[4]++; // A
      else if (score >= 65) distribution[3]++; // B
      else if (score >= 55) distribution[2]++; // C
      else if (score >= 45) distribution[1]++; // D
      else distribution[0]++; // F
    });
    
    return {
      average: sum / filteredStudents.length,
      highest,
      lowest,
      distribution
    };
  };
  
  const stats = calculateStats();

  // Function to get grade letter
  const getGradeLetter = (score: number | null) => {
    if (score === null) return "N/A";
    if (score >= 75) return "A";
    if (score >= 65) return "B";
    if (score >= 55) return "C";
    if (score >= 45) return "D";
    return "F";
  };
  
  // Function to get grade color
  const getGradeColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 75) return "text-green-400";
    if (score >= 65) return "text-blue-400";
    if (score >= 55) return "text-yellow-400";
    if (score >= 45) return "text-orange-400";
    return "text-red-400";
  };

  // Get the name of the selected course
  const getSelectedCourseName = (): string => {
    if (!selectedCourse) return "Select a course";
    const course = courses.find(c => c.id === selectedCourse);
    return course ? course.name : "Unknown course";
  };

  if (coursesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-white">Loading courses...</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 rounded-md p-4">
        No courses available. Please add courses first.
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Grade Management</h1>
        <p className="text-gray-400">View and manage grades for your courses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Course selector */}
        <Card className="bg-gray-800 text-white border border-gray-700 md:col-span-1">
          <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
            <CardTitle className="text-white">Select Course</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-64">
              {courses.map((course) => (
                <button
                  key={course.id}
                  className={`w-full p-4 text-left border-b border-gray-700 hover:bg-gray-700 flex flex-col ${
                    selectedCourse === course.id ? "bg-gray-700 border-l-2 border-blue-500" : ""
                  }`}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <span className="font-medium text-white truncate">{course.name}</span>
                  <span className="text-xs text-gray-400 truncate">{course.id.substring(0, 8)}...</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Course summary */}
        <Card className="bg-gray-800 text-white border border-gray-700 md:col-span-3">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">{getSelectedCourseName()}</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                <span>Loading data...</span>
              </div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.average.toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">Class Average</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-green-400">{stats.highest.toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">Highest Grade</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.lowest.toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">Lowest Grade</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 rounded-md p-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade distribution chart */}
          <Card className="bg-gray-800 text-white border border-gray-700">
            <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
              <CardTitle className="text-white">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Bar chart using divs */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-8 text-center">A</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-7 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full" 
                      style={{ 
                        width: filteredStudents.length > 0 ? 
                          `${(stats.distribution[4] / filteredStudents.length) * 100}%` : "0%" 
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{stats.distribution[4]}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-center">B</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-7 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full" 
                      style={{ 
                        width: filteredStudents.length > 0 ? 
                          `${(stats.distribution[3] / filteredStudents.length) * 100}%` : "0%" 
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{stats.distribution[3]}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-center">C</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-7 overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full rounded-full" 
                      style={{ 
                        width: filteredStudents.length > 0 ? 
                          `${(stats.distribution[2] / filteredStudents.length) * 100}%` : "0%" 
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{stats.distribution[2]}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-center">D</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-7 overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full rounded-full" 
                      style={{ 
                        width: filteredStudents.length > 0 ? 
                          `${(stats.distribution[1] / filteredStudents.length) * 100}%` : "0%" 
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{stats.distribution[1]}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-center">F</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-7 overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full" 
                      style={{ 
                        width: filteredStudents.length > 0 ? 
                          `${(stats.distribution[0] / filteredStudents.length) * 100}%` : "0%" 
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{stats.distribution[0]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Time spent vs. Score scatter plot */}
          <Card className="bg-gray-800 text-white border border-gray-700">
            <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
              <CardTitle className="text-white">Time Spent vs. Score Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 relative border border-gray-700 rounded-md">
                {/* Y-axis (Score) */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between items-center py-2">
                  <span className="text-xs text-gray-400">100%</span>
                  <span className="text-xs text-gray-400">75%</span>
                  <span className="text-xs text-gray-400">50%</span>
                  <span className="text-xs text-gray-400">25%</span>
                  <span className="text-xs text-gray-400">0%</span>
                </div>
                
                {/* Chart area */}
                <div className="absolute left-10 right-0 top-0 bottom-10 pl-2 pb-2">
                  {/* Grid lines */}
                  <div className="absolute left-0 right-0 top-25% border-t border-dashed border-gray-700"></div>
                  <div className="absolute left-0 right-0 top-50% border-t border-dashed border-gray-700"></div>
                  <div className="absolute left-0 right-0 top-75% border-t border-dashed border-gray-700"></div>
                  
                  {/* Data points */}
                  {filteredStudents.map((student, index) => {
                    const maxTimeSpent = Math.max(...filteredStudents.map(s => s.data.total_time_spent), 1);
                    const xPos = (student.data.total_time_spent / maxTimeSpent) * 100;
                    const yPos = 100 - (student.data.avg_score); // Invert for y-axis
                    
                    return (
                      <div 
                        key={index}
                        className={`absolute h-3 w-3 rounded-full ${getPointColor(student.data.avg_score)}`}
                        style={{ 
                          left: `${xPos}%`, 
                          bottom: `${student.data.avg_score}%`,
                          transform: `translate(-50%, 50%)` 
                        }}
                        title={`${student.student_info.first_name} ${student.student_info.last_name || ''}: ${student.data.avg_score.toFixed(2)}%, ${student.data.total_time_spent} hours`}
                      ></div>
                    );
                  })}
                </div>
                
                {/* X-axis (Time) */}
                <div className="absolute left-10 right-0 bottom-0 h-10 flex justify-between items-center px-2">
                  <span className="text-xs text-gray-400">0h</span>
                  <span className="text-xs text-gray-400">Time Spent</span>
                  <span className="text-xs text-gray-400">
                    {Math.max(...filteredStudents.map(s => s.data.total_time_spent), 1)}h
                  </span>
                </div>
              </div>
              <div className="flex justify-center items-center mt-4 text-sm text-gray-400">
                <div className="flex items-center mr-4">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span>A (90-100%)</span>
                </div>
                <div className="flex items-center mr-4">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>B (80-89%)</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>C or below</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Student grades list */}
          <Card className="bg-gray-800 text-white border border-gray-700 lg:col-span-2">
            <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700 flex flex-row justify-between items-center">
              <CardTitle className="text-white">Student Grades</CardTitle>
              <div className="relative w-48">
                <Input 
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white pl-8"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-white">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-white">Email</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Hours</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Completed</th>
                      <th className="text-right py-3 px-4 font-medium text-white">Score</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Grade</th>
                      <th className="text-right py-3 px-4 font-medium text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.enrollment_id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4 text-white">{student.student_info.id.substring(0, 8)}...</td>
                          <td className="py-3 px-4 text-white">
                            {student.student_info.first_name} {student.student_info.last_name || ''}
                          </td>
                          <td className="py-3 px-4 text-white">{student.student_info.email || 'N/A'}</td>
                          <td className="py-3 px-4 text-center text-white">{student.data.total_time_spent}</td>
                          <td className="py-3 px-4 text-center text-white">{student.data.courses_completed}</td>
                          <td className="py-3 px-4 text-right">
                            {student.data.avg_score.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className={getGradeColor(student.data.avg_score)}>
                              {getGradeLetter(student.data.avg_score)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              className="h-8 bg-blue-600 hover:bg-blue-700"
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-gray-500">
                          {studentsData.length === 0 ? "No students enrolled in this course" : "No matching students found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Completion Progress Chart */}
          <Card className="bg-gray-800 text-white border border-gray-700 lg:col-span-2">
            <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
              <CardTitle className="text-white">Course Completion Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredStudents.slice(0, 10).map((student, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 truncate" style={{ maxWidth: '50%' }}>
                        {student.student_info.first_name} {student.student_info.last_name || ''}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {student.data.courses_completed} / 5 completed
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${(student.data.courses_completed / 5) * 100}%`,
                          backgroundColor: getCompletionColor(student.data.courses_completed, 5)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                {filteredStudents.length > 10 && (
                  <div className="text-center text-gray-400 text-sm mt-4">
                    Showing 10 of {filteredStudents.length} students
                  </div>
                )}
                {filteredStudents.length === 0 && (
                  <div className="text-center text-gray-400 py-10">
                    No student data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Helper function to get point color for scatter plot
function getPointColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 80) return "bg-blue-500";
  return "bg-yellow-500";
}

// Helper function to get completion color
function getCompletionColor(completed: number, total: number): string {
  const percentage = (completed / total) * 100;
  if (percentage >= 80) return "#10b981"; // green-500
  if (percentage >= 60) return "#3b82f6"; // blue-500
  if (percentage >= 40) return "#eab308"; // yellow-500
  if (percentage >= 20) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

const navItems = [
  { id: "scheduler", label: "Class Schedule", icon: Calendar },
  { id: "students", label: "Students", icon: Users },
  { id: "grades", label: "Grades", icon: GraduationCap },
  { id: "course-management", label: "Courses", icon: BookOpen },
  { id: "resources", label: "Resource Allocation", icon: Database },
]

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("scheduler")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(API_CONFIG.AUTH.USER, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Authentication failed")
        }

        const userData = await response.json()
        console.log("User data fetched:", userData)

        if (userData.role !== "Faculty") {
          console.log("Invalid role, redirecting to home")
          navigate("/")
          return
        }

        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        navigate("/")
      }
    }

    fetchUser()

    // Add event listener to handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Initial check
    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [navigate])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(API_CONFIG.AUTH.LOGOUT, {
        method: "GET",
        credentials: "include",
      })

      // Regardless of response, redirect to login page
      navigate("/")
    } catch (error) {
      console.error("Error during logout:", error)
      // Even if there's an error, still redirect to login page
      navigate("/")
    }
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "scheduler":
        return <Scheduler />
      case "students":
        return <Students />
      case "grades":
        return <Grades />
      case "course-management":
        return <CourseManagement />
      case "resources":
        return <ResourceManagement />
      default:
        return <Scheduler />
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-screen w-full bg-gray-900 overflow-hidden">
      {/* Top header bar for mobile - only shown on small screens */}
      <div className="md:hidden bg-[#0d1525] text-white p-4 flex justify-between items-center border-b border-[#1a2644]">
        <h2 className="text-xl font-bold">
          <span className="text-blue-400">Faculty</span>
          <span>Portal</span>
        </h2>
        <button onClick={toggleSidebar} className="p-1">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden w-full h-full">
        {/* Left sidebar */}
        <div
          className={`${isSidebarOpen ? "block" : "hidden"} md:block bg-[#0d1525] text-white flex-shrink-0 ${
            isSidebarOpen ? "w-full md:w-64" : "w-0"
          } transition-all duration-300 fixed md:static md:h-full z-20 h-[calc(100%-4rem)]`}
        >
          {/* Logo and title section */}
          <div className="p-6 border-b border-[#1a2644]">
            <h2 className="text-xl font-bold flex items-center">
              <span className="text-blue-400">Faculty</span>
              <span className="ml-1">Portal</span>
            </h2>
          </div>
          
          {/* Navigation links */}
          <nav className="mt-4 overflow-y-auto h-[calc(100%-12rem)]">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id)
                      if (window.innerWidth < 768) {
                        setIsSidebarOpen(false)
                      }
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-sm ${
                      activeSection === item.id
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-[#1a2644] hover:text-white"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${activeSection === item.id ? "text-white" : "text-blue-400"}`} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User info and logout - desktop */}
          <div className="hidden md:block absolute bottom-0 w-full border-t border-[#1a2644] p-4">
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                {user?.email?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user?.name || "Faculty User"}</span>
                <span className="text-xs text-gray-400">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-[#1a2644] rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile user info and logout */}
          <div className="md:hidden border-t border-[#1a2644] p-4 mt-4">
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                {user?.email?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user?.name || "Faculty User"}</span>
                <span className="text-xs text-gray-400">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-[#1a2644] rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto w-full h-full bg-gray-900 p-4">
          {renderActiveSection()}
        </div>

        {/* ChatBot component */}
        <ChatBot portalType="faculty" userName={user?.name} />
      </div>
    </div>
  )
}

export default FacultyDashboard
