'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  addKeywordToList,
  normalizeKeywordsList,
  removeKeywordFromList,
} from '@/utils/keywords';
import styles from './style.module.scss';

export default function KeywordTagsInput({
  id,
  value,
  onChange,
  placeholder = 'הקלידי מילת מפתח ולחצי פסיק או Enter',
  disabled = false,
}) {
  const keywords = normalizeKeywordsList(value);
  const [inputValue, setInputValue] = useState('');

  const commitInput = (rawValue) => {
    const next = addKeywordToList(keywords, rawValue);
    if (next.length !== keywords.length) {
      onChange(next);
    }
    setInputValue('');
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;

    if (nextValue.includes(',')) {
      const parts = nextValue.split(',');
      let updated = keywords;

      parts.forEach((part, index) => {
        if (index < parts.length - 1) {
          updated = addKeywordToList(updated, part);
        } else {
          setInputValue(part);
        }
      });

      if (updated !== keywords) {
        onChange(updated);
      }
      return;
    }

    setInputValue(nextValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitInput(inputValue);
      return;
    }

    if (event.key === 'Backspace' && !inputValue && keywords.length > 0) {
      onChange(removeKeywordFromList(keywords, keywords.length - 1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      commitInput(inputValue);
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text');
    if (!pasted.includes(',')) return;

    event.preventDefault();
    let updated = keywords;
    pasted.split(',').forEach((part) => {
      updated = addKeywordToList(updated, part);
    });
    onChange(updated);
    setInputValue('');
  };

  return (
    <div className={styles.keywordTagsInput}>
      <div className={styles.tagsField}>
        {keywords.map((keyword, index) => (
          <span key={`${keyword}-${index}`} className={styles.tag}>
            <span className={styles.tagText}>{keyword}</span>
            <button
              type="button"
              className={styles.tagRemove}
              onClick={() => onChange(removeKeywordFromList(keywords, index))}
              disabled={disabled}
              aria-label={`הסרת ${keyword}`}
            >
              <X size={14} aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={keywords.length === 0 ? placeholder : 'הוסיפי עוד...'}
          className={styles.tagInput}
          disabled={disabled}
        />
      </div>
      <p className={styles.hint}>כל פסיק או Enter מוסיפים מילת מפתח חדשה</p>
    </div>
  );
}
