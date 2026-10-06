import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full no-print"
      aria-live="polite"
    >
      {notifications.map((n) => {
        let bg = 'bg-slate-900 text-white border-slate-700';
        let icon = <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;

        if (n.type === 'success') {
          bg = 'bg-emerald-900/95 text-emerald-50 border-emerald-700';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
        } else if (n.type === 'error') {
          bg = 'bg-rose-900/95 text-rose-50 border-rose-700';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
        } else if (n.type === 'warning') {
          bg = 'bg-amber-900/95 text-amber-50 border-amber-700';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
        }

        return (
          <div
            key={n.id}
            className={`flex items-start justify-between p-3.5 rounded-xl border shadow-lg backdrop-blur-md text-xs leading-relaxed transition-all transform animate-in slide-in-from-bottom-2 ${bg}`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div className="pt-0.5">{n.message}</div>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="ml-3 p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
