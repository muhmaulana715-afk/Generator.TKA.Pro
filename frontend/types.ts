export type Level = 'SD' | 'SMP' | 'SMA';
export type Subject = 'Matematika' | 'Bahasa Indonesia' | 'Bahasa Inggris';
export type Difficulty = 'Mudah' | 'Sedang' | 'Sulit' | 'Campuran';

export interface AppConfig {
  level: Level;
  subject: Subject;
  topic: string;
  count: number;
  difficulty: Difficulty;
}

export interface QuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  nomor: number;
  tag_utama: string;
  tag_sub: string;
  pertanyaan: string;
  pilihan: QuestionOption;
  kunci: 'A' | 'B' | 'C' | 'D';
  pembahasan: string;
}

export interface QuestionGroup {
  teks_bacaan: string | null;
  soal: Question[];
}

export interface GeneratedData {
  jenjang: string;
  mata_pelajaran: string;
  kelompok_soal: QuestionGroup[];
}

export interface UserAnswers {
  [questionNumber: number]: 'A' | 'B' | 'C' | 'D';
}
