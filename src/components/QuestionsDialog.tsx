import { useEffect, useState } from 'react';
import { PlusCircle, List } from 'lucide-react';

interface Question {
  index: number;
  question: string;
  answers: string;
}

interface QuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  onAddToWheel?: (question: Question) => void;
  prideMode?: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export function QuestionsDialog({ open, onClose, onAddToWheel, prideMode = false }: QuestionsDialogProps) {
  // ── Supabase table selection ──────────────────────────────────
  // Career Elevate → 'questions'  |  Pride mode → 'pride_questions'
  const TABLE = prideMode ? 'pride_questions' : 'questions';
  // ─────────────────────────────────────────────────────────────

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add/edit form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newIndex, setNewIndex] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Fetch questions from the correct table
  const fetchQuestions = () => {
    setLoading(true);
    setError(null);
    fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Re-fetch whenever the dialog opens OR the mode changes
  useEffect(() => {
    if (!open) return;
    fetchQuestions();
  }, [open, TABLE]);

  // Add question (POST)
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newIndex.trim()) return;
    const indexNum = parseInt(newIndex);
    if (isNaN(indexNum) || indexNum < 1) {
      setError('Please enter a valid index number');
      return;
    }
    if (questions.some(q => q.index === indexNum)) {
      setError(`Index #${indexNum} already exists!`);
      return;
    }
    setLoading(true);
    setError(null);
    await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify([{ index: indexNum, question: newQuestion, answers: newAnswer }]),
    });
    setNewQuestion('');
    setNewAnswer('');
    setNewIndex('');
    fetchQuestions();
  };

  // Edit question (PATCH)
  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex === null || !editValue.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?index=eq.${editIndex}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          question: editValue,
          answers: editAnswer || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update question');
      setEditIndex(null);
      setEditValue('');
      setEditAnswer('');
      fetchQuestions();
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question');
      setLoading(false);
    }
  };

  // Delete question (DELETE)
  const handleDeleteQuestion = async (index: number) => {
    setLoading(true);
    setError(null);
    await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?index=eq.${index}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    fetchQuestions();
  };

  const handleAddToWheel = (q: Question) => {
    if (onAddToWheel) {
      onAddToWheel(q);
    }
  };

  const handleEditClick = (q: Question) => {
    setEditIndex(q.index);
    setEditValue(q.question);
    setEditAnswer(q.answers || '');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="theme-panel p-8 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white/95 flex items-center gap-2">
            <List className="w-6 h-6 text-white/95" />
            Questions Manager
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center theme-btn theme-btn-danger rounded-full text-white font-bold text-2xl transition-all hover:scale-110 active:scale-95"
            title="Close"
            type="button"
          >
            ×
          </button>
        </div>
        {/* Add new question */}
        <form onSubmit={handleAddQuestion} className="mb-6 space-y-3">
          <div className="flex gap-3">
            <input
              type="number"
              value={newIndex}
              onChange={e => setNewIndex(e.target.value)}
              placeholder="Index #"
              className="w-24 theme-input font-bold"
              min="1"
              required
            />
            <input
              type="text"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="Type a new question..."
              className="flex-1 theme-input font-medium"
              maxLength={200}
              required
            />
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              placeholder="Type the answer (optional)..."
              className="flex-1 theme-input font-medium"
              maxLength={500}
            />
            <button
              type="submit"
              className="theme-btn px-6 py-3 rounded-xl font-bold"
              disabled={loading || !newQuestion.trim() || !newIndex.trim()}
            >
              Add
            </button>
          </div>
        </form>
        
        {loading ? (
          <div className="text-center text-white/70 py-8 font-semibold">Loading...</div>
        ) : error ? (
          <div className="text-center text-white py-8 font-semibold" style={{ color: prideMode ? '#FFED00' : '#FF6B00' }}>
            Error: {error}
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {questions.length === 0 ? (
              <div className="text-center text-white/60 py-12 font-semibold text-lg">No questions found. Add your first question above!</div>
            ) : (
              questions.map((q) =>
                editIndex === q.index ? (
                  <form
                    key={q.index}
                    onSubmit={handleEditQuestion}
                    className="p-4 rounded-xl border-2 shadow-md"
                    style={{
                      background: 'var(--edit-card-bg)',
                      borderColor: 'var(--edit-card-border)',
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white/95 text-lg">#{q.index}</span>
                        <span className="text-white/70 text-sm font-semibold">Editing...</span>
                      </div>
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="flex-1 theme-input font-medium"
                        maxLength={200}
                        placeholder="Edit question"
                        autoFocus
                      />
                      <textarea
                        value={editAnswer}
                        onChange={e => setEditAnswer(e.target.value)}
                        className="flex-1 theme-input font-medium resize-none"
                        maxLength={500}
                        rows={3}
                        placeholder="Edit answer (optional)"
                      />
                      <div className="flex gap-2 justify-end">
                        <button type="submit" className="theme-btn theme-btn-success px-4 py-2 rounded-lg font-bold shadow-md">Save</button>
                        <button
                          type="button"
                          className="theme-btn theme-btn-neutral px-4 py-2 rounded-lg font-bold shadow-md"
                          onClick={() => { setEditIndex(null); setEditValue(''); setEditAnswer(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div
                    key={q.index}
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderColor: prideMode ? 'rgba(255,107,203,0.35)' : 'rgba(93,190,170,0.25)',
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white/95 text-lg">#{q.index}</div>
                      <div className="text-white/80 font-medium mt-1">Q: {q.question}</div>
                      {q.answers && (
                        <div
                          className="mt-2 p-2 rounded border font-medium"
                          style={{
                            background: prideMode ? 'rgba(255,237,0,0.10)' : 'rgba(125,211,192,0.12)',
                            borderColor: prideMode ? 'rgba(255,140,0,0.35)' : 'rgba(125,211,192,0.25)',
                            color: prideMode ? '#FFED00' : '#7DD3C0',
                          }}
                        >
                          <span className="font-bold">A:</span> {q.answers}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="theme-btn px-3 py-1 rounded-lg font-bold text-sm"
                        onClick={() => handleEditClick(q)}
                        title="Edit question"
                      >
                        Edit
                      </button>
                      <button
                        className="theme-btn theme-btn-danger px-3 py-1 rounded-lg font-bold text-sm"
                        onClick={() => handleDeleteQuestion(q.index)}
                        title="Delete question"
                      >
                        Delete
                      </button>
                      <button
                        className="theme-btn px-3 py-1 rounded-lg font-bold flex items-center justify-center gap-1 text-sm"
                        title="Add to Wheel"
                        onClick={() => handleAddToWheel(q)}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}