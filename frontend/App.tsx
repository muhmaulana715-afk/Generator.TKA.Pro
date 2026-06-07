import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import QuestionDisplay from './components/QuestionDisplay.tsx';
import { AppConfig, GeneratedData, UserAnswers, Level } from './types.ts';
import { generateQuestions } from './services/gemini.ts';
import { downloadAsWord } from './utils/export.ts';
import { LEVEL_COLORS } from './constants.ts';
import { GraduationCap, CheckSquare, RotateCcw, AlertTriangle, BookOpen } from 'lucide-react';

function App() {
  const [config, setConfig] = useState<AppConfig>({
    level: 'SD',
    subject: 'Matematika',
    topic: 'Campuran',
    count: 5,
    difficulty: 'Campuran'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const data = await generateQuestions(config);
      setGeneratedData(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckAnswers = () => {
    if (!generatedData) return;
    
    const totalQuestions = generatedData.kelompok_soal.reduce((acc, group) => acc + group.soal.length, 0);
    const answeredCount = Object.keys(userAnswers).length;
    
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(`Anda baru menjawab ${answeredCount} dari ${totalQuestions} soal. Yakin ingin mengumpulkan?`);
      if (!confirmSubmit) return;
    }
    
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setGeneratedData(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setError(null);
  };

  const calculateScore = () => {
    if (!generatedData) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    let total = 0;
    
    generatedData.kelompok_soal.forEach(group => {
      group.soal.forEach(q => {
        total++;
        if (userAnswers[q.nomor] === q.kunci) {
          correct++;
        }
      });
    });
    
    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100)
    };
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar Configuration */}
      <div className="md:h-full flex-shrink-0 z-10">
        <Sidebar 
          config={config} 
          setConfig={setConfig} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">TKA Generator Pro</h1>
              <p className="text-xs text-gray-500 font-medium">AI-Powered Assessment Tool</p>
            </div>
          </div>
          
          {generatedData && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${LEVEL_COLORS[generatedData.jenjang as Level]}`}>
              {generatedData.jenjang} • {generatedData.mata_pelajaran}
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-bold text-sm">Gagal Menghasilkan Soal</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generatedData && !isGenerating && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-60">
              <div className="bg-gray-200 p-6 rounded-full mb-6">
                <BookOpen className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Belum Ada Soal</h2>
              <p className="text-gray-500">
                Silakan atur konfigurasi di panel sebelah kiri dan klik "Generate Soal" untuk memulai latihan.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-teal-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Menyusun Soal TKA...</h2>
              <p className="text-gray-500 text-sm max-w-xs text-center">
                AI sedang meracik soal berkualitas sesuai standar kurikulum {config.level}. Mohon tunggu sebentar.
              </p>
            </div>
          )}

          {/* Result Score Overlay (Top of content when submitted) */}
          {generatedData && isSubmitted && (
            <div className="max-w-4xl mx-auto mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${calculateScore().percentage >= 70 ? 'text-green-500' : calculateScore().percentage >= 40 ? 'text-yellow-500' : 'text-red-500'}`}
                      strokeDasharray={`${calculateScore().percentage}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-2xl font-black text-gray-800">
                    {calculateScore().percentage}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Hasil Latihan</h2>
                  <p className="text-gray-600">
                    Anda menjawab benar <span className="font-bold text-gray-900">{calculateScore().correct}</span> dari <span className="font-bold text-gray-900">{calculateScore().total}</span> soal.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 flex-wrap w-full md:w-auto justify-end">
                <button
                  onClick={() => downloadAsWord(generatedData, false)}
                  disabled={!generatedData || generatedData.kelompok_soal.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white
                             bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700
                             shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <span>📄</span>
                  <span className="hidden sm:inline">Unduh Soal Saja (.docx)</span>
                  <span className="sm:hidden">Soal</span>
                </button>

                <button
                  onClick={() => downloadAsWord(generatedData, true)}
                  disabled={!generatedData || generatedData.kelompok_soal.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white
                             bg-gradient-to-r from-orange-400 to-green-500
                             hover:from-orange-500 hover:to-green-600
                             shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <span>📋</span>
                  <span className="hidden sm:inline">Unduh Soal + Kunci (.docx)</span>
                  <span className="sm:hidden">Soal+Kunci</span>
                </button>
                
                <button 
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-md"
                >
                  <RotateCcw className="w-4 h-4" /> Latihan Baru
                </button>
              </div>
            </div>
          )}

          {/* Questions Display */}
          {generatedData && !isGenerating && (
            <QuestionDisplay 
              data={generatedData} 
              userAnswers={userAnswers} 
              setUserAnswers={setUserAnswers}
              isSubmitted={isSubmitted}
            />
          )}
        </main>

        {/* Action Footer (Sticky) */}
        {generatedData && !isGenerating && !isSubmitted && (
          <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Terjawab: <span className="text-teal-700 font-bold">{Object.keys(userAnswers).length}</span> / {generatedData.kelompok_soal.reduce((acc, group) => acc + group.soal.length, 0)}
              </div>
              <div className="flex gap-3 flex-wrap w-full sm:w-auto justify-end">
                <button
                  onClick={() => downloadAsWord(generatedData, false)}
                  disabled={!generatedData || generatedData.kelompok_soal.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white
                             bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700
                             shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  <span>📄</span>
                  <span className="hidden sm:inline">Unduh Soal (.docx)</span>
                </button>

                <button
                  onClick={() => downloadAsWord(generatedData, true)}
                  disabled={!generatedData || generatedData.kelompok_soal.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white
                             bg-gradient-to-r from-orange-400 to-green-500
                             hover:from-orange-500 hover:to-green-600
                             shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  <span>📋</span>
                  <span className="hidden sm:inline">Unduh + Kunci (.docx)</span>
                </button>

                <button 
                  onClick={handleCheckAnswers}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <CheckSquare className="w-5 h-5" /> Periksa Jawaban
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
