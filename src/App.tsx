import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { SpinWheel } from './components/SpinWheel';
import { SegmentManager } from './components/SegmentManager';
import { History } from './components/History';
import { Trophy } from 'lucide-react';

interface Topic {
  name: string;
  description: string;
  answers?: string;
}

/** Add your Pride-mode logo to `public/` with this exact filename (same position/size as Career Elevate). */
const PRIDE_RIGHT_LOGO_SRC = '/realpride_white.png';

function Logos({
  fullscreen = false,
  prideMode = false,
  onToggle,
}: {
  fullscreen?: boolean;
  prideMode?: boolean;
  onToggle?: () => void;
}) {
  const rightLogoSrc = prideMode ? PRIDE_RIGHT_LOGO_SRC : '/CareerElevate.png';
  const rightLogoAlt = prideMode
    ? 'Switch to Career Elevate mode'
    : 'Switch to Pride mode';

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
      {/* Right logo doubles as the mode toggle */}
      <img
        src={rightLogoSrc}
        alt={rightLogoAlt}
        title={prideMode ? 'Click to switch to Career Elevate mode' : 'Click to switch to Pride mode'}
        onClick={onToggle}
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
          cursor: onToggle ? 'pointer' : 'default',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
          transition: 'transform 0.2s ease, filter 0.2s ease',
        }}
        onMouseEnter={e => {
          if (onToggle) {
            (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)';
            (e.currentTarget as HTMLImageElement).style.filter =
              'drop-shadow(0 6px 18px rgba(0,0,0,0.45))';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLImageElement).style.filter =
            'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))';
        }}
      />
    </>
  );
}

