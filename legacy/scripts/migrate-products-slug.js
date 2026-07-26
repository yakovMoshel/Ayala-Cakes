/**
 * סקריפט מיגרציה להוספת slug לכל המוצרים הקיימים
 * רק למוצרים שאין להם slug עדיין
 */

const { connectToMongo } = require('../server/DL/connectToMongo.js');
const { productModel } = require('../server/DL/Models/productModel.js');
const { createSlugFromHebrew, ensureUniqueSlug } = require('../utils/slugUtils.js');

async function migrateProductSlugs() {
  try {
    await connectToMongo();
    console.log('התחברנו למסד הנתונים');

    // מוצא את כל המוצרים ללא slug
    const productsWithoutSlug = await productModel.find({ 
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] 
    });

    console.log(`נמצאו ${productsWithoutSlug.length} מוצרים ללא slug`);

    if (productsWithoutSlug.length === 0) {
      console.log('כל המוצרים כבר יש להם slug!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // פונקציה לבדיקת קיום slug
    const checkSlugExists = async (slug) => {
      const existing = await productModel.findOne({ slug });
      return !!existing;
    };

    for (const product of productsWithoutSlug) {
      try {
        console.log(`מעבד מוצר: ${product.name}`);
        
        const baseSlug = createSlugFromHebrew(product.name);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, checkSlugExists);
        
        await productModel.findByIdAndUpdate(product._id, { slug: uniqueSlug });
        
        console.log(`✅ נוצר slug: ${uniqueSlug} עבור ${product.name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ שגיאה עבור מוצר ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== סיכום המיגרציה ===');
    console.log(`✅ הצלחות: ${successCount}`);
    console.log(`❌ כשלונות: ${errorCount}`);
    console.log(`📊 סה"כ: ${successCount + errorCount}`);

    if (successCount > 0) {
      console.log('\n🎉 המיגרציה הושלמה בהצלחה!');
      console.log('עכשיו כל המוצרים החדשים יקבלו slug אוטומטית');
    }

  } catch (error) {
    console.error('שגיאה כללית במיגרציה:', error);
  } finally {
    process.exit(0);
  }
}

// הרצת המיגרציה
migrateProductSlugs(); 