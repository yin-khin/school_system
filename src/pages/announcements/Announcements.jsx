import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Megaphone, ImagePlus, X } from "lucide-react";
import { announcementAPI } from "../../api";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import { formatDate, statusColor } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AnnouncementForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "general",
    audience: initialData?.audience || "all",
    status: initialData?.status || "published",
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
        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Megaphone className="w-8 h-8 text-gray-400" />
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

      <div>
        <label className="label">Title *</label>
        <input
          type="text"
          name="title"
          className="input"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="label">Content *</label>
        <textarea
          name="content"
          className="input"
          rows="4"
          value={formData.content}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Type</label>
          <select
            name="type"
            className="input"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="exam">Exam</option>
            <option value="holiday">Holiday</option>
            <option value="event">Event</option>
            <option value="notice">Notice</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="label">Audience</label>
          <select
            name="audience"
            className="input"
            value={formData.audience}
            onChange={handleChange}
          >
            <option value="all">Everyone</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
            <option value="parents">Parents</option>
            <option value="staff">Staff</option>
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? "Update" : "Publish"}
        </button>
      </div>
    </form>
  );
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await announcementAPI.getAll({ limit: 100 });
      setAnnouncements(res.data.data);
    } catch (error) {
      console.error("Load announcements error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await announcementAPI.create(data);
      setShowModal(false);
      loadData();
      alert("Announcement published successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating announcement");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await announcementAPI.update(editingAnnouncement.id, data);
      setShowModal(false);
      setEditingAnnouncement(null);
      loadData();
      alert("Announcement updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating announcement");
    }
  };

  const handleDelete = async (announcement) => {
    if (
      window.confirm(
        `Are you sure you want to delete announcement "${announcement.title}"?`,
      )
    ) {
      try {
        await announcementAPI.delete(announcement.id);
        loadData();
        alert("Announcement deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting announcement");
      }
    }
  };

  const handleDeletePhoto = async (announcement) => {
    if (
      window.confirm(`Delete photo for announcement "${announcement.title}"?`)
    ) {
      try {
        await announcementAPI.deletePhoto(announcement.id);
        loadData();
        alert("Photo deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting photo");
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === "edit") {
      setEditingAnnouncement(row);
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
        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center overflow-hidden">
          {row.photo ? (
            <img
              src={`${API_URL.replace("/api", "")}/uploads/${row.photo}`}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Megaphone className="w-5 h-5" />
          )}
        </div>
      ),
    },
    {
      header: "Title",
      accessor: "title",
      render: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-gray-500 capitalize">{row.type}</p>
        </div>
      ),
    },
    {
      header: "Content",
      accessor: "content",
      render: (row) => (
        <span className="line-clamp-2 max-w-xs">{row.content}</span>
      ),
    },
    {
      header: "Audience",
      accessor: "audience",
      render: (row) => <span className="capitalize">{row.audience}</span>,
    },
    {
      header: "Published By",
      accessor: "User",
      render: (row) => row.User?.full_name || "-",
    },
    {
      header: "Date",
      accessor: "published_at",
      render: (row) => formatDate(row.published_at),
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
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm">
            Post and manage school announcements
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingAnnouncement(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> New Announcement
        </button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={announcements}
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
          setEditingAnnouncement(null);
        }}
        title={editingAnnouncement ? "Edit Announcement" : "New Announcement"}
      >
        <AnnouncementForm
          initialData={editingAnnouncement}
          onSubmit={editingAnnouncement ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setEditingAnnouncement(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Announcements;
