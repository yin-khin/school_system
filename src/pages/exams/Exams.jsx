import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, FileText } from "lucide-react";
import { examAPI, classAPI, subjectAPI, academicYearAPI } from "../../api";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import { formatDate, statusColor } from "../../utils/helpers";

const ExamForm = ({
  initialData,
  academicYears,
  classes,
  subjects,
  loadError,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    academic_year_id: initialData?.academic_year_id || "",
    class_id: initialData?.class_id || "",
    subject_id: initialData?.subject_id || "",
    exam_date: initialData?.exam_date || "",
    start_time: initialData?.start_time || "08:00",
    end_time: initialData?.end_time || "10:00",
    room: initialData?.room || "",
    total_marks: initialData?.total_marks || 100,
    pass_marks: initialData?.pass_marks || 40,
    status: initialData?.status || "scheduled",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loadError && <p className="text-sm text-red-600">{loadError}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Exam Name *</label>
          <input
            type="text"
            name="name"
            className="input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label">Academic Year *</label>
          <select
            name="academic_year_id"
            className="input"
            value={formData.academic_year_id}
            onChange={handleChange}
            required
          >
            <option value="">
              {academicYears.length
                ? "Select Academic Year"
                : "No academic years found"}
            </option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Class</label>
          <select
            name="class_id"
            className="input"
            value={formData.class_id}
            onChange={handleChange}
          >
            <option value="">
              {classes.length ? "Select Class" : "No classes found"}
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Subject</label>
          <select
            name="subject_id"
            className="input"
            value={formData.subject_id}
            onChange={handleChange}
          >
            <option value="">
              {subjects.length ? "Select Subject" : "No subjects found"}
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Exam Date</label>
          <input
            type="date"
            name="exam_date"
            className="input"
            value={formData.exam_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Start Time</label>
          <input
            type="time"
            name="start_time"
            className="input"
            value={formData.start_time}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">End Time</label>
          <input
            type="time"
            name="end_time"
            className="input"
            value={formData.end_time}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Room</label>
          <input
            type="text"
            name="room"
            className="input"
            value={formData.room}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Total Marks</label>
          <input
            type="number"
            name="total_marks"
            className="input"
            value={formData.total_marks}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Pass Marks</label>
          <input
            type="number"
            name="pass_marks"
            className="input"
            value={formData.pass_marks}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            className="input"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? "Update Exam" : "Add Exam"}
        </button>
      </div>
    </form>
  );
};

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const results = await Promise.allSettled([
        examAPI.getAll({ limit: 100, search }),
        classAPI.getAll({ limit: 100 }),
        subjectAPI.getAll({ limit: 100 }),
        academicYearAPI.getAll(),
      ]);
      const [examsResult, classesResult, subjectsResult, academicYearsResult] =
        results;
      const failedLists = [];

      if (examsResult.status === "fulfilled")
        setExams(examsResult.value.data.data || []);
      else failedLists.push("exams");
      if (classesResult.status === "fulfilled")
        setClasses(classesResult.value.data.data || []);
      else failedLists.push("classes");
      if (subjectsResult.status === "fulfilled")
        setSubjects(subjectsResult.value.data.data || []);
      else failedLists.push("subjects");
      if (academicYearsResult.status === "fulfilled")
        setAcademicYears(academicYearsResult.value.data.data || []);
      else failedLists.push("academic years");

      if (failedLists.length > 0) {
        setLoadError(
          `Could not load: ${failedLists.join(", ")}. Check the API server and login session.`,
        );
      }
    } catch (error) {
      console.error("Load exams error:", error);
      setLoadError(
        "Could not load exam data. Check that the API server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await examAPI.create(data);
      setShowModal(false);
      loadData();
      alert("Exam created successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating exam");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await examAPI.update(editingExam.id, data);
      setShowModal(false);
      setEditingExam(null);
      loadData();
      alert("Exam updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating exam");
    }
  };

  const handleDelete = async (exam) => {
    if (window.confirm(`Are you sure you want to delete exam ${exam.name}?`)) {
      try {
        await examAPI.delete(exam.id);
        loadData();
        alert("Exam deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting exam");
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === "edit") {
      setEditingExam(row);
      setShowModal(true);
    } else if (action === "delete") {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: "Exam",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-gray-500">{row.Class?.name}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Subject",
      accessor: "Subject",
      render: (row) => row.Subject?.name || "-",
    },
    {
      header: "Date",
      accessor: "exam_date",
      render: (row) => formatDate(row.exam_date),
    },
    {
      header: "Time",
      accessor: "start_time",
      render: (row) => `${row.start_time || "--"} - ${row.end_time || "--"}`,
    },
    { header: "Room", accessor: "room", render: (row) => row.room || "-" },
    {
      header: "Marks",
      accessor: "total_marks",
      render: (row) => `${row.total_marks || "-"}`,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={statusColor[row.status] || "badge-gray"}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-500 text-sm">Manage examinations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              className="input pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value === "" || e.target.value.length > 2)
                  loadData();
              }}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingExam(null);
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Exam
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={exams}
          loading={loading}
          actions={[
            {
              name: "edit",
              icon: <Pencil className="w-4 h-4" />,
              title: "Edit",
            },
            {
              name: "delete",
              icon: <Trash2 className="w-4 h-4" />,
              title: "Delete",
              color: "danger",
            },
          ]}
          onAction={handleAction}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingExam(null);
        }}
        title={editingExam ? "Edit Exam" : "Add New Exam"}
      >
        <ExamForm
          initialData={editingExam}
          academicYears={academicYears}
          classes={classes}
          subjects={subjects}
          loadError={loadError}
          onSubmit={editingExam ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingExam(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Exams;
