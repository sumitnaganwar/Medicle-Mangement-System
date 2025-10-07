import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, userService } from '../services/api';
import { useAuth } from '../common/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authService.login(form);
      // After login, fetch fresh profile from DB to ensure dynamic data
      if (data?.token) {
        try {
          const profile = await userService.getProfile();
          setAuth({ token: data.token, user: profile?.data || data.user || null });
        } catch {
          setAuth({ token: data.token, user: data.user || null });
        }
        // Navigate to dashboard after successful login
        navigate('/', { replace: true });
      }
    } catch (e) {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 className="my-4">Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit} className="card p-3">
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-control" value={form.email} onChange={onChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input name="password" type="password" className="form-control" value={form.password} onChange={onChange} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <div className="mt-3">
          <small>
            No account? <Link to="/register">Register</Link>
          </small>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;


