import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Package, User, Mail, Phone,
  FileText, CreditCard, MessageCircle, ArrowLeft, Download,
  CheckCircle, Circle, AlertCircle, Clock, Info, Image,
  X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { publicApi } from '../api/publicApi';
import { isCustomsStatus } from '../utils/helpers';

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
  return map[status] || { label: status || 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100' };
};

function ShipmentDetailsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tracking = searchParams.get('tracking') || '';
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  // Lightbox state
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (tracking) {
      const fetchShipment = async () => {
        setLoading(true);
        setError('');
        setNotFound(false);
        try {
          const response = await publicApi.get(`/shipments/public/${tracking}`);
          const data = response.data.shipment;
          setShipment(data);
          // Extract images
          const imgArray = data.packageDetails?.images || [];
          setImages(imgArray);
        } catch (err) {
          if (err.response?.status === 404) {
            setNotFound(true);
          } else {
            setError('Failed to load shipment details.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchShipment();
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [tracking]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, images]);

  const goBack = () => navigate(-1);
  const goToTrack = () => navigate('/track');

  const handleDownload = (docName) => {
    alert(`Downloading ${docName} (demo)`);
  };

  // Contact support via WhatsApp
  const handleContactSupport = () => {
    const phone = '15123255688';
    const message = encodeURIComponent('Hello, I need support regarding my shipment.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleViewDocuments = () => {
    alert('Showing required documents (demo)');
  };

  // WhatsApp payment link
  const getWhatsAppLink = () => {
    const message = encodeURIComponent(
      `Hello The Cargo Grid,\n\nI would like to pay the outstanding fees for shipment ${shipment.id || shipment.trackingNumber}.\n\nPlease guide me on how to complete the payment.\n\nThank you.`
    );
    return `https://wa.me/15123255688?text=${message}`;
  };

  // Lightbox navigation
  const openLightbox = (index) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Error</h3>
          <p className="text-gray-500">{error}</p>
          <button onClick={goToTrack} className="mt-6 btn-primary">Go to Track Page</button>
        </div>
      </div>
    );
  }

  if (notFound || !shipment) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Shipment not found</h3>
          <p className="text-gray-500">We couldn't find details for tracking number <strong>{tracking}</strong>.</p>
          <button onClick={goToTrack} className="mt-6 btn-primary">Go to Track Page</button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(shipment.status);
  const timelineSteps = shipment.history || shipment.steps || [];

  return (
    <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
      <div className="container-custom py-8 md:py-12">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2B0071]/70 hover:text-[#2B0071] transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
          Back
        </button>

        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-[#1A1A2E]">Shipment Details</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono">Tracking #: {shipment.id || shipment.trackingNumber}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isCustomsStatus(shipment.status) && (
                <button
                  onClick={() => navigate(`/customs?tracking=${encodeURIComponent(tracking)}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#FF5500] bg-[#FF5500]/5 rounded-lg hover:bg-[#FF5500]/10 transition-colors"
                >
                  <AlertCircle size={16} />
                  Customs Hold Details
                </button>
              )}
              <button
                onClick={() => navigate(`/documents?tracking=${encodeURIComponent(tracking)}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#2B0071] bg-[#2B0071]/5 rounded-lg hover:bg-[#2B0071]/10 transition-colors"
              >
                <FileText size={16} />
                View Documents
              </button>
              {/* Download Docs button removed */}
              <button
                onClick={handleContactSupport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-lg hover:bg-[#F8F9FD] transition-colors"
              >
                <MessageCircle size={16} />
                Contact
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                <Package size={20} className="text-[#2B0071]" />
                Shipment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Package Type</div>
                  <div className="font-medium">{shipment.packageType || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Weight</div>
                  <div className="font-medium">{shipment.weight || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Shipment Date</div>
                  <div className="font-medium">
                    {shipment.date ? new Date(shipment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Estimated Delivery</div>
                  <div className="font-medium">
                    {shipment.expectedDelivery ? new Date(shipment.expectedDelivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Origin</div>
                  <div className="font-medium flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#2B0071]/40" />
                    {shipment.origin}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Destination</div>
                  <div className="font-medium flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#FF5500]" />
                    {shipment.destination}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Current Location</div>
                  <div className="font-medium">{shipment.currentLocation || shipment.location || '—'}</div>
                </div>
                {shipment.fees && (
                  <div>
                    <div className="text-xs text-gray-500">Fees</div>
                    <div className="font-medium">
                      {shipment.fees.total} {shipment.fees.currency}
                      {shipment.fees.paid ? (
                        <span className="ml-2 text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">Paid</span>
                      ) : (
                        <span className="ml-2 text-xs text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-full">Unpaid</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Package Images with clickable thumbnails */}
            {images.length > 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <Image size={20} className="text-[#2B0071]" />
                  Package Images
                </h3>
                <div className="flex flex-wrap gap-3">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => openLightbox(idx)}
                      className="w-24 h-24 rounded-lg border border-[#E2E5F0] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow hover:scale-105 transform duration-200"
                    >
                      <img src={url} alt={`Package ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8 text-center text-gray-400">
                <Image size={24} className="mx-auto mb-2" />
                <p>No images uploaded for this shipment.</p>
              </div>
            )}

            {shipment.sender && shipment.recipient && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
                  <h4 className="text-sm font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
                    <User size={16} className="text-[#2B0071]" />
                    Sender
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium">{shipment.sender.name}</p>
                    {shipment.sender.company && <p className="text-gray-500">{shipment.sender.company}</p>}
                    {shipment.sender.email && <p className="flex items-center gap-1.5 text-gray-500"><Mail size={14} /> {shipment.sender.email}</p>}
                    {shipment.sender.phone && <p className="flex items-center gap-1.5 text-gray-500"><Phone size={14} /> {shipment.sender.phone}</p>}
                    <p className="text-gray-500 text-sm">{shipment.sender.address}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
                  <h4 className="text-sm font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
                    <User size={16} className="text-[#FF5500]" />
                    Recipient
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-medium">{shipment.recipient.name}</p>
                    {shipment.recipient.company && <p className="text-gray-500">{shipment.recipient.company}</p>}
                    {shipment.recipient.email && <p className="flex items-center gap-1.5 text-gray-500"><Mail size={14} /> {shipment.recipient.email}</p>}
                    {shipment.recipient.phone && <p className="flex items-center gap-1.5 text-gray-500"><Phone size={14} /> {shipment.recipient.phone}</p>}
                    <p className="text-gray-500 text-sm">{shipment.recipient.address}</p>
                  </div>
                </div>
              </div>
            )}

            {shipment.documents && shipment.documents.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-[#2B0071]" />
                  Documents
                </h3>
                <div className="space-y-2">
                  {shipment.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-[#E2E5F0] last:border-0">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#2B0071]/40" />
                        <span className="font-medium text-sm">{doc.name}</span>
                        {doc.required && <span className="text-xs text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-full">Required</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                <Clock size={20} className="text-[#2B0071]" />
                Shipment History
              </h3>
              {timelineSteps.length === 0 ? (
                <p className="text-gray-400 text-sm">No timeline events yet.</p>
              ) : (
                <div className="space-y-0">
                  {timelineSteps.map((step, index) => {
                    const isLast = index === timelineSteps.length - 1;
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';
                    const isUpcoming = step.status === 'upcoming';
                    const label = step.event || step.label || '';

                    return (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 border-[#E2E5F0] transition-all duration-300">
                            {isCompleted && <CheckCircle size={12} className="text-[#10B981]" />}
                            {isActive && <Circle size={12} className="text-[#2B0071] fill-[#2B0071]/20 animate-pulse" />}
                            {isUpcoming && <Circle size={12} className="text-[#E2E5F0]" />}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 min-h-[20px] transition-colors duration-500 ${
                              isCompleted || isActive ? 'bg-[#2B0071]' : 'bg-[#E2E5F0]'
                            }`} />
                          )}
                        </div>
                        <div className="pb-4 pt-0.5 flex-1">
                          <div className={`text-sm font-medium ${isUpcoming ? 'text-gray-400' : 'text-[#1A1A2E]'}`}>
                            {label}
                          </div>
                          {step.date && <div className="text-xs text-gray-400">{step.date}</div>}
                          {step.description && <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {shipment.fees && shipment.fees.breakdown && shipment.fees.breakdown.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
                <h4 className="text-sm font-bold text-[#1A1A2E] mb-3">Fee Breakdown</h4>
                <div className="space-y-1.5 text-sm">
                  {shipment.fees.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-[#E2E5F0] pb-1.5">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.amount} {shipment.fees.currency}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1.5">
                    <span>Total</span>
                    <span>{shipment.fees.total} {shipment.fees.currency}</span>
                  </div>
                  {!shipment.fees.paid && (
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 btn-primary text-sm py-2.5 bg-[#25D366] hover:bg-[#128C7E] border-none"
                    >
                      <MessageCircle size={16} />
                      Contact Support to Make Payment
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----- LIGHTBOX MODAL ----- */}
      {selectedImageIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImageIndex]}
              alt={`Package ${selectedImageIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {/* Navigation buttons – only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full"
                aria-label="Previous image"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full"
                aria-label="Next image"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ShipmentDetailsPage;