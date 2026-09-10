import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useLMS } from '../context/LMSContext';
import { ExcelStudentImporter } from './ExcelStudentImporter';
import { Student, ClassRoom } from '../types';
import {
  Layers,
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  GraduationCap,
  Sparkles,
  Search,
  UserCheck,
  Award,
  ArrowRight,
  UserPlus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Edit3,
  Settings,
  Pencil,
} from 'lucide-react';

interface Props {
  onNavigateTab?: (tab: string) => void;
}

export const ClassManagement: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    classes,
    students,
    selectedClassId,
    setSelectedClassId,
    addClass,
    updateClass,
    deleteClass,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useLMS();

  const [activeClassId, setActiveClassId] = useState<string>(
    selectedClassId !== 'all' ? selectedClassId : classes[0]?.id || 'cls-x-rpl-1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  // Edit Class State
  const [classToEdit, setClassToEdit] = useState<ClassRoom | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassGrade, setEditClassGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [editClassJurusan, setEditClassJurusan] = useState('');
  const [editClassWali, setEditClassWali] = useState('');
  const [editClassAcademicYear, setEditClassAcademicYear] = useState('');

  // Delete Class State
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);

  // Edit Student State
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [editStuName, setEditStuName] = useState('');
  const [editStuNisn, setEditStuNisn] = useState('');
  const [editStuGender, setEditStuGender] = useState<'L' | 'P'>('L');
  const [editStuClassId, setEditStuClassId] = useState('');
  const [editStuEmail, setEditStuEmail] = useState('');
  const [editStuPhone, setEditStuPhone] = useState('');
  const [editStuPassword, setEditStuPassword] = useState('');
  const [editStuAttendanceRate, setEditStuAttendanceRate] = useState(100);
  const [editStuAverageScore, setEditStuAverageScore] = useState(0);

  // New Class State
  const [newClassName, setNewClassName] = useState('');
  const [newJurusan, setNewJurusan] = useState('Rekayasa Perangkat Lunak (RPL)');
  const [newGrade, setNewGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [newWaliKelas, setNewWaliKelas] = useState('');

  // New Student State
  const [newStuName, setNewStuName] = useState('');
  const [newStuNisn, setNewStuNisn] = useState('');
  const [newStuGender, setNewStuGender] = useState<'L' | 'P'>('L');
  const [newStuClassId, setNewStuClassId] = useState(activeClassId);
  const [newStuEmail, setNewStuEmail] = useState('');
  const [newStuPhone, setNewStuPhone] = useState('');
  const [newStuPassword, setNewStuPassword] = useState('');

  const currentClass = classes.find((c) => c.id === activeClassId) || classes[0] || null;

  // Students in active class
  const classStudents = currentClass ? students.filter((s) => s.kelasId === currentClass.id) : [];

  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  // Edit Class Handlers
  const handleOpenEditClass = (cls: ClassRoom) => {
    setClassToEdit(cls);
    setEditClassName(cls.name);
    setEditClassGrade(cls.grade);
    setEditClassJurusan(cls.jurusan);
    setEditClassWali(cls.waliKelas);
    setEditClassAcademicYear(cls.academicYear);
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classToEdit || !editClassName.trim()) return;

    updateClass(classToEdit.id, {
      name: editClassName.trim(),
      grade: editClassGrade,
      jurusan: editClassJurusan.trim(),
      waliKelas: editClassWali.trim(),
      academicYear: editClassAcademicYear.trim() || '2026/2027 Ganjil',
      code: `${editClassGrade}${editClassName.replace(/\s+/g, '')}`,
    });

    setClassToEdit(null);
  };

  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    deleteClass(classToDelete.id);
    if (activeClassId === classToDelete.id) {
      const remaining = classes.filter((c) => c.id !== classToDelete.id);
      if (remaining[0]) {
        setActiveClassId(remaining[0].id);
        setSelectedClassId(remaining[0].id);
      }
    }
    setClassToDelete(null);
  };

  // Edit Student Handlers
  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setEditStuName(student.name);
    setEditStuNisn(student.nisn);
    setEditStuGender(student.gender);
    setEditStuClassId(student.kelasId);
    setEditStuEmail(student.email);
    setEditStuPhone(student.phone);
    setEditStuPassword(student.password || student.nisn);
    setEditStuAttendanceRate(student.attendanceRate);
    setEditStuAverageScore(student.averageScore);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit || !editStuName.trim()) return;

    updateStudent(studentToEdit.id, {
      name: editStuName.trim(),
      nisn: editStuNisn.trim(),
      gender: editStuGender,
      kelasId: editStuClassId,
      email: editStuEmail.trim(),
      phone: editStuPhone.trim(),
      password: editStuPassword.trim() || editStuNisn.trim(),
      attendanceRate: Math.min(100, Math.max(0, Number(editStuAttendanceRate) || 0)),
      averageScore: Math.min(100, Math.max(0, Number(editStuAverageScore) || 0)),
    });

    setStudentToEdit(null);
  };

  // Export Class Student Roster to Excel
  const handleExportClassExcel = () => {
    const dataToExport = classStudents.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      'Nama Lengkap Siswa': s.name,
      'Jenis Kelamin': s.gender,
      'Kelas SMK': s.className,
      'Program Keahlian': s.jurusan,
      'Kehadiran (%)': `${s.attendanceRate}%`,
      'Rata-rata Kuis': s.averageScore,
      Email: s.email,
      'No Telepon': s.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Siswa_${currentClass.name}`);
    XLSX.writeFile(workbook, `Data_Siswa_${currentClass.name.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    addClass({
      name: newClassName.trim(),
      grade: newGrade,
      jurusan: newJurusan,
      code: `${newGrade}${newClassName.replace(/\s+/g, '')}`,
      waliKelas: newWaliKelas.trim() || 'Guru Pembimbing SMK',
      academicYear: '2026/2027 Ganjil',
    });

    setShowAddClassModal(false);
    setNewClassName('');
    setNewWaliKelas('');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuName.trim()) return;

    addStudent({
      name: newStuName.trim(),
      nisn: newStuNisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      kelasId: newStuClassId || activeClassId,
      gender: newStuGender,
      email: newStuEmail.trim(),
      phone: newStuPhone.trim() || '0812-3456-7890',
      password: newStuPassword.trim() || undefined,
    });

    setShowAddStudentModal(false);
    setNewStuName('');
    setNewStuNisn('');
    setNewStuEmail('');
    setNewStuPhone('');
    setNewStuPassword('');
    setNewStuGender('L');
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Manajemen Rombongan Belajar Berdasarkan Kelas SMK
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Manajemen Kelas & Rombel SMK
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Kelola data peserta didik terstruktur per program keahlian/jurusan, monitoring status
              akademik per kelas, dan migrasi data cepat lewat impor Excel massal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddClassModal(true)}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Kelas SMK
            </button>
            <button
              type="button"
              onClick={handleExportClassExcel}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Ekspor Data Excel
            </button>
          </div>
        </div>
      </div>

      {/* Class Selection Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pilih Kelas SMK yang Dikelola
          </span>
          <span className="text-xs text-indigo-600 font-bold">Total {classes.length} Kelas Terdaftar</span>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Kelas SMK Terdaftar</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Sistem kelas masih kosong. Buat kelas pertama untuk mulai mengorganisasi rombel dan mendaftarkan akun siswa.
            </p>
            <button
              type="button"
              onClick={() => setShowAddClassModal(true)}
              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Kelas Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {classes.map((cls) => {
              const isSelected = cls.id === activeClassId;
              const stuCount = students.filter((s) => s.kelasId === cls.id).length;

              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => {
                    setActiveClassId(cls.id);
                    setSelectedClassId(cls.id);
                  }}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-indigo-950">{cls.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        Tingkat {cls.grade}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{cls.jurusan}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Wali: {cls.waliKelas.split(',')[0]}</span>
                    <span className="font-extrabold text-indigo-700 text-xs">
                      {stuCount} Siswa
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Excel Student Bulk Importer Component */}
      <ExcelStudentImporter defaultClassId={activeClassId} />

      {/* Students List in Selected Class */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Peserta Didik Kelas {currentClass ? currentClass.name : 'SMK'}
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700">
                  {classStudents.length} Siswa
                </span>
              </div>
              {currentClass && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditClass(currentClass)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                    title="Kustomisasi / Edit Informasi Rombel Kelas"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Edit Kelas</span>
                  </button>
                  {classes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setClassToDelete(currentClass)}
                      className="px-2 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition inline-flex items-center gap-1 cursor-pointer"
                      title="Hapus Rombel Kelas Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Kelas</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            {currentClass && (
              <p className="text-xs text-slate-500 mt-0.5">
                Jurusan: <span className="font-semibold text-slate-700">{currentClass.jurusan}</span> •
                Wali Kelas: <span className="font-semibold text-slate-700">{currentClass.waliKelas}</span> •
                Tahun Ajaran: <span className="font-semibold text-slate-700">{currentClass.academicYear}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setNewStuClassId(activeClassId);
                setShowAddStudentModal(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa Manual</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">NISN</th>
                <th className="p-3">Nama Lengkap Siswa</th>
                <th className="p-3">JK</th>
                <th className="p-3">Kehadiran</th>
                <th className="p-3">Rata-rata Nilai</th>
                <th className="p-3">Kuis Tuntas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-mono text-slate-800 font-bold">{student.nisn}</span>
                      <div className="text-[10px] flex items-center gap-1 mt-0.5" title="Siswa dapat masuk menggunakan NISN">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[9px] font-semibold">
                          Akun Login Aktif
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-700">{student.gender}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-emerald-700">
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          student.averageScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.averageScore >= 75
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {student.averageScore}/100
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">
                      {student.totalQuizzesTaken} Kuis
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Edit / Kustomisasi Data Siswa"
                          onClick={() => handleOpenEditStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab('rapor');
                          }}
                          className="px-2.5 py-1 text-xs text-indigo-700 hover:bg-indigo-50 font-bold rounded-lg border border-indigo-200 transition cursor-pointer"
                        >
                          Cetak Rapor
                        </button>
                        <button
                          type="button"
                          title="Hapus Siswa dari Kelas"
                          onClick={() => setStudentToDelete({ id: student.id, name: student.name })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Kelas Baru */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Rombongan Belajar (Kelas SMK) Baru</h3>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kelas (Contoh: XI RPL 2 atau XII TBSM 1)
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Contoh: XI RPL 2"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat / Grade
                </label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="X">Kelas X (Sepuluh)</option>
                  <option value="XI">Kelas XI (Sebelas)</option>
                  <option value="XII">Kelas XII (Dua Belas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Program Keahlian / Jurusan SMK
                </label>
                <input
                  type="text"
                  value={newJurusan}
                  onChange={(e) => setNewJurusan(e.target.value)}
                  placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Wali Kelas / Pembimbing
                </label>
                <input
                  type="text"
                  value={newWaliKelas}
                  onChange={(e) => setNewWaliKelas(e.target.value)}
                  placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Siswa Baru (Manual Satuan) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-indigo-700 to-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Tambah Peserta Didik Baru</h3>
                  <p className="text-[11px] text-indigo-200">Daftarkan siswa secara satuan ke rombel kelas SMK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStuName}
                  onChange={(e) => setNewStuName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NISN (Nomor Induk Siswa Nasional) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStuNisn}
                    onChange={(e) => setNewStuNisn(e.target.value)}
                    placeholder="Contoh: 0078123456"
                    maxLength={10}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">10 digit nomor NISN Dapodik</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newStuGender}
                    onChange={(e) => setNewStuGender(e.target.value as 'L' | 'P')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rombongan Belajar (Kelas SMK) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newStuClassId}
                  onChange={(e) => setNewStuClassId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} — {cls.jurusan} (Wali: {cls.waliKelas})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Siswa (Opsional)
                  </label>
                  <input
                    type="email"
                    value={newStuEmail}
                    onChange={(e) => setNewStuEmail(e.target.value)}
                    placeholder="nama.siswa@smk.student.id"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={newStuPhone}
                    onChange={(e) => setNewStuPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Akun Siswa (Password Login)
                </label>
                <input
                  type="text"
                  value={newStuPassword}
                  onChange={(e) => setNewStuPassword(e.target.value)}
                  placeholder="Kosongkan untuk otomatis menggunakan nomor NISN siswa"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  🔑 Digunakan siswa untuk login ke SmartLMS (Default: nomor NISN siswa).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Siswa yang didaftarkan akan langsung memiliki profil akademik di LMS, dapat mengakses kuis, mengisi absensi, dan namanya otomatis tercatat di rekap nilai serta rapor.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2.5 font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer active:scale-95 transition"
                >
                  Daftarkan Siswa Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Siswa */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Siswa dari Kelas?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin mengeluarkan <span className="font-bold text-slate-800">{studentToDelete.name}</span> dari daftar rombel kelas ini?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit / Kustomisasi Kelas SMK */}
      {classToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-200" />
                <h3 className="font-bold text-sm">Edit & Kustomisasi Kelas SMK</h3>
              </div>
              <button
                type="button"
                onClick={() => setClassToEdit(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditClass} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Kelas / Rombel SMK <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  placeholder="Contoh: X RPL 1"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tingkat / Grade
                </label>
                <select
                  value={editClassGrade}
                  onChange={(e) => setEditClassGrade(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="X">Kelas X (Sepuluh)</option>
                  <option value="XI">Kelas XI (Sebelas)</option>
                  <option value="XII">Kelas XII (Dua Belas)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Program Keahlian / Jurusan SMK <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editClassJurusan}
                  onChange={(e) => setEditClassJurusan(e.target.value)}
                  placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Wali Kelas / Pembimbing <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editClassWali}
                  onChange={(e) => setEditClassWali(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Kom."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tahun Ajaran & Semester
                </label>
                <input
                  type="text"
                  value={editClassAcademicYear}
                  onChange={(e) => setEditClassAcademicYear(e.target.value)}
                  placeholder="Contoh: 2026/2027 Ganjil"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClassToEdit(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm cursor-pointer transition"
                >
                  Simpan Perubahan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Kelas */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Rombel Kelas?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-slate-800">{classToDelete.name}</span>? 
                Seluruh data rombel dan daftar siswa di dalamnya akan ikut dihapus.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                Ya, Hapus Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit / Kustomisasi Data Siswa */}
      {studentToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-200" />
                <h3 className="font-bold text-sm">Edit Data & Penilaian Siswa</h3>
              </div>
              <button
                type="button"
                onClick={() => setStudentToEdit(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editStuName}
                  onChange={(e) => setEditStuName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NISN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editStuNisn}
                    onChange={(e) => setEditStuNisn(e.target.value)}
                    maxLength={10}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editStuGender}
                    onChange={(e) => setEditStuGender(e.target.value as 'L' | 'P')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pindah / Alokasi Kelas SMK <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editStuClassId}
                  onChange={(e) => setEditStuClassId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} — {cls.jurusan} (Wali: {cls.waliKelas})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Siswa</label>
                  <input
                    type="email"
                    value={editStuEmail}
                    onChange={(e) => setEditStuEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No WhatsApp / Telepon</label>
                  <input
                    type="text"
                    value={editStuPhone}
                    onChange={(e) => setEditStuPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Akun Siswa (Password Login)
                </label>
                <input
                  type="text"
                  value={editStuPassword}
                  onChange={(e) => setEditStuPassword(e.target.value)}
                  placeholder="Kata sandi siswa untuk login"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  🔑 Kata sandi yang digunakan siswa untuk login ke SmartLMS (Default: NISN).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Persentase Kehadiran (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editStuAttendanceRate}
                    onChange={(e) => setEditStuAttendanceRate(Number(e.target.value))}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rata-rata Nilai (0-100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editStuAverageScore}
                    onChange={(e) => setEditStuAverageScore(Number(e.target.value))}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStudentToEdit(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition active:scale-95"
                >
                  Simpan Perubahan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
