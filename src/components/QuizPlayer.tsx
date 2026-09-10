import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Quiz, QuizSubmission } from '../types';
import { useLMS } from '../context/LMSContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  HelpCircle,
  FileCode,
} from 'lucide-react';

interface Props {
  quiz: Quiz;
  onClose: () => void;
}

export const QuizPlayer: React.FC<Props> = ({ quiz, onClose }) => {
  const { currentUser, submitQuiz, getStudentSubmission } = useLMS();

  const existingSubmission = getStudentSubmission(quiz.id, currentUser.id);

  // States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(quiz.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(!!existingSubmission);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(
    existingSubmission || null
  );
  const [showReview, setShowReview] = useState(!!existingSubmission);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoSubmit = () => {
    finalizeSubmission();
  };

  const finalizeSubmission = () => {
    const timeSpent = quiz.durationMinutes * 60 - timeLeftSeconds;
    const result = submitQuiz(quiz.id, selectedAnswers, timeSpent);
    setSubmissionResult(result);
    setIsSubmitted(true);
    setShowReview(true);

    if (result.passed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const currentQ = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === quiz.questions.length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white uppercase">
                {quiz.subject}
              </span>
              <span className="text-xs text-slate-400">KKM: {quiz.passingScore}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold truncate max-w-md">{quiz.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                  timeLeftSeconds < 120
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* RESULT OVERVIEW (If submitted) */}
          {isSubmitted && submissionResult && (
            <div
              className={`p-5 rounded-2xl border ${
                submissionResult.passed
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      submissionResult.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      {submissionResult.passed ? '🎉 Selamat, Anda LULUS KKM!' : '⚠️ Perlu Remedial'}
                    </h3>
                    <p className="text-xs opacity-90">
                      Sistem penilaian otomatis telah memeriksa jawaban Anda secara instan.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                      Nilai Akhir
                    </span>
                    <span className="text-3xl font-black font-mono">
                      {submissionResult.percentage}
                      <span className="text-sm font-normal">/100</span>
                    </span>
                  </div>
                  <div className="border-l border-current/20 pl-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                      Status KKM
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        submissionResult.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {submissionResult.passed ? 'Kompeten' : 'Remedial'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION CARD */}
          {!showReview || !isSubmitted ? (
            <div className="space-y-4">
              {/* Question progress and navigator pills */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {currentQ.points} Poin
                </span>
              </div>

              {/* Navigator pills */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {quiz.questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Text */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  {currentQ.questionText}
                </p>

                {currentQ.codeSnippet && (
                  <div className="mt-3 bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                    <pre>{currentQ.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // REVIEW ALL ANSWERS (When submitted)
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-800">
                  Pembahasan & Evaluasi Kunci Jawaban
                </h4>
                <span className="text-xs text-slate-500">
                  Total {quiz.questions.length} Soal
                </span>
              </div>

              {quiz.questions.map((q, idx) => {
                const studentAnswerIdx = submissionResult.answers[q.id];
                const isCorrect = studentAnswerIdx === q.correctOptionIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{idx + 1}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Benar (+{q.points})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3.5 h-3.5" /> Salah (0)
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      {q.questionText}
                    </p>

                    {q.codeSnippet && (
                      <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-xs overflow-x-auto">
                        <pre>{q.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Options status */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isKunci = oIdx === q.correctOptionIndex;
                        const isChosen = oIdx === studentAnswerIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                              isKunci
                                ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-900'
                                : isChosen && !isCorrect
                                ? 'bg-rose-100 border-rose-400 font-bold text-rose-900'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-slate-500 font-bold">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              {opt}
                            </span>
                            {isKunci && (
                              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-emerald-600 text-white rounded">
                                Kunci Benar
                              </span>
                            )}
                            {isChosen && !isCorrect && (
                              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-rose-600 text-white rounded">
                                Jawaban Anda
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900">
                      <span className="font-bold block mb-0.5">Penjelasan Materi:</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Sebelumnya
              </button>

              <div className="text-xs text-slate-500 hidden sm:block">
                Dijawab: {answeredCount} dari {quiz.questions.length} soal
              </div>

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  Selanjutnya
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finalizeSubmission}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Selesai & Nilai Otomatis
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Nilai telah tercatat otomatis di rapor siswa.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
              >
                Tutup Kuis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
