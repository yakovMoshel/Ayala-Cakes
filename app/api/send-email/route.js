import { sendEmail } from '@/server/functions/nodeMailer';
import { isRateLimited, getClientIp } from '@/utils/rateLimit';

// Escape user-provided values before interpolating into the HTML email
function esc(value) {
  return String(value ?? '')
    .slice(0, 1000)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req) {
  try {
    // 5 emails per IP per 10 minutes
    if (isRateLimited(`send-email:${getClientIp(req)}`, { windowMs: 10 * 60 * 1000, max: 5 })) {
      return new Response(JSON.stringify({ success: false, error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { type, orderDetails } = await req.json();

    if (!orderDetails || typeof orderDetails !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const managerEmail = process.env.MAIL;
    let subject = '';
    let message = '';

    if (type === 'order') {
      subject = `הזמנה חדשה: ${esc(orderDetails.productName)}`;
      message = `
        <h1>הזמנה חדשה: ${esc(orderDetails.productName)}</h1>
        <div class="order-details" dir="rtl">
          <div><strong>מוצר:</strong> ${esc(orderDetails.productName)}</div>
          <div><strong>גודל:</strong> ${esc(orderDetails.size)}</div>
          <div><strong>צבע:</strong> ${esc(orderDetails.color)}</div>
          <div><strong>טעם:</strong> ${esc(orderDetails.flavor)}</div>
          <div><strong>מילוי:</strong> ${esc(orderDetails.filling)}</div>
          <div><strong>ללא גלוטן:</strong> ${esc(orderDetails.glutenFree)}</div>
          <div><strong>ללא חלב:</strong> ${esc(orderDetails.notDairy)}</div>
          <div><strong>הערות:</strong> ${esc(orderDetails.notes) || 'אין הערות'}</div>
          <div><strong>שם הלקוח:</strong> ${esc(orderDetails.customerName)}</div>
          <div><strong>מספר טלפון:</strong> ${esc(orderDetails.phoneNumber)}</div>
        </div>`;
    } else if (type === 'contact') {
      subject = `הודעה חדשה מ: ${esc(orderDetails.name)}`;
      message = `
        <h1>הודעה חדשה מ: ${esc(orderDetails.name)}</h1>
        <div class="contact-details" dir="rtl">
          <div><strong>שם:</strong> ${esc(orderDetails.name)}</div>
          <div><strong>אימייל:</strong> ${esc(orderDetails.email)}</div>
          <div><strong>טלפון:</strong> ${esc(orderDetails.phone)}</div>
          <div><strong>הודעה:</strong> ${esc(orderDetails.message)}</div>
        </div>`;
    } else {
      console.error('Invalid type:', type);
      return new Response(JSON.stringify({ success: false, error: 'Invalid type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await sendEmail({ MemberMail: managerEmail, subject, message });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
