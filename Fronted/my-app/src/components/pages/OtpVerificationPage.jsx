import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services/api';
import { useAuth } from '../common/AuthContext';

function OtpVerificationPage({ sessionId: initialSessionId, email, onBack }) {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await authService.verifyOtp({ sessionId, otp });
      if (data?.token) {
        // Store token first before fetching profile
        localStorage.setItem('auth_token', data.token);
        
        try {
          const profile = await userService.getProfile();
          setAuth({ token: data.token, user: profile?.data || data.user || null });
        } catch (profileError) {
          console.warn('Failed to fetch profile, using user data from token response:', profileError);
          setAuth({ token: data.token, user: data.user || null });
        }
        navigate('/', { replace: true });
      } else {
        setError('Login failed: No token received');
      }
    } catch (e) {
      console.error('OTP verification error:', e);
      const errorMessage = e?.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.resendOtp({ email });
      console.log('Resend OTP response:', response.data);
      
      // Update sessionId with the new one and reset timer
      if (response.data?.sessionId) {
        setSessionId(response.data.sessionId);
        setTimeLeft(300);
        setOtp('');
        setError('');
        
        // Show debug OTP if available
        if (response.data?.debugOtp) {
          console.log('DEBUG OTP:', response.data.debugOtp);
        }
        
        alert('✅ New OTP sent to your email!');
      }
    } catch (e) {
      console.error('Resend OTP error:', e);
      const errorMessage = e?.response?.data?.message || 'Failed to resend OTP. Please try logging in again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (timeLeft === 0) {
    return (
      <div className="container" style={{ maxWidth: 420 }}>
        <h2 className="my-4">OTP Expired</h2>
        <div className="alert alert-warning">
          Your OTP has expired. Please login again to receive a new OTP.
        </div>
        <button className="btn btn-primary" onClick={onBack}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 className="my-4">Verify OTP</h2>
      <div className="alert alert-info">
        We've sent a 6-digit OTP to <strong>{email}</strong>
        <br />
        <small className="text-muted">For development: You can enter any 6-digit number</small>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="card p-3">
        <div className="mb-3">
          <label className="form-label">Enter OTP</label>
          <input
            type="text"
            className="form-control text-center"
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            maxLength="6"
            style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
            required
          />
        </div>
        
        <div className="mb-3 text-center">
          <small className="text-muted">
            Time remaining: <strong>{formatTime(timeLeft)}</strong>
          </small>
        </div>
        
        <button 
          className="btn btn-primary w-100" 
          type="submit" 
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <div className="mt-3 text-center">
          <button 
            type="button" 
            className="btn btn-link" 
            onClick={handleResendOtp}
            disabled={loading}
          >
            Resend OTP
          </button>
        </div>
        
        <div className="mt-2 text-center">
          <button 
            type="button" 
            className="btn btn-link" 
            onClick={onBack}
            disabled={loading}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default OtpVerificationPage;
