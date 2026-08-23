export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatTime = (time) => {
  if (!time) return '-';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

export const getInitialsFromName = (first, last) => {
  const name = `${first || ''} ${last || ''}`.trim();
  return getInitials(name);
};

export const calculateAge = (dob) => {
  if (!dob) return '-';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const getFullName = (first, last) => {
  return `${first || ''} ${last || ''}`.trim();
};

export const statusColor = {
  active: 'badge-success',
  inactive: 'badge-gray',
  graduated: 'badge-info',
  transferred: 'badge-warning',
  suspended: 'badge-danger',
  present: 'badge-success',
  absent: 'badge-danger',
  late: 'badge-warning',
  excused: 'badge-info',
  paid: 'badge-success',
  pending: 'badge-warning',
  partial: 'badge-info',
  overdue: 'badge-danger',
  cancelled: 'badge-gray',
  scheduled: 'badge-info',
  ongoing: 'badge-warning',
  published: 'badge-success',
  draft: 'badge-gray',
  archived: 'badge-gray',
  issued: 'badge-info',
  returned: 'badge-success',
  lost: 'badge-danger',
  active: 'badge-success',
  on_leave: 'badge-warning',
  resigned: 'badge-gray',
};