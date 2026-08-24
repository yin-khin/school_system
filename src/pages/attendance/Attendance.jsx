import { useEffect, useState } from "react";
import { Save, Users, Check, X, Clock } from "lucide-react";
import { attendanceAPI, classAPI, studentAPI } from "../../api";
import Table from "../../components/common/Table";
import {
  formatDate,
  getFullName,
  getInitialsFromName,
} from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getAll({ limit: 100 });
      setClasses(res.data.data);
    } catch (error) {
      console.error("Load classes error:", error);
    }
  };

  const loadStudentsByClass = async (classId, targetDate = date) => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await studentAPI.getByClass(classId);
      setStudents(res.data.data);
      // Initialize attendance records
      const records = {};
      res.data.data.forEach((student) => {
        records[student.id] = "present";
      });
      setAttendanceRecords(records);

      // Check for existing records
      const attendanceRes = await attendanceAPI.getByClassAndDate(
        classId,
        targetDate,
      );
      if (attendanceRes.data.data.length > 0) {
        attendanceRes.data.data.forEach((record) => {
          records[record.student_id] = record.status;
        });
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.error("Load students error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    loadStudentsByClass(classId, date);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedClass || !date) {
      alert("Please select class and date");
      return;
    }

    const records = students.map((student) => ({
      student_id: student.id,
      class_id: selectedClass,
      section_id: student.section_id || null,
      date,
      status: attendanceRecords[student.id] || "present",
    }));

    setSaving(true);
    try {
      await attendanceAPI.create({ records });
      alert("Attendance saved successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error saving attendance");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: "Student",
      accessor: "first_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
            {row.photo ? (
              <img
                src={`${API_URL.replace("/api", "")}/uploads/${row.photo}`}
                alt={row.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitialsFromName(row.first_name, row.last_name)
            )}
          </div>
          <div>
            <p className="font-medium text-sm">
              {getFullName(row.first_name, row.last_name)}
            </p>
            <p className="text-xs text-gray-500">
              {row.roll_number || row.student_id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <div className="flex gap-2">
          {["present", "absent", "late", "excused"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(row.id, status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                attendanceRecords[row.id] === status
                  ? status === "present"
                    ? "bg-green-500 text-white"
                    : status === "absent"
                      ? "bg-red-500 text-white"
                      : status === "late"
                        ? "bg-yellow-500 text-white"
                        : "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "present"
                ? "P"
                : status === "absent"
                  ? "A"
                  : status === "late"
                    ? "L"
                    : "E"}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const summary = {
    present: students.filter((s) => attendanceRecords[s.id] === "present")
      .length,
    absent: students.filter((s) => attendanceRecords[s.id] === "absent").length,
    late: students.filter((s) => attendanceRecords[s.id] === "late").length,
    excused: students.filter((s) => attendanceRecords[s.id] === "excused")
      .length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm">Mark daily student attendance</p>
        </div>
        <button
          className="btn-success"
          onClick={handleSave}
          disabled={saving || students.length === 0}
        >
          <Save className="w-4 h-4 mr-1" />{" "}
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Class</label>
            <select
              className="input"
              value={selectedClass}
              onChange={handleClassChange}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => {
                const targetDate = e.target.value;
                setDate(targetDate);
                if (selectedClass)
                  loadStudentsByClass(selectedClass, targetDate);
              }}
            />
          </div>
          <div className="flex items-end">
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" /> {summary.present}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <X className="w-4 h-4" /> {summary.absent}
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="w-4 h-4" /> {summary.late}
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                E {summary.excused}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance table */}
      {selectedClass ? (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold">
                {students.length} Students - {formatDate(date)}
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              P: {summary.present} | A: {summary.absent} | L: {summary.late} |
              E: {summary.excused}
            </div>
          </div>
          <Table columns={columns} data={students} loading={loading} />
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Select a class and date to mark attendance</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
