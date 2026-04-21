import { createRoot } from 'react-dom/client';
import { HelpCircle } from 'lucide-react';

export const confirmToast = (message, confirmLabel = "Confirm") => {
  return new Promise((resolve) => {
    let container = document.getElementById('dl-confirm-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dl-confirm-modal-root';
      document.body.appendChild(container);
    }

    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const Modal = () => (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 uppercase">
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200 m-4 border border-slate-100">
          <div className="p-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-6 mx-auto">
              <HelpCircle className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-black text-center text-slate-900 mb-2 tracking-tight">Are you sure?</h3>
            <p className="text-xs text-center text-slate-500 mb-8 font-bold leading-relaxed px-4">
              {message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-2xl text-[10px] font-black bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest"
                autoFocus
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 rounded-2xl text-[10px] font-black bg-slate-900 text-white hover:bg-black transition-all shadow-lg shadow-slate-200 uppercase tracking-widest"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    root.render(<Modal />);
  });
};
