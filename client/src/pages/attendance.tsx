import React from "react";
import { useNavigate } from "react-router-dom";
// import { assets } from "../../assets/assets"; // adjust path if needed
import { FaUserCheck, FaHistory, FaChartBar } from "react-icons/fa"; // Using react-icons for consistency

interface AttendanceCard {
  title: string;
  description: string;
  route: string;
  icon: React.JSX.Element;
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();

  const cards: AttendanceCard[] = [
    {
      title: "Today's Attendance",
      description: "View and manage today's attendance records.",
      route: "/todays-attendance",
      icon: <FaUserCheck className="w-12 h-12 mb-4 text-blue-400" />,
    },
    {
      title: "Attendance History",
      description: "Access and review past attendance records.",
      route: "/attendance-history",
      icon: <FaHistory className="w-12 h-12 mb-4 text-green-400" />,
    },
    {
      title: "Attendance Analytics",
      description: "View statistics and reports on attendance patterns.",
      route: "/attendance-analytics",
      icon: <FaChartBar className="w-12 h-12 mb-4 text-purple-400" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600">
      <img
        onClick={() => navigate("/")}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-10 sm:w-10 cursor-pointer"
      />
      <h2 className="text-3xl font-semibold text-white mb-8">
        Attendance Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full sm:w-3/4">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.route)}
            className="bg-slate-900 p-8 rounded-lg shadow-lg flex flex-col items-center text-center text-indigo-300 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl hover:bg-slate-800"
          >
            {card.icon}
            <h3 className="text-xl font-semibold text-white mb-2">
              {card.title}
            </h3>
            <p className="text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendancePage;
