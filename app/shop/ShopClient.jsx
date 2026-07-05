'use client'
import { useState, useMemo } from 'react';
import styles from './style.module.scss';
import FilterToolbar from '@/Components/Toolbar';
import ProductsList from '@/Components/ProductsList';

// Client island: products arrive server-rendered from the page,
// this component only handles the interactive filtering UI
export default function ShopClient({ products }) {
    const categories = [
        { label: 'הכל', icon: null, value: '' },
        { label: 'עוגות בנטו', icon: null, value: 'עוגות בנטו' },
        { label: 'עוגת מוס', icon: null, value: 'עוגת מוס' },
        { label: 'מארזים', icon: null, value: 'מארזים' },
        { label: 'עוגות מעוצבות', icon: null, value: 'עוגות מעוצבות' },
    ];
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return products
            .filter(product =>
                (category ? product.category === category : true) &&
                (searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
            );
    }, [products, category, searchTerm]);

    return (
        <div className={styles.shop}>
            <FilterToolbar
                setCategory={setCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
            />
            <div className={styles.content}>
                <ProductsList productByCat={filteredProducts} isLoading={false} />
            </div>
        </div>
    );
}
