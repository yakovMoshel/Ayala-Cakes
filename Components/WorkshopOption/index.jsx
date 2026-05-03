'use client';
import React from 'react';
import styles from './style.module.scss';

const WorkshopOption = ({
    packageType,
    packageTitle,
    duration,
    emphasis,
    features,
    bonus,
    price,
    color = 'green', // green, blue, pink
    recommended = false,
    badge = null,
    minHeight = null // מינימום גובה בפיקסלים (למשל 500)
}) => {
    const minHeightStyle = minHeight ? { minHeight: `${minHeight}px` } : {};
    const hasMinHeight = minHeight !== null;
    
    return (
        <div 
            className={`${styles.option} ${styles[`option${color.charAt(0).toUpperCase() + color.slice(1)}`]} ${recommended ? styles.recommended : ''} ${hasMinHeight ? styles.hasMinHeight : ''}`}
            style={minHeightStyle}
        >
            {badge && <div className={styles.badge}>{badge}</div>}
            <div className={styles.headerSection}>
                <h3 className={styles.packageHeader}>
                    <span className={styles.packageType}>חבילת {packageType}</span>
                    {packageTitle && <span className={styles.packageTitle}>{packageTitle}</span>}
                </h3>
                <div className={styles.duration}>{duration}</div>
                <div className={styles.emphasis}>{emphasis}</div>
            </div>
            <ul>
                {features.map((feature, index) => (
                    <li 
                        key={index}
                        dangerouslySetInnerHTML={{ __html: feature }}
                    />
                ))}
            </ul>
            {bonus && (
                <div className={styles.bonus}>
                    <p>{bonus}</p>
                </div>
            )}
            <div className={styles.priceContainer}>
                {(() => {
                    // מפרק את המחיר: "180 ₪ למשתתפת" -> "180 ₪" ו-"למשתתפת"
                    const parts = price.split(' ');
                    if (parts.length >= 3) {
                        const amount = parts.slice(0, 2).join(' '); // "180 ₪"
                        const per = parts.slice(2).join(' '); // "למשתתפת"
                        return (
                            <>
                                <div className={styles.amountWrapper}>
                                    <span className={styles.amount}>{amount}</span>
                                    <span className={styles.vat}>+ מע"מ</span>
                                </div>
                                <span className={styles.per}>{per}</span>
                            </>
                        );
                    }
                    // אם הפורמט לא צפוי, מציג את המחיר המלא
                    return (
                        <div className={styles.amountWrapper}>
                            <span className={styles.amount}>{price}</span>
                            <span className={styles.vat}>+ מע"מ</span>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default WorkshopOption;
