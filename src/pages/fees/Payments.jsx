import { useEffect, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { feeAPI, studentAPI } from '../../api';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { formatDate, formatCurrency, getFullName, getInitialsFromName } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PaymentForm = ({ fees, students, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    fee_id: '',
    student_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    remark: '',
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
        <label className="label">Invoice</label>
        <select name="fee_id" className="input" value={formData.fee_id} onChange={handleChange} required>
          <option value="">Select Invoice</option>
          {fees.map((f) => (
            <option key={f.id} value={f.id}>
              {f.invoice_no} - {f.Student ? getFullName(f.Student.first_name, f.Student.last_name) : ''} - {formatCurrency(f.amount)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Student</label>
        <select name="student_id" className="input" value={formData.student_id} onChange={handleChange} required>
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{getFullName(s.first_name, s.last_name)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Amount *</label>
        <input type="number" name="amount" className="input" value={formData.amount} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Method</label>
          <select name="payment_method" className="input" value={formData.payment_method} onChange={handleChange}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div>
          <label className="label">Payment Date</label>
          <input type="date" name="payment_date" className="input" value={formData.payment_date} onChange={handleChange} />
        </div>
      </div>
      <div>
        <label className="label">Remark</label>
        <input type="text" name="remark" className="input" value={formData.remark} onChange={handleChange} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-success">Record Payment</button>
      </div>
    </form>
  );
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, feeRes, stuRes] = await Promise.all([
        feeAPI.getPayments({ limit: 100 }),
        feeAPI.getAll({ limit: 100 }),
        studentAPI.getAll({ limit: 100 })
      ]);
      setPayments(payRes.data.data);
      setFees(feeRes.data.data);
      setStudents(stuRes.data.data);
    } catch (error) {
      console.error('Load payments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await feeAPI.createPayment(data);
      setShowModal(false);
      loadData();
      alert('Payment recorded successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error recording payment');
    }
  };

  const columns = [
    {
      header: 'Receipt',
      accessor: 'receipt_no',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{row.receipt_no}</p>
            <p className="text-xs text-gray-500">{row.Fee?.invoice_no}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Student',
      accessor: 'Student',
      render: (row) => row.Student ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
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
      render: (row) => <span className="font-semibold text-green-600">{formatCurrency(row.amount)}</span>,
    },
    {
      header: 'Method',
      accessor: 'payment_method',
      render: (row) => <span className="capitalize">{row.payment_method.replace('_', ' ')}</span>,
    },
    { header: 'Date', accessor: 'payment_date', render: (row) => formatDate(row.payment_date) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm">Record and track fee payments</p>
        </div>
        <button className="btn-success" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Record Payment
        </button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={payments}
          loading={loading}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record New Payment"
      >
        <PaymentForm
          fees={fees}
          students={students}
          onSubmit={handleCreate}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Payments;