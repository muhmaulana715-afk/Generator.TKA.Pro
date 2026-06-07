import React from 'react';
import { AppConfig, Level, Subject, Difficulty } from '../types.ts';
import { CURRICULUM, QUESTION_COUNTS, DIFFICULTIES } from '../constants.ts';
import { Settings, BookOpen, Layers, Hash, BarChart } from 'lucide-react';

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onGenerate, isGenerating }) => {
  
  const handleLevelChange = (level: Level) => {
    const availableSubjects = CURRICULUM[level].subjects;
    const newSubject = availableSubjects.includes(config.subject) ? config.subject : availableSubjects[0];
    const availableTopics = CURRICULUM[level].topics[newSubject];
    const newTopic = availableTopics[0];
    
    setConfig({ ...config, level, subject: newSubject, topic: newTopic });
  };

  const handleSubjectChange = (subject: Subject) => {
    const availableTopics = CURRICULUM[config.level].topics[subject];
    setConfig({ ...config, subject, topic: availableTopics[0] });
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-y-auto shadow-sm">
      <div className="flex items-center gap-2 mb-8 text-teal-700">
        <Settings className="w-6 h-6" />
        <h2 className="text-xl font-bold">Konfigurasi Soal</h2>
      </div>

      <div className="space-y-6 flex-grow">
        {/* Jenjang */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Layers className="w-4 h-4" /> Jenjang Pendidikan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['SD', 'SMP', 'SMA'] as Level[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`py-2 px-1 rounded-md text-sm font-medium transition-colors border ${
                  config.level === lvl
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <BookOpen className="w-4 h-4" /> Mata Pelajaran
          </label>
          <div className="space-y-2">
            {CURRICULUM[config.level].subjects.map((subj) => (
              <label key={subj} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="subject"
                  value={subj}
                  checked={config.subject === subj}
                  onChange={() => handleSubjectChange(subj as Subject)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">{subj}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Topik / Materi */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Layers className="w-4 h-4" /> Materi / Jenis Teks
          </label>
          <select
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            {CURRICULUM[config.level].topics[config.subject].map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        {/* Jumlah Soal */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Hash className="w-4 h-4" /> Jumlah Soal
          </label>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setConfig({ ...config, count })}
                className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors border ${
                  config.count === count
                    ? 'bg-teal-100 text-teal-800 border-teal-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Tingkat Kesulitan */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <BarChart className="w-4 h-4" /> Tingkat Kesulitan
          </label>
          <select
            value={config.difficulty}
            onChange={(e) => setConfig({ ...config, difficulty: e.target.value as Difficulty })}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            {DIFFICULTIES.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-md text-white font-bold shadow-sm transition-all flex justify-center items-center gap-2 ${
            isGenerating 
              ? 'bg-teal-400 cursor-not-allowed' 
              : 'bg-teal-600 hover:bg-teal-700 hover:shadow-md active:transform active:scale-95'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Membuat Soal...
            </>
          ) : (
            'Generate Soal'
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
