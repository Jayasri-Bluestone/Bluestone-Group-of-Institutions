import { createRoot } from 'react-dom/client';
import { AlertCircle } from 'lucide-react';

export const confirmToast = (message, confirmLabel = "Delete") => {
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200 m-4">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-center text-slate-500 mb-6">
              {message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                autoFocus
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
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
