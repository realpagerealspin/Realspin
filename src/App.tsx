import { useState, useEffect } from 'react';
import { SpinWheel } from './components/SpinWheel';
import { SegmentManager } from './components/SegmentManager';
import { History } from './components/History';
import { Trophy } from 'lucide-react';

interface Topic {
  name: string;
  description: string;
  answers?: string;
}

function Logos({ fullscreen = false }: { fullscreen?: boolean }) {
  // Use fixed positioning in fullscreen, absolute otherwise
  return (
    <>
      <img
        src="/RealPage.png"
        alt="RealPage Logo"
        className="object-contain"
        style={{
          height: fullscreen ? 'clamp(60px, 8vw, 120px)' : 'clamp(40px, 6vw, 80px)',
          width: 'auto',
          maxWidth: fullscreen ? '250px' : '190px',
          position: 'fixed',
          left: fullscreen ? '8px' : '4px',
          top: fullscreen ? '8px' : '4px',
          margin: 0,
          zIndex: 101,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
        }}
      />
      <img
        src="/CareerElevate.png"
        alt="Career Elevate Logo"
        className="object-contain rounded-lg"
        style={{
          height: fullscreen ? 'clamp(80px, 10vw, 180px)' : 'clamp(60px, 8vw, 140px)',
          width: 'auto',
          maxWidth: fullscreen ? '380px' : '190px',
          position: 'fixed',
          right: fullscreen ? '8px' : '4px',
          top: fullscreen ? '8px' : '4px',
          margin: 0,
          zIndex: 101,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
        }}
      />
    </>
  );
}

