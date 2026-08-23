import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import { staffAPI } from "../api";
import Modal from "../components/common/Modal";
import Table from "../components/common/Table";
import {
  formatDate,
  getFullName,
  statusColor,
  getInitialsFromName,
} from "../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StaffForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    gender: initialData?.gender || "male",
    position: initialData?.position || "",
    department: initialData?.department || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    joining_date: initialData?.joining_date || "",
    salary: initialData?.salary || "",
    status: initialData?.status || "active",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(
    initialData?.photo
      ? `${API_URL.replace("/api", "")}/uploads/${initialData.photo}`
      : null,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          <label className="label">Position *</label>
          <input
            type="text"
            name="position"
            className="input"
            value={formData.position}
            onChange={handleChange}
            required
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
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? "Update Staff" : "Add Staff"}
        </button>
      </div>
    </form>
  );
};

const Staff = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getAll({ limit: 100 });
      setStaffs(res.data.data);
    } catch (error) {
      console.error("Load staff error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await staffAPI.create(data);
      setShowModal(false);
      loadData();
      alert("Staff added successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error adding staff");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await staffAPI.update(editingStaff.id, data);
      setShowModal(false);
      setEditingStaff(null);
      loadData();
      alert("Staff updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating staff");
    }
  };

  const handleDelete = async (staff) => {
    if (
      window.confirm(
        `Are you sure you want to delete staff ${getFullName(staff.first_name, staff.last_name)}?`,
      )
    ) {
      try {
        await staffAPI.delete(staff.id);
        loadData();
        alert("Staff deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting staff");
      }
    }
  };

  const handleDeletePhoto = async (staff) => {
    if (
      window.confirm(
        `Delete photo for ${getFullName(staff.first_name, staff.last_name)}?`,
      )
    ) {
      try {
        await staffAPI.deletePhoto(staff.id);
        loadData();
        alert("Photo deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting photo");
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === "edit") {
      setEditingStaff(row);
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
      header: "Staff",
      accessor: "first_name",
      render: (row) => (
        <div>
          <p className="font-medium">
            {getFullName(row.first_name, row.last_name)}
          </p>
          <p className="text-xs text-gray-500">{row.staff_id}</p>
        </div>
      ),
    },
    {
      header: "Position",
      accessor: "position",
      render: (row) => row.position || "-",
    },
    {
      header: "Department",
      accessor: "department",
      render: (row) => row.department || "-",
    },
    { header: "Phone", accessor: "phone", render: (row) => row.phone || "-" },
    {
      header: "Joining",
      accessor: "joining_date",
      render: (row) => formatDate(row.joining_date),
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
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 text-sm">
            Manage non-teaching staff records
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingStaff(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Staff
        </button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={staffs}
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
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStaff(null);
        }}
        title={editingStaff ? "Edit Staff" : "Add New Staff"}
      >
        <StaffForm
          initialData={editingStaff}
          onSubmit={editingStaff ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingStaff(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Staff;
