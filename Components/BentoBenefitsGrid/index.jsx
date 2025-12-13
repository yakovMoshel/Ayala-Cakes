'use client';
import React from 'react';
import styles from './style.module.scss';

const BentoBenefitsGrid = ({
    title = '',
    benefits = [],
    columns = 3,
    backgroundColor = 'var(--grayColor)',
    iconColor = 'var(--secColor)',
    highlightMiddle = false
}) => {
    if (!benefits || benefits.length === 0) {
        return null;
    }

    return (
        <section className={styles.benefits} style={{ '--bg-color': backgroundColor }}>
            <div className={styles.benefitsContent}>
                {title && <h2>{title}</h2>}
                
                <div 
                    className={styles.benefitsGrid}
                    style={{ 
                        '--columns': columns,
                        '--icon-color': iconColor
                    }}
                >
                    {benefits.map((benefit, index) => {
                        const isMiddle = highlightMiddle && index === Math.floor(benefits.length / 2);
                        const IconComponent = benefit.icon;
                        const emoji = benefit.emoji;
                        
                        return (
                            <div 
                                key={index} 
                                className={`${styles.benefitCard} ${isMiddle ? styles.highlighted : ''}`}
                            >
                                <div className={styles.benefitIcon}>
                                    {emoji ? (
                                        <span className={styles.emojiIcon}>{emoji}</span>
                                    ) : (
                                        IconComponent && <IconComponent />
                                    )}
                                </div>
                                <div className={styles.benefitText}>
                                    {benefit.title && <h3>{benefit.title}</h3>}
                                    {benefit.text && <p>{benefit.text}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default BentoBenefitsGrid;

