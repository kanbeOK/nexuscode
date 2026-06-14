'use client';

import { useEffect, useRef } from 'react';

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  opacity: number;
  fontSize: number;
}

const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF{}[]<>/\\|=+-*&^%$#@!~';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<MatrixColumn[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initColumns();
    };

    const initColumns = () => {
      const fontSize = 14;
      const colCount = Math.floor(canvas.width / fontSize);
      columnsRef.current = Array.from({ length: colCount }, (_, i) => ({
        x: i * fontSize,
        y: Math.random() * canvas.height * -1,
        speed: 0.5 + Math.random() * 2,
        chars: Array.from({ length: 20 + Math.floor(Math.random() * 20) }, () =>
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        ),
        opacity: 0.03 + Math.random() * 0.08,
        fontSize,
      }));
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(6, 8, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      columnsRef.current.forEach((col) => {
        col.chars.forEach((char, j) => {
          const y = col.y + j * col.fontSize;
          if (y < 0 || y > canvas.height) return;

          const isHead = j === col.chars.length - 1;
          const fadeFactor = j / col.chars.length;

          if (isHead) {
            ctx.fillStyle = `rgba(0, 229, 255, ${col.opacity * 3})`;
            ctx.font = `bold ${col.fontSize}px "JetBrains Mono", monospace`;
          } else {
            const g = Math.floor(229 * fadeFactor);
            const b = Math.floor(255 * fadeFactor);
            ctx.fillStyle = `rgba(0, ${g}, ${b}, ${col.opacity * fadeFactor * 2})`;
            ctx.font = `${col.fontSize}px "JetBrains Mono", monospace`;
          }

          ctx.fillText(char, col.x, y);

          if (Math.random() < 0.02) {
            col.chars[j] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          }
        });

        col.y += col.speed;

        if (col.y > canvas.height + col.chars.length * col.fontSize) {
          col.y = Math.random() * -200;
          col.speed = 0.5 + Math.random() * 2;
          col.opacity = 0.03 + Math.random() * 0.08;
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.4 }}
    />
  );
}
