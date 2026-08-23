import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Phone, Mail, MapPin } from 'lucide-react';
import { studentAPI } from '../api';
import { formatDate, getFullName, statusColor, calculateAge } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getById(id);
      setStudent(res.data.data);
    } catch (error) {
      console.error('Load student error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!student) {
    return <div className="text-center py-8">Student not found</div>;
  }

  return (
    <div className="space-y-6">
      <button className="btn-secondary" onClick={() => navigate('/students')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Students
      </button>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
            {student.photo ? (
              <img src={`${API_URL.replace('/api', '')}/uploads/${student.photo}`} alt={student.first_name} className="w-full h-full object-cover" />
            ) : (
              `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{getFullName(student.first_name, student.last_name)}</h1>
            <p className="text-gray-500">{student.student_id}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={statusColor[student.status] || 'badge-gray'}>{student.status}</span>
              <span className="badge-info">{student.Class?.name || 'No Class'}</span>
              {student.Section && <span className="badge-gray">Section {student.Section.name}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Phone:</span>
              <span>{student.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Email:</span>
              <span>{student.email || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Address:</span>
              <span>{student.address || '-'}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Academic Information</h2>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-gray-600">Class:</span> <span>{student.Class?.name || '-'}</span></p>
            <p className="flex justify-between"><span className="text-gray-600">Section:</span> <span>{student.Section?.name || '-'}</span></p>
            <p className="flex justify-between"><span className="text-gray-600">Roll Number:</span> <span>{student.roll_number || '-'}</span></p>
            <p className="flex justify-between"><span className="text-gray-600">Admission Date:</span> <span>{formatDate(student.admission_date)}</span></p>
            <p className="flex justify-between"><span className="text-gray-600">Date of Birth:</span> <span>{formatDate(student.date_of_birth)} ({calculateAge(student.date_of_birth)})</span></p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Emergency Contact</h2>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-gray-600">Name:</span> <span>{student.emergency_contact || '-'}</span></p>
            <p className="flex justify-between"><span className="text-gray-600">Phone:</span> <span>{student.emergency_phone || '-'}</span></p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Other Information</h2>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-gray-600">Gender:</span> <span className="capitalize">{student.gender}</span></p>
            <p className="flex justify-between"><span className="text-gray-600">Blood Group:</span> <span>{student.blood_group || '-'}</span></p>
            <p className="flex justify-between"><span className="text-gray-600">Parent:</span>
              <span>{student.Parent ? getFullName(student.Parent.first_name, student.Parent.last_name) : '-'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;