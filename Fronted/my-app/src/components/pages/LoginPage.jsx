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
      const response = await authService.login(form);
      const data = response.data;
      
      if (data?.token) {
        // Direct login successful
        authService.setToken(data.token);
        try {
          const profile = await userService.getProfile();
          // Store only essential user data to avoid localStorage quota issues
          const userData = profile?.data || data.user || null;
          const essentialUserData = userData ? {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          } : null;
          setAuth({ token: data.token, user: essentialUserData });
        } catch (profileError) {
          console.warn('Failed to fetch profile:', profileError);
          // Store only essential user data to avoid localStorage quota issues
          const userData = data.user || null;
          const essentialUserData = userData ? {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          } : null;
          setAuth({ token: data.token, user: essentialUserData });
        }
        navigate('/', { replace: true });
      } else {
        setError('Login failed: No token received from server');
      }
    } catch (e) {
      console.error('Login error:', e);
      const errorMessage = e?.response?.data?.message || e?.message || 'Invalid credentials. Please check your email and password.';
      setError(`Login failed: ${errorMessage}`);
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
                <div className="mt-3">
                  <small>
                    No account? <Link to="/register">Register</Link>
                  </small>
                </div>
                <div className="mt-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      authService.clearStorage();
                      alert('localStorage cleared! Storage size: ' + (authService.getStorageSize() / 1024).toFixed(2) + ' KB');
                    }}
                  >
                    Clear Storage ({Math.round(authService.getStorageSize() / 1024)} KB)
                  </button>
                </div>
      </form>
    </div>
  );
}

export default LoginPage;


