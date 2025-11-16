import { useEffect, useRef, useState } from "react";
import { santosData } from "../constants/santos_data";
import confetti from "canvas-confetti";

export default function Sorteador() {
  const [rollingIndex, setRollingIndex] = useState<number | null>(null);
  const [finalIndex, setFinalIndex] = useState<number | null>(null);
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  const [isRolling, setIsRolling] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const getRandomIndex = () => {
    return Math.floor(Math.random() * santosData.length);
  };

  const startRoll = () => {
    if (isRolling) return;

    setIsRolling(true);
    setRollingIndex(null);
    setFinalIndex(null);
    setVisibleIndex(null);

    let count = 0;

    intervalRef.current = window.setInterval(() => {
      const nextIndex = getRandomIndex();
      setRollingIndex(nextIndex);

      count++;

      if (count >= 10) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        setFinalIndex(nextIndex);
        setIsRolling(false);
      }
    }, 300);
  };

  // limpa interval ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // antes de usar no useEffect, precisa ser declarado
  const displayIndex =
    finalIndex !== null
      ? finalIndex
      : rollingIndex !== null
      ? rollingIndex
      : null;

  const display = displayIndex !== null ? santosData[displayIndex] : null;

  const isFinalVisible = finalIndex !== null && visibleIndex === finalIndex;

  // dispara confetti quando a imagem final aparece na tela
  useEffect(() => {
    if (isFinalVisible) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isFinalVisible]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-6 gap-6">
      <style>
        {`
          .final-zoom {
            animation: zoomFade 0.6s ease-out forwards;
          }
          @keyframes zoomFade {
            0%   { transform: scale(0.85); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <div className="text-center">
        <div className="mt-4 flex flex-col items-center">
          {display ? (
            <>
              <img
                key={display.url_image}
                src={display.url_image}
                alt={display.name}
                onLoad={() => setVisibleIndex(displayIndex)}
                className={`
                  w-64 h-96 object-cover rounded-xl shadow mb-3 transition-all
                  ${isFinalVisible ? "final-zoom" : ""}
                `}
              />

              {visibleIndex !== null && (
                <div
                  className={`
                    text-xl font-semibold transition-opacity
                    ${isFinalVisible ? "opacity-100" : "opacity-90"}
                  `}
                >
                  {santosData[visibleIndex].name}
                </div>
              )}
            </>
          ) : (
            <div>
              <img
                src={santosData[0].url_image}
                alt={santosData[0].name}
                className={`
                  w-64 h-96 object-cover rounded-xl shadow mb-3 transition-all
                `}
              />
              <p className="text-gray-500 text-sm">Clique em "Sortear"</p>
            </div>
          )}
        </div>

        <button
          onClick={startRoll}
          disabled={isRolling}
          className="mt-4 px-6 py-3 rounded-xl w-64 shadow font-semibold bg-purple-600 text-white disabled:opacity-50"
        >
          {isRolling ? "Sorteando..." : "Sortear"}
        </button>
      </div>
    </div>
  );
}
