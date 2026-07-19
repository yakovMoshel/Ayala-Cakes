"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import PostCtaEditor from '@/Components/PostCtaBlock/PostCtaEditor';
import { DEFAULT_POST_CTA, mapPostCtaFromPost, normalizePostCtaForDb } from '@/utils/postCta';
import { analyzePost } from '@/utils/seoScore';
import { normalizeKeywordsList } from '@/utils/keywords';
import KeywordTagsInput from '@/Components/KeywordTagsInput';
import RichTextEditor from '@/Components/RichTextEditor';
const MediaPickerModal = dynamic(() => import('@/Components/MediaPickerModal'), { ssr: false });

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (status === 504 || data?.code === 'FUNCTION_INVOCATION_TIMEOUT') {
    return 'יצירת התוכן ארכה יותר מדי בשרת. נסו שוב בעוד רגע.';
  }

  const raw = data?.error ?? data?.message;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (raw && typeof raw === 'object' && typeof raw.message === 'string') {
    return raw.message;
  }
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;

  if (error?.code === 'ECONNABORTED') {
    return 'הבקשה נקטעה בגלל זמן המתנה ארוך. נסו שוב.';
  }

  return fallback;
};

const formatPublishDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapPostToFormData = (post) => ({
  title: post.title || '',
  summary: post.summary || '',
  content: post.content || '',
  author: post.author || 'אילה',
  image: post.image || '',
  slug: post.slug || '',
  focusKeyword: post.focusKeyword || '',
  secondaryKeywords: normalizeKeywordsList(post.secondaryKeywords),
  longtailKeywords: normalizeKeywordsList(post.longtailKeywords),
  seoTitle: post.seoTitle || '',
  metaDescription: post.metaDescription || '',
  callToAction: post.callToAction || '',
  socialImage: post.socialImage || '',
  status: post.status === 'deleted' ? 'draft' : (post.status || 'draft'),
  publishDate: formatPublishDate(post.publishDate || post.createdAt),
  postCta: mapPostCtaFromPost(post),
});

const STATUS_LABELS = {
  draft: 'טיוטה',
  published: 'מפורסם',
};

