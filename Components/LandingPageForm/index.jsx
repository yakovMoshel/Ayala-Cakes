'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import AdminImageField from '@/Components/AdminImageField';
import formStyles from '@/app/admin/formShared.module.scss';
import {
    PACKAGE_COLORS,
    SLUG_PATTERN,
    TESTIMONIAL_VARIANTS,
    emptyWorkshopContent,
    landingPublicUrl,
} from '@/utils/landingPageContent';
import styles from './style.module.scss';

const COLOR_LABELS = { green: 'ירוק', blue: 'כחול', pink: 'ורוד' };
const VARIANT_LABELS = { mom: 'אמא', girl: 'ילדה', guest: 'משתתפת' };

function mergeContent(content) {
    const base = emptyWorkshopContent();
    if (!content) return base;
    return {
        seo: { ...base.seo, ...content.seo },
        cta: { ...base.cta, ...content.cta },
        hero: { ...base.hero, ...content.hero },
        gallery: { ...base.gallery, ...(content.gallery || {}), images: content.gallery?.images || [] },
        benefits: { ...base.benefits, ...(content.benefits || {}), items: content.benefits?.items || [] },
        process: { ...base.process, ...(content.process || {}), paragraphs: content.process?.paragraphs || [] },
        instructor: {
            ...base.instructor,
            ...(content.instructor || {}),
            paragraphs: content.instructor?.paragraphs || [],
        },
        testimonials: {
            ...base.testimonials,
            ...(content.testimonials || {}),
            items: content.testimonials?.items || [],
        },
        packages: { ...base.packages, ...(content.packages || {}), items: content.packages?.items || [] },
        faq: { ...base.faq, ...(content.faq || {}), items: content.faq?.items || [] },
        finalCta: { ...base.finalCta, ...content.finalCta },
    };
}

function Field({ id, label, value, onChange, multiline = false }) {
    return (
        <div className={formStyles.formGroup}>
            <label htmlFor={id}>{label}</label>
            {multiline ? (
                <textarea id={id} value={value || ''} onChange={(event) => onChange(event.target.value)} />
            ) : (
                <input id={id} value={value || ''} onChange={(event) => onChange(event.target.value)} />
            )}
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className={styles.section}>
            <h2>{title}</h2>
            {children}
        </section>
    );
}

function AddButton({ label, onClick }) {
    return (
        <button type="button" className={styles.addButton} onClick={onClick}>
            <Plus size={16} />
            <span>{label}</span>
        </button>
    );
}

function RemoveButton({ label, onClick }) {
    return (
        <button type="button" className={styles.removeButton} onClick={onClick} aria-label={label}>
            <Trash2 size={16} />
        </button>
    );
}

