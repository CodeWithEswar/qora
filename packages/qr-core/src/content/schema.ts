import { z } from "zod";

/**
 * NXTQR — Flagship QR Content Schemas (V1)
 * Discriminated union of strongly-typed content payloads spanning:
 * 1. Web Link (URL)
 * 2. Plain Text
 * 3. Wi-Fi Access
 * 4. Contact Card (vCard)
 * 5. Smart App Link
 * 6. Storage-backed File & PDF
 * 7. Platform Link (Social, Business, Media, Commerce)
 * 8. Communication (Email, Phone, SMS)
 * 9. Location (Map)
 * 10. Calendar Event
 * 11. Payment URI (UPI, PayPal, Venmo, Cash App, PIX)
 */

export const UrlQrContentSchema = z.object({
  type: z.literal("url"),
  url: z
    .string()
    .min(1, "URL is required")
    .refine((val) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(val), {
      message: "Please enter a valid HTTP or HTTPS URL",
    }),
  isDynamic: z.boolean().default(true),
  utmSource: z.string().max(64).optional(),
  utmMedium: z.string().max(64).optional(),
  utmCampaign: z.string().max(64).optional(),
});
export type UrlQrContent = z.infer<typeof UrlQrContentSchema>;

export const TextQrContentSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1, "Text content is required").max(2000, "Maximum 2000 characters"),
});
export type TextQrContent = z.infer<typeof TextQrContentSchema>;

export const WifiSecuritySchema = z.enum(["WPA", "WEP", "nopass"]);
export type WifiSecurity = z.infer<typeof WifiSecuritySchema>;

export const WifiQrContentSchema = z.object({
  type: z.literal("wifi"),
  ssid: z.string().min(1, "Network name (SSID) is required").max(32, "SSID cannot exceed 32 characters"),
  security: WifiSecuritySchema.default("WPA"),
  password: z.string().max(64).default(""),
  hidden: z.boolean().default(false),
});
export type WifiQrContent = z.infer<typeof WifiQrContentSchema>;

export const VCardQrContentSchema = z.object({
  type: z.literal("vcard"),
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().max(60).default(""),
  organization: z.string().max(100).default(""),
  jobTitle: z.string().max(100).default(""),
  phone: z.string().max(30).default(""),
  mobile: z.string().max(30).default(""),
  email: z.string().email().or(z.literal("")).default(""),
  website: z.string().max(200).default(""),
  address: z.string().max(200).default(""),
  note: z.string().max(500).default(""),
});
export type VCardQrContent = z.infer<typeof VCardQrContentSchema>;

export const AppQrContentSchema = z.object({
  type: z.literal("app"),
  appName: z.string().min(1, "App name is required").max(100),
  iosUrl: z.string().url().or(z.literal("")).default(""),
  androidUrl: z.string().url().or(z.literal("")).default(""),
  fallbackUrl: z.string().url().min(1, "Fallback web URL is required"),
});
export type AppQrContent = z.infer<typeof AppQrContentSchema>;

export const FileQrContentSchema = z.object({
  type: z.literal("file"),
  assetId: z.string().min(1, "Asset ID is required"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1, "MIME type is required"),
  downloadUrl: z.string().url("Must be a valid download URL"),
});
export type FileQrContent = z.infer<typeof FileQrContentSchema>;

export const PlatformLinkQrContentSchema = z.object({
  type: z.literal("platform_link"),
  platform: z.string().min(1, "Platform identifier is required"),
  targetUrl: z.string().min(1, "Target URL is required"),
  username: z.string().max(100).optional(),
  displayName: z.string().max(100).optional(),
  isDynamic: z.boolean().default(true),
});
export type PlatformLinkQrContent = z.infer<typeof PlatformLinkQrContentSchema>;

export const EmailQrContentSchema = z.object({
  type: z.literal("email"),
  recipient: z.string().email("Valid recipient email is required"),
  subject: z.string().max(200).default(""),
  body: z.string().max(1000).default(""),
});
export type EmailQrContent = z.infer<typeof EmailQrContentSchema>;

export const PhoneQrContentSchema = z.object({
  type: z.literal("phone"),
  phoneNumber: z.string().min(3, "Phone number is required").max(30),
});
export type PhoneQrContent = z.infer<typeof PhoneQrContentSchema>;

export const SmsQrContentSchema = z.object({
  type: z.literal("sms"),
  phoneNumber: z.string().min(3, "Phone number is required").max(30),
  message: z.string().max(500).default(""),
});
export type SmsQrContent = z.infer<typeof SmsQrContentSchema>;

export const LocationQrContentSchema = z.object({
  type: z.literal("location"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().max(100).default(""),
});
export type LocationQrContent = z.infer<typeof LocationQrContentSchema>;

export const CalendarQrContentSchema = z.object({
  type: z.literal("calendar"),
  title: z.string().min(1, "Event title is required").max(100),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().max(200).default(""),
  description: z.string().max(500).default(""),
});
export type CalendarQrContent = z.infer<typeof CalendarQrContentSchema>;

export const PaymentSchemeSchema = z.enum(["upi", "paypal", "venmo", "cashapp", "pix"]);
export type PaymentScheme = z.infer<typeof PaymentSchemeSchema>;

export const PaymentQrContentSchema = z.object({
  type: z.literal("payment"),
  scheme: PaymentSchemeSchema.default("upi"),
  payeeAddress: z.string().min(1, "Payee identifier/VPA is required"),
  payeeName: z.string().max(100).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().max(10).default("INR"),
  note: z.string().max(200).optional(),
});
export type PaymentQrContent = z.infer<typeof PaymentQrContentSchema>;

export const QrContentV1Schema = z.discriminatedUnion("type", [
  UrlQrContentSchema,
  TextQrContentSchema,
  WifiQrContentSchema,
  VCardQrContentSchema,
  AppQrContentSchema,
  FileQrContentSchema,
  PlatformLinkQrContentSchema,
  EmailQrContentSchema,
  PhoneQrContentSchema,
  SmsQrContentSchema,
  LocationQrContentSchema,
  CalendarQrContentSchema,
  PaymentQrContentSchema,
]);
export type QrContentV1 = z.infer<typeof QrContentV1Schema>;
export type QrType = QrContentV1["type"];
