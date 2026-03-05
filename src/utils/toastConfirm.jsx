import toast from "react-hot-toast";

export const confirmToast = (message, confirmLabel = "Delete") =>
  new Promise((resolve) => {
    const id = toast((t) => (
      <div className="max-w-sm space-y-3">
        <p className="text-sm font-semibold text-slate-800">{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ), { duration: Infinity });

    const originalDismiss = toast.dismiss;
    const cleanup = () => {
      originalDismiss(id);
      resolve(false);
    };
    setTimeout(cleanup, 20000);
  });
