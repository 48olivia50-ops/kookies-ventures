'use client';

import React, { useState, useEffect } from 'react';
import styles from './heroSlider.module.css';

const heroSlides = [
    {
        id: 1,
        title: 'New Arrivals',
        subtitle: 'Discover our latest collection',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: '✨',
    },
    {
        id: 2,
        title: 'Summer Collection',
        subtitle: 'Light, breezy styles for warm days',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        icon: '☀️',
    },
    {
        id: 3,
        title: 'Premium Quality',
        subtitle: 'Crafted with care, built to last',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        icon: '💎',
    },
    {
        id: 4,
        title: 'Limited Edition',
        subtitle: 'Exclusive pieces, limited quantities',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        icon: '🌟',
    },
];

export function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.sliderContainer}>
            <div className={styles.slidesWrapper}>
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                        style={{ background: slide.gradient }}
                    >
                        <div className={styles.slideContent}>
                            <span className={styles.slideIcon}>{slide.icon}</span>
                            <h3 className={styles.slideTitle}>{slide.title}</h3>
                            <p className={styles.slideSubtitle}>{slide.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.dots}>
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
