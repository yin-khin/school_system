import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { timetableAPI, classAPI, subjectAPI, teacherAPI } from '../api';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { getInitialsFromName } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TimetableForm = ({ initialData, classes, subjects, teachers, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    class_id: initialData?.class_id || '',
    subject_id: initialData?.subject_id || '',
    teacher_id: initialData?.teacher_id || '',
    day_of_week: initialData?.day_of_week || 'monday',
    start_time: initialData?.start_time || '08:00',
    end_time: initialData?.end_time || '09:00',
    room: initialData?.room || '',
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
          <label className="label">Teacher</label>
          <select name="teacher_id" className="input" value={formData.teacher_id} onChange={handleChange} required>
            <option value="">Select Teacher</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Day</label>
          <select name="day_of_week" className="input" value={formData.day_of_week} onChange={handleChange}>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
          </select>
        </div>
        <div>
          <label className="label">Start Time</label>
          <input type="time" name="start_time" className="input" value={formData.start_time} onChange={handleChange} />
        </div>
        <div>
          <label className="label">End Time</label>
          <input type="time" name="end_time" className="input" value={formData.end_time} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Room</label>
          <input type="text" name="room" className="input" value={formData.room} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initialData ? 'Update' : 'Add'}</button>
      </div>
    </form>
  );
};

const Timetables = () => {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [dayFilter, setDayFilter] = useState('');

  useEffect(() => { loadData(); }, [dayFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ttRes, clsRes, subRes, tchRes] = await Promise.all([
        timetableAPI.getAll({ day_of_week: dayFilter || undefined }),
        classAPI.getAll({ limit: 100 }),
        subjectAPI.getAll({ limit: 100 }),
        teacherAPI.getAll({ limit: 100 })
      ]);
      setTimetables(ttRes.data.data);
      setClasses(clsRes.data.data);
      setSubjects(subRes.data.data);
      setTeachers(tchRes.data.data);
    } catch (error) {
      console.error('Load timetables error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await timetableAPI.create(data);
      setShowModal(false);
      loadData();
      alert('Timetable added successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding timetable');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await timetableAPI.update(editingTimetable.id, data);
      setShowModal(false);
      setEditingTimetable(null);
      loadData();
      alert('Timetable updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating timetable');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await timetableAPI.delete(item.id);
        loadData();
        alert('Timetable deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting timetable');
      }
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setEditingTimetable(row);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDelete(row);
    }
  };

  const columns = [
    {
      header: 'Day',
      accessor: 'day_of_week',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <span className="font-medium capitalize">{row.day_of_week}</span>
        </div>
      ),
    },
    { header: 'Class', accessor: 'Class', render: (row) => row.Class?.name || '-' },
    { header: 'Subject', accessor: 'Subject', render: (row) => row.Subject?.name || '-' },
    {
      header: 'Teacher',
      accessor: 'Teacher',
      render: (row) => row.Teacher ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
            {row.Teacher.photo ? (
              <img src={`${API_URL.replace('/api', '')}/uploads/${row.Teacher.photo}`} alt={row.Teacher.first_name} className="w-full h-full object-cover" />
            ) : (
              getInitialsFromName(row.Teacher.first_name, row.Teacher.last_name)
            )}
          </div>
          <span>{row.Teacher.first_name} {row.Teacher.last_name}</span>
        </div>
      ) : '-',
    },
    { header: 'Time', accessor: 'start_time', render: (row) => `${row.start_time} - ${row.end_time}` },
    { header: 'Room', accessor: 'room', render: (row) => row.room || '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetables</h1>
          <p className="text-gray-500 text-sm">Manage class schedules</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-40" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
            <option value="">All Days</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
          </select>
          <button className="btn-primary" onClick={() => { setEditingTimetable(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Schedule
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={timetables}
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
        onClose={() => { setShowModal(false); setEditingTimetable(null); }}
        title={editingTimetable ? 'Edit Timetable' : 'Add Timetable Entry'}
      >
        <TimetableForm
          initialData={editingTimetable}
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          onSubmit={editingTimetable ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingTimetable(null); }}
        />
      </Modal>
    </div>
  );
};

export default Timetables;