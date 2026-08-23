import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, ImagePlus, X } from "lucide-react";
import { studentAPI, classAPI } from "../../api";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import {
  formatDate,
  getFullName,
  statusColor,
  getInitialsFromName,
} from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StudentForm = ({ initialData, classes, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    gender: initialData?.gender || "male",
    date_of_birth: initialData?.date_of_birth || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    admission_date:
      initialData?.admission_date || new Date().toISOString().split("T")[0],
    class_id: initialData?.class_id || "",
    roll_number: initialData?.roll_number || "",
    emergency_contact: initialData?.emergency_contact || "",
    emergency_phone: initialData?.emergency_phone || "",
    blood_group: initialData?.blood_group || "",
    status: initialData?.status || "active",
    create_user: false,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(
    initialData?.photo
      ? `${API_URL.replace("/api", "")}/uploads/${initialData.photo}`
      : null,
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoRemoved(false);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoRemoved(true);
    setPhotoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });
    if (photoFile) {
      formDataObj.append("photo", photoFile);
    }
    if (photoRemoved) {
      formDataObj.append("remove_photo", "true");
    }
    onSubmit(formDataObj);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-400">
              {getInitialsFromName(formData.first_name, formData.last_name)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="btn-outline cursor-pointer text-sm">
            <ImagePlus className="w-4 h-4 mr-1 inline" />{" "}
            {photoPreview ? "Change Photo" : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
          {photoPreview && (
            <button
              type="button"
              className="text-red-600 text-sm flex items-center gap-1"
              onClick={handleRemovePhoto}
            >
              <X className="w-4 h-4" /> Remove Photo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <input
            type="text"
            name="first_name"
            className="input"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input
            type="text"
            name="last_name"
            className="input"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label">Gender *</label>
          <select
            name="gender"
            className="input"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Date of Birth *</label>
          <input
            type="date"
            name="date_of_birth"
            className="input"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            type="text"
            name="phone"
            className="input"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            className="input"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Class</label>
          <select
            name="class_id"
            className="input"
            value={formData.class_id}
            onChange={handleChange}
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
          <label className="label">Roll Number</label>
          <input
            type="text"
            name="roll_number"
            className="input"
            value={formData.roll_number}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Admission Date</label>
          <input
            type="date"
            name="admission_date"
            className="input"
            value={formData.admission_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Blood Group</label>
          <select
            name="blood_group"
            className="input"
            value={formData.blood_group}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            className="input"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Address</label>
        <textarea
          name="address"
          className="input"
          rows="2"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="label">Emergency Contact Name</label>
        <input
          type="text"
          name="emergency_contact"
          className="input"
          value={formData.emergency_contact}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="label">Emergency Phone</label>
        <input
          type="text"
          name="emergency_phone"
          className="input"
          value={formData.emergency_phone}
          onChange={handleChange}
        />
      </div>
      {!initialData && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="create_user"
            checked={formData.create_user}
            onChange={handleChange}
            className="rounded"
          />
          Create user account (username: email, default password: student123)
        </label>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? "Update Student" : "Add Student"}
        </button>
      </div>
    </form>
  );
};

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async (params = {}) => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({
        page: params.page || 1,
        limit: 10,
        search,
      });
      setStudents(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Load students error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await classAPI.getAll({ limit: 100 });
      setClasses(res.data.data);
    } catch (error) {
      console.error("Load classes error:", error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "" || e.target.value.length > 2) {
      loadStudents();
    }
  };

  const handleCreate = async (data) => {
    try {
      await studentAPI.create(data);
      setShowModal(false);
      loadStudents();
      alert("Student created successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating student");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await studentAPI.update(editingStudent.id, data);
      setShowModal(false);
      setEditingStudent(null);
      loadStudents();
      alert("Student updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating student");
    }
  };

  const handleDelete = async (student) => {
    if (
      window.confirm(
        `Are you sure you want to delete student ${getFullName(student.first_name, student.last_name)}?`,
      )
    ) {
      try {
        await studentAPI.delete(student.id);
        loadStudents();
        alert("Student deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting student");
      }
    }
  };

  const handleDeletePhoto = async (student) => {
    if (
      window.confirm(
        `Delete photo for ${getFullName(student.first_name, student.last_name)}?`,
      )
    ) {
      try {
        await studentAPI.deletePhoto(student.id);
        loadStudents();
        alert("Photo deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting photo");
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === "view") {
      navigate(`/students/${row.id}`);
    } else if (action === "edit") {
      setEditingStudent(row);
      setShowModal(true);
    } else if (action === "delete") {
      handleDelete(row);
    } else if (action === "delete_photo") {
      handleDeletePhoto(row);
    }
  };

  const columns = [
    {
      header: "Photo",
      accessor: "photo",
      render: (row) => (
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold overflow-hidden">
          {row.photo ? (
            <img
              src={`${API_URL.replace("/api", "")}/uploads/${row.photo}`}
              alt={getFullName(row.first_name, row.last_name)}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitialsFromName(row.first_name, row.last_name)
          )}
        </div>
      ),
    },
    {
      header: "Student",
      accessor: "first_name",
      render: (row) => (
        <div>
          <p className="font-medium">
            {getFullName(row.first_name, row.last_name)}
          </p>
          <p className="text-xs text-gray-500">{row.student_id}</p>
        </div>
      ),
    },
    {
      header: "Class",
      accessor: "Class",
      render: (row) =>
        row.Class
          ? `${row.Class.name}${row.Section ? " - " + row.Section.name : ""}`
          : "-",
    },
    {
      header: "Gender",
      accessor: "gender",
      render: (row) => <span className="capitalize">{row.gender}</span>,
    },
    { header: "Phone", accessor: "phone", render: (row) => row.phone || "-" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={statusColor[row.status] || "badge-gray"}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Admission",
      accessor: "admission_date",
      render: (row) => formatDate(row.admission_date),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm">Manage all student records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="input pl-9"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingStudent(null);
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Student
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={students}
          loading={loading}
          actions={[
            {
              name: "view",
              icon: <Eye className="w-4 h-4" />,
              title: "View",
              color: "primary",
            },
            {
              name: "edit",
              icon: <Pencil className="w-4 h-4" />,
              title: "Edit",
              color: "primary",
            },
            {
              name: "delete_photo",
              icon: <ImagePlus className="w-4 h-4" />,
              title: "Delete Photo",
              color: "warning",
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

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {students.length} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button
                className="btn-outline"
                disabled={pagination.page <= 1}
                onClick={() => loadStudents({ page: pagination.page - 1 })}
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn-outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadStudents({ page: pagination.page + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? "Edit Student" : "Add New Student"}
        size="max-w-2xl"
      >
        <StudentForm
          initialData={editingStudent}
          classes={classes}
          onSubmit={editingStudent ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingStudent(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Students;
