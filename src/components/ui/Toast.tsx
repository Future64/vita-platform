"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  createdAt: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

// --- Context ---

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Config ---

const TOAST_CONFIG: Record<
  ToastType,
  { icon: typeof CheckCircle2; color: string; borderColor: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    borderColor: "border-green-500/30",
  },
  error: {
    icon: XCircle,
    color: "text-red-500",
    borderColor: "border-red-500/30",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    borderColor: "border-blue-500/30",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-orange-500",
    borderColor: "border-orange-500/30",
  },
};

const PROGRESS_COLORS: Record<ToastType, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-orange-500",
};

// --- Single Toast Component ---

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  function startDismiss() {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }

  useEffect(() => {
    // Progress bar
    const step = 50; // ms
    const totalSteps = toast.duration / step;
    let current = totalSteps;

    intervalRef.current = setInterval(() => {
      current--;
      setProgress((current / totalSteps) * 100);
      if (current <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, step);

    // Auto dismiss
    timerRef.current = setTimeout(startDismiss, toast.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.id]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg transition-all duration-300",
        config.borderColor,
        exiting
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
      )}
      style={{
        backgroundColor: "var(--bg-card)",
        animation: exiting ? undefined : "slideInRight 0.3s ease-out",
      }}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.color)} />
      <p className="flex-1 text-sm text-[var(--text-primary)]">
        {toast.message}
      </p>
      <button
        onClick={startDismiss}
        className="shrink-0 rounded-md p-0.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        aria-label="Fermer la notification"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--bg-elevated)]">
        <div
          className={cn("h-full transition-[width] duration-50", PROGRESS_COLORS[toast.type])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// --- Provider ---

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      setToasts((prev) => {
        // Max 3 visible
        const next = [...prev, { id, type, message, duration, createdAt: Date.now() }];
        return next.slice(-3);
      });
    },
    []
  );

  const toast = {
    success: (message: string, duration?: number) =>
      addToast("success", message, duration),
    error: (message: string, duration?: number) =>
      addToast("error", message, duration),
    info: (message: string, duration?: number) =>
      addToast("info", message, duration),
    warning: (message: string, duration?: number) =>
      addToast("warning", message, duration),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- Hook ---

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
