import { useEffect, useState } from "react";
import {
  Save,
  Users,
  Check,
  X,
  Clock,
  LayoutGrid,
  CalendarDays,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState("daily"); // "daily" | "monthly"
  const [endMonth, setEndMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [durationMonths, setDurationMonths] = useState(4);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (viewMode === "monthly" && selectedClass) loadMonthlyView();
  }, [viewMode, selectedClass, endMonth, durationMonths]);

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

const toISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const computeMonthRange = (endMonthStr, months) => {
    const [y, m] = endMonthStr.split("-").map(Number);
    const endDate = new Date(y, m, 0); // last day of the end month
    let startYear = y;
    let startMonth = m - months + 1; // 1-based month number
    if (startMonth <= 0) {
      startMonth += 12;
      startYear -= 1;
    }
    const startDate = new Date(startYear, startMonth - 1, 1); // JS months are 0-indexed
    return { start: toISODate(startDate), end: toISODate(endDate) };
  };

  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

  const getWeekdayDates = (startStr, endStr) => {
    const dates = [];
    const cur = new Date(startStr);
    const end = new Date(endStr);
    while (cur <= end) {
      if (!isWeekend(cur)) {
        dates.push({
          iso: toISODate(cur),
          label: String(cur.getDate()),
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const loadMonthlyView = async () => {
    if (!selectedClass) return;
    setMonthlyLoading(true);
    try {
      const { start, end } = computeMonthRange(endMonth, durationMonths);
      const res = await attendanceAPI.getRange({
        class_id: selectedClass,
        start_date: start,
        end_date: end,
      });
      setMonthlyRecords(res.data.data || []);
    } catch (error) {
      console.error("Load monthly attendance error:", error);
      setMonthlyRecords([]);
    } finally {
      setMonthlyLoading(false);
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

  // ----- Monthly view helpers -----
  const statusCellClass = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-yellow-100 text-yellow-700",
    excused: "bg-blue-100 text-blue-700",
  };
  const statusLetter = { present: "P", absent: "A", late: "L", excused: "E" };

  const monthlyRange =
    viewMode === "monthly"
      ? computeMonthRange(endMonth, durationMonths)
      : null;
  const monthlyDateCols = monthlyRange
    ? getWeekdayDates(monthlyRange.start, monthlyRange.end)
    : [];

  const monthlyStatusMap = {};
  monthlyRecords.forEach((rec) => {
    if (!monthlyStatusMap[rec.student_id]) monthlyStatusMap[rec.student_id] = {};
    monthlyStatusMap[rec.student_id][rec.date] = rec.status;
  });

  const monthlySummaryFor = (student) => {
    const map = monthlyStatusMap[student.id] || {};
    const values = Object.values(map);
    return {
      present: values.filter((v) => v === "present").length,
      absent: values.filter((v) => v === "absent").length,
      late: values.filter((v) => v === "late").length,
      excused: values.filter((v) => v === "excused").length,
      total: values.length,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm">Mark daily student attendance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={viewMode === "daily" ? "btn-primary" : "btn-secondary"}
            onClick={() => setViewMode("daily")}
          >
            <Check className="w-4 h-4 mr-1" /> Daily Marking
          </button>
          <button
            type="button"
            className={viewMode === "monthly" ? "btn-primary" : "btn-secondary"}
            onClick={() => setViewMode("monthly")}
          >
            <LayoutGrid className="w-4 h-4 mr-1" /> Monthly View
          </button>
          {viewMode === "daily" && (
            <button
              className="btn-success"
              onClick={handleSave}
              disabled={saving || students.length === 0}
            >
              <Save className="w-4 h-4 mr-1" />{" "}
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div
          className={`grid grid-cols-1 gap-4 ${
            viewMode === "monthly" ? "sm:grid-cols-4" : "sm:grid-cols-3"
          }`}
        >
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
          {viewMode === "daily" ? (
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
          ) : (
            <>
              <div>
                <label className="label">End Month</label>
                <input
                  type="month"
                  className="input"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Period</label>
                <select
                  className="input"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                >
                  <option value={1}>1 month</option>
                  <option value={2}>2 months</option>
                  <option value={3}>3 months</option>
                  <option value={4}>4 months</option>
                </select>
              </div>
            </>
          )}
          <div className="flex items-end">
            {viewMode === "daily" ? (
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
            ) : (
              <div className="flex gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-green-100 text-green-700 text-center text-xs font-semibold leading-4">
                    P
                  </span>
                  Present
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-red-100 text-red-700 text-center text-xs font-semibold leading-4">
                    A
                  </span>
                  Absent
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-yellow-100 text-yellow-700 text-center text-xs font-semibold leading-4">
                    L
                  </span>
                  Late
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-blue-100 text-blue-700 text-center text-xs font-semibold leading-4">
                    E
                  </span>
                  Excused
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance table */}
      {selectedClass ? (
        viewMode === "daily" ? (
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
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold">
                Monthly Attendance - {students.length} Students
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              {monthlyRange?.start} → {monthlyRange?.end}
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header sticky left-0 bg-gray-50 z-10 min-w-[32px]">
                    No.
                  </th>
                  <th className="table-header sticky left-8 bg-gray-50 z-10 min-w-[150px] text-left">
                    Student
                  </th>
                  {monthlyDateCols.map((col) => (
                    <th
                      key={col.iso}
                      className="table-header text-center px-0.5 py-2 min-w-[28px]"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="table-header text-center px-1 text-green-700">
                    P
                  </th>
                  <th className="table-header text-center px-1 text-red-700">
                    A
                  </th>
                  <th className="table-header text-center px-1 text-yellow-700">
                    L
                  </th>
                  <th className="table-header text-center px-1 text-blue-700">
                    E
                  </th>
                  <th className="table-header text-center px-1">Marked</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
          {students.map((student, idx) => {
                  const sum = monthlySummaryFor(student);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="table-cell sticky left-0 bg-white text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="table-cell sticky left-8 bg-white font-medium whitespace-nowrap">
                        {getFullName(student.first_name, student.last_name)}
                        <span className="block text-xs text-gray-400">
                          {student.roll_number || student.student_id}
                        </span>
                      </td>
                      {monthlyDateCols.map((col) => {
                        const s = monthlyStatusMap[student.id]?.[col.iso];
                        return (
                          <td
                            key={col.iso}
                            className="px-0.5 py-1 text-center"
                          >
                            <span
                              className={`inline-block w-5 h-5 leading-5 rounded text-center font-semibold ${
                                s
                                  ? statusCellClass[s]
                                  : "bg-gray-100 text-gray-300"
                              }`}
                            >
                              {s ? statusLetter[s] : "•"}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-1 py-1 text-center font-semibold text-green-600">
                        {sum.present}
                      </td>
                      <td className="px-1 py-1 text-center font-semibold text-red-600">
                        {sum.absent}
                      </td>
                      <td className="px-1 py-1 text-center font-semibold text-yellow-600">
                        {sum.late}
                      </td>
                      <td className="px-1 py-1 text-center font-semibold text-blue-600">
                        {sum.excused}
                      </td>
                      <td className="px-1 py-1 text-center font-medium text-gray-500">
                        {sum.total}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && !monthlyLoading && (
                  <tr>
                    <td
                      colSpan={2 + monthlyDateCols.length + 5}
                      className="table-cell text-center text-gray-500 py-6"
                    >
                      {loading ? "Loading..." : "No students in this class"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )
      ) : (
        <div className="card p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Select a class to view attendance</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
