import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Save, ClipboardList, Plus } from "lucide-react";
import { markAPI, examAPI, studentAPI } from "../../api";
import Table from "../../components/common/Table";
import { getFullName, getInitialsFromName } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Marks = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const res = await examAPI.getAll({ limit: 100 });
      setExams(res.data.data);
    } catch (error) {
      console.error("Load exams error:", error);
    }
  };

  const handleExamSelect = async (examId) => {
    setSelectedExam(examId);
    setMarks({});
    setStudents([]);
    setSelectedStudents([]);
    if (!examId) return;
    setLoading(true);
    try {
      const exam = exams.find((e) => String(e.id) === String(examId));
      if (exam) {
        const studentsRes = await studentAPI.getByClass(exam.class_id);
        const classStudents = studentsRes.data.data;
        setStudents(classStudents);
        setSelectedStudents(classStudents.map((student) => student.id));

        // Load existing marks
        const marksRes = await markAPI.getByExam(examId);
        const marksMap = {};
        marksRes.data.data.forEach((m) => {
          marksMap[m.student_id] = m.marks_obtained;
        });
        setMarks(marksMap);
      }
    } catch (error) {
      console.error("Load marks error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    setMarks((prev) => ({ ...prev, [studentId]: value }));
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const allStudentsSelected =
    students.length > 0 && selectedStudents.length === students.length;

  const toggleAllStudents = () => {
    setSelectedStudents(
      allStudentsSelected ? [] : students.map((student) => student.id),
    );
  };

  const handleSave = async () => {
    const selectedExamObj = exams.find(
      (e) => String(e.id) === String(selectedExam),
    );
    if (!selectedExamObj) return;

    const records = students
      .filter((student) => selectedStudents.includes(student.id))
      .filter(
        (student) =>
          marks[student.id] !== undefined && marks[student.id] !== "",
      )
      .map((student) => ({
        exam_id: selectedExam,
        student_id: student.id,
        subject_id: selectedExamObj.subject_id,
        marks_obtained: parseFloat(marks[student.id]),
        total_marks: selectedExamObj.total_marks || 100,
      }));

    if (records.length === 0) {
      alert("Please enter marks for at least one student");
      return;
    }

    setSaving(true);
    try {
      await markAPI.create({ records });
      alert("Marks saved successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error saving marks");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={allStudentsSelected}
          onChange={toggleAllStudents}
          aria-label="Select all students"
        />
      ),
      accessor: "selected",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row.id)}
          onChange={() => toggleStudent(row.id)}
          aria-label={`Select ${getFullName(row.first_name, row.last_name)}`}
        />
      ),
    },
    {
      header: "Student",
      accessor: "first_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
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
      header: "Marks Obtained",
      accessor: "marks",
      render: (row) => (
        <input
          type="number"
          min="0"
          max="100"
          className="input w-24"
          value={marks[row.id] || ""}
          onChange={(e) => handleMarkChange(row.id, e.target.value)}
          placeholder="Enter marks"
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
          <p className="text-gray-500 text-sm">Enter student marks for exams</p>
        </div>
        <div className="flex gap-2">
          <Link to="/exams" className="btn-secondary">
            <Plus className="w-4 h-4 mr-1" /> Add New Exam
          </Link>
          <button
            className="btn-success"
            onClick={handleSave}
            disabled={saving || selectedStudents.length === 0}
          >
            <Save className="w-4 h-4 mr-1" />{" "}
            {saving ? "Saving..." : "Save Marks"}
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="label">Select Exam</label>
            <select
              className="input"
              value={selectedExam}
              onChange={(e) => handleExamSelect(e.target.value)}
            >
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} - {exam.Class?.name} - {exam.Subject?.name} (
                  {exam.exam_date})
                </option>
              ))}
            </select>
          </div>
          <Link to="/exams" className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4 mr-1" /> Add New Exam
          </Link>
        </div>
      </div>

      {selectedExam ? (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold">
              {selectedStudents.length} of {students.length} Students Selected
            </h2>
          </div>
          <Table columns={columns} data={students} loading={loading} />
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Select an exam to enter marks</p>
        </div>
      )}
    </div>
  );
};

export default Marks;
