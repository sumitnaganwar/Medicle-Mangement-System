import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, userService } from '../services/api';
import { useAuth } from '../common/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'otp'
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
      if (data?.otpSessionId) {
        setOtpSessionId(data.otpSessionId);
        setStep('otp');
      } else if (data?.token) {
        // fallback if backend returns token directly
        try {
          const profile = await userService.getProfile();
          setAuth({ token: data.token, user: profile?.data || data.user || null });
        } catch {
          setAuth({ token: data.token, user: data.user || null });
        }
        navigate('/', { replace: true });
      }
    } catch (e) {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authService.verifyOtp(otpSessionId, otp);
      if (data?.token) {
        try {
          const profile = await userService.getProfile();
          setAuth({ token: data.token, user: profile?.data || data.user || null });
        } catch {
          setAuth({ token: data.token, user: data.user || null });
        }
        navigate('/', { replace: true });
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Invalid or expired OTP';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 className="my-4">{step === 'login' ? 'Login' : 'Verify OTP'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {step === 'login' ? (
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
            {loading ? 'Sending OTP...' : 'Login'}
          </button>
          <div className="mt-3">
            <small>
              No account? <Link to="/register">Register</Link>
            </small>
          </div>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="card p-3">
          <div className="mb-3">
            <label className="form-label">Enter OTP sent to your email</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} className="form-control" placeholder="6-digit code" maxLength={6} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button type="button" className="btn btn-link" onClick={() => setStep('login')}>
            Back
          </button>
        </form>
      )}
    </div>
  );
}

export default LoginPage;