function App() {
  // Wheel starts empty
  const [segments, setSegments] = useState<Topic[]>([]);

  // Persist names of topics permanently removed via the UI (clicking X)
  const [removedTopics, setRemovedTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem('removedTopics');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('wheelHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wheelSegments', JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem('wheelHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('removedTopics', JSON.stringify(removedTopics));
  }, [removedTopics]);

  // Accepts Topic object only
  const handleAddSegment = (segment: Topic) => {
    const name = segment.name.trim();
    if (
      name &&
      !segments.some(s => s.name.trim().toLowerCase() === name.toLowerCase())
    ) {
      // Use sequential numbering: next number is current length + 1
      const sequentialNumber = segments.length + 1;
      setSegments([...segments, { 
        name: String(sequentialNumber), 
        description: segment.description || '', 
        answers: segment.answers 
      }]);
    }
  };

  const handleRemoveSegment = (index: number) => {
    const seg = segments[index];
    if (!seg) return;
    setSegments(segments.filter((_, i) => i !== index));
    if (!removedTopics.includes(seg.name)) {
      setRemovedTopics([...removedTopics, seg.name]);
    }
  };

  const handleClearAll = () => {
    setSegments([]);
    setHistory([]);
  };

  // Add function to repopulate wheel from history
  const handleRepopulateWheel = () => {
    // Get all questions from history (remove duplicates)
    const uniqueQuestions = history.filter((historyItem, index, self) => 
      index === self.findIndex(t => t.description === historyItem.description)
    );
    
    // Append history questions to existing wheel segments
    const combinedSegments = [...segments, ...uniqueQuestions];
    
    // Renumber all segments sequentially from 1
    const renumberedSegments = combinedSegments.map((item, index) => ({
      name: String(index + 1),
      description: item.description,
      answers: item.answers
    }));
    
    setSegments(renumberedSegments);
    setHistory([]); // Clear history after repopulating
  };

  const handleSpinComplete = (result: string) => {
    const winner = segments.find(s => s.name === result);
    if (winner) {
      setHistory([winner, ...history.slice(0, 4)]);
      setSegments(segments.filter(s => s.name !== result));
    }
  };

  const handleEditSegment = (index: number, updatedSegment: Topic) => {
    setSegments(segments.map((seg, i) => (i === index ? updatedSegment : seg)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-realpage-blue-dark via-realpage-blue to-realpage-blue-darker text-white overflow-x-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-realpage-teal rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-realpage-teal-light rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-realpage-teal-dark/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <header className="relative py-8 px-4 border-b-4 border-realpage-teal bg-gradient-to-r from-realpage-blue-dark via-realpage-blue to-realpage-blue-darker shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-realpage-teal/10 to-transparent animate-pulse"></div>
          <div className="container mx-auto relative">
            <Logos />

            <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
              <div className="animate-float hidden sm:block">
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-realpage-teal drop-shadow-2xl filter brightness-110" />
              </div>
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                  <span className="text-realpage-teal drop-shadow-2xl">
                    Do You REAL-LY Know?
                  </span>
                </h1>
              </div>
              <div className="animate-float hidden sm:block" style={{ animationDelay: '0.5s' }}>
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-realpage-teal drop-shadow-2xl filter brightness-110 transform scale-x-[-1]" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-white/10 via-realpage-teal/20 to-white/10 backdrop-blur-sm border-2 border-realpage-teal/30 shadow-lg">
                <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-realpage-teal animate-pulse shadow-lg shadow-realpage-teal/50"></div>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-white/95 tracking-wide">
                  Career Elevate
                </p>
                <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-realpage-teal animate-pulse shadow-lg shadow-realpage-teal/50"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start max-w-7xl mx-auto">
            <div className="lg:col-span-2 flex justify-center items-center min-h-[500px]">
              <SpinWheel
                segments={segments}
                onSpinComplete={handleSpinComplete}
                LogosComponent={(props: any) => <Logos {...props} fullscreen />}
                onRepopulateWheel={handleRepopulateWheel}
                historyCount={history.length}
              />
            </div>

            <div className="space-y-6 w-full">
              <SegmentManager
                onAddSegment={handleAddSegment}
              />

              {/* Display current wheel segments with remove option */}
              {segments.length > 0 && (
                <div className="relative bg-gradient-to-br from-realpage-blue/40 via-realpage-blue-dark/60 to-realpage-blue/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-realpage-teal/40 hover:border-realpage-teal/60 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,192,0.1),transparent_50%)] rounded-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Current Wheel</h2>
                      <button
                        onClick={handleClearAll}
                        className="px-4 py-2 text-sm font-semibold bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all border-2 border-red-400/50 hover:border-red-400 hover:scale-105 active:scale-95 shadow-lg"
                        title="Clear all"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-realpage-teal/50 scrollbar-track-white/10">
                      {segments.map((segment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/5 backdrop-blur-sm px-4 py-3 rounded-xl border-2 border-white/10 hover:border-realpage-teal/50 transition-all group hover:bg-white/10 hover:shadow-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-semibold text-base block">{segment.name}</span>
                            {segment.description && (
                              <div className="text-white/60 text-sm mt-1 line-clamp-2">{segment.description}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveSegment(index)}
                            className="ml-3 flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-red-500/90 transition-all opacity-100 rounded-lg hover:scale-110 active:scale-95 text-2xl font-bold border-2 border-transparent hover:border-red-400"
                            title="Remove from wheel"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-white/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white/80">Total Questions:</p>
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-realpage-teal/20 to-realpage-teal-dark/30 rounded-xl border-2 border-realpage-teal/40 shadow-lg">
                          <span className="text-2xl font-black text-realpage-teal drop-shadow-lg">{segments.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Repopulate button when history exists but wheel is empty or has items */}
              {history.length > 0 && (
                <div className="relative bg-gradient-to-br from-realpage-teal-dark/40 via-realpage-teal/60 to-realpage-teal-dark/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-realpage-teal-light/40 hover:border-realpage-teal-light/60 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,192,0.1),transparent_50%)] rounded-2xl"></div>
                  
                  <div className="relative text-center">
                    <h3 className="text-xl font-bold text-white mb-3">Repopulate Wheel</h3>
                    <p className="text-white/80 text-sm mb-4">
                      {history.length} question{history.length > 1 ? 's' : ''} in history
                    </p>
                    <button
                      onClick={handleRepopulateWheel}
                      className="w-full px-6 py-3 bg-gradient-to-r from-realpage-teal to-realpage-teal-dark hover:from-realpage-teal-light hover:to-realpage-teal text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-realpage-teal-light/50"
                    >
                      Restore All Questions to Wheel
                    </button>
                    <p className="text-white/60 text-xs mt-3">
                      This will add all asked questions back to the wheel
                    </p>
                  </div>
                </div>
              )}

              <History history={history} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

