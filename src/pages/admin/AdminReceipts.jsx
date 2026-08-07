import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Eye, Download, Printer, Send, Receipt as ReceiptIcon,
  CheckCircle, Clock, AlertCircle, Filter, X
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

const statusOptions = ['All', 'Sent', 'Viewed', 'Downloaded'];
const statusColors = {
  Sent: 'text-[#2B0071] bg-[#2B0071]/10',
  Viewed: 'text-[#FF5500] bg-[#FF5500]/10',
  Downloaded: 'text-[#10B981] bg-[#10B981]/10',
};
const statusIcons = {
  Sent: Clock,
  Viewed: AlertCircle,
  Downloaded: CheckCircle,
};

function AdminReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/receipts');
      setReceipts(response.data.receipts);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err.response?.data?.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Filter and search
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        (r.receiptNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.customer || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, filterStatus]);

  // Sort
  const sortedReceipts = useMemo(() => {
    const sorted = [...filteredReceipts];
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
  }, [filteredReceipts, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleView = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const handleDownload = (receipt) => {
    alert(`Downloading receipt ${receipt.receiptNumber} as PDF (demo)`);
  };

  const handlePrint = (receipt) => {
    alert(`Printing receipt ${receipt.receiptNumber} (demo)`);
  };

  const handleResend = async (receipt) => {
    if (window.confirm(`Resend receipt ${receipt.receiptNumber} to ${receipt.customer}?`)) {
      // In a real app, you'd call an API to resend
      alert(`Receipt ${receipt.receiptNumber} resent via email. (demo)`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading receipts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-[#EF4444]">
        <p className="font-medium">Error loading receipts</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchReceipts} className="mt-2 text-sm font-medium text-[#2B0071] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Receipts</h2>
        <div className="text-sm text-gray-400">
          Total: {receipts.length} receipts
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by receipt, tracking, customer..."
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

      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FD] border-b border-[#E2E5F0] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('receiptNumber')}>
                  Receipt {sortField === 'receiptNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5F0]">
              {sortedReceipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                sortedReceipts.map((receipt) => {
                  const StatusIcon = statusIcons[receipt.status] || Clock;
                  return (
                    <tr key={receipt._id || receipt.id} className="hover:bg-[#F8F9FD]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#2B0071]">{receipt.receiptNumber}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{receipt.trackingNumber}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">{receipt.customer}</td>
                      <td className="px-4 py-3 font-medium">{receipt.amount} {receipt.currency}</td>
                      <td className="px-4 py-3 text-gray-500">{receipt.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[receipt.status] || 'bg-gray-100 text-gray-600'}`}>
                          <StatusIcon size={12} />
                          {receipt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleView(receipt)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDownload(receipt)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="Download">
                            <Download size={16} />
                          </button>
                          <button onClick={() => handlePrint(receipt)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="Print">
                            <Printer size={16} />
                          </button>
                          <button onClick={() => handleResend(receipt)} className="p-1.5 text-[#FF5500]/60 hover:text-[#FF5500] rounded-lg hover:bg-[#FF5500]/5" aria-label="Resend">
                            <Send size={16} />
                          </button>
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
          Showing {sortedReceipts.length} of {receipts.length} receipts
        </div>
      </div>

      {showModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Receipt Details</h3>
              <button
                onClick={() => { setShowModal(false); setSelectedReceipt(null); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Receipt Number</p>
                  <p className="font-medium font-mono">{selectedReceipt.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                  <p className="font-medium font-mono">{selectedReceipt.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Customer</p>
                  <p className="font-medium">{selectedReceipt.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                  <p className="font-medium">{selectedReceipt.amount} {selectedReceipt.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                  <p className="font-medium">{selectedReceipt.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <p className={`font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusColors[selectedReceipt.status]}`}>
                    {selectedReceipt.status}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Method</p>
                  <p className="font-medium">{selectedReceipt.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                  <p className="font-medium">{selectedReceipt.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  onClick={() => handleDownload(selectedReceipt)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2B0071] rounded-xl hover:bg-[#3d0099] transition-colors"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => handlePrint(selectedReceipt)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={() => { handleResend(selectedReceipt); setShowModal(false); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
                >
                  <Send size={16} />
                  Resend to Customer
                </button>
                <button
                  onClick={() => setShowModal(false)}
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

export default AdminReceipts;