import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import { parentAPI } from "../api";
import Modal from "../components/common/Modal";
import Table from "../components/common/Table";
import {
  getFullName,
  statusColor,
  getInitialsFromName,
} from "../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ParentForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    relationship: initialData?.relationship || "father",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    occupation: initialData?.occupation || "",
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
          <label className="label">Relationship</label>
          <select
            name="relationship"
            className="input"
            value={formData.relationship}
            onChange={handleChange}
          >
            <option value="father">Father</option>
            <option value="mother">Mother</option>
            <option value="guardian">Guardian</option>
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
          <label className="label">Occupation</label>
          <input
            type="text"
            name="occupation"
            className="input"
            value={formData.occupation}
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
          {initialData ? "Update Parent" : "Add Parent"}
        </button>
      </div>
    </form>
  );
};

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await parentAPI.getAll({ limit: 100 });
      setParents(res.data.data);
    } catch (error) {
      console.error("Load parents error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await parentAPI.create(data);
      setShowModal(false);
      loadData();
      alert("Parent added successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error adding parent");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await parentAPI.update(editingParent.id, data);
      setShowModal(false);
      setEditingParent(null);
      loadData();
      alert("Parent updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating parent");
    }
  };

  const handleDelete = async (parent) => {
    if (
      window.confirm(
        `Are you sure you want to delete parent ${getFullName(parent.first_name, parent.last_name)}?`,
      )
    ) {
      try {
        await parentAPI.delete(parent.id);
        loadData();
        alert("Parent deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting parent");
      }
    }
  };

  const handleDeletePhoto = async (parent) => {
    if (
      window.confirm(
        `Delete photo for ${getFullName(parent.first_name, parent.last_name)}?`,
      )
    ) {
      try {
        await parentAPI.deletePhoto(parent.id);
        loadData();
        alert("Photo deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting photo");
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === "edit") {
      setEditingParent(row);
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
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-semibold overflow-hidden">
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
      header: "Parent",
      accessor: "first_name",
      render: (row) => (
        <div>
          <p className="font-medium">
            {getFullName(row.first_name, row.last_name)}
          </p>
          <p className="text-xs text-gray-500 capitalize">{row.relationship}</p>
        </div>
      ),
    },
    { header: "Phone", accessor: "phone", render: (row) => row.phone || "-" },
    { header: "Email", accessor: "email", render: (row) => row.email || "-" },
    {
      header: "Occupation",
      accessor: "occupation",
      render: (row) => row.occupation || "-",
    },
    {
      header: "Children",
      accessor: "Students",
      render: (row) => (row.Students ? row.Students.length : 0),
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
          <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
          <p className="text-gray-500 text-sm">
            Manage parent and guardian records
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingParent(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Parent
        </button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={parents}
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
          setEditingParent(null);
        }}
        title={editingParent ? "Edit Parent" : "Add New Parent"}
      >
        <ParentForm
          initialData={editingParent}
          onSubmit={editingParent ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingParent(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Parents;
