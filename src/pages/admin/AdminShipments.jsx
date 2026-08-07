import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Plus, Eye, Edit, Trash2, RefreshCw, Filter, X, Clock, FileText
} from 'lucide-react';

// API base URL – adjust if needed
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance with auth interceptor
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

const statusOptions = ['All', 'In Transit', 'Delivered', 'Pending', 'Customs Hold', 'Out for Delivery'];
const paymentOptions = ['All', 'Paid', 'Unpaid'];

function AdminShipments() {
  // State
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    customer: '',
    origin: '',
    destination: '',
    status: 'Pending',
    payment: 'Unpaid',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    packageType: 'Standard Parcel',
  });

  // Fetch shipments on mount
  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/shipments');
      setShipments(response.data.shipments);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError(err.response?.data?.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // ----- Filter and search (client-side) -----
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.origin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.destination || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
      const matchesPayment = filterPayment === 'All' || s.payment === filterPayment;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [shipments, searchTerm, filterStatus, filterPayment]);

  // ----- Sort (client-side) -----
  const sortedShipments = useMemo(() => {
    const sorted = [...filteredShipments];
    sorted.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredShipments, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ----- Open edit modal -----
  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData({ ...shipment });
    setShowModal(true);
  };

  // ----- Delete -----
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;
    try {
      await api.delete(`/shipments/${id}`);
      // Refetch
      await fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete shipment');
    }
  };

  // ----- View -----
  const handleView = (id) => {
    window.location.href = `/shipment?tracking=${id}`;
  };

  // ----- Save (update) -----
  const handleSave = async () => {
    if (!editingShipment) return;
    try {
      await api.put(`/shipments/${editingShipment.id}`, formData);
      setShowModal(false);
      setEditingShipment(null);
      // Refetch
      await fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shipment');
    }
  };

  const statusColorMap = {
    'In Transit': 'text-[#2B0071] bg-[#2B0071]/10',
    Delivered: 'text-[#10B981] bg-[#10B981]/10',
    Pending: 'text-[#FF5500] bg-[#FF5500]/10',
    'Customs Hold': 'text-[#EF4444] bg-[#EF4444]/10',
    'Out for Delivery': 'text-[#2B0071] bg-[#2B0071]/10',
  };

  const paymentColorMap = {
    Paid: 'text-[#10B981] bg-[#10B981]/10',
    Unpaid: 'text-[#FF5500] bg-[#FF5500]/10',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading shipments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-[#EF4444]">
        <p className="font-medium">Error loading shipments</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchShipments}
          className="mt-2 text-sm font-medium text-[#2B0071] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#1A1A2E]">All Shipments</h2>
        <Link
          to="/admin/shipments/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
        >
          <Plus size={16} />
          Create Shipment
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking, customer, origin, destination..."
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
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
          >
            {paymentOptions.map((opt) => (
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
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('id')}>
                  Tracking {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('customer')}>
                  Customer {sortField === 'customer' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('origin')}>
                  Origin {sortField === 'origin' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('destination')}>
                  Destination {sortField === 'destination' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('payment')}>
                  Payment {sortField === 'payment' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5F0]">
              {sortedShipments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                sortedShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-[#F8F9FD]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#2B0071]">{shipment.id}</td>
                    <td className="px-4 py-3 font-medium text-[#1A1A2E]">{shipment.customer}</td>
                    <td className="px-4 py-3 text-gray-600">{shipment.origin}</td>
                    <td className="px-4 py-3 text-gray-600">{shipment.destination}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColorMap[shipment.status] || 'bg-gray-100 text-gray-600'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentColorMap[shipment.payment] || 'bg-gray-100 text-gray-600'}`}>
                        {shipment.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{shipment.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(shipment.id)}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="View"
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          to={`/admin/shipments/timeline/${shipment.id}`}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="Timeline"
                        >
                          <Clock size={16} />
                        </Link>
                        <Link
                          to={`/admin/shipments/documents/${shipment.id}`}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="Documents"
                        >
                          <FileText size={16} />
                        </Link>
                        <Link
                          to={`/admin/shipments/update/${shipment.id}`}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="Update"
                        >
                          <RefreshCw size={16} />
                        </Link>
                        <button
                          onClick={() => handleEdit(shipment)}
                          className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                          aria-label="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          className="p-1.5 text-[#EF4444]/60 hover:text-[#EF4444] transition-colors rounded-lg hover:bg-[#EF4444]/5"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
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
          Showing {sortedShipments.length} of {shipments.length} shipments
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Edit Shipment</h3>
              <button
                onClick={() => { setShowModal(false); setEditingShipment(null); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={formData.id}
                  disabled
                  className="w-full px-4 py-2.5 text-sm bg-gray-100 border border-[#E2E5F0] rounded-xl text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Origin *</label>
                  <input
                    type="text"
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  >
                    {statusOptions.filter(s => s !== 'All').map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Payment</label>
                  <select
                    value={formData.payment}
                    onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Weight (kg)</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Package Type</label>
                <input
                  type="text"
                  value={formData.packageType}
                  onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingShipment(null); }}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminShipments;