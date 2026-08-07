import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Filter, Eye, Send, RefreshCw, X,
  AlertTriangle, CheckCircle, Clock, FileText,
  Truck, Package, CreditCard, ShieldCheck, Plus
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

const statusOptions = ['All', 'Sent', 'Pending', 'Failed'];
const typeOptions = ['All', 'Shipment Update', 'Customs Hold', 'Customs Fee Required', 'Shipment Delayed', 'Payment Confirmation', 'Shipment Cleared', 'Out for Delivery', 'Delivered'];

const statusColors = {
  Sent: 'text-[#10B981] bg-[#10B981]/10',
  Pending: 'text-[#FF5500] bg-[#FF5500]/10',
  Failed: 'text-[#EF4444] bg-[#EF4444]/10',
};
const statusIcons = {
  Sent: CheckCircle,
  Pending: Clock,
  Failed: AlertTriangle,
};

const typeIcons = {
  'Shipment Update': Truck,
  'Customs Hold': ShieldCheck,
  'Customs Fee Required': CreditCard,
  'Shipment Delayed': AlertTriangle,
  'Payment Confirmation': CheckCircle,
  'Shipment Cleared': FileText,
  'Out for Delivery': Package,
  'Delivered': CheckCircle,
};

function AdminNotifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Compose modal state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [trackingOptions, setTrackingOptions] = useState([]);
  const [composeData, setComposeData] = useState({
    type: 'Shipment Update',
    trackingNumber: '',
    recipient: '',
    subject: '',
    body: '',
    attachments: [],
  });
  const [isSending, setIsSending] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch tracking numbers when compose modal opens
  useEffect(() => {
    if (showComposeModal) {
      const fetchShipments = async () => {
        try {
          const response = await api.get('/shipments');
          const ids = response.data.shipments.map(s => s.id);
          setTrackingOptions(ids);
          // Auto-select first if available
          if (ids.length > 0 && !composeData.trackingNumber) {
            setComposeData(prev => ({ ...prev, trackingNumber: ids[0] }));
          }
        } catch (err) {
          showToast('Failed to load shipments', 'error');
        }
      };
      fetchShipments();
    }
  }, [showComposeModal]);

  // Filter and search
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        (n.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.recipient || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || n.status === filterStatus;
      const matchesType = filterType === 'All' || n.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [notifications, searchTerm, filterStatus, filterType]);

  // Sort
  const sortedNotifications = useMemo(() => {
    const sorted = [...filteredNotifications];
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
  }, [filteredNotifications, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const handleResend = async (notification) => {
    if (!window.confirm(`Resend notification to ${notification.recipient}?`)) return;
    try {
      await api.post(`/notifications/${notification._id}/resend`);
      await fetchNotifications();
      showToast(`Notification resent to ${notification.recipient}.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resend notification', 'error');
    }
  };

  // Compose functions
  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setComposeData(prev => ({ ...prev, [name]: value }));
  };

  const handleComposeSubmit = async () => {
    const { type, trackingNumber, recipient, subject, body } = composeData;
    if (!type || !recipient || !subject || !body) {
      showToast('Please fill in all required fields (Type, Recipient, Subject, Body).', 'error');
      return;
    }

    setIsSending(true);
    try {
      await api.post('/notifications', {
        type,
        trackingNumber: trackingNumber || 'TCG-000000000000',
        recipient,
        subject,
        body,
        attachments: composeData.attachments,
        triggeredBy: 'Manual send by admin',
      });
      await fetchNotifications();
      setShowComposeModal(false);
      setComposeData({
        type: 'Shipment Update',
        trackingNumber: '',
        recipient: '',
        subject: '',
        body: '',
        attachments: [],
      });
      showToast('Notification sent successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send notification', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-[#EF4444]">
        <p className="font-medium">Error loading notifications</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchNotifications} className="mt-2 text-sm font-medium text-[#2B0071] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Notifications / Email Center</h2>
        <button
          onClick={() => setShowComposeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
        >
          <Plus size={16} />
          Send Custom Notification
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking, recipient, subject..."
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
          >
            {typeOptions.map((opt) => (
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
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('type')}>
                  Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('trackingNumber')}>
                  Tracking {sortField === 'trackingNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('recipient')}>
                  Recipient {sortField === 'recipient' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('subject')}>
                  Subject {sortField === 'subject' && (sortDirection === 'asc' ? '↑' : '↓')}
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
              {sortedNotifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                    No notifications found.
                  </td>
                </tr>
              ) : (
                sortedNotifications.map((notif) => {
                  const StatusIcon = statusIcons[notif.status] || Clock;
                  const TypeIcon = typeIcons[notif.type] || FileText;
                  return (
                    <tr key={notif._id || notif.id} className="hover:bg-[#F8F9FD]/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2B0071]">
                          <TypeIcon size={14} />
                          {notif.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{notif.trackingNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{notif.recipient}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-gray-700">{notif.subject}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(notif.date).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[notif.status] || 'bg-gray-100 text-gray-600'}`}>
                          <StatusIcon size={12} />
                          {notif.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(notif)}
                            className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                            aria-label="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleResend(notif)}
                            className="p-1.5 text-[#FF5500]/60 hover:text-[#FF5500] transition-colors rounded-lg hover:bg-[#FF5500]/5"
                            aria-label="Resend"
                          >
                            <RefreshCw size={16} />
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
          Showing {sortedNotifications.length} of {notifications.length} notifications
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Email Details</h3>
              <button
                onClick={() => { setShowModal(false); setSelectedNotification(null); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
                  <p className="font-medium">{selectedNotification.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <p className={`font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusColors[selectedNotification.status]}`}>
                    {selectedNotification.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                  <p className="font-mono">{selectedNotification.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Recipient</p>
                  <p>{selectedNotification.recipient}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Subject</p>
                  <p className="font-medium">{selectedNotification.subject}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Triggered By</p>
                  <p className="text-gray-600">{selectedNotification.triggeredBy || 'System event'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Body</p>
                  <div className="bg-[#F8F9FD] p-3 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-[#E2E5F0]">
                    {selectedNotification.body}
                  </div>
                </div>
                {selectedNotification.attachments && selectedNotification.attachments.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Attachments</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedNotification.attachments.map((att, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-[#2B0071]/5 rounded-lg text-xs text-[#2B0071]">
                          <FileText size={12} />
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                  <p>{new Date(selectedNotification.date).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  onClick={() => { handleResend(selectedNotification); setShowModal(false); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
                >
                  <RefreshCw size={16} />
                  Resend Email
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

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Send Custom Notification</h3>
              <button
                onClick={() => { setShowComposeModal(false); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Notification Type *</label>
                <select
                  name="type"
                  value={composeData.type}
                  onChange={handleComposeChange}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                >
                  {typeOptions.filter(t => t !== 'All').map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Tracking Number - Dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Tracking Number</label>
                <select
                  name="trackingNumber"
                  value={composeData.trackingNumber}
                  onChange={handleComposeChange}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  disabled={trackingOptions.length === 0}
                >
                  {trackingOptions.length === 0 ? (
                    <option value="">No shipments available</option>
                  ) : (
                    <>
                      <option value="">Select a tracking number</option>
                      {trackingOptions.map((id) => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </>
                  )}
                </select>
                {trackingOptions.length === 0 && (
                  <p className="text-xs text-[#FF5500] mt-1">No shipments found. Please create a shipment first.</p>
                )}
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Recipient Email *</label>
                <input
                  type="email"
                  name="recipient"
                  value={composeData.recipient}
                  onChange={handleComposeChange}
                  placeholder="customer@example.com"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={composeData.subject}
                  onChange={handleComposeChange}
                  placeholder="Your Shipment Update"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Message Body *</label>
                <textarea
                  name="body"
                  value={composeData.body}
                  onChange={handleComposeChange}
                  rows="6"
                  placeholder="Write your email message here..."
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] resize-y"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Attachments (simulated)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files).map(f => f.name);
                    setComposeData(prev => ({ ...prev, attachments: files }));
                  }}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
                {composeData.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {composeData.attachments.map((name, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-[#2B0071]/5 rounded-lg text-xs text-[#2B0071]">
                        <FileText size={12} />
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  type="button"
                  onClick={() => { setShowComposeModal(false); }}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleComposeSubmit}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Notification</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;