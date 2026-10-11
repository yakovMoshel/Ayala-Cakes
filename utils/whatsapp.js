/** Site WhatsApp number, without a leading plus. */
export const WHATSAPP_PHONE = '972587995083';

/** Default text for the general site contact button. */
export const GENERAL_WHATSAPP_MESSAGE = 'היי אילה, הגעתי מהאתר ואשמח לקבל פרטים.';

export const GENERAL_WHATSAPP_URL =
  `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(GENERAL_WHATSAPP_MESSAGE)}`;
