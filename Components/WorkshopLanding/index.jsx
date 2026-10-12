'use client';

import React from 'react';
import Image from 'next/image';
import { FaComments } from 'react-icons/fa';
import WorkshopOption from '@/Components/WorkshopOption';
import InfiniteMarqueeGallery from '@/Components/InfiniteMarqueeGallery';
import BentoBenefitsGrid from '@/Components/BentoBenefitsGrid';
import styles from './style.module.scss';

// Testimonial bubble styles: mom, girl, guest
const bubbleClass = {
    mom: styles.momBubble,
    girl: styles.girlBubble,
    guest: styles.guestBubble,
};

const openWhatsApp = (href) => {
    window.open(href, '_blank');
};

const WorkshopLanding = ({ content }) => {
    const {
        cta,
        hero,
        gallery,
        benefits,
        process,
        instructor,
        testimonials,
        packages,
        faq,
        finalCta,
    } = content;

    return (
        <div className={styles.landingPage} role="main">
            {/* Hero */}
            {(hero?.image || hero?.title || hero?.text) && (
                <section className={styles.hero} aria-label="מידע ראשי">
                    <div className={`${styles.heroContainer} ${hero.image ? '' : styles.heroTextOnly}`}>
                        {hero.image && (
                            <div className={styles.heroImageWrapper}>
                                <Image
                                    src={hero.image}
                                    alt={hero.imageAlt}
                                    fill
                                    sizes="(max-width: 968px) 100vw, 640px"
                                    style={{ objectFit: 'cover' }}
                                    priority
                                    className={styles.heroImage}
                                />
                            </div>
                        )}
                        <div className={styles.heroContent}>
                            {hero.title && <h1>{hero.title}</h1>}
                            {hero.text && <p>{hero.text}</p>}
                            {cta?.href && cta?.heroLabel && (
                                <div className={styles.ctaButtons}>
                                    <button
                                        onClick={() => openWhatsApp(cta.href)}
                                        aria-label={cta.heroAriaLabel}
                                    >
                                        {cta.heroLabel}
                                    </button>
                                </div>
                            )}
                            {hero.trust && <div className={styles.trustBadge}>{hero.trust}</div>}
                        </div>
                    </div>
                </section>
            )}

            {/* Gallery */}
            {gallery?.images?.length > 0 && (
                <InfiniteMarqueeGallery
                    images={gallery.images}
                    title={gallery.title}
                    description={gallery.description}
                    eagerCount={hero?.image ? 0 : 1}
                    speed={4000}
                    cardWidth={300}
                    cardWidthMobile={240}
                    height={300}
                    heightMobile={240}
                    spaceBetween={20}
                    pauseOnHover={true}
                />
            )}

            {/* Benefits */}
            {benefits?.items?.length > 0 && (
                <BentoBenefitsGrid
                    title={benefits.title}
                    benefits={benefits.items}
                    columns={4}
                    backgroundColor="#f9f9f9"
                    iconColor="var(--secColor)"
                    highlightMiddle={false}
                />
            )}

            {/* Process */}
            {process?.paragraphs?.length > 0 && (
                <section className={styles.workshopProcess}>
                    <div className={styles.processContainer}>
                        <div className={styles.processText}>
                            {process.title && <h2>{process.title}</h2>}
                            <div className={styles.storyContent}>
                                {process.paragraphs.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Instructor */}
            {(instructor?.image || instructor?.title || instructor?.paragraphs?.length) && (
                <section className={styles.aboutInstructor}>
                    <div className={styles.aboutContainer}>
                        {instructor.image && (
                            <div className={styles.imageWrapper}>
                                <div className={styles.imageFrame}>
                                    <Image
                                        src={instructor.image}
                                        alt={instructor.imageAlt}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: 'cover' }}
                                        priority
                                    />
                                </div>
                                <div className={styles.blobDecoration}></div>
                            </div>
                        )}
                        <div className={styles.textContent}>
                            {instructor.title && <h2>{instructor.title}</h2>}
                            {instructor.subtitle && <h3>{instructor.subtitle}</h3>}
                            {instructor.paragraphs?.length > 0 && (
                                <div className={styles.bioText}>
                                    {instructor.paragraphs.map((paragraph) => (
                                        <p
                                            key={paragraph.text}
                                            className={paragraph.highlight ? styles.highlightParagraph : undefined}
                                        >
                                            {paragraph.text}
                                        </p>
                                    ))}
                                </div>
                            )}
                            {instructor.signature && (
                                <div className={styles.signature}>{instructor.signature}</div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            {testimonials?.items?.length > 0 && (
                <section className={styles.socialProof}>
                    {(testimonials.title || testimonials.description) && (
                        <div className={styles.sectionHeader}>
                            {testimonials.title && <h2>{testimonials.title}</h2>}
                            {testimonials.description && <p>{testimonials.description}</p>}
                        </div>
                    )}
                    <div className={styles.wallOfLove}>
                        {testimonials.items.map((item) => (
                            <div
                                key={`${item.name}-${item.time}`}
                                className={`${styles.messageBubble} ${bubbleClass[item.variant] || ''}`}
                            >
                                <div className={styles.messageHeader}>
                                    <span className={styles.senderName}>{item.name}</span>
                                    <span className={styles.roleTag}>{item.role}</span>
                                </div>
                                <p>{item.text}</p>
                                {item.time && <span className={styles.time}>{item.time}</span>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Packages */}
            {packages?.items?.length > 0 && (
                <section id="packages" className={styles.courseOptions}>
                    {(packages.title || packages.description) && (
                        <div className={styles.pricingHeader}>
                            {packages.title && <h2>{packages.title}</h2>}
                            {packages.description && <p>{packages.description}</p>}
                        </div>
                    )}
                    <div className={styles.optionsGrid}>
                        {packages.items.map((item) => (
                            <WorkshopOption
                                key={item.packageType}
                                packageType={item.packageType}
                                duration={item.duration}
                                emphasis={item.emphasis}
                                features={item.features}
                                bonus={item.bonus}
                                price={item.price}
                                color={item.color}
                                recommended={item.recommended}
                                badge={item.badge}
                                minHeight={item.minHeight}
                            />
                        ))}
                    </div>
                    {packages.summary && (
                        <div className={styles.optionsSummary}>
                            <h3>{packages.summary}</h3>
                        </div>
                    )}
                </section>
            )}

            {/* FAQ */}
            {faq?.items?.length > 0 && (
                <section className={styles.faq}>
                    {(faq.title || faq.description) && (
                        <div className={styles.sectionHeader}>
                            {faq.title && <h2>{faq.title}</h2>}
                            {faq.description && <p>{faq.description}</p>}
                        </div>
                    )}
                    <div className={styles.faqContainer}>
                        {faq.items.map((item) => (
                            <details key={item.question} className={styles.faqItem}>
                                <summary>
                                    <span className={styles.question}>{item.question}</span>
                                    <span className={styles.icon}>▼</span>
                                </summary>
                                <div className={styles.answer}>
                                    {(item.blocks || []).map((block) =>
                                        block.type === 'list' ? (
                                            <ul key={block.items?.[0] || 'list'}>
                                                {(block.items || []).map((line) => (
                                                    <li key={line}>{line}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p key={block.text}>{block.text}</p>
                                        )
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            )}

            {/* Closing call to action */}
            {(finalCta?.title || finalCta?.text) && (
                <section className={styles.finalCta}>
                    <div className={styles.ctaContainer}>
                        {finalCta.title && <h2>{finalCta.title}</h2>}
                        {finalCta.text && <p>{finalCta.text}</p>}
                        {cta?.href && cta?.finalLabel && (
                            <button
                                className={styles.pulsingButton}
                                onClick={() => openWhatsApp(cta.href)}
                            >
                                {cta.finalLabel}
                            </button>
                        )}
                    </div>
                    <div className={styles.decorationCircle1}></div>
                    <div className={styles.decorationCircle2}></div>
                </section>
            )}

            {/* Mobile sticky call to action */}
            {cta?.href && cta?.stickyLabel && (
                <div className={styles.stickyCtaMobile}>
                    <button onClick={() => openWhatsApp(cta.href)}>
                        <FaComments />
                        {cta.stickyLabel}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkshopLanding;
