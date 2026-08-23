import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import { feeAPI, studentAPI } from '../../api';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { formatDate, formatCurrency, getFullName, statusColor, getInitialsFromName } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FeeForm = ({ initialData, students, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    student_id: initialData?.student_id || '',
    fee_type: initialData?.fee_type || 'tuition',
    amount: initialData?.amount || '',
    discount: initialData?.discount || 0,
    due_date: initialData?.due_date || '',
    description: initialData?.description || '',
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
          <label className="label">Student *</label>
          <select name="student_id" className="input" value={formData.student_id} onChange={handleChange} required>
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{getFullName(s.first_name, s.last_name)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fee Type *</label>
          <select name="fee_type" className="input" value={formData.fee_type} onChange={handleChange}>
            <option value="tuition">Tuition</option>
            <option value="registration">Registration</option>
            <option value="examination">Examination</option>
            <option value="transportation">Transportation</option>
            <option value="library">Library</option>
            <option value="uniform">Uniform</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Amount *</label>
          <input type="number" name="amount" className="input" value={formData.amount} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Discount</label>
          <input type="number" name="discount" className="input" value={formData.discount} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" name="due_date" className="input" value={formData.due_date} onChange={handleChange} />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" className="input" rows="2" value={formData.description} onChange={handleChange} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initialData ? 'Update Fee' : 'Create Fee'}</button>
      </div>
    </form>
  );
};

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [feesRes, studentsRes, summaryRes] = await Promise.all([
        feeAPI.getAll({ limit: 100 }),
        studentAPI.getAll({ limit: 100 }),
        feeAPI.getSummary()
      ]);
      setFees(feesRes.data.data);
      setStudents(studentsRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error('Load fees error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await feeAPI.create(data);
      setShowModal(false);
      loadData();
      alert('Fee created successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating fee');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await feeAPI.update(editingFee.id, data);
      setShowModal(false);
      setEditingFee(null);
      loadData();
      alert('Fee updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating fee');
    }
  };

  const handleDelete = async (fee) => {
    if (window.confirm(`Are you sure you want to delete fee invoice ${fee.invoice_no}?`)) {
      try {
        await feeAPI.delete(fee.id);
        loadData();
        alert('Fee deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting fee');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingFee(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: 'Invoice',
      accessor: 'invoice_no',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{row.invoice_no}</p>
            <p className="text-xs text-gray-500 capitalize">{row.fee_type} fee</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Student',
      accessor: 'Student',
      render: (row) => row.Student ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
            {row.Student.photo ? (
              <img src={`${API_URL.replace('/api', '')}/uploads/${row.Student.photo}`} alt={row.Student.first_name} className="w-full h-full object-cover" />
            ) : (
              getInitialsFromName(row.Student.first_name, row.Student.last_name)
            )}
          </div>
          <span>{getFullName(row.Student.first_name, row.Student.last_name)}</span>
        </div>
      ) : '-',
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <div>
          <p className="font-medium">{formatCurrency(row.amount)}</p>
          {row.discount > 0 && <p className="text-xs text-gray-500">-{formatCurrency(row.discount)} discount</p>}
        </div>
      ),
    },
    {
      header: 'Paid',
      accessor: 'paid_amount',
      render: (row) => <span className="text-green-600 font-medium">{formatCurrency(row.paid_amount)}</span>,
    },
    {
      header: 'Due',
      accessor: 'amount',
      render: (row) => {
        const due = (parseFloat(row.amount) - parseFloat(row.discount || 0) - parseFloat(row.paid_amount || 0));
        return <span className="font-medium">{formatCurrency(due)}</span>;
      },
    },
    { header: 'Due Date', accessor: 'due_date', render: (row) => formatDate(row.due_date) },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <span className={statusColor[row.status] || 'badge-gray'}>{row.status}</span>,
    },
  ];

  const summaryCards = [
    { title: 'Total Fees', value: formatCurrency(summary?.totalFees || 0), color: 'text-blue-600' },
    { title: 'Total Collected', value: formatCurrency(summary?.totalPaid || 0), color: 'text-green-600' },
    { title: 'Outstanding', value: formatCurrency(summary?.totalOutstanding || 0), color: 'text-red-600' },
    { title: 'Pending Invoices', value: summary?.pendingFees || 0, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 text-sm">Manage school fees and invoices</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingFee(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Create Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="card p-4">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className={`text-xl lg:text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={fees}
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
        onClose={() => { setShowModal(false); setEditingFee(null); }}
        title={editingFee ? 'Edit Fee Invoice' : 'Create New Invoice'}
      >
        <FeeForm
          initialData={editingFee}
          students={students}
          onSubmit={editingFee ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingFee(null); }}
        />
      </Modal>
    </div>
  );
};

export default Fees;