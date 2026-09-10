import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useLMS } from '../context/LMSContext';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Trash2, ArrowRight } from 'lucide-react';

interface Props {
  defaultClassId?: string;
  onSuccess?: () => void;
}

interface ParsedStudentRow {
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  email?: string;
  phone?: string;
  isValid: boolean;
  validationError?: string;
}

export const ExcelStudentImporter: React.FC<Props> = ({ defaultClassId, onSuccess }) => {
  const { classes, importStudentsBulk } = useLMS();
  const [targetClassId, setTargetClassId] = useState<string>(
    defaultClassId && defaultClassId !== 'all' ? defaultClassId : classes[0]?.id || ''
  );
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success?: number; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const targetClass = classes.find((c) => c.id === targetClassId) || classes[0];
    const templateData = [
      {
        NISN: '0061234567',
        'Nama Lengkap': 'Rizky Muhammad Fajar',
        'Jenis Kelamin (L/P)': 'L',
        'Kelas SMK': targetClass?.name || 'X RPL 1',
        Jurusan: targetClass?.jurusan || 'Rekayasa Perangkat Lunak',
        Email: 'rizky.fajar@smk.student.id',
        'No WhatsApp/HP': '081234567890',
      },
      {
        NISN: '0067654321',
        'Nama Lengkap': 'Annisa Syaharani',
        'Jenis Kelamin (L/P)': 'P',
        'Kelas SMK': targetClass?.name || 'X RPL 1',
        Jurusan: targetClass?.jurusan || 'Rekayasa Perangkat Lunak',
        Email: 'annisa.syaharani@smk.student.id',
        'No WhatsApp/HP': '081987654321',
      },
      {
        NISN: '0069988771',
        'Nama Lengkap': 'Bima Aditya Pratama',
        'Jenis Kelamin (L/P)': 'L',
        'Kelas SMK': targetClass?.name || 'X RPL 1',
        Jurusan: targetClass?.jurusan || 'Rekayasa Perangkat Lunak',
        Email: 'bima.aditya@smk.student.id',
        'No WhatsApp/HP': '085712345678',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa SMK');
    XLSX.writeFile(workbook, `Template_Import_Siswa_${targetClass?.name.replace(/\s+/g, '_') || 'SMK'}.xlsx`);
  };

  // Handle File Upload & Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<any>(worksheet);

        const processed: ParsedStudentRow[] = rawJson.map((row: any, idx: number) => {
          // Normalize key names
          const nisn = String(row['NISN'] || row['nisn'] || row['Nisn'] || '').trim();
          const name = String(row['Nama Lengkap'] || row['Nama'] || row['nama'] || row['name'] || '').trim();
          let genderRaw = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['gender'] || 'L').trim().toUpperCase();
          const gender: 'L' | 'P' = genderRaw.startsWith('P') ? 'P' : 'L';
          const email = String(row['Email'] || row['email'] || '').trim();
          const phone = String(row['No WhatsApp/HP'] || row['No HP'] || row['phone'] || '').trim();

          let isValid = true;
          let validationError = '';

          if (!name) {
            isValid = false;
            validationError = 'Nama siswa wajib diisi';
          }

          return {
            nisn: nisn || `006${Math.floor(1000000 + Math.random() * 9000000)}`,
            name,
            gender,
            email,
            phone,
            isValid,
            validationError,
          };
        });

        setParsedRows(processed);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        alert('Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Commit valid rows to database
  const handleCommitImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const targetClass = classes.find((c) => c.id === targetClassId) || classes[0] || {
      id: 'cls-default-1',
      name: 'X RPL 1',
      grade: 'X' as const,
      jurusan: 'Rekayasa Perangkat Lunak',
      code: 'XRPL1',
      waliKelas: 'Guru Pembimbing SMK',
      academicYear: '2026/2027 Ganjil',
      studentCount: 0,
    };

    const payload = validRows.map((r) => ({
      nisn: r.nisn,
      name: r.name,
      gender: r.gender,
      email: r.email,
      phone: r.phone,
      kelasId: targetClass.id,
      className: targetClass.name,
    }));

    const res = importStudentsBulk(payload);
    setImportStatus({
      success: res.successCount,
      message: `Berhasil menambahkan ${res.successCount} siswa ke kelas ${targetClass.name}! Siswa kini dapat masuk menggunakan NISN mereka.`,
    });
    setParsedRows([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (onSuccess) onSuccess();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Import Siswa Massal Menggunakan Excel
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Migrasi data siswa SMK per kelas secara cepat dengan format berkas spreadsheet (.xlsx / .csv).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Template Excel
          </button>
        </div>
      </div>

      {/* Target Class Selector */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pilih Target Kelas SMK Tujuan Migrasi
          </label>
          <select
            value={targetClassId}
            onChange={(e) => setTargetClassId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.jurusan} ({c.studentCount} siswa saat ini)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Unggah Berkas Excel (.xlsx / .xls)
          </label>
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-file-input"
            />
            <label
              htmlFor="excel-file-input"
              className="flex items-center justify-between px-3 py-2 border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg cursor-pointer transition text-xs text-slate-700 font-medium"
            >
              <span className="flex items-center gap-2 truncate">
                <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{fileName || 'Klik untuk pilih file spreadsheet...'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-semibold shrink-0 ml-2">
                Pilih File
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {importStatus && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedRows.length > 0 && (
        <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Pratinjau Data ({parsedRows.length} Baris Ditemukan)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {validCount} Valid
              </span>
              {parsedRows.length - validCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {parsedRows.length - validCount} Bermasalah
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setFileName('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Batal
              </button>
              <button
                type="button"
                onClick={handleCommitImport}
                disabled={validCount === 0}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <span>Import {validCount} Siswa Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold text-[10px] sticky top-0">
                <tr>
                  <th className="p-2.5">No</th>
                  <th className="p-2.5">NISN</th>
                  <th className="p-2.5">Nama Lengkap</th>
                  <th className="p-2.5">JK</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className={row.isValid ? 'hover:bg-slate-50/80' : 'bg-rose-50/50'}>
                    <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2.5 font-mono text-slate-700">{row.nisn}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{row.name}</td>
                    <td className="p-2.5 font-bold text-slate-700">{row.gender}</td>
                    <td className="p-2.5 text-slate-500 truncate max-w-[150px]">{row.email || '-'}</td>
                    <td className="p-2.5">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Siap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> {row.validationError}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
