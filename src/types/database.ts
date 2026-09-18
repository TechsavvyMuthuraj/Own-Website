export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type ResourceType =
  | "DOWNLOAD"
  | "EXTERNAL_LINK"
  | "MULTIPLE_LINKS"
  | "FILE"
  | "SOFTWARE"
  | "APK"
  | "GAME"
  | "WEBSITE"
  | "DIGITAL_PRODUCT"
  | "MEDIA"
  | "OTHER";

export type AccessType = "FREE" | "PAID" | "EXTERNAL";

export type ResourceStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED" | "DELETED";

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type DownloadLinkType = "PRIMARY" | "MIRROR" | "R2_FILE" | "EXTERNAL";

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export type AnnouncementLocation = "TOP_BAR" | "HOMEPAGE" | "POPUP" | "NOTIFICATION";

export type AdPlacementLocation =
  | "HEADER"
  | "HOMEPAGE"
  | "IN_FEED"
  | "SIDEBAR"
  | "RESOURCE_PAGE"
  | "FOOTER";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  icon_url: string | null;
  resource_type: ResourceType;
  access_type: AccessType;
  price: number;
  sale_price: number | null;
  currency: string;
  platform: string | null;
  version: string | null;
  version_code: number | null;
  package_name: string | null;
  size_bytes: number | null;
  developer: string | null;
  license: string | null;
  official_url: string | null;
  download_type: string | null;
  status: ResourceStatus;
  featured: boolean;
  changelog: string | null;
  system_requirements: string | null;
  features: string[] | null;
  tags: string[] | null;
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Joins
  category?: Category | null;
  images?: ResourceImage[];
  download_links?: DownloadLink[];
}

export interface ResourceImage {
  id: string;
  resource_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface DownloadLink {
  id: string;
  resource_id: string;
  title: string;
  link_type: DownloadLinkType;
  url: string | null;
  r2_key: string | null;
  size_bytes: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_provider: string | null;
  payment_id: string | null;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  items?: OrderItem[];
  user?: Profile | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  resource_id: string;
  price: number;
  created_at: string;
  // Joins
  resource?: Resource | null;
}

export interface Entitlement {
  id: string;
  user_id: string;
  resource_id: string;
  order_id: string | null;
  status: "ACTIVE" | "REVOKED";
  created_at: string;
  // Joins
  resource?: Resource | null;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  times_used: number;
  per_user_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DownloadEvent {
  id: string;
  resource_id: string;
  user_id: string | null;
  ip_hash: string | null;
  downloaded_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
  resource?: Resource;
}

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  cta_text: string | null;
  cta_url: string | null;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  location: AnnouncementLocation;
  created_at: string;
}

export interface AdPlacement {
  id: string;
  title: string;
  location: AdPlacementLocation;
  provider: string;
  ad_code: string;
  priority: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  admin?: Profile | null;
}

export interface SiteSetting {
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  updated_at: string;
}
