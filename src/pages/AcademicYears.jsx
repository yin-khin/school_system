import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { academicYearAPI } from '../api';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { formatDate, statusColor } from '../utils/helpers';

const AcademicYearForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    is_current: initialData?.is_current || false,
    status: initialData?.status || 'active',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Year Name *</label>
        <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required placeholder="e.g. 2026-2027" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date</label>
          <input type="date" name="start_date" className="input" value={formData.start_date} onChange={handleChange} />
        </div>
        <div>
          <label className="label">End Date</label>
          <input type="date" name="end_date" className="input" value={formData.end_date} onChange={handleChange} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select name="status" className="input" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="is_current" checked={formData.is_current} onChange={handleChange} className="rounded" />
            Set as current year
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initialData ? 'Update Year' : 'Add Year'}</button>
      </div>
    </form>
  );
};

const AcademicYears = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await academicYearAPI.getAll();
      setYears(res.data.data);
    } catch (error) {
      console.error('Load academic years error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await academicYearAPI.create(data);
      setShowModal(false);
      loadData();
      alert('Academic year added successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding academic year');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await academicYearAPI.update(editingYear.id, data);
      setShowModal(false);
      setEditingYear(null);
      loadData();
      alert('Academic year updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating academic year');
    }
  };

  const handleDelete = async (year) => {
    if (window.confirm(`Are you sure you want to delete academic year ${year.name}?`)) {
      try {
        await academicYearAPI.delete(year.id);
        loadData();
        alert('Academic year deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting academic year');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingYear(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: 'Year',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            {row.is_current && <span className="badge-success ml-1">Current</span>}
          </div>
        </div>
      ),
    },
    { header: 'Start', accessor: 'start_date', render: (row) => formatDate(row.start_date) },
    { header: 'End', accessor: 'end_date', render: (row) => formatDate(row.end_date) },
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
          <h1 className="text-2xl font-bold text-gray-900">Academic Years</h1>
          <p className="text-gray-500 text-sm">Manage school academic years</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingYear(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Year
        </button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={years}
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
        onClose={() => { setShowModal(false); setEditingYear(null); }}
        title={editingYear ? 'Edit Academic Year' : 'Add New Academic Year'}
      >
        <AcademicYearForm
          initialData={editingYear}
          onSubmit={editingYear ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingYear(null); }}
        />
      </Modal>
    </div>
  );
};

export default AcademicYears;