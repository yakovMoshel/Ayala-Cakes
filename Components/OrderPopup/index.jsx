import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import styles from './style.module.scss';

export default function OrderPopup({ item, onClose }) {
    const [formData, setFormData] = useState({
        productName: item.name,
        size: '',
        flavor: '',
        color: '',
        filling: [],
        glutenFree: false,
        notDairy: false,
        notes: '',
        customerName: '',
        phoneNumber: ''
    });
    const [popupMessage, setPopupMessage] = useState('');
    const [loader, setLoader] = useState(false);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (name, value) => {
        if (name === 'filling') {
            setFormData(prev => ({
                ...prev,
                [name]: prev[name].includes(value)
                    ? prev[name].filter(item => item !== value)
                    : [...prev[name], value]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: !prev[name]
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            const response = await axios.post('/api/send-email', {
                type: 'order',
                orderDetails: {
                    ...formData,
                    filling: formData.filling.join(', '),
                    glutenFree: formData.glutenFree ? 'כן' : 'לא',
                    notDairy: formData.notDairy ? 'כן' : 'לא'
                }
            });
            
            if (response.data.success) {
                setPopupMessage('ההזמנה שלך התקבלה! ניצור איתך קשר בהקדם כדי לסגור את הפרטים.');
            } else {
                setPopupMessage('שגיאה בשליחת ההזמנה. אנא נסה שוב.');
            }
        } catch (error) {
            console.error("Error sending form:", error);
            setPopupMessage('שגיאה בשליחת ההזמנה. אנא נסה שוב.');
        } finally {
            setLoader(false);
        }
    };

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                {!popupMessage ? (
                    <form onSubmit={handleSubmit} className={styles.orderForm}>
                        <h3>פרטי הזמנה</h3>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="size">גודל:</label>
                                <select
                                    id="size"
                                    name="size"
                                    value={formData.size}
                                    onChange={handleSelectChange}
                                    required
                                >
                                    <option value="">בחירת גודל</option>
                                    <option value="קטן">קטן</option>
                                    <option value="בינוני">בינוני</option>
                                    <option value="גדול">גדול</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="flavor">טעם:</label>
                                <select
                                    id="flavor"
                                    name="flavor"
                                    value={formData.flavor}
                                    onChange={handleSelectChange}
                                    required
                                >
                                    <option value="">בחירת טעם</option>
                                    {item.flavors.map(flavor => (
                                        <option key={flavor} value={flavor}>{flavor}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="color">צבע:</label>
                                <select
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleSelectChange}
                                    required
                                >
                                    <option value="">בחירת צבע</option>
                                    {item.colors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>מילוי:</label>
                                <div className={styles.checkboxGroup}>
                                    {item.filling.map(fill => (
                                        <label key={fill}>
                                            <input 
                                                type="checkbox"
                                                name="filling"
                                                value={fill}
                                                checked={formData.filling.includes(fill)}
                                                onChange={() => handleCheckboxChange('filling', fill)}
                                            />
                                            {fill}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>אפשרויות מיוחדות:</label>
                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input 
                                            type="checkbox"
                                            name="glutenFree"
                                            checked={formData.glutenFree}
                                            onChange={() => handleCheckboxChange('glutenFree')}
                                        />
                                        ללא גלוטן
                                    </label>
                                    <label>
                                        <input 
                                            type="checkbox"
                                            name="notDairy"
                                            checked={formData.notDairy}
                                            onChange={() => handleCheckboxChange('notDairy')}
                                        />
                                        ללא חלב
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="notes">הערות:</label>
                                <textarea 
                                    id="notes" 
                                    name="notes" 
                                    value={formData.notes} 
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="customerName">שם:</label>
                                <input 
                                    type="text" 
                                    id="customerName" 
                                    name="customerName" 
                                    value={formData.customerName} 
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phoneNumber">טלפון:</label>
                                <input 
                                    type="tel" 
                                    id="phoneNumber" 
                                    name="phoneNumber" 
                                    value={formData.phoneNumber} 
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>

  {!loader ? 
    <button type="submit" className={styles.submitButton}>
        שליחה
    </button> :
    <div className={styles.loaderContainer}>
        <div className={styles.loader}></div>
    </div>
}

                        <p className={styles.consent}>
                            בשליחת הטופס אני מסכים/ה ל<Link href="/privacy">מדיניות הפרטיות</Link>
                        </p>

                    </form>
                ) : (
                    <div className={styles.messageContainer}>
                        <div className={styles.popupMessage}>
                            {popupMessage}
                            <button onClick={onClose} className={styles.closeButton}></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}