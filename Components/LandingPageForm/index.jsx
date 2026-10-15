'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowDown,
    ArrowUp,
    ChevronDown,
    ChevronsDownUp,
    ChevronsUpDown,
    ExternalLink,
    Loader2,
    Plus,
    Trash2,
} from 'lucide-react';
import AdminImageField from '@/Components/AdminImageField';
import formStyles from '@/app/admin/formShared.module.scss';
import {
    PACKAGE_COLORS,
    SLUG_PATTERN,
    TESTIMONIAL_VARIANTS,
    emptyWorkshopContent,
    landingPublicUrl,
} from '@/utils/landingPageContent';
import GalleryEditor from './GalleryEditor';
import styles from './style.module.scss';

const COLOR_LABELS = { green: 'ירוק', blue: 'כחול', pink: 'ורוד' };
const VARIANT_LABELS = { mom: 'אמא', girl: 'ילדה', guest: 'משתתפת' };
const STATUS_LABELS = { draft: 'טיוטה', published: 'מפורסם' };
const SECTION_IDS = [
    'page', 'seo', 'cta', 'hero', 'gallery', 'benefits', 'process',
    'instructor', 'testimonials', 'packages', 'faq', 'finalCta',
];
const PAGE_FIELDS = ['title', 'slug', 'status', 'template'];
const HIDDEN = 'לא יוצג באתר';

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

function countLabel(count, noun) {
    return count ? `${count} ${noun}` : HIDDEN;
}

