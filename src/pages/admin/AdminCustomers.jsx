import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, User, Mail, Phone, Package, Eye, CreditCard,
  MessageCircle, X, ChevronDown, ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

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

function AdminCustomers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('details'); // 'details', 'shipments', 'payments'

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Failed to load customers');
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  // Sort
  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];
    sorted.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'totalShipments' || sortField === 'activeShipments' || sortField === 'completedShipments') {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredCustomers, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewMode('details');
    setShowModal(true);
  };

  const handleViewShipments = (customer) => {
    setSelectedCustomer(customer);
    setViewMode('shipments');
    setShowModal(true);
  };

  const handleViewPayments = (customer) => {
    setSelectedCustomer(customer);
    setViewMode('payments');
    setShowModal(true);
  };

  const handleContact = (customer) => {
    window.location.href = `mailto:${customer.email}`;
  };

  const paymentColorMap = {
    Paid: 'text-[#10B981] bg-[#10B981]/10',
    Unpaid: 'text-[#FF5500] bg-[#FF5500]/10',
    Pending: 'text-[#FF5500] bg-[#FF5500]/10',
    Failed: 'text-[#EF4444] bg-[#EF4444]/10',
    Refunded: 'text-gray-400 bg-gray-100',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading customers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-[#EF4444]">
        <p className="font-medium">Error loading customers</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchCustomers} className="mt-2 text-sm font-medium text-[#2B0071] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Customers</h2>
        <div className="text-sm text-gray-400">
          Total: {customers.length} customers
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FD] border-b border-[#E2E5F0] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('name')}>
                  Customer {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('email')}>
                  Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('phone')}>
                  Phone {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('totalShipments')}>
                  Total {sortField === 'totalShipments' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('activeShipments')}>
                  Active {sortField === 'activeShipments' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('completedShipments')}>
                  Completed {sortField === 'completedShipments' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5F0]">
              {sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((customer) => (
                  <tr key={customer._id || customer.email} className="hover:bg-[#F8F9FD]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1A2E]">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-500">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-500">{customer.phone}</td>
                    <td className="px-4 py-3 font-medium">{customer.totalShipments}</td>
                    <td className="px-4 py-3">{customer.activeShipments}</td>
                    <td className="px-4 py-3">{customer.completedShipments}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="View customer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleViewShipments(customer)}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="View shipments"
                        >
                          <Package size={16} />
                        </button>
                        <button
                          onClick={() => handleViewPayments(customer)}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="View payments"
                        >
                          <CreditCard size={16} />
                        </button>
                        <button
                          onClick={() => handleContact(customer)}
                          className="p-1.5 text-[#FF5500]/60 hover:text-[#FF5500] transition-colors rounded-lg hover:bg-[#FF5500]/5"
                          aria-label="Contact"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E2E5F0] text-xs text-gray-400 bg-[#F8F9FD]/30">
          Showing {sortedCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* ---- Customer Detail Modal ---- */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">
                {viewMode === 'details' ? 'Customer Details' :
                 viewMode === 'shipments' ? 'Shipments' :
                 'Payment History'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setSelectedCustomer(null); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            {viewMode === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Address</p>
                    <p className="font-medium">{selectedCustomer.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Shipments</p>
                    <p className="font-medium">{selectedCustomer.totalShipments}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Active Shipments</p>
                    <p className="font-medium">{selectedCustomer.activeShipments}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Completed Shipments</p>
                    <p className="font-medium">{selectedCustomer.completedShipments}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-[#E2E5F0]">
                  <button
                    onClick={() => handleViewShipments(selectedCustomer)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"
                  >
                    <Package size={16} />
                    View Shipments
                  </button>
                  <button
                    onClick={() => handleViewPayments(selectedCustomer)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"
                  >
                    <CreditCard size={16} />
                    View Payments
                  </button>
                  <button
                    onClick={() => handleContact(selectedCustomer)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
                  >
                    <MessageCircle size={16} />
                    Contact
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'shipments' && (
              <div className="space-y-3">
                {selectedCustomer.shipments.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No shipments found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F8F9FD] text-xs text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2 text-left">Tracking</th>
                          <th className="px-3 py-2 text-left">Origin</th>
                          <th className="px-3 py-2 text-left">Destination</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E5F0]">
                        {selectedCustomer.shipments.map((s) => (
                          <tr key={s.id} className="hover:bg-[#F8F9FD]/50">
                            <td className="px-3 py-2 font-mono text-xs text-[#2B0071]">{s.id}</td>
                            <td className="px-3 py-2 text-gray-600">{s.origin}</td>
                            <td className="px-3 py-2 text-gray-600">{s.destination}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                s.status === 'Delivered' ? 'bg-[#10B981]/10 text-[#10B981]' :
                                s.status === 'Customs Hold' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                                'bg-[#2B0071]/10 text-[#2B0071]'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-500">{s.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button
                  onClick={() => setViewMode('details')}
                  className="text-sm text-[#2B0071] hover:text-[#FF5500] transition-colors"
                >
                  ← Back to details
                </button>
              </div>
            )}

            {viewMode === 'payments' && (
              <div className="space-y-3">
                {selectedCustomer.paymentHistory.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No payment history found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F8F9FD] text-xs text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2 text-left">Tracking</th>
                          <th className="px-3 py-2 text-left">Amount</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E5F0]">
                        {selectedCustomer.paymentHistory.map((p, idx) => (
                          <tr key={idx} className="hover:bg-[#F8F9FD]/50">
                            <td className="px-3 py-2 font-mono text-xs text-[#2B0071]">{p.trackingNumber}</td>
                            <td className="px-3 py-2 font-medium">{p.amount} USD</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentColorMap[p.status] || 'bg-gray-100 text-gray-600'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-500">{p.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button
                  onClick={() => setViewMode('details')}
                  className="text-sm text-[#2B0071] hover:text-[#FF5500] transition-colors"
                >
                  ← Back to details
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;