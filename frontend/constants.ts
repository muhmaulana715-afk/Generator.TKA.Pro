import { Level, Subject } from './types.ts';

export const CURRICULUM: Record<Level, { subjects: Subject[], topics: Record<Subject, string[]> }> = {
  SD: {
    subjects: ['Matematika', 'Bahasa Indonesia'],
    topics: {
      'Matematika': ['Bilangan', 'Geometri & Pengukuran', 'Data', 'Campuran'],
      'Bahasa Indonesia': ['Teks Informasi', 'Teks Fiksi', 'Campuran'],
      'Bahasa Inggris': [] // Not applicable for SD
    }
  },
  SMP: {
    subjects: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris'],
    topics: {
      'Matematika': ['Bilangan', 'Aljabar', 'Geometri & Pengukuran', 'Data & Peluang', 'Campuran'],
      'Bahasa Indonesia': ['Teks Informasi', 'Teks Fiksi', 'Campuran'],
      'Bahasa Inggris': ['Teks Informasi', 'Teks Fiksi', 'Campuran']
    }
  },
  SMA: {
    subjects: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris'],
    topics: {
      'Matematika': ['Bilangan', 'Aljabar', 'Geometri & Pengukuran', 'Trigonometri', 'Data & Peluang', 'Campuran'],
      'Bahasa Indonesia': ['Teks Informasi', 'Teks Fiksi', 'Campuran'],
      'Bahasa Inggris': ['Teks Informasi', 'Teks Fiksi', 'Campuran']
    }
  }
};

export const QUESTION_COUNTS = [5, 10, 15, 20, 30];
export const DIFFICULTIES = ['Mudah', 'Sedang', 'Sulit', 'Campuran'];

export const LEVEL_COLORS: Record<Level, string> = {
  SD: 'bg-green-100 text-green-800 border-green-200',
  SMP: 'bg-blue-100 text-blue-800 border-blue-200',
  SMA: 'bg-purple-100 text-purple-800 border-purple-200'
};
