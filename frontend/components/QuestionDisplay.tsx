import React from 'react';
import { GeneratedData, UserAnswers, QuestionOption } from '../types.ts';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QuestionDisplayProps {
  data: GeneratedData;
  userAnswers: UserAnswers;
  setUserAnswers: React.Dispatch<React.SetStateAction<UserAnswers>>;
  isSubmitted: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ data, userAnswers, setUserAnswers, isSubmitted }) => {
  
  const handleOptionSelect = (questionNumber: number, option: keyof QuestionOption) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionNumber]: option }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {data.kelompok_soal.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-6">
          
          {/* Teks Bacaan */}
          {group.teks_bacaan && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-bold text-amber-800 mb-3 uppercase tracking-wider">Teks Bacaan</h3>
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {group.teks_bacaan}
              </div>
              {group.soal.length > 0 && (
                <p className="text-xs text-amber-700 mt-4 italic">
                  *Untuk menjawab soal nomor {group.soal[0].nomor} {group.soal.length > 1 ? `s.d. ${group.soal[group.soal.length - 1].nomor}` : ''}
                </p>
              )}
            </div>
          )}

          {/* Daftar Soal */}
          <div className="space-y-6">
            {group.soal.map((q) => {
              const isAnswered = userAnswers[q.nomor] !== undefined;
              const isCorrect = userAnswers[q.nomor] === q.kunci;
              
              return (
                <div key={q.nomor} className={`bg-white border rounded-lg p-6 shadow-sm transition-all ${isSubmitted ? (isCorrect ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30') : 'border-gray-200 hover:border-teal-200'}`}>
                  
                  {/* Header Soal */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-sm">
                        {q.nomor}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 italic">
                          ({q.tag_utama} – {q.tag_sub})
                        </span>
                      </div>
                    </div>
                    {isSubmitted && (
                      <div>
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-100 px-2 py-1 rounded">
                            <CheckCircle className="w-4 h-4" /> Benar
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-bold bg-red-100 px-2 py-1 rounded">
                            <XCircle className="w-4 h-4" /> Salah
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pertanyaan */}
                  <p className="text-gray-800 font-medium mb-5 leading-relaxed">
                    {q.pertanyaan}
                  </p>

                  {/* Pilihan Jawaban */}
                  <div className="space-y-3">
                    {(['A', 'B', 'C', 'D'] as (keyof QuestionOption)[]).map((opt) => {
                      const isSelected = userAnswers[q.nomor] === opt;
                      const isCorrectOption = q.kunci === opt;
                      
                      let optionClass = "border-gray-200 hover:bg-gray-50 text-gray-700";
                      
                      if (isSubmitted) {
                        if (isCorrectOption) {
                          optionClass = "border-green-500 bg-green-100 text-green-800 font-medium";
                        } else if (isSelected && !isCorrectOption) {
                          optionClass = "border-red-500 bg-red-100 text-red-800";
                        } else {
                          optionClass = "border-gray-200 opacity-50";
                        }
                      } else if (isSelected) {
                        optionClass = "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500";
                      }

                      return (
                        <label 
                          key={opt} 
                          className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${optionClass} ${isSubmitted ? 'cursor-default' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.nomor}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(q.nomor, opt)}
                            disabled={isSubmitted}
                            className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 disabled:opacity-50"
                          />
                          <div className="ml-3 flex-1">
                            <span className="font-bold mr-2">{opt}.</span>
                            <span>{q.pilihan[opt]}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Pembahasan */}
                  {isSubmitted && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                        <AlertCircle className="w-4 h-4" /> Pembahasan
                      </h4>
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {q.pembahasan}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionDisplay;
