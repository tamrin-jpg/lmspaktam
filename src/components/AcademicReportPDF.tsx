import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLMS } from '../context/LMSContext';
import {
  FileDown,
  Printer,
  FileCheck,
  Building,
  User,
  CheckCircle2,
  Calendar,
  Share2,
  Award,
} from 'lucide-react';

export const AcademicReportPDF: React.FC = () => {
  const { currentUser, students, classes, getStudentAcademicReport } = useLMS();

  // Selected student for report
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (currentUser.role === 'siswa') return currentUser.id;
    return students[0]?.id || 'stu-1';
  });

  const report = getStudentAcademicReport(selectedStudentId);
  const targetStudent = students.find((s) => s.id === selectedStudentId) || students[0] || {
    id: selectedStudentId || 'stu-default',
    name: report.studentName,
    nisn: report.nisn,
    className: report.className,
    jurusan: report.jurusan,
    email: 'siswa@smk.sch.id',
    gender: 'L' as const,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    attendanceRate: 100,
    averageScore: 0,
    totalQuizzesTaken: 0,
    kelasId: 'cls-default',
  };

  // Function to generate and download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 1. Official SMK Kop Surat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PEMERINTAH DAERAH PROVINSI JAWA BARAT', 105, 14, { align: 'center' });
    doc.text('DINAS PENDIDIKAN - CABANG DINAS WILAYAH III', 105, 19, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text('SMK NEGERI 1 REKAYASA TEKNOLOGI & INFORMATIKA', 105, 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Jl. Industri Kejuruan Vokasi No. 45, Kota Pendidikan • Telp: (021) 88997700 • Email: info@smkn1rekayasa.sch.id', 105, 30, { align: 'center' });
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.8);
    doc.line(14, 33, 196, 33);
    doc.setLineWidth(0.2);
    doc.line(14, 34, 196, 34);

    // 2. Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('LAPORAN CAPAIAN HASIL BELAJAR PESERTA DIDIK (RAPOR AKADEMIK)', 105, 42, { align: 'center' });

    // 3. Student Identity Meta Table
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    const leftX = 16;
    const midX = 115;
    let currY = 50;

    doc.setFont('helvetica', 'bold');
    doc.text('Nama Siswa', leftX, currY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${report.studentName}`, leftX + 28, currY);

    doc.setFont('helvetica', 'bold');
    doc.text('Kelas / Rombel', midX, currY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${report.className}`, midX + 28, currY);

    currY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('NISN', leftX, currY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${report.nisn}`, leftX + 28, currY);

    doc.setFont('helvetica', 'bold');
    doc.text('Program Keahlian', midX, currY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${report.jurusan}`, midX + 28, currY);

    currY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Semester', leftX, currY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${report.semester}`, leftX + 28, currY);

    doc.setFont('helvetica', 'bold');
    doc.text('Tahun Pelajaran', midX, currY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${report.academicYear}`, midX + 28, currY);

    // 4. Grades Table using autoTable
    const tableData = report.grades.map((g, index) => [
      index + 1,
      g.subjectName,
      g.kkm,
      g.nilaiPengetahuan,
      g.nilaiKeterampilan,
      g.nilaiAkhir,
      g.predikat,
      g.keterangan,
    ]);

    autoTable(doc, {
      startY: 68,
      head: [
        ['No', 'Mata Pelajaran Kejuruan & Umum', 'KKM', 'Pengetahuan', 'Keterampilan', 'Nilai Akhir', 'Predikat', 'Keterangan Capaian Kompetensi'],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        valign: 'middle',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 50 },
        2: { halign: 'center', cellWidth: 10 },
        3: { halign: 'center', cellWidth: 16 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
        7: { cellWidth: 54 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 6;

    // 5. Attendance Summary Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('REKAPITULASI PRESENSI KEHADIRAN SISWA:', 16, finalY);

    autoTable(doc, {
      startY: finalY + 2,
      head: [['Hadir (Pertemuan)', 'Izin (Dispensasi)', 'Sakit (Keterangan)', 'Tanpa Keterangan (Alpa)']],
      body: [
        [
          `${report.attendance.hadir} Hari`,
          `${report.attendance.izin} Hari`,
          `${report.attendance.sakit} Hari`,
          `${report.attendance.alpa} Hari`,
        ],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontSize: 8,
        halign: 'center',
      },
      styles: {
        fontSize: 8,
        halign: 'center',
        cellPadding: 2,
      },
    });

    const noteY = (doc as any).lastAutoTable.finalY + 6;

    // 6. Catatan Wali Kelas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CATATAN WALI KELAS & PEMBIMBING KEJURUAN:', 16, noteY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(`"${report.catatanWaliKelas}"`, 175);
    doc.text(splitNotes, 16, noteY + 5);

    // 7. Signatures
    const sigY = noteY + 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Mengetahui,', 25, sigY);
    doc.text('Orang Tua / Wali Siswa', 25, sigY + 4);
    doc.text('(....................................)', 25, sigY + 22);

    doc.text('Kota Pendidikan, 09 September 2026', 135, sigY);
    doc.text('Wali Kelas X RPL 1', 135, sigY + 4);
    doc.setFont('helvetica', 'bold');
    doc.text('Bambang Sutrisno, S.Kom., M.T.', 135, sigY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text('NIP: 19840215 200801 1 007', 135, sigY + 26);

    // Save PDF
    doc.save(`Rapor_SMK_${report.studentName.replace(/\s+/g, '_')}_${report.nisn}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Rapor Capaian Akademik & Kejuruan SMK
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Laporan Akademik & Cetak Rapor PDF
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Sistem laporan komprehensif memuat nilai kuis otomatis, capaian kompetensi kejuruan,
              presensi kehadiran, dan catatan wali kelas yang siap diunduh langsung dalam format PDF standar sekolah.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Unduh Rapor PDF Resmi
          </button>
        </div>
      </div>

      {/* Selector: If teacher, choose student */}
      {currentUser.role === 'guru' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <label className="text-xs font-bold text-slate-700">
              Pilih Siswa untuk Dicetak Rapornya:
            </label>
          </div>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs font-bold border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[280px]"
          >
            {students.length === 0 ? (
              <option value="">(Belum ada siswa terdaftar)</option>
            ) : (
              students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nisn}) — {s.className}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {/* On-Screen Formal Paper Sheet Preview */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-10 shadow-lg max-w-4xl mx-auto text-slate-900 font-sans">
        {/* KOP SURAT RESMI */}
        <div className="text-center pb-4 border-b-2 border-slate-900">
          <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-700">
            Pemerintah Daerah Provinsi Jawa Barat • Dinas Pendidikan
          </h4>
          <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-slate-900 mt-0.5">
            SMK Negeri 1 Rekayasa Teknologi & Informatika
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            Jl. Industri Kejuruan Vokasi No. 45, Kota Pendidikan • Telp: (021) 88997700 • Email: info@smkn1rekayasa.sch.id
          </p>
        </div>

        {/* TITLE */}
        <div className="text-center my-5">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide underline underline-offset-4">
            Laporan Capaian Hasil Belajar Peserta Didik (Rapor Akademik)
          </h3>
          <span className="text-xs text-slate-500">Semester Ganjil — Tahun Pelajaran 2026/2027</span>
        </div>

        {/* METADATA IDENTITAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500 font-semibold">Nama Peserta Didik:</span>
            <span className="font-extrabold text-slate-900">{report.studentName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500 font-semibold">Kelas / Rombel:</span>
            <span className="font-extrabold text-slate-900">{report.className}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500 font-semibold">Nomor Induk Siswa Nasional (NISN):</span>
            <span className="font-mono font-bold text-slate-900">{report.nisn}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500 font-semibold">Kompetensi Keahlian:</span>
            <span className="font-bold text-slate-900">{report.jurusan}</span>
          </div>
        </div>

        {/* TABEL NILAI */}
        <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                <tr>
                  <th className="p-3 text-center w-8">No</th>
                  <th className="p-3">Mata Pelajaran Kejuruan & Umum</th>
                  <th className="p-3 text-center">KKM</th>
                  <th className="p-3 text-center">Pengetahuan</th>
                  <th className="p-3 text-center">Keterampilan</th>
                  <th className="p-3 text-center">Nilai Akhir</th>
                  <th className="p-3 text-center">Predikat</th>
                  <th className="p-3">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.grades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{g.subjectName}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{g.kkm}</td>
                    <td className="p-3 text-center font-mono font-medium">{g.nilaiPengetahuan}</td>
                    <td className="p-3 text-center font-mono font-medium">{g.nilaiKeterampilan}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-700">
                      {g.nilaiAkhir}
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          g.predikat === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {g.predikat}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 leading-relaxed">
                      {g.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KEHADIRAN & CATATAN WALI KELAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h5 className="font-bold text-slate-800 uppercase text-[11px] mb-2">
              Rekapitulasi Presensi
            </h5>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Hadir:</span>
                <span className="font-bold text-emerald-700">{report.attendance.hadir} Hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Izin:</span>
                <span className="font-bold text-amber-700">{report.attendance.izin} Hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sakit:</span>
                <span className="font-bold text-blue-700">{report.attendance.sakit} Hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alpa:</span>
                <span className="font-bold text-rose-700">{report.attendance.alpa} Hari</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
            <div>
              <h5 className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                Catatan Wali Kelas & Pembimbing
              </h5>
              <p className="text-slate-600 italic leading-relaxed">
                "{report.catatanWaliKelas}"
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">Status Kelulusan Kompetensi:</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]">
                {report.statusKelulusan}
              </span>
            </div>
          </div>
        </div>

        {/* TANDA TANGAN */}
        <div className="grid grid-cols-2 pt-6 border-t border-slate-300 text-xs">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800">Orang Tua / Wali Peserta Didik,</p>
            <div className="h-16"></div>
            <p className="font-semibold text-slate-900">( ............................................. )</p>
          </div>

          <div className="text-right">
            <p className="text-slate-500">Kota Pendidikan, 09 September 2026</p>
            <p className="font-bold text-slate-800">Wali Kelas {report.className},</p>
            <div className="h-16"></div>
            <p className="font-extrabold text-slate-900 underline">Bambang Sutrisno, S.Kom., M.T.</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP. 19840215 200801 1 007</p>
          </div>
        </div>

        {/* Action Button at bottom */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Unduh Berkas Rapor Resmi (.PDF)
          </button>
        </div>
      </div>
    </div>
  );
};
