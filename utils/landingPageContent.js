import { SITE_URL, toAbsoluteSiteUrl } from './siteUrl.js';
import { WHATSAPP_PHONE } from './whatsapp.js';

export const LANDING_TEMPLATES = ['workshop'];
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PACKAGE_COLORS = ['green', 'blue', 'pink'];
export const TESTIMONIAL_VARIANTS = ['mom', 'girl', 'guest'];

/** Top-level app routes a landing slug must not replace. */
export const RESERVED_LANDING_SLUGS = new Set([
    'about',
    'admin',
    'api',
    'blog',
    'contact',
    'favorites',
    'login',
    'privacy',
    'robots',
    'shop',
    'sitemap',
    'terms',
    'uniquepost',
]);

const LIMITS = {
    title: 160,
    slug: 80,
    short: 200,
    text: 4000,
    message: 500,
};

export function landingPublicPath(slug) {
    return `/${slug}`;
}

export function landingPublicUrl(slug) {
    return `${SITE_URL}${landingPublicPath(slug)}`;
}

export function emptyWorkshopContent() {
    return {
        seo: { title: '', description: '', serviceName: '' },
        cta: { message: '', heroLabel: '', heroAriaLabel: '', finalLabel: '', stickyLabel: '' },
        hero: { image: '', imageAlt: '', title: '', text: '', trust: '' },
        gallery: { title: '', description: '', images: [] },
        benefits: { title: '', items: [] },
        process: { title: '', paragraphs: [] },
        instructor: {
            image: '',
            imageAlt: '',
            title: '',
            subtitle: '',
            paragraphs: [],
            signature: '',
        },
        testimonials: { title: '', description: '', items: [] },
        packages: { title: '', description: '', summary: '', items: [] },
        faq: { title: '', description: '', items: [] },
        finalCta: { title: '', text: '' },
    };
}

function asText(value, max = LIMITS.text) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, max);
}

