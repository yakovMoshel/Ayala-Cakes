'use client';
import React from 'react';
import styles from './style.module.scss';
import Image from 'next/image';
import { FaComments } from 'react-icons/fa';
import WorkshopOption from '../../Components/WorkshopOption';
import InfiniteMarqueeGallery from '../../Components/InfiniteMarqueeGallery';
import BentoBenefitsGrid from '../../Components/BentoBenefitsGrid';

const BentoWorkshopPage = () => {
    const carouselImages = [
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991228/ayala-media/file_wf3r95.webp',
            alt: 'בנות יוצרות עוגות בנטו בסדנה'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991226/ayala-media/file_cw2orb.webp',
            alt: 'עוגות בנטו מעוצבות מעשה ידי המשתתפות'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991225/ayala-media/file_pllstj.webp',
            alt: 'תהליך למידה והתנסות בסדנת בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991224/ayala-media/file_cubdxc.webp',
            alt: 'עוגות בנטו מרשימות שנוצרו בסדנה'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991222/ayala-media/file_m5xqlx.webp',
            alt: 'תוצרים מרהיבים של המשתתפות'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991220/ayala-media/file_wwcuxr.webp',
            alt: 'עבודה מקצועית על עוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991218/ayala-media/file_nh16ji.webp',
            alt: 'תהליכי עיצוב ועבודה על עוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991217/ayala-media/file_qvwhjj.webp',
            alt: 'עוגות בנטו מעוצבות בסגנונות שונים'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991215/ayala-media/file_mdgurv.webp',
            alt: 'הדגמת טכניקות עיצוב מתקדמות לעוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991212/ayala-media/file_cztkjp.webp',
            alt: 'תוצרים מיוחדים מעוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991209/ayala-media/file_dluyoe.webp',
            alt: 'חוויה יצירתית בסדנת הבנטו'
        }
    ];
    
    return (
        <div className={styles.landingPage} role="main">
            {/* Hero Section */}
            <section className={styles.hero} aria-label="מידע ראשי">
                <div className={styles.heroContainer}>
                    <div className={styles.heroImageWrapper}>
                        <Image
                            src="/images/summer-hero.png"
                            alt="סדנת עוגות בנטו - חוויה יצירתית ומגבשת"
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            loading="eager"
                            className={styles.heroImage}
                        />
                    </div>
                    <div className={styles.heroContent}>
                        <h1>מחפשת את החוויה המושלמת ליום ההולדת?</h1>
                        <p>
                        בואי להעניק לה ולחברות חוויה יצירתית ומגבשת, שבה כל משתתפת יוצרת ומעצבת עוגת בנטו משלה. מקסימום חוויה וגיבוש להן – במינימום מאמץ מצידך!                        </p>
                        <div className={styles.ctaButtons}>
                            <button
                                onClick={() => window.open('https://wa.me/972587995083?text=היי אילה, הגעתי דרך האתר ואשמח לשריין תאריך! 🎈', '_blank')}
                                aria-label="לבדיקת תאריך פנוי בוואטסאפ"
                            >
                                לבדיקת תאריך פנוי 📅
                            </button>
                        </div>
                        <div className={styles.trustBadge}>
                        ⭐ הצטרפי למאות ההורים שכבר חגגו לילדה שלהן עם סדנת בנטו מתוקה                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section - Infinite Marquee */}
            <InfiniteMarqueeGallery
                images={carouselImages}
                title="רגעים מתוקים מהסדנה ✨"
                description="הצצה קטנה לקסם שקורה בסדנה – יצירה, הנאה והמון קצפת"
                speed={4000}
                cardWidth={300}
                cardWidthMobile={240}
                height={300}
                heightMobile={240}
                spaceBetween={20}
                pauseOnHover={true}
            />

            {/* Benefits Section */}
            <BentoBenefitsGrid
                title="✨ מה מחכה למשתתפות?"
                benefits={[
                    {
                        emoji: '🎨',
                        title: 'עולם של קצפות, צבעים וקישוטים',
                        text: 'ורודים, טורקיזים, לבבות, מרשמלו, סוכריות – כל משתתפת יוצרת עוגה בסגנון האישי שלה, עם מגוון קצפות ותוספות טעימות וצבעוניות.'
                    },
                    {
                        emoji: '📦',
                        title: 'תוצר שכיף לקחת הביתה',
                        text: 'כל משתתפת מסיימת את הסדנה עם עוגת בנטו יפיפייה שהיא עצבה בעצמה – ארוזה בקופסה אלגנטית, מתאימה לצילום, להראות ולזלול בגאווה.'
                    },
                    {
                        emoji: '🍰',
                        title: 'עוגת בנטו שכל משתתפת מעצבת בעצמה',
                        text: 'זה לא רק לקשט – זה להרכיב, למלא, לזלף, לכתוב, לבחור צבעים, לבחור תוספות – ולעבור תהליך יצירתי מההתחלה ועד הסוף.'
                    },
                    {
                        emoji: '💖',
                        title: 'חוויה שכל אחת תזכור',
                        text: 'הרבה מעבר לעוגה – זו פעילות מגבשת, נעימה, מרגשת ומשותפת, שמחברת בין הבנות ומעמידה את ילדת יום ההולדת במרכז.'
                    }
                ]}
                columns={4}
                backgroundColor="#f9f9f9"
                iconColor="var(--secColor)"
                highlightMiddle={false}
            />

            {/* Process Section - The Story */}
            <section className={styles.workshopProcess}>
                <div className={styles.processContainer}>
                    
                    {/* <div className={styles.processImage}>
                        <Image
                            src="/images/summer-hero.png"
                            alt="תהליך היצירה בסדנת הבנטו"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: 'cover' }}
                        />
                    </div> */}

                    <div className={styles.processText}>
                        <h2>אז מה באמת קורה בסדנה?</h2>
                        
                        <div className={styles.storyContent}>
                            <p>
                                הקסם מתחיל כשהבנות נכנסות לחדר ורואות שולחן ערוך ומזמין, עם עמדה אישית וציוד מקצועי שמחכה רק להן. אחרי הסבר קצר והדגמה, אנחנו צוללות ישר לעבודה מעשית: כל משתתפת לומדת לעטוף, לזלף ולעצב את העוגה שלה, עם חופש יצירתי מלא לבחור צבעים, צנטרים וקישוטים שעושים שמח בעיניים.
                            </p>
                            <p>
                                אני נמצאת שם לכל אורך הדרך, עוברת בין הבנות, עוזרת ומדייקת כדי שכל עוגה תצא מושלמת. הסדנה נחתמת ברגע שיא חגיגי ומרגש – צילום משותף עם התוצרים המרהיבים, וטקס יום הולדת שבו החוגגת היא הכוכבת הבלתי מעורערת.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* About Instructor Section - The Personal Connection */}
            <section className={styles.aboutInstructor}>
                <div className={styles.aboutContainer}>
                    
                    {/* Image Side - With Special Shape */}
                    <div className={styles.imageWrapper}>
                        <div className={styles.imageFrame}>
                            <Image
                                src="/אילה אברהם.png"
                                alt="אילה אברהם - קונדיטורית ומדריכת סדנאות"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                                priority
                            />
                        </div>
                        {/* Decorative element behind */}
                        <div className={styles.blobDecoration}></div>
                    </div>

                    {/* Text Side */}
                    <div className={styles.textContent}>
                        <h2>נעים להכיר, אני אילה 👩‍🍳</h2>
                        <h3>קונדיטורית ומדריכת סדנאות, שחיה ונושמת את העולם המתוק.</h3>
                        
                        <div className={styles.bioText}>
                            <p>
                            בשנים האחרונות ליוויתי מאות ילדות בסדנאות בנטו, המשלבות ידע מקצועי וחווייתי, יחד עם גישה סבלנית ובגובה העיניים בהתאם לגיל המשתתפות. אני שם בשביל לתת להן ביטחון, לעזור למי שמתקשה, ולדאוג שילדת יום ההולדת תרגיש בעננים.
                            </p>
                            <p className={styles.highlightParagraph}>
                            המטרה שלי שכל ילדה תצא מהסדנה עם עיניים נוצצות, גאה ביצירה שלה ושמחה על החוויה שעברה עם החברות שלה.                            </p>
                        </div>

                        <div className={styles.signature}>
                            מחכה לפגוש אתכן, אילה ❤️
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof - The Wall of Love (WhatsApp Style) */}
            <section className={styles.socialProof}>
                <div className={styles.sectionHeader}>
                    <h2>מה המשתתפות אומרות? 💬</h2>
                    <p>הודעות אמיתיות שקיבלתי אחרי סדנאות (החלק הכי כיפי בעבודה שלי)</p>
                </div>

                <div className={styles.wallOfLove}>
                    {/* הודעה 1 - אמא (מלוטש) */}
                    <div className={`${styles.messageBubble} ${styles.momBubble}`}>
                        <div className={styles.messageHeader}>
                            <span className={styles.senderName}>רוית</span>
                            <span className={styles.roleTag}>אמא לחוגגת</span>
                        </div>
                        <p>"החשש הכי גדול שלי היה הבלאגן, אבל הבית נשאר מבריק! אילה תקתקה הכל. הבנות היו מרותקות שעתיים. שווה כל שקל."</p>
                        <span className={styles.time}>18:30</span>
                    </div>

                    {/* הודעה 2 - ילדה (סלנג/וואטסאפ) */}
                    <div className={`${styles.messageBubble} ${styles.girlBubble}`}>
                        <div className={styles.messageHeader}>
                            <span className={styles.senderName}>נועה (12)</span>
                            <span className={styles.roleTag}>ילדת יום הולדת</span>
                        </div>
                        <p>ואוו אילה היה נדיררר!!! 😍 כל החברות שלי עפו על העוגות. הכי כיף שעשינו הכל לבד. תודה!!</p>
                        <span className={styles.time}>20:15</span>
                    </div>

                    {/* הודעה 3 - אמא (אותנטי/קצר) */}
                    <div className={`${styles.messageBubble} ${styles.momBubble}`}>
                        <div className={styles.messageHeader}>
                            <span className={styles.senderName}>מירי</span>
                            <span className={styles.roleTag}>אמא לחוגגת</span>
                        </div>
                        <p>אילה תקשיבי אין דברים כמוך!! מאיה בעננים, לא מפסיקה לדבר על העוגה ועל איך היה כיף. תודה על הסבלנות את מהממת ❤️</p>
                        <span className={styles.time}>19:45</span>
                    </div>

                    {/* הודעה 4 - משתתפת (גאווה) */}
                    <div className={`${styles.messageBubble} ${styles.guestBubble}`}>
                        <div className={styles.messageHeader}>
                            <span className={styles.senderName}>עמית</span>
                            <span className={styles.roleTag}>משתתפת</span>
                        </div>
                        <p>חשבתי שאני גרועה במטבח אבל יצאה לי עוגה מושלמתתת 😱 לא רציתי לאכול אותה בסוף מרוב שהיא יפה!</p>
                        <span className={styles.time}>17:20</span>
                    </div>

                    {/* הודעה 5 - אמא (פרקטי) */}
                    <div className={`${styles.messageBubble} ${styles.momBubble}`}>
                        <div className={styles.messageHeader}>
                            <span className={styles.senderName}>דנה</span>
                            <span className={styles.roleTag}>אמא לחוגגת</span>
                        </div>
                        <p>היי אילה, רציתי להגיד תודה ענקית. היה מושלם, הבית נשאר נקי (הכי חשוב 😂) והבנות נהנו בטירוף. נתראה בשנה הבאה 😉</p>
                        <span className={styles.time}>21:00</span>
                    </div>

                    {/* הודעה 6 - ילדה (קצר) */}
                    <div className={`${styles.messageBubble} ${styles.girlBubble}`}>
                        <div className={styles.messageHeader}>
                            <span className={styles.senderName}>אגם</span>
                            <span className={styles.roleTag}>משתתפת</span>
                        </div>
                        <p>היה לי כיף ברמות, נהניתי להכיר אותך וללמוד. חבל שנגמר!</p>
                        <span className={styles.time}>16:50</span>
                    </div>
                </div>
            </section>

            {/* Course Options */}
            <section id="packages" className={styles.courseOptions}>
                <div className={styles.pricingHeader}>
                    <h2>איזו חגיגה מתאימה לך? 🎂</h2>
                    <p>בחרי את המסלול המדויק לאירוע שלך. לא משנה מה תבחרי – כולן יוצאות עם עוגה!</p>
                </div>
                <div className={styles.optionsGrid}>
                    {/* Basic - טעימה ראשונה */}
                    <WorkshopOption
                        packageType="בייסיק"
                        duration="טעימה ראשונה באורך של עד שעה"
                        emphasis="המסלול המושלם לפעילות קלילה וחמודה"
                        features={[
                            "🍰 עוגת בנטו בטעם וניל בקוטר 10 ס''מ",
                            "🎨 קצפת לבנה + צבע נוסף",
                            "🍬 3 תוספות קישוט",
                            "👩‍🍳 ערכת עבודה אישית",
                            "מינימום 10 משתתפות"
                        ]}
                        price="180 ₪ למשתתפת"
                        color="green"
                        minHeight={450}

                    />

                    {/* Classic - החוויה המתוקה */}
                    <WorkshopOption
                        packageType="קלאסיק"
                        duration="החוויה המתוקה באורך של עד שעה וחצי"
                        emphasis="המסלול המבוקש לחגיגת יום הולדת קלאסית"
                        features={[
                            "✨ כל מה שמקבלים בחבילת הבייסיק, ובנוסף:",
                            "🍫 אפשרות לעוגת שוקולד / וניל",
                            "🎨 עד 5 צבעי קצפת",
                            "🍬 6 תוספות קישוט",
                            "🎉 טכניקות קישוט מתקדמות",
                            "מינימום 8 משתתפות"
                        ]}
                        price="220 ₪ למשתתפת"
                        color="blue"
                        recommended={true}
                        badge="מומלצת!"
                        minHeight={480}
                    />

                    {/* Premium - החגיגה המלאה */}
                    <WorkshopOption
                        packageType="פרימיום"
                        duration="החגיגה המלאה באורך של עד שעתיים"
                        emphasis="החוויה המלאה עם כל הפינוקים"
                        features={[
                            "✨ כל מה שמקבלים בחבילת הקלאסיק, ובנוסף:",
                            "🎂 עוגת בנטו גדולה (12 ס״מ)",
                            "🎁 מארז עוגה שקוף מהמם",
                            "✏️ עבודה עם צימקאו לכתיבה",
                            "📸 טקס עוגה חגיגי במתנה!",
                            "מינימום 6 משתתפות",
                        ]}
                        price="270 ₪ למשתתפת"
                        color="pink"
                        minHeight={450}

                    />
                </div>
                <div className={styles.optionsSummary}>
                    <h3>כל משתתפת יוצאת עם עוגה שהרכיבה ועיצבה בעצמה, ארוזה יפה ועם חיוך ענק</h3>
                </div>


            </section>



            {/* FAQ Section - Full & Detailed */}
            <section className={styles.faq}>
                <div className={styles.sectionHeader}>
                    <h2>שאלות שכנראה יש לך כרגע💬</h2>
                    <p>כל מה שרצית לדעת על הסדנה</p>
                </div>

                <div className={styles.faqContainer}>
                    
                    {/* Q1: What is Bento */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>🍰 מה זו בכלל עוגת בנטו?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>עוגת בנטו היא עוגה אישית, בגודל קטן ומושלם (כ-10 ס"מ), המעוצבת בצורה מושקעת ומרשימה – כאילו יצאה מאינסטגרם. היא נארזת בקופסת בנטו מתוקה ואלגנטית, ונראית כאילו נולדה לצילום 🎀. היא מתאימה בול לילדות שרוצות משהו מיוחד, אישי ואסתטי – גם טעים וגם מהמם.</p>
                        </div>
                    </details>

                    {/* Q2: Who is it for */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>🎉 למי הסדנה מתאימה?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>בעיקר ליום הולדת לבנות, למי שרוצה להשקיע ומי שמחפשת פעילות חווייתית ומהנה עם סדנה מעשית – אבל לא רק! הסדנה מושלמת גם לערבי גיבוש, מפגש חברות, ימי כיף, מסיבת סיום, או כל פעילות משותפת. היא מתאימה לגילאי 10 ומעלה, עם דגש על בנות 12–14.</p>
                        </div>
                    </details>

                    {/* Q3: What girls do */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>🎨 מה הבנות עושות בסדנה?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <ul>
                                <li>לומדות על הכלים, הקצפות והחומרים</li>
                                <li>צופות בהדגמה חיה של שלב ראשון</li>
                                <li>מרכיבות עוגה אמיתית בעצמן – כולל מילוי, עיטוף וזילוף</li>
                                <li>בוחרות תוספות צבעוניות וקישוטים מיוחדים</li>
                                <li>מקשטות עם צימקאו – כותבות שם, ברכה או ציור</li>
                                <li>אורזות את העוגה בקופסה אישית ויוצאות עם חיוך ענק</li>
                            </ul>
                        </div>
                    </details>

                    {/* Q4: Location */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>🏡 איפה מתקיימת הסדנה?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>אצלכן בבית, או בכל מקום שתבחרו. אני מגיעה עם כל הציוד הנדרש – ערכות, קישוטים, עוגות, כלים – ומביאה איתי את כל החוויה עד אליכן.</p>
                        </div>
                    </details>

                    {/* Q5: Duration */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>🕐 כמה זמן נמשכת הסדנה?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>זה תלוי מאוד בילדות עצמן ובהספק שלהן. בגדול יש שלוש אפשרויות לבחירה: עד שעה, שעה וחצי, או שעתיים (תלוי בחבילה). אם תרצו אורך אחר – דברו איתי ונתאים את הסדנה בדיוק למה שנכון לכן.</p>
                        </div>
                    </details>

                    {/* Q6: Prices & Included */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>💸 מה המחירים ומה כלול?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>המחירים מפורטים למעלה בחבילות, אך חשוב לדעת:</p>
                            <ul>
                                <li>המחיר עשוי להשתנות לפי מספר המשתתפות בפועל.</li>
                                <li>עוגת הטקס החגיגית – אינה כלולה במחיר החבילות הבסיסיות (ניתן להוסיף בתשלום).</li>
                                <li>יש אפשרות לתוספות בתשלום: זמן נוסף, קישוטים מיוחדים ועוגות מעוצבות.</li>
                            </ul>
                        </div>
                    </details>

                    {/* Q7: Tsimkao */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>✏️ מה זה קישוט עם צימקאו?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>צימקאו הוא שוקולד המיועד לעבודה בעיטור. במהלך הסדנה נלמד איך לקשט איתו את העוגה – למשל בכתיבת שמות, ברכות, איחולים או ציורים חמודים. זה מוסיף טאץ' אישי מהמם לכל עוגה!</p>
                        </div>
                    </details>

                    {/* Q8: Participant Gets */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>🧁 מה כל משתתפת מקבלת?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <ul>
                                <li>עוגת בנטו מהממת שהיא עיצבה בעצמה</li>
                                <li>קופסה אישית ואלגנטית</li>
                                <li>תוצאה שהיא גאה בה</li>
                                <li>חוויה מגבשת, מהנה, אישית ומלאת השראה</li>
                            </ul>
                        </div>
                    </details>

                    {/* Q9: Birthday Girl */}
                    <details className={styles.faqItem}>
                        <summary>
                            <span className={styles.question}>👑 מה ילדת יום ההולדת מקבלת?</span>
                            <span className={styles.icon}>▼</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>אפשר להזמין עבורה עוגת יום הולדת מעוצבת גדולה (בתוספת תשלום). בנוסף, בחבילת הפרימיום אני נשארת ומובילה טקס עוגה חגיגי – עם כיבוי נרות, שיר, תמונות ורגע מרגש. הכול באהבה ובלי לחץ – כדי להפוך את הרגע לבלתי נשכח 💖</p>
                        </div>
                    </details>

                </div>
            </section>

            {/* Final CTA Section - The Closer */}
            <section className={styles.finalCta}>
                <div className={styles.ctaContainer}>
                    <h2>מוכנה לחגוג לה יום הולדת מושלם?</h2>
                    <p>בואי נשריין את התאריך המבוקש ליום המיוחד של הבת שלך.</p>
                    
                    <button 
                        className={styles.pulsingButton}
                        onClick={() => window.open('https://wa.me/972587995083?text=היי אילה, הגעתי דרך האתר ואשמח לשריין תאריך! 🎈', '_blank')}
                    >
                        לשריון תאריך בוואטסאפ 📅
                    </button>
                </div>
                
                {/* אלמנטים דקורטיביים עדינים ברקע */}
                <div className={styles.decorationCircle1}></div>
                <div className={styles.decorationCircle2}></div>
            </section>

            {/* Mobile Sticky CTA */}
            <div className={styles.stickyCtaMobile}>
                <button onClick={() => window.open('https://wa.me/972587995083?text=היי אילה, הגעתי דרך האתר ואשמח לשריין תאריך! 🎈', '_blank')}>
                    <FaComments />
                    דברו איתי
                </button>
            </div>
        </div>
    );
};

export default BentoWorkshopPage; 