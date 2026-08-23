import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { userAPI } from '../api';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { statusColor, getInitials } from '../utils/helpers';

const UserForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: initialData ? '' : 'password123',
    role: initialData?.role || 'staff',
    full_name: initialData?.full_name || '',
    phone: initialData?.phone || '',
    status: initialData?.status || 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (initialData && !data.password) delete data.password;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input type="text" name="full_name" className="input" value={formData.full_name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Username *</label>
          <input type="text" name="username" className="input" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} required />
        </div>
        {!initialData && (
          <div>
            <label className="label">Password *</label>
            <input type="password" name="password" className="input" value={formData.password} onChange={handleChange} required />
          </div>
        )}
        <div>
          <label className="label">Role</label>
          <select name="role" className="input" value={formData.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="principal">Principal</option>
            <option value="teacher">Teacher</option>
            <option value="accountant">Accountant</option>
            <option value="librarian">Librarian</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="label">Phone</label>
          <input type="text" name="phone" className="input" value={formData.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" className="input" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initialData ? 'Update User' : 'Create User'}</button>
      </div>
    </form>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ limit: 100 });
      setUsers(res.data.data);
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await userAPI.create(data);
      setShowModal(false);
      loadData();
      alert('User created successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await userAPI.update(editingUser.id, data);
      setShowModal(false);
      setEditingUser(null);
      loadData();
      alert('User updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.full_name}?`)) {
      try {
        await userAPI.delete(user.id);
        loadData();
        alert('User deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingUser(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'full_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold flex-shrink-0">
            {getInitials(row.full_name)}
          </div>
          <div>
            <p className="font-medium">{row.full_name}</p>
            <p className="text-xs text-gray-500">@{row.username}</p>
          </div>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => <span className="badge-info capitalize">{row.role.replace('_', ' ')}</span>,
    },
    { header: 'Phone', accessor: 'phone', render: (row) => row.phone || '-' },
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">Manage system users and accounts</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add User
        </button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={users}
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
        onClose={() => { setShowModal(false); setEditingUser(null); }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm
          initialData={editingUser}
          onSubmit={editingUser ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
        />
      </Modal>
    </div>
  );
};

export default Users;