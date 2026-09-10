import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { NotificationDropdown } from './NotificationDropdown';
import { LoginModal } from './LoginModal';
import {
  GraduationCap,
  Bell,
  Radio,
  BookOpen,
  LogOut,
  ChevronDown,
  Layers,
  RotateCcw,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    unreadNotificationsCount,
    attendanceSession,
    classes,
    selectedClassId,
    setSelectedClassId,
    logout,
    resetAllDataToEmpty,
    loadDemoData,
    isDataEmpty,
  } = useLMS();

  const [showNotif, setShowNotif] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState('');

  const handleConfirmReset = () => {
    resetAllDataToEmpty();
    setShowResetConfirmModal(false);
    setShowUserDropdown(false);
    setActiveTab('kelas');
    setResetSuccessToast('Seluruh data berhasil dikosongkan. Anda dapat mulai dari awal!');
    setTimeout(() => setResetSuccessToast(''), 4000);
  };

  const handleRestoreDemo = () => {
    loadDemoData();
    setShowUserDropdown(false);
    setResetSuccessToast('Data contoh (demo) berhasil dimuat kembali!');
    setTimeout(() => setResetSuccessToast(''), 4000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    SMK <span className="text-indigo-600">SmartLMS</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Kejuruan & Vokasi
                  </span>
                  {isDataEmpty && (
                    <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Mulai Dari Awal (Kosong)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block">
                  Sistem Manajemen Kelas, Kuis Interaktif & Absensi Real-time
                </p>
              </div>
            </div>

            {/* Middle: Real-time Attendance Pulse (if active) */}
            {attendanceSession && attendanceSession.isActive && (
              <button
                type="button"
                onClick={() => setActiveTab('absensi')}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition animate-pulse cursor-pointer"
              >
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Absensi Real-time Aktif ({attendanceSession.className})</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </button>
            )}

            {/* Right: Actions, Notification, User */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* If Guru & classes exist: Class selector quick filter */}
              {currentUser.role === 'guru' && classes.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">Kelas:</span>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.jurusan.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset Data Button for Guru / Admin */}
              {currentUser.role === 'guru' && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                  title="Kosongkan seluruh data untuk memulai konfigurasi dari awal"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
                  <span>Reset Data Kosong</span>
                </button>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  id="navbar-notif-button"
                  onClick={() => setShowNotif(!showNotif)}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition cursor-pointer"
                  title="Notifikasi & Pengingat Tenggat Waktu"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <NotificationDropdown
                  isOpen={showNotif}
                  onClose={() => setShowNotif(false)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    setShowNotif(false);
                  }}
                />
              </div>

              {/* User Profile & Account Menu */}
              <div className="relative pl-2 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition group text-left cursor-pointer border border-transparent hover:border-slate-200"
                  title="Menu Akun & Profil Pengguna"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="hidden xl:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                        {currentUser.name}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          currentUser.role === 'guru'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {currentUser.role === 'guru' ? 'Guru Produktif' : currentUser.className || 'Siswa SMK'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b border-slate-100 mb-1">
                      <p className="font-bold text-xs text-slate-900 line-clamp-1">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{currentUser.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {currentUser.role === 'guru' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            <span>Akses Guru Pengampu</span>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3 h-3 text-blue-600" />
                            <span>NISN: {currentUser.nip_nisn || '-'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowLoginModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-indigo-600" />
                      <span>Masuk dengan Akun Lain</span>
                    </button>

                    {currentUser.role === 'guru' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowResetConfirmModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-rose-500" />
                        <span>Reset Data LMS (Mulai Kosong)</span>
                      </button>
                    )}

                    {isDataEmpty && (
                      <button
                        type="button"
                        onClick={handleRestoreDemo}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-amber-600" />
                        <span>Muat Contoh Data Demo</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                          setShowLoginModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-slate-400" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-50/80 border-t border-slate-200/60 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Dashboard Analitik
            </button>

            {currentUser.role === 'guru' && (
              <button
                onClick={() => setActiveTab('kelas')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'kelas'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Manajemen Kelas SMK & Akun Siswa
              </button>
            )}

            <button
              onClick={() => setActiveTab('kuis')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'kuis'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Kuis Interaktif & Nilai Otomatis
            </button>

            <button
              onClick={() => setActiveTab('absensi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'absensi'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Presensi Real-time
              {attendanceSession?.isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('forum')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'forum'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Forum Diskusi Siswa-Guru
            </button>

            <button
              onClick={() => setActiveTab('rapor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'rapor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Laporan Akademik (Unduh PDF)
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {resetSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{resetSuccessToast}</span>
        </div>
      )}

      {/* Modal Konfirmasi Reset Data Kosong */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-rose-600 text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">Kosongkan Seluruh Data LMS?</h3>
                <p className="text-rose-100 text-xs">Mulai konfigurasi sekolah SMK dari awal (nol)</p>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                Tindakan ini akan mengosongkan seluruh data simulasi yang ada saat ini:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                <li>Daftar rombongan belajar kelas SMK</li>
                <li>Daftar peserta didik dan akun login siswa</li>
                <li>Bank kuis dan riwayat pengumpulan nilai</li>
                <li>Sesi presensi dan rekap absensi harian</li>
              </ul>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium mt-3">
                💡 <strong>Tersimpan Otomatis:</strong> Setelah dikosongkan, Anda dapat membuat kelas dan mendaftarkan siswa baru. Semua data yang Anda buat akan langsung tersimpan otomatis di sistem.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Ya, Kosongkan Data Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};
