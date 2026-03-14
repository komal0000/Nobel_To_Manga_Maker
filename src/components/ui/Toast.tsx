'use client';

import { useMangaStore, Toast as ToastType } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useMangaStore(s => s.removeToast);

  const bgColor = toast.type === 'success' ? 'bg-emerald-600'
    : toast.type === 'error' ? 'bg-red-600'
    : 'bg-blue-600';

  const icon = toast.type === 'success' ? '✓'
    : toast.type === 'error' ? '✕'
    : 'ℹ';

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[280px] cursor-pointer backdrop-blur-sm`}
      onClick={() => removeToast(toast.id)}
    >
      <span className="text-lg font-bold">{icon}</span>
      <span className="text-sm font-medium">{toast.message}</span>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useMangaStore(s => s.ui.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