export default function SeoEditor({ postId }) {
  const router = useRouter();
  const [editingPostId, setEditingPostId] = useState(postId || null);
  const [isLoadingPost, setIsLoadingPost] = useState(!!postId);

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: 'אילה',
    image: '',
    slug: '',
    focusKeyword: '',
    secondaryKeywords: [],
    longtailKeywords: [],
    seoTitle: '',
    metaDescription: '',
    callToAction: '',
    socialImage: '',
    status: 'draft', // added status field for publishing
    publishDate: '', // added publishDate field
    postCta: { ...DEFAULT_POST_CTA, buttons: [], productIds: [] },
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isGeneratingFullPost, setIsGeneratingFullPost] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiNotes, setAiNotes] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showSEOSection, setShowSEOSection] = useState(false);
  // TODO: ADD FAQ state when needed in the future
  const [seoScores, setSeoScores] = useState({
    overall: 0,
    keyword: 0,
    content: 0,
    metadata: 0,
    ux: 0
  });
  const [seoRecommendations, setSeoRecommendations] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    seo: true,
    contentReadability: false,
    publishing: false
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  
  // SEO analysis results (shape produced by utils/seoScore analyzePost)
  const [seoAnalysis, setSeoAnalysis] = useState({
    keywordDensity: 0,
    keywordDensityStatus: { status: 'pending', message: '' },
    keywordStuffing: { status: 'pending', message: '' },
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
    headings: { status: 'pending', message: '' },
    h1InContent: { status: 'pending', message: '' },
    questionHeadings: { status: 'pending', message: '' },
    directAnswer: { status: 'pending', message: '' },
    lists: { status: 'pending', message: '' },
    images: { status: 'pending', message: '' },
    imageAlt: { status: 'pending', message: '' },
    links: { status: 'pending', message: '' },
    internalLinks: { status: 'pending', message: '' },
    externalLinks: { status: 'pending', message: '' },
    sentenceLength: { status: 'pending', message: '' },
    paragraphLength: { status: 'pending', message: '' },
    socialImage: { status: 'pending', message: '' },
    mobileOptimization: { status: 'info', message: 'יש לבדוק תאימות למובייל ומהירות טעינה' }
  });

  // Set current date for publish date field (new posts only)
  useEffect(() => {
    if (postId) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      publishDate: `${year}-${month}-${day}`
    }));
  }, [postId]);

  // Load existing post for editing
  useEffect(() => {
    if (!postId) {
      setEditingPostId(null);
      setIsLoadingPost(false);
      return;
    }

    setEditingPostId(postId);
    const loadPost = async () => {
      setIsLoadingPost(true);
      setFeedback({ type: '', message: '' });
      try {
        const response = await axios.get(`/api/post/${postId}`);
        if (response.data.success) {
          setFormData(mapPostToFormData(response.data.data));
        }
      } catch (error) {
        setFeedback({
          type: 'error',
          message: error.response?.data?.error || 'שגיאה בטעינת הפוסט לעריכה'
        });
      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, [postId]);

  // Toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
          secondaryKeywords: normalizeKeywordsList(seoData.secondaryKeywords),
          longtailKeywords: normalizeKeywordsList(seoData.longtailKeywords),
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
        message: getApiErrorMessage(error, 'שגיאה בג׳ינרוט תוכן SEO'),
      });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const formHasContent = () =>
    Boolean(
      formData.title?.trim() ||
        formData.summary?.trim() ||
        formData.content?.trim()
    );

  const generateFullBlogPost = async () => {
    if (!aiTopic.trim()) {
      setFeedback({
        type: 'error',
        message: 'יש להזין נושא או רעיון לפוסט',
      });
      return;
    }

    if (formHasContent()) {
      const confirmed = window.confirm(
        'הפעולה תחליף את הכותרת, התקציר והתוכן הקיימים. להמשיך?'
      );
      if (!confirmed) return;
    }

    setIsGeneratingFullPost(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await axios.post(
        '/api/generate-seo',
        {
          type: 'post-full',
          data: {
            topic: aiTopic.trim(),
            userKeywords: aiKeywords.trim(),
            userNotes: aiNotes.trim(),
            author: formData.author,
          },
        },
        { timeout: 90000 }
      );

      if (response.data.success) {
        const post = response.data.data;
        const nextFormData = {
          ...formData,
          title: post.title || aiTopic.trim(),
          summary: post.summary || '',
          content: post.content || '',
          author: post.author || formData.author,
          slug: post.slug || '',
          seoTitle: post.seoTitle || post.title || '',
          metaDescription: post.metaDescription || '',
          focusKeyword: post.focusKeyword || '',
          secondaryKeywords: normalizeKeywordsList(post.secondaryKeywords),
          longtailKeywords: normalizeKeywordsList(post.longtailKeywords),
          callToAction: post.callToAction || '',
        };

        const { scores } = analyzePost(nextFormData);
        setFormData(nextFormData);
        setSeoScores(scores);
        setExpandedSections((prev) => ({ ...prev, seo: true }));
        setShowSEOSection(true);

        setFeedback({
          type: 'success',
          message: `פוסט מלא נוצר בהצלחה! ציון SEO נוכחי: ${scores.overall}/100. הוסיפי תמונה ראשית וקישורים לפני פרסום.`,
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'שגיאה ביצירת פוסט מלא'),
      });
    } finally {
      setIsGeneratingFullPost(false);
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
      secondaryKeywords: [],
      longtailKeywords: [],
      seoTitle: '',
      metaDescription: '',
      callToAction: '',
      socialImage: '',
      status: 'draft',
      publishDate: `${year}-${month}-${day}`,
      postCta: { ...DEFAULT_POST_CTA, buttons: [], productIds: [] },
    });
  };

  const openMediaPicker = () => setShowMediaPicker(true);
  const closeMediaPicker = () => setShowMediaPicker(false);
  const clearFeaturedImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
  };
  const handleMediaConfirm = (selection) => {
    const first = Array.isArray(selection) ? selection[0] : selection;
    if (first?.secure_url) {
      setFormData(prev => ({ ...prev, image: first.secure_url }));
    }
    closeMediaPicker();
  };

  // Full SEO/AIO analysis — logic lives in utils/seoScore.js (Hebrew-aware)
  const analyzeSEO = useCallback(() => {
    const { analysis, scores, recommendations } = analyzePost(formData);
    setSeoAnalysis(analysis);
    setSeoScores(scores);
    setSeoRecommendations(recommendations);
  }, [formData]);

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

  const savePost = async (targetStatus) => {
    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    const formattedData = {
      ...formData,
      status: targetStatus,
      image: formData.image.trim(),
      seoTitle: formData.seoTitle || formData.title,
      secondaryKeywords: normalizeKeywordsList(formData.secondaryKeywords),
      longtailKeywords: normalizeKeywordsList(formData.longtailKeywords),
      postCta: normalizePostCtaForDb(formData.postCta),
    };

    try {
      const response = editingPostId
        ? await axios.put(`/api/post/${editingPostId}`, formattedData, {
            headers: { 'Content-Type': 'application/json' },
          })
        : await axios.post('/api/post', formattedData, {
            headers: { 'Content-Type': 'application/json' },
          });

      if (!editingPostId && response.data?.data?._id) {
        setEditingPostId(response.data.data._id);
        router.replace(`/admin/posts/${response.data.data._id}/edit`);
      }

      setFormData((prev) => ({ ...prev, status: targetStatus }));

      const successMessages = {
        published: editingPostId ? 'הפוסט עודכן ופורסם!' : 'הפוסט פורסם בהצלחה!',
        draft: editingPostId ? 'הפוסט נשמר כטיוטה.' : 'הפוסט נשמר כטיוטה.',
      };

      setFeedback({
        type: 'success',
        message: successMessages[targetStatus] || 'הפוסט נשמר בהצלחה!',
      });

      if (!editingPostId && !response.data?.data?._id) {
        resetForm();
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'אירעה שגיאה בשמירת הפוסט',
      });
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeletePost = async () => {
    if (!editingPostId) return;
    const confirmed = window.confirm('האם למחוק את הפוסט? הוא יוסר מהאתר אך יישמר במערכת.');
    if (!confirmed) return;

    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      await axios.put(`/api/post/${editingPostId}`, { status: 'deleted' });
      router.push('/admin/posts');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'שגיאה במחיקת הפוסט',
      });
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    savePost(formData.status);
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

  if (isLoadingPost) {
    return (
      <div className={styles.seoEditor}>
        <p className={styles.editorLoading}>טוען פוסט לעריכה...</p>
      </div>
    );
  }

  return (
    <div className={styles.seoEditor}>
      <div className={styles.editorToolbar}>
        <div className={styles.toolbarStart}>
          <span className={styles.toolbarLabel}>סטטוס נוכחי</span>
          <span className={`${styles.statusBadge} ${styles[`status_${formData.status}`]}`}>
            {STATUS_LABELS[formData.status] || formData.status}
          </span>
        </div>
        <div className={styles.toolbarActions}>
          {editingPostId && formData.status === 'published' && formData.slug && (
            <a
              href={`/blog/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.toolbarBtnGhost}
            >
              צפייה באתר
            </a>
          )}
          <button
            type="button"
            className={styles.toolbarBtnDraft}
            onClick={() => savePost('draft')}
            disabled={isLoading}
          >
            {isLoading ? 'שומר...' : formData.status === 'published' ? 'העבר לטיוטה' : 'שמור טיוטה'}
          </button>
          <button
            type="button"
            className={styles.toolbarBtnPublish}
            onClick={() => savePost('published')}
            disabled={isLoading}
          >
            {isLoading ? 'שומר...' : formData.status === 'published' ? 'עדכן פרסום' : 'פרסם'}
          </button>
          {editingPostId && (
            <button
              type="button"
              className={styles.toolbarBtnDanger}
              onClick={handleDeletePost}
              disabled={isLoading}
            >
              מחק
            </button>
          )}
        </div>
      </div>

      {/* Main editor layout with content + sidebar */}
      <div className={styles.editorLayout}>
        {/* Content editing area */}
        <div className={styles.contentArea}>
          <div className={styles.sectionTitle}>
            {editingPostId ? 'עריכת תוכן הפוסט' : 'תוכן הפוסט'}
          </div>
          
          {feedback.message && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.message}
            </div>
          )}
          
          <form onSubmit={handleFormSubmit}>
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

              {/* Featured image — full-width, clear upload UX */}
              <div className={styles.featuredImageSection}>
                <div className={styles.fieldHeader}>
                  <label className={styles.featuredImageLabel}>
                    <Image size={18} aria-hidden />
                    תמונה ראשית
                  </label>
                  {seoAnalysis.images && (
                    <div className={styles.lengthIndicator}>
                      <SeoStatusIndicator {...seoAnalysis.images} />
                    </div>
                  )}
                </div>
                <p className={styles.fieldHint}>
                  התמונה שמופיעה בראש הפוסט בבלוג, בתוצאות החיפוש ובשיתופים. מומלץ יחס 3:2, לפחות 800px רוחב.
                </p>

                {formData.image ? (
                  <div className={styles.imagePreviewCard}>
                    <div className={styles.imagePreviewWrap}>
                      <img
                        src={formData.image}
                        alt="תצוגה מקדימה של התמונה הראשית"
                        className={styles.imagePreview}
                      />
                    </div>
                    <div className={styles.imagePreviewMeta}>
                      <span className={styles.imagePreviewBadge}>תמונה נבחרה</span>
                      <div className={styles.imagePreviewActions}>
                        <button
                          type="button"
                          className={styles.imagePickerBtn}
                          onClick={openMediaPicker}
                        >
                          החלפת תמונה
                        </button>
                        <button
                          type="button"
                          className={styles.imageRemoveBtn}
                          onClick={clearFeaturedImage}
                        >
                          <X size={16} aria-hidden />
                          הסרה
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.imageUploadEmpty}
                    onClick={openMediaPicker}
                  >
                    <span className={styles.imageUploadIcon}>
                      <Image size={28} strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className={styles.imageUploadTitle}>בחרי תמונה מספריית המדיה</span>
                    <span className={styles.imageUploadSub}>לחצי כאן לפתיחת הספרייה</span>
                  </button>
                )}

                <div className={styles.imageUrlRow}>
                  <label className={styles.imageUrlLabel} htmlFor="post-featured-image-url">
                    {formData.image ? 'כתובת התמונה (ניתן לערוך)' : 'או הדביקי כתובת URL ישירות'}
                  </label>
                  <input
                    id="post-featured-image-url"
                    type="url"
                    name="image"
                    value={formData.image}
                    placeholder="https://res.cloudinary.com/..."
                    onChange={handleChange}
                    className={styles.imageUrlInput}
                    dir="ltr"
                  />
                </div>
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
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleEditorChange}
                    placeholder="תוכן הפוסט"
                    className={styles.quillEditor}
                    excludePostId={editingPostId || ''}
                  />
                </div>
              </div>

              <PostCtaEditor
                value={formData.postCta}
                onChange={(postCta) =>
                  setFormData((prev) => ({ ...prev, postCta }))
                }
              />
              
              {/* Post metadata */}
              <div className={styles.metadataSection}>
                <p className={styles.metadataSectionTitle}>פרטי פרסום</p>
                <div className={styles.formGroup}>
                  <label htmlFor="post-author">מחבר / מחברת</label>
                  <input
                    id="post-author"
                    type="text"
                    name="author"
                    value={formData.author}
                    placeholder="שם המחבר שיוצג בפוסט"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              {/* AI Generation Section */}
              <div className={styles.seoGenerateSection}>
                <div className={styles.seoHeader}>
                  <h4>יצירת תוכן ב-AI</h4>
                  <p>בחרי מצב: פוסט מלא חדש, או שדות SEO מתוכן שכבר כתבת</p>
                </div>

                <div className={styles.aiModeBlock}>
                  <h5 className={styles.aiModeTitle}>יצירת פוסט מלא חדש</h5>
                  <p className={styles.aiModeHint}>
                    ה-AI משתמש בהקשר קבוע על העסק. הוסיפי נושא ומילות מפתח — אחר כך תוסיפי תמונה וקישורים ידנית.
                  </p>
                  <div className={styles.formGroup}>
                    <label htmlFor="ai-topic">נושא / רעיון לפוסט</label>
                    <input
                      id="ai-topic"
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="לדוגמה: איך לבחור עוגת יום הולדת לילדים"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="ai-keywords">מילות מפתח / ביטויים (אופציונלי)</label>
                    <input
                      id="ai-keywords"
                      type="text"
                      value={aiKeywords}
                      onChange={(e) => setAiKeywords(e.target.value)}
                      placeholder="עוגת יום הולדת, קריות, עוגות מעוצבות"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="ai-notes">הערות נוספות ל-AI (אופציונלי)</label>
                    <textarea
                      id="ai-notes"
                      value={aiNotes}
                      onChange={(e) => setAiNotes(e.target.value)}
                      placeholder="זווית, קהל יעד, מוצרים לציין..."
                      rows={3}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateFullBlogPost}
                    disabled={isGeneratingFullPost || isGeneratingSEO || !aiTopic.trim()}
                    className={styles.generateFullPostButton}
                  >
                    {isGeneratingFullPost ? 'יוצר פוסט מלא...' : 'יצירת פוסט מלא ב-AI'}
                  </button>
                </div>

                <div className={styles.aiModeDivider} />

                <div className={styles.aiModeBlock}>
                  <h5 className={styles.aiModeTitle}>שדות SEO מתוכן קיים</h5>
                  <p className={styles.aiModeHint}>
                    ממלא רק שדות SEO בסרגל הצד — לפי כותרת, תקציר ותוכן שכבר כתבת.
                  </p>
                  <button
                    type="button"
                    onClick={generateSEO}
                    disabled={
                      isGeneratingSEO ||
                      isGeneratingFullPost ||
                      !formData.title ||
                      !formData.summary ||
                      !formData.content
                    }
                    className={styles.generateSEOButton}
                  >
                    {isGeneratingSEO ? 'מייצר שדות SEO...' : 'ייצור שדות SEO מתוכן קיים'}
                  </button>
                  {(!formData.title || !formData.summary || !formData.content) ? (
                    <p className={styles.requirement}>נדרשים כותרת, תקציר ותוכן</p>
                  ) : null}
                </div>
              </div>

                             {/* TODO: ADD FAQ display section when needed in the future */}

              <p className={styles.toolbarHint}>
                שמירה ופרסום מתבצעות מהסרגל העליון. ניתן גם לשנות סטטוס בלשונית &quot;פרסום&quot; בצד.
              </p>
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
            <p className={styles.scoreSubtext}>מתוך 100 · מתעדכן בזמן אמת</p>
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
                  <label>סטטוס (תצוגה מקדימה)</label>
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
                  <p className={styles.sidebarStatusNote}>
                    לשמירה בפועל השתמשי בכפתורים בסרגל העליון.
                  </p>
                </div>
                <div className={styles.publishTip}>
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
                    <label htmlFor="post-focus-keyword">מילת מפתח מרכזית</label>
                    <div className={styles.lengthIndicator}>
                      <SeoStatusIndicator {...seoAnalysis.focusKeywordCount} />
                    </div>
                  </div>
                  <p className={styles.fieldHintCompact}>
                    מילת המפתח העיקרית שעליה בנוי הפוסט — בדרך כלל ביטוי אחד קצר.
                  </p>
                  <input
                    id="post-focus-keyword"
                    type="text"
                    name="focusKeyword"
                    value={formData.focusKeyword}
                    placeholder="לדוגמה: עוגת יום הולדת"
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.keywordsGroup}>
                  <p className={styles.keywordsGroupTitle}>מילות מפתח נוספות</p>

                  {/* Secondary keywords */}
                  <div className={styles.formGroup}>
                    <label htmlFor="post-secondary-keywords">מילות מפתח משניות</label>
                    <p className={styles.fieldHintCompact}>
                      מילים או ביטויים קצרים וקשורים לנושא (1–2 מילים).
                    </p>
                    <KeywordTagsInput
                      id="post-secondary-keywords"
                      value={formData.secondaryKeywords}
                      onChange={(secondaryKeywords) =>
                        setFormData((prev) => ({ ...prev, secondaryKeywords }))
                      }
                      placeholder="עוגות, קונדיטוריה, יום הולדת"
                    />
                  </div>

                  {/* Long-tail keywords */}
                  <div className={styles.formGroup}>
                    <label htmlFor="post-longtail-keywords">מילות מפתח Long-tail</label>
                    <p className={styles.fieldHintCompact}>
                      ביטויי חיפוש ארוכים וספציפיים (3 מילים ומעלה) — טובים ל-SEO ולמנועי AI.
                    </p>
                    <KeywordTagsInput
                      id="post-longtail-keywords"
                      value={formData.longtailKeywords}
                      onChange={(longtailKeywords) =>
                        setFormData((prev) => ({ ...prev, longtailKeywords }))
                      }
                      placeholder="איך לבחור עוגת יום הולדת לילדים"
                    />
                  </div>
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
                  <div className={styles.fieldHeader}>
                    <label>תמונה לרשתות חברתיות (OG)</label>
                    {seoAnalysis.socialImage && (
                      <div className={styles.lengthIndicator}>
                        <SeoStatusIndicator {...seoAnalysis.socialImage} />
                      </div>
                    )}
                  </div>
                  <p className={styles.fieldHintCompact}>
                    מוצגת בשיתוף בוואטסאפ, פייסבוק ואינסטגרם. אם ריק — משתמשים בתמונה הראשית.
                  </p>
                  <input
                    type="url"
                    name="socialImage"
                    value={formData.socialImage}
                    placeholder="https://res.cloudinary.com/..."
                    onChange={handleChange}
                    dir="ltr"
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
                  {/* Prioritized fixes — top issues by score impact */}
                  {seoRecommendations.length > 0 && (
                    <div className={styles.analysisGroup}>
                      <h4 className={styles.analysisGroupTitle}>מה לתקן קודם (לפי השפעה על הציון)</h4>
                      {seoRecommendations.map((rec, index) => (
                        <div key={index} className={styles.analysisItem}>
                          <SeoStatusIndicator status={rec.status} message={rec.message} />
                        </div>
                      ))}
                    </div>
                  )}
                  
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
                    {seoAnalysis.keywordDensityStatus && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.keywordDensityStatus} />
                      </div>
                    )}
                    
                    {/* Keyword stuffing */}
                    {seoAnalysis.keywordStuffing && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.keywordStuffing} />
                      </div>
                    )}
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
                    
                    {/* H1 in content (duplicate H1 check) */}
                    {seoAnalysis.h1InContent && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.h1InContent} />
                      </div>
                    )}
                    
                    {/* Direct answer (AIO) */}
                    {seoAnalysis.directAnswer && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.directAnswer} />
                      </div>
                    )}
                    
                    {/* Lists (AIO scannability) */}
                    {seoAnalysis.lists && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.lists} />
                      </div>
                    )}
                    
                    {/* Question headings (AIO) */}
                    {seoAnalysis.questionHeadings && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.questionHeadings} />
                      </div>
                    )}
                    
                    {/* Internal links */}
                    {seoAnalysis.internalLinks && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.internalLinks} />
                      </div>
                    )}
                    
                    {/* External links */}
                    {seoAnalysis.externalLinks && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.externalLinks} />
                      </div>
                    )}
                    
                    {/* Sentence length */}
                    {seoAnalysis.sentenceLength && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.sentenceLength} />
                      </div>
                    )}
                    
                    {/* Paragraph length */}
                    {seoAnalysis.paragraphLength && (
                      <div className={styles.analysisItem}>
                        <SeoStatusIndicator {...seoAnalysis.paragraphLength} />
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