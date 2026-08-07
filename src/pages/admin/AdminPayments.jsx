import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Filter, Eye, Download, RefreshCw, CreditCard,
  CheckCircle, XCircle, Clock, AlertTriangle, X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const statusOptions = ['All', 'Pending', 'Paid', 'Failed', 'Refunded'];

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch payments on mount
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/payments');
      setPayments(response.data.payments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ----- Filter and search (client-side) -----
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        (p.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.customer || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, filterStatus]);

  // ----- Sort (client-side) -----
  const sortedPayments = useMemo(() => {
    const sorted = [...filteredPayments];
    sorted.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortField === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPayments, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleDownloadReceipt = (payment) => {
    alert(`Downloading receipt for ${payment.reference} (demo)`);
  };

  const handleIssueRefund = async (payment) => {
    if (payment.status !== 'Paid' && payment.status !== 'Pending') {
      alert(`Cannot refund a payment with status "${payment.status}".`);
      return;
    }
    if (!window.confirm(`Are you sure you want to refund ${payment.amount} ${payment.currency} for ${payment.reference}?`)) return;

    try {
      await api.put(`/payments/${payment._id}`, { status: 'Refunded' });
      await fetchPayments();
      alert(`Refund processed for ${payment.reference}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    }
  };

  const statusColorMap = {
    Pending: 'text-[#FF5500] bg-[#FF5500]/10',
    Paid: 'text-[#10B981] bg-[#10B981]/10',
    Failed: 'text-[#EF4444] bg-[#EF4444]/10',
    Refunded: 'text-[#6B7280] bg-[#6B7280]/10',
  };

  const statusIconMap = {
    Pending: Clock,
    Paid: CheckCircle,
    Failed: XCircle,
    Refunded: AlertTriangle,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-[#EF4444]">
        <p className="font-medium">Error loading payments</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchPayments}
          className="mt-2 text-sm font-medium text-[#2B0071] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Payments</h2>
        <div className="text-sm text-gray-400">
          Total: {payments.length} transactions
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, tracking, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FD] border-b border-[#E2E5F0] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('reference')}>
                  Reference {sortField === 'reference' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('trackingNumber')}>
                  Tracking {sortField === 'trackingNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('customer')}>
                  Customer {sortField === 'customer' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('amount')}>
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5F0]">
              {sortedPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                    No payments found.
                  </td>
                </tr>
              ) : (
                sortedPayments.map((payment) => {
                  const StatusIcon = statusIconMap[payment.status] || CreditCard;
                  return (
                    <tr key={payment._id || payment.id} className="hover:bg-[#F8F9FD]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#2B0071]">{payment.reference}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{payment.trackingNumber}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">{payment.customer}</td>
                      <td className="px-4 py-3 font-medium">{payment.amount} {payment.currency}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColorMap[payment.status] || 'bg-gray-100 text-gray-600'}`}>
                          <StatusIcon size={12} />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{payment.date}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                            aria-label="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(payment)}
                            className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                            aria-label="Download receipt"
                          >
                            <Download size={16} />
                          </button>
                          {(payment.status === 'Paid' || payment.status === 'Pending') && (
                            <button
                              onClick={() => handleIssueRefund(payment)}
                              className="p-1.5 text-[#FF5500]/60 hover:text-[#FF5500] transition-colors rounded-lg hover:bg-[#FF5500]/5"
                              aria-label="Refund"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E2E5F0] text-xs text-gray-400 bg-[#F8F9FD]/30">
          Showing {sortedPayments.length} of {payments.length} payments
        </div>
      </div>

      {/* ---- Payment Details Modal ---- */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Payment Details</h3>
              <button
                onClick={() => { setShowDetailModal(false); setSelectedPayment(null); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Reference</p>
                  <p className="font-medium font-mono">{selectedPayment.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                  <p className="font-medium font-mono">{selectedPayment.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Customer</p>
                  <p className="font-medium">{selectedPayment.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                  <p className="font-medium">{selectedPayment.amount} {selectedPayment.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <p className={`font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusColorMap[selectedPayment.status]}`}>
                    {selectedPayment.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                  <p className="font-medium">{selectedPayment.date}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Method</p>
                  <p className="font-medium">{selectedPayment.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                  <p className="font-medium">{selectedPayment.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2B0071] rounded-xl hover:bg-[#3d0099] transition-colors"
                >
                  <Download size={16} />
                  Download Receipt
                </button>
                {(selectedPayment.status === 'Paid' || selectedPayment.status === 'Pending') && (
                  <button
                    onClick={() => { handleIssueRefund(selectedPayment); setShowDetailModal(false); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
                  >
                    <RefreshCw size={16} />
                    Issue Refund
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;