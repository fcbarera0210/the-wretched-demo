'use client';

import { useGameStore } from '@/stores/gameStore';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { history } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>REGISTRO DEL SISTEMA (LOG)</h2>
        <ul className="history-list">
          {[...history].reverse().map((item, index) => (
            <li key={index} className="history-item">
              <strong>
                DÍA {item.day} [{item.card}]:
              </strong>{' '}
              {item.text.substring(0, 100)}...
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

