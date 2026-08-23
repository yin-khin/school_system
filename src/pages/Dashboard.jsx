import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCog,
  Wallet,
  CalendarCheck,
  FileText,
  Megaphone,
  ArrowRight,
  BookOpen,
  Plus,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { dashboardAPI } from "../api";
import { formatCurrency, formatDate, getInitials } from "../utils/helpers";

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="card p-4 lg:p-5 fade-in">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
          {value}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    // Load stats independently so failure of one doesn't block the other
    try {
      const statsRes = await dashboardAPI.getStats();
      setStats(statsRes.data.data);
    } catch (error) {
      console.error("Dashboard stats error:", error);
    }

    // Load activities independently
    try {
      const activitiesRes = await dashboardAPI.getRecentActivities();
      setActivities(activitiesRes.data.data);
    } catch (error) {
      console.error("Dashboard activities error:", error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      subtitle: `${stats?.maleStudents || 0} Male | ${stats?.femaleStudents || 0} Female`,
      link: "/students",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers || 0,
      icon: UserCog,
      color: "bg-green-100 text-green-600",
      subtitle: `${stats?.totalClasses || 0} Classes`,
      link: "/teachers",
    },
    {
      title: "Today's Attendance",
      value: stats?.todayAttendance || 0,
      icon: CalendarCheck,
      color: "bg-blue-100 text-blue-600",
      subtitle: `${stats?.absentToday || 0} Absent`,
      link: "/attendance",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: Wallet,
      color: "bg-purple-100 text-purple-600",
      subtitle: `${stats?.pendingFees || 0} Pending Fees`,
      link: "/fees",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold">
          Welcome back, Admin 
        </h1>
        <p className="text-primary-100 mt-1">
          Here's what's happening at your school today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="cursor-pointer"
            onClick={() => card.link && (window.location.href = card.link)}
          >
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Classes</p>
              <p className="text-xl font-bold">{stats?.totalClasses || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-xl font-bold">{stats?.totalSubjects || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <p className="text-xl font-bold">{stats?.upcomingExams || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Announcements</p>
              <p className="text-xl font-bold">
                {stats?.totalAnnouncements || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Students</h2>
            <Link
              to="/students"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {activities?.recentStudents?.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                  {getInitials(`${student.first_name} ${student.last_name}`)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{student.student_id}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(student.created_at)}
                </span>
              </div>
            ))}
            {(!activities?.recentStudents ||
              activities.recentStudents.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-3">
                No students yet
              </p>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Payments</h2>
            <Link
              to="/payments"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {activities?.recentPayments?.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold">
                  {getInitials(
                    payment.Student
                      ? `${payment.Student.first_name} ${payment.Student.last_name}`
                      : "P",
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {payment.Student
                      ? `${payment.Student.first_name} ${payment.Student.last_name}`
                      : "Student"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Receipt: {payment.receipt_no}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
            {(!activities?.recentPayments ||
              activities.recentPayments.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-3">
                No payments yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { name: "Add Student", path: "/students", icon: UserPlus },
          { name: "Mark Attendance", path: "/attendance", icon: CalendarCheck },
          { name: "Enter Marks", path: "/marks", icon: ClipboardList },
          { name: "Create Fee", path: "/fees", icon: Wallet },
          {
            name: "Post Announcement",
            path: "/announcements",
            icon: Megaphone,
          },
        ].map((link, idx) => (
          <Link
            key={idx}
            to={link.path}
            className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
              <link.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
