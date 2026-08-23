import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { subjectAPI, teacherAPI, classAPI } from '../../api';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { statusColor } from '../../utils/helpers';

const SubjectForm = ({ initialData, teachers, classes, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    teacher_id: initialData?.teacher_id || '',
    class_id: initialData?.class_id || '',
    credit: initialData?.credit || 1,
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
          <label className="label">Subject Name *</label>
          <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Subject Code *</label>
          <input type="text" name="code" className="input" value={formData.code} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Teacher</label>
          <select name="teacher_id" className="input" value={formData.teacher_id} onChange={handleChange}>
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Class</label>
          <select name="class_id" className="input" value={formData.class_id} onChange={handleChange}>
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Credits</label>
          <input type="number" name="credit" className="input" value={formData.credit} onChange={handleChange} />
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
        <button type="submit" className="btn-primary">{initialData ? 'Update Subject' : 'Add Subject'}</button>
      </div>
    </form>
  );
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, teachersRes, classesRes] = await Promise.all([
        subjectAPI.getAll({ limit: 100, search }),
        teacherAPI.getAll({ limit: 100 }),
        classAPI.getAll({ limit: 100 })
      ]);
      setSubjects(subjectsRes.data.data);
      setTeachers(teachersRes.data.data);
      setClasses(classesRes.data.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await subjectAPI.create(data);
      setShowModal(false);
      loadData();
      alert('Subject created successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating subject');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await subjectAPI.update(editingSubject.id, data);
      setShowModal(false);
      setEditingSubject(null);
      loadData();
      alert('Subject updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating subject');
    }
  };

  const handleDelete = async (subject) => {
    if (window.confirm(`Are you sure you want to delete subject ${subject.name}?`)) {
      try {
        await subjectAPI.delete(subject.id);
        loadData();
        alert('Subject deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting subject');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingSubject(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: 'Subject',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-gray-500">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Teacher',
      accessor: 'Teacher',
      render: (row) => row.Teacher ? `${row.Teacher.first_name} ${row.Teacher.last_name}` : '-',
    },
    {
      header: 'Class',
      accessor: 'Class',
      render: (row) => row.Class ? `${row.Class.name}` : '-',
    },
    { header: 'Credits', accessor: 'credit' },
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
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 text-sm">Manage all subject records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="input pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (e.target.value === '' || e.target.value.length > 2) loadData(); }}
            />
          </div>
          <button className="btn-primary" onClick={() => { setEditingSubject(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Subject
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={subjects}
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
        onClose={() => { setShowModal(false); setEditingSubject(null); }}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <SubjectForm
          initialData={editingSubject}
          teachers={teachers}
          classes={classes}
          onSubmit={editingSubject ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingSubject(null); }}
        />
      </Modal>
    </div>
  );
};

export default Subjects;