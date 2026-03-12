import { Clock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Topic {
  name: string;
  description: string;
}

interface HistoryProps {
  history: Topic[];
  prideMode?: boolean;
}

export function History({ history, prideMode = false }: HistoryProps) {
  if (history.length === 0) return null;

  return (
    <div
      className="relative backdrop-blur-xl rounded-2xl p-6 shadow-2xl transition-all"
      style={{
        background: prideMode
          ? 'linear-gradient(135deg, rgba(26,5,51,0.7), rgba(13,26,58,0.8), rgba(18,0,58,0.7))'
          : 'linear-gradient(135deg, rgba(0,32,91,0.4), rgba(12,35,64,0.6), rgba(0,32,91,0.4))',
        border: prideMode
          ? '2px solid rgba(255,107,203,0.45)'
          : '2px solid rgba(93,190,170,0.4)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(125,211,192,0.1),transparent_50%)] rounded-2xl"></div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-realpage-teal/20 rounded-lg">
            <Clock className="w-6 h-6 text-realpage-teal" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recent Winners</h2>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {history.map((item, index) => (
              <motion.div
                key={`${item.name}-${index}`}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05, type: "spring" }}
                className="group"
              >
                <div className={`relative bg-white/5 backdrop-blur-sm px-4 py-4 rounded-xl border-2 ${index === 0 ? 'border-realpage-teal/50' : 'border-white/10'} hover:border-realpage-teal/50 transition-all hover:bg-white/10 hover:shadow-lg ${index === 0 ? 'shadow-lg shadow-realpage-teal/20' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <Trophy
                          className="w-6 h-6 animate-pulse drop-shadow-lg"
                          style={{ color: prideMode ? '#FFED00' : '#5DBEAA' }}
                        />
                      )}
                      <span
                        className={`font-semibold text-base`}
                        style={{ color: index === 0 ? (prideMode ? '#FFED00' : '#5DBEAA') : '#fff' }}
                      >{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg`}
                        style={index === 0 ? {
                          background: prideMode ? 'rgba(228,3,3,0.2)' : 'rgba(93,190,170,0.2)',
                          color: prideMode ? '#FFED00' : '#5DBEAA',
                          border: prideMode ? '1px solid rgba(255,237,0,0.3)' : '1px solid rgba(93,190,170,0.3)',
                        } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        #{history.length - index}
                      </span>
                    </div>
                  </div>
                  {item.description && (
                    <div className="mt-2 text-white/70 text-sm font-medium">{item.description}</div>
                  )}
                  {index === 0 && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-realpage-teal/15 to-transparent opacity-50"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-white/30">
          <p className="text-sm text-white/70 text-center font-semibold">
            Showing last {history.length} {history.length === 1 ? 'spin' : 'spins'}
          </p>
        </div>
      </div>
    </div>
  );
}
