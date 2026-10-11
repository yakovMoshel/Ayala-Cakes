'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { isInternalUrl } from '@/utils/siteLinks';
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinaryUrl';
import { extractPublicIdFromCloudinaryUrl } from '@/utils/cloudinaryPublicId';
import {
  buildBlogImageHtml,
  isBlogImageCaptionParagraph,
  isBlogImageParagraph,
  parseBlogImageCaption,
  replaceBlogImageBlock,
} from '@/utils/blogImageHtml';
import { uploadImageFile } from '@/utils/uploadImageFile';
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

const MediaPickerModal = dynamic(() => import('@/Components/MediaPickerModal'), {
  ssr: false,
});

const ImageDetailsModal = dynamic(() => import('@/Components/ImageDetailsModal'), {
  ssr: false,
});

const TOOLBAR = [
  [{ header: [2, 3, false] }],
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

function extractDataUrls(html) {
  const urls = [];
  let from = 0;
  while (from < html.length) {
    const start = html.indexOf('data:image/', from);
    if (start === -1) break;
    const quote = html[start - 1];
    if (quote === '"' || quote === "'") {
      const end = html.indexOf(quote, start);
      if (end === -1) break;
      urls.push(html.slice(start, end));
      from = end + 1;
      continue;
    }
    from = start + 'data:image/'.length;
  }
  return [...new Set(urls)];
}

function dataUrlToFile(dataUrl, index) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
  if (!match) return null;
  const mime = match[1];
  const binary = atob(match[2].replace(/\s/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const ext = mime.split('/')[1]?.replace('+xml', '') || 'png';
  return new File([bytes], `pasted-image-${index + 1}.${ext}`, { type: mime });
}

function imageFilesFromList(files) {
  return [...(files || [])].filter((file) => file && file.type.startsWith('image/'));
}

function hostedImageHtml(secureUrl) {
  return buildBlogImageHtml({
    url: getOptimizedCloudinaryUrl(secureUrl, 800),
  });
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
  const imageHandlerRef = useRef(() => {});
  const imagePickerRangeRef = useRef(null);
  const editingImageRef = useRef(null);
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageDetails, setShowImageDetails] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [linkPickerState, setLinkPickerState] = useState({
    initialUrl: '',
    initialLinkType: 'internal',
    selectedText: '',
    savedRange: null,
  });
  const [imageMessage, setImageMessage] = useState('');
  const [imageMessageIsError, setImageMessageIsError] = useState(false);
  const onChangeRef = useRef(onChange);
  const uploadingImagesRef = useRef(false);
  const messageTimerRef = useRef(null);

  onChangeRef.current = onChange;

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

  const openImagePicker = useCallback(() => {
    const quill = quillRef.current?.getEditor?.();
    if (quill) {
      const range = quill.getSelection(true);
      imagePickerRangeRef.current = range
        ? { index: range.index, length: range.length }
        : { index: quill.getLength(), length: 0 };
    } else {
      imagePickerRangeRef.current = { index: 0, length: 0 };
    }
    setShowImagePicker(true);
  }, []);

  const closeMediaPicker = useCallback(() => {
    setShowImagePicker(false);
  }, []);

  linkHandlerRef.current = openLinkPicker;
  imageHandlerRef.current = openImagePicker;

  const modules = useMemo(
    () => ({
      toolbar: {
        container: TOOLBAR,
        handlers: {
          link: () => linkHandlerRef.current(),
          image: () => imageHandlerRef.current(),
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

  const handleMediaSelect = useCallback((selected) => {
    const image = Array.isArray(selected) ? selected[0] : null;
    if (!image?.secure_url) return;
    editingImageRef.current = null;
    setPendingImage(image);
    setShowImagePicker(false);
    setShowImageDetails(true);
  }, []);

  const closeImageFlow = useCallback(() => {
    setShowImageDetails(false);
    setShowImagePicker(false);
    setPendingImage(null);
    imagePickerRangeRef.current = null;
    editingImageRef.current = null;
  }, []);

  const openEmbeddedImageEditor = useCallback((img) => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill || !img) return;

    const editorRoot = quill.root;
    const imageParagraph = img.closest('p');
    if (!imageParagraph || !editorRoot.contains(imageParagraph)) return;
    if (!isBlogImageParagraph(imageParagraph)) return;

    let captionParagraph = imageParagraph.nextElementSibling;
    if (captionParagraph && !isBlogImageCaptionParagraph(captionParagraph)) {
      captionParagraph = null;
    }

    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    const description = parseBlogImageCaption(captionParagraph);

    editingImageRef.current = { imageParagraph, captionParagraph };
    imagePickerRangeRef.current = null;
    setPendingImage({
      secure_url: src,
      alt,
      description,
      public_id: extractPublicIdFromCloudinaryUrl(src),
      isEdit: true,
    });
    setShowImageDetails(true);
  }, []);

  useEffect(() => () => clearTimeout(messageTimerRef.current), []);

  const showImageMessage = useCallback((message, isError = false) => {
    clearTimeout(messageTimerRef.current);
    setImageMessage(message);
    setImageMessageIsError(isError);
    if (!isError) {
      messageTimerRef.current = setTimeout(() => setImageMessage(''), 2500);
    }
  }, []);

  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill || !quillLoaded || !ReactQuill) return;

    if (!quill.__hostedImageMatcher) {
      const Delta = ReactQuill.Quill.import('delta');
      quill.clipboard.addMatcher('IMG', (node, delta) => {
        const src = node.getAttribute?.('src') || '';
        if (typeof src === 'string' && src.startsWith('data:')) return new Delta();
        return delta;
      });
      quill.clipboard.addMatcher('H1', (_node, delta) => {
        delta.ops?.forEach((op) => {
          if (op.attributes?.header) op.attributes.header = 2;
        });
        return delta;
      });
      quill.__hostedImageMatcher = true;
    }

    const insertHostedFiles = async (files, range) => {
      let index = range?.index ?? quill.getLength();
      const deleteLength = range?.length ?? 0;
      if (deleteLength > 0) {
        quill.deleteText(index, deleteLength);
      }

      for (const file of files) {
        const uploaded = await uploadImageFile(file);
        quill.clipboard.dangerouslyPasteHTML(index, hostedImageHtml(uploaded.url));
        index += 1;
      }
      quill.setSelection(index);
      onChangeRef.current(quill.root.innerHTML);
    };

    const replacePastedDataUrls = async (html, range) => {
      const dataUrls = extractDataUrls(html);
      let nextHtml = html;
      for (let i = 0; i < dataUrls.length; i += 1) {
        const file = dataUrlToFile(dataUrls[i], i);
        if (!file) throw new Error('Upload failed');
        const uploaded = await uploadImageFile(file);
        const hostedUrl = getOptimizedCloudinaryUrl(uploaded.url, 800);
        nextHtml = nextHtml.split(dataUrls[i]).join(hostedUrl);
      }

      const index = range?.index ?? quill.getLength();
      const deleteLength = range?.length ?? 0;
      if (deleteLength > 0) {
        quill.deleteText(index, deleteLength);
      }
      quill.clipboard.dangerouslyPasteHTML(index, nextHtml);
      quill.setSelection(index + 1);
      onChangeRef.current(quill.root.innerHTML);
    };

    const uploadClipboardImages = async ({ files, html, range }) => {
      if (uploadingImagesRef.current) return;
      uploadingImagesRef.current = true;
      showImageMessage('מעלה תמונה...');
      try {
        if (html && extractDataUrls(html).length) {
          await replacePastedDataUrls(html, range);
        } else if (files.length) {
          await insertHostedFiles(files, range);
        } else {
          throw new Error('Upload failed');
        }
        showImageMessage('התמונה הועלתה');
      } catch (error) {
        console.error('Editor image upload failed:', error);
        showImageMessage('העלאת התמונה נכשלה. התמונה לא נוספה לתוכן.', true);
      } finally {
        uploadingImagesRef.current = false;
      }
    };

    const editorRoot = quill.root;

    const onPaste = (event) => {
      const clipboard = event.clipboardData;
      if (!clipboard) return;

      const itemFiles = imageFilesFromList(
        [...clipboard.items]
          .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
          .map((item) => item.getAsFile())
      );
      const files = itemFiles.length ? itemFiles : imageFilesFromList(clipboard.files);
      const html = clipboard.getData('text/html') || '';
      const hasDataUrl = html.includes('data:image/');
      if (!files.length && !hasDataUrl) return;

      event.preventDefault();
      event.stopPropagation();
      const range = quill.getSelection(true);
      uploadClipboardImages({
        files,
        html: hasDataUrl ? html : '',
        range: range ? { index: range.index, length: range.length } : null,
      });
    };

    const onDragOver = (event) => {
      if (imageFilesFromList(event.dataTransfer?.files).length || [...(event.dataTransfer?.items || [])].some((item) => item.type.startsWith('image/'))) {
        event.preventDefault();
      }
    };

    const onDrop = (event) => {
      const files = imageFilesFromList(event.dataTransfer?.files);
      if (!files.length) return;
      event.preventDefault();
      event.stopPropagation();
      const range = quill.getSelection(true);
      uploadClipboardImages({
        files,
        html: '',
        range: range ? { index: range.index, length: range.length } : null,
      });
    };

    editorRoot.addEventListener('paste', onPaste, true);
    editorRoot.addEventListener('dragover', onDragOver);
    editorRoot.addEventListener('drop', onDrop, true);

    const handleClick = (event) => {
      const img = event.target.closest('img');
      if (!img || !editorRoot.contains(img)) return;
      if (!isBlogImageParagraph(img.closest('p'))) return;

      event.preventDefault();
      event.stopPropagation();
      openEmbeddedImageEditor(img);
    };

    editorRoot.addEventListener('click', handleClick);
    return () => {
      editorRoot.removeEventListener('paste', onPaste, true);
      editorRoot.removeEventListener('dragover', onDragOver);
      editorRoot.removeEventListener('drop', onDrop, true);
      editorRoot.removeEventListener('click', handleClick);
    };
  }, [quillLoaded, openEmbeddedImageEditor, showImageMessage]);

  const handleImageDetailsConfirm = useCallback(
    (imageData) => {
      const quill = quillRef.current?.getEditor?.();
      const range = imagePickerRangeRef.current;
      const editTarget = editingImageRef.current;

      if (!quill || !imageData?.secure_url) {
        closeImageFlow();
        return;
      }

      const url = getOptimizedCloudinaryUrl(imageData.secure_url, 800);
      const html = buildBlogImageHtml({
        url,
        alt: imageData.alt,
        description: imageData.description,
      });

      if (editTarget?.imageParagraph) {
        replaceBlogImageBlock({
          imageParagraph: editTarget.imageParagraph,
          captionParagraph: editTarget.captionParagraph,
          html,
        });
        onChange(quill.root.innerHTML);
        closeImageFlow();
        return;
      }

      const insertIndex = range?.index ?? quill.getLength();
      const deleteLength = range?.length ?? 0;

      if (deleteLength > 0) {
        quill.deleteText(insertIndex, deleteLength);
      }
      quill.clipboard.dangerouslyPasteHTML(insertIndex, html);
      quill.setSelection(insertIndex + 1);
      onChange(quill.root.innerHTML);
      closeImageFlow();
    },
    [closeImageFlow, onChange]
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
      {imageMessage && (
        <p
          className={imageMessageIsError ? styles.imageError : styles.imageStatus}
          role={imageMessageIsError ? 'alert' : 'status'}
        >
          {imageMessage}
        </p>
      )}

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

      {showImagePicker && (
        <MediaPickerModal
          isOpen={showImagePicker}
          onClose={closeMediaPicker}
          onConfirm={handleMediaSelect}
        />
      )}

      {showImageDetails && pendingImage && (
        <ImageDetailsModal
          isOpen={showImageDetails}
          image={pendingImage}
          onClose={closeImageFlow}
          onConfirm={handleImageDetailsConfirm}
        />
      )}
    </div>
  );
}
