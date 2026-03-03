import { X } from "lucide-react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
}: ModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>{title}</h2>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`btn-modal-confirm btn-modal-${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
