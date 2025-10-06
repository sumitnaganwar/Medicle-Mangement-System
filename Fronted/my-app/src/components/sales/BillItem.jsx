import React, { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { saleService } from '../services/api';

const BillItem = ({ sale, onSaleDeleted, onSaleUpdated }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentSale, setCurrentSale] = useState(sale);

  // Keep local state in sync when parent reloads data
  useEffect(() => {
    setCurrentSale(sale);
  }, [sale]);

  const handleDeleteSale = async () => {
    setDeleting(true);
    try {
      console.log('Attempting to delete sale:', sale.id);
      const response = await saleService.deleteSale(sale.id);
      console.log('Delete response:', response);
      if (onSaleDeleted) {
        onSaleDeleted(sale.id);
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to delete sale: ${error.response?.data || error.message}`);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setDeleting(true);

    // Optimistic UI update: remove the row immediately
    const nextItems = (currentSale.items || []).filter(it => it.id !== itemId);
    const nextTotal = nextItems.reduce((sum, it) => sum + (it.subtotal || 0), 0);
    const prevSale = currentSale;
    setCurrentSale({ ...currentSale, items: nextItems, totalAmount: nextTotal });
    // Auto-collapse details for a cleaner UX
    setShowDetails(false);

    try {
      console.log('Attempting to delete item:', itemId, 'from sale:', sale.id);
      const response = await saleService.deleteSaleItem(sale.id, itemId);
      console.log('Delete item response:', response);

      // If no items remain, this sale may get deleted server-side; try to refetch
      if (nextItems.length === 0) {
        try {
          const refreshed = await saleService.getSaleById(sale.id);
          if (refreshed?.data) {
            setCurrentSale(refreshed.data);
          }
        } catch (fetchErr) {
          if (fetchErr?.response?.status === 404 && onSaleDeleted) {
            onSaleDeleted(sale.id);
          }
        }
      }

      // Notify parent for aggregates (totals header) to refresh
      if (onSaleUpdated) onSaleUpdated();
    } catch (error) {
      // Revert optimistic change on error
      setCurrentSale(prevSale);
      console.error('Error deleting sale item:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to delete item: ${error.response?.data || error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-3">
            <h6 className="mb-1">{currentSale.billNumber}</h6>
            <small className="text-muted">{formatDate(currentSale.saleDate)}</small>
          </div>
          <div className="col-md-2">
            <span className={`badge bg-${
              currentSale.paymentMethod === 'CASH' ? 'success' : 
              currentSale.paymentMethod === 'CARD' ? 'primary' : 'info'
            }`}>
              {currentSale.paymentMethod}
            </span>
          </div>
          <div className="col-md-3">
            <strong>{currentSale.customer?.name || 'Walk-in Customer'}</strong>
            {currentSale.customer?.phone && (
              <small className="text-muted d-block">{currentSale.customer.phone}</small>
            )}
          </div>
          <div className="col-md-2">
            <strong className="text-success">{formatCurrency(currentSale.totalAmount)}</strong>
          </div>
          <div className="col-md-2 text-end">
            <div className="btn-group" role="group">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowDetails(!showDetails)}
                disabled={deleting}
              >
                {showDetails ? 'Hide' : 'View'} Details
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                title="Delete entire bill"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        {showDetails && (currentSale.items && currentSale.items.length > 0) && (
          <div className="mt-3 pt-3 border-top">
            <h6>Items:</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSale.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{item.medicine.name}</strong>
                        {item.medicine.genericName && (
                          <small className="text-muted d-block">{item.medicine.genericName}</small>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this entire bill?</p>
                  <p><strong>Bill:</strong> {sale.billNumber}</p>
                  <p><strong>Amount:</strong> {formatCurrency(sale.totalAmount)}</p>
                  <p className="text-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    This action will restore all medicines to stock and cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteSale}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Deleting...
                      </>
                    ) : (
                      'Delete Bill'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showDeleteConfirm && <div className="modal-backdrop fade show"></div>}
      </div>
    </div>
  );
};

export default BillItem;