import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { Quiz, QuizQuestion } from '../types';
import { QuizPlayer } from './QuizPlayer';
import {
  HelpCircle,
  Plus,
  Clock,
  Award,
  AlertTriangle,
  Play,
  CheckCircle2,
  Trash2,
  Users,
  Eye,
  Calendar,
  X,
  PlusCircle,
  Check,
  Edit3,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const QuizManager: React.FC = () => {
  const {
    currentUser,
    quizzes,
    submissions,
    classes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleQuizActive,
    getStudentSubmission,
  } = useLMS();

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [activeQuizForPlayer, setActiveQuizForPlayer] = useState<Quiz | null>(null);
  const [inspectQuizSubmissions, setInspectQuizSubmissions] = useState<Quiz | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Edit Quiz State
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editDuration, setEditDuration] = useState(20);
  const [editPassingScore, setEditPassingScore] = useState(75);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDeadlineHours, setEditDeadlineHours] = useState(24);
  const [editQuestions, setEditQuestions] = useState<QuizQuestion[]>([]);

  // Delete Quiz State
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  // New Quiz Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState(currentUser.subject || 'Pemrograman Web (Produktif RPL)');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'cls-x-rpl-1');
  const [newDuration, setNewDuration] = useState(20);
  const [newPassingScore, setNewPassingScore] = useState(75);
  const [newDeadlineHours, setNewDeadlineHours] = useState(24);

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-new-1',
      questionText: 'Manakah tag semantic HTML5 yang paling tepat untuk mendefinisikan menu navigasi utama situs web?',
      options: ['<nav>', '<menu>', '<header>', '<navbar>'],
      correctOptionIndex: 0,
      explanation: '<nav> adalah tag semantik HTML5 yang didesain khusus untuk blok link navigasi utama.',
      points: 25,
    },
    {
      id: 'q-new-2',
      questionText: 'Dalam styling CSS, nilai display apa yang memungkinkan tata letak elemen berbasis sumbu baris (main-axis) atau kolom?',
      options: ['block', 'inline-block', 'flex', 'static'],
      correctOptionIndex: 2,
      explanation: 'display: flex mengaktifkan Flexible Box Layout Module dengan main-axis dan cross-axis.',
      points: 25,
    },
  ]);

  const handleAddQuestion = () => {
    const q: QuizQuestion = {
      id: `q-new-${Date.now()}`,
      questionText: '',
      options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
      correctOptionIndex: 0,
      explanation: '',
      points: 25,
    };
    setQuestions([...questions, q]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Edit Quiz Handlers
  const handleOpenEditQuiz = (quiz: Quiz) => {
    setQuizToEdit(quiz);
    setEditTitle(quiz.title);
    setEditDescription(quiz.description);
    setEditSubject(quiz.subject);
    setEditClassId(quiz.classId);
    setEditDuration(quiz.durationMinutes);
    setEditPassingScore(quiz.passingScore);
    setEditIsActive(quiz.isActive);
    setEditDeadlineHours(24);
    setEditQuestions(JSON.parse(JSON.stringify(quiz.questions)));
  };

  const handleAddEditQuestion = () => {
    const q: QuizQuestion = {
      id: `q-edit-${Date.now()}`,
      questionText: '',
      options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
      correctOptionIndex: 0,
      explanation: '',
      points: 25,
    };
    setEditQuestions([...editQuestions, q]);
  };

  const handleRemoveEditQuestion = (idx: number) => {
    if (editQuestions.length <= 1) return;
    setEditQuestions(editQuestions.filter((_, i) => i !== idx));
  };

  const handleSaveEditQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizToEdit || !editTitle.trim()) return;

    const targetClass = classes.find((c) => c.id === editClassId) || classes[0] || {
      id: 'cls-default-1',
      name: 'Semua Siswa SMK',
      grade: 'X' as const,
      jurusan: 'Kejuruan SMK',
      code: 'SMK-ALL',
      waliKelas: 'Guru SMK',
      academicYear: '2026/2027 Ganjil',
      studentCount: 0,
    };
    const totalPoints = editQuestions.reduce((acc, q) => acc + q.points, 0);

    updateQuiz(quizToEdit.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      subject: editSubject.trim(),
      classId: targetClass.id,
      className: targetClass.name,
      durationMinutes: editDuration,
      passingScore: editPassingScore,
      isActive: editIsActive,
      questions: editQuestions,
      totalPoints,
    });

    setQuizToEdit(null);
  };

  const handleConfirmDeleteQuiz = () => {
    if (!quizToDelete) return;
    deleteQuiz(quizToDelete.id);
    setQuizToDelete(null);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetClass = classes.find((c) => c.id === newClassId) || classes[0] || {
      id: 'cls-default-1',
      name: 'Semua Siswa SMK',
      grade: 'X' as const,
      jurusan: 'Kejuruan SMK',
      code: 'SMK-ALL',
      waliKelas: 'Guru SMK',
      academicYear: '2026/2027 Ganjil',
      studentCount: 0,
    };
    const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
    const deadlineIso = new Date(Date.now() + newDeadlineHours * 3600 * 1000).toISOString();

    createQuiz({
      title: newTitle,
      description: newDescription || 'Kuis interaktif kejuruan SMK dengan penilaian otomatis',
      classId: targetClass.id,
      className: targetClass.name,
      subject: newSubject,
      durationMinutes: newDuration,
      deadline: deadlineIso,
      passingScore: newPassingScore,
      questions,
      totalPoints,
      isActive: true,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    if (currentUser.role === 'siswa') {
      return q.classId === currentUser.kelasId || q.classId === 'cls-x-rpl-1';
    }
    if (selectedClassFilter === 'all') return true;
    return q.classId === selectedClassFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Sistem Penilaian Otomatis & Analitik KKM
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Kuis Interaktif & Evaluasi Otomatis
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Siswa mengerjakan kuis secara interaktif dengan countdown waktu dan menerima hasil
              penilaian otomatis instan. Guru dapat memantau perolehan nilai secara real-time.
            </p>
          </div>

          {currentUser.role === 'guru' && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Kuis Interaktif Baru
            </button>
          )}
        </div>
      </div>

      {/* Class Filter (For Guru) */}
      {currentUser.role === 'guru' && (
        <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filter Berdasarkan Kelas SMK:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedClassFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedClassFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Kelas
              </button>
              {classes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClassFilter(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedClassFilter === c.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-500 hidden md:block">
            Menampilkan {filteredQuizzes.length} Kuis
          </span>
        </div>
      )}

      {/* Quizzes List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuizzes.map((quiz) => {
          const studentSub = getStudentSubmission(quiz.id, currentUser.id);
          const quizSubs = submissions.filter((s) => s.quizId === quiz.id);
          const avgClassScore =
            quizSubs.length > 0
              ? Math.round(quizSubs.reduce((a, b) => a + b.percentage, 0) / quizSubs.length)
              : 0;

          const deadlineDate = new Date(quiz.deadline);
          const isOverdue = deadlineDate.getTime() < Date.now();
          const hoursRemaining = Math.max(
            0,
            Math.round((deadlineDate.getTime() - Date.now()) / (1000 * 3600))
          );

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                      {quiz.className}
                    </span>
                    {currentUser.role === 'guru' && (
                      <button
                        type="button"
                        onClick={() => toggleQuizActive(quiz.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold border flex items-center gap-1 cursor-pointer transition ${
                          quiz.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                        title={quiz.isActive ? 'Kuis Aktif (Klik untuk ubah ke Draf)' : 'Kuis Draf (Klik untuk Publikasikan)'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${quiz.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {quiz.isActive ? 'Aktif' : 'Draf'}
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.durationMinutes} Menit
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
                  {quiz.title}
                </h3>
                <p className="text-xs text-indigo-600 font-semibold mb-2">{quiz.subject}</p>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {quiz.description}
                </p>

                {/* Deadline indicator */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs mb-4 ${
                    isOverdue
                      ? 'bg-slate-100 border-slate-200 text-slate-600'
                      : hoursRemaining <= 12
                      ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <span>
                      {isOverdue
                        ? 'Tenggat Waktu Berakhir'
                        : `Tenggat: Sisa ${hoursRemaining} Jam Lagi`}
                    </span>
                    <span className="block text-[10px] opacity-80">
                      {deadlineDate.toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </span>
                  </div>
                </div>

                {/* Quiz Meta */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Jumlah Soal
                    </span>
                    <span className="font-bold text-slate-800">{quiz.questions.length} Soal</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Standar KKM
                    </span>
                    <span className="font-bold text-slate-800">{quiz.passingScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100">
                {currentUser.role === 'siswa' ? (
                  studentSub ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Nilai: {studentSub.percentage}/100
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            studentSub.passed
                              ? 'bg-emerald-200 text-emerald-800'
                              : 'bg-rose-200 text-rose-800'
                          }`}
                        >
                          {studentSub.passed ? 'Lulus KKM' : 'Remedial'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveQuizForPlayer(quiz)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Review Kunci & Penjelasan
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveQuizForPlayer(quiz)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      Mulai Kerjakan Kuis Sekarang
                    </button>
                  )
                ) : (
                  // GURU ACTIONS
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInspectQuizSubmissions(quiz)}
                      className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Lihat Rekap Nilai Siswa"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Hasil ({quizSubs.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditQuiz(quiz)}
                      className="p-2 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition cursor-pointer"
                      title="Edit & Kustomisasi Kuis"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizToDelete(quiz)}
                      className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer"
                      title="Hapus Kuis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: INSPECT SUBMISSIONS FOR TEACHER */}
      {inspectQuizSubmissions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Rekapitulasi Nilai Otomatis: {inspectQuizSubmissions.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Target: {inspectQuizSubmissions.className} • Standar KKM: {inspectQuizSubmissions.passingScore}
                </p>
              </div>
              <button
                onClick={() => setInspectQuizSubmissions(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {submissions.filter((s) => s.quizId === inspectQuizSubmissions.id).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada siswa yang mengumpulkan kuis ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-2.5">NISN</th>
                      <th className="p-2.5">Nama Siswa</th>
                      <th className="p-2.5">Waktu Submit</th>
                      <th className="p-2.5">Durasi Pengerjaan</th>
                      <th className="p-2.5">Nilai Otomatis</th>
                      <th className="p-2.5">Status KKM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions
                      .filter((s) => s.quizId === inspectQuizSubmissions.id)
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-700">{sub.studentNisn}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{sub.studentName}</td>
                          <td className="p-2.5 text-slate-500">
                            {new Date(sub.submittedAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WIB
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {Math.round(sub.timeSpentSeconds / 60)} menit
                          </td>
                          <td className="p-2.5 font-bold font-mono text-indigo-700">
                            {sub.percentage}/100
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.passed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {sub.passed ? 'Lulus KKM' : 'Remedial'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectQuizSubmissions(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW QUIZ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Buat Kuis Interaktif Baru SMK</h3>
                <p className="text-xs text-indigo-200">
                  Konfigurasikan soal pilihan ganda, kunci jawaban, dan batas waktu
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Kuis / Asesmen
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Kuis 3: Sintaks CSS Grid & Responsif"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Kelas SMK
                  </label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.jurusan})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran Kejuruan
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Durasi Pengerjaan (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    KKM Kelulusan (Poin)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Daftar Butir Soal Kuis ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Tambah Butir Soal
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-900">
                          Soal #{qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-rose-600 hover:text-rose-800 text-xs"
                          >
                            Hapus Soal
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions((prev) =>
                            prev.map((item, idx) =>
                              idx === qIdx ? { ...item, questionText: val } : item
                            )
                          );
                        }}
                        placeholder="Ketikkan teks pertanyaan di sini..."
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-medium"
                        required
                      />

                      {/* Options */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Pilihan Jawaban (Klik radio untuk menandai kunci benar):
                        </span>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctOptionIndex === oIdx}
                              onChange={() => {
                                setQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIdx ? { ...item, correctOptionIndex: oIdx } : item
                                  )
                                );
                              }}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="font-mono text-xs font-bold text-slate-500 w-4">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[oIdx] = e.target.value;
                                setQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIdx ? { ...item, options: newOpts } : item
                                  )
                                );
                              }}
                              className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded-lg"
                              required
                            />
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      <div>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, explanation: val } : item
                              )
                            );
                          }}
                          placeholder="Penjelasan/pembahasan materi untuk siswa..."
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Simpan & Terbitkan Kuis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / KUSTOMISASI KUIS GURU */}
      {quizToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-200" />
                <h3 className="font-bold text-sm">Edit & Kustomisasi Kuis</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuizToEdit(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditQuiz} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Kuis Kejuruan SMK <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Instruksi Kuis
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Sasaran
                  </label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.jurusan})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standar KKM (0-100)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={editPassingScore}
                    onChange={(e) => setEditPassingScore(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={editIsActive ? 'aktif' : 'draf'}
                    onChange={(e) => setEditIsActive(e.target.value === 'aktif')}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="aktif">Aktif (Dapat Dikerjakan Siswa)</option>
                    <option value="draf">Draf (Sembunyikan dari Siswa)</option>
                  </select>
                </div>
              </div>

              {/* Questions Section for Edit */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Kustomisasi Soal Kuis ({editQuestions.length} Soal)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddEditQuestion}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Tambah Soal Baru
                  </button>
                </div>

                <div className="space-y-4">
                  {editQuestions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-900">
                          Butir Soal #{qIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-semibold">Bobot Poin:</span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={q.points}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditQuestions((prev) =>
                                prev.map((item, idx) =>
                                  idx === qIdx ? { ...item, points: val } : item
                                )
                              );
                            }}
                            className="w-16 p-1 text-xs text-center border border-slate-300 rounded bg-white font-mono"
                          />
                          {editQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEditQuestion(qIdx)}
                              className="text-rose-600 hover:text-rose-800 text-xs font-bold ml-2 cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditQuestions((prev) =>
                            prev.map((item, idx) =>
                              idx === qIdx ? { ...item, questionText: val } : item
                            )
                          );
                        }}
                        placeholder="Ketikkan teks pertanyaan di sini..."
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-medium"
                        required
                      />

                      {/* Options */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Pilihan Jawaban (Tandai radio untuk kunci jawaban benar):
                        </span>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`edit-correct-${q.id}`}
                              checked={q.correctOptionIndex === oIdx}
                              onChange={() => {
                                setEditQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIdx ? { ...item, correctOptionIndex: oIdx } : item
                                  )
                                );
                              }}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="font-mono text-xs font-bold text-slate-500 w-4">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[oIdx] = e.target.value;
                                setEditQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIdx ? { ...item, options: newOpts } : item
                                  )
                                );
                              }}
                              className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded-lg"
                              required
                            />
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      <div>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, explanation: val } : item
                              )
                            );
                          }}
                          placeholder="Penjelasan/pembahasan materi untuk siswa..."
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuizToEdit(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition active:scale-95"
                >
                  Simpan Perubahan Kuis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS KUIS */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Kuis Interaktif?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus kuis <span className="font-bold text-slate-800">{quizToDelete.title}</span>? 
                Seluruh butir soal dan data nilai pengerjaan siswa pada kuis ini akan ikut terhapus.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuizToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuiz}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                Ya, Hapus Kuis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Quiz Player Overlay */}
      {activeQuizForPlayer && (
        <QuizPlayer quiz={activeQuizForPlayer} onClose={() => setActiveQuizForPlayer(null)} />
      )}
    </div>
  );
};
