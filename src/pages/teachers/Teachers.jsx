import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import { teacherAPI } from "../../api";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import {
  formatDate,
  getFullName,
  statusColor,
  getInitialsFromName,
} from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TeacherForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    gender: initialData?.gender || "male",
    date_of_birth: initialData?.date_of_birth || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    qualification: initialData?.qualification || "",
    specialization: initialData?.specialization || "",
    joining_date: initialData?.joining_date || "",
    department: initialData?.department || "",
    salary: initialData?.salary || "",
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
          <label className="label">Gender</label>
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
          <label className="label">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            className="input"
            value={formData.date_of_birth}
            onChange={handleChange}
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
          <label className="label">Qualification</label>
          <input
            type="text"
            name="qualification"
            className="input"
            value={formData.qualification}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Specialization</label>
          <input
            type="text"
            name="specialization"
            className="input"
            value={formData.specialization}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Department</label>
          <input
            type="text"
            name="department"
            className="input"
            value={formData.department}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Joining Date</label>
          <input
            type="date"
            name="joining_date"
            className="input"
            value={formData.joining_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Salary</label>
          <input
            type="number"
            name="salary"
            className="input"
            value={formData.salary}
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
            <option value="resigned">Resigned</option>
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
      {!initialData && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="create_user"
            checked={formData.create_user}
            onChange={handleChange}
            className="rounded"
          />
          Create user account (username: email, default password: teacher123)
        </label>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? "Update Teacher" : "Add Teacher"}
        </button>
      </div>
    </form>
  );
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await teacherAPI.getAll({
        page: params.page || 1,
        limit: 10,
        search,
      });
      setTeachers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Load teachers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "" || e.target.value.length > 2) loadTeachers();
  };

  const handleCreate = async (data) => {
    try {
      await teacherAPI.create(data);
      setShowModal(false);
      loadTeachers();
      alert("Teacher created successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating teacher");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await teacherAPI.update(editingTeacher.id, data);
      setShowModal(false);
      setEditingTeacher(null);
      loadTeachers();
      alert("Teacher updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating teacher");
    }
  };

  const handleDelete = async (teacher) => {
    if (
      window.confirm(
        `Are you sure you want to delete teacher ${getFullName(teacher.first_name, teacher.last_name)}?`,
      )
    ) {
      try {
        await teacherAPI.delete(teacher.id);
        loadTeachers();
        alert("Teacher deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting teacher");
      }
    }
  };

  const handleDeletePhoto = async (teacher) => {
    if (
      window.confirm(
        `Delete photo for ${getFullName(teacher.first_name, teacher.last_name)}?`,
      )
    ) {
      try {
        await teacherAPI.deletePhoto(teacher.id);
        loadTeachers();
        alert("Photo deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting photo");
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === "edit") {
      setEditingTeacher(row);
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
        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold overflow-hidden">
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
      header: "Teacher",
      accessor: "first_name",
      render: (row) => (
        <div>
          <p className="font-medium">
            {getFullName(row.first_name, row.last_name)}
          </p>
          <p className="text-xs text-gray-500">{row.teacher_id}</p>
        </div>
      ),
    },
    {
      header: "Specialization",
      accessor: "specialization",
      render: (row) => row.specialization || "-",
    },
    {
      header: "Department",
      accessor: "department",
      render: (row) => row.department || "-",
    },
    { header: "Phone", accessor: "phone", render: (row) => row.phone || "-" },
    {
      header: "Qualification",
      accessor: "qualification",
      render: (row) => row.qualification || "-",
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={statusColor[row.status] || "badge-gray"}>
          {row.status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Joining",
      accessor: "joining_date",
      render: (row) => formatDate(row.joining_date),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 text-sm">Manage all teacher records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              className="input pl-9"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingTeacher(null);
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Teacher
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={teachers}
          loading={loading}
          actions={[
            {
              name: "edit",
              icon: <Pencil className="w-4 h-4" />,
              title: "Edit",
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
              Showing {teachers.length} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button
                className="btn-outline"
                disabled={pagination.page <= 1}
                onClick={() => loadTeachers({ page: pagination.page - 1 })}
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn-outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadTeachers({ page: pagination.page + 1 })}
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
          setEditingTeacher(null);
        }}
        title={editingTeacher ? "Edit Teacher" : "Add New Teacher"}
        size="max-w-2xl"
      >
        <TeacherForm
          initialData={editingTeacher}
          onSubmit={editingTeacher ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingTeacher(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Teachers;