export default function LandingPageForm({ initial = null }) {
    const router = useRouter();
    const isEdit = Boolean(initial?._id);
    const [title, setTitle] = useState(initial?.title || '');
    const [slug, setSlug] = useState(initial?.slug || '');
    const [status, setStatus] = useState(initial?.status || 'draft');
    const [content, setContent] = useState(() => mergeContent(initial?.content));
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const savedTimerRef = useRef(null);

    useEffect(() => () => {
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    }, []);

    const setSection = (key, value) => {
        setContent((prev) => ({ ...prev, [key]: value }));
    };

    const updateList = (key, listKey, next) => {
        setContent((prev) => ({ ...prev, [key]: { ...prev[key], [listKey]: next } }));
    };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setFieldErrors({});
        const payload = {
            title,
            slug,
            template: 'workshop',
            content,
            ...(isEdit ? { status } : {}),
        };
        try {
            const response = await fetch(isEdit ? `/api/landing-page/${initial._id}` : '/api/landing-page', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const json = await response.json();
            if (!json.success) {
                setFieldErrors(json.fields || {});
                setError(json.error || 'השמירה נכשלה');
                return;
            }
            if (!isEdit) {
                router.push(`/admin/landing-pages/${json.data._id}/edit`);
                router.refresh();
                return;
            }
            router.refresh();
            setError('');
            setSaved(true);
            setStatus(json.data.status);
            setSlug(json.data.slug);
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
            savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('השמירה נכשלה');
        } finally {
            setSaving(false);
        }
    };

    const slugPreview = SLUG_PATTERN.test(slug) ? landingPublicUrl(slug) : '';

    return (
        <form className={`${formStyles.form} ${styles.form}`} onSubmit={save}>
            <div className={styles.formHeader}>
                <h1>{isEdit ? 'עריכת דף נחיתה' : 'דף נחיתה חדש'}</h1>
                <button type="submit" className={formStyles.submitButton} disabled={saving}>
                    {saving ? <Loader2 className={styles.spinner} size={18} /> : null}
                    <span>{isEdit ? 'שמירה' : 'שמירת טיוטה'}</span>
                </button>
            </div>

            {error ? (
                <div className={formStyles.submitError} role="alert">
                    <span>{error}</span>
                </div>
            ) : null}
            {saved ? <p className={styles.saved} role="status">הדף נשמר</p> : null}

            <Section title="פרטי הדף">
                <Field id="landing-title" label="שם הדף בניהול" value={title} onChange={setTitle} />
                <div className={formStyles.formGroup}>
                    <label htmlFor="landing-slug">כתובת באנגלית</label>
                    <input
                        id="landing-slug"
                        dir="ltr"
                        value={slug}
                        onChange={(event) => setSlug(event.target.value.trim().toLowerCase())}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        required
                    />
                    <p className={styles.preview}>{slugPreview || 'הזינו כתובת באנגלית כדי לראות את הקישור'}</p>
                    {fieldErrors.slug ? <p className={styles.fieldError}>{fieldErrors.slug}</p> : null}
                </div>
                <div className={formStyles.formGroup}>
                    <label htmlFor="landing-template">תבנית</label>
                    <input id="landing-template" value="סדנה" disabled readOnly />
                </div>
                {isEdit ? (
                    <div className={formStyles.formGroup}>
                        <label htmlFor="landing-status">סטטוס</label>
                        <select
                            id="landing-status"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            <option value="draft">טיוטה</option>
                            <option value="published">מפורסם</option>
                        </select>
                    </div>
                ) : (
                    <p className={styles.note}>הדף נשמר כטיוטה ואינו מופיע באתר עד לפרסום.</p>
                )}
            </Section>

            <Section title="SEO">
                <Field id="seo-title" label="כותרת" value={content.seo.title} onChange={(value) => setSection('seo', { ...content.seo, title: value })} />
                <Field id="seo-description" label="תיאור" value={content.seo.description} multiline onChange={(value) => setSection('seo', { ...content.seo, description: value })} />
                <Field id="seo-service" label="שם בנתונים המובנים" value={content.seo.serviceName} onChange={(value) => setSection('seo', { ...content.seo, serviceName: value })} />
            </Section>

            <Section title="כפתורי וואטסאפ">
                <Field id="cta-message" label="הודעה" value={content.cta.message} multiline onChange={(value) => setSection('cta', { ...content.cta, message: value })} />
                <Field id="cta-hero" label="כפתור ראשי" value={content.cta.heroLabel} onChange={(value) => setSection('cta', { ...content.cta, heroLabel: value })} />
                <Field id="cta-aria" label="תיאור הכפתור הראשי לקורא מסך" value={content.cta.heroAriaLabel} onChange={(value) => setSection('cta', { ...content.cta, heroAriaLabel: value })} />
                <Field id="cta-final" label="כפתור סיום" value={content.cta.finalLabel} onChange={(value) => setSection('cta', { ...content.cta, finalLabel: value })} />
                <Field id="cta-sticky" label="כפתור צף במובייל" value={content.cta.stickyLabel} onChange={(value) => setSection('cta', { ...content.cta, stickyLabel: value })} />
            </Section>

            <Section title="הירו">
                <AdminImageField id="hero-image" label="תמונה" value={content.hero.image} onChange={(value) => setSection('hero', { ...content.hero, image: value })} />
                <Field id="hero-alt" label="תיאור התמונה" value={content.hero.imageAlt} onChange={(value) => setSection('hero', { ...content.hero, imageAlt: value })} />
                <Field id="hero-title" label="כותרת" value={content.hero.title} onChange={(value) => setSection('hero', { ...content.hero, title: value })} />
                <Field id="hero-text" label="טקסט" value={content.hero.text} multiline onChange={(value) => setSection('hero', { ...content.hero, text: value })} />
                <Field id="hero-trust" label="שורת אמון" value={content.hero.trust} onChange={(value) => setSection('hero', { ...content.hero, trust: value })} />
            </Section>

            <Section title="גלריה">
                <Field id="gallery-title" label="כותרת" value={content.gallery.title} onChange={(value) => setSection('gallery', { ...content.gallery, title: value })} />
                <Field id="gallery-description" label="תיאור" value={content.gallery.description} multiline onChange={(value) => setSection('gallery', { ...content.gallery, description: value })} />
                {content.gallery.images.map((image, index) => (
                    <div key={`gallery-${index}`} className={styles.card}>
                        <div className={styles.cardHead}>
                            <span>תמונה {index + 1}</span>
                            <RemoveButton
                                label={`הסרת תמונת גלריה ${index + 1}`}
                                onClick={() => updateList('gallery', 'images', content.gallery.images.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        </div>
                        <AdminImageField
                            id={`gallery-image-${index}`}
                            label="תמונה"
                            value={image.src}
                            onChange={(value) => {
                                const images = content.gallery.images.map((item, itemIndex) => (
                                    itemIndex === index ? { ...item, src: value } : item
                                ));
                                updateList('gallery', 'images', images);
                            }}
                        />
                        <Field
                            id={`gallery-alt-${index}`}
                            label="תיאור התמונה"
                            value={image.alt}
                            onChange={(value) => {
                                const images = content.gallery.images.map((item, itemIndex) => (
                                    itemIndex === index ? { ...item, alt: value } : item
                                ));
                                updateList('gallery', 'images', images);
                            }}
                        />
                    </div>
                ))}
                <AddButton label="תמונה" onClick={() => updateList('gallery', 'images', [...content.gallery.images, { src: '', alt: '' }])} />
            </Section>

            <Section title="יתרונות">
                <Field id="benefits-title" label="כותרת" value={content.benefits.title} onChange={(value) => setSection('benefits', { ...content.benefits, title: value })} />
                {content.benefits.items.map((item, index) => (
                    <div key={`benefit-${index}`} className={styles.card}>
                        <div className={styles.cardHead}>
                            <span>יתרון {index + 1}</span>
                            <RemoveButton
                                label={`הסרת יתרון ${index + 1}`}
                                onClick={() => updateList('benefits', 'items', content.benefits.items.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        </div>
                        <Field id={`benefit-emoji-${index}`} label="אימוג׳י" value={item.emoji} onChange={(value) => updateList('benefits', 'items', content.benefits.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, emoji: value } : entry))} />
                        <Field id={`benefit-title-${index}`} label="כותרת" value={item.title} onChange={(value) => updateList('benefits', 'items', content.benefits.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: value } : entry))} />
                        <Field id={`benefit-text-${index}`} label="טקסט" value={item.text} multiline onChange={(value) => updateList('benefits', 'items', content.benefits.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: value } : entry))} />
                    </div>
                ))}
                <AddButton label="יתרון" onClick={() => updateList('benefits', 'items', [...content.benefits.items, { emoji: '', title: '', text: '' }])} />
            </Section>

            <Section title="תהליך">
                <Field id="process-title" label="כותרת" value={content.process.title} onChange={(value) => setSection('process', { ...content.process, title: value })} />
                {content.process.paragraphs.map((paragraph, index) => (
                    <div key={`process-${index}`} className={styles.card}>
                        <div className={styles.cardHead}>
                            <span>פסקה {index + 1}</span>
                            <RemoveButton
                                label={`הסרת פסקת תהליך ${index + 1}`}
                                onClick={() => updateList('process', 'paragraphs', content.process.paragraphs.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        </div>
                        <Field id={`process-text-${index}`} label="טקסט" value={paragraph} multiline onChange={(value) => updateList('process', 'paragraphs', content.process.paragraphs.map((entry, itemIndex) => itemIndex === index ? value : entry))} />
                    </div>
                ))}
                <AddButton label="פסקה" onClick={() => updateList('process', 'paragraphs', [...content.process.paragraphs, ''])} />
            </Section>

            <Section title="מנחה">
                <AdminImageField id="instructor-image" label="תמונה" value={content.instructor.image} onChange={(value) => setSection('instructor', { ...content.instructor, image: value })} />
                <Field id="instructor-alt" label="תיאור התמונה" value={content.instructor.imageAlt} onChange={(value) => setSection('instructor', { ...content.instructor, imageAlt: value })} />
                <Field id="instructor-title" label="כותרת" value={content.instructor.title} onChange={(value) => setSection('instructor', { ...content.instructor, title: value })} />
                <Field id="instructor-subtitle" label="כותרת משנה" value={content.instructor.subtitle} onChange={(value) => setSection('instructor', { ...content.instructor, subtitle: value })} />
                {content.instructor.paragraphs.map((paragraph, index) => (
                    <div key={`instructor-${index}`} className={styles.card}>
                        <div className={styles.cardHead}>
                            <span>פסקה {index + 1}</span>
                            <RemoveButton
                                label={`הסרת פסקת מנחה ${index + 1}`}
                                onClick={() => updateList('instructor', 'paragraphs', content.instructor.paragraphs.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        </div>
                        <Field id={`instructor-text-${index}`} label="טקסט" value={paragraph.text} multiline onChange={(value) => updateList('instructor', 'paragraphs', content.instructor.paragraphs.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: value } : entry))} />
                        <label className={styles.check} htmlFor={`instructor-highlight-${index}`}>
                            <input
                                id={`instructor-highlight-${index}`}
                                type="checkbox"
                                checked={Boolean(paragraph.highlight)}
                                onChange={(event) => updateList('instructor', 'paragraphs', content.instructor.paragraphs.map((entry, itemIndex) => itemIndex === index ? { ...entry, highlight: event.target.checked } : entry))}
                            />
                            <span>פסקה מודגשת</span>
                        </label>
                    </div>
                ))}
                <AddButton label="פסקה" onClick={() => updateList('instructor', 'paragraphs', [...content.instructor.paragraphs, { text: '' }])} />
                <Field id="instructor-signature" label="חתימה" value={content.instructor.signature} onChange={(value) => setSection('instructor', { ...content.instructor, signature: value })} />
            </Section>

            <Section title="המלצות">
                <Field id="testimonials-title" label="כותרת" value={content.testimonials.title} onChange={(value) => setSection('testimonials', { ...content.testimonials, title: value })} />
                <Field id="testimonials-description" label="תיאור" value={content.testimonials.description} multiline onChange={(value) => setSection('testimonials', { ...content.testimonials, description: value })} />
                {content.testimonials.items.map((item, index) => (
                    <div key={`testimonial-${index}`} className={styles.card}>
                        <div className={styles.cardHead}>
                            <span>המלצה {index + 1}</span>
                            <RemoveButton
                                label={`הסרת המלצה ${index + 1}`}
                                onClick={() => updateList('testimonials', 'items', content.testimonials.items.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label htmlFor={`testimonial-variant-${index}`}>סגנון בועה</label>
                            <select
                                id={`testimonial-variant-${index}`}
                                value={item.variant || 'mom'}
                                onChange={(event) => updateList('testimonials', 'items', content.testimonials.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, variant: event.target.value } : entry))}
                            >
                                {TESTIMONIAL_VARIANTS.map((variant) => (
                                    <option key={variant} value={variant}>{VARIANT_LABELS[variant]}</option>
                                ))}
                            </select>
                        </div>
                        <Field id={`testimonial-name-${index}`} label="שם" value={item.name} onChange={(value) => updateList('testimonials', 'items', content.testimonials.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, name: value } : entry))} />
                        <Field id={`testimonial-role-${index}`} label="תפקיד" value={item.role} onChange={(value) => updateList('testimonials', 'items', content.testimonials.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, role: value } : entry))} />
                        <Field id={`testimonial-text-${index}`} label="טקסט" value={item.text} multiline onChange={(value) => updateList('testimonials', 'items', content.testimonials.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: value } : entry))} />
                        <Field id={`testimonial-time-${index}`} label="שעה" value={item.time || ''} onChange={(value) => updateList('testimonials', 'items', content.testimonials.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, time: value } : entry))} />
                    </div>
                ))}
                <AddButton label="המלצה" onClick={() => updateList('testimonials', 'items', [...content.testimonials.items, { variant: 'mom', name: '', role: '', text: '', time: '' }])} />
            </Section>

            <Section title="חבילות">
                <Field id="packages-title" label="כותרת" value={content.packages.title} onChange={(value) => setSection('packages', { ...content.packages, title: value })} />
                <Field id="packages-description" label="תיאור" value={content.packages.description} multiline onChange={(value) => setSection('packages', { ...content.packages, description: value })} />
                <Field id="packages-summary" label="סיכום" value={content.packages.summary} multiline onChange={(value) => setSection('packages', { ...content.packages, summary: value })} />
                {content.packages.items.map((item, index) => (
                    <div key={`package-${index}`} className={styles.card}>
                        <div className={styles.cardHead}>
                            <span>חבילה {index + 1}</span>
                            <RemoveButton
                                label={`הסרת חבילה ${index + 1}`}
                                onClick={() => updateList('packages', 'items', content.packages.items.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        </div>
                        <Field id={`package-type-${index}`} label="שם החבילה" value={item.packageType} onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, packageType: value } : entry))} />
                        <Field id={`package-duration-${index}`} label="משך" value={item.duration} onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, duration: value } : entry))} />
                        <Field id={`package-emphasis-${index}`} label="דגש" value={item.emphasis} onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, emphasis: value } : entry))} />
                        {(item.features || []).map((feature, featureIndex) => (
                            <div key={`feature-${index}-${featureIndex}`} className={styles.inlineRow}>
                                <Field
                                    id={`package-feature-${index}-${featureIndex}`}
                                    label={`פריט ${featureIndex + 1}`}
                                    value={feature}
                                    onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, features: entry.features.map((line, lineIndex) => lineIndex === featureIndex ? value : line) } : entry))}
                                />
                                <RemoveButton
                                    label={`הסרת פריט ${featureIndex + 1} בחבילה ${index + 1}`}
                                    onClick={() => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, features: entry.features.filter((_, lineIndex) => lineIndex !== featureIndex) } : entry))}
                                />
                            </div>
                        ))}
                        <AddButton label="פריט בחבילה" onClick={() => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, features: [...(entry.features || []), ''] } : entry))} />
                        <Field id={`package-bonus-${index}`} label="בונוס" value={item.bonus || ''} onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, bonus: value } : entry))} />
                        <Field id={`package-price-${index}`} label="מחיר" value={item.price || ''} onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, price: value } : entry))} />
                        <div className={formStyles.formGroup}>
                            <label htmlFor={`package-color-${index}`}>צבע</label>
                            <select
                                id={`package-color-${index}`}
                                value={item.color || 'green'}
                                onChange={(event) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, color: event.target.value } : entry))}
                            >
                                {PACKAGE_COLORS.map((color) => (
                                    <option key={color} value={color}>{COLOR_LABELS[color]}</option>
                                ))}
                            </select>
                        </div>
                        <Field id={`package-badge-${index}`} label="תווית" value={item.badge || ''} onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, badge: value } : entry))} />
                        <label className={styles.check} htmlFor={`package-recommended-${index}`}>
                            <input
                                id={`package-recommended-${index}`}
                                type="checkbox"
                                checked={Boolean(item.recommended)}
                                onChange={(event) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, recommended: event.target.checked } : entry))}
                            />
                            <span>מומלצת</span>
                        </label>
                        <Field id={`package-height-${index}`} label="גובה מינימלי" value={item.minHeight || ''} onChange={(value) => updateList('packages', 'items', content.packages.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, minHeight: value } : entry))} />
                    </div>
                ))}
                <AddButton
                    label="חבילה"
                    onClick={() => updateList('packages', 'items', [...content.packages.items, { packageType: '', duration: '', emphasis: '', features: [], color: 'green' }])}
                />
            </Section>

            <Section title="שאלות נפוצות">
                <Field id="faq-title" label="כותרת" value={content.faq.title} onChange={(value) => setSection('faq', { ...content.faq, title: value })} />
                <Field id="faq-description" label="תיאור" value={content.faq.description} multiline onChange={(value) => setSection('faq', { ...content.faq, description: value })} />
                {content.faq.items.map((item, index) => (
                    <div key={`faq-${index}`} className={styles.card}>
                        <div className={styles.cardHead}>
                            <span>שאלה {index + 1}</span>
                            <RemoveButton
                                label={`הסרת שאלה ${index + 1}`}
                                onClick={() => updateList('faq', 'items', content.faq.items.filter((_, itemIndex) => itemIndex !== index))}
                            />
                        </div>
                        <Field id={`faq-question-${index}`} label="שאלה" value={item.question} onChange={(value) => updateList('faq', 'items', content.faq.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, question: value } : entry))} />
                        {(item.blocks || []).map((block, blockIndex) => (
                            <div key={`faq-block-${index}-${blockIndex}`} className={styles.nested}>
                                <div className={styles.cardHead}>
                                    <span>{block.type === 'list' ? 'רשימה' : 'פסקה'}</span>
                                    <RemoveButton
                                        label={`הסרת בלוק תשובה ${blockIndex + 1}`}
                                        onClick={() => updateList('faq', 'items', content.faq.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, blocks: entry.blocks.filter((_, lineIndex) => lineIndex !== blockIndex) } : entry))}
                                    />
                                </div>
                                {block.type === 'list' ? (
                                    <Field
                                        id={`faq-list-${index}-${blockIndex}`}
                                        label="שורות, שורה בכל שורה"
                                        value={(block.items || []).join('\n')}
                                        multiline
                                        onChange={(value) => updateList('faq', 'items', content.faq.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, blocks: entry.blocks.map((entryBlock, lineIndex) => lineIndex === blockIndex ? { type: 'list', items: value.split('\n') } : entryBlock) } : entry))}
                                    />
                                ) : (
                                    <Field
                                        id={`faq-paragraph-${index}-${blockIndex}`}
                                        label="טקסט"
                                        value={block.text || ''}
                                        multiline
                                        onChange={(value) => updateList('faq', 'items', content.faq.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, blocks: entry.blocks.map((entryBlock, lineIndex) => lineIndex === blockIndex ? { type: 'paragraph', text: value } : entryBlock) } : entry))}
                                    />
                                )}
                            </div>
                        ))}
                        <div className={styles.rowActions}>
                            <AddButton label="פסקה" onClick={() => updateList('faq', 'items', content.faq.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, blocks: [...(entry.blocks || []), { type: 'paragraph', text: '' }] } : entry))} />
                            <AddButton label="רשימה" onClick={() => updateList('faq', 'items', content.faq.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, blocks: [...(entry.blocks || []), { type: 'list', items: [''] }] } : entry))} />
                        </div>
                    </div>
                ))}
                <AddButton label="שאלה" onClick={() => updateList('faq', 'items', [...content.faq.items, { question: '', blocks: [{ type: 'paragraph', text: '' }] }])} />
            </Section>

            <Section title="קריאה לסיום">
                <Field id="final-title" label="כותרת" value={content.finalCta.title} onChange={(value) => setSection('finalCta', { ...content.finalCta, title: value })} />
                <Field id="final-text" label="טקסט" value={content.finalCta.text} multiline onChange={(value) => setSection('finalCta', { ...content.finalCta, text: value })} />
            </Section>

            <button type="submit" className={formStyles.submitButton} disabled={saving}>
                {saving ? <Loader2 className={styles.spinner} size={18} /> : null}
                <span>{isEdit ? 'שמירה' : 'שמירת טיוטה'}</span>
            </button>
        </form>
    );
}
