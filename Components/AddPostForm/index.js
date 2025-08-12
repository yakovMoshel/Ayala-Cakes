"use client"
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Info,
  ChevronDown, 
  ChevronUp,
  Search,
  Link as LinkIcon,
  Share2,
  Type,
  FileText,
  Edit3,
  Image,
  Smartphone,
  Send
} from 'lucide-react';
import styles from './style.module.scss';
const MediaPickerModal = dynamic(() => import('@/Components/MediaPickerModal'), { ssr: false });

// Load React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p className={styles.editorLoading}>טוען עורך...</p>
});

// SEO guidelines for various fields - updated to 2025 standards
const SEO_GUIDELINES = {
  title: { min: 30, max: 70, optimal: 55 }, // Updated: Yoast allows up to 70 chars in some cases
  seoTitle: { min: 30, max: 70, optimal: 55 },
  metaDescription: { min: 120, max: 155, optimal: 145 }, // Updated: Yoast recommends 155 max
  // Content is now measured in WORDS, not characters
  content: { min: 300, max: null, optimal: 900 }, // Updated: 300 words min, 900+ optimal
  summary: { min: 100, max: 155, optimal: 130 },
  focusKeyword: { min: 1, max: 4, optimal: 2 }, // For natural, not forced keyword phrases
  
  // New guidelines for additional SEO factors
  headings: { min: 2, max: null, optimal: 4 }, // At least 2 subheadings recommended
  internalLinks: { min: 2, max: null, optimal: 4 }, // At least 2 internal links recommended
  externalLinks: { min: 1, max: null, optimal: 2 }, // At least 1 external link recommended
  paragraphLength: { max: 150 }, // Words per paragraph for readability
  sentenceLength: { max: 25 }, // Words per sentence for readability
  keywordDensity: { min: 0.5, max: 3.0, optimal: 1.5 }, // Updated density range per Yoast
};

