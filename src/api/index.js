import axios from './axios';

// Auth API
export const authAPI = {
  login: (data) => axios.post('/auth/login', data),
  getMe: () => axios.get('/auth/me'),
  logout: () => axios.post('/auth/logout'),
  changePassword: (data) => axios.put('/auth/change-password', data),
};

// Students API
export const studentAPI = {
  getAll: (params) => axios.get('/students', { params }),
  getById: (id) => axios.get(`/students/${id}`),
  create: (data) => axios.post('/students', data),
  update: (id, data) => axios.put(`/students/${id}`, data),
  delete: (id) => axios.delete(`/students/${id}`),
  deletePhoto: (id) => axios.delete(`/students/${id}/photo`),
  getByClass: (classId) => axios.get(`/students/class/${classId}`),
};

// Teachers API
export const teacherAPI = {
  getAll: (params) => axios.get('/teachers', { params }),
  getById: (id) => axios.get(`/teachers/${id}`),
  create: (data) => axios.post('/teachers', data),
  update: (id, data) => axios.put(`/teachers/${id}`, data),
  delete: (id) => axios.delete(`/teachers/${id}`),
  deletePhoto: (id) => axios.delete(`/teachers/${id}/photo`),
};

// Classes API
export const classAPI = {
  getAll: (params) => axios.get('/classes', { params }),
  getById: (id) => axios.get(`/classes/${id}`),
  create: (data) => axios.post('/classes', data),
  update: (id, data) => axios.put(`/classes/${id}`, data),
  delete: (id) => axios.delete(`/classes/${id}`),
  getSections: (id) => axios.get(`/classes/${id}/sections`),
  createSection: (id, data) => axios.post(`/classes/${id}/sections`, data),
  updateSection: (id, data) => axios.put(`/classes/sections/${id}`, data),
  deleteSection: (id) => axios.delete(`/classes/sections/${id}`),
};

