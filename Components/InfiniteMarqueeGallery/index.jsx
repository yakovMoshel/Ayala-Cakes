'use client';
import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import styles from './style.module.scss';

const InfiniteMarqueeGallery = ({
    images = [],
    title = '',
    description = '',
    speed = 4000,
    cardWidth = 300,
    cardWidthMobile = 240,
    height = 300,
    heightMobile = 240,
    spaceBetween = 20,
    pauseOnHover = true
}) => {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <section className={styles.gallery}>
            {(title || description) && (
                <div className={styles.galleryHeader}>
                    {title && <h2>{title}</h2>}
                    {description && <p>{description}</p>}
                </div>
            )}
            
            <div className={styles.marqueeContainer}>
                <Swiper
                    spaceBetween={spaceBetween}
                    slidesPerView={'auto'}
                    loop={true}
                    speed={speed}
                    allowTouchMove={true}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: pauseOnHover
                    }}
                    freeMode={true}
                    modules={[Autoplay]}
                    className={styles.marqueeSwiper}
                    style={{
                        '--card-width': `${cardWidth}px`,
                        '--card-width-mobile': `${cardWidthMobile}px`,
                        '--gallery-height': `${height}px`,
                        '--gallery-height-mobile': `${heightMobile}px`
                    }}
                >
                    {images.map((image, index) => (
                        <SwiperSlide key={index} className={styles.marqueeSlide}>
                            <div className={styles.imageCard}>
                                <Image
                                    src={image.src}
                                    alt={image.alt || `Gallery image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 250px, 300px"
                                    style={{ objectFit: 'cover' }}
                                    loading={index < 3 ? 'eager' : 'lazy'}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default InfiniteMarqueeGallery;

