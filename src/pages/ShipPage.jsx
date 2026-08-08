import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Truck, Globe, MapPin, User, Mail, Phone,
  Building, Calendar, Clock, Info, AlertCircle, CheckCircle,
  CreditCard, Lock, ChevronRight, ChevronLeft, Shield,
  DollarSign, Home, Briefcase, Box, Ruler, Weight, FileText,
  Upload, Plus, Minus, X, Download, Receipt, MessageCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { publicApi } from '../api/publicApi';
import { useToast } from '../context/ToastContext';

// ----- Mock data for countries, states, cities (simplified) -----
const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy'];
const ukStates = ['England', 'Scotland', 'Wales', 'Northern Ireland'];
const cities = ['London', 'Manchester', 'Edinburgh', 'Glasgow', 'Birmingham', 'Liverpool', 'Bristol', 'Leeds'];
const packageCategories = ['Electronics', 'Clothing', 'Books', 'Fragile', 'Documents', 'Medical', 'Other'];

const servicePrices = {
  doorToDoor: 10,
  pickupService: 8,
  professionalPackaging: 12,
  signatureOnDelivery: 5,
  shipmentInsurance: 15,
  customsAssistance: 20,
  warehouseStorage: 7,
};

// ----- Step definitions -----
const steps = [
  { id: 'sender', label: 'Sender' },
  { id: 'receiver', label: 'Receiver' },
  { id: 'package', label: 'Package' },
  { id: 'options', label: 'Options' },
  { id: 'additional', label: 'Services' },
  { id: 'review', label: 'Review' },
  { id: 'payment', label: 'Payment' },
  { id: 'success', label: 'Success' },
];

