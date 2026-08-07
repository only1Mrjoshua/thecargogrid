import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-[#10B981]" />,
    error: <AlertCircle size={20} className="text-[#EF4444]" />,
    info: <Info size={20} className="text-[#2B0071]" />,
  };

  const bgColors = {
    success: 'bg-[#10B981]/10 border-[#10B981]/20',
    error: 'bg-[#EF4444]/10 border-[#EF4444]/20',
    info: 'bg-[#2B0071]/10 border-[#2B0071]/20',
  };

  const textColors = {
    success: 'text-[#10B981]',
    error: 'text-[#EF4444]',
    info: 'text-[#2B0071]',
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md animate-slide-down">
      <div className={`flex items-center justify-between p-4 rounded-xl border ${bgColors[type]} shadow-lg`}>
        <div className="flex items-center gap-3">
          {icons[type]}
          <p className={`text-sm font-medium ${textColors[type]}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;