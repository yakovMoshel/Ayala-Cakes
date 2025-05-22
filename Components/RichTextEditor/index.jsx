"use client"
import { useState, useEffect } from 'react';

const RichTextEditor = ({ value, onChange }) => {
  const [editorContent, setEditorContent] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setEditorContent(value);
  }, [value]);

  const handleContentChange = (e) => {
    const newValue = e.target.value;
    setEditorContent(newValue);
    onChange({ target: { name: 'content', value: newValue } });
  };

  const formatSelection = (type) => {
    const textarea = document.querySelector('.editor-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    
    let newText;
    switch(type) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'bullet':
        newText = `* ${selectedText}`;
        break;
      case 'header':
        newText = `## ${selectedText}`;
        break;
      default:
        return;
    }

    const newContent = editorContent.substring(0, start) + newText + editorContent.substring(end);
    setEditorContent(newContent);
    onChange({ target: { name: 'content', value: newContent } });
    
    // Reset focus to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const renderPreview = () => {
    const formatContent = (content) => {
      return content
        .split('\n')
        .map(line => {
          // Headers
          if (line.startsWith('##')) {
            const level = line.match(/^#+/)[0].length;
            const text = line.replace(/^#+\s*/, '');
            return `<h${level}>${text}</h${level}>`;
          }
          // Bullets
          if (line.startsWith('*')) {
            const text = line.replace(/^\*\s*/, '');
            return `<li>${text}</li>`;
          }
          // Bold text
          const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          // Regular paragraph
          return `<p>${boldText}</p>`;
        })
        .join('');
    };
    
    return (
      <div 
        className="preview-content" 
        dangerouslySetInnerHTML={{ __html: formatContent(editorContent) }}
        style={{
          minHeight: '300px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '10px',
          textAlign: 'right',
          direction: 'rtl',
          overflowY: 'auto'
        }}
      />
    );
  };

  return (
    <div className="rich-text-editor">
      <div 
        className="editor-toolbar" 
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '10px',
          justifyContent: 'space-between'
        }}
      >
        <div className="format-buttons" style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => formatSelection('bold')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            B
          </button>
          <button 
            type="button" 
            onClick={() => formatSelection('bullet')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            •
          </button>
          <button 
            type="button" 
            onClick={() => formatSelection('header')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            H
          </button>
        </div>
        <button 
          type="button"
          onClick={() => setPreview(!preview)}
          style={{
            padding: '5px 10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            background: preview ? '#eee' : 'white',
            cursor: 'pointer'
          }}
        >
          {preview ? 'ערוך' : 'תצוגה מקדימה'}
        </button>
      </div>
      
      {preview ? renderPreview() : (
        <textarea
          className="editor-textarea"
          value={editorContent}
          onChange={handleContentChange}
          style={{
            width: '100%',
            minHeight: '300px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            resize: 'none',
            textAlign: 'right',
            direction: 'rtl',
            fontFamily: 'inherit'
          }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;