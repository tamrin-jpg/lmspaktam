import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { UserRole } from '../types';
import { LogIn, GraduationCap, School, ShieldCheck, X, AlertCircle, KeyRound, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginUser } = useLMS();
  const [role, setRole] = useState<UserRole>('guru');
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim()) {
      setErrorMsg(role === 'siswa' ? 'Silakan masukkan NISN atau Email Siswa.' : 'Silakan masukkan NIP atau Email Guru.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Authenticate via LMSContext
    const result = loginUser(emailOrId, role, password);

    setLoading(false);

    if (result.success) {
      setEmailOrId('');
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg(result.message || 'Login gagal. Periksa kembali NISN/Email dan kata sandi Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="login-modal-box"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
            aria-label="Tutup modal login"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <School className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Portal Masuk LMS SMK</h2>
              <p className="text-indigo-100 text-xs">Akses Sistem Pembelajaran & Manajemen Kelas</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Role Selector Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => {
                setRole('guru');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                role === 'guru'
                  ? 'bg-white shadow-sm text-indigo-700 font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Guru / Pengajar
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('siswa');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                role === 'siswa'
                  ? 'bg-white shadow-sm text-blue-700 font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Siswa SMK
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {role === 'guru' ? 'NIP atau Alamat Email Guru' : 'NISN (10 Digit) atau Email Siswa'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder={
                    role === 'guru'
                      ? 'NIP Guru atau admin@smk.sch.id'
                      : 'Masukkan NISN siswa (cth: 0064219801)'
                  }
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {role === 'siswa' ? (
                  <span>
                    💡 <strong>Info Siswa:</strong> Akun dibuat oleh guru di Manajemen Kelas. Kata sandi default adalah <strong>nomor NISN</strong> Anda.
                  </span>
                ) : (
                  <span>
                    💡 <strong>Info Guru:</strong> Gunakan NIP/Email guru pengampu yang terdaftar di sistem.
                  </span>
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Memverifikasi...' : 'Masuk ke SmartLMS'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