// Subjects API
export const subjectAPI = {
  getAll: (params) => axios.get('/subjects', { params }),
  getById: (id) => axios.get(`/subjects/${id}`),
  create: (data) => axios.post('/subjects', data),
  update: (id, data) => axios.put(`/subjects/${id}`, data),
  delete: (id) => axios.delete(`/subjects/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => axios.get('/attendance', { params }),
  getByClassAndDate: (classId, date) => axios.get(`/attendance/class/${classId}/date/${date}`),
  create: (data) => axios.post('/attendance', data),
  update: (id, data) => axios.put(`/attendance/${id}`, data),
  delete: (id) => axios.delete(`/attendance/${id}`),
  getStudentReport: (studentId, params) => axios.get(`/attendance/student/${studentId}/report`, { params }),
};

// Exams API
export const examAPI = {
  getAll: (params) => axios.get('/exams', { params }),
  getById: (id) => axios.get(`/exams/${id}`),
  create: (data) => axios.post('/exams', data),
  update: (id, data) => axios.put(`/exams/${id}`, data),
  delete: (id) => axios.delete(`/exams/${id}`),
};

// Marks API
export const markAPI = {
  getAll: (params) => axios.get('/marks', { params }),
  getByExam: (examId) => axios.get(`/marks/exam/${examId}`),
  create: (data) => axios.post('/marks', data),
  update: (id, data) => axios.put(`/marks/${id}`, data),
  delete: (id) => axios.delete(`/marks/${id}`),
  getStudentResults: (studentId) => axios.get(`/marks/student/${studentId}/results`),
};

// Fees API
export const feeAPI = {
  getAll: (params) => axios.get('/fees', { params }),
  getById: (id) => axios.get(`/fees/${id}`),
  create: (data) => axios.post('/fees', data),
  update: (id, data) => axios.put(`/fees/${id}`, data),
  delete: (id) => axios.delete(`/fees/${id}`),
  getPayments: (params) => axios.get('/fees/payments', { params }),
  createPayment: (data) => axios.post('/fees/payments', data),
  getSummary: () => axios.get('/fees/summary'),
};

// Library API
export const libraryAPI = {
  getBooks: (params) => axios.get('/library/books', { params }),
  getBook: (id) => axios.get(`/library/books/${id}`),
  createBook: (data) => axios.post('/library/books', data),
  updateBook: (id, data) => axios.put(`/library/books/${id}`, data),
  deleteBook: (id) => axios.delete(`/library/books/${id}`),
  deleteBookPhoto: (id) => axios.delete(`/library/books/${id}/photo`),
  getTransactions: (params) => axios.get('/library/transactions', { params }),
  issueBook: (data) => axios.post('/library/transactions', data),
  returnBook: (id, data) => axios.put(`/library/transactions/${id}/return`, data),
  deleteTransaction: (id) => axios.delete(`/library/transactions/${id}`),
};

// Announcements API
export const announcementAPI = {
  getAll: (params) => axios.get('/announcements', { params }),
  getById: (id) => axios.get(`/announcements/${id}`),
  create: (data) => axios.post('/announcements', data),
  update: (id, data) => axios.put(`/announcements/${id}`, data),
  delete: (id) => axios.delete(`/announcements/${id}`),
  deletePhoto: (id) => axios.delete(`/announcements/${id}/photo`),
};

// Notifications API
export const notificationAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),
  markAllAsRead: () => axios.put('/notifications/read-all'),
  delete: (id) => axios.delete(`/notifications/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => axios.get('/dashboard/stats'),
  getEnrollment: () => axios.get('/dashboard/enrollment'),
  getAttendanceStats: (params) => axios.get('/dashboard/attendance-stats', { params }),
  getRevenue: (params) => axios.get('/dashboard/revenue', { params }),
  getClassDistribution: () => axios.get('/dashboard/class-distribution'),
  getRecentActivities: () => axios.get('/dashboard/recent-activities'),
};

// Users API
export const userAPI = {
  getAll: (params) => axios.get('/users', { params }),
  getById: (id) => axios.get(`/users/${id}`),
  create: (data) => axios.post('/users', data),
  update: (id, data) => axios.put(`/users/${id}`, data),
  delete: (id) => axios.delete(`/users/${id}`),
};

// Parents API
export const parentAPI = {
  getAll: (params) => axios.get('/parents', { params }),
  getById: (id) => axios.get(`/parents/${id}`),
  create: (data) => axios.post('/parents', data),
  update: (id, data) => axios.put(`/parents/${id}`, data),
  delete: (id) => axios.delete(`/parents/${id}`),
  deletePhoto: (id) => axios.delete(`/parents/${id}/photo`),
};

// Staff API
export const staffAPI = {
  getAll: (params) => axios.get('/staffs', { params }),
  getById: (id) => axios.get(`/staffs/${id}`),
  create: (data) => axios.post('/staffs', data),
  update: (id, data) => axios.put(`/staffs/${id}`, data),
  delete: (id) => axios.delete(`/staffs/${id}`),
  deletePhoto: (id) => axios.delete(`/staffs/${id}/photo`),
};

// Academic Years API
export const academicYearAPI = {
  getAll: () => axios.get('/academic-years'),
  getById: (id) => axios.get(`/academic-years/${id}`),
  create: (data) => axios.post('/academic-years', data),
  update: (id, data) => axios.put(`/academic-years/${id}`, data),
  delete: (id) => axios.delete(`/academic-years/${id}`),
};

// Timetables API
export const timetableAPI = {
  getAll: (params) => axios.get('/timetables', { params }),
  getById: (id) => axios.get(`/timetables/${id}`),
  create: (data) => axios.post('/timetables', data),
  update: (id, data) => axios.put(`/timetables/${id}`, data),
  delete: (id) => axios.delete(`/timetables/${id}`),
};

// Assignments API
export const assignmentAPI = {
  getAll: (params) => axios.get('/assignments', { params }),
  getById: (id) => axios.get(`/assignments/${id}`),
  create: (data) => axios.post('/assignments', data),
  update: (id, data) => axios.put(`/assignments/${id}`, data),
  delete: (id) => axios.delete(`/assignments/${id}`),
};

// Reports API
export const reportAPI = {
  getStudents: (params) => axios.get('/reports/students', { params }),
  getAttendance: (params) => axios.get('/reports/attendance', { params }),
  getFees: (params) => axios.get('/reports/fees', { params }),
  getAcademic: (params) => axios.get('/reports/academic', { params }),
  getTeachers: (params) => axios.get('/reports/teachers', { params }),
};

// Backup API
export const backupAPI = {
  exportData: () => axios.get('/backup/export'),
  importData: (data) => axios.post('/backup/import', data),
};
