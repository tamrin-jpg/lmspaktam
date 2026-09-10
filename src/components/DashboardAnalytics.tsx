import React from 'react';
import { useLMS } from '../context/LMSContext';
import {
  Users,
  Award,
  Radio,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  BookOpen,
  HelpCircle,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const DashboardAnalytics: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    currentUser,
    classes,
    students,
    quizzes,
    submissions,
    attendanceSession,
    attendanceRecords,
    notifications,
    hasStudentAttendedToday,
  } = useLMS();

  // Urgent pending deadlines for student
  const pendingQuizzesForStudent = quizzes.filter((q) => {
    const hasSubmitted = submissions.some((s) => s.quizId === q.id && s.studentId === currentUser.id);
    return !hasSubmitted;
  });

  // Calculate teacher stats
  const totalStudents = students.length;
  const avgClassScore =
    submissions.length > 0
      ? Math.round(submissions.reduce((a, b) => a + b.percentage, 0) / submissions.length)
      : 0;
  const passedSubmissions = submissions.filter((s) => s.passed).length;
  const passRate = submissions.length > 0 ? Math.round((passedSubmissions / submissions.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Clean Slate Alert Banner for Teacher */}
      {currentUser.role === 'guru' && classes.length === 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Sistem Siap Digunakan (Data Masih Kosong)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Mulai kelola sekolah kejuruan Anda dengan menambahkan Rombongan Belajar Kelas SMK dan Akun Siswa.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('kelas')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Buka Manajemen Kelas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-16 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-md mb-3 border border-white/15 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser.role === 'guru' ? 'Portal Pengajar SMK' : 'Portal Siswa SMK'} • Tahun Ajaran 2026/2027
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Selamat Datang, {currentUser.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              {currentUser.role === 'guru'
                ? 'Pantau progres capaian belajar kompetensi kejuruan, penilaian kuis otomatis, absensi real-time, dan manajemen rombel kelas SMK Anda.'
                : `Anda terdaftar di kelas ${currentUser.className || 'X RPL 1'} (${currentUser.jurusan || 'Rekayasa Perangkat Lunak'}). Periksa pengingat tenggat waktu dan isi absensi kelas.`}
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-3 flex-wrap">
            {currentUser.role === 'guru' ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('absensi')}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer active:scale-95"
                >
                  <Radio className="w-4 h-4 text-slate-950" />
                  Presensi Real-time
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('kuis')}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  Kuis & Nilai
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('rapor')}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition cursor-pointer active:scale-95"
              >
                <Award className="w-4 h-4 text-white" />
                Lihat Rapor Saya
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5 GELEMBUNG UTAMA DASBOR (BESAR & WARNA BERVARIASI)            */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600 animate-ping"></span>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-800">
              Pusat Modul & Gelembung Fitur Utama
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Klik gelembung modul untuk langsung beralih
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* GELEMBUNG 1: Dashboard Analitik (Indigo Blue) */}
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white text-left shadow-lg shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition duration-300 cursor-pointer border border-indigo-400/30 flex flex-col justify-between min-h-[160px]"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between z-10">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/25">
                <BarChart3 className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-indigo-100 border border-white/20">
                Ringkasan
              </span>
            </div>
            <div className="z-10 mt-4">
              <h3 className="font-extrabold text-base leading-tight text-white group-hover:text-indigo-100 transition-colors">
                Dashboard Analitik
              </h3>
              <p className="text-xs text-indigo-200 mt-1 line-clamp-2">
                Monitoring capaian KKM & statistik kelas real-time
              </p>
            </div>
          </button>

          {/* GELEMBUNG 2: Kuis Interaktif & Nilai Otomatis (Amber Orange) */}
          <button
            type="button"
            onClick={() => onNavigateTab('kuis')}
            className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white text-left shadow-lg shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 transition duration-300 cursor-pointer border border-amber-300/30 flex flex-col justify-between min-h-[160px]"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between z-10">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/25">
                <Award className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/20 text-amber-100 border border-white/20">
                {quizzes.length} Kuis
              </span>
            </div>
            <div className="z-10 mt-4">
              <h3 className="font-extrabold text-base leading-tight text-white group-hover:text-amber-100 transition-colors">
                Kuis Interaktif & Nilai Otomatis
              </h3>
              <p className="text-xs text-amber-100 mt-1 line-clamp-2">
                Pengerjaan bertempo waktu & kalkulasi instan
              </p>
            </div>
          </button>

          {/* GELEMBUNG 3: Presensi Real-time (Emerald Teal) */}
          <button
            type="button"
            onClick={() => onNavigateTab('absensi')}
            className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white text-left shadow-lg shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition duration-300 cursor-pointer border border-emerald-300/30 flex flex-col justify-between min-h-[160px]"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between z-10">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/25">
                <Radio className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/20 text-emerald-100 border border-white/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                {attendanceSession?.isActive ? 'Sesi Aktif' : 'Standby'}
              </span>
            </div>
            <div className="z-10 mt-4">
              <h3 className="font-extrabold text-base leading-tight text-white group-hover:text-emerald-100 transition-colors">
                Presensi Real-time
              </h3>
              <p className="text-xs text-emerald-100 mt-1 line-clamp-2">
                Absensi interaktif & rekap kehadiran per kelas
              </p>
            </div>
          </button>

          {/* GELEMBUNG 4: Forum Diskusi Siswa-Guru (Cyan Sky Blue) */}
          <button
            type="button"
            onClick={() => onNavigateTab('forum')}
            className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-sky-500 via-cyan-600 to-blue-700 text-white text-left shadow-lg shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition duration-300 cursor-pointer border border-sky-300/30 flex flex-col justify-between min-h-[160px]"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between z-10">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/25">
                <BookOpen className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/20 text-sky-100 border border-white/20">
                Tanya Jawab
              </span>
            </div>
            <div className="z-10 mt-4">
              <h3 className="font-extrabold text-base leading-tight text-white group-hover:text-sky-100 transition-colors">
                Forum Diskusi Siswa-Guru
              </h3>
              <p className="text-xs text-sky-100 mt-1 line-clamp-2">
                Tanya jawab kejuruan, praktikum & persiapan PKL
              </p>
            </div>
          </button>

          {/* GELEMBUNG 5: Laporan Akademik (Unduh PDF) (Purple Violet) */}
          <button
            type="button"
            onClick={() => onNavigateTab('rapor')}
            className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-900 text-white text-left shadow-lg shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 transition duration-300 cursor-pointer border border-purple-300/30 flex flex-col justify-between min-h-[160px]"
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between z-10">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/25">
                <FileSpreadsheet className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/20 text-purple-100 border border-white/20">
                PDF Siap Cetak
              </span>
            </div>
            <div className="z-10 mt-4">
              <h3 className="font-extrabold text-base leading-tight text-white group-hover:text-purple-100 transition-colors">
                Laporan Akademik (Unduh PDF)
              </h3>
              <p className="text-xs text-purple-100 mt-1 line-clamp-2">
                Rapor resmi capaian hasil belajar berstandar SMK
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. SISWA VIEW: Tenggat Waktu Alert & Absensi Prompt            */}
      {/* ============================================================== */}
      {currentUser.role === 'siswa' && (
        <div className="space-y-6">
          {/* Active Attendance Alert Card for Student */}
          {attendanceSession && attendanceSession.isActive && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Radio className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    Sesi Presensi Terbuka Sekarang
                  </span>
                  <h3 className="text-base font-bold mt-1">
                    {attendanceSession.title} ({attendanceSession.className})
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {hasStudentAttendedToday
                      ? '✅ Anda sudah mengisi absensi kehadiran sesi ini.'
                      : 'Segera klik tombol di bawah untuk presensi kehadiran hari ini!'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('absensi')}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-emerald-900 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                {hasStudentAttendedToday ? 'Cek Status Kehadiran' : 'Klik Absensi Kehadiran'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Pending Deadlines Warning Card */}
          {pendingQuizzesForStudent.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-extrabold text-rose-950">
                    Pengingat Otomatis Tenggat Waktu ({pendingQuizzesForStudent.length} Kuis Menunggu)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-700">Prioritas Tinggi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingQuizzesForStudent.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-3.5 bg-white rounded-xl border border-rose-200/80 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase">
                        {quiz.subject}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {quiz.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Batas: {new Date(quiz.deadline).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('kuis')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition shrink-0 cursor-pointer"
                    >
                      Kerjakan Kuis
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Progress Stats (Gelembung Metrik Siswa) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Siswa Gelembung 1: Rata-rata Nilai (Indigo) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/40 rounded-3xl border-2 border-indigo-200/80 shadow-lg shadow-indigo-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-indigo-900 uppercase">
                  Rata-rata Nilai
                </span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">88.5</p>
              <div className="mt-3">
                <span className="text-xs text-indigo-700 font-extrabold bg-indigo-100/80 px-2.5 py-1 rounded-full border border-indigo-200 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Tuntas Di Atas KKM (75)
                </span>
              </div>
            </div>

            {/* Siswa Gelembung 2: Tingkat Kehadiran (Emerald) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 rounded-3xl border-2 border-emerald-200/80 shadow-lg shadow-emerald-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-emerald-900 uppercase">
                  Tingkat Kehadiran
                </span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">96%</p>
              <p className="text-xs text-emerald-800 font-bold mt-3 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                48 Hadir • 1 Izin • 1 Sakit
              </p>
            </div>

            {/* Siswa Gelembung 3: Kuis Selesai (Amber Orange) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 rounded-3xl border-2 border-amber-200/80 shadow-lg shadow-amber-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-amber-900 uppercase">
                  Kuis Selesai
                </span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
                {quizzes.length - pendingQuizzesForStudent.length} / {quizzes.length}
              </p>
              <p className="text-xs text-amber-800 font-bold mt-3 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
                Semua evaluasi tuntas bernilai
              </p>
            </div>

            {/* Siswa Gelembung 4: Peringkat Kelas (Violet Purple) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/40 rounded-3xl border-2 border-purple-200/80 shadow-lg shadow-purple-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-purple-900 uppercase">
                  Peringkat Kelas
                </span>
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">#2</p>
              <p className="text-xs text-purple-800 font-bold mt-3 bg-purple-100/70 px-2.5 py-1 rounded-full border border-purple-200 inline-block">
                Top Siswa dari 32 di {currentUser.className || 'X RPL 1'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. GURU VIEW: Dashboard Analitik Kelas Real-time              */}
      {/* ============================================================== */}
      {currentUser.role === 'guru' && (
        <div className="space-y-8">
          {/* 4 Stat Cards Gelembung Besar & Berwarna Bervariasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Gelembung 1: Total Siswa Aktif (Indigo Blue) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/50 rounded-3xl border-2 border-indigo-200/80 shadow-lg shadow-indigo-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-indigo-900 uppercase">
                  Total Siswa Aktif
                </span>
                <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Users className="w-7 h-7" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
                {totalStudents} <span className="text-base font-bold text-indigo-600">Siswa</span>
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-800 font-bold bg-indigo-100/80 px-2.5 py-1 rounded-full border border-indigo-200 w-fit">
                <span>Tersebar di {classes.length} Rombel Kejuruan SMK</span>
              </div>
            </div>

            {/* Gelembung 2: Rata-rata Nilai Kuis (Emerald Teal) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 rounded-3xl border-2 border-emerald-200/80 shadow-lg shadow-emerald-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-emerald-900 uppercase">
                  Rata-rata Nilai Kuis
                </span>
                <div className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Award className="w-7 h-7" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
                {avgClassScore} <span className="text-base font-bold text-emerald-600">/ 100</span>
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{passRate}% Siswa Mencapai KKM (75)</span>
              </div>
            </div>

            {/* Gelembung 3: Kehadiran Kelas (Amber Sunset) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50 rounded-3xl border-2 border-amber-200/80 shadow-lg shadow-amber-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-amber-900 uppercase">
                  Kehadiran Kelas
                </span>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
                94.2%
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200 w-fit">
                <span>Rata-rata presensi kumulatif semester</span>
              </div>
            </div>

            {/* Gelembung 4: Sesi Presensi Hari Ini (Purple Violet) */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/50 rounded-3xl border-2 border-purple-200/80 shadow-lg shadow-purple-500/10 hover:shadow-xl transition duration-300">
              <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-wider text-purple-900 uppercase">
                  Sesi Presensi Hari Ini
                </span>
                <div className="w-13 h-13 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Radio className={`w-7 h-7 ${attendanceSession?.isActive ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
                {attendanceSession && attendanceSession.isActive ? (
                  <span className="text-emerald-600 flex items-center gap-2">
                    Aktif
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  </span>
                ) : (
                  <span className="text-slate-600">Standby</span>
                )}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-800 font-bold bg-purple-100/80 px-2.5 py-1 rounded-full border border-purple-200 w-fit">
                <span>
                  {attendanceSession && attendanceSession.isActive
                    ? `${attendanceSession.className} (${attendanceRecords.length} Siswa Hadir)`
                    : 'Siap diaktifkan untuk kelas hari ini'}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Visuals & Performance Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Class Quiz Performance Breakdown (Col 8) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Analitik Penilaian Otomatis Kuis per Materi Kejuruan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbandingan rerata perolehan nilai siswa terhadap ambang batas KKM (75)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('kuis')}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  Detail Kuis →
                </button>
              </div>

              {/* Progress bars for each quiz */}
              <div className="space-y-4 pt-1">
                {quizzes.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    Belum ada kuis yang dibuat. Klik tombol di kanan atas untuk membuat kuis baru.
                  </div>
                ) : (
                  quizzes.map((q) => {
                    const qSubs = submissions.filter((s) => s.quizId === q.id);
                    const avg =
                      qSubs.length > 0
                        ? Math.round(qSubs.reduce((a, b) => a + b.percentage, 0) / qSubs.length)
                        : 80;

                    return (
                      <div key={q.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 truncate max-w-sm">
                            {q.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono text-[11px]">
                              {qSubs.length} Mengumpulkan
                            </span>
                            <span className="font-extrabold font-mono text-indigo-700">
                              Rerata: {avg}/100
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              avg >= 85
                                ? 'bg-emerald-500'
                                : avg >= 75
                                ? 'bg-indigo-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${avg}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Attendance quick chart preview */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Kompeten (≥75)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Rata-rata Kelas
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span> Perlu Bimbingan (&lt;75)
                </span>
              </div>
            </div>

            {/* Quick Action & Top Students (Col 4) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Aksi Cepat Pengajar SMK
                </h4>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('absensi')}
                    className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left text-xs font-bold text-emerald-950 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600" />
                      Buka Presensi Real-Time
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('kelas')}
                    className="w-full p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left text-xs font-bold text-indigo-950 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                      Import Siswa via Excel
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('kuis')}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs font-bold text-slate-900 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-600" />
                      Buat Kuis Interaktif Baru
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('rapor')}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs font-bold text-slate-900 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-600" />
                      Cetak Rapor Akademik (PDF)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Top Student Ranking Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Siswa Berprestasi (X RPL 1)
                  </h4>
                  <span className="text-[10px] text-slate-400">Peringkat</span>
                </div>

                <div className="space-y-2.5">
                  {students.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Belum ada siswa terdaftar.</p>
                  ) : (
                    students.slice(0, 4).map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-950'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                            {s.name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-indigo-700">
                          {s.averageScore}/100
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