function App() {
  // ── Read initial mode first so we can load the right localStorage keys ──
  const initialPrideMode = localStorage.getItem('prideMode') === 'true';

  // Each mode has its own isolated wheel state in localStorage:
  //   Career Elevate → keys ending in '_career'
  //   Pride mode     → keys ending in '_pride'

  const [segments, setSegments] = useState<Topic[]>(() => {
    const key = initialPrideMode ? 'wheelSegments_pride' : 'wheelSegments_career';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [removedTopics, setRemovedTopics] = useState<string[]>(() => {
    const key = initialPrideMode ? 'removedTopics_pride' : 'removedTopics_career';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<Topic[]>(() => {
    const key = initialPrideMode ? 'wheelHistory_pride' : 'wheelHistory_career';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  // ── Pride Mode ──────────────────────────────────────────────
  const [prideMode, setPrideMode] = useState<boolean>(initialPrideMode);

  // Refs so togglePrideMode always reads current values without stale closures
  const prideModeRef = useRef(prideMode);
  prideModeRef.current = prideMode;
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const historyRef = useRef(history);
  historyRef.current = history;
  const removedTopicsRef = useRef(removedTopics);
  removedTopicsRef.current = removedTopics;

  const togglePrideMode = useCallback(() => {
    const prev = prideModeRef.current;
    const next = !prev;
    const prevSuffix = prev ? 'pride' : 'career';
    const nextSuffix = next ? 'pride' : 'career';

    if (next) {
      // Fire rainbow confetti burst when switching to Pride
      const rainbow = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'];
      confetti({ particleCount: 160, spread: 120, origin: { y: 0.5 }, colors: rainbow, scalar: 1.3 });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 80, origin: { x: 0, y: 0.5 }, colors: rainbow });
        confetti({ particleCount: 80, angle: 120, spread: 80, origin: { x: 1, y: 0.5 }, colors: rainbow });
      }, 300);
    }

    // Snapshot the current mode's live state into localStorage before switching
    localStorage.setItem(`wheelSegments_${prevSuffix}`,  JSON.stringify(segmentsRef.current));
    localStorage.setItem(`wheelHistory_${prevSuffix}`,   JSON.stringify(historyRef.current));
    localStorage.setItem(`removedTopics_${prevSuffix}`,  JSON.stringify(removedTopicsRef.current));

    // Load the other mode's persisted state (or empty arrays on first visit)
    const newSegments = JSON.parse(localStorage.getItem(`wheelSegments_${nextSuffix}`)  || '[]');
    const newHistory  = JSON.parse(localStorage.getItem(`wheelHistory_${nextSuffix}`)   || '[]');
    const newRemoved  = JSON.parse(localStorage.getItem(`removedTopics_${nextSuffix}`)  || '[]');

    // React 18 batches all four updates into one re-render
    setPrideMode(next);
    setSegments(newSegments);
    setHistory(newHistory);
    setRemovedTopics(newRemoved);
  }, []);
  // ────────────────────────────────────────────────────────────

  // Persist to mode-specific keys whenever state or mode changes
  useEffect(() => {
    localStorage.setItem(prideMode ? 'wheelSegments_pride' : 'wheelSegments_career', JSON.stringify(segments));
  }, [segments, prideMode]);

  useEffect(() => {
    localStorage.setItem(prideMode ? 'wheelHistory_pride' : 'wheelHistory_career', JSON.stringify(history));
  }, [history, prideMode]);

  useEffect(() => {
    localStorage.setItem(prideMode ? 'removedTopics_pride' : 'removedTopics_career', JSON.stringify(removedTopics));
  }, [removedTopics, prideMode]);

  useEffect(() => {
    localStorage.setItem('prideMode', String(prideMode));
  }, [prideMode]);

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

  return (
    <div
      className={`min-h-screen text-white overflow-x-hidden transition-all duration-700 app-shell ${prideMode ? 'pride-theme' : ''}`}
    >
      {/* ── Animated background blobs ── */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        {prideMode ? (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: '#E40303', animation: 'float-shape 4s ease-in-out infinite', opacity: 0.7 }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: '#004DFF', animation: 'float-shape 5s ease-in-out infinite 1s', opacity: 0.7 }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{ background: '#FFED00', animation: 'float-shape 6s ease-in-out infinite 2s', opacity: 0.5 }} />
            <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: '#008026', animation: 'float-shape 4.5s ease-in-out infinite 0.5s', opacity: 0.6 }} />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: '#750787', animation: 'float-shape 5.5s ease-in-out infinite 1.5s', opacity: 0.6 }} />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-realpage-teal rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-realpage-teal-light rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-realpage-teal-dark/30 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative z-10">
        {/* ── Header ── */}
        <header
          className="relative py-8 px-4 shadow-2xl app-header"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          <div className="container mx-auto relative">
            <Logos prideMode={prideMode} onToggle={togglePrideMode} />

            {/* Title and subtitle: Pride mode vs Normal mode */}
            {prideMode ? (
              <>
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                  <div className="animate-float hidden sm:block">
                    <Trophy
                      className="w-8 h-8 md:w-12 md:h-12 drop-shadow-2xl filter brightness-110"
                      style={{ color: '#FFED00' }}
                    />
                  </div>
                  <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                      <span
                        className="pride-rainbow-text"
                        style={{
                          background: 'linear-gradient(90deg, #E40303, #FF8C00, #FFED00, #008026, #004DFF, #750787)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          filter: 'drop-shadow(0 2px 8px rgba(228,3,3,0.4))',
                        }}
                      >
                        Quiz Trivia
                      </span>
                    </h1>
                  </div>
                  <div className="animate-float hidden sm:block" style={{ animationDelay: '0.5s' }}>
                    <Trophy
                      className="w-8 h-8 md:w-12 md:h-12 drop-shadow-2xl filter brightness-110 transform scale-x-[-1]"
                      style={{ color: '#FFED00' }}
                    />
                  </div>
                </div>
                {/* Pride mode: no subtitle pill */}
                <div className="text-center space-y-2">
                  {/* Empty for pride mode */}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                  <div className="animate-float hidden sm:block">
                    <Trophy
                      className="w-8 h-8 md:w-12 md:h-12 drop-shadow-2xl filter brightness-110"
                      style={{ color: '#5DBEAA' }}
                    />
                  </div>
                  <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                      <span
                        className="text-realpage-teal drop-shadow-2xl"
                      >
                        Do You REAL-LY Know?
                      </span>
                    </h1>
                  </div>
                  <div className="animate-float hidden sm:block" style={{ animationDelay: '0.5s' }}>
                    <Trophy
                      className="w-8 h-8 md:w-12 md:h-12 drop-shadow-2xl filter brightness-110 transform scale-x-[-1]"
                      style={{ color: '#5DBEAA' }}
                    />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div
                    className="inline-flex items-center gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full backdrop-blur-sm shadow-lg theme-pill theme-pill-accent"
                  >
                    <div
                      className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full animate-pulse shadow-lg"
                      style={{ background: '#5DBEAA' }}
                    />
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-white/95 tracking-wide">
                      Career Elevate
                    </p>
                    <div
                      className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full animate-pulse shadow-lg"
                      style={{ background: '#5DBEAA' }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start max-w-7xl mx-auto">
            <div className="lg:col-span-2 flex justify-center items-center min-h-[500px]">
              <SpinWheel
                segments={segments}
                onSpinComplete={handleSpinComplete}
                LogosComponent={(props: any) => <Logos {...props} prideMode={prideMode} onToggle={togglePrideMode} />}
                onRepopulateWheel={handleRepopulateWheel}
                historyCount={history.length}
                prideMode={prideMode}
              />
            </div>

            <div className="space-y-6 w-full">
              <SegmentManager
                onAddSegment={handleAddSegment}
                prideMode={prideMode}
              />

              {/* Display current wheel segments with remove option */}
              {segments.length > 0 && (
                <div
                  className="theme-panel p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Current Wheel</h2>
                      <button
                        onClick={handleClearAll}
                        className="theme-btn theme-btn-danger px-4 py-2 text-sm font-semibold"
                        title="Clear all"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                      {segments.map((segment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/5 backdrop-blur-sm px-4 py-3 rounded-xl border-2 border-white/10 hover:border-white/25 transition-all group hover:bg-white/10 hover:shadow-lg"
                          style={prideMode ? { borderColor: 'rgba(255,107,203,0.25)' } : {}}
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
                        <div
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 shadow-lg"
                          style={{
                            background: prideMode
                              ? 'linear-gradient(135deg, rgba(228,3,3,0.2), rgba(117,7,135,0.3))'
                              : 'linear-gradient(135deg, rgba(93,190,170,0.2), rgba(61,154,136,0.3))',
                            borderColor: prideMode ? 'rgba(255,107,203,0.4)' : 'rgba(93,190,170,0.4)',
                            transition: 'all 0.6s ease',
                          }}
                        >
                          <span
                            className="text-2xl font-black drop-shadow-lg"
                            style={{ color: prideMode ? '#ffb3e6' : '#7DD3C0' }}
                          >
                            {segments.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Repopulate button when history exists */}
              {history.length > 0 && (
                <div
                  className="theme-panel p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                  <div className="relative text-center">
                    <h3 className="text-xl font-bold text-white mb-3">Repopulate Wheel</h3>
                    <p className="text-white/80 text-sm mb-4">
                      {history.length} question{history.length > 1 ? 's' : ''} in history
                    </p>
                    <button
                      onClick={handleRepopulateWheel}
                      className="theme-btn w-full px-6 py-3 font-bold shadow-lg"
                    >
                      Restore All Questions to Wheel
                    </button>
                    <p className="text-white/60 text-xs mt-3">
                      This will add all asked questions back to the wheel
                    </p>
                  </div>
                </div>
              )}

              <History history={history} prideMode={prideMode} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