export default function SeoEditor() {
  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: 'אילה',
    image: '',
    slug: '',
    focusKeyword: '',
    secondaryKeywords: '',
    seoTitle: '',
    metaDescription: '',
    callToAction: '',
    socialImage: '',
    status: 'draft', // added status field for publishing
    publishDate: '' // added publishDate field
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [showSEOSection, setShowSEOSection] = useState(false);
  // TODO: ADD FAQ state when needed in the future
  const [seoScores, setSeoScores] = useState({
    overall: 0,
    keyword: 0,
    content: 0,
    metadata: 0,
    ux: 0
  });
  const [expandedSections, setExpandedSections] = useState({
    seo: true,
    contentReadability: false,
    publishing: false
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  
  // SEO analysis results
  const [seoAnalysis, setSeoAnalysis] = useState({
    keywordDensity: 0,
    keywordInTitle: false,
    keywordInDescription: false,
    keywordInContent: false,
    keywordInFirstParagraph: false,
    urlSlugOptimal: false,
    titleLength: { status: 'pending', message: '' },
    descriptionLength: { status: 'pending', message: '' },
    contentLength: { status: 'pending', message: '' },
    summaryLength: { status: 'pending', message: '' },
    focusKeywordCount: { status: 'pending', message: '' },
    // New analysis fields
    headings: { status: 'pending', message: '' },
    images: { status: 'pending', message: '' },
    imageAlt: { status: 'pending', message: '' },
    links: { status: 'pending', message: '' },
    sentenceLength: { status: 'pending', message: '' },
    socialImage: { status: 'pending', message: '' },
    mobileOptimization: { status: 'info', message: 'יש לבדוק תאימות למובייל ומהירות טעינה' }
  });

  // Set current date for publish date field
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      publishDate: `${year}-${month}-${day}`
    }));
  }, []);

  // Toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Load Quill styles on client
  useEffect(() => {
    import('react-quill/dist/quill.snow.css');
    setQuillLoaded(true);
  }, []);

  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Quill editor changes
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  // פונקציה לג'ינרוט תוכן SEO
  const generateSEO = async () => {
    // בדיקה שיש מספיק מידע לג'ינרוט
    if (!formData.title || !formData.summary || !formData.content) {
      setFeedback({
        type: 'error',
        message: 'אנא מלא לפחות כותרת, תקציר ותוכן לפני ג׳ינרוט SEO'
      });
      return;
    }

    setIsGeneratingSEO(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await axios.post('/api/generate-seo', {
        type: 'post',
        data: {
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          author: formData.author
        }
      });

      if (response.data.success) {
        const seoData = response.data.data;
        
        setFormData(prev => ({
          ...prev,
          slug: seoData.slug || '',
          seoTitle: seoData.seoTitle || '',
          metaDescription: seoData.metaDescription || '',
          focusKeyword: seoData.focusKeyword || '',
          secondaryKeywords: seoData.secondaryKeywords ? seoData.secondaryKeywords.join(', ') : '',
          callToAction: seoData.callToAction || '',
          socialImage: seoData.ogImageDescription || ''
        }));

        // שמירת FAQ שנוצר
        if (seoData.faqSection) {
          // TODO: ADD FAQ handling when needed
        }

        setShowSEOSection(true);
        setFeedback({
          type: 'success',
          message: 'תוכן SEO נוצר בהצלחה! אתה יכול לערוך אותו לפני שמירה.'
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'שגיאה בג׳ינרוט תוכן SEO'
      });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // Update slug automatically from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      // Create slug from title
      const newSlug = formData.title
        .toLowerCase()
        .replace(/[^\u0590-\u05FF\w\s]/g, '') // Keep Hebrew and English letters
        .replace(/\s+/g, '-')
        .trim();
        
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  }, [formData.title, formData.slug]);

  // Reset form
  const resetForm = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    setFormData({
      title: '',
      summary: '',
      content: '',
      author: 'אילה',
      image: '',
      slug: '',
      focusKeyword: '',
      secondaryKeywords: '',
      seoTitle: '',
      metaDescription: '',
      callToAction: '',
      socialImage: '',
      status: 'draft',
      publishDate: `${year}-${month}-${day}`
    });
  };

  const openMediaPicker = () => setShowMediaPicker(true);
  const closeMediaPicker = () => setShowMediaPicker(false);
  const handleMediaConfirm = (selection) => {
    const first = Array.isArray(selection) ? selection[0] : selection;
    if (first?.secure_url) {
      setFormData(prev => ({ ...prev, image: first.secure_url }));
    }
    closeMediaPicker();
  };

  // Calculate length status (too short, optimal, too long)
  const calculateLengthStatus = (field, value) => {
    const guideline = SEO_GUIDELINES[field];
    if (!guideline) return { status: 'neutral', message: '' };
    
    // Determine if we need word count or character count based on the field
    const isWordCountField = field === 'focusKeyword' || field === 'content';
    
    const length = isWordCountField
      ? value.split(/\s+/).filter(word => word.trim() !== '').length // Word count
      : value.length; // Character count for other fields
    
    // For content, we need to strip HTML tags first
    const contentLength = field === 'content' 
      ? value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.trim() !== '').length
      : length;
    
    const actualLength = field === 'content' ? contentLength : length;
    
    if (actualLength === 0) {
      return { status: 'pending', message: 'לא הוזן תוכן' };
    } else if (actualLength < guideline.min) {
      const unit = isWordCountField ? 'מילים' : 'תווים';
      return { status: 'bad', message: `קצר מדי (${actualLength} ${unit}, מינימום ${guideline.min})` };
    } else if (guideline.max && actualLength > guideline.max) {
      const unit = isWordCountField ? 'מילים' : 'תווים';
      return { status: 'warning', message: `ארוך מדי (${actualLength} ${unit}, מקסימום ${guideline.max})` };
    } else if (actualLength >= guideline.min && (!guideline.max || actualLength <= guideline.max)) {
      if (Math.abs(actualLength - guideline.optimal) <= (guideline.optimal * 0.1)) {
        const unit = isWordCountField ? 'מילים' : 'תווים';
        return { status: 'good', message: `אורך אופטימלי (${actualLength} ${unit})` };
      }
      const unit = isWordCountField ? 'מילים' : 'תווים';
      return { status: 'ok', message: `אורך טוב (${actualLength} ${unit})` };
    }
    
    return { status: 'neutral', message: '' };
  };

  // Calculate keyword density
  const calculateKeywordDensity = useCallback((content, keyword) => {
    if (!keyword || !content) return 0;
    
    // Strip HTML tags and convert to lowercase
    const strippedContent = content.replace(/<[^>]*>/g, '').toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // Count occurrences
    const keywordRegex = new RegExp(`\\b${keywordLower}\\b`, 'g');
    const keywordCount = (strippedContent.match(keywordRegex) || []).length;
    
    // Count total words
    const totalWords = strippedContent.split(/\s+/).filter(word => word.trim() !== '').length;
    
    // Calculate density
    return totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
  }, []);

  // Full SEO analysis - updated with more comprehensive checks
  const analyzeSEO = useCallback(() => {
    const { title, seoTitle, metaDescription, content, summary, focusKeyword, slug, image, socialImage } = formData;
    
    // Length analyses
    const titleLengthStatus = calculateLengthStatus('title', title);
    const seoTitleLengthStatus = calculateLengthStatus('seoTitle', seoTitle || title);
    const descriptionLengthStatus = calculateLengthStatus('metaDescription', metaDescription);
    const contentLengthStatus = calculateLengthStatus('content', content);
    const summaryLengthStatus = calculateLengthStatus('summary', summary);
    const focusKeywordCountStatus = calculateLengthStatus('focusKeyword', focusKeyword);
    
    // Keyword analyses
    const keywordDensity = calculateKeywordDensity(content, focusKeyword);
    const keywordInTitle = focusKeyword && (title.toLowerCase().includes(focusKeyword.toLowerCase()));
    const keywordInDescription = focusKeyword && (metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()));
    const keywordInContent = focusKeyword && (content.toLowerCase().includes(focusKeyword.toLowerCase()));
    
    // First paragraph check (rough approximation)
    const firstParagraphMatch = content.match(/<p>(.*?)<\/p>/);
    const firstParagraph = firstParagraphMatch ? firstParagraphMatch[1] : '';
    const keywordInFirstParagraph = focusKeyword && firstParagraph.toLowerCase().includes(focusKeyword.toLowerCase());
    
    // URL slug check
    const urlSlugOptimal = slug && focusKeyword && slug.toLowerCase().includes(
      focusKeyword.toLowerCase().replace(/\s+/g, '-')
    );
    
    // NEW: Readability checks
    // Count paragraphs
    const paragraphCount = (content.match(/<p>/g) || []).length;
    
    // Check headings
    const h2Count = (content.match(/<h2/g) || []).length;
    const h3Count = (content.match(/<h3/g) || []).length;
    const totalHeadings = h2Count + h3Count;
    const headingsStatus = totalHeadings < SEO_GUIDELINES.headings.min 
      ? { status: 'warning', message: `יש להוסיף כותרות משנה (יש ${totalHeadings}, מומלץ לפחות ${SEO_GUIDELINES.headings.min})` }
      : { status: 'good', message: `כמות כותרות משנה טובה (${totalHeadings})` };
    
    // Check for images
    const hasImages = content.includes('<img');
    const imagesCount = (content.match(/<img/g) || []).length;
    const mainImageStatus = image 
      ? { status: 'good', message: 'תמונה ראשית קיימת' }
      : { status: 'warning', message: 'חסרה תמונה ראשית' };
    
    // Check for alt text in images
    const imagesWithAlt = (content.match(/alt="[^"]+"/g) || []).length;
    const imageAltStatus = hasImages && imagesWithAlt < imagesCount 
      ? { status: 'warning', message: `לא לכל התמונות יש טקסט חלופי (${imagesWithAlt}/${imagesCount})` }
      : hasImages ? { status: 'good', message: 'כל התמונות כוללות טקסט חלופי' } 
      : { status: 'neutral', message: 'אין תמונות בתוכן' };
    
    // Check for internal/external links
    const hasLinks = content.includes('<a href=');
    const linksCount = (content.match(/<a href=/g) || []).length;
    const linksStatus = !hasLinks 
      ? { status: 'warning', message: 'אין קישורים בתוכן' }
      : linksCount < 2 
        ? { status: 'warning', message: `מעט קישורים (${linksCount})` }
        : { status: 'good', message: `כמות קישורים טובה (${linksCount})` };
    
    // Check sentence length - approximate check
    const strippedContent = content.replace(/<[^>]*>/g, '');
    const sentences = strippedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => 
      s.split(/\s+/).filter(w => w.trim().length > 0).length > SEO_GUIDELINES.sentenceLength.max
    );
    const sentenceLengthStatus = longSentences.length > sentences.length * 0.2
      ? { status: 'warning', message: `יותר מדי משפטים ארוכים (${longSentences.length}/${sentences.length})` }
      : { status: 'good', message: 'אורך המשפטים טוב לקריאות' };
    
    // Social media optimization
    const socialImageStatus = socialImage
      ? { status: 'good', message: 'תמונה לרשתות חברתיות קיימת' }
      : { status: 'warning', message: 'חסרה תמונה לרשתות חברתיות' };
    
    // Mobile optimization - just a reminder, not actually checked
    const mobileOptimizationStatus = { 
      status: 'info', 
      message: 'יש לבדוק תאימות למובייל ומהירות טעינה' 
    };
    
    // Store all analysis results
    setSeoAnalysis({
      keywordDensity,
      keywordInTitle,
      keywordInDescription,
      keywordInContent,
      keywordInFirstParagraph,
      urlSlugOptimal,
      titleLength: titleLengthStatus,
      seoTitleLength: seoTitleLengthStatus,
      descriptionLength: descriptionLengthStatus,
      contentLength: contentLengthStatus,
      summaryLength: summaryLengthStatus,
      focusKeywordCount: focusKeywordCountStatus,
      
      // New analysis items
      headings: headingsStatus,
      images: mainImageStatus,
      imageAlt: imageAltStatus,
      links: linksStatus,
      sentenceLength: sentenceLengthStatus,
      socialImage: socialImageStatus,
      mobileOptimization: mobileOptimizationStatus,
    });
    
    // Calculate scores - Updated approach with more factors
    
    // Keywords score (25% of total)
    let keywordScore = 0;
    if (keywordInTitle) keywordScore += 20;
    if (keywordInDescription) keywordScore += 15;
    if (keywordInContent) keywordScore += 10;
    if (keywordInFirstParagraph) keywordScore += 15;
    if (urlSlugOptimal) keywordScore += 10;
    if (keywordDensity >= SEO_GUIDELINES.keywordDensity.min && 
        keywordDensity <= SEO_GUIDELINES.keywordDensity.max) {
      keywordScore += 30;
    }
    
    // Content quality score (30% of total)
    let contentScore = 0;
    if (contentLengthStatus.status === 'good') contentScore += 25;
    else if (contentLengthStatus.status === 'ok') contentScore += 15;
    
    if (totalHeadings >= SEO_GUIDELINES.headings.min) contentScore += 15;
    if (hasImages) contentScore += 15;
    if (imagesWithAlt === imagesCount && imagesCount > 0) contentScore += 10;
    if (linksCount >= 2) contentScore += 15;
    if (paragraphCount >= 3) contentScore += 10;
    if (longSentences.length <= sentences.length * 0.2) contentScore += 10;
    
    // Metadata score (25% of total)
    let metadataScore = 0;
    if (titleLengthStatus.status === 'good') metadataScore += 20;
    else if (titleLengthStatus.status === 'ok') metadataScore += 15;
    
    if (descriptionLengthStatus.status === 'good') metadataScore += 20;
    else if (descriptionLengthStatus.status === 'ok') metadataScore += 15;
    
    if (slug) metadataScore += 20;
    if (image) metadataScore += 20;
    if (socialImage) metadataScore += 20;
    
    // User experience score (20% of total)
    let uxScore = 0;
    if (summaryLengthStatus.status === 'good' || summaryLengthStatus.status === 'ok') uxScore += 40;
    if (sentences.length > 0 && longSentences.length <= sentences.length * 0.1) uxScore += 30;
    if (paragraphCount >= 5) uxScore += 30;
    
    // Calculate overall score with revised weights
    const overallScore = Math.round(
      (keywordScore * 0.25) + 
      (contentScore * 0.30) + 
      (metadataScore * 0.25) + 
      (uxScore * 0.20)
    );
    
    setSeoScores({
      overall: overallScore,
      keyword: keywordScore,
      content: contentScore,
      metadata: metadataScore,
      ux: uxScore
    });
    
  }, [formData, calculateKeywordDensity]);

  // Run SEO analysis when relevant fields change
  useEffect(() => {
    analyzeSEO();
  }, [formData, analyzeSEO]);

  // Handle status change for publishing
  const handleStatusChange = (status) => {
    setFormData(prev => ({
      ...prev,
      status: status
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
  
    const formattedData = {
      ...formData,
      image: formData.image.trim(),
      seoTitle: formData.seoTitle || formData.title, // Use title as fallback for SEO title
    };
  
    try {
      const response = await axios.post('/api/post', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const successMessage = formData.status === 'published' 
        ? 'הפוסט פורסם בהצלחה!' 
        : 'הפוסט נשמר בהצלחה!';
        
      setFeedback({
        type: 'success',
        message: successMessage
      });
      resetForm();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'אירעה שגיאה בשמירת הפוסט'
      });
    } finally {
      setIsLoading(false);
      window.scrollTo({
        top: document.querySelector(`.${styles.feedback}`)?.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  // Helper for SEO score indicator color
  const getScoreColor = (score) => {
    if (score >= 80) return styles.good;
    if (score >= 50) return styles.ok;
    return styles.bad;
  };

  // SEO Status indicator component - updated with info state
  const SeoStatusIndicator = ({ status, message }) => {
    const icons = {
      good: <Check size={16} className={styles.goodIcon} />,
      ok: <Check size={16} className={styles.okIcon} />,
      bad: <X size={16} className={styles.badIcon} />,
      warning: <AlertTriangle size={16} className={styles.warningIcon} />,
      pending: <Edit3 size={16} className={styles.pendingIcon} />,
      info: <Info size={16} className={styles.infoIcon} />, // Added info state with icon
      neutral: <Edit3 size={16} className={styles.pendingIcon} />
    };
  
    return (
      <div className={`${styles.seoIndicator} ${styles[status]}`}>
        {icons[status]}
        <span>{message}</span>
      </div>
    );
  };

  // Function to generate status indicators for boolean SEO metrics
  const getBooleanStatus = (condition, goodMessage, badMessage) => {
    if (!formData.focusKeyword) return { status: 'pending', message: 'הוסף מילת מפתח להערכה' };
    return {
      status: condition ? 'good' : 'bad',
      message: condition ? goodMessage : badMessage
    };
  };

  return (
    <div className={styles.seoEditor}>
      {/* Main editor layout with content + sidebar */}
      <div className={styles.editorLayout}>
        {/* Content editing area */}
        <div className={styles.contentArea}>
          <div className={styles.sectionTitle}>תוכן הפוסט</div>
          
          {feedback.message && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.mainFields}>
              {/* Title field */}
              <div className={styles.formGroup}>
                <div className={styles.fieldHeader}>
                  <label>כותרת</label>
                  <div className={styles.lengthIndicator}>
                    <SeoStatusIndicator {...seoAnalysis.titleLength} />
                  </div>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  placeholder="כותרת הפוסט"
                  onChange={handleChange}
                  required
                  className={styles.titleInput}
                />
              </div>
              
              {/* Summary field */}
              <div className={styles.formGroup}>
                <div className={styles.fieldHeader}>
                  <label>תקציר</label>
                  <div className={styles.lengthIndicator}>
                    <SeoStatusIndicator {...seoAnalysis.summaryLength} />
                  </div>
                </div>
                <textarea
                  name="summary"
                  value={formData.summary}
                  placeholder="תקציר קצר של הפוסט"
                  onChange={handleChange}
                  required
                  className={styles.summaryInput}
                ></textarea>
              </div>
              
              {/* Content editor */}
              <div className={styles.formGroup}>
                <div className={styles.fieldHeader}>
                  <label>תוכן</label>
                  <div className={styles.lengthIndicator}>
                    <SeoStatusIndicator {...seoAnalysis.contentLength} />
                  </div>
                </div>
                <div className={styles.editorContainer}>
                  {quillLoaded && (
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={handleEditorChange}
                      modules={modules}
                      formats={formats}
                      placeholder="תוכן הפוסט"
                      className={styles.quillEditor}
                    />
                  )}
                </div>
              </div>
              
              {/* Author and image fields */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>מחבר</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    placeholder="שם המחבר"
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>תמונה ראשית</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      placeholder="URL של תמונה ראשית"
                      onChange={handleChange}
                      style={{ flex: 1 }}
                    />
                    <button type="button" className={styles.publishButton} onClick={openMediaPicker}>
                      בחר מספריית המדיה
                    </button>
                  </div>
                </div>
              </div>
              
              {/* AI SEO Generation Section */}
              <div className={styles.seoGenerateSection}>
                <div className={styles.seoHeader}>
                  <h4>ג'ינרוט תוכן SEO אוטומטי</h4>
                  <p>צור תוכן SEO מתקדם באמצעות AI עבור הפוסט שלך</p>
                </div>
                <button
                  type="button"
                  onClick={generateSEO}
                  disabled={isGeneratingSEO || !formData.title || !formData.summary || !formData.content}
                  className={styles.generateSEOButton}
                >
                  {isGeneratingSEO ? 'מייצר תוכן SEO...' : '🤖 ייצר תוכן SEO באמצעות AI'}
                </button>
                {(!formData.title || !formData.summary || !formData.content) ? (
                  <p className={styles.requirement}>נדרש כותרת, תקציר ותוכן לג'ינרוט SEO</p>
                ) : null}
              </div>

                             {/* TODO: ADD FAQ display section when needed in the future */}

              {/* Publish buttons */}
              <div className={styles.publishActions}>
                <button 
                  type="submit" 
                  className={`${styles.actionButton} ${styles.saveButton}`}
                  onClick={() => handleStatusChange('draft')}
                  disabled={isLoading}
                >
                  {isLoading ? 'שומר טיוטה...' : 'שמור טיוטה'}
                </button>
                
                <button 
                  type="submit" 
                  className={`${styles.actionButton} ${styles.publishButton}`}
                  onClick={() => handleStatusChange('published')}
                  disabled={isLoading}
                >
                  {isLoading ? 'מפרסם...' : 'פרסם פוסט'}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* SEO sidebar */}
        <div className={styles.seoSidebar}>
          <div className={styles.seoScoreWidget}>
            <div className={`${styles.scoreCircle} ${getScoreColor(seoScores.overall)}`}>
              <span className={styles.scoreNumber}>{seoScores.overall}</span>
            </div>
            <div className={styles.scoreLabel}>ציון SEO</div>
          </div>
          
          {/* Publishing Section - NEW */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('publishing')}>
              <div className={styles.sectionTitle}>
                <Send size={16} />
                <span>פרסום</span>
              </div>
              <div className={styles.toggleIcon}>
                {expandedSections.publishing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            
            {expandedSections.publishing && (
              <div className={styles.sectionContent}>
                <div className={styles.formGroup}>
                  <label>תאריך פרסום</label>
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>סטטוס</label>
                  <div className={styles.statusButtons}>
                    <button
                      type="button"
                      className={`${styles.statusButton} ${formData.status === 'draft' ? styles.statusActive : ''}`}
                      onClick={() => handleStatusChange('draft')}
                    >
                      טיוטה
                    </button>
                    <button
                      type="button"
                      className={`${styles.statusButton} ${formData.status === 'published' ? styles.statusActive : ''}`}
                      onClick={() => handleStatusChange('published')}
                    >
                      מפורסם
                    </button>
                  </div>
                </div><div className={styles.publishTip}>
                  <div className={styles.tipIcon}>
                    <Info size={14} />
                  </div>
                  <p className={styles.tipText}>
                    פרסום מיידי יפרסם את הפוסט באתר מיד עם שמירתו. 
                    אם תרצה לתזמן פרסום, בחר תאריך עתידי ולחץ על "פרסם".
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* SEO Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('seo')}>
              <div className={styles.sectionTitle}>
                <Search size={16} />
                <span>הגדרות SEO</span>
              </div>
              <div className={styles.toggleIcon}>
                {expandedSections.seo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            
            {expandedSections.seo && (
              <div className={styles.sectionContent}>
                {/* Focus keyword */}
                <div className={styles.formGroup}>
                  <div className={styles.fieldHeader}>
                    <label>מילת מפתח מרכזית</label>
                    <div className={styles.lengthIndicator}>
                      <SeoStatusIndicator {...seoAnalysis.focusKeywordCount} />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="focusKeyword"
                    value={formData.focusKeyword}
                    placeholder="מילת מפתח עיקרית"
                    onChange={handleChange}
                  />
                </div>
                
                {/* Secondary keywords */}
                <div className={styles.formGroup}>
                  <label>מילות מפתח משניות</label>
                  <input
                    type="text"
                    name="secondaryKeywords"
                    value={formData.secondaryKeywords}
                    placeholder="מילות מפתח נוספות (מופרדות בפסיקים)"
                    onChange={handleChange}
                  />
                </div>
                
                {/* URL Slug */}
                <div className={styles.formGroup}>
                  <div className={styles.fieldHeader}>
                    <label>Slug</label>
                    {formData.focusKeyword && (
                      <div className={styles.lengthIndicator}>
                        <SeoStatusIndicator 
                          {...getBooleanStatus(
                            seoAnalysis.urlSlugOptimal,
                            "מילת המפתח נמצאת ב-URL",
                            "הוסף את מילת המפתח ל-URL"
                          )} 
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    placeholder="slug-of-the-post"
                    onChange={handleChange}
                  />
                </div>
                
                {/* SEO Title */}
                <div className={styles.formGroup}>
                  <div className={styles.fieldHeader}>
                    <label>כותרת SEO</label>
                    <div className={styles.lengthIndicator}>
                      <SeoStatusIndicator {...(formData.seoTitle ? seoAnalysis.seoTitleLength : seoAnalysis.titleLength)} />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    placeholder="כותרת לתוצאות חיפוש (אם שונה מהכותרת)"
                    onChange={handleChange}
                  />
                </div>
                
                {/* Meta Description */}
                <div className={styles.formGroup}>
                  <div className={styles.fieldHeader}>
                    <label>Meta Description</label>
                    <div className={styles.lengthIndicator}>
                      <SeoStatusIndicator {...seoAnalysis.descriptionLength} />
                    </div>
                  </div>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    placeholder="תיאור הפוסט לתוצאות חיפוש"
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                {/* Call to action */}
                <div className={styles.formGroup}>
                  <label>קריאה לפעולה</label>
                  <textarea
                    name="callToAction"
                    value={formData.callToAction}
                    placeholder="קריאה לפעולה בסוף הפוסט"
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                {/* Social image */}
                <div className={styles.formGroup}>
                  <label>תמונה לרשתות חברתיות</label>
                  <input
                    type="text"
                    name="socialImage"
                    value={formData.socialImage}
                    placeholder="URL של תמונה לשיתוף ברשתות חברתיות"
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* SEO Analysis Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('contentReadability')}>
              <div className={styles.sectionTitle}>
                <FileText size={16} />
                <span>ניתוח SEO</span>
              </div>
              <div className={styles.toggleIcon}>
                {expandedSections.contentReadability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            
            {expandedSections.contentReadability && (
              <div className={styles.sectionContent}>
                <div className={styles.seoAnalysisList}>
                  {/* Keyword Analysis Group */}
                  <div className={styles.analysisGroup}>
                    <h4 className={styles.analysisGroupTitle}>מילות מפתח</h4>
                    
                    <div className={styles.analysisItem}>
                      <SeoStatusIndicator 
                        {...getBooleanStatus(
                          seoAnalysis.keywordInTitle,
                          "מילת המפתח נמצאת בכותרת",
                          "הוסף את מילת המפתח לכותרת"
                        )} 
                      />
                    </div>
                    
                    <div className={styles.analysisItem}>
                      <SeoStatusIndicator 
                        {...getBooleanStatus(
                          seoAnalysis.keywordInDescription,
                          "מילת המפתח נמצאת במטא תיאור",
                          "הוסף את מילת המפתח למטא תיאור"
                        )} 
                      />
                    </div>
                    
                    <div className={styles.analysisItem}>
                      <SeoStatusIndicator 
                        {...getBooleanStatus(
                          seoAnalysis.keywordInContent,
                          "מילת המפתח נמצאת בתוכן",
                          "הטמע את מילת המפתח בתוכן"
                        )} 
                      />
                    </div>
                    
                    <div className={styles.analysisItem}>
                      <SeoStatusIndicator 
                        {...getBooleanStatus(
                          seoAnalysis.keywordInFirstParagraph,
                          "מילת המפתח בפסקה הראשונה",
                          "הוסף את מילת המפתח לפסקה הראשונה"
                        )} 
                      />
                    </div>
                    
                    {/* Keyword density */}
                    <div className={styles.analysisItem}>
                      <SeoStatusIndicator 
                        status={
                          !formData.focusKeyword ? 'pending' :
                          seoAnalysis.keywordDensity === 0 ? 'bad' :
                          seoAnalysis.keywordDensity < SEO_GUIDELINES.keywordDensity.min ? 'warning' :
                          seoAnalysis.keywordDensity > SEO_GUIDELINES.keywordDensity.max ? 'warning' : 'good'
                        }
                        message={
                          !formData.focusKeyword ? 'הוסף מילת מפתח להערכה' :
                          seoAnalysis.keywordDensity === 0 ? 'מילת המפתח לא נמצאה בתוכן' :
                          seoAnalysis.keywordDensity < SEO_GUIDELINES.keywordDensity.min ? 
                            `צפיפות מילת מפתח נמוכה (${seoAnalysis.keywordDensity.toFixed(1)}%)` :
                          seoAnalysis.keywordDensity > SEO_GUIDELINES.keywordDensity.max ? 
                            `צפיפות מילת מפתח גבוהה מדי (${seoAnalysis.keywordDensity.toFixed(1)}%)` :
                            `צפיפות מילת מפתח אופטימלית (${seoAnalysis.keywordDensity.toFixed(1)}%)`
                        }
                      />
                    </div>
                  </div>
                  
                  {/* Content Structure Analysis */}
                  <div className={styles.analysisGroup}>
                    <h4 className={styles.analysisGroupTitle}>מבנה התוכן</h4>
                    
                    {/* Content length */}
                    <div className={styles.analysisItem}>
                      <SeoStatusIndicator {...seoAnalysis.contentLength} />
                    </div>
                    
                    {/* Headings */}
                    {seoAnalysis.headings && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.headings} />
                      </div>
                    )}
                    
                    {/* Links */}
                    {seoAnalysis.links && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.links} />
                      </div>
                    )}
                    
                    {/* Sentence length */}
                    {seoAnalysis.sentenceLength && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.sentenceLength} />
                      </div>
                    )}
                  </div>
                  
                  {/* Media Optimization */}
                  <div className={styles.analysisGroup}>
                    <h4 className={styles.analysisGroupTitle}>מדיה</h4>
                    
                    {/* Main image */}
                    {seoAnalysis.images && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.images} />
                      </div>
                    )}
                    
                    {/* Alt text */}
                    {seoAnalysis.imageAlt && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.imageAlt} />
                      </div>
                    )}
                    
                    {/* Social image */}
                    {seoAnalysis.socialImage && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.socialImage} />
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Optimization */}
                  <div className={styles.analysisGroup}>
                    <h4 className={styles.analysisGroupTitle}>התאמה למובייל</h4>
                    
                    {seoAnalysis.mobileOptimization && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.mobileOptimization} />
                      </div>
                    )}
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className={styles.scoreBreakdown}>
                    <div className={styles.subScoreItem}>
                      <span>מילות מפתח:</span>
                      <div className={`${styles.subScoreValue} ${getScoreColor(seoScores.keyword)}`}>
                        {seoScores.keyword}/100
                      </div>
                    </div>
                    
                    <div className={styles.subScoreItem}>
                      <span>איכות תוכן:</span>
                      <div className={`${styles.subScoreValue} ${getScoreColor(seoScores.content)}`}>
                        {seoScores.content}/100
                      </div>
                    </div>
                    
                    <div className={styles.subScoreItem}>
                      <span>מטא-דאטה:</span>
                      <div className={`${styles.subScoreValue} ${getScoreColor(seoScores.metadata)}`}>
                        {seoScores.metadata}/100
                      </div>
                    </div>
                    
                    <div className={styles.subScoreItem}>
                      <span>חוויית משתמש:</span>
                      <div className={`${styles.subScoreValue} ${getScoreColor(seoScores.ux)}`}>
                        {seoScores.ux}/100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* SERP Preview */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Search size={16} />
                <span>תצוגה מקדימה בגוגל</span>
              </div>
            </div>
            
            <div className={styles.serpPreview}>
              <div className={styles.serpTitle}>
                {formData.seoTitle || formData.title || 'כותרת הפוסט'}
              </div>
              <div className={styles.serpUrl}>
                example.com/{formData.slug || 'your-post-url'}
              </div>
              <div className={styles.serpDescription}>
                {formData.metaDescription || formData.summary || 'תיאור הפוסט יופיע כאן. הוסף מטא תיאור לשיפור הנראות בתוצאות החיפוש.'}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMediaPicker && (
        <MediaPickerModal
          isOpen={showMediaPicker}
          onClose={closeMediaPicker}
          onConfirm={handleMediaConfirm}
          multiple={false}
        />
      )}
    </div>
  );
}