import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())             return 'Name is required.';
    if (!form.email.includes('@'))     return 'Enter a valid email.';
    if (form.password.length < 6)      return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return setError(err);
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password
      });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'John Doe' },
    { name: 'email',    label: 'Email',            type: 'email',    placeholder: 'you@example.com' },
    { name: 'password', label: 'Password',         type: 'password', placeholder: '••••••••' },
    { name: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-4xl mb-2">🔺</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Start comparing AI models for free</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {f.label}
              </label>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="input-field"
              />
            </div>
          ))}
        </div>

        {/* Password strength hint */}
        {form.password && (
          <div className="flex gap-1.5 -mt-2">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                form.password.length >= i * 3
                  ? i <= 1 ? 'bg-red-400'
                  : i <= 2 ? 'bg-yellow-400'
                  : i <= 3 ? 'bg-blue-400'
                  : 'bg-green-400'
                : 'bg-gray-200 dark:bg-gray-700'
              }`}/>
            ))}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}