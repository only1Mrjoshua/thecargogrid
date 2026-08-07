import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Clock, Package, Truck, 
  CheckCircle, Circle, AlertCircle, ArrowLeft,
  ChevronRight
} from 'lucide-react';
import TrackingForm from '../components/TrackingForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { publicApi } from '../api/publicApi';
import { isCustomsStatus } from '../utils/helpers';

function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const trackingParam = searchParams.get('tracking') || '';
  const [trackingNumber, setTrackingNumber] = useState(trackingParam);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trackingParam) {
      const fetchShipment = async () => {
        setLoading(true);
        setError('');
        setNotFound(false);
        setShipment(null);
        try {
          const response = await publicApi.get(`/shipments/public/${trackingParam}`);
          setShipment(response.data.shipment);
        } catch (err) {
          if (err.response?.status === 404) {
            setNotFound(true);
            setError('We couldn\'t find a shipment with that tracking number. Please check the number and try again.');
          } else {
            setError('An error occurred while fetching shipment details.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchShipment();
    } else {
      setShipment(null);
      setNotFound(false);
      setError('');
    }
  }, [trackingParam]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter your tracking number.');
      return;
    }
    setError('');
    setIsLoading(true);
    setSearchParams({ tracking: trackingNumber.trim() });
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
    if (error) setError('');
  };

  const goHome = () => navigate('/');

  const getStatusInfo = (status) => {
    const map = {
      'Order Received': { label: 'Order Received', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
      Processing: { label: 'Processing', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
      'In Transit': { label: 'In Transit', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
      'Arrived at Facility': { label: 'Arrived at Facility', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
      Customs: { label: 'Customs Clearance', color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
      'Customs Hold': { label: 'Customs Hold', color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
      'Customs Fee Pending': { label: 'Customs Fee Pending', color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
      'Shipment Delayed': { label: 'Shipment Delayed', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
      Cleared: { label: 'Cleared', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
      'Out for Delivery': { label: 'Out for Delivery', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
      Delivered: { label: 'Delivered', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
      Pending: { label: 'Pending', color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
    };
    return map[status] || { label: status, color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const StepIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-[#10B981]" />;
      case 'active':
        return <Circle size={18} className="text-[#2B0071] fill-[#2B0071]/20 animate-pulse" />;
      default:
        return <Circle size={18} className="text-[#E2E5F0]" />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#F8F9FD] pt-[72px]">
        <div className="container-custom py-8 md:py-12">
          <button
            onClick={goHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2B0071]/70 hover:text-[#2B0071] transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </button>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
              <h1 className="heading-section text-[#1A1A2E] text-2xl sm:text-3xl mb-2">
                Track Your Shipment
              </h1>
              <p className="body-small mb-6">
                Enter your tracking number to get real‑time status updates.
              </p>
              <TrackingForm
                trackingNumber={trackingNumber}
                onTrackingChange={handleInputChange}
                onSubmit={handleTrack}
                error={error}
                isLoading={isLoading}
                compact={false}
                label=""
              />
            </div>
          </div>

          {loading && (
            <div className="max-w-4xl mx-auto mt-10 text-center">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">Loading shipment...</span>
              </div>
            </div>
          )}

          {shipment && !loading && (
            <div className="max-w-4xl mx-auto mt-10 space-y-8">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusInfo(shipment.status).bg} ${getStatusInfo(shipment.status).color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {getStatusInfo(shipment.status).label}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{shipment.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1A1A2E]">
                      {shipment.origin} → {shipment.destination}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Current Location</div>
                    <div className="font-semibold text-[#1A1A2E] flex items-center gap-1.5 justify-end">
                      <MapPin size={16} className="text-[#FF5500]" />
                      {shipment.currentLocation || shipment.location || '—'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E2E5F0]">
                  <div>
                    <div className="text-xs text-gray-500">Shipment Date</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-[#2B0071]/40" />
                      {shipment.date ? new Date(shipment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Est. Delivery</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-[#FF5500]" />
                      {shipment.expectedDelivery ? new Date(shipment.expectedDelivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Origin</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <MapPin size={14} className="text-[#2B0071]/40" />
                      {shipment.origin}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Destination</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <MapPin size={14} className="text-[#2B0071]/40" />
                      {shipment.destination}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4">
                {isCustomsStatus(shipment.status) && (
                  <button
                    onClick={() => navigate(`/customs?tracking=${encodeURIComponent(shipment.id)}`)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF5500] hover:text-[#2B0071] transition-colors duration-200 group"
                  >
                    View customs hold details
                    <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                )}
                <button
                  onClick={() => navigate(`/shipment?tracking=${encodeURIComponent(shipment.id)}`)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B0071] hover:text-[#FF5500] transition-colors duration-200 group"
                >
                  View full shipment details
                  <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-[#2B0071]" />
                  Shipment Timeline
                </h3>
                <div className="space-y-0 relative">
                  {(shipment.steps || shipment.history || []).map((step, index) => {
                    const isLast = index === (shipment.steps || shipment.history || []).length - 1;
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';
                    const isUpcoming = step.status === 'upcoming';
                    const label = step.event || step.label || '';

                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-[#E2E5F0] transition-all duration-300">
                            <StepIcon status={step.status} />
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 min-h-[28px] transition-colors duration-500 ${
                              isCompleted || isActive ? 'bg-[#2B0071]' : 'bg-[#E2E5F0]'
                            }`} />
                          )}
                        </div>
                        <div className="pb-6 pt-0.5 flex-1">
                          <div className={`text-sm font-semibold ${isUpcoming ? 'text-gray-400' : 'text-[#1A1A2E]'}`}>
                            {label}
                            {isActive && (
                              <span className="ml-2 text-xs font-normal text-[#2B0071] bg-[#2B0071]/5 px-2 py-0.5 rounded-full">
                                In progress
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="ml-2 text-xs font-normal text-gray-400">Pending</span>
                            )}
                          </div>
                          {step.date && (
                            <div className="text-xs text-gray-400 mt-0.5">{step.date}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {notFound && !shipment && trackingParam && (
            <div className="max-w-3xl mx-auto mt-10 text-center">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8">
                <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No shipment found</h3>
                <p className="text-gray-500">We couldn’t find any shipment with the tracking number <strong>{trackingParam}</strong>.</p>
                <p className="text-gray-400 text-sm mt-2">Please double‑check the number and try again.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TrackPage;