import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Table from './Table';

const PageBuilder = ({ title, subtitle, api, columns, formComponent, formTitle, modalSize }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await api.getAll({ page, limit: 10, search: searchTerm });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(`Load ${title.toLowerCase()} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === '' || e.target.value.length > 2) {
      loadData(1, e.target.value);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await api.create(formData);
      setShowModal(false);
      loadData();
      alert(`${title.slice(0, -1)} created successfully`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating record');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.update(editingItem.id, formData);
      setShowModal(false);
      setEditingItem(null);
      loadData();
      alert(`${title.slice(0, -1)} updated successfully`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating record');
    }
  };

  const handleDelete = async (item) => {
    const name = item.name || item.title || item.full_name || item.username || item.invoice_no || item.id;
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(item.id);
        loadData();
        alert('Record deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingItem(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const FormComponent = formComponent;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              className="input pl-9"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button className="btn-primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add {title.slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          actions={[
            { name: 'edit', icon: <Pencil className="w-4 h-4" />, title: 'Edit' },
            { name: 'delete', icon: <Trash2 className="w-4 h-4" />, title: 'Delete', color: 'danger' },
          ]}
          onAction={handleAction}
        />
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {data.length} of {pagination.total}</p>
            <div className="flex gap-1">
              <button className="btn-outline" disabled={pagination.page <= 1} onClick={() => loadData(pagination.page - 1)}>Previous</button>
              <span className="px-3 py-2 text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
              <button className="btn-outline" disabled={pagination.page >= pagination.totalPages} onClick={() => loadData(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); }}
        title={editingItem ? `Edit ${title.slice(0, -1)}` : `Add New ${title.slice(0, -1)}`}
        size={modalSize}
      >
        <FormComponent
          initialData={editingItem}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
        />
      </Modal>
    </div>
  );
};

export default PageBuilder;