import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  const quickFill = (userEmail) => {
    setEmail(userEmail);
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-blue-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
            <GraduationCap className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">SchoolPro</h1>
          <p className="text-primary-200 mt-1">School Management System</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Login with your email and password</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Test Login Options */}
          {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-3 text-gray-700">🔑 Test Login (Click to fill):</p>
            <div className="space-y-2">
              <button
                onClick={() => quickFill('admin@school.com')}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <span className="font-semibold text-primary-600">Admin:</span>{' '}
                admin@school.com / admin123
              </button>
              <button
                onClick={() => { setEmail('test@school.com'); setPassword('test123'); setError(''); }}
                className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <span className="font-semibold text-green-600">Test User:</span>{' '}
                test@school.com / test123
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;