// ----- Main component -----
function ShipPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ----- State -----
  const [currentStep, setCurrentStep] = useState(0);
  const [quote, setQuote] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  // Form data across all steps
  const [formData, setFormData] = useState({
    // Sender
    senderName: '',
    senderCompany: '',
    senderEmail: '',
    senderPhone: '',
    senderCountry: '',
    senderState: '',
    senderCity: '',
    senderStreet: '',
    senderPostal: '',
    pickupDate: '',
    pickupTime: '',
    pickupInstructions: '',

    // Receiver
    receiverName: '',
    receiverCompany: '',
    receiverEmail: '',
    receiverPhone: '',
    receiverCountry: '',
    receiverState: '',
    receiverCity: '',
    receiverStreet: '',
    receiverPostal: '',
    deliveryInstructions: '',

    // Package
    packageTitle: '',
    packageCategory: '',
    packageDescription: '',
    packageCount: 1,
    packageWeight: 0,
    packageLength: 0,
    packageWidth: 0,
    packageHeight: 0,
    declaredValue: 0,
    isFragile: false,
    isDangerous: false,
    insuranceOption: false,
    packageImages: [],
    deliverySpeed: 'standard',
    insurance: false,
    estimatedValue: 0,

    shippingOption: 'standard',
    doorToDoor: false,
    pickupService: false,
    professionalPackaging: false,
    signatureOnDelivery: false,
    shipmentInsurance: false,
    customsAssistance: false,
    warehouseStorage: false,
  });

  // --- "Other" values for selects ---
  const [otherValues, setOtherValues] = useState({
    senderCountry: '',
    senderState: '',
    senderCity: '',
    receiverCountry: '',
    receiverState: '',
    receiverCity: '',
    packageCategory: '',
  });

  const [showOtherInput, setShowOtherInput] = useState({
    senderCountry: false,
    senderState: false,
    senderCity: false,
    receiverCountry: false,
    receiverState: false,
    receiverCity: false,
    packageCategory: false,
  });

  const otherPlaceholders = {
    senderCountry: 'Enter your country',
    senderState: 'Enter your state/province',
    senderCity: 'Enter your city',
    receiverCountry: 'Enter recipient country',
    receiverState: 'Enter recipient state/province',
    receiverCity: 'Enter recipient city',
    packageCategory: 'Enter package category',
  };

  const handleSelectChange = (field, value, otherField) => {
    if (value === '__other__') {
      setShowOtherInput(prev => ({ ...prev, [field]: true }));
      updateForm(field, otherValues[otherField] || '');
    } else {
      setShowOtherInput(prev => ({ ...prev, [field]: false }));
      updateForm(field, value);
    }
  };

  const handleOtherChange = (field, value, otherField) => {
    setOtherValues(prev => ({ ...prev, [otherField]: value }));
    updateForm(field, value);
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // ----- Image Upload (supports multiple files) -----
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const oversized = files.some(f => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setUploadError('One or more images exceed 5MB. Please resize them.');
      return;
    }

    setIsUploadingImage(true);
    setUploadError('');
    setUploadProgress({ done: 0, total: files.length });

    try {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = async () => {
            try {
              const response = await publicApi.post('/upload/package-image', {
                image: reader.result,
              });
              setUploadProgress(prev => ({ ...prev, done: prev.done + 1 }));
              resolve(response.data.url);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
        });
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        packageImages: [...prev.packageImages, ...urls],
      }));
      showToast(`${urls.length} image(s) uploaded successfully!`, 'success');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload one or more images. Please try again.');
      showToast('Failed to upload images.', 'error');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress({ done: 0, total: 0 });
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      packageImages: prev.packageImages.filter((_, i) => i !== index),
    }));
  };

  // ----- Quote calculation -----
  const calculateQuote = () => {
    const baseRate = 15;
    const weightFactor = formData.packageWeight * 2.5;
    const distanceFactor = (formData.senderCity && formData.receiverCity && formData.senderCity !== formData.receiverCity) ? 10 : 5;
    let speedFactor = 0;
    if (formData.deliverySpeed === 'express') speedFactor = 20;
    else if (formData.deliverySpeed === 'priority') speedFactor = 35;
    const insuranceFee = formData.insurance ? (formData.estimatedValue || 0) * 0.02 : 0;
    const handlingFee = 5;
    const shippingFee = baseRate + weightFactor + distanceFactor + speedFactor;
    const total = shippingFee + insuranceFee + handlingFee;

    let deliveryTime = '2-4 business days';
    if (formData.deliverySpeed === 'express') deliveryTime = '1-2 business days';
    if (formData.deliverySpeed === 'priority') deliveryTime = 'Next business day';

    setQuote({
      shippingFee: parseFloat(shippingFee.toFixed(2)),
      insuranceFee: parseFloat(insuranceFee.toFixed(2)),
      handlingFee: parseFloat(handlingFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      deliveryTime,
      currency: 'USD',
    });
  };

  // ----- Confirm Booking (called from Review step) -----
  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!quote) calculateQuote();

      const payload = {
        sender: {
          name: formData.senderName,
          email: formData.senderEmail,
          phone: formData.senderPhone,
          address: `${formData.senderStreet}, ${formData.senderCity}, ${formData.senderState}, ${formData.senderCountry}`,
        },
        receiver: {
          name: formData.receiverName,
          email: formData.receiverEmail,
          phone: formData.receiverPhone,
          address: `${formData.receiverStreet}, ${formData.receiverCity}, ${formData.receiverState}, ${formData.receiverCountry}`,
        },
        package: {
          category: formData.packageCategory,
          weight: formData.packageWeight,
          length: formData.packageLength,
          width: formData.packageWidth,
          height: formData.packageHeight,
          declaredValue: formData.declaredValue,
          isFragile: formData.isFragile,
          isDangerous: formData.isDangerous,
          description: formData.packageDescription,
          images: formData.packageImages,
        },
        shippingOption: formData.shippingOption,
        additionalServices: Object.keys(servicePrices).filter(k => formData[k]),
        quote: {
          total: quote ? quote.total : 0,
          currency: quote ? quote.currency : 'USD',
          breakdown: [
            { label: 'Shipping Fee', amount: quote?.shippingFee || 0 },
            { label: 'Insurance Fee', amount: quote?.insuranceFee || 0 },
            { label: 'Handling Fee', amount: quote?.handlingFee || 0 },
            ...Object.keys(servicePrices).filter(k => formData[k]).map(k => ({
              label: k.replace(/([A-Z])/g, ' $1').trim(),
              amount: servicePrices[k],
            })),
          ],
          deliveryTime: quote?.deliveryTime || 'N/A',
        },
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
      };

      const response = await publicApi.post('/shipments/public/book', payload);
      const { trackingNumber } = response.data;

      setTrackingNumber(trackingNumber);
      setBookingSuccess(true);
      showToast('Shipment booked successfully!', 'success');

      // Move to payment step to contact support
      nextStep();
    } catch (err) {
      console.error('Booking error:', err);
      const msg = err.response?.data?.message || 'Failed to book shipment. Please try again.';
      showToast(msg, 'error');
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ----- WhatsApp contact (Payment step) -----
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello The Cargo Grid,\n\nI have just booked a shipment with tracking number ${trackingNumber}.\nI would like to arrange payment. Please guide me on how to proceed.\n\nThank you.`
    );
    window.open(`https://wa.me/15123255688?text=${message}`, '_blank');
  };

  // ----- Reset form -----
  const resetForm = () => {
    setFormData({
      senderName: '',
      senderCompany: '',
      senderEmail: '',
      senderPhone: '',
      senderCountry: '',
      senderState: '',
      senderCity: '',
      senderStreet: '',
      senderPostal: '',
      pickupDate: '',
      pickupTime: '',
      pickupInstructions: '',
      receiverName: '',
      receiverCompany: '',
      receiverEmail: '',
      receiverPhone: '',
      receiverCountry: '',
      receiverState: '',
      receiverCity: '',
      receiverStreet: '',
      receiverPostal: '',
      deliveryInstructions: '',
      packageTitle: '',
      packageCategory: '',
      packageDescription: '',
      packageCount: 1,
      packageWeight: 0,
      packageLength: 0,
      packageWidth: 0,
      packageHeight: 0,
      declaredValue: 0,
      isFragile: false,
      isDangerous: false,
      insuranceOption: false,
      packageImages: [],
      deliverySpeed: 'standard',
      insurance: false,
      estimatedValue: 0,
      shippingOption: 'standard',
      doorToDoor: false,
      pickupService: false,
      professionalPackaging: false,
      signatureOnDelivery: false,
      shipmentInsurance: false,
      customsAssistance: false,
      warehouseStorage: false,
    });
    setOtherValues({
      senderCountry: '',
      senderState: '',
      senderCity: '',
      receiverCountry: '',
      receiverState: '',
      receiverCity: '',
      packageCategory: '',
    });
    setShowOtherInput({
      senderCountry: false,
      senderState: false,
      senderCity: false,
      receiverCountry: false,
      receiverState: false,
      receiverCity: false,
      packageCategory: false,
    });
    setCurrentStep(0);
    setQuote(null);
    setBookingSuccess(false);
    setTrackingNumber('');
    setError(null);
    setUploadError('');
  };

  // ----- Render step content -----
  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderSenderStep();
      case 1: return renderReceiverStep();
      case 2: return renderPackageStep();
      case 3: return renderShippingOptionsStep();
      case 4: return renderAdditionalServicesStep();
      case 5: return renderReviewStep();
      case 6: return renderPaymentStep();
      case 7: return renderSuccessStep();
      default: return null;
    }
  };

  // Helper: render a select with "Other" option
  const renderSelectWithOther = (
    label,
    field,
    options,
    otherField,
    placeholder = 'Select...',
    required = false
  ) => {
    const value = formData[field];
    const showOther = showOtherInput[field];
    const otherValue = otherValues[otherField] || '';

    return (
      <div>
        <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
          {label} {required && '*'}
        </label>
        {!showOther ? (
          <select
            value={value}
            onChange={(e) => handleSelectChange(field, e.target.value, otherField)}
            className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="__other__">Other</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={otherValue}
              onChange={(e) => handleOtherChange(field, e.target.value, otherField)}
              placeholder={otherPlaceholders[otherField] || 'Enter custom value'}
              className="flex-1 px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
            />
            <button
              type="button"
              onClick={() => {
                setShowOtherInput(prev => ({ ...prev, [field]: false }));
                updateForm(field, '');
              }}
              className="px-3 py-2 text-sm text-[#EF4444] hover:text-[#2B0071] transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  };

  // ----- SENDER STEP -----
  const renderSenderStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Sender Information</h2>
        <p className="text-gray-500 text-sm mb-6">Provide your contact and pickup details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Full Name *</label>
            <input type="text" value={formData.senderName} onChange={e => updateForm('senderName', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Company (Optional)</label>
            <input type="text" value={formData.senderCompany} onChange={e => updateForm('senderCompany', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Email Address *</label>
            <input type="email" value={formData.senderEmail} onChange={e => updateForm('senderEmail', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Phone Number *</label>
            <input type="tel" value={formData.senderPhone} onChange={e => updateForm('senderPhone', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          {renderSelectWithOther('Country', 'senderCountry', countries, 'senderCountry')}
          {renderSelectWithOther('State/Province', 'senderState', ukStates, 'senderState')}
          {renderSelectWithOther('City', 'senderCity', cities, 'senderCity')}
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Street Address</label>
            <input type="text" value={formData.senderStreet} onChange={e => updateForm('senderStreet', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Postal Code</label>
            <input type="text" value={formData.senderPostal} onChange={e => updateForm('senderPostal', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Preferred Pickup Date</label>
            <input type="date" value={formData.pickupDate} onChange={e => updateForm('pickupDate', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Preferred Pickup Time</label>
            <input type="time" value={formData.pickupTime} onChange={e => updateForm('pickupTime', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Pickup Instructions (Optional)</label>
          <textarea rows="2" value={formData.pickupInstructions} onChange={e => updateForm('pickupInstructions', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // ----- RECEIVER STEP -----
  const renderReceiverStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Receiver Information</h2>
        <p className="text-gray-500 text-sm mb-6">Provide the delivery destination details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Full Name *</label>
            <input type="text" value={formData.receiverName} onChange={e => updateForm('receiverName', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Company (Optional)</label>
            <input type="text" value={formData.receiverCompany} onChange={e => updateForm('receiverCompany', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Email Address *</label>
            <input type="email" value={formData.receiverEmail} onChange={e => updateForm('receiverEmail', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Phone Number *</label>
            <input type="tel" value={formData.receiverPhone} onChange={e => updateForm('receiverPhone', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          {renderSelectWithOther('Country', 'receiverCountry', countries, 'receiverCountry')}
          {renderSelectWithOther('State/Province', 'receiverState', ukStates, 'receiverState')}
          {renderSelectWithOther('City', 'receiverCity', cities, 'receiverCity')}
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Street Address</label>
            <input type="text" value={formData.receiverStreet} onChange={e => updateForm('receiverStreet', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Postal Code</label>
            <input type="text" value={formData.receiverPostal} onChange={e => updateForm('receiverPostal', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Delivery Instructions (Optional)</label>
          <textarea rows="2" value={formData.deliveryInstructions} onChange={e => updateForm('deliveryInstructions', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="btn-secondary">← Back</button>
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // ----- PACKAGE STEP -----
  const renderPackageStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Package Information</h2>
        <p className="text-gray-500 text-sm mb-6">Describe your shipment and choose delivery options.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Package Title *</label>
            <input type="text" value={formData.packageTitle} onChange={e => updateForm('packageTitle', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          {renderSelectWithOther('Package Category', 'packageCategory', packageCategories, 'packageCategory')}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Description</label>
            <textarea rows="2" value={formData.packageDescription} onChange={e => updateForm('packageDescription', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Number of Packages</label>
            <input type="number" min="1" value={formData.packageCount} onChange={e => updateForm('packageCount', parseInt(e.target.value) || 1)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Weight (kg)</label>
            <input type="number" step="0.1" value={formData.packageWeight} onChange={e => updateForm('packageWeight', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Length (cm)</label>
            <input type="number" value={formData.packageLength} onChange={e => updateForm('packageLength', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Width (cm)</label>
            <input type="number" value={formData.packageWidth} onChange={e => updateForm('packageWidth', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Height (cm)</label>
            <input type="number" value={formData.packageHeight} onChange={e => updateForm('packageHeight', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Declared Value (£)</label>
            <input type="number" min="0" step="10" value={formData.declaredValue} onChange={e => updateForm('declaredValue', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Delivery Speed</label>
            <select value={formData.deliverySpeed} onChange={e => updateForm('deliverySpeed', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              <option value="standard">Standard (2-4 business days)</option>
              <option value="express">Express (1-2 business days)</option>
              <option value="priority">Priority (Next business day)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.insurance} onChange={e => updateForm('insurance', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            Add Insurance
          </label>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Estimated Package Value (£)</label>
            <input type="number" min="0" step="10" value={formData.estimatedValue} onChange={e => updateForm('estimatedValue', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
            Upload Package Images (Optional)
          </label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#2B0071]/5 text-[#2B0071] rounded-xl hover:bg-[#2B0071]/10 transition-colors">
                <Upload size={18} />
                <span>Choose Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
              {isUploadingImage && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
                  Uploading {uploadProgress.done}/{uploadProgress.total}...
                </span>
              )}
              {uploadError && <span className="text-sm text-[#EF4444]">{uploadError}</span>}
            </div>
            {formData.packageImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {formData.packageImages.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg border border-[#E2E5F0] overflow-hidden group">
                    <img src={url} alt={`Package ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isFragile} onChange={e => updateForm('isFragile', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            This is a fragile item
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isDangerous} onChange={e => updateForm('isDangerous', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            This contains dangerous goods
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.insuranceOption} onChange={e => updateForm('insuranceOption', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            Add shipment insurance
          </label>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="btn-secondary">← Back</button>
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // ----- SHIPPING OPTIONS STEP -----
  const renderShippingOptionsStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Shipping Options</h2>
        <p className="text-gray-500 text-sm mb-6">Choose your preferred delivery service.</p>
        <div className="space-y-4">
          {['standard', 'express', 'priority'].map((speed) => {
            const isSelected = formData.shippingOption === speed;
            const prices = { standard: 0, express: 20, priority: 35 };
            const times = { standard: '2-4 business days', express: '1-2 business days', priority: 'Next business day' };
            const labels = { standard: 'Standard', express: 'Express', priority: 'Priority' };
            return (
              <div key={speed} onClick={() => updateForm('shippingOption', speed)} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-[#FF5500] bg-[#FF5500]/5' : 'border-[#E2E5F0] hover:border-[#2B0071]/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#1A1A2E]">{labels[speed]}</h4>
                    <p className="text-sm text-gray-500">Estimated delivery: {times[speed]}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#2B0071]">+£{prices[speed]}</p>
                    <p className="text-xs text-gray-400">Includes tracking</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="btn-secondary">← Back</button>
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // ----- ADDITIONAL SERVICES STEP -----
  const renderAdditionalServicesStep = () => {
    const services = [
      { key: 'doorToDoor', label: 'Door-to-Door Delivery', price: 10 },
      { key: 'pickupService', label: 'Pickup Service', price: 8 },
      { key: 'professionalPackaging', label: 'Professional Packaging', price: 12 },
      { key: 'signatureOnDelivery', label: 'Signature on Delivery', price: 5 },
      { key: 'shipmentInsurance', label: 'Shipment Insurance', price: 15 },
      { key: 'customsAssistance', label: 'Customs Documentation Assistance', price: 20 },
      { key: 'warehouseStorage', label: 'Warehouse Storage (per day)', price: 7 },
    ];
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Additional Services</h2>
          <p className="text-gray-500 text-sm mb-6">Customise your shipment with optional extras.</p>
          <div className="space-y-3">
            {services.map((svc) => (
              <label key={svc.key} className="flex items-center justify-between p-3 border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={formData[svc.key]} onChange={() => updateForm(svc.key, !formData[svc.key])} className="w-4 h-4 accent-[#FF5500]" />
                  <span className="text-sm font-medium">{svc.label}</span>
                </div>
                <span className="text-sm text-gray-500">+£{svc.price}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={prevStep} className="btn-secondary">← Back</button>
            <button onClick={nextStep} className="btn-primary">Continue →</button>
          </div>
        </div>
      </div>
    );
  };

  // ----- REVIEW STEP (updated button) -----
  const renderReviewStep = () => {
    if (!quote) calculateQuote();

    let extraTotal = 0;
    Object.keys(servicePrices).forEach(key => {
      if (formData[key]) extraTotal += servicePrices[key];
    });
    const shippingPrice = { standard: 0, express: 20, priority: 35 }[formData.shippingOption] || 0;
    const totalCost = (quote ? quote.total : 0) + extraTotal + shippingPrice;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Review Your Shipment</h2>
          <p className="text-gray-500 text-sm mb-6">Verify all information before confirming your booking.</p>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-[#2B0071]">Sender</h4>
                <p className="text-sm">{formData.senderName}<br />{formData.senderEmail}<br />{formData.senderPhone}<br />{formData.senderStreet}, {formData.senderCity}, {formData.senderState}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#2B0071]">Receiver</h4>
                <p className="text-sm">{formData.receiverName}<br />{formData.receiverEmail}<br />{formData.receiverPhone}<br />{formData.receiverStreet}, {formData.receiverCity}, {formData.receiverState}</p>
              </div>
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Package Summary</h4>
              <p className="text-sm">{formData.packageTitle} – {formData.packageCategory}<br />Weight: {formData.packageWeight} kg, Dimensions: {formData.packageLength}×{formData.packageWidth}×{formData.packageHeight} cm</p>
              {formData.packageImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.packageImages.map((url, i) => (
                    <img key={i} src={url} alt={`Package ${i+1}`} className="w-12 h-12 object-cover rounded-lg border" />
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Shipping Method</h4>
              <p className="text-sm capitalize">{formData.shippingOption} – {quote?.deliveryTime || 'N/A'}</p>
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Additional Services</h4>
              {Object.keys(servicePrices).filter(k => formData[k]).length === 0 ? <p className="text-sm text-gray-400">None selected</p> :
                <ul className="text-sm list-disc pl-4">{Object.keys(servicePrices).filter(k => formData[k]).map(k => <li key={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</li>)}</ul>
              }
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Cost Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Shipping Fee</span><span>{quote?.currency || '$'}{quote?.shippingFee || 0}</span></div>
                <div className="flex justify-between"><span>Insurance Fee</span><span>{quote?.currency || '$'}{quote?.insuranceFee || 0}</span></div>
                <div className="flex justify-between"><span>Handling Fee</span><span>{quote?.currency || '$'}{quote?.handlingFee || 0}</span></div>
                <div className="flex justify-between"><span>Shipping Option</span><span>{quote?.currency || '$'}{shippingPrice}</span></div>
                <div className="flex justify-between"><span>Additional Services</span><span>{quote?.currency || '$'}{extraTotal}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#E2E5F0]"><span>Grand Total</span><span>{quote?.currency || '$'}{totalCost.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={prevStep} className="btn-secondary">← Back</button>
            <button
              onClick={handleConfirmBooking}
              disabled={isProcessing}
              className="btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : (
                <><Package size={18} /> Confirm Booking & Proceed to Payment</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ----- PAYMENT STEP (WhatsApp contact) -----
  const renderPaymentStep = () => {
    if (!quote) calculateQuote();

    let extraTotal = 0;
    Object.keys(servicePrices).forEach(key => {
      if (formData[key]) extraTotal += servicePrices[key];
    });
    const shippingPrice = { standard: 0, express: 20, priority: 35 }[formData.shippingOption] || 0;
    const totalCost = (quote ? quote.total : 0) + extraTotal + shippingPrice;

    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Payment & Contact Support</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your shipment has been booked. To complete the process, please contact our support team to arrange payment.
            </p>

            <div className="space-y-6">
              <div className="p-4 bg-[#F8F9FD] rounded-xl border border-[#E2E5F0]">
                <p className="text-sm font-medium text-[#1A1A2E]">Booking Summary</p>
                <div className="flex justify-between text-sm mt-2">
                  <span>Total Amount Due</span>
                  <span className="font-bold text-[#2B0071]">{quote?.currency || '$'}{totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Tracking Number</span>
                  <span className="font-mono font-bold text-[#2B0071]">{trackingNumber}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Booking ref: SHIP-{Date.now().toString().slice(-6)}</p>
              </div>

              <div className="flex flex-col items-center gap-4 p-6 border border-[#E2E5F0] rounded-xl bg-[#25D366]/5">
                <MessageCircle size={48} className="text-[#25D366]" />
                <p className="text-sm text-gray-600 text-center max-w-md">
                  Our support team will assist you with payment. Click the button below to start a chat.
                </p>
                <button
                  onClick={openWhatsApp}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#1DA851] transition-colors shadow-lg hover:shadow-xl"
                >
                  <MessageCircle size={20} />
                  Contact Support
                </button>
                <p className="text-xs text-gray-400 mt-2">Our team will respond within minutes.</p>
              </div>

              <button
                onClick={() => navigate(`/track?tracking=${trackingNumber}`)}
                className="w-full btn-secondary py-3 text-base"
              >
                Track Your Shipment
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sticky top-[100px]">
            <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Booking Ref</span><span className="font-mono">SHIP-{Date.now().toString().slice(-6)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Sender</span><span>{formData.senderName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{quote?.currency || '$'}{totalCost.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----- SUCCESS STEP -----
  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8">
        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-[#10B981]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A2E]">Shipment Booked!</h2>
        <p className="text-gray-600 mt-2">Your shipment has been successfully created.</p>
        <div className="mt-6 bg-[#F8F9FD] rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Tracking Number</span><span className="font-mono font-bold text-[#2B0071]">{trackingNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Booking Reference</span><span className="font-mono">SHIP-{Date.now().toString().slice(-6)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Pickup Date</span><span>{formData.pickupDate || 'To be confirmed'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Estimated Delivery</span><span>{quote?.deliveryTime || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-[#2B0071] font-semibold">Order Received</span></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"><Download size={16} /> Download Invoice</button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"><Receipt size={16} /> Download Receipt</button>
          <button onClick={() => navigate(`/track?tracking=${trackingNumber}`)} className="btn-primary text-sm py-2.5">Track Shipment</button>
          <button onClick={resetForm} className="btn-secondary text-sm py-2.5">Book Another Shipment</button>
        </div>
      </div>
    </div>
  );

  // ----- Main render -----
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
        <div className="container-custom py-8 md:py-12">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-[#2B0071]/70 hover:text-[#2B0071] transition-colors duration-200 mb-6 group">
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A1A2E] flex items-center gap-3">
              <Package size={32} className="text-[#2B0071]" />
              Ship a Package
            </h1>
            <p className="text-gray-500">Get a quote, book your shipment, and track it in real‑time.</p>
          </div>

          {currentStep < 7 && currentStep > 0 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {steps.slice(0, 7).map((step, idx) => {
                const stepIndex = idx;
                const isActive = currentStep === stepIndex;
                const isPast = currentStep > stepIndex;
                return (
                  <div key={step.id} className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isPast ? 'bg-[#10B981] text-white' : isActive ? 'bg-[#2B0071] text-white' : 'bg-[#E2E5F0] text-gray-400'}`}>
                      {isPast ? <CheckCircle size={14} /> : stepIndex + 1}
                    </div>
                    <span className={`${isActive ? 'font-semibold text-[#2B0071]' : 'text-gray-400'}`}>{step.label}</span>
                    {stepIndex < 6 && <span className="text-gray-300">→</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4">
            {renderStep()}
          </div>

          {currentStep < 7 && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
                  <Shield size={20} className="text-[#2B0071]" />
                  Secure & Trusted Payment
                </h3>
                <p className="text-sm text-gray-600">All payments are processed through industry‑standard secure gateways. Your financial information is never stored on our servers.</p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Lock size={14} /> PCI Compliant</span>
                  <span className="flex items-center gap-1"><CheckCircle size={14} className="text-[#10B981]" /> Encrypted</span>
                  <span className="flex items-center gap-1"><Shield size={14} /> Fraud Protection</span>
                </div>
              </div>
              <div className="mt-6 bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
                  <Info size={20} className="text-[#2B0071]" />
                  Frequently Asked Questions (Shipping)
                </h3>
                <div className="space-y-3 text-sm">
                  <details className="border-b border-[#E2E5F0] pb-2">
                    <summary className="font-semibold cursor-pointer text-[#1A1A2E]">How do I get a shipping quote?</summary>
                    <p className="text-gray-600 mt-1">Fill in the sender, receiver, and package details. The quote will be calculated automatically during the review step.</p>
                  </details>
                  <details className="border-b border-[#E2E5F0] pb-2">
                    <summary className="font-semibold cursor-pointer text-[#1A1A2E]">What payment methods do you accept?</summary>
                    <p className="text-gray-600 mt-1">You will contact our support team via WhatsApp to arrange payment. They will guide you through the process and confirm your booking.</p>
                  </details>
                  <details className="border-b border-[#E2E5F0] pb-2">
                    <summary className="font-semibold cursor-pointer text-[#1A1A2E]">When will my package be picked up?</summary>
                    <p className="text-gray-600 mt-1">You can select your preferred pickup date and time during booking. We’ll confirm the exact time via email.</p>
                  </details>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Need help? <button onClick={() => navigate('/contact')} className="text-[#FF5500] hover:underline">Contact Support</button></p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ShipPage;