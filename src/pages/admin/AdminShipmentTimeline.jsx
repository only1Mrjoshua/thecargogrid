import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Plus, Edit, Trash2, CheckCircle, Circle,
  Clock, MapPin, Calendar, X, Save, AlertCircle
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

const statusOptions = ['completed', 'active', 'upcoming'];

// ✅ Predefined milestone labels – admin can select from these
const milestoneOptions = [
  'Order Received',
  'Shipment Processed',
  'In Transit',
  'Arrived at Facility',
  'Customs Hold',
  'Customs Fee Pending',
  'Shipment Delayed',
  'Cleared',
  'Out for Delivery',
  'Delivered',
];

function AdminShipmentTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [steps, setSteps] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [formData, setFormData] = useState({
    event: '',
    status: 'upcoming',
    date: '',
    description: '',
    location: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch shipment data
  const fetchShipment = async () => {
    try {
      const response = await api.get(`/shipments/${id}`);
      const data = response.data.shipment;
      setShipment(data);
      setSteps(data.steps || []);
      setNotFound(false);
    } catch (err) {
      console.error('Error fetching shipment:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchShipment();
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [id]);

  const resetForm = () => {
    setFormData({
      event: '',
      status: 'upcoming',
      date: '',
      description: '',
      location: '',
    });
  };

  // Add step
  const handleAddStep = async () => {
    if (!formData.event.trim()) {
      alert('Please select or enter a milestone label.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await api.post(`/shipments/${id}/timeline`, formData);
      await fetchShipment(); // Refresh
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add milestone');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit step
  const handleEditStep = async () => {
    if (!formData.event.trim()) {
      alert('Please select or enter a milestone label.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await api.put(`/shipments/${id}/timeline/${editingStepIndex}`, formData);
      await fetchShipment(); // Refresh
      setShowEditModal(false);
      setEditingStepIndex(null);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update milestone');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete step
  const handleDeleteStep = async (index) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await api.delete(`/shipments/${id}/timeline/${index}`);
      await fetchShipment(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete milestone');
    }
  };

  // Mark step as completed (toggle)
  const toggleComplete = async (index) => {
    const step = steps[index];
    const newStatus = step.status === 'completed' ? 'upcoming' : 'completed';
    try {
      await api.put(`/shipments/${id}/timeline/${index}`, { status: newStatus });
      await fetchShipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openEditModal = (index) => {
    const step = steps[index];
    setFormData({
      event: step.event || step.label || '',
      status: step.status || 'upcoming',
      date: step.date || '',
      description: step.description || '',
      location: step.location || '',
    });
    setEditingStepIndex(index);
    setShowEditModal(true);
  };

  // Handle change for dropdown – if "Other" is selected, we allow manual input
  const handleEventChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, event: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading timeline...</span>
      </div>
    );
  }

  if (notFound || !shipment) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1A1A2E]">Shipment not found</h3>
        <p className="text-gray-500">The shipment with tracking number <strong>{id}</strong> does not exist.</p>
        <Link to="/admin/shipments" className="mt-4 inline-block btn-primary text-sm py-2 px-6">
          Back to Shipments
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-[#10B981]" />;
      case 'active':
        return <Circle size={18} className="text-[#2B0071] fill-[#2B0071]/20 animate-pulse" />;
      default:
        return <Circle size={18} className="text-[#E2E5F0]" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'In Progress';
      default: return 'Pending';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-[#10B981]/10 text-[#10B981]';
      case 'active': return 'bg-[#2B0071]/10 text-[#2B0071]';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/shipments"
            className="p-2 text-[#1A1A2E]/60 hover:text-[#1A1A2E] hover:bg-[#F8F9FD] rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold text-[#1A1A2E]">Shipment Timeline</h2>
          <span className="text-sm text-gray-400 font-mono">{id}</span>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
        >
          <Plus size={16} />
          Add Milestone
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-3 text-sm text-[#EF4444] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          {error}
        </div>
      )}

      {steps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 text-center">
          <p className="text-gray-400">No milestones added yet. Click "Add Milestone" to create the first one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
          <div className="divide-y divide-[#E2E5F0]">
            {steps.map((step, index) => (
              <div key={index} className="px-6 py-4 hover:bg-[#F8F9FD]/50 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-[200px]">
                    <div className="mt-0.5">{getStatusIcon(step.status)}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#1A1A2E]">{step.event || step.label}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(step.status)}`}>
                          {getStatusLabel(step.status)}
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                        {step.date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(step.date).toLocaleString()}
                          </span>
                        )}
                        {step.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {step.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleComplete(index)}
                      className={`p-1.5 text-xs font-medium rounded-lg transition-colors ${
                        step.status === 'completed'
                          ? 'text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20'
                          : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                      }`}
                      aria-label="Toggle complete"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(index)}
                      className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(index)}
                      className="p-1.5 text-[#EF4444]/60 hover:text-[#EF4444] transition-colors rounded-lg hover:bg-[#EF4444]/5"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Add Milestone</h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddStep(); }}>
              {/* Milestone Label – Dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Milestone Label *</label>
                <select
                  value={formData.event}
                  onChange={handleEventChange}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                >
                  <option value="">Select a milestone</option>
                  {milestoneOptions.map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                  <option value="__other__">Other (type below)</option>
                </select>
                {/* If "Other" is selected, show text input */}
                {formData.event === '__other__' && (
                  <input
                    type="text"
                    value={formData.event === '__other__' ? '' : formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    placeholder="Enter custom milestone"
                    className="mt-2 w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Location (Optional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., London Hub"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Additional details..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Adding...' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Edit Milestone</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingStepIndex(null); resetForm(); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditStep(); }}>
              {/* Milestone Label – Dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Milestone Label *</label>
                <select
                  value={milestoneOptions.includes(formData.event) ? formData.event : '__other__'}
                  onChange={handleEventChange}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                >
                  <option value="">Select a milestone</option>
                  {milestoneOptions.map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                  <option value="__other__">Other (type below)</option>
                </select>
                {formData.event === '__other__' && (
                  <input
                    type="text"
                    value={formData.event === '__other__' ? '' : formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    placeholder="Enter custom milestone"
                    className="mt-2 w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Location (Optional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingStepIndex(null); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Updating...' : 'Update Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminShipmentTimeline;