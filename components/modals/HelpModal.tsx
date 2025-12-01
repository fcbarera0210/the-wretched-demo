'use client';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>PROTOCOLO DE SUPERVIVENCIA</h2>
        <p>
          <strong>OBJETIVO:</strong> Sobrevivir hasta que la Baliza de Socorro atraiga rescate, o morir intentándolo.
        </p>

        <h3>MECÁNICAS</h3>
        <ul>
          <li>
            <strong>EL DADO DE DÍA:</strong> Cada día lanzas 1d6. Ese número indica cuántas cartas (eventos) debes
            resolver.
          </li>
          <li>
            <strong>LA TORRE (TENSIÓN):</strong> Representa la integridad de la nave y tu mente.
            <ul>
              <li>Empieza en nivel 1.</li>
              <li>Si un evento pide "PRUEBA DE TORRE", el sistema lanzará 1d6.</li>
              <li>
                Si el resultado es <strong>menor o igual</strong> a tu nivel de Tensión actual, la Torre Cae (FIN DEL
                JUEGO).
              </li>
              <li>Si sacas más que la Tensión, sobrevives y la Tensión sube +1.</li>
            </ul>
          </li>
          <li>
            <strong>LOS REYES (LA CRIATURA):</strong> Si robas 4 Reyes, la Criatura te encuentra. FIN DEL JUEGO.
          </li>
          <li>
            <strong>LA BALIZA (AS DE CORAZONES):</strong> Debes encontrar esta carta para empezar a pedir ayuda.
          </li>
        </ul>
        <p>
          <em>Juego basado en "The Wretched" de Chris Bissette.</em>
        </p>
      </div>
    </div>
  );
}

