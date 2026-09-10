export type UserRole = 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  nip_nisn: string;
  kelasId?: string; // for siswa
  className?: string; // e.g. "X RPL 1"
  jurusan?: string; // e.g. "Rekayasa Perangkat Lunak"
  subject?: string; // for guru e.g. "Pemrograman Web & Perangkat Bergerak"
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "X RPL 1"
  grade: 'X' | 'XI' | 'XII';
  jurusan: string; // e.g. "Rekayasa Perangkat Lunak (RPL)"
  code: string;
  waliKelas: string;
  academicYear: string;
  studentCount: number;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  kelasId: string;
  className: string;
  jurusan: string;
  email: string;
  phone: string;
  gender: 'L' | 'P';
  avatar: string;
  password?: string; // Kata sandi untuk login siswa (default: NISN)
  attendanceRate: number; // percentage
  averageScore: number;
  totalQuizzesTaken: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  subject: string;
  durationMinutes: number;
  deadline: string; // ISO string
  passingScore: number; // e.g. 75 KKM
  questions: QuizQuestion[];
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
  allowRetake?: boolean;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  classId: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  timeSpentSeconds: number;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  subject: string;
  title: string; // e.g. "Pertemuan 4: Penerapan Flexbox & Grid CSS"
  date: string;
  startTime: string; // ISO
  expiresAt: string; // ISO
  durationMinutes: number;
  isActive: boolean;
  teacherName: string;
  secretCode?: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  status: AttendanceStatus;
  timestamp: string;
  notes?: string;
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  classId: string;
  className: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  title: string;
  content: string;
  category: 'Materi Produktif' | 'Tanya Kuis & Tugas' | 'Praktik & PKL' | 'Diskusi Umum';
  tags: string[];
  createdAt: string;
  likes: number;
  likedBy: string[]; // userIds
  replies: ForumReply[];
}

export interface NotificationItem {
  id: string;
  recipientRole?: UserRole | 'all';
  studentId?: string;
  classId?: string;
  title: string;
  message: string;
  type: 'deadline' | 'attendance' | 'quiz' | 'grade' | 'forum';
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
  deadline?: string;
  read: boolean;
  linkTab?: string;
}

export interface AcademicSubjectGrade {
  subjectName: string;
  kkm: number;
  nilaiPengetahuan: number;
  nilaiKeterampilan: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  keterangan: string;
}

export interface AcademicReport {
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  jurusan: string;
  semester: string;
  academicYear: string;
  grades: AcademicSubjectGrade[];
  attendance: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
  };
  catatanWaliKelas: string;
  statusKelulusan: 'Tuntas' | 'Perlu Bimbingan';
}
