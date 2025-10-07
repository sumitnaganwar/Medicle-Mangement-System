import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../common/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'Employee', avatarUrl: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setForm((f) => ({ ...f, avatarUrl: base64 }));
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!form.avatarUrl) {
        setError('Photo is required');
        setLoading(false);
        return;
      }
      const { data } = await authService.register(form);
      if (data?.token) {
        setAuth({ token: data.token, user: data.user });
      }
      navigate('/');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h2 className="my-4">Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit} className="card p-3">
        <div className="mb-3">
          <label className="form-label">Photo</label>
          <input name="photo" type="file" accept="image/*" className="form-control" onChange={onFileChange} required />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input name="name" className="form-control" value={form.name} onChange={onChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-control" value={form.email} onChange={onChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input name="password" type="password" className="form-control" value={form.password} onChange={onChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea name="address" className="form-control" rows={3} value={form.address} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" value={form.role} onChange={onChange} required>
            <option value="Owner">Owner</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
        <button className="btn btn-success" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <div className="mt-3">
          <small>
            Already have an account? <Link to="/login">Login</Link>
          </small>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;


