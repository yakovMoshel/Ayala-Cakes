'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './style.module.scss';
import { productImageAlt } from '@/utils/productImageAlt';

export default function ImageGallery({ images, name = '', altText = '', imageAlts = [] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const altFor = (image) => {
    const index = images.indexOf(image);
    const meta = index >= 0 ? imageAlts[index] : null;
    return productImageAlt({
      name,
      altText: meta?.alt || altText,
      decorative: Boolean(meta?.decorative),
    });
  };
  const alt = altFor(selectedImage);

  const toggleEnlarged = () => {
    setIsEnlarged(!isEnlarged);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage} onClick={toggleEnlarged}>
        {/* CSS sizes the rendered box (350x350); priority = product page LCP */}
        <Image
          src={selectedImage}
          alt={alt}
          width={700}
          height={700}
          sizes="350px"
          priority
        />
      </div>
      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <div
            key={index}
            className={styles.thumbnail}
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image}
              alt={altFor(image)}
              width={200}
              height={200}
              sizes="100px"
            />
          </div>
        ))}
      </div>
      {isEnlarged && (
        <div className={styles.enlargedView} onClick={toggleEnlarged}>
          <Image
            src={selectedImage}
            alt={alt}
            width={1200}
            height={1200}
            sizes="100vw"
          />
        </div>
      )}
    </div>
  );
}
