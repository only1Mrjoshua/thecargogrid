import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Send, Clock, MapPin, AlertCircle, CheckCircle, X } from 'lucide-react';

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

const statusOptions = [
  'Order Received',
  'Processing',
  'In Transit',
  'Arrived at Facility',
  'Customs Hold',
  'Customs Fee Pending',
  'Shipment Delayed',
  'Cleared',
  'Out for Delivery',
  'Delivered',
];

const locationOptions = [
  'Lagos, Nigeria',
  'Dubai, UAE',
  'London, UK',
  'Manchester, UK',
  'Edinburgh, UK',
  'Glasgow, UK',
  'Birmingham, UK',
  'Liverpool, UK',
  'Bristol, UK',
  'Leeds, UK',
];

const currencyOptions = ['USD', 'GBP', 'EUR'];

function AdminUpdateShipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    location: '',
    description: '',
    dateTime: '',
    nextAction: '',
  });
  // Customs fee state
  const [feeAmount, setFeeAmount] = useState('');
  const [feeCurrency, setFeeCurrency] = useState('USD');
  const [feePaid, setFeePaid] = useState(false);
  const [feeDescription, setFeeDescription] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load shipment data
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const response = await api.get(`/shipments/${id}`);
        const data = response.data.shipment;
        setShipment(data);
        setFormData({
          status: data.status || 'Order Received',
          location: data.location || data.currentLocation || '',
          description: data.description || '',
          dateTime: data.dateTime || new Date().toISOString().slice(0, 16),
          nextAction: data.nextAction || '',
        });
        // Load fee data if exists
        if (data.fees) {
          setFeeAmount(data.fees.total !== undefined ? data.fees.total : '');
          setFeeCurrency(data.fees.currency || 'USD');
          setFeePaid(data.fees.paid || false);
          setFeeDescription(data.fees.description || 'Customs processing fee');
        } else {
          setFeeAmount('');
          setFeeCurrency('USD');
          setFeePaid(false);
          setFeeDescription('Customs processing fee');
        }
        setNotFound(false);
      } catch (err) {
        console.error('Error fetching shipment:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShipment();
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updatedData = {
        ...shipment,
        status: formData.status,
        location: formData.location,
        currentLocation: formData.location,
        description: formData.description,
        dateTime: formData.dateTime,
        nextAction: formData.nextAction,
        lastUpdated: new Date().toISOString(),
        // Include fee data
        fees: {
          total: parseFloat(feeAmount) || 0,
          currency: feeCurrency,
          paid: feePaid,
          description: feeDescription || 'Customs processing fee',
          breakdown: shipment.fees?.breakdown || [],
        },
      };

      await api.put(`/shipments/${id}`, updatedData);
      setSuccess(true);

      setTimeout(() => {
        navigate('/admin/shipments');
      }, 2000);
    } catch (err) {
      console.error('Error updating shipment:', err);
      setError(err.response?.data?.message || 'Failed to update shipment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if customs-related status
  const isCustomsStatus = ['Customs Hold', 'Customs Fee Pending'].includes(formData.status);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading shipment...</span>
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

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-[#10B981] shadow-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-[#10B981]" />
        </div>
        <h3 className="text-xl font-bold text-[#1A1A2E]">Update Successful</h3>
        <p className="text-gray-600 mt-2">
          Shipment {shipment.id} has been updated. {isCustomsStatus && feePaid && 'The customs fee has been marked as paid.'}
        </p>
        <Link to="/admin/shipments" className="mt-6 inline-block btn-primary text-sm py-2 px-6">
          Return to Shipments
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/shipments"
          className="p-2 text-[#1A1A2E]/60 hover:text-[#1A1A2E] hover:bg-[#F8F9FD] rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold text-[#1A1A2E]">Update Shipment</h2>
        <span className="text-sm text-gray-400 font-mono ml-2">{shipment.id}</span>
      </div>

      {error && (
        <div className="mb-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-3 text-sm text-[#EF4444] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
            >
              <option value="">Select a location</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Date & Time</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Next Action</label>
            <input
              type="text"
              name="nextAction"
              value={formData.nextAction}
              onChange={handleChange}
              placeholder="e.g., Awaiting customs inspection"
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Provide details about the shipment update..."
            className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] resize-y"
          />
        </div>

        {/* Customs Fee Section – only shown for customs-related statuses */}
        {isCustomsStatus && (
          <div className="border-t border-[#FF5500]/20 pt-4 mt-4">
            <h3 className="text-sm font-bold text-[#FF5500] uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
              Customs Fee Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Fee Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Currency</label>
                <select
                  value={feeCurrency}
                  onChange={(e) => setFeeCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                >
                  {currencyOptions.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Fee Description</label>
                <input
                  type="text"
                  value={feeDescription}
                  onChange={(e) => setFeeDescription(e.target.value)}
                  placeholder="Customs processing fee"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#1A1A2E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feePaid}
                    onChange={(e) => setFeePaid(e.target.checked)}
                    className="w-4 h-4 accent-[#10B981] rounded border-[#E2E5F0]"
                  />
                  Fee Paid
                  {feePaid && (
                    <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                      Marked as Paid
                    </span>
                  )}
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Marking the fee as paid will update the shipment record. The customer will still be able to see the payment status on their tracking page.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#F8F9FD] rounded-xl p-4 text-sm text-gray-600 border border-[#E2E5F0]">
          <div className="flex items-start gap-2">
            <Send size={16} className="text-[#2B0071] mt-0.5" />
            <p>
              <span className="font-semibold">Email Notification:</span> When you save, an email will be sent to the customer ({shipment.email || 'customer email'}) with the update details.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
          <Link
            to="/admin/shipments"
            className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Update
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminUpdateShipment;