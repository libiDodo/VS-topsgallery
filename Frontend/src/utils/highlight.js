                                        /* Выделение текста цветом */
// src/utils/highlight.js

import React from 'react';

/* Экранирование спецсимволов для RegExp */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Компонент, который подсвечивает вхождения highlight в тексте
export const HighlightText = ({ text, highlight }) => {
  if (!text || !highlight) return <>{text}</>;

  const str = String(text);
  const escaped = escapeRegExp(highlight);
  // Разбиваем строку, сохраняя разделители (сам запрос)
  const parts = str.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase()
          ? <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span>
          : part
      )}
    </>
  );
};