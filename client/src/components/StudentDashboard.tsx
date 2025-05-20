"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Calendar,
  GraduationCap,
  Library,
  Users,
  Book,
  Menu,
  X,
  Shield,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Camera,
  FileDown,
} from "lucide-react"
import Scheduler from "./Scheduler"
import ResourceManagement from "./ResourceManagementStudent"
import StudentCourseManagement from "./StudentCourseManagement"
import API_CONFIG from "../lib/config"
import axios from "axios"
import { Badge } from "./ui/badge"
import { CardFooter } from "./ui/card"
import { CardDescription } from "./ui/card"
import { generateAcademicPerformanceReport } from "../lib/pdf-generator"

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

// Facial Recognition Attendance Component
const FacialRecognitionAttendance = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentCourse, setCurrentCourse] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [scanningStatus, setScanningStatus] = useState<"idle" | "scanning" | "processing">("idle");
  const [detectedStudents, setDetectedStudents] = useState<{id: string, name: string, confidence: number}[]>([]);

  useEffect(() => {
    // Fetch recent attendance records
    const mockRecords: AttendanceRecord[] = [
      {
        attendance_id: 1,
        reg_number: "S12345",
        timestamp: new Date().toISOString(),
        method: "facial_recognition",
        status: "present",
        location: "Lecture Hall A",
        course_code: "CS101",
      },
      {
        attendance_id: 2,
        reg_number: "S12346",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        method: "facial_recognition",
        status: "present",
        location: "Lecture Hall B",
        course_code: "CS102",
      },
      {
        attendance_id: 3,
        reg_number: "S12347",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        method: "facial_recognition",
        status: "present",
        location: "Lab 3",
        course_code: "CS103",
      },
    ];

    setRecentRecords(mockRecords);
  }, []);

  const startScanning = () => {
    if (!currentCourse || !currentLocation) {
      setPopupMessage({ type: "error", text: "Please select course and location" });
      setShowPopup(true);
      return;
    }

    setIsScanning(true);
    setScanningStatus("scanning");
    
    // Simulate facial recognition process
    setTimeout(() => {
      setScanningStatus("processing");
      // Simulate detected students
      setDetectedStudents([
        { id: "S12345", name: "John Doe", confidence: 0.98 },
        { id: "S12346", name: "Jane Smith", confidence: 0.95 },
        { id: "S12347", name: "Alex Johnson", confidence: 0.92 },
      ]);
      
      // Simulate completion
      setTimeout(() => {
        setScanningStatus("idle");
        setIsScanning(false);
        setPopupMessage({ type: "success", text: "Attendance recorded successfully" });
        setShowPopup(true);
      }, 2000);
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
          <CardTitle className="text-white">Facial Recognition Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="course">
                Select Course *
              </label>
              <Select value={currentCourse} onValueChange={setCurrentCourse} className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="">Select a course</SelectItem>
                <SelectItem value="CS101">CS101 - Introduction to Computer Science</SelectItem>
                <SelectItem value="CS102">CS102 - Programming Fundamentals</SelectItem>
                <SelectItem value="CS201">CS201 - Data Structures and Algorithms</SelectItem>
                <SelectItem value="CS301">CS301 - Database Systems</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="location">
                Location *
              </label>
              <Input
                id="location"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g. Lecture Hall A"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
              {isScanning ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {scanningStatus === "scanning" ? (
                    <>
                      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-blue-400 font-medium">Scanning for faces...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-green-400 font-medium">Processing detected faces...</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-600 mb-4" />
                  <p className="text-gray-400">Camera feed will appear here</p>
                </div>
              )}
            </div>

            {detectedStudents.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Detected Students</h4>
                <div className="space-y-2">
                  {detectedStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <div>
                        <p className="text-white font-medium">{student.name}</p>
                        <p className="text-sm text-gray-400">{student.id}</p>
                      </div>
                      <div className="text-sm text-green-400">
                        {Math.round(student.confidence * 100)}% match
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={startScanning} 
              disabled={isScanning || !currentCourse || !currentLocation}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isScanning ? "Processing..." : "Start Facial Recognition"}
            </Button>
          </div>
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
                  <th className="text-left py-3 px-4 font-medium text-white">Method</th>
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
                      <td className="py-3 px-4 text-white capitalize">{record.method.replace('_', ' ')}</td>
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
  );
};

// Rename Students to Attendance
const Attendance = () => {
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
            <p>This is an automatically generated report. For any discrepancies, please contact the Student office.</p>
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
                <p>This is an automatically generated report. For any discrepancies, please contact the Student office.</p>
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Attendance Management</h1>
        <p className="text-gray-400">Track and manage student attendance</p>
      </div>
      <Tabs defaultValue="facial" className="flex-1">
        <TabsList className="bg-gray-800 border-b border-gray-700">
          <TabsTrigger value="facial" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Facial Recognition
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="facial" className="mt-6 flex-1">
          <FacialRecognitionAttendance />
        </TabsContent>
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

// Replace the existing Grades component with the new Academic Performance component
const AcademicPerformance = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courseResults, setCourseResults] = useState<any>(null);
  const [studyRecommendations, setStudyRecommendations] = useState<any>(null);
  const [courseRecommendations, setCourseRecommendations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("results");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the user_id from localStorage
        const userId = localStorage.getItem("user_id") || "ddd3eb31-c06f-45ab-b464-632040419d82";
        
        // Fetch course results
        const resultsResponse = await axios.get(
          `${API_CONFIG.STUDENT_COURSES.RESULTS}/${userId}/course-results`
        );
        setCourseResults(resultsResponse.data);
        
        // Fetch study recommendations
        const studyResponse = await axios.get(
          `${API_CONFIG.RECOMMENDATIONS.STUDY}/${userId}/`
        );
        setStudyRecommendations(studyResponse.data);
        
        // Fetch course recommendations
        const courseRecResponse = await axios.post(
          `${API_CONFIG.RECOMMENDATIONS.COURSE}/${userId}/`
        );
        setCourseRecommendations(courseRecResponse.data);
      } catch (err: any) {
        console.error("Error fetching academic data:", err);
        setError("Failed to load your academic performance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get grade letter
  const getGradeLetter = (score: number): string => {
    if (score >= 75) return "A";
    if (score >= 65) return "B";
    if (score >= 55) return "C";
    if (score >= 45) return "D";
    return "F";
  };
  
  // Function to get grade color
  const getGradeColor = (score: number): string => {
    if (score >= 75) return "text-green-400";
    if (score >= 65) return "text-blue-400";
    if (score >= 55) return "text-yellow-400";
    if (score >= 45) return "text-orange-400";
    return "text-red-400";
  };

  // Function to get background color class based on score
  const getBgColor = (score: number): string => {
    if (score >= 75) return "bg-green-500";
    if (score >= 65) return "bg-blue-500";
    if (score >= 55) return "bg-yellow-500";
    if (score >= 45) return "bg-orange-500";
    return "bg-red-500";
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

  // Calculate average score across all courses
  const overallAverage = courseResults?.course_results?.reduce(
    (sum: number, course: any) => sum + course.average_score, 0
  ) / courseResults?.course_results?.length || 0;

  // Function to generate PDF report
  const handleGeneratePdf = async () => {
    if (!courseResults || !studyRecommendations) return;
    
    try {
      setIsGeneratingPdf(true);
      
      // Get user name from localStorage or use default
      const userId = localStorage.getItem("user_id");
      let studentName = "Student";
      
      // Extract student name from recommendation if available
      if (studyRecommendations?.recommendations?.recommendations?.[0]?.current_progress) {
        const progressInfo = studyRecommendations.recommendations.recommendations[0].current_progress;
        const nameMatch = progressInfo.match(/You have achieved|You scored|You've achieved/);
        if (nameMatch && nameMatch.index && nameMatch.index > 10) {
          studentName = progressInfo.substring(0, nameMatch.index).trim();
        }
      }
      
      await generateAcademicPerformanceReport(
        overallAverage,
        courseResults.course_results,
        studyRecommendations,
        studentName
      );
    } catch (error) {
      console.error("Error generating academic PDF report:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Academic Performance</h1>
            <p className="text-gray-400">Track your academic progress and get personalized recommendations</p>
          </div>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-900/20 flex items-center gap-2"
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf || loading || !!error}
          >
            <FileDown className="h-4 w-4" />
            {isGeneratingPdf ? 'Generating...' : 'Generate PDF Report'}
          </Button>
        </div>
      </div>
      
      {/* Overall Performance Card */}
      <Card className="bg-gray-800 text-white border border-gray-700 mb-6">
        <CardHeader className="bg-gray-800 pb-3 pt-5 border-b border-gray-700">
          <CardTitle className="text-white">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center md:flex-row md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-24 w-24 rounded-full flex items-center justify-center border-4 border-blue-600 mr-6">
                <span className={`text-3xl font-bold ${getGradeColor(overallAverage)}`}>
                  {getGradeLetter(overallAverage)}
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{overallAverage.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Overall Average</div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 max-w-2xl">
              <p className="text-gray-300 text-sm italic">
                "{studyRecommendations?.recommendations?.overall_recommendation}"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="bg-gray-800 border-b border-gray-700">
          <TabsTrigger value="results" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
            Course Results
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
            Study Recommendations
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
            Course Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Course Results Tab */}
        <TabsContent value="results" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Results Cards */}
            {courseResults?.course_results.map((course: any, index: number) => (
              <Card 
                key={`${course.course_name}-${index}`}
                className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">
                      {course.course_name}
                    </CardTitle>
                    <Badge 
                      className={`${
                        course.average_score >= 80 ? "bg-green-800 text-green-200" : 
                        course.average_score >= 70 ? "bg-blue-800 text-blue-200" :
                        "bg-yellow-800 text-yellow-200"
                      }`}
                    >
                      {getGradeLetter(course.average_score)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400">Average Score</span>
                      <span className={`font-medium ${getGradeColor(course.average_score)}`}>
                        {course.average_score.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className={`${getBgColor(course.average_score)} h-full rounded-full`} 
                        style={{ width: `${course.average_score}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 pt-4">
                  <Button 
                    variant="outline"
                    className="w-full bg-gray-900 text-gray-300 border-gray-500 hover:bg-gray-500 hover:text-white"
                    onClick={() => {
                      setSelectedCourse(course.course_name);
                      setActiveTab("recommendations");
                    }}
                  >
                    View Recommendations
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Study Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-6">
            {studyRecommendations?.recommendations?.recommendations
              .filter((rec: any) => !selectedCourse || rec.course_name === selectedCourse)
              .map((rec: any, index: number) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white">{rec.course_name}</CardTitle>
                      {selectedCourse && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedCourse(null)}
                          className="h-8 px-2 text-gray-400 hover:text-white"
                        >
                          View All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Current Progress</h3>
                        <p className="text-gray-300">{rec.current_progress}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-400 mb-2">Recommendations</h3>
                        <p className="text-gray-300">{rec.study_recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Course Recommendations Tab */}
        <TabsContent value="courses" className="mt-6">
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-white">Recommended Courses</CardTitle>
              <CardDescription className="text-gray-400">
                {courseRecommendations?.recommendations?.overall_recommendation}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {courseRecommendations?.recommendations?.recommended_courses.map((course: any, index: number) => (
                <div 
                  key={index}
                  className={`p-6 ${index !== courseRecommendations.recommendations.recommended_courses.length - 1 ? 'border-b border-gray-700' : ''}`}
                >
                  <h3 className="text-lg font-medium text-white mb-2">{course.course_name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <h4 className="text-blue-400 text-sm font-medium mb-1">Why this course is relevant for you:</h4>
                    <p className="text-gray-300 text-sm">{course.relevance}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const navItems = [
  { id: "scheduler", label: "Class Schedule", icon: Calendar },
  { id: "attendance", label: "Attendance", icon: Users },
  { id: "grades", label: "Academic Performance", icon: GraduationCap },
  { id: "course-management", label: "Course Management", icon: GraduationCap },
  { id: "resources", label: "Resource Management", icon: Library },
]

const StudentDashboard: React.FC = () => {
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

        if (userData.role !== "Student") {
          console.log("Invalid role, redirecting to home")
          navigate("/")
          return
        }

        // Store user ID in localStorage for other components to use
        if (userData.id) {
          localStorage.setItem("user_id", userData.id)
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
      case "attendance":
        return <Attendance />
      case "grades":
        return <AcademicPerformance />
      case "course-management":
        return <StudentCourseManagement />
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
          <span className="text-blue-400">Student</span>
          <span>Portal</span>
        </h2>
        <button onClick={toggleSidebar} className="p-1">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden w-full h-full">
        {/* Left sidebar - inspired by CampusSecure */}
        <div
          className={`${isSidebarOpen ? "block" : "hidden"} md:block bg-[#0d1525] text-white border-r border-[#1a2644] flex-shrink-0 ${
            isSidebarOpen ? "w-full md:w-64" : "w-0"
          } transition-all duration-300 fixed md:static md:h-full z-20 h-[calc(100%-4rem)]`}
        >
          {/* Logo and title section */}
          <div className="p-6 border-b border-[#1a2644]">
            <h2 className="text-xl font-bold flex items-center">
              <span className="text-blue-400">Student</span>
              <span className="ml-1">Portal</span>
            </h2>
          </div>
          
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
                {user?.email?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user?.name || "Student User"}</span>
                <span className="text-xs text-gray-400">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-half flex items-center px-3 py-2 text-red-400 hover:bg-[#1a2644] rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile user info and logout */}
          <div className="md:hidden border-t border-[#1a2644] p-4 mt-4">
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                {user?.email?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user?.name || "Student User"}</span>
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
      </div>
    </div>
  )
}

export default StudentDashboard
