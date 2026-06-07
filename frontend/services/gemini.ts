import { GoogleGenAI, Type } from '@google/genai';
import { AppConfig, GeneratedData } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    jenjang: { type: Type.STRING },
    mata_pelajaran: { type: Type.STRING },
    kelompok_soal: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          teks_bacaan: { type: Type.STRING, nullable: true },
          soal: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nomor: { type: Type.INTEGER },
                tag_utama: { type: Type.STRING, description: "Elemen untuk Matematika, Kompetensi untuk Bahasa" },
                tag_sub: { type: Type.STRING, description: "Sub-elemen untuk Matematika, Sub-kompetensi untuk Bahasa" },
                pertanyaan: { type: Type.STRING },
                pilihan: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING }
                  }
                },
                kunci: { type: Type.STRING },
                pembahasan: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  }
};

const buildPrompt = (config: AppConfig): string => {
  let prompt = `Kamu adalah pembuat soal profesional untuk Tes Kemampuan Akademik (TKA) Indonesia.
Buatlah soal-soal yang sesuai standar TKA dengan ketentuan berikut:
- Jenjang: ${config.level}
- Mata Pelajaran: ${config.subject}
- Topik/Materi/Jenis Teks: ${config.topic}
- Jumlah Soal: ${config.count}
- Tingkat Kesulitan: ${config.difficulty}

Ketentuan Umum:
- Soal berbentuk Pilihan Ganda dengan 4 pilihan (A, B, C, D).
- Hanya ada SATU jawaban benar yang paling tepat.
- Berikan kunci jawaban dan pembahasan singkat (1-2 kalimat) untuk setiap soal.
- Jika jumlah soal lebih dari 5 untuk mata pelajaran Bahasa, buatlah beberapa teks bacaan yang berbeda (maksimal 5 soal per teks). Kelompokkan soal berdasarkan teks bacaannya.

Ketentuan Khusus Jenjang ${config.level}:
`;

  if (config.level === 'SD') {
    prompt += `- Level kognitif kelas 4-6 SD. Gunakan bahasa sederhana dan konkret.\n`;
  } else if (config.level === 'SMP') {
    prompt += `- Level kognitif kelas 7-9 SMP. Konteks lokal dan nasional, mulai ada abstraksi.\n`;
  } else if (config.level === 'SMA') {
    prompt += `- Level kognitif kelas 10-12 SMA. Konteks lokal/nasional/global, abstraksi lebih tinggi.\n`;
  }

  prompt += `\nKetentuan Khusus Mata Pelajaran ${config.subject}:\n`;
  
  if (config.subject === 'Matematika') {
    prompt += `- Angka-angka harus wajar dan perhitungan masuk akal sesuai jenjang.
- teks_bacaan harus null.
- Isi 'tag_utama' dengan Elemen (misal: Aljabar, Bilangan).
- Isi 'tag_sub' dengan Sub-elemen (misal: Persamaan Linear, Pecahan).\n`;
  } else if (config.subject === 'Bahasa Indonesia') {
    prompt += `- Isi 'tag_utama' dengan Kompetensi (misal: Pemahaman Tekstual, Pemahaman Inferensial).
- Isi 'tag_sub' dengan Sub-kompetensi (misal: Menyimpulkan ide pokok).
- Panjang teks: SD (150-200 kata), SMP (200-250 kata), SMA (250-300 kata).\n`;
  } else if (config.subject === 'Bahasa Inggris') {
    prompt += `- Isi 'tag_utama' dengan Kompetensi (misal: Textual Understanding, Inferential Understanding).
- Isi 'tag_sub' dengan Sub-kompetensi (misal: Identifying main idea).
- Panjang teks: SMP (200-350 kata, level A2/B1), SMA (250-350 kata, dominan B1).\n`;
  }

  prompt += `\nPastikan output HANYA berupa JSON yang valid sesuai skema yang diminta.`;
  return prompt;
};

export const generateQuestions = async (config: AppConfig, retries = 3, delay = 1000): Promise<GeneratedData> => {
  const prompt = buildPrompt(config);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.7,
        },
      });

      const jsonStr = response.text.trim();
      const data = JSON.parse(jsonStr) as GeneratedData;
      
      // Ensure sequential numbering across groups
      let currentNumber = 1;
      data.kelompok_soal.forEach(group => {
        group.soal.forEach(q => {
          q.nomor = currentNumber++;
        });
      });

      return data;
    } catch (error: any) {
      console.error(`Error generating questions (attempt ${attempt}/${retries}):`, error);
      if (attempt === retries) {
        throw new Error("Gagal menghasilkan soal setelah beberapa percobaan. Silakan coba lagi.");
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Gagal menghasilkan soal.");
};