function whatsappHref(message) {
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function messageFromWhatsAppHref(href) {
    if (typeof href !== 'string' || !href.includes('text=')) return '';
    const raw = href.slice(href.indexOf('text=') + 5).split('&')[0];
    try {
        return decodeURIComponent(raw.replace(/\+/g, ' ')).trim();
    } catch {
        return raw.trim();
    }
}

function cleanCta(cta = {}) {
    const message = asText(cta.message || messageFromWhatsAppHref(cta.href), LIMITS.message);
    const next = {
        message,
        heroLabel: asText(cta.heroLabel, LIMITS.short),
        heroAriaLabel: asText(cta.heroAriaLabel, LIMITS.short),
        finalLabel: asText(cta.finalLabel, LIMITS.short),
        stickyLabel: asText(cta.stickyLabel, LIMITS.short),
    };
    return Object.values(next).some(Boolean) ? next : null;
}

function cleanHero(hero = {}) {
    const next = {
        image: asText(hero.image, 2000),
        imageAlt: asText(hero.imageAlt, LIMITS.short),
        title: asText(hero.title, LIMITS.short),
        text: asText(hero.text),
        trust: asText(hero.trust),
    };
    return next.image || next.title || next.text || next.trust ? next : null;
}

function cleanGallery(gallery = {}) {
    const images = (Array.isArray(gallery.images) ? gallery.images : [])
        .map((image) => ({
            src: asText(image?.src, 2000),
            alt: asText(image?.alt, LIMITS.short),
        }))
        .filter((image) => image.src);
    if (!images.length) return null;
    return {
        title: asText(gallery.title, LIMITS.short),
        description: asText(gallery.description),
        images,
    };
}

function cleanBenefits(benefits = {}) {
    const items = (Array.isArray(benefits.items) ? benefits.items : [])
        .map((item) => ({
            emoji: asText(item?.emoji, 16),
            title: asText(item?.title, LIMITS.short),
            text: asText(item?.text),
        }))
        .filter((item) => item.title || item.text);
    if (!items.length) return null;
    return { title: asText(benefits.title, LIMITS.short), items };
}

function cleanProcess(process = {}) {
    const paragraphs = (Array.isArray(process.paragraphs) ? process.paragraphs : [])
        .map((paragraph) => asText(paragraph))
        .filter(Boolean);
    if (!paragraphs.length) return null;
    return { title: asText(process.title, LIMITS.short), paragraphs };
}

function cleanInstructor(instructor = {}) {
    const paragraphs = (Array.isArray(instructor.paragraphs) ? instructor.paragraphs : [])
        .map((paragraph) => {
            const text = asText(paragraph?.text);
            if (!text) return null;
            return paragraph?.highlight ? { text, highlight: true } : { text };
        })
        .filter(Boolean);
    const next = {
        image: asText(instructor.image, 2000),
        imageAlt: asText(instructor.imageAlt, LIMITS.short),
        title: asText(instructor.title, LIMITS.short),
        subtitle: asText(instructor.subtitle, LIMITS.short),
        paragraphs,
        signature: asText(instructor.signature, LIMITS.short),
    };
    if (!next.image && !next.title && !paragraphs.length) return null;
    return next;
}

function cleanTestimonials(testimonials = {}) {
    const items = (Array.isArray(testimonials.items) ? testimonials.items : [])
        .map((item) => {
            const text = asText(item?.text);
            const name = asText(item?.name, LIMITS.short);
            if (!text && !name) return null;
            const variant = TESTIMONIAL_VARIANTS.includes(item?.variant) ? item.variant : 'mom';
            const next = {
                variant,
                name,
                role: asText(item?.role, LIMITS.short),
                text,
            };
            const time = asText(item?.time, 20);
            if (time) next.time = time;
            return next;
        })
        .filter(Boolean);
    if (!items.length) return null;
    return {
        title: asText(testimonials.title, LIMITS.short),
        description: asText(testimonials.description),
        items,
    };
}

function cleanPackages(packages = {}) {
    const items = (Array.isArray(packages.items) ? packages.items : [])
        .map((item) => {
            const packageType = asText(item?.packageType, LIMITS.short);
            if (!packageType) return null;
            const features = (Array.isArray(item?.features) ? item.features : [])
                .map((feature) => asText(feature, LIMITS.text))
                .filter(Boolean);
            const next = {
                packageType,
                duration: asText(item?.duration, LIMITS.short),
                emphasis: asText(item?.emphasis, LIMITS.text),
                features,
                color: PACKAGE_COLORS.includes(item?.color) ? item.color : 'green',
            };
            const price = asText(item?.price, LIMITS.short);
            const bonus = asText(item?.bonus, LIMITS.text);
            const badge = asText(item?.badge, LIMITS.short);
            if (price) next.price = price;
            if (bonus) next.bonus = bonus;
            if (badge) next.badge = badge;
            if (item?.recommended) next.recommended = true;
            const minHeight = Number(item?.minHeight);
            if (Number.isFinite(minHeight) && minHeight > 0) next.minHeight = minHeight;
            return next;
        })
        .filter(Boolean);
    if (!items.length) return null;
    return {
        title: asText(packages.title, LIMITS.short),
        description: asText(packages.description),
        summary: asText(packages.summary),
        items,
    };
}

function cleanFaq(faq = {}) {
    const items = (Array.isArray(faq.items) ? faq.items : [])
        .map((item) => {
            const question = asText(item?.question, LIMITS.short);
            const blocks = (Array.isArray(item?.blocks) ? item.blocks : [])
                .map((block) => {
                    if (block?.type === 'list') {
                        const lines = (Array.isArray(block.items) ? block.items : [])
                            .map((line) => asText(line))
                            .filter(Boolean);
                        return lines.length ? { type: 'list', items: lines } : null;
                    }
                    const text = asText(block?.text);
                    return text ? { type: 'paragraph', text } : null;
                })
                .filter(Boolean);
            if (!question || !blocks.length) return null;
            return { question, blocks };
        })
        .filter(Boolean);
    if (!items.length) return null;
    return {
        title: asText(faq.title, LIMITS.short),
        description: asText(faq.description),
        items,
    };
}

function cleanFinalCta(finalCta = {}) {
    const title = asText(finalCta.title, LIMITS.short);
    const text = asText(finalCta.text);
    if (!title && !text) return null;
    return { title, text };
}

export function normalizeWorkshopContent(input) {
    const source = input && typeof input === 'object' ? input : {};
    const content = {};
    const seoTitle = asText(source.seo?.title, LIMITS.title);
    const seoDescription = asText(source.seo?.description, LIMITS.text);
    const serviceName = asText(source.seo?.serviceName, LIMITS.title);
    if (seoTitle || seoDescription || serviceName) {
        content.seo = { title: seoTitle, description: seoDescription, serviceName };
    }
    const sections = {
        cta: cleanCta(source.cta),
        hero: cleanHero(source.hero),
        gallery: cleanGallery(source.gallery),
        benefits: cleanBenefits(source.benefits),
        process: cleanProcess(source.process),
        instructor: cleanInstructor(source.instructor),
        testimonials: cleanTestimonials(source.testimonials),
        packages: cleanPackages(source.packages),
        faq: cleanFaq(source.faq),
        finalCta: cleanFinalCta(source.finalCta),
    };
    for (const [key, value] of Object.entries(sections)) {
        if (value) content[key] = value;
    }
    return content;
}

export function fromLegacyWorkshop(content) {
    return normalizeWorkshopContent(content);
}

export function preparePublicContent(page) {
    const content = normalizeWorkshopContent(page?.content);
    content.seo = {
        title: content.seo?.title || '',
        description: content.seo?.description || '',
        serviceName: content.seo?.serviceName || '',
        canonical: landingPublicPath(page.slug),
    };
    if (content.cta?.message) {
        content.cta = {
            ...content.cta,
            href: whatsappHref(content.cta.message),
        };
    }
    return content;
}

export function landingShareImage(content) {
    if (content?.hero?.image) {
        return { url: content.hero.image, alt: content.hero.imageAlt || '' };
    }
    if (content?.instructor?.image) {
        return { url: content.instructor.image, alt: content.instructor.imageAlt || '' };
    }
    return null;
}

export function buildLandingMetadata(page) {
    const content = preparePublicContent(page);
    const title = content.seo.title || page.title;
    const description = content.seo.description || '';
    const url = toAbsoluteSiteUrl(content.seo.canonical);
    const image = landingShareImage(content);
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url,
            images: image ? [{ url: image.url, alt: image.alt }] : undefined,
        },
        alternates: {
            canonical: url,
        },
    };
}

export function buildLandingSchema(page) {
    const content = preparePublicContent(page);
    const image = landingShareImage(content);
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: content.seo.serviceName || page.title,
        description: content.seo.description || '',
        url: toAbsoluteSiteUrl(content.seo.canonical),
        ...(image ? { image: toAbsoluteSiteUrl(image.url) } : {}),
        provider: {
            '@type': 'Bakery',
            name: 'Ayala Cakes',
            url: toAbsoluteSiteUrl('/'),
        },
    };
}

export function validateLandingSlug(slug) {
    const value = typeof slug === 'string' ? slug.trim() : '';
    if (!value) return 'יש להזין כתובת באנגלית';
    if (value.length > LIMITS.slug || !SLUG_PATTERN.test(value)) {
        return 'הכתובת יכולה להכיל רק אותיות אנגליות קטנות, מספרים ומקפים';
    }
    if (RESERVED_LANDING_SLUGS.has(value)) {
        return 'הכתובת הזו שמורה לדף קיים באתר';
    }
    return '';
}
