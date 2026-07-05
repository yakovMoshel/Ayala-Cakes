'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './style.module.scss';

export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [isEnlarged, setIsEnlarged] = useState(false);

  const toggleEnlarged = () => {
    setIsEnlarged(!isEnlarged);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage} onClick={toggleEnlarged}>
        {/* CSS sizes the rendered box (350x350); priority = product page LCP */}
        <Image
          src={selectedImage}
          alt="תמונת המוצר"
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
              alt={`תמונת מוצר ${index + 1}`}
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
            alt="תמונת המוצר מוגדלת"
            width={1200}
            height={1200}
            sizes="100vw"
          />
        </div>
      )}
    </div>
  );
}
