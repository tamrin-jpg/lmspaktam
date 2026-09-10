import React from 'react';
import { useLMS } from '../context/LMSContext';
import { Bell, Clock, CheckCircle2, AlertTriangle, MessageSquare, Award, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationDropdown: React.FC<Props> = ({ isOpen, onClose, onNavigateTab }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentUser } = useLMS();

  if (!isOpen) return null;

  const relevantNotifs = notifications.filter((n) => {
    if (n.recipientRole === 'all') return true;
    return n.recipientRole === currentUser.role;
  });

  const getIcon = (type: string, urgency: string) => {
    if (type === 'deadline') {
      return <Clock className={`w-4 h-4 ${urgency === 'high' ? 'text-rose-500' : 'text-amber-500'}`} />;
    }
    if (type === 'attendance') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    if (type === 'forum') {
      return <MessageSquare className="w-4 h-4 text-sky-500" />;
    }
    if (type === 'grade') {
      return <Award className="w-4 h-4 text-indigo-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div
      id="notification-dropdown-menu"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h4 className="font-semibold text-sm text-slate-800">Notifikasi & Tenggat Waktu</h4>
          <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700">
            {relevantNotifs.filter((n) => !n.read).length} Baru
          </span>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          title="Tandai semua dibaca"
        >
          <Check className="w-3.5 h-3.5" />
          Semua Dibaca
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {relevantNotifs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Tidak ada notifikasi aktif saat ini.
          </div>
        ) : (
          relevantNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.linkTab) {
                  onNavigateTab(item.linkTab);
                  onClose();
                }
              }}
              className={`p-3 text-left transition cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                !item.read ? 'bg-indigo-50/50' : ''
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  item.type === 'deadline'
                    ? 'bg-rose-50 border border-rose-100'
                    : item.type === 'attendance'
                    ? 'bg-emerald-50 border border-emerald-100'
                    : 'bg-indigo-50 border border-indigo-100'
                }`}
              >
                {getIcon(item.type, item.urgency)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-xs font-semibold truncate ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-1.5">{item.message}</p>
                {item.deadline && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                    <Clock className="w-3 h-3" />
                    Batas: {item.deadline}
                  </div>
                )}
              </div>
              {!item.read && <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />}
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-500">
          Notifikasi tenggat diperbarui secara real-time otomatis.
        </p>
      </div>
    </div>
  );
};
