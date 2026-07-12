'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { isInternalUrl } from '@/utils/siteLinks';
import styles from './style.module.scss';

// Direct client import (not next/dynamic) so the ReactQuill ref forwards correctly.
let ReactQuill = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  ReactQuill = require('react-quill');
}

const LinkPickerModal = dynamic(() => import('@/Components/LinkPickerModal'), {
  ssr: false,
});

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean'],
];

const FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'image',
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyLinkToEditor(quill, range, { url, linkText, linkType, openInNewTab }) {
  const text = (linkText || '').trim() || url;
  const index = range.index;
  const length = range.length;

  if (linkType === 'external' && openInNewTab) {
    if (length > 0) {
      quill.deleteText(index, length);
    }
    quill.clipboard.dangerouslyPasteHTML(
      index,
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`
    );
    quill.setSelection(index + text.length);
    return;
  }

  if (length === 0) {
    quill.insertText(index, text, { link: url });
    quill.setSelection(index + text.length);
    return;
  }

  quill.formatText(index, length, 'link', url);
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'תוכן הפוסט',
  className = '',
  excludePostId = '',
}) {
  const quillRef = useRef(null);
  const linkHandlerRef = useRef(() => {});
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [linkPickerState, setLinkPickerState] = useState({
    initialUrl: '',
    initialLinkType: 'internal',
    selectedText: '',
    savedRange: null,
  });

  useEffect(() => {
    import('react-quill/dist/quill.snow.css');
    if (!ReactQuill) {
      // eslint-disable-next-line global-require
      ReactQuill = require('react-quill');
    }
    setQuillLoaded(true);
  }, []);

  const openLinkPicker = useCallback(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection(true);
    if (!range) return;

    const formats = quill.getFormat(range);
    const existingUrl = typeof formats.link === 'string' ? formats.link : '';
    const selectedText =
      range.length > 0 ? quill.getText(range.index, range.length).trim() : '';

    setLinkPickerState({
      initialUrl: existingUrl,
      initialLinkType: existingUrl && !isInternalUrl(existingUrl) ? 'external' : 'internal',
      selectedText,
      savedRange: { index: range.index, length: range.length },
    });
    setShowLinkPicker(true);
  }, []);

  linkHandlerRef.current = openLinkPicker;

  const modules = useMemo(
    () => ({
      toolbar: {
        container: TOOLBAR,
        handlers: {
          link: () => linkHandlerRef.current(),
        },
      },
    }),
    []
  );

  const handleLinkConfirm = useCallback(
    (linkData) => {
      const quill = quillRef.current?.getEditor?.();
      const range = linkPickerState.savedRange;
      if (!quill || !range) return;

      applyLinkToEditor(quill, range, linkData);
      onChange(quill.root.innerHTML);
      setShowLinkPicker(false);
    },
    [linkPickerState.savedRange, onChange]
  );

  if (!quillLoaded || !ReactQuill) {
    return <p className={styles.editorLoading}>טוען עורך...</p>;
  }

  return (
    <div className={styles.richTextEditor}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
        className={className}
      />

      {showLinkPicker && (
        <LinkPickerModal
          isOpen={showLinkPicker}
          onClose={() => setShowLinkPicker(false)}
          onConfirm={handleLinkConfirm}
          initialUrl={linkPickerState.initialUrl}
          initialLinkType={linkPickerState.initialLinkType}
          selectedText={linkPickerState.selectedText}
          excludePostId={excludePostId}
        />
      )}
    </div>
  );
}