function Field({ id, label, value, onChange, multiline = false, wide = multiline, dir, placeholder, type = 'text' }) {
    return (
        <div className={`${formStyles.formGroup} ${wide ? styles.wide : ''}`}>
            <label htmlFor={id}>{label}</label>
            {multiline ? (
                <textarea
                    id={id}
                    className={styles.textarea}
                    value={value ?? ''}
                    dir={dir}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                />
            ) : (
                <input
                    id={id}
                    type={type}
                    value={value ?? ''}
                    dir={dir}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </div>
    );
}

function SelectField({ id, label, value, options, onChange }) {
    return (
        <div className={formStyles.formGroup}>
            <label htmlFor={id}>{label}</label>
            <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
                {options.map(([optionValue, optionLabel]) => (
                    <option key={optionValue} value={optionValue}>{optionLabel}</option>
                ))}
            </select>
        </div>
    );
}

function Section({ id, title, summary, open, onToggle, children }) {
    const bodyId = `landing-section-${id}`;
    return (
        <section className={`${styles.section} ${open ? styles.sectionOpen : ''}`}>
            <h2 className={styles.sectionHeading}>
                <button
                    type="button"
                    className={styles.sectionToggle}
                    aria-expanded={open}
                    aria-controls={bodyId}
                    onClick={onToggle}
                >
                    <ChevronDown className={styles.chevron} size={20} aria-hidden />
                    <span className={styles.sectionTitle}>{title}</span>
                    {summary ? <span className={styles.sectionSummary}>{summary}</span> : null}
                </button>
            </h2>
            <div id={bodyId} className={styles.sectionBody} hidden={!open}>
                {children}
            </div>
        </section>
    );
}

function ItemCard({ label, index, count, onMove, onRemove, children }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHead}>
                <span className={styles.cardTitle}>
                    <span className={styles.cardIndex}>{index + 1}</span>
                    <span className={styles.cardLabel}>{label}</span>
                </span>
                <div className={styles.cardActions}>
                    {onMove ? (
                        <>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => onMove(-1)}
                                disabled={index === 0}
                                aria-label={`העברת פריט ${index + 1} למעלה`}
                            >
                                <ArrowUp size={16} aria-hidden />
                            </button>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => onMove(1)}
                                disabled={index === count - 1}
                                aria-label={`העברת פריט ${index + 1} למטה`}
                            >
                                <ArrowDown size={16} aria-hidden />
                            </button>
                        </>
                    ) : null}
                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.danger}`}
                        onClick={onRemove}
                        aria-label={`הסרת פריט ${index + 1}`}
                    >
                        <Trash2 size={16} aria-hidden />
                    </button>
                </div>
            </div>
            <div className={styles.fields}>{children}</div>
        </div>
    );
}

function AddButton({ label, onClick }) {
    return (
        <button type="button" className={styles.addButton} onClick={onClick}>
            <Plus size={16} aria-hidden />
            <span>{label}</span>
        </button>
    );
}

export default function LandingPageForm({ initial = null }) {
    const router = useRouter();
    const isEdit = Boolean(initial?._id);
    const [title, setTitle] = useState(initial?.title || '');
    const [slug, setSlug] = useState(initial?.slug || '');
    const [status, setStatus] = useState(initial?.status || 'draft');
    const [savedSlug, setSavedSlug] = useState(initial?.slug || '');
    const [savedStatus, setSavedStatus] = useState(initial?.status || 'draft');
    const [content, setContent] = useState(() => mergeContent(initial?.content));
    const [openSections, setOpenSections] = useState(() => new Set(isEdit ? [] : ['page']));
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const savedTimerRef = useRef(null);

    useEffect(() => () => {
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    }, []);

    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    const edit = (setter) => (value) => {
        setter(value);
        setDirty(true);
    };

    const toggleSection = (id) => {
        setOpenSections((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const allOpen = openSections.size === SECTION_IDS.length;

    const patchSection = (key, patch) => {
        setContent((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
        setDirty(true);
    };

    const setList = (key, listKey, update) => {
        setContent((prev) => ({
            ...prev,
            [key]: { ...prev[key], [listKey]: update(prev[key][listKey] || []) },
        }));
        setDirty(true);
    };

    const patchItem = (key, listKey, index, patch) => setList(key, listKey, (list) => (
        list.map((item, itemIndex) => {
            if (itemIndex !== index) return item;
            return typeof patch === 'function' ? patch(item) : { ...item, ...patch };
        })
    ));

    const removeItem = (key, listKey, index) => setList(key, listKey, (list) => (
        list.filter((_, itemIndex) => itemIndex !== index)
    ));

    const moveItem = (key, listKey, index, step) => setList(key, listKey, (list) => {
        const target = index + step;
        if (target < 0 || target >= list.length) return list;
        const next = [...list];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
    });

    const addItem = (key, listKey, item) => setList(key, listKey, (list) => [...list, item]);

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
                const fields = json.fields || {};
                setFieldErrors(fields);
                setError(json.error || 'השמירה נכשלה');
                if (PAGE_FIELDS.some((field) => fields[field])) {
                    setOpenSections((prev) => new Set([...prev, 'page']));
                }
                return;
            }
            setDirty(false);
            if (!isEdit) {
                router.push(`/admin/landing-pages/${json.data._id}/edit`);
                router.refresh();
                return;
            }
            router.refresh();
            setSaved(true);
            setStatus(json.data.status);
            setSlug(json.data.slug);
            setSavedStatus(json.data.status);
            setSavedSlug(json.data.slug);
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
            savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('השמירה נכשלה');
        } finally {
            setSaving(false);
        }
    };

    const slugPreview = SLUG_PATTERN.test(slug) ? landingPublicUrl(slug) : '';
    const { seo, cta, hero, gallery, benefits, process, instructor, testimonials, packages, faq, finalCta } = content;

    return (
        <form className={`${formStyles.form} ${styles.form}`} onSubmit={save} noValidate>
            <div className={styles.formHeader}>
                <div className={styles.headerText}>
                    <h1>{isEdit ? title || 'עריכת דף נחיתה' : 'דף נחיתה חדש'}</h1>
                    {isEdit && savedStatus === 'published' && savedSlug ? (
                        <a
                            className={styles.viewLink}
                            href={`/${savedSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink size={14} aria-hidden />
                            <span dir="ltr">/{savedSlug}</span>
                        </a>
                    ) : (
                        <span className={styles.headerMeta}>{STATUS_LABELS[savedStatus]}</span>
                    )}
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.secondaryAction}
                        onClick={() => setOpenSections(allOpen ? new Set() : new Set(SECTION_IDS))}
                    >
                        {allOpen ? <ChevronsDownUp size={16} aria-hidden /> : <ChevronsUpDown size={16} aria-hidden />}
                        <span>{allOpen ? 'כיווץ הכל' : 'פתיחת הכל'}</span>
                    </button>
                    {dirty ? <span className={styles.dirty}>שינויים שלא נשמרו</span> : null}
                    <button type="submit" className={`${formStyles.submitButton} ${styles.saveButton}`} disabled={saving}>
                        {saving ? <Loader2 className={styles.spinner} size={18} aria-hidden /> : null}
                        <span>{isEdit ? 'שמירה' : 'שמירת טיוטה'}</span>
                    </button>
                </div>
            </div>

            {error ? (
                <div className={formStyles.submitError} role="alert">
                    <span>{error}</span>
                </div>
            ) : null}
            {saved ? <p className={styles.saved} role="status">הדף נשמר</p> : null}

            <Section
                id="page"
                title="פרטי הדף"
                summary={`${slug ? `/${slug}` : 'ללא כתובת'} · ${STATUS_LABELS[status]}`}
                open={openSections.has('page')}
                onToggle={() => toggleSection('page')}
            >
                <div className={styles.fields}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="landing-title">שם הדף בניהול</label>
                        <input id="landing-title" value={title} onChange={(event) => edit(setTitle)(event.target.value)} />
                        {fieldErrors.title ? <p className={styles.fieldError}>{fieldErrors.title}</p> : null}
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="landing-slug">כתובת באנגלית</label>
                        <input
                            id="landing-slug"
                            dir="ltr"
                            value={slug}
                            onChange={(event) => edit(setSlug)(event.target.value.trim().toLowerCase())}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            aria-describedby="landing-slug-preview"
                        />
                        <p id="landing-slug-preview" className={styles.preview}>
                            {slugPreview || 'אותיות אנגליות קטנות, מספרים ומקפים'}
                        </p>
                        {fieldErrors.slug ? <p className={styles.fieldError}>{fieldErrors.slug}</p> : null}
                    </div>
                    {isEdit ? (
                        <SelectField
                            id="landing-status"
                            label="סטטוס"
                            value={status}
                            options={Object.entries(STATUS_LABELS)}
                            onChange={edit(setStatus)}
                        />
                    ) : null}
                    <div className={formStyles.formGroup}>
                        <label htmlFor="landing-template">תבנית</label>
                        <input id="landing-template" value="סדנה" disabled readOnly />
                    </div>
                    {!isEdit ? (
                        <p className={`${styles.note} ${styles.wide}`}>הדף נשמר כטיוטה ואינו מופיע באתר עד לפרסום.</p>
                    ) : null}
                </div>
            </Section>

            <Section
                id="seo"
                title="SEO"
                summary={seo.title || 'ללא כותרת'}
                open={openSections.has('seo')}
                onToggle={() => toggleSection('seo')}
            >
                <div className={styles.fields}>
                    <Field id="seo-title" label="כותרת לגוגל" value={seo.title} onChange={(value) => patchSection('seo', { title: value })} />
                    <Field id="seo-service" label="שם השירות בנתונים המובנים" value={seo.serviceName} onChange={(value) => patchSection('seo', { serviceName: value })} />
                    <Field id="seo-description" label="תיאור לגוגל" value={seo.description} multiline onChange={(value) => patchSection('seo', { description: value })} />
                </div>
            </Section>

            <Section
                id="cta"
                title="כפתורי וואטסאפ"
                summary={cta.heroLabel || HIDDEN}
                open={openSections.has('cta')}
                onToggle={() => toggleSection('cta')}
            >
                <div className={styles.fields}>
                    <Field id="cta-hero" label="כפתור ראשי" value={cta.heroLabel} onChange={(value) => patchSection('cta', { heroLabel: value })} />
                    <Field id="cta-final" label="כפתור סיום" value={cta.finalLabel} onChange={(value) => patchSection('cta', { finalLabel: value })} />
                    <Field id="cta-sticky" label="כפתור צף במובייל" value={cta.stickyLabel} onChange={(value) => patchSection('cta', { stickyLabel: value })} />
                    <Field id="cta-aria" label="תיאור הכפתור הראשי לקורא מסך" value={cta.heroAriaLabel} onChange={(value) => patchSection('cta', { heroAriaLabel: value })} />
                    <Field id="cta-message" label="ההודעה שנפתחת בוואטסאפ" value={cta.message} multiline onChange={(value) => patchSection('cta', { message: value })} />
                </div>
            </Section>

            <Section
                id="hero"
                title="פתיח"
                summary={hero.title || HIDDEN}
                open={openSections.has('hero')}
                onToggle={() => toggleSection('hero')}
            >
                <div className={styles.split}>
                    <div className={styles.splitMedia}>
                        <AdminImageField id="hero-image" label="תמונה" value={hero.image} onChange={(value) => patchSection('hero', { image: value })} />
                        <Field id="hero-alt" label="תיאור התמונה" value={hero.imageAlt} onChange={(value) => patchSection('hero', { imageAlt: value })} />
                    </div>
                    <div className={styles.fields}>
                        <Field id="hero-title" label="כותרת ראשית" value={hero.title} wide onChange={(value) => patchSection('hero', { title: value })} />
                        <Field id="hero-text" label="טקסט" value={hero.text} multiline onChange={(value) => patchSection('hero', { text: value })} />
                        <Field id="hero-trust" label="שורת אמון" value={hero.trust} wide onChange={(value) => patchSection('hero', { trust: value })} />
                    </div>
                </div>
            </Section>

            <Section
                id="gallery"
                title="גלריה"
                summary={countLabel(gallery.images.length, 'תמונות')}
                open={openSections.has('gallery')}
                onToggle={() => toggleSection('gallery')}
            >
                <div className={styles.fields}>
                    <Field id="gallery-title" label="כותרת" value={gallery.title} onChange={(value) => patchSection('gallery', { title: value })} />
                    <Field id="gallery-description" label="תיאור" value={gallery.description} onChange={(value) => patchSection('gallery', { description: value })} />
                </div>
                <GalleryEditor
                    images={gallery.images}
                    onChange={(images) => patchSection('gallery', { images })}
                />
            </Section>

            <Section
                id="benefits"
                title="יתרונות"
                summary={countLabel(benefits.items.length, 'יתרונות')}
                open={openSections.has('benefits')}
                onToggle={() => toggleSection('benefits')}
            >
                <div className={styles.fields}>
                    <Field id="benefits-title" label="כותרת" value={benefits.title} wide onChange={(value) => patchSection('benefits', { title: value })} />
                </div>
                <div className={styles.cardGrid}>
                    {benefits.items.map((item, index) => (
                        <ItemCard
                            key={`benefit-${index}`}
                            label={item.title || 'יתרון חדש'}
                            index={index}
                            count={benefits.items.length}
                            onMove={(step) => moveItem('benefits', 'items', index, step)}
                            onRemove={() => removeItem('benefits', 'items', index)}
                        >
                            <div className={`${styles.emojiRow} ${styles.wide}`}>
                                <Field id={`benefit-emoji-${index}`} label="אימוג׳י" value={item.emoji} onChange={(value) => patchItem('benefits', 'items', index, { emoji: value })} />
                                <Field id={`benefit-title-${index}`} label="כותרת" value={item.title} onChange={(value) => patchItem('benefits', 'items', index, { title: value })} />
                            </div>
                            <Field id={`benefit-text-${index}`} label="טקסט" value={item.text} multiline onChange={(value) => patchItem('benefits', 'items', index, { text: value })} />
                        </ItemCard>
                    ))}
                </div>
                <AddButton label="הוספת יתרון" onClick={() => addItem('benefits', 'items', { emoji: '', title: '', text: '' })} />
            </Section>

            <Section
                id="process"
                title="מה קורה בסדנה"
                summary={countLabel(process.paragraphs.length, 'פסקאות')}
                open={openSections.has('process')}
                onToggle={() => toggleSection('process')}
            >
                <div className={styles.fields}>
                    <Field id="process-title" label="כותרת" value={process.title} wide onChange={(value) => patchSection('process', { title: value })} />
                </div>
                <div className={styles.stack}>
                    {process.paragraphs.map((paragraph, index) => (
                        <ItemCard
                            key={`process-${index}`}
                            label="פסקה"
                            index={index}
                            count={process.paragraphs.length}
                            onMove={(step) => moveItem('process', 'paragraphs', index, step)}
                            onRemove={() => removeItem('process', 'paragraphs', index)}
                        >
                            <Field
                                id={`process-text-${index}`}
                                label="טקסט"
                                value={paragraph}
                                multiline
                                onChange={(value) => setList('process', 'paragraphs', (list) => list.map((entry, itemIndex) => (itemIndex === index ? value : entry)))}
                            />
                        </ItemCard>
                    ))}
                </div>
                <AddButton label="הוספת פסקה" onClick={() => addItem('process', 'paragraphs', '')} />
            </Section>

            <Section
                id="instructor"
                title="המנחה"
                summary={instructor.title || HIDDEN}
                open={openSections.has('instructor')}
                onToggle={() => toggleSection('instructor')}
            >
                <div className={styles.split}>
                    <div className={styles.splitMedia}>
                        <AdminImageField id="instructor-image" label="תמונה" value={instructor.image} onChange={(value) => patchSection('instructor', { image: value })} />
                        <Field id="instructor-alt" label="תיאור התמונה" value={instructor.imageAlt} onChange={(value) => patchSection('instructor', { imageAlt: value })} />
                    </div>
                    <div className={styles.fields}>
                        <Field id="instructor-title" label="כותרת" value={instructor.title} onChange={(value) => patchSection('instructor', { title: value })} />
                        <Field id="instructor-subtitle" label="כותרת משנה" value={instructor.subtitle} onChange={(value) => patchSection('instructor', { subtitle: value })} />
                        <Field id="instructor-signature" label="חתימה" value={instructor.signature} wide onChange={(value) => patchSection('instructor', { signature: value })} />
                    </div>
                </div>
                <div className={styles.stack}>
                    {instructor.paragraphs.map((paragraph, index) => (
                        <ItemCard
                            key={`instructor-${index}`}
                            label={paragraph.highlight ? 'פסקה מודגשת' : 'פסקה'}
                            index={index}
                            count={instructor.paragraphs.length}
                            onMove={(step) => moveItem('instructor', 'paragraphs', index, step)}
                            onRemove={() => removeItem('instructor', 'paragraphs', index)}
                        >
                            <Field id={`instructor-text-${index}`} label="טקסט" value={paragraph.text} multiline onChange={(value) => patchItem('instructor', 'paragraphs', index, { text: value })} />
                            <label className={`${styles.check} ${styles.wide}`} htmlFor={`instructor-highlight-${index}`}>
                                <input
                                    id={`instructor-highlight-${index}`}
                                    type="checkbox"
                                    checked={Boolean(paragraph.highlight)}
                                    onChange={(event) => patchItem('instructor', 'paragraphs', index, { highlight: event.target.checked })}
                                />
                                <span>להדגיש את הפסקה</span>
                            </label>
                        </ItemCard>
                    ))}
                </div>
                <AddButton label="הוספת פסקה" onClick={() => addItem('instructor', 'paragraphs', { text: '' })} />
            </Section>

            <Section
                id="testimonials"
                title="המלצות"
                summary={countLabel(testimonials.items.length, 'המלצות')}
                open={openSections.has('testimonials')}
                onToggle={() => toggleSection('testimonials')}
            >
                <div className={styles.fields}>
                    <Field id="testimonials-title" label="כותרת" value={testimonials.title} onChange={(value) => patchSection('testimonials', { title: value })} />
                    <Field id="testimonials-description" label="תיאור" value={testimonials.description} onChange={(value) => patchSection('testimonials', { description: value })} />
                </div>
                <div className={styles.cardGrid}>
                    {testimonials.items.map((item, index) => (
                        <ItemCard
                            key={`testimonial-${index}`}
                            label={item.name || 'המלצה חדשה'}
                            index={index}
                            count={testimonials.items.length}
                            onMove={(step) => moveItem('testimonials', 'items', index, step)}
                            onRemove={() => removeItem('testimonials', 'items', index)}
                        >
                            <Field id={`testimonial-name-${index}`} label="שם" value={item.name} onChange={(value) => patchItem('testimonials', 'items', index, { name: value })} />
                            <Field id={`testimonial-role-${index}`} label="תפקיד" value={item.role} onChange={(value) => patchItem('testimonials', 'items', index, { role: value })} />
                            <SelectField
                                id={`testimonial-variant-${index}`}
                                label="סגנון בועה"
                                value={item.variant || 'mom'}
                                options={TESTIMONIAL_VARIANTS.map((variant) => [variant, VARIANT_LABELS[variant]])}
                                onChange={(value) => patchItem('testimonials', 'items', index, { variant: value })}
                            />
                            <Field id={`testimonial-time-${index}`} label="שעה" value={item.time || ''} dir="ltr" placeholder="21:40" onChange={(value) => patchItem('testimonials', 'items', index, { time: value })} />
                            <Field id={`testimonial-text-${index}`} label="טקסט" value={item.text} multiline onChange={(value) => patchItem('testimonials', 'items', index, { text: value })} />
                        </ItemCard>
                    ))}
                </div>
                <AddButton label="הוספת המלצה" onClick={() => addItem('testimonials', 'items', { variant: 'mom', name: '', role: '', text: '', time: '' })} />
            </Section>

            <Section
                id="packages"
                title="חבילות"
                summary={countLabel(packages.items.length, 'חבילות')}
                open={openSections.has('packages')}
                onToggle={() => toggleSection('packages')}
            >
                <div className={styles.fields}>
                    <Field id="packages-title" label="כותרת" value={packages.title} onChange={(value) => patchSection('packages', { title: value })} />
                    <Field id="packages-description" label="תיאור" value={packages.description} onChange={(value) => patchSection('packages', { description: value })} />
                    <Field id="packages-summary" label="שורת סיכום מתחת לחבילות" value={packages.summary} wide onChange={(value) => patchSection('packages', { summary: value })} />
                </div>
                <div className={styles.cardGrid}>
                    {packages.items.map((item, index) => (
                        <ItemCard
                            key={`package-${index}`}
                            label={item.packageType || 'חבילה חדשה'}
                            index={index}
                            count={packages.items.length}
                            onMove={(step) => moveItem('packages', 'items', index, step)}
                            onRemove={() => removeItem('packages', 'items', index)}
                        >
                            <Field id={`package-type-${index}`} label="שם החבילה" value={item.packageType} wide onChange={(value) => patchItem('packages', 'items', index, { packageType: value })} />
                            <Field id={`package-price-${index}`} label="מחיר" value={item.price || ''} onChange={(value) => patchItem('packages', 'items', index, { price: value })} />
                            <Field id={`package-duration-${index}`} label="משך" value={item.duration} onChange={(value) => patchItem('packages', 'items', index, { duration: value })} />
                            <SelectField
                                id={`package-color-${index}`}
                                label="צבע"
                                value={item.color || 'green'}
                                options={PACKAGE_COLORS.map((color) => [color, COLOR_LABELS[color]])}
                                onChange={(value) => patchItem('packages', 'items', index, { color: value })}
                            />
                            <Field id={`package-badge-${index}`} label="תווית" value={item.badge || ''} onChange={(value) => patchItem('packages', 'items', index, { badge: value })} />
                            <Field id={`package-emphasis-${index}`} label="דגש" value={item.emphasis} wide onChange={(value) => patchItem('packages', 'items', index, { emphasis: value })} />
                            <Field
                                id={`package-features-${index}`}
                                label="מה כלול, פריט בכל שורה"
                                value={(item.features || []).join('\n')}
                                multiline
                                onChange={(value) => patchItem('packages', 'items', index, { features: value.split('\n') })}
                            />
                            <Field id={`package-bonus-${index}`} label="בונוס" value={item.bonus || ''} wide onChange={(value) => patchItem('packages', 'items', index, { bonus: value })} />
                            <label className={styles.check} htmlFor={`package-recommended-${index}`}>
                                <input
                                    id={`package-recommended-${index}`}
                                    type="checkbox"
                                    checked={Boolean(item.recommended)}
                                    onChange={(event) => patchItem('packages', 'items', index, { recommended: event.target.checked })}
                                />
                                <span>חבילה מומלצת</span>
                            </label>
                            <Field
                                id={`package-height-${index}`}
                                label="גובה מינימלי (px)"
                                type="number"
                                value={item.minHeight || ''}
                                onChange={(value) => patchItem('packages', 'items', index, { minHeight: value })}
                            />
                        </ItemCard>
                    ))}
                </div>
                <AddButton
                    label="הוספת חבילה"
                    onClick={() => addItem('packages', 'items', { packageType: '', duration: '', emphasis: '', features: [], color: 'green' })}
                />
            </Section>

            <Section
                id="faq"
                title="שאלות נפוצות"
                summary={countLabel(faq.items.length, 'שאלות')}
                open={openSections.has('faq')}
                onToggle={() => toggleSection('faq')}
            >
                <div className={styles.fields}>
                    <Field id="faq-title" label="כותרת" value={faq.title} onChange={(value) => patchSection('faq', { title: value })} />
                    <Field id="faq-description" label="תיאור" value={faq.description} onChange={(value) => patchSection('faq', { description: value })} />
                </div>
                <div className={styles.stack}>
                    {faq.items.map((item, index) => (
                        <ItemCard
                            key={`faq-${index}`}
                            label={item.question || 'שאלה חדשה'}
                            index={index}
                            count={faq.items.length}
                            onMove={(step) => moveItem('faq', 'items', index, step)}
                            onRemove={() => removeItem('faq', 'items', index)}
                        >
                            <Field id={`faq-question-${index}`} label="שאלה" value={item.question} wide onChange={(value) => patchItem('faq', 'items', index, { question: value })} />
                            {(item.blocks || []).map((block, blockIndex) => {
                                const updateBlock = (nextBlock) => patchItem('faq', 'items', index, (entry) => ({
                                    ...entry,
                                    blocks: entry.blocks.map((entryBlock, lineIndex) => (lineIndex === blockIndex ? nextBlock : entryBlock)),
                                }));
                                return (
                                    <div key={`faq-block-${index}-${blockIndex}`} className={`${styles.answerBlock} ${styles.wide}`}>
                                        <Field
                                            id={`faq-block-${index}-${blockIndex}`}
                                            label={block.type === 'list' ? 'רשימה, פריט בכל שורה' : 'פסקת תשובה'}
                                            value={block.type === 'list' ? (block.items || []).join('\n') : block.text || ''}
                                            multiline
                                            onChange={(value) => updateBlock(block.type === 'list'
                                                ? { type: 'list', items: value.split('\n') }
                                                : { type: 'paragraph', text: value })}
                                        />
                                        <button
                                            type="button"
                                            className={`${styles.iconButton} ${styles.danger}`}
                                            onClick={() => patchItem('faq', 'items', index, (entry) => ({
                                                ...entry,
                                                blocks: entry.blocks.filter((_, lineIndex) => lineIndex !== blockIndex),
                                            }))}
                                            aria-label={`הסרת חלק ${blockIndex + 1} מהתשובה לשאלה ${index + 1}`}
                                        >
                                            <Trash2 size={16} aria-hidden />
                                        </button>
                                    </div>
                                );
                            })}
                            <div className={`${styles.rowActions} ${styles.wide}`}>
                                <AddButton
                                    label="פסקה לתשובה"
                                    onClick={() => patchItem('faq', 'items', index, (entry) => ({ ...entry, blocks: [...(entry.blocks || []), { type: 'paragraph', text: '' }] }))}
                                />
                                <AddButton
                                    label="רשימה לתשובה"
                                    onClick={() => patchItem('faq', 'items', index, (entry) => ({ ...entry, blocks: [...(entry.blocks || []), { type: 'list', items: [''] }] }))}
                                />
                            </div>
                        </ItemCard>
                    ))}
                </div>
                <AddButton label="הוספת שאלה" onClick={() => addItem('faq', 'items', { question: '', blocks: [{ type: 'paragraph', text: '' }] })} />
            </Section>

            <Section
                id="finalCta"
                title="קריאה לפעולה בסוף הדף"
                summary={finalCta.title || HIDDEN}
                open={openSections.has('finalCta')}
                onToggle={() => toggleSection('finalCta')}
            >
                <div className={styles.fields}>
                    <Field id="final-title" label="כותרת" value={finalCta.title} wide onChange={(value) => patchSection('finalCta', { title: value })} />
                    <Field id="final-text" label="טקסט" value={finalCta.text} multiline onChange={(value) => patchSection('finalCta', { text: value })} />
                </div>
            </Section>
        </form>
    );
}
