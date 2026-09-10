import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  ClassRoom,
  Student,
  Quiz,
  QuizSubmission,
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  ForumPost,
  NotificationItem,
  AcademicReport,
} from '../types';
import {
  MOCK_CLASSES,
  MOCK_USERS,
  MOCK_STUDENTS,
  MOCK_QUIZZES,
  MOCK_SUBMISSIONS,
  INITIAL_ATTENDANCE_SESSION,
  INITIAL_ATTENDANCE_RECORDS,
  MOCK_FORUM_POSTS,
  MOCK_NOTIFICATIONS,
  MOCK_ACADEMIC_REPORT,
} from '../data/mockData';

interface LMSContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  userRole: UserRole;
  switchRole: (role: UserRole) => void;
  loginUser: (identifier: string, role: UserRole, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  resetAllDataToEmpty: () => void;
  loadDemoData: () => void;
  isDataEmpty: boolean;

  // Classes
  classes: ClassRoom[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  addClass: (newClass: Omit<ClassRoom, 'id' | 'studentCount'>) => void;
  updateClass: (classId: string, updated: Partial<ClassRoom>) => void;
  deleteClass: (classId: string) => void;

  // Students
  students: Student[];
  addStudent: (student: {
    name: string;
    nisn: string;
    kelasId: string;
    gender: 'L' | 'P';
    email?: string;
    phone?: string;
    password?: string;
  }) => void;
  updateStudent: (studentId: string, updated: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  importStudentsBulk: (imported: Array<{
    nisn: string;
    name: string;
    email?: string;
    phone?: string;
    gender: 'L' | 'P';
    kelasId: string;
    className?: string;
  }>) => { successCount: number; errors: string[] };

  // Quizzes & Auto-grading
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  updateQuiz: (quizId: string, updated: Partial<Quiz>) => void;
  toggleQuizActive: (quizId: string) => void;
  deleteQuiz: (quizId: string) => void;
  submitQuiz: (
    quizId: string,
    answers: Record<string, number>,
    timeSpentSeconds: number
  ) => QuizSubmission;
  getStudentSubmission: (quizId: string, studentId: string) => QuizSubmission | undefined;

  // Real-time Attendance
  attendanceSession: AttendanceSession | null;
  attendanceRecords: AttendanceRecord[];
  startAttendanceSession: (
    classId: string,
    title: string,
    durationMinutes: number,
    secretCode?: string
  ) => void;
  closeAttendanceSession: () => void;
  submitAttendance: (status: AttendanceStatus, notes?: string) => boolean;
  updateAttendanceRecord: (recordId: string, status: AttendanceStatus, notes?: string) => void;
  deleteAttendanceRecord: (recordId: string) => void;
  addManualAttendanceRecord: (studentId: string, status: AttendanceStatus, notes?: string) => void;
  hasStudentAttendedToday: boolean;
  todayStudentAttendanceRecord?: AttendanceRecord;

  // Forum
  forumPosts: ForumPost[];
  addForumPost: (
    title: string,
    content: string,
    category: ForumPost['category'],
    tags: string[]
  ) => void;
  updateForumPost: (
    postId: string,
    title: string,
    content: string,
    category: ForumPost['category'],
    tags: string[]
  ) => void;
  deleteForumPost: (postId: string) => void;
  addForumReply: (postId: string, content: string) => void;
  deleteForumReply: (postId: string, replyId: string) => void;
  likeForumPost: (postId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;

  // Academic Report
  getStudentAcademicReport: (studentId: string) => AcademicReport;
  updateStudentAcademicReport: (studentId: string, updatedReport: AcademicReport) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'smk_lms_v1_';

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if clean slate mode was enabled or first run on publish
  const isCleanSlate = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'is_clean_slate') === 'true';
  const isProdFirstRun =
    Boolean((import.meta as unknown as { env?: { PROD?: boolean } })?.env?.PROD) &&
    localStorage.getItem(LOCAL_STORAGE_PREFIX + 'classes') === null;
  const shouldStartEmpty = isCleanSlate || isProdFirstRun;

  // 1. Current user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_USERS[0]; // Default: Teacher
  });

  // 2. Classes
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'classes');
    if (saved) return JSON.parse(saved);
    return shouldStartEmpty ? [] : MOCK_CLASSES;
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  // 3. Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'students');
    if (saved) return JSON.parse(saved);
    return shouldStartEmpty ? [] : MOCK_STUDENTS;
  });

  // 4. Quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'quizzes');
    if (saved) return JSON.parse(saved);
    return shouldStartEmpty ? [] : MOCK_QUIZZES;
  });

  // 5. Submissions
  const [submissions, setSubmissions] = useState<QuizSubmission[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'submissions');
    if (saved) return JSON.parse(saved);
    return shouldStartEmpty ? [] : MOCK_SUBMISSIONS;
  });

  // 6. Realtime Attendance
  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'att_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (new Date(session.expiresAt).getTime() > Date.now()) {
          return session;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return shouldStartEmpty ? null : INITIAL_ATTENDANCE_SESSION;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'att_records');
    if (saved) return JSON.parse(saved);
    return shouldStartEmpty ? [] : INITIAL_ATTENDANCE_RECORDS;
  });

  // 7. Forum
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'forum');
    if (saved) return JSON.parse(saved);
    return shouldStartEmpty ? [] : MOCK_FORUM_POSTS;
  });

  // 8. Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'notif');
    if (saved) return JSON.parse(saved);
    return shouldStartEmpty ? [] : MOCK_NOTIFICATIONS;
  });

  // 9. Custom Academic Reports (Editable per student)
  const [customReports, setCustomReports] = useState<Record<string, AcademicReport>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'reports');
    return saved ? JSON.parse(saved) : {};
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'att_session', JSON.stringify(attendanceSession));
  }, [attendanceSession]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'att_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'forum', JSON.stringify(forumPosts));
  }, [forumPosts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'notif', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'reports', JSON.stringify(customReports));
  }, [customReports]);

  // Periodic check for attendance expiration & deadline notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Check attendance session
      if (attendanceSession && attendanceSession.isActive) {
        if (new Date(attendanceSession.expiresAt).getTime() <= Date.now()) {
          setAttendanceSession((prev) => (prev ? { ...prev, isActive: false } : null));
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [attendanceSession]);

  // Check if data is completely empty
  const isDataEmpty = classes.length === 0 && students.length === 0;

  // Reset all data to empty (clean slate)
  const resetAllDataToEmpty = () => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'is_clean_slate', 'true');
    setClasses([]);
    setStudents([]);
    setQuizzes([]);
    setSubmissions([]);
    setAttendanceSession(null);
    setAttendanceRecords([]);
    setForumPosts([]);
    setNotifications([]);
    setCustomReports({});
    setSelectedClassId('all');

    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'classes', JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'students', JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'quizzes', JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'submissions', JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'att_session', 'null');
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'att_records', JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'forum', JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'notif', JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'reports', JSON.stringify({}));

    const adminUser: User = {
      id: 'usr-admin-guru',
      name: 'Administrator / Guru SMK',
      email: 'admin@smk.sch.id',
      role: 'guru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      nip_nisn: '19850101 201001 1 001',
      jurusan: 'Kurikulum SMK',
      subject: 'Produktif Vokasi SMK',
    };
    setCurrentUser(adminUser);
  };

  // Restore sample demo data if needed
  const loadDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'is_clean_slate');
    setClasses(MOCK_CLASSES);
    setStudents(MOCK_STUDENTS);
    setQuizzes(MOCK_QUIZZES);
    setSubmissions(MOCK_SUBMISSIONS);
    setAttendanceSession(INITIAL_ATTENDANCE_SESSION);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setForumPosts(MOCK_FORUM_POSTS);
    setNotifications(MOCK_NOTIFICATIONS);
    setCurrentUser(MOCK_USERS[0]);
    setSelectedClassId('all');
  };

  // Switch role between guru and student
  const switchRole = (role: UserRole) => {
    if (role === 'guru') {
      const guru = MOCK_USERS.find((u) => u.role === 'guru') || {
        id: 'usr-admin-guru',
        name: 'Administrator / Guru SMK',
        email: 'admin@smk.sch.id',
        role: 'guru',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        nip_nisn: '19850101 201001 1 001',
        jurusan: 'Kurikulum SMK',
      };
      setCurrentUser(guru);
    } else {
      if (students.length > 0) {
        const s = students[0];
        setCurrentUser({
          id: s.id,
          name: s.name,
          email: s.email,
          role: 'siswa',
          avatar: s.avatar,
          nip_nisn: s.nisn,
          kelasId: s.kelasId,
          className: s.className,
          jurusan: s.jurusan,
        });
      } else {
        const dummyStudent: User = {
          id: 'stu-sample',
          name: 'Siswa SMK',
          email: 'siswa@smk.student.id',
          role: 'siswa',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          nip_nisn: '0069998877',
          className: 'Kelas Baru',
          jurusan: 'Vokasi',
        };
        setCurrentUser(dummyStudent);
      }
    }
  };

  const loginUser = (
    identifier: string,
    role: UserRole,
    password?: string
  ): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    if (role === 'siswa') {
      const foundStudent = students.find(
        (s) => s.nisn.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
      );

      if (!foundStudent) {
        return {
          success: false,
          message:
            'Data siswa tidak ditemukan! Pastikan NISN atau Email Anda sudah didaftarkan oleh guru di menu Manajemen Kelas.',
        };
      }

      // Verify student password (default is NISN)
      const expectedPassword = (foundStudent.password || foundStudent.nisn).trim();
      if (cleanPass && cleanPass !== expectedPassword) {
        return {
          success: false,
          message:
            'Kata sandi siswa salah! Password bawaan siswa adalah NISN siswa (kecuali telah diubah oleh guru di Manajemen Kelas).',
        };
      }

      const user: User = {
        id: foundStudent.id,
        name: foundStudent.name,
        email: foundStudent.email,
        role: 'siswa',
        avatar: foundStudent.avatar,
        nip_nisn: foundStudent.nisn,
        kelasId: foundStudent.kelasId,
        className: foundStudent.className,
        jurusan: foundStudent.jurusan,
      };
      setCurrentUser(user);
      return { success: true };
    }

    // Role: Guru / Admin
    const foundTeacher = MOCK_USERS.find(
      (u) =>
        u.role === 'guru' &&
        (u.email.toLowerCase() === cleanId || u.nip_nisn?.toLowerCase() === cleanId)
    );

    if (foundTeacher) {
      setCurrentUser(foundTeacher);
      return { success: true };
    }

    if (
      cleanId === 'admin' ||
      cleanId.includes('guru') ||
      cleanId.includes('@') ||
      cleanId.length >= 3
    ) {
      const teacherUser: User = {
        id: `usr-guru-${Date.now()}`,
        name: identifier.includes('@')
          ? identifier.split('@')[0].toUpperCase()
          : identifier.toUpperCase(),
        email: identifier.includes('@') ? identifier : `${cleanId}@smk.sch.id`,
        role: 'guru',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        nip_nisn: '19850101 201001 1 001',
        jurusan: 'Kurikulum SMK',
        subject: 'Mata Pelajaran Produktif',
      };
      setCurrentUser(teacherUser);
      return { success: true };
    }

    return {
      success: false,
      message: 'NIP atau Email Guru tidak valid. Silakan periksa kembali kredensial Anda.',
    };
  };

  const logout = () => {
    switchRole('guru');
  };

  const addClass = (newClass: Omit<ClassRoom, 'id' | 'studentCount'>) => {
    const id = `cls-${Date.now()}`;
    const item: ClassRoom = {
      ...newClass,
      id,
      studentCount: 0,
    };
    setClasses((prev) => [...prev, item]);
  };

  const updateClass = (classId: string, updated: Partial<ClassRoom>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, ...updated } : c))
    );
    // Also propagate changes to students and quizzes if class name or jurusan changed
    if (updated.name || updated.jurusan) {
      setStudents((prev) =>
        prev.map((s) =>
          s.kelasId === classId
            ? {
                ...s,
                className: updated.name || s.className,
                jurusan: updated.jurusan || s.jurusan,
              }
            : s
        )
      );
      setQuizzes((prev) =>
        prev.map((q) =>
          q.classId === classId ? { ...q, className: updated.name || q.className } : q
        )
      );
    }
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    if (selectedClassId === classId) {
      setSelectedClassId('all');
    }
  };

  // Single student addition
  const addStudent = (studentData: {
    name: string;
    nisn: string;
    kelasId: string;
    gender: 'L' | 'P';
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    const targetClass = classes.find((c) => c.id === studentData.kelasId) || classes[0] || {
      id: studentData.kelasId || 'cls-default',
      name: 'Kelas Utama',
      jurusan: 'Kejuruan SMK',
      waliKelas: 'Guru Pembina',
      academicYear: '2026/2027',
      studentCount: 0,
      code: 'SMK-1',
    };
    const id = `stu-${Date.now()}`;
    const cleanName = studentData.name.trim();
    const cleanNisn = studentData.nisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newStudent: Student = {
      id,
      nisn: cleanNisn,
      name: cleanName,
      kelasId: targetClass.id,
      className: targetClass.name,
      jurusan: targetClass.jurusan,
      email:
        studentData.email?.trim() ||
        `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@smk.student.id`,
      phone: studentData.phone?.trim() || '0812-3456-7890',
      gender: studentData.gender,
      password: studentData.password?.trim() || cleanNisn, // Default password is NISN
      avatar:
        studentData.gender === 'P'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 100,
      averageScore: 0,
      totalQuizzesTaken: 0,
    };

    setStudents((prev) => [...prev, newStudent]);

    // Update class studentCount if class exists in classes
    setClasses((prev) =>
      prev.map((c) =>
        c.id === targetClass.id ? { ...c, studentCount: c.studentCount + 1 } : c
      )
    );

    // Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'guru',
      title: '👤 Akun Siswa Baru Berhasil Didaftarkan',
      message: `${newStudent.name} (NISN: ${newStudent.nisn}) telah terdaftar. Siswa dapat login menggunakan NISN & password.`,
      type: 'grade',
      urgency: 'low',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'kelas',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateStudent = (studentId: string, updated: Partial<Student>) => {
    let oldClassId = '';
    let newClassId = updated.kelasId;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        oldClassId = s.kelasId;
        let newClassName = s.className;
        let newJurusan = s.jurusan;
        if (newClassId && newClassId !== s.kelasId) {
          const targetClass = classes.find((c) => c.id === newClassId);
          if (targetClass) {
            newClassName = targetClass.name;
            newJurusan = targetClass.jurusan;
          }
        }
        return {
          ...s,
          ...updated,
          className: updated.className || newClassName,
          jurusan: updated.jurusan || newJurusan,
        };
      })
    );

    // If student changed class, adjust class counts
    if (newClassId && oldClassId && newClassId !== oldClassId) {
      setClasses((prev) =>
        prev.map((c) => {
          if (c.id === oldClassId) {
            return { ...c, studentCount: Math.max(0, c.studentCount - 1) };
          }
          if (c.id === newClassId) {
            return { ...c, studentCount: c.studentCount + 1 };
          }
          return c;
        })
      );
    }

    // Also update currentUser if it is the edited student
    if (currentUser.id === studentId) {
      setCurrentUser((prev) => ({
        ...prev,
        name: updated.name || prev.name,
        nip_nisn: updated.nisn || prev.nip_nisn,
        email: updated.email || prev.email,
        kelasId: updated.kelasId || prev.kelasId,
        className: updated.className || prev.className,
        jurusan: updated.jurusan || prev.jurusan,
      }));
    }
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setClasses((prev) =>
      prev.map((c) =>
        c.id === student.kelasId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c
      )
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'guru',
      title: '🗑️ Data Siswa Dihapus',
      message: `${student.name} telah dikeluarkan dari kelas ${student.className}.`,
      type: 'grade',
      urgency: 'low',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'kelas',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Bulk student import
  const importStudentsBulk = (
    imported: Array<{
      nisn: string;
      name: string;
      email?: string;
      phone?: string;
      gender: 'L' | 'P';
      kelasId: string;
      className?: string;
    }>
  ) => {
    const targetClass = classes.find((c) => c.id === imported[0]?.kelasId) || classes[0] || {
      id: imported[0]?.kelasId || 'cls-default',
      name: 'Kelas Utama',
      jurusan: 'Kejuruan SMK',
      waliKelas: 'Guru Pembina',
      academicYear: '2026/2027',
      studentCount: 0,
      code: 'SMK-1',
    };
    const newStudents: Student[] = imported.map((item, idx) => {
      const id = `stu-imp-${Date.now()}-${idx}`;
      const cleanNisn = item.nisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`;
      return {
        id,
        nisn: cleanNisn,
        name: item.name,
        kelasId: item.kelasId || targetClass.id,
        className: targetClass ? targetClass.name : 'Kelas SMK',
        jurusan: targetClass ? targetClass.jurusan : 'Vokasi Kejuruan',
        email: item.email || `${item.name.toLowerCase().replace(/\s+/g, '.')}@smk.student.id`,
        phone: item.phone || '0812-3456-7890',
        gender: item.gender || 'L',
        password: cleanNisn, // Default password is NISN
        avatar:
          item.gender === 'P'
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        attendanceRate: 100,
        averageScore: 0,
        totalQuizzesTaken: 0,
      };
    });

    setStudents((prev) => [...prev, ...newStudents]);

    // Update class student count
    setClasses((prev) =>
      prev.map((c) => {
        const addedCount = newStudents.filter((s) => s.kelasId === c.id).length;
        return {
          ...c,
          studentCount: c.studentCount + addedCount,
        };
      })
    );

    // Add notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'guru',
      title: '📁 Migrasi Data Siswa Berhasil',
      message: `Sebanyak ${newStudents.length} siswa baru berhasil diimport secara massal ke kelas ${targetClass.name}.`,
      type: 'grade',
      urgency: 'low',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'kelas',
    };
    setNotifications((prev) => [notif, ...prev]);

    return { successCount: newStudents.length, errors: [] };
  };

  // Quizzes
  const createQuiz = (newQuizData: Omit<Quiz, 'id' | 'createdAt'>) => {
    const id = `quiz-${Date.now()}`;
    const quiz: Quiz = {
      ...newQuizData,
      id,
      createdAt: new Date().toISOString(),
    };
    setQuizzes((prev) => [quiz, ...prev]);

    // Create deadline notification for students in that class
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'siswa',
      classId: quiz.classId,
      title: `📝 Kuis Baru Ditugaskan: ${quiz.title}`,
      message: `Mata pelajaran ${quiz.subject}. Batas waktu pengerjaan: ${new Date(quiz.deadline).toLocaleString('id-ID')}. Kerjakan segera!`,
      type: 'deadline',
      urgency: 'high',
      createdAt: 'Baru saja',
      deadline: quiz.deadline,
      read: false,
      linkTab: 'kuis',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateQuiz = (quizId: string, updated: Partial<Quiz>) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const newQuestions = updated.questions || q.questions;
        const totalPoints = updated.totalPoints ?? newQuestions.reduce((acc, curr) => acc + curr.points, 0);
        return {
          ...q,
          ...updated,
          questions: newQuestions,
          totalPoints,
        };
      })
    );
  };

  const toggleQuizActive = (quizId: string) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, isActive: !q.isActive } : q))
    );
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  // Auto grading execution
  const submitQuiz = (
    quizId: string,
    answers: Record<string, number>,
    timeSpentSeconds: number
  ): QuizSubmission => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');

    let earnedPoints = 0;
    quiz.questions.forEach((q) => {
      const selectedIndex = answers[q.id];
      if (selectedIndex === q.correctOptionIndex) {
        earnedPoints += q.points;
      }
    });

    const maxScore = quiz.totalPoints || 100;
    const percentage = Math.round((earnedPoints / maxScore) * 100);
    const passed = percentage >= quiz.passingScore;

    const submission: QuizSubmission = {
      id: `sub-${Date.now()}`,
      quizId,
      quizTitle: quiz.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNisn: currentUser.nip_nisn,
      classId: currentUser.kelasId || quiz.classId,
      answers,
      score: earnedPoints,
      maxScore,
      percentage,
      passed,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds,
    };

    setSubmissions((prev) => [submission, ...prev.filter((s) => !(s.quizId === quizId && s.studentId === currentUser.id))]);

    // Update student's averageScore in student roster
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === currentUser.id) {
          const studentSubs = [...submissions.filter((sub) => sub.studentId === s.id && sub.quizId !== quizId), submission];
          const avg = Math.round(
            studentSubs.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubs.length
          );
          return {
            ...s,
            averageScore: avg,
            totalQuizzesTaken: studentSubs.length,
          };
        }
        return s;
      })
    );

    // Notify teacher
    const notifGuru: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'guru',
      title: `⚡ Nilai Otomatis: ${currentUser.name}`,
      message: `${currentUser.name} telah mengumpulkan "${quiz.title}" dengan nilai ${percentage}/100 (${passed ? 'Lulus KKM' : 'Remedial'}).`,
      type: 'grade',
      urgency: 'low',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'kuis',
    };
    setNotifications((prev) => [notifGuru, ...prev]);

    return submission;
  };

  const getStudentSubmission = (quizId: string, studentId: string) => {
    return submissions.find((s) => s.quizId === quizId && s.studentId === studentId);
  };

  // Real-time Attendance Controls
  const startAttendanceSession = (
    classId: string,
    title: string,
    durationMinutes: number,
    secretCode?: string
  ) => {
    const targetClass = classes.find((c) => c.id === classId) || classes[0];
    const now = new Date();
    const expires = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const session: AttendanceSession = {
      id: `att-ses-${Date.now()}`,
      classId: targetClass.id,
      className: targetClass.name,
      subject: currentUser.subject || 'Produktif Kejuruan SMK',
      title,
      date: now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      startTime: now.toISOString(),
      expiresAt: expires.toISOString(),
      durationMinutes,
      isActive: true,
      teacherName: currentUser.name,
      secretCode,
    };

    setAttendanceSession(session);

    // Broadcast notification to students
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'siswa',
      classId: targetClass.id,
      title: `🟢 Presensi Dibuka: ${targetClass.name}`,
      message: `${title} sedang aktif selama ${durationMinutes} menit. Klik di menu siswa untuk melakukan absensi kehadiran realtime!`,
      type: 'attendance',
      urgency: 'high',
      createdAt: 'Baru saja',
      deadline: expires.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      linkTab: 'absensi',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const closeAttendanceSession = () => {
    if (attendanceSession) {
      setAttendanceSession({
        ...attendanceSession,
        isActive: false,
      });
    }
  };

  const submitAttendance = (status: AttendanceStatus, notes?: string): boolean => {
    if (!attendanceSession || !attendanceSession.isActive) return false;

    const record: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      sessionId: attendanceSession.id,
      classId: attendanceSession.classId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNisn: currentUser.nip_nisn,
      status,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      notes: notes || 'Presensi mandiri oleh siswa via portal LMS SMK',
    };

    setAttendanceRecords((prev) => [
      ...prev.filter((r) => !(r.sessionId === attendanceSession.id && r.studentId === currentUser.id)),
      record,
    ]);

    return true;
  };

  const todayStudentAttendanceRecord = attendanceSession
    ? attendanceRecords.find(
        (r) => r.sessionId === attendanceSession.id && r.studentId === currentUser.id
      )
    : undefined;

  const hasStudentAttendedToday = !!todayStudentAttendanceRecord;

  const updateAttendanceRecord = (recordId: string, status: AttendanceStatus, notes?: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status,
              notes: notes !== undefined ? notes : r.notes,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }
          : r
      )
    );
  };

  const deleteAttendanceRecord = (recordId: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const addManualAttendanceRecord = (studentId: string, status: AttendanceStatus, notes?: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const sessionId = attendanceSession?.id || `manual-session-${new Date().toISOString().split('T')[0]}`;
    const classId = student.kelasId;

    const record: AttendanceRecord = {
      id: `rec-manual-${Date.now()}`,
      sessionId,
      classId,
      studentId: student.id,
      studentName: student.name,
      studentNisn: student.nisn,
      status,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      notes: notes || 'Input / koreksi manual oleh Guru Pengajar',
    };

    setAttendanceRecords((prev) => [
      ...prev.filter((r) => !(r.sessionId === sessionId && r.studentId === studentId)),
      record,
    ]);
  };

  // Forum actions
  const addForumPost = (
    title: string,
    content: string,
    category: ForumPost['category'],
    tags: string[]
  ) => {
    const post: ForumPost = {
      id: `post-${Date.now()}`,
      classId: currentUser.kelasId || 'cls-x-rpl-1',
      className: currentUser.className || 'X RPL 1',
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      title,
      content,
      category,
      tags,
      createdAt: 'Baru saja',
      likes: 0,
      likedBy: [],
      replies: [],
    };
    setForumPosts((prev) => [post, ...prev]);

    // Send notification to other users
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: currentUser.role === 'guru' ? 'siswa' : 'guru',
      title: `💬 Topik Diskusi Baru: ${title}`,
      message: `${currentUser.name} memposting topik diskusi baru di kategori ${category}.`,
      type: 'forum',
      urgency: 'low',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'forum',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateForumPost = (
    postId: string,
    title: string,
    content: string,
    category: ForumPost['category'],
    tags: string[]
  ) => {
    setForumPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              title,
              content,
              category,
              tags,
            }
          : p
      )
    );
  };

  const deleteForumPost = (postId: string) => {
    setForumPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const addForumReply = (postId: string, content: string) => {
    const reply = {
      id: `rep-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: 'Baru saja',
    };

    setForumPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [...post.replies, reply],
          };
        }
        return post;
      })
    );
  };

  const deleteForumReply = (postId: string, replyId: string) => {
    setForumPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.filter((r) => r.id !== replyId),
          };
        }
        return post;
      })
    );
  };

  const likeForumPost = (postId: string) => {
    setForumPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const hasLiked = post.likedBy.includes(currentUser.id);
          const newLikedBy = hasLiked
            ? post.likedBy.filter((id) => id !== currentUser.id)
            : [...post.likedBy, currentUser.id];
          return {
            ...post,
            likedBy: newLikedBy,
            likes: newLikedBy.length,
          };
        }
        return post;
      })
    );
  };

  // Notification management
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => {
    if (n.read) return false;
    if (n.recipientRole === 'all') return true;
    return n.recipientRole === currentUser.role;
  }).length;

  // Academic Report generator & custom updater
  const getStudentAcademicReport = (studentId: string): AcademicReport => {
    if (customReports[studentId]) {
      return customReports[studentId];
    }

    const targetStudent = students.find((s) => s.id === studentId) || students[0] || {
      id: studentId || 'stu-default',
      name: 'Peserta Didik SMK',
      nisn: '0012345678',
      className: 'Kelas Kejuruan SMK',
      jurusan: 'Rekayasa Perangkat Lunak',
      email: 'siswa@smk.sch.id',
      gender: 'L' as const,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      attendanceRate: 100,
      averageScore: 0,
      totalQuizzesTaken: 0,
      kelasId: 'cls-default',
    };
    const studentSubs = submissions.filter((s) => s.studentId === targetStudent.id);
    const avgScore =
      studentSubs.length > 0
        ? Math.round(studentSubs.reduce((a, b) => a + b.percentage, 0) / studentSubs.length)
        : 88;

    return {
      ...MOCK_ACADEMIC_REPORT,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      nisn: targetStudent.nisn,
      className: targetStudent.className,
      jurusan: targetStudent.jurusan,
      grades: [
        {
          subjectName: 'Pemrograman Web dan Bergerak (PWPB)',
          kkm: 75,
          nilaiPengetahuan: avgScore,
          nilaiKeterampilan: Math.min(100, avgScore + 4),
          nilaiAkhir: Math.round((avgScore * 2 + (avgScore + 4)) / 3),
          predikat: avgScore >= 85 ? 'A' : avgScore >= 75 ? 'B' : 'C',
          keterangan: 'Sangat Baik dalam penguasaan logika kejuruan SMK',
        },
        ...MOCK_ACADEMIC_REPORT.grades.slice(1),
      ],
    };
  };

  const updateStudentAcademicReport = (studentId: string, updatedReport: AcademicReport) => {
    setCustomReports((prev) => ({
      ...prev,
      [studentId]: updatedReport,
    }));
  };

  return (
    <LMSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userRole: currentUser.role,
        switchRole,
        loginUser,
        logout,
        resetAllDataToEmpty,
        loadDemoData,
        isDataEmpty,

        classes,
        selectedClassId,
        setSelectedClassId,
        addClass,
        updateClass,
        deleteClass,

        students,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudentsBulk,

        quizzes,
        submissions,
        createQuiz,
        updateQuiz,
        toggleQuizActive,
        deleteQuiz,
        submitQuiz,
        getStudentSubmission,

        attendanceSession,
        attendanceRecords,
        startAttendanceSession,
        closeAttendanceSession,
        submitAttendance,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        addManualAttendanceRecord,
        hasStudentAttendedToday,
        todayStudentAttendanceRecord,

        forumPosts,
        addForumPost,
        updateForumPost,
        deleteForumPost,
        addForumReply,
        deleteForumReply,
        likeForumPost,

        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,

        getStudentAcademicReport,
        updateStudentAcademicReport,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
