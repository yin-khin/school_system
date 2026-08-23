import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, School } from 'lucide-react';
import { classAPI, teacherAPI } from '../../api';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { statusColor } from '../../utils/helpers';

const ClassForm = ({ initialData, teachers, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    class_teacher_id: initialData?.class_teacher_id || '',
    room: initialData?.room || '',
    capacity: initialData?.capacity || 40,
    description: initialData?.description || '',
    status: initialData?.status || 'active',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Class Name *</label>
          <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Class Code *</label>
          <input type="text" name="code" className="input" value={formData.code} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Class Teacher</label>
          <select name="class_teacher_id" className="input" value={formData.class_teacher_id} onChange={handleChange}>
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Room</label>
          <input type="text" name="room" className="input" value={formData.room} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Capacity</label>
          <input type="number" name="capacity" className="input" value={formData.capacity} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" className="input" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" className="input" rows="2" value={formData.description} onChange={handleChange} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initialData ? 'Update Class' : 'Add Class'}</button>
      </div>
    </form>
  );
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await classAPI.getAll({ limit: 100, search });
      setClasses(res.data.data);
    } catch (error) {
      console.error('Load classes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await teacherAPI.getAll({ limit: 100 });
      setTeachers(res.data.data);
    } catch (error) {
      console.error('Load teachers error:', error);
    }
  };

  const handleCreate = async (data) => {
    try {
      await classAPI.create(data);
      setShowModal(false);
      loadClasses();
      alert('Class created successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating class');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await classAPI.update(editingClass.id, data);
      setShowModal(false);
      setEditingClass(null);
      loadClasses();
      alert('Class updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating class');
    }
  };

  const handleDelete = async (classData) => {
    if (window.confirm(`Are you sure you want to delete class ${classData.name}?`)) {
      try {
        await classAPI.delete(classData.id);
        loadClasses();
        alert('Class deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting class');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingClass(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: 'Class',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-gray-500">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Class Teacher',
      accessor: 'Teacher',
      render: (row) => row.Teacher ? `${row.Teacher.first_name} ${row.Teacher.last_name}` : '-',
    },
    { header: 'Room', accessor: 'room', render: (row) => row.room || '-' },
    {
      header: 'Students',
      accessor: 'Students',
      render: (row) => row.Students ? row.Students.length : 0,
    },
    { header: 'Capacity', accessor: 'capacity' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <span className={statusColor[row.status] || 'badge-gray'}>{row.status}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 text-sm">Manage all class records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              className="input pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value === '' || e.target.value.length > 2) loadClasses(); }}
            />
          </div>
          <button className="btn-primary" onClick={() => { setEditingClass(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Class
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={classes}
          loading={loading}
          actions={[
            { name: 'edit', icon: <Pencil className="w-4 h-4" />, title: 'Edit' },
            { name: 'delete', icon: <Trash2 className="w-4 h-4" />, title: 'Delete', color: 'danger' },
          ]}
          onAction={handleAction}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingClass(null); }}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
      >
        <ClassForm
          initialData={editingClass}
          teachers={teachers}
          onSubmit={editingClass ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingClass(null); }}
        />
      </Modal>
    </div>
  );
};

export default Classes;