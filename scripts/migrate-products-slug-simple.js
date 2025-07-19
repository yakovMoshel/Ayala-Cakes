/**
 * סקריפט מיגרציה פשוט להוספת slug לכל המוצרים הקיימים
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🚀 מתחיל את מיגרציית ה-Slugs...');

async function runMigration() {
  try {
    // פונקציה ליצירת slug מטקסט עברי (מוטמעת בסקריפט)
    function createSlugFromHebrew(text) {
      if (!text) return '';
      
      const hebrewToEnglish = {
        'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
        'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
        'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'p',
        'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
      };

      return text
        .toLowerCase()
        .split('')
        .map(char => hebrewToEnglish[char] || char)
        .join('')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // פונקציה לייחודיות slug
    async function ensureUniqueSlug(baseSlug, productModel) {
      let slug = baseSlug;
      let counter = 1;
      
      while (await productModel.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return slug;
    }

    // התחברות למסד נתונים
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayalacakes';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ התחברנו למסד הנתונים');

    // הגדרת מודל מוצר
    const productSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    // מציאת מוצרים ללא slug
    const productsWithoutSlug = await Product.find({ 
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] 
    });

    console.log(`📦 נמצאו ${productsWithoutSlug.length} מוצרים ללא slug`);

    if (productsWithoutSlug.length === 0) {
      console.log('🎉 כל המוצרים כבר יש להם slug!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const product of productsWithoutSlug) {
      try {
        console.log(`📝 מעבד: ${product.name}`);
        
        const baseSlug = createSlugFromHebrew(product.name);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, Product);
        
        await Product.findByIdAndUpdate(product._id, { slug: uniqueSlug });
        
        console.log(`✅ נוצר: ${uniqueSlug}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ שגיאה עבור ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== 📊 סיכום המיגרציה ===');
    console.log(`✅ הצלחות: ${successCount}`);
    console.log(`❌ כשלונות: ${errorCount}`);
    console.log(`📈 סה"כ: ${successCount + errorCount}`);

    if (successCount > 0) {
      console.log('\n🎉 המיגרציה הושלמה בהצלחה!');
    }

  } catch (error) {
    console.error('💥 שגיאה כללית:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 ניתוק מהמסד נתונים');
    process.exit(0);
  }
}

runMigration(); 