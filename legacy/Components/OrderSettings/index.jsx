"use client";
import React, { useState } from 'react';
import axios from 'axios';
import PopUp from '../popUp';

import styles from './style.module.scss';

export default function OrderSettings({ product }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedFlavor, setSelectedFlavor] = useState('');
    const [notes, setNotes] = useState('');

    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [popupMessage, setPopupMessage] = useState(''); 


    const handleSizeChange = (e) => setSelectedSize(e.target.value);
    const handleColorChange = (e) => setSelectedColor(e.target.value);
    const handleFlavorChange = (e) => setSelectedFlavor(e.target.value);
    const handleQuantityChange = (e) => setQuantity(e.target.value);
    const handleNotesChange = (e) => setNotes(e.target.value);

    const handleNameChange = (e) => setCustomerName(e.target.value);
    const handlePhoneChange = (e) => setPhoneNumber(e.target.value);

    const sendEmailToManager = async () => {
        const orderDetails = {
            productName: product.name,
            size: selectedSize,
            color: selectedColor,
            flavor: selectedFlavor,
            quantity: quantity,
            notes: notes,
            customerName: customerName,
            phoneNumber: phoneNumber
        };

        try {
            const response = await axios.post('/api/send-email', {
                orderDetails: orderDetails
            });
            if (response.data.success) {
                setPopupMessage('ההזמנה נשלחה בהצלחה!');
            } else {
                setPopupMessage('שגיאה בשליחת ההזמנה');
            }
        } catch (error) {
            alert('שגיאה בשליחת ההזמנה');
        }
    };


    const closePopup = () => setPopupMessage('');  
    return (
        <div className={styles.orderSettings}>

            <PopUp message={popupMessage} onClose={closePopup} />
            <h3>בחר גודל:</h3>
            <div className={styles.options}>
                <div>
                    <input type="radio" id="small" name="size" value="small"
                        checked={selectedSize === 'small'} onChange={handleSizeChange} />
                    <label htmlFor="small">קטן</label>
                </div>
                <div>
                    <input type="radio" id="medium" name="size" value="medium"
                        checked={selectedSize === 'medium'} onChange={handleSizeChange} />
                    <label htmlFor="medium">בינוני</label>
                </div>
                <div>
                    <input type="radio" id="large" name="size" value="large"
                        checked={selectedSize === 'large'} onChange={handleSizeChange} />
                    <label htmlFor="large">גדול</label>
                </div>
            </div>

            <h3>בחר צבע:</h3>
            <div className={styles.options}>
                {product.colors.map((color) => (
                    <div key={color}>
                        <input type="radio" id={color} name="color" value={color}
                            checked={selectedColor === color} onChange={handleColorChange} />
                        <label htmlFor={color}>{color}</label>
                    </div>
                ))}
            </div>

            <h3>בחר טעם:</h3>
            <div className={styles.options}>
                {product.flavors.map((flavor) => (
                    <div key={flavor}>
                        <input type="radio" id={flavor} name="flavor" value={flavor}
                            checked={selectedFlavor === flavor} onChange={handleFlavorChange} />
                        <label htmlFor={flavor}>{flavor}</label>
                    </div>
                ))}
            </div>

            <h3>בחר כמות:</h3>
            <div className={styles.quantity}>
                <button className={styles.buttonQuantity}
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>

                <input type="number" id="quantity" name="quantity"
                    min="1" max={product.stock} value={quantity}
                    onChange={handleQuantityChange} />

                <button className={styles.buttonQuantity}
                    onClick={() => quantity < product.stock && setQuantity(quantity + 1)}>+</button>
            </div>

            <h3>הערות:</h3>
            <textarea value={notes}
                onChange={handleNotesChange}
                className={styles.notes} placeholder="הכנס הערות כאן..." />

            <h3>שם הלקוח:</h3>
            <input
                type="text"
                value={customerName}
                onChange={handleNameChange}
                className={styles.inputField}
                placeholder="הכנס את שמך"
            />

            <h3>מספר טלפון:</h3>
            <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={styles.inputField}
                placeholder="הכנס את מספר הטלפון שלך"
            />

            <button className={styles.orderButton}
                onClick={sendEmailToManager}>
                שלח הזמנה
            </button>
        </div>
    );
}
