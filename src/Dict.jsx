import React, { useState, useEffect } from 'react';
import { Search, Volume2, Loader2, Star, History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordData, setWordData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(true);

  // Load saved data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('dictionary_history');
    const savedFavorites = localStorage.getItem('dictionary_favorites');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dictionary_history', JSON.stringify(history));
    localStorage.setItem('dictionary_favorites', JSON.stringify(favorites));
  }, [history, favorites]);

  const getDict = async (inp) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inp}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error('Word not found!');
      
      const audioURL = data[0].phonetics.find(phonetic => phonetic.audio)?.audio;
      const allMeanings = data[0].meanings.map(meaning => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions,
        synonyms: meaning.synonyms,
        antonyms: meaning.antonyms
      }));

      const wordInfo = {
        word: data[0].word,
        phonetic: data[0].phonetic,
        audioURL,
        meanings: allMeanings
      };

      setWordData(wordInfo);
      setError('');
      
      // Add to history
      setHistory(prev => {
        const newHistory = [wordInfo.word, ...prev.filter(w => w !== wordInfo.word)].slice(0, 10);
        return newHistory;
      });

    } catch (error) {
      setWordData(null);
      setError('Word not found. Please try another word.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      getDict(searchTerm.trim().toLowerCase());
    }
  };

  const playAudio = (audioURL) => {
    const audio = new Audio(audioURL);
    setIsPlaying(true);
    audio.play();
    audio.onended = () => setIsPlaying(false);
  };

  const toggleFavorite = (word) => {
    setFavorites(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      }
      return [...prev, word];
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder="Search for any word..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 px-6 pr-16 text-lg rounded-2xl bg-white/20 backdrop-blur-sm 
                         border border-white/30 text-white placeholder-white/50
                         focus:outline-none focus:ring-2 focus:ring-white/30
                         transition-all duration-300"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3
                         rounded-xl bg-blue-600 hover:bg-blue-700
                         transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-white" />
              )}
            </button>
          </form>
        </div>

        {/* History Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Recent Searches</span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-white/60 hover:text-white/80 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* History List */}
        {showHistory && history.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              {history.map((word, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(word);
                    getDict(word);
                  }}
                  className="px-3 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/20 
                           transition-all duration-300 text-sm"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Word Data */}
        <div className="mt-4">
          {error ? (
            <div className="text-center p-8 text-white/80">{error}</div>
          ) : wordData && (
            <div className="space-y-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold capitalize">
                  {wordData.word}
                </h2>
                <div className="flex items-center gap-2">
                  {wordData.audioURL && (
                    <button
                      onClick={() => playAudio(wordData.audioURL)}
                      disabled={isPlaying}
                      className="p-3 rounded-full bg-blue-600/30 hover:bg-blue-600/50
                               transition-all duration-300 disabled:opacity-50"
                    >
                      <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleFavorite(wordData.word)}
                    className={`p-3 rounded-full transition-all duration-300
                              ${favorites.includes(wordData.word) 
                                ? 'bg-yellow-500/50 hover:bg-yellow-500/70' 
                                : 'bg-white/20 hover:bg-white/30'}`}
                  >
                    <Star className="w-6 h-6" fill={favorites.includes(wordData.word) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {wordData.phonetic && (
                <div className="text-lg text-white/80">
                  <span className="font-medium">{wordData.phonetic}</span>
                </div>
              )}

              {/* Meanings */}
              <div className="space-y-6">
                {wordData.meanings.map((meaning, index) => (
                  <div key={index} className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <h3 className="text-lg font-medium mb-4 text-white/90 italic">
                      {meaning.partOfSpeech}
                    </h3>
                    
                    {/* Definitions */}
                    <div className="space-y-4">
                      {meaning.definitions.map((def, idx) => (
                        <div key={idx} className="pl-4 border-l-2 border-blue-500/50">
                          <p className="text-white/70 leading-relaxed mb-2">
                            {def.definition}
                          </p>
                          {def.example && showExamples && (
                            <p className="text-white/50 text-sm italic">
                              ""{def.example}""
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Synonyms & Antonyms */}
                    {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {meaning.synonyms.length > 0 && (
                          <div>
                            <span className="text-white/60 text-sm">Synonyms: </span>
                            <span className="text-blue-300">
                              {meaning.synonyms.join(', ')}
                            </span>
                          </div>
                        )}
                        {meaning.antonyms.length > 0 && (
                          <div>
                            <span className="text-white/60 text-sm">Antonyms: </span>
                            <span className="text-blue-300">
                              {meaning.antonyms.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dictionary;