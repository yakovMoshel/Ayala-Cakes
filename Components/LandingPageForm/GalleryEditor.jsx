'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Trash2 } from 'lucide-react';
import styles from './style.module.scss';

const MediaPickerModal = dynamic(() => import('@/Components/MediaPickerModal'), { ssr: false });

const IMAGE_SOURCE = /^(https?:\/\/\S+|\/\S*)$/;

export default function GalleryEditor({ images, onChange }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pasteOpen, setPasteOpen] = useState(false);
    const [pasteValue, setPasteValue] = useState('');
    const [notice, setNotice] = useState('');

    const addImages = (incoming) => {
        const seen = new Set(images.map((image) => image.src));
        const fresh = [];
        for (const image of incoming) {
            if (!image.src || seen.has(image.src)) continue;
            seen.add(image.src);
            fresh.push(image);
        }
        const skipped = incoming.length - fresh.length;
        if (fresh.length) onChange([...images, ...fresh]);
        setNotice(
            [
                fresh.length ? `נוספו ${fresh.length} תמונות` : '',
                skipped ? `${skipped} כבר בגלריה ולא נוספו שוב` : '',
            ].filter(Boolean).join(' · ')
        );
    };

    const handlePickerConfirm = (selection) => {
        const list = Array.isArray(selection) ? selection : [selection];
        addImages(list.map((image) => ({ src: image.secure_url, alt: image.alt || '' })));
        setPickerOpen(false);
    };

    const handlePaste = () => {
        const sources = pasteValue
            .split(/\s+/)
            .map((value) => value.trim())
            .filter((value) => IMAGE_SOURCE.test(value));
        addImages(sources.map((src) => ({ src, alt: '' })));
        setPasteValue('');
        setPasteOpen(false);
    };

    const updateAlt = (index, alt) => {
        onChange(images.map((image, itemIndex) => (itemIndex === index ? { ...image, alt } : image)));
    };

    const move = (index, step) => {
        const target = index + step;
        if (target < 0 || target >= images.length) return;
        const next = [...images];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    const remove = (index) => {
        onChange(images.filter((_, itemIndex) => itemIndex !== index));
        setNotice('');
    };

    return (
        <div className={styles.gallery}>
            <div className={styles.galleryToolbar}>
                <button type="button" className={styles.primaryAction} onClick={() => setPickerOpen(true)}>
                    <ImagePlus size={18} aria-hidden />
                    <span>הוספת תמונות</span>
                </button>
                <button
                    type="button"
                    className={styles.secondaryAction}
                    aria-expanded={pasteOpen}
                    aria-controls="gallery-paste"
                    onClick={() => setPasteOpen((open) => !open)}
                >
                    <Link2 size={18} aria-hidden />
                    <span>הדבקת קישורים</span>
                </button>
            </div>

            {pasteOpen ? (
                <div id="gallery-paste" className={styles.pastePanel}>
                    <label htmlFor="gallery-paste-input">קישורי תמונות, קישור בכל שורה</label>
                    <textarea
                        id="gallery-paste-input"
                        className={styles.pasteInput}
                        dir="ltr"
                        value={pasteValue}
                        onChange={(event) => setPasteValue(event.target.value)}
                        placeholder={'https://res.cloudinary.com/...\n/images/example.png'}
                    />
                    <div className={styles.pasteActions}>
                        <button type="button" className={styles.primaryAction} onClick={handlePaste} disabled={!pasteValue.trim()}>
                            הוספה לגלריה
                        </button>
                        <button type="button" className={styles.secondaryAction} onClick={() => setPasteOpen(false)}>
                            ביטול
                        </button>
                    </div>
                </div>
            ) : null}

            {notice ? <p className={styles.galleryNotice} role="status">{notice}</p> : null}

            {images.length ? (
                <ol className={styles.galleryGrid}>
                    {images.map((image, index) => (
                        <li key={`${image.src}-${index}`} className={styles.galleryTile}>
                            <div className={styles.galleryThumb}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={image.src} alt="" loading="lazy" />
                                <span className={styles.galleryIndex}>{index + 1}</span>
                            </div>
                            <label className={styles.visuallyHidden} htmlFor={`gallery-alt-${index}`}>
                                תיאור תמונה {index + 1}
                            </label>
                            <input
                                id={`gallery-alt-${index}`}
                                className={styles.galleryAlt}
                                value={image.alt || ''}
                                placeholder="תיאור התמונה"
                                onChange={(event) => updateAlt(index, event.target.value)}
                            />
                            <div className={styles.galleryActions}>
                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    onClick={() => move(index, -1)}
                                    disabled={index === 0}
                                    aria-label={`העברת תמונה ${index + 1} למקום הקודם`}
                                >
                                    <ArrowRight size={16} aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    onClick={() => move(index, 1)}
                                    disabled={index === images.length - 1}
                                    aria-label={`העברת תמונה ${index + 1} למקום הבא`}
                                >
                                    <ArrowLeft size={16} aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.iconButton} ${styles.danger}`}
                                    onClick={() => remove(index)}
                                    aria-label={`הסרת תמונה ${index + 1}`}
                                >
                                    <Trash2 size={16} aria-hidden />
                                </button>
                            </div>
                        </li>
                    ))}
                </ol>
            ) : (
                <button type="button" className={styles.galleryEmpty} onClick={() => setPickerOpen(true)}>
                    <ImagePlus size={28} aria-hidden />
                    <span>אין עדיין תמונות. לחצי כדי להעלות או לבחור כמה תמונות יחד.</span>
                </button>
            )}

            {pickerOpen ? (
                <MediaPickerModal
                    isOpen={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    onConfirm={handlePickerConfirm}
                    multiple
                    initialSelection={[]}
                />
            ) : null}
        </div>
    );
}
