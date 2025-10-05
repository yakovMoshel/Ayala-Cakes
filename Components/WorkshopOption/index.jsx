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
    badge = null
}) => {
    return (
        <div className={`${styles.option} ${styles[`option${color.charAt(0).toUpperCase() + color.slice(1)}`]} ${recommended ? styles.recommended : ''}`}>
            {badge && <div className={styles.badge}>{badge}</div>}
            <div className={styles.headerSection}>
                <h3 className={styles.packageHeader}>
                    <span className={styles.packageType}>חבילת {packageType}</span>
                    {/* <span className={styles.packageTitle}>{packageTitle}</span> */}
                </h3>
                <div className={styles.duration}>{duration}</div>
                <div className={styles.emphasis}>{emphasis}</div>
            </div>
            <ul>
                {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            {/* <div className={styles.bonus}>
                <strong>בסיום הסדנה:</strong>
                <p>{bonus}</p>
            </div> */}
            <div className={styles.price}>{price}</div>
        </div>
    );
};

export default WorkshopOption;
