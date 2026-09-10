import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { AttendanceStatus, AttendanceRecord } from '../types';
import {
  Radio,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Users,
  Calendar,
  Check,
  FileText,
  UserCheck,
  ShieldCheck,
  Award,
  Edit3,
  Trash2,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const {
    currentUser,
    classes,
    students,
    attendanceSession,
    attendanceRecords,
    startAttendanceSession,
    closeAttendanceSession,
    submitAttendance,
    hasStudentAttendedToday,
    todayStudentAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    addManualAttendance,
  } = useLMS();

  // Teacher states
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || 'cls-x-rpl-1'
  );
  const [meetingTitle, setMeetingTitle] = useState<string>(
    'Pertemuan 5: Praktik Manipulasi DOM & Event Handler Interaktif'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [secretCode, setSecretCode] = useState<string>('SMK-RPL');

  // Attendance CRUD states
  const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('Hadir');
  const [editNotes, setEditNotes] = useState<string>('');
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);

  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualStudentId, setManualStudentId] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Hadir');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Student states
  const [studentStatus, setStudentStatus] = useState<AttendanceStatus>('Hadir');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');
  const [showNotesInput, setShowNotesInput] = useState<boolean>(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState<boolean>(false);

  // Remaining time calculation
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    if (!attendanceSession || !attendanceSession.isActive) {
      setTimeLeftStr('');
      return;
    }

    const updateTimer = () => {
      const remainingMs = new Date(attendanceSession.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftStr('Waktu Habis');
      } else {
        const totalSec = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attendanceSession]);

  // Handle Teacher Start
  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (classes.length === 0) {
      alert('Belum ada kelas yang terdaftar. Silakan buat rombel kelas terlebih dahulu di menu Manajemen Kelas.');
      return;
    }
    const classIdToUse = selectedClassId || classes[0]?.id;
    startAttendanceSession(classIdToUse, meetingTitle, durationMinutes, secretCode.trim() || undefined);
  };

  // Handle Student Submit Attendance
  const handleStudentSubmit = (statusChoice: AttendanceStatus) => {
    if (attendanceSession?.secretCode && enteredCode.trim() !== attendanceSession.secretCode) {
      setCodeError(`Kode presensi salah! Minta kode dari guru (${attendanceSession.teacherName}).`);
      return;
    }

    setCodeError('');
    const success = submitAttendance(
      statusChoice,
      studentNotes.trim() || (statusChoice === 'Hadir' ? 'Hadir tepat waktu di kelas' : undefined)
    );

    if (success) {
      setIsSuccessSubmitted(true);
      setShowNotesInput(false);
    }
  };

  // Filter students for the active class in teacher view
  const currentClassId = attendanceSession ? attendanceSession.classId : selectedClassId;
  const targetClassStudents = students.filter((s) => s.kelasId === currentClassId);

  const activeRecords = attendanceSession
    ? attendanceRecords.filter((r) => r.sessionId === attendanceSession.id)
    : attendanceRecords.filter((r) => r.classId === selectedClassId);

  const hadirCount = activeRecords.filter((r) => r.status === 'Hadir').length;
  const sakitCount = activeRecords.filter((r) => r.status === 'Sakit').length;
  const izinCount = activeRecords.filter((r) => r.status === 'Izin').length;
  const alpaCount = activeRecords.filter((r) => r.status === 'Alpa').length;
  const belumCount = Math.max(0, targetClassStudents.length - activeRecords.length);

  const handleOpenEditRecord = (record: AttendanceRecord) => {
    setRecordToEdit(record);
    setEditStatus(record.status);
    setEditNotes(record.notes || '');
  };

  const handleSaveEditRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordToEdit) return;
    updateAttendanceRecord(recordToEdit.id, {
      status: editStatus,
      notes: editNotes.trim() || undefined,
    });
    setRecordToEdit(null);
  };

  const handleConfirmDeleteRecord = () => {
    if (!recordToDelete) return;
    deleteAttendanceRecord(recordToDelete.id);
    setRecordToDelete(null);
  };

  const handleOpenManualModal = (preselectedStudentId?: string) => {
    setManualStudentId(preselectedStudentId || targetClassStudents[0]?.id || '');
    setManualStatus('Hadir');
    setManualNotes('');
    setShowManualModal(true);
  };

  const handleSaveManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === manualStudentId);
    if (!stu) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    addManualAttendance({
      sessionId: attendanceSession?.id || `manual-sess-${Date.now()}`,
      classId: stu.kelasId,
      studentId: stu.id,
      studentName: stu.name,
      studentNisn: stu.nisn,
      status: manualStatus,
      timestamp: timeStr,
      date: dateStr,
      notes: manualNotes.trim() || (manualStatus === 'Hadir' ? 'Dicatat manual oleh guru' : undefined),
    });

    setShowManualModal(false);
  };

  const handleMarkAllPresent = () => {
    const unrecordedStudents = targetClassStudents.filter(
      (s) => !activeRecords.some((r) => r.studentId === s.id)
    );
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    unrecordedStudents.forEach((stu) => {
      addManualAttendance({
        sessionId: attendanceSession?.id || `manual-sess-${Date.now()}`,
        classId: stu.kelasId,
        studentId: stu.id,
        studentName: stu.name,
        studentNisn: stu.nisn,
        status: 'Hadir',
        timestamp: timeStr,
        date: dateStr,
        notes: 'Presensi massal oleh guru',
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Sistem Presensi Real-Time SMK
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Presensi & Absensi Kehadiran Siswa
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Guru dapat mengaktifkan sesi presensi kelas secara langsung dengan durasi countdown.
              Siswa dapat mengklik absensi dengan satu sentuhan selama sesi berlangsung.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-300" />
            <div>
              <p className="text-[11px] text-slate-300 uppercase font-semibold">Tanggal Hari Ini</p>
              <p className="text-xs font-bold text-white">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SISWA VIEW: Absensi Muncul Saat Guru Mengaktifkan      */}
      {/* ========================================================= */}
      {currentUser.role === 'siswa' && (
        <div className="space-y-6">
          {attendanceSession && attendanceSession.isActive ? (
            // ACTIVE SESSION FOR STUDENT
            <div className="bg-white rounded-2xl border-2 border-emerald-400 p-6 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white text-xs font-extrabold rounded-bl-xl flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                SESI AKTIF REAL-TIME
              </div>

              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">
                  Kelas {attendanceSession.className} • {attendanceSession.subject}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1 mb-2">
                  {attendanceSession.title}
                </h2>
                <p className="text-xs text-slate-600 mb-4">
                  Pengajar: <span className="font-semibold text-slate-800">{attendanceSession.teacherName}</span>
                </p>

                {/* Countdown Box */}
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-800 font-semibold block">
                      Sisa Waktu Presensi
                    </span>
                    <span className="text-lg font-black text-emerald-950 font-mono tracking-wider">
                      {timeLeftStr || '00:00'} Menit
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-emerald-700 font-medium">
                    Ditutup pada {new Date(attendanceSession.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>

                {/* Condition: Already Attended vs Not Yet */}
                {hasStudentAttendedToday || isSuccessSubmitted ? (
                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">
                          Presensi Kehadiran Anda Telah Tercatat!
                        </h4>
                        <p className="text-xs text-emerald-700">
                          Status:{' '}
                          <span className="font-extrabold underline">
                            {todayStudentAttendanceRecord?.status || 'Hadir'}
                          </span>{' '}
                          • Dicatat pukul {todayStudentAttendanceRecord?.timestamp || 'Waktu aktif'} WIB
                        </p>
                      </div>
                    </div>
                    {todayStudentAttendanceRecord?.notes && (
                      <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-emerald-100 mt-2 italic">
                        "Catatan: {todayStudentAttendanceRecord.notes}"
                      </p>
                    )}
                  </div>
                ) : (
                  // ACTION BUTTONS FOR STUDENT
                  <div className="space-y-4">
                    {attendanceSession.secretCode && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Masukkan Kode Presensi dari Guru:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={enteredCode}
                            onChange={(e) => {
                              setEnteredCode(e.target.value);
                              setCodeError('');
                            }}
                            placeholder="Contoh: SMK-RPL"
                            className="px-3.5 py-2 text-xs uppercase font-mono tracking-wider border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48"
                          />
                          <span className="text-[11px] text-slate-500">
                            (Kode diberikan guru di depan kelas / lab)
                          </span>
                        </div>
                        {codeError && <p className="text-xs text-rose-600 font-bold mt-1">{codeError}</p>}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2">
                        Klik Status Kehadiran Anda Sekarang:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* HADIR */}
                        <button
                          type="button"
                          onClick={() => handleStudentSubmit('Hadir')}
                          className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <UserCheck className="w-6 h-6" />
                          <span>Klik HADIR Sekarang</span>
                          <span className="text-[10px] text-emerald-100 font-normal">
                            Saya hadir di kelas
                          </span>
                        </button>

                        {/* IZIN */}
                        <button
                          type="button"
                          onClick={() => {
                            setStudentStatus('Izin');
                            setShowNotesInput(true);
                          }}
                          className="p-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-6 h-6 text-amber-600" />
                          <span>Izin Dispensasi / Keperluan</span>
                          <span className="text-[10px] text-amber-700 font-normal">
                            Sertakan keterangan
                          </span>
                        </button>

                        {/* SAKIT */}
                        <button
                          type="button"
                          onClick={() => {
                            setStudentStatus('Sakit');
                            setShowNotesInput(true);
                          }}
                          className="p-4 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-sm transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <AlertCircle className="w-6 h-6 text-rose-600" />
                          <span>Sakit</span>
                          <span className="text-[10px] text-rose-700 font-normal">
                            Surat dokter / keterangan
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Notes Modal / Form if Izin or Sakit clicked */}
                    {showNotesInput && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <label className="block text-xs font-bold text-slate-800">
                          Keterangan Alasan ({studentStatus}):
                        </label>
                        <textarea
                          rows={2}
                          value={studentNotes}
                          onChange={(e) => setStudentNotes(e.target.value)}
                          placeholder={
                            studentStatus === 'Sakit'
                              ? 'Contoh: Sakit demam, istirahat di rumah / ada surat dokter'
                              : 'Contoh: Mengikuti lomba LKS SMK tingkat kota / urusan keluarga mendesak'
                          }
                          className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowNotesInput(false)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentSubmit(studentStatus)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                          >
                            Kirim Presensi {studentStatus}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // INACTIVE SESSION (Waiting for teacher)
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Belum Ada Sesi Presensi Aktif Saat Ini
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Guru Anda belum mengaktifkan sesi absensi realtime untuk kelas{' '}
                <span className="font-semibold text-slate-700">{currentUser.className || 'Anda'}</span>.
                Tombol kehadiran akan otomatis muncul ketika guru membuka sesi presensi.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200">
                <ShieldCheck className="w-4 h-4" />
                Tip: Pastikan Anda terhubung ke internet saat jam pelajaran dimulai.
              </div>
            </div>
          )}

          {/* Student's Attendance History Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Ringkasan Kehadiran Semester Ganjil Anda
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Hadir</span>
                <span className="text-2xl font-black text-emerald-900">48</span>
                <span className="text-[10px] text-emerald-700">Pertemuan</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                <span className="text-xs font-bold text-amber-800 uppercase block">Izin</span>
                <span className="text-2xl font-black text-amber-900">1</span>
                <span className="text-[10px] text-amber-700">Dispensasi</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <span className="text-xs font-bold text-blue-800 uppercase block">Sakit</span>
                <span className="text-2xl font-black text-blue-900">1</span>
                <span className="text-[10px] text-blue-700">Surat Dokter</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                <span className="text-xs font-bold text-rose-800 uppercase block">Alpa</span>
                <span className="text-2xl font-black text-rose-900">0</span>
                <span className="text-[10px] text-rose-700">Tanpa Keterangan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GURU VIEW: Aktifkan Absensi Real-time & Pantau Hadir    */}
      {/* ========================================================= */}
      {currentUser.role === 'guru' && (
        <div className="space-y-6">
          {/* Active Session Banner or Control Panel */}
          {attendanceSession && attendanceSession.isActive ? (
            <div className="bg-emerald-950 text-white rounded-2xl p-6 border-2 border-emerald-500 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-slate-950 uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
                      Sesi Presensi Sedang Berjalan
                    </span>
                    <span className="text-xs text-emerald-300 font-bold">
                      Kelas: {attendanceSession.className}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight">
                    {attendanceSession.title}
                  </h2>
                  <p className="text-xs text-emerald-200 mt-1">
                    Mata Pelajaran: {attendanceSession.subject} • Kode Rahasia:{' '}
                    <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                      {attendanceSession.secretCode || 'Tanpa Kode'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Countdown Timer */}
                  <div className="bg-black/40 border border-emerald-500/40 rounded-xl p-3 text-center min-w-[140px]">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Sisa Waktu
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-300">
                      {timeLeftStr || '00:00'}
                    </span>
                  </div>

                  {/* Close Session Button */}
                  <button
                    type="button"
                    onClick={closeAttendanceSession}
                    className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 transition cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                    Tutup Sesi Presensi
                  </button>
                </div>
              </div>

              {/* Real-time stats pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
                <div className="bg-emerald-900/60 rounded-xl p-3 text-center border border-emerald-700/50">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase">Hadir</span>
                  <p className="text-2xl font-black text-white">{hadirCount}</p>
                </div>
                <div className="bg-amber-900/60 rounded-xl p-3 text-center border border-amber-700/50">
                  <span className="text-[11px] font-bold text-amber-300 uppercase">Izin</span>
                  <p className="text-2xl font-black text-white">{izinCount}</p>
                </div>
                <div className="bg-blue-900/60 rounded-xl p-3 text-center border border-blue-700/50">
                  <span className="text-[11px] font-bold text-blue-300 uppercase">Sakit</span>
                  <p className="text-2xl font-black text-white">{sakitCount}</p>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 text-center border border-slate-700">
                  <span className="text-[11px] font-bold text-slate-300 uppercase">Belum Mengisi</span>
                  <p className="text-2xl font-black text-white">{belumCount}</p>
                </div>
              </div>
            </div>
          ) : (
            // FORM TO START NEW REALTIME ATTENDANCE SESSION
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Buka Sesi Presensi Baru (Real-Time)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aktifkan absensi kehadiran saat jam pembelajaran berlangsung. Tombol presensi akan langsung muncul di akun siswa.
                  </p>
                </div>
              </div>

              <form onSubmit={handleStartSession} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Select Class */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Kelas SMK
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {classes.length === 0 ? (
                        <option value="">(Belum ada kelas terdaftar)</option>
                      ) : (
                        classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.jurusan})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Duration in minutes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Durasi Aktif Presensi (Menit)
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value={15}>15 Menit (Cepat)</option>
                      <option value={30}>30 Menit (Standar)</option>
                      <option value={45}>45 Menit (1 Jam Pelajaran)</option>
                      <option value={90}>90 Menit (2 Jam Pelajaran)</option>
                    </select>
                  </div>

                  {/* Secret Code (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kode Token Rahasia (Opsional)
                    </label>
                    <input
                      type="text"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: SMK-WEB1"
                      className="w-full text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      Aktifkan Presensi Sekarang
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Pertemuan / Topik Praktik Kejuruan
                  </label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Contoh: Pertemuan 6: Praktik Konfigurasi Routing Dinamis OSPF di Lab Komputer"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    required
                  />
                </div>
              </form>
            </div>
          )}

          {/* Real-time Attendance Table for the class */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Daftar Presensi Siswa Real-Time ({targetClassStudents.length} Siswa)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Guru dapat mengedit status kehadiran, mencatat izin/sakit manual, atau mereset presensi siswa.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {belumCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tandai Semua Hadir ({belumCount})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenManualModal()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Catat Presensi Manual
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Status Presensi</th>
                    <th className="p-3">Waktu Cek-in</th>
                    <th className="p-3">Catatan / Keterangan</th>
                    <th className="p-3 text-right">Aksi & Kustomisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {targetClassStudents.map((stu, idx) => {
                    const record = activeRecords.find((r) => r.studentId === stu.id);
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-mono text-slate-700">{stu.nisn}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-semibold text-slate-900">{stu.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{stu.className}</td>
                        <td className="p-3">
                          {record ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                record.status === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : record.status === 'Izin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : record.status === 'Sakit'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {record.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                              Belum Presensi
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {record ? `${record.timestamp} WIB` : '-'}
                        </td>
                        <td className="p-3 text-slate-500 max-w-[180px] truncate">
                          {record?.notes || '-'}
                        </td>
                        <td className="p-3 text-right">
                          {record ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditRecord(record)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                                title="Edit Status Presensi Siswa"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRecordToDelete(record)}
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                                title="Reset / Hapus Presensi Siswa"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenManualModal(stu.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Catat
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Presensi Siswa */}
      {recordToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-200" />
                <h3 className="font-bold text-sm">Edit Status Kehadiran Siswa</h3>
              </div>
              <button
                type="button"
                onClick={() => setRecordToEdit(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditRecord} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Siswa:</p>
                <p className="text-sm font-bold text-slate-900">{recordToEdit.studentName}</p>
                <p className="text-[11px] text-slate-500">
                  NISN: {recordToEdit.studentNisn} • Waktu: {recordToEdit.timestamp} WIB
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ubah Status Presensi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        editStatus === st
                          ? st === 'Hadir'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'Izin'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : st === 'Sakit'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Keterangan Alasan
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Contoh: Sakit demam ada surat dokter / Izin kegiatan OSIS"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordToEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Catat Presensi Manual */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-200" />
                <h3 className="font-bold text-sm">Catat Presensi Siswa Manual</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualAttendance} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  {targetClassStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Kehadiran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setManualStatus(st)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        manualStatus === st
                          ? st === 'Hadir'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'Izin'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : st === 'Sakit'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Contoh: Mengikuti lomba LKS / Surat dokter diserahkan / Hadir manual"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition active:scale-95"
                >
                  Catat Kehadiran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Reset Presensi */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Reset Presensi Siswa?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin mereset kehadiran <span className="font-bold text-slate-800">{recordToDelete.studentName}</span>?
                Status siswa akan kembali menjadi "Belum Presensi" dan siswa dapat menginput ulang.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRecord}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                Ya, Reset Presensi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
