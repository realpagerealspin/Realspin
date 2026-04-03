import { useState } from 'react';
import { List } from 'lucide-react';
import { QuestionsDialog } from './QuestionsDialog';

export function SegmentManager({ onAddSegment, prideMode = false }: { onAddSegment: (segment: any) => void; prideMode?: boolean }) {
  const [open, setOpen] = useState(false);

  // Handler to add question to wheel - include answers
  const handleAddToWheel = (q: { index: number; question: string; answers?: string }) => {
    onAddSegment({ 
      name: String(q.index), 
      description: q.question,
      answers: q.answers || undefined
    });
  };

  return (
    <div className="w-full">
      <button
        className="w-full flex items-center justify-center gap-3 px-6 py-4 theme-btn"
        onClick={() => setOpen(true)}
      >
        <List className="w-6 h-6" />
        <span className="text-lg">Manage Questions</span>
      </button>
      <QuestionsDialog
        open={open}
        onClose={() => setOpen(false)}
        onAddToWheel={handleAddToWheel}
        prideMode={prideMode}
      />
    </div>
  );
}
