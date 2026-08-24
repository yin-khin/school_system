import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserCog,
  School,
  BookOpen,
  CalendarCheck,
  FileText,
  ClipboardList,
  Wallet,
  BookMarked,
  Megaphone,
  Building2,
  Clock,
  Menu,
  X,
  LogOut,
  Bell,
  BadgeCheck,
  GraduationCap,
  CalendarDays,
  Home,
  Search,
  ChevronDown,
  Database,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { notificationAPI } from "../../api";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Students", path: "/students", icon: Users },
  { name: "Teachers", path: "/teachers", icon: UserCog },
  { name: "Parents", path: "/parents", icon: Home },
  { name: "Classes", path: "/classes", icon: School },
  { name: "Subjects", path: "/subjects", icon: BookOpen },
  { name: "Timetables", path: "/timetables", icon: Clock },
  { name: "Attendance", path: "/attendance", icon: CalendarCheck },
  { name: "Exams", path: "/exams", icon: FileText },
  { name: "Marks", path: "/marks", icon: ClipboardList },
  { name: "Assignments", path: "/assignments", icon: BookMarked },
  { name: "Fees", path: "/fees", icon: Wallet },
  { name: "Payments", path: "/payments", icon: CalendarDays },
  { name: "Library", path: "/library", icon: BookMarked },
  { name: "Announcements", path: "/announcements", icon: Megaphone },
  { name: "Staff", path: "/staff", icon: BadgeCheck },
  { name: "Academic Years", path: "/academic-years", icon: Building2 },
  { name: "Users", path: "/users", icon: UserCog },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "Backup", path: "/backup", icon: Database },
  { name: "Site Settings", path: "/site-settings", icon: Settings },
];

const mobileNavItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Students", path: "/students", icon: Users },
  { name: "Classes", path: "/classes", icon: School },
  { name: "Profile", path: "/users", icon: UserCog },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 5 });
      setNotifications(res.data.data || []);
    } catch (error) {
      // Silent fail
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-primary-700">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold leading-tight">School</h1>
              <p className="text-xs text-primary-300">Management System</p>
            </div>
          </div>
          <button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-4 px-3 pb-20 overflow-y-auto h-[calc(100vh-4rem)] no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-primary-200 hover:bg-primary-700 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-gray-600"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:block relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.some((n) => !n.is_read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button className="text-xs text-primary-600 hover:text-primary-700">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-500 text-center">
                          No notifications
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50"
                          >
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm">
                    {getInitials(user?.full_name)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-tight">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role?.replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/users");
                        }}
                      >
                        My Profile
                      </button>
                      <button
                        className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          <div className="grid grid-cols-4 h-16">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-xs font-medium ${
                    isActive ? "text-primary-600" : "text-gray-500"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
