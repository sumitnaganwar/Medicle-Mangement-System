import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

function SupplierOwner() {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await userService.getOwner();
        if (!cancelled) setOwner(data || null);
      } catch (e) {
        if (!cancelled) setError('Failed to load owner details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="container"><div className="text-center">Loading...</div></div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Medical Owner</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="card p-3">
            {!owner ? (
              <div className="text-muted">No owner details found.</div>
            ) : (
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={owner.name || ''} readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={owner.email || ''} readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={owner.phone || ''} readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Role</label>
                  <input className="form-control" value={owner.role || 'Owner'} readOnly />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows={3} value={owner.address || ''} readOnly />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupplierOwner;
