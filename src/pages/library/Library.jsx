import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookMarked, RotateCcw, ImagePlus, X } from 'lucide-react';
import { libraryAPI, studentAPI } from '../../api';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { formatDate, getFullName, statusColor } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BookForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    isbn: initialData?.isbn || '',
    title: initialData?.title || '',
    author: initialData?.author || '',
    category: initialData?.category || '',
    publisher: initialData?.publisher || '',
    quantity: initialData?.quantity || 1,
    location: initialData?.location || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo ? `${API_URL.replace('/api', '')}/uploads/${initialData.photo}` : null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });
    if (photoFile) {
      formDataObj.append('photo', photoFile);
    }
    onSubmit(formDataObj);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <BookMarked className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="btn-outline cursor-pointer text-sm">
            <ImagePlus className="w-4 h-4 mr-1 inline" /> {photoPreview ? 'Change Photo' : 'Upload Photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
          {photoPreview && (
            <button type="button" className="text-red-600 text-sm flex items-center gap-1" onClick={handleRemovePhoto}>
              <X className="w-4 h-4" /> Remove Photo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Title *</label>
          <input type="text" name="title" className="input" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Author *</label>
          <input type="text" name="author" className="input" value={formData.author} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">ISBN</label>
          <input type="text" name="isbn" className="input" value={formData.isbn} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Category</label>
          <input type="text" name="category" className="input" value={formData.category} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Publisher</label>
          <input type="text" name="publisher" className="input" value={formData.publisher} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Quantity</label>
          <input type="number" name="quantity" className="input" value={formData.quantity} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Location</label>
          <input type="text" name="location" className="input" value={formData.location} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initialData ? 'Update Book' : 'Add Book'}</button>
      </div>
    </form>
  );
};

const IssueForm = ({ books, students, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    book_id: '',
    student_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
        <label className="label">Book *</label>
        <select name="book_id" className="input" value={formData.book_id} onChange={handleChange} required>
          <option value="">Select Book</option>
          {books.filter(b => b.available > 0).map((b) => (
            <option key={b.id} value={b.id}>{b.title} ({b.book_id})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Student *</label>
        <select name="student_id" className="input" value={formData.student_id} onChange={handleChange} required>
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{getFullName(s.first_name, s.last_name)}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Issue Date</label>
          <input type="date" name="issue_date" className="input" value={formData.issue_date} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" name="due_date" className="input" value={formData.due_date} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">Issue Book</button>
      </div>
    </form>
  );
};

const Library = () => {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, transRes, studentsRes] = await Promise.all([
        libraryAPI.getBooks({ limit: 100 }),
        libraryAPI.getTransactions({ limit: 100 }),
        studentAPI.getAll({ limit: 100 })
      ]);
      setBooks(booksRes.data.data);
      setTransactions(transRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (error) {
      console.error('Load library error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (data) => {
    try {
      await libraryAPI.createBook(data);
      setShowBookModal(false);
      loadData();
      alert('Book added successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding book');
    }
  };

  const handleUpdateBook = async (data) => {
    try {
      await libraryAPI.updateBook(editingBook.id, data);
      setShowBookModal(false);
      setEditingBook(null);
      loadData();
      alert('Book updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating book');
    }
  };

  const handleDeleteBook = async (book) => {
    if (window.confirm(`Are you sure you want to delete book ${book.title}?`)) {
      try {
        await libraryAPI.deleteBook(book.id);
        loadData();
        alert('Book deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting book');
      }
    }
  };

  const handleDeleteBookPhoto = async (book) => {
    if (window.confirm(`Delete photo for book "${book.title}"?`)) {
      try {
        await libraryAPI.deleteBookPhoto(book.id);
        loadData();
        alert('Photo deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting photo');
      }
    }
  };

  const handleIssueBook = async (data) => {
    try {
      await libraryAPI.issueBook(data);
      setShowIssueModal(false);
      loadData();
      alert('Book issued successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error issuing book');
    }
  };

  const handleReturnBook = async (transaction) => {
    if (window.confirm('Confirm book return?')) {
      try {
        await libraryAPI.returnBook(transaction.id, { return_date: new Date().toISOString().split('T')[0] });
        loadData();
        alert('Book returned successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error returning book');
      }
    }
  };

  const bookColumns = [
    {
      header: 'Book',
      accessor: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {row.photo ? (
              <img src={`${API_URL.replace('/api', '')}/uploads/${row.photo}`} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <BookMarked className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-gray-500">{row.author}</p>
          </div>
        </div>
      ),
    },
    { header: 'ISBN', accessor: 'isbn', render: (row) => row.isbn || '-' },
    { header: 'Category', accessor: 'category', render: (row) => row.category || '-' },
    { header: 'Quantity', accessor: 'quantity' },
    {
      header: 'Available',
      accessor: 'available',
      render: (row) => <span className="text-green-600 font-medium">{row.available}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <span className={statusColor[row.status] || 'badge-gray'}>{row.status}</span>,
    },
  ];

  const transColumns = [
    {
      header: 'Book',
      accessor: 'Book',
      render: (row) => row.Book ? row.Book.title : '-',
    },
    {
      header: 'Student',
      accessor: 'Student',
      render: (row) => row.Student ? getFullName(row.Student.first_name, row.Student.last_name) : '-',
    },
    { header: 'Issue Date', accessor: 'issue_date', render: (row) => formatDate(row.issue_date) },
    { header: 'Due Date', accessor: 'due_date', render: (row) => formatDate(row.due_date) },
    { header: 'Return Date', accessor: 'return_date', render: (row) => row.return_date ? formatDate(row.return_date) : '-' },
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
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 text-sm">Manage books and borrowing</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-success" onClick={() => setShowIssueModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Issue Book
          </button>
          <button className="btn-primary" onClick={() => { setEditingBook(null); setShowBookModal(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Book
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'books' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('books')}
        >
          Books ({books.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions ({transactions.length})
        </button>
      </div>

      {activeTab === 'books' ? (
        <div className="card overflow-hidden">
          <Table
            columns={bookColumns}
            data={books}
            loading={loading}
            actions={[
              { name: 'edit', icon: <Pencil className="w-4 h-4" />, title: 'Edit' },
              { name: 'delete_photo', icon: <ImagePlus className="w-4 h-4" />, title: 'Delete Photo', color: 'warning' },
              { name: 'delete', icon: <Trash2 className="w-4 h-4" />, title: 'Delete', color: 'danger' },
            ]}
            onAction={(action, row) => {
              if (action === 'edit') {
                setEditingBook(row);
                setShowBookModal(true);
              } else if (action === 'delete') {
                handleDeleteBook(row);
              } else if (action === 'delete_photo') {
                handleDeleteBookPhoto(row);
              }
            }}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <Table
            columns={transColumns}
            data={transactions}
            loading={loading}
            actions={[
              { name: 'return', icon: <RotateCcw className="w-4 h-4" />, title: 'Return Book', color: 'success' },
            ]}
            onAction={(action, row) => {
              if (action === 'return' && row.status === 'issued') {
                handleReturnBook(row);
              }
            }}
          />
        </div>
      )}

      <Modal
        isOpen={showBookModal}
        onClose={() => { setShowBookModal(false); setEditingBook(null); }}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
      >
        <BookForm
          initialData={editingBook}
          onSubmit={editingBook ? handleUpdateBook : handleCreateBook}
          onClose={() => { setShowBookModal(false); setEditingBook(null); }}
        />
      </Modal>

      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Issue Book to Student"
      >
        <IssueForm
          books={books}
          students={students}
          onSubmit={handleIssueBook}
          onClose={() => setShowIssueModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Library;