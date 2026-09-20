import {
  QrContentV1,
  UrlQrContent,
  TextQrContent,
  WifiQrContent,
  VCardQrContent,
  AppQrContent,
  FileQrContent,
  PlatformLinkQrContent,
  EmailQrContent,
  PhoneQrContent,
  SmsQrContent,
  LocationQrContent,
  CalendarQrContent,
  PaymentQrContent,
} from "./schema";

/**
 * NXTQR — Content Encoders
 * Converts domain content structures into RFC/standardized QR payload strings.
 */

export function encodeUrlContent(content: {
  url: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): string {
  try {
    const parsed = new URL(content.url);
    if (content.utmSource) parsed.searchParams.set("utm_source", content.utmSource);
    if (content.utmMedium) parsed.searchParams.set("utm_medium", content.utmMedium);
    if (content.utmCampaign) parsed.searchParams.set("utm_campaign", content.utmCampaign);
    return parsed.toString();
  } catch {
    return content.url;
  }
}

export function encodeTextContent(content: { text: string }): string {
  return content.text;
}

export function encodeWifiContent(content: {
  ssid: string;
  security: "WPA" | "WEP" | "nopass";
  password?: string;
  hidden?: boolean;
}): string {
  // Escape special characters in SSID and Password: \ , ; : "
  const escapeWifi = (str: string) => str.replace(/([\\;,:"\\])/g, "\\$1");
  const s = escapeWifi(content.ssid);
  const p = content.password ? escapeWifi(content.password) : "";
  const t = content.security === "nopass" ? "nopass" : content.security;
  const h = content.hidden ? "true" : "false";

  return `WIFI:T:${t};S:${s};P:${p};H:${h};;`;
}

export function encodeVCardContent(content: {
  firstName: string;
  lastName?: string;
  organization?: string;
  jobTitle?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  address?: string;
  note?: string;
}): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  const lastName = content.lastName || "";
  const firstName = content.firstName || "";
  lines.push(`N:${lastName};${firstName};;;`);
  lines.push(`FN:${[firstName, lastName].filter(Boolean).join(" ")}`);

  if (content.organization) lines.push(`ORG:${content.organization}`);
  if (content.jobTitle) lines.push(`TITLE:${content.jobTitle}`);
  if (content.phone) lines.push(`TEL;TYPE=WORK,VOICE:${content.phone}`);
  if (content.mobile) lines.push(`TEL;TYPE=CELL,VOICE:${content.mobile}`);
  if (content.email) lines.push(`EMAIL;TYPE=INTERNET:${content.email}`);
  if (content.website) lines.push(`URL:${content.website}`);
  if (content.address) lines.push(`ADR;TYPE=WORK:;;${content.address};;;;`);
  if (content.note) lines.push(`NOTE:${content.note}`);

  lines.push("END:VCARD");
  return lines.join("\n");
}

export function encodeAppContent(content: {
  iosUrl?: string;
  androidUrl?: string;
  fallbackUrl: string;
}): string {
  // Static encoder returns fallback URL. Dynamic app QR routing is handled by the edge resolver.
  return content.fallbackUrl || content.iosUrl || content.androidUrl || "";
}

export function encodeFileContent(content: { downloadUrl: string }): string {
  return content.downloadUrl;
}

export function encodePlatformLinkContent(content: PlatformLinkQrContent): string {
  return content.targetUrl;
}

export function encodeEmailContent(content: EmailQrContent): string {
  const params = new URLSearchParams();
  if (content.subject) params.set("subject", content.subject);
  if (content.body) params.set("body", content.body);
  const query = params.toString();
  return query ? `mailto:${content.recipient}?${query}` : `mailto:${content.recipient}`;
}

export function encodePhoneContent(content: PhoneQrContent): string {
  // RFC 3966 format
  const sanitized = content.phoneNumber.replace(/[^\d+*#]/g, "");
  return `tel:${sanitized}`;
}

export function encodeSmsContent(content: SmsQrContent): string {
  const sanitized = content.phoneNumber.replace(/[^\d+*#]/g, "");
  if (content.message) {
    return `sms:${sanitized}?body=${encodeURIComponent(content.message)}`;
  }
  return `sms:${sanitized}`;
}

export function encodeLocationContent(content: LocationQrContent): string {
  const { latitude, longitude, label } = content;
  if (label) {
    return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(label)})`;
  }
  return `geo:${latitude},${longitude}`;
}

export function encodeCalendarContent(content: CalendarQrContent): string {
  const cleanDate = (d: string) => d.replace(/[-:]/g, "").split(".")[0];
  const start = cleanDate(content.startDate);
  const end = cleanDate(content.endDate);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NXTQR//QR Calendar//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${content.title}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
  ];

  if (content.location) lines.push(`LOCATION:${content.location}`);
  if (content.description) lines.push(`DESCRIPTION:${content.description}`);

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\n");
}

export function encodePaymentContent(content: PaymentQrContent): string {
  const { scheme, payeeAddress, payeeName, amount, currency, note } = content;

  if (scheme === "upi") {
    const params = new URLSearchParams();
    params.set("pa", payeeAddress);
    if (payeeName) params.set("pn", payeeName);
    if (amount) params.set("am", amount.toFixed(2));
    params.set("cu", currency || "INR");
    if (note) params.set("tn", note);
    return `upi://pay?${params.toString()}`;
  }

  if (scheme === "paypal") {
    const cleanUser = payeeAddress.replace(/^https?:\/\/(www\.)?paypal\.me\//i, "");
    return amount
      ? `https://paypal.me/${cleanUser}/${amount}`
      : `https://paypal.me/${cleanUser}`;
  }

  if (scheme === "venmo") {
    const cleanUser = payeeAddress.replace(/^https?:\/\/(www\.)?venmo\.com\//i, "");
    return `https://venmo.com/${cleanUser}`;
  }

  if (scheme === "cashapp") {
    const cleanCashtag = payeeAddress.replace(/^[$]/, "").replace(/^https?:\/\/(www\.)?cash\.app\/\$/i, "");
    return `https://cash.app/$${cleanCashtag}`;
  }

  if (scheme === "pix") {
    // PIX key or payment string
    return payeeAddress;
  }

  return payeeAddress;
}

/**
 * Encodes any supported QrContentV1 payload into its standard raw string representation.
 */
export function encodeQrContent(content: QrContentV1): string {
  switch (content.type) {
    case "url":
      return encodeUrlContent(content);
    case "text":
      return encodeTextContent(content);
    case "wifi":
      return encodeWifiContent(content);
    case "vcard":
      return encodeVCardContent(content);
    case "app":
      return encodeAppContent(content);
    case "file":
      return encodeFileContent(content);
    case "platform_link":
      return encodePlatformLinkContent(content);
    case "email":
      return encodeEmailContent(content);
    case "phone":
      return encodePhoneContent(content);
    case "sms":
      return encodeSmsContent(content);
    case "location":
      return encodeLocationContent(content);
    case "calendar":
      return encodeCalendarContent(content);
    case "payment":
      return encodePaymentContent(content);
  }
}
