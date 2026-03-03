import { createContext, useContext } from "react";
import type { ToastContextType } from "../types/toast";
import "./Toast.css";

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined,
);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
};
