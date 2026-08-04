// src/components/TrackingForm.jsx
import { Search, Loader2 } from 'lucide-react';

function TrackingForm({
  trackingNumber,
  onTrackingChange,
  onSubmit,
  error,
  isLoading,
  compact = false,
  label = 'Track your package',
}) {
  return (
    <div className="w-full">
      {!compact && (
        <label htmlFor="tracking-input" className="block text-sm font-semibold text-[#1A1A2E] mb-2">
          {label}
        </label>
      )}

      <form onSubmit={onSubmit} className="relative" noValidate>
        <div className={`flex flex-col sm:flex-row gap-3 ${compact ? '' : ''}`}>
          <div className="relative flex-1">
            <input
              id="tracking-input"
              type="text"
              value={trackingNumber}
              onChange={onTrackingChange}
              placeholder="Enter your tracking number"
              className={`
                w-full px-4 py-3.5 text-base bg-white border rounded-xl
                transition-all duration-200
                placeholder:text-gray-400 text-[#1A1A2E]
                tracking-input
                ${error ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'border-[#E2E5F0] hover:border-[#2B0071]/30'}
                focus:outline-none
                ${compact ? 'py-2.5 text-sm' : ''}
              `}
              aria-invalid={!!error}
              aria-describedby={error ? 'tracking-error' : undefined}
              disabled={isLoading}
            />
            {!compact && (
              <Search
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden="true"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white
              bg-[#FF5500] rounded-xl transition-all duration-300
              hover:bg-[#e64a00] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25
              focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
              ${compact ? 'py-2.5 px-5 text-sm' : ''}
              min-w-[140px] sm:min-w-[160px]
            `}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Tracking...</span>
              </>
            ) : (
              <>
                <span>Track Package</span>
                {!compact && <Search size={18} className="opacity-80" />}
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p id="tracking-error" className="mt-2 text-sm text-[#EF4444] flex items-center gap-1.5 animate-slide-down">
            <span className="w-1 h-1 rounded-full bg-[#EF4444]" />
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default TrackingForm;