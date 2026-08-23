import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookMarked } from 'lucide-react';
import { assignmentAPI, classAPI, subjectAPI } from '../api';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { formatDate, statusColor } from '../utils/helpers';

const AssignmentForm = ({ initialData, classes, subjects, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    class_id: initialData?.class_id || '',
    subject_id: initialData?.subject_id || '',
    due_date: initialData?.due_date || '',
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
      <div>
        <label className="label">Title *</label>
        <input type="text" name="title" className="input" value={formData.title} onChange={handleChange} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" className="input" rows="3" value={formData.description} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Class</label>
          <select name="class_id" className="input" value={formData.class_id} onChange={handleChange} required>
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Subject</label>
          <select name="subject_id" className="input" value={formData.subject_id} onChange={handleChange} required>
            <option value="">Select Subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" name="due_date" className="input" value={formData.due_date} onChange={handleChange} required />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initialData ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
};

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asRes, clsRes, subRes] = await Promise.all([
        assignmentAPI.getAll({ limit: 100 }),
        classAPI.getAll({ limit: 100 }),
        subjectAPI.getAll({ limit: 100 })
      ]);
      setAssignments(asRes.data.data);
      setClasses(clsRes.data.data);
      setSubjects(subRes.data.data);
    } catch (error) {
      console.error('Load assignments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await assignmentAPI.create(data);
      setShowModal(false);
      loadData();
      alert('Assignment created successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating assignment');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await assignmentAPI.update(editingAssignment.id, data);
      setShowModal(false);
      setEditingAssignment(null);
      loadData();
      alert('Assignment updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating assignment');
    }
  };

  const handleDelete = async (assignment) => {
    if (window.confirm(`Are you sure you want to delete assignment "${assignment.title}"?`)) {
      try {
        await assignmentAPI.delete(assignment.id);
        loadData();
        alert('Assignment deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting assignment');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingAssignment(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: 'Assignment',
      accessor: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-gray-500">{row.Class?.name}</p>
          </div>
        </div>
      ),
    },
    { header: 'Subject', accessor: 'Subject', render: (row) => row.Subject?.name || '-' },
    { header: 'Teacher', accessor: 'Teacher', render: (row) => row.Teacher ? `${row.Teacher.first_name} ${row.Teacher.last_name}` : '-' },
    { header: 'Due Date', accessor: 'due_date', render: (row) => formatDate(row.due_date) },
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
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 text-sm">Create and manage homework assignments</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingAssignment(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Assignment
        </button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={assignments}
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
        onClose={() => { setShowModal(false); setEditingAssignment(null); }}
        title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}
      >
        <AssignmentForm
          initialData={editingAssignment}
          classes={classes}
          subjects={subjects}
          onSubmit={editingAssignment ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingAssignment(null); }}
        />
      </Modal>
    </div>
  );
};

export default Assignments;