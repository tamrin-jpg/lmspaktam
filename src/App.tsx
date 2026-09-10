import React, { useState } from 'react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { Navbar } from './components/Navbar';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { ClassManagement } from './components/ClassManagement';
import { QuizManager } from './components/QuizManager';
import { AttendanceManager } from './components/AttendanceManager';
import { ForumDiscussion } from './components/ForumDiscussion';
import { AcademicReportPDF } from './components/AcademicReportPDF';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Radio,
  BookOpen,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { currentUser } = useLMS();

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-indigo-500 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardAnalytics onNavigateTab={setActiveTab} />}
        {activeTab === 'kelas' && <ClassManagement onNavigateTab={setActiveTab} />}
        {activeTab === 'kuis' && <QuizManager />}
        {activeTab === 'absensi' && <AttendanceManager />}
        {activeTab === 'forum' && <ForumDiscussion />}
        {activeTab === 'rapor' && <AcademicReportPDF />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
              SMK
            </div>
            <span className="font-semibold text-slate-700">
              SMK SmartLMS — Sistem Manajemen Kelas & Pembelajaran Vokasi
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Kurikulum Merdeka SMK</span>
            <span>•</span>
            <span>Penilaian Kuis Otomatis</span>
            <span>•</span>
            <span>Presensi Real-time</span>
            <span>•</span>
            <span>Unduh Rapor PDF</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LMSProvider>
      <AppContent />
    </LMSProvider>
  );
}
