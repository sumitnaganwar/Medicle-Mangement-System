import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../common/AuthContext';

function ProfilePage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth ? useAuth() : { isAuthenticated: false };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    avatarUrl: '',
  });

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = id ? await userService.getPublicProfile(id) : await userService.getProfile();
        if (!ignore) {
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            role: data.role || '',
            avatarUrl: data.avatarUrl || '',
          });
          setPreviewUrl(data.avatarUrl || '');
        }
      } catch (e) {
        if (!ignore) setError('Failed to load profile');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    if (id && !isAuthenticated) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await userService.updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      });
      setSuccess('Profile updated');
    } catch (e) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function onPickFile() {
    fileInputRef.current?.click();
  }

  async function onFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (id && !isAuthenticated) return;
    setError('');
    setSuccess('');
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    try {
      const { data } = await userService.uploadAvatar(file);
      setForm((f) => ({ ...f, avatarUrl: data.avatarUrl || f.avatarUrl }));
      // persist to local storage so other parts of app (e.g., header) get the latest avatar
      try {
        const u = JSON.parse(localStorage.getItem('auth_user') || 'null');
        if (u && data.avatarUrl) {
          u.avatarUrl = data.avatarUrl;
          localStorage.setItem('auth_user', JSON.stringify(u));
        }
      } catch {}
      setSuccess('Photo updated');
    } catch (err) {
      setError('Failed to upload photo');
      // revert preview if upload failed
      setPreviewUrl(form.avatarUrl);
    }
  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4">Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card p-3 d-flex align-items-center">
            <img
              src={previewUrl || form.avatarUrl || 'https://via.placeholder.com/160?text=Avatar'}
              alt="Avatar"
              style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover' }}
            />
            <button type="button" className="btn btn-primary mt-3" onClick={onPickFile} disabled={Boolean(id) && !isAuthenticated}>
              Change Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={onFileSelected}
            />
          </div>
        </div>

        <div className="col-12 col-md-8">
          <form onSubmit={onSave} className="card p-3">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input name="name" value={form.name} onChange={onChange} className="form-control" required disabled={Boolean(id) && !isAuthenticated} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input name="email" type="email" value={form.email} onChange={onChange} className="form-control" required disabled={Boolean(id) && !isAuthenticated} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} className="form-control" disabled={Boolean(id) && !isAuthenticated} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Role</label>
                <input value={form.role} readOnly className="form-control-plaintext" />
                <small className="text-muted">
                  {form.role === 'Owner' ? 'Owner: full administrative privileges' : form.role === 'Employee' ? 'Employee: limited operational access' : ''}
                </small>
              </div>
              <div className="col-md-12">
                <label className="form-label">Address</label>
                <textarea name="address" value={form.address} onChange={onChange} className="form-control" rows={3} disabled={Boolean(id) && !isAuthenticated} />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-success" type="submit" disabled={saving || (Boolean(id) && !isAuthenticated)}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;


