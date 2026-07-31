export type Role = "superadmin" | "admin" | "seller" | "buyer";

export type PlanStatus = "none" | "pending_activation" | "active" | "expired";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  activePlan?: string | null;
  planStatus: PlanStatus;
  listingsRemaining: number;
  leadsRemaining: number;
  planStartDate?: string | null;
  planExpiryDate?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type ListingType = "sale" | "rental";
export type PriceUnit = "total" | "per_month";
export type PropertyStatus = "pending" | "approved" | "rejected";

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  pincode?: string;
}

export interface PropertySpecs {
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
}

export interface PropertyImage {
  url: string;
  publicId?: string;
}

export interface Property {
  _id: string;
  seller: string | User;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: string;
  price: number;
  priceUnit: PriceUnit;
  location: PropertyLocation;
  specs?: PropertySpecs;
  images: PropertyImage[];
  status: PropertyStatus;
  rejectionReason?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "shared" | "disqualified";

export interface Lead {
  _id: string;
  property: string | Property;
  seller: string | User;
  buyer: string | User;
  status: LeadStatus;
  adminNotes?: string;
  qualifiedAt?: string | null;
  sharedAt?: string | null;
  createdAt: string;
}

export type PlanAudience = "seller" | "buyer";
export type TargetListingType = "sale" | "rental" | "both";

export interface Plan {
  _id: string;
  name: string;
  audience: PlanAudience;
  targetListingType: TargetListingType;
  listingLimit: number;
  qualifiedLeadsLimit: number;
  validityDays: number | null;
  price: number;
  paymentQr?: { url: string; publicId?: string };
  upiId?: string;
  isActive: boolean;
}

export type PlanPurchaseStatus = "pending_activation" | "active" | "expired" | "refunded" | "cancelled";
export type RefundStatus = "none" | "requested" | "approved" | "rejected";

export interface PlanPurchase {
  _id: string;
  purchasedBy: string | User;
  plan: string | Plan;
  planSnapshot: {
    name: string;
    audience: PlanAudience;
    targetListingType: TargetListingType;
    listingLimit: number;
    qualifiedLeadsLimit: number;
    validityDays: number | null;
    price: number;
    paymentQr?: { url: string; publicId?: string };
    upiId?: string;
  };
  paymentScreenshot?: { url: string };
  status: PlanPurchaseStatus;
  requestedAt: string;
  activatedAt?: string | null;
  expiresAt?: string | null;
  refundStatus: RefundStatus;
  refundReason?: string | null;
}

export type BuyerRequestStatus = "new" | "in_progress" | "matched" | "closed";

export interface BuyerRequest {
  _id: string;
  buyer: string | User;
  listingType: ListingType;
  propertyType?: string;
  preferredCity: string;
  budgetMin?: number;
  budgetMax?: number;
  notes?: string;
  status: BuyerRequestStatus;
  matchedProperties: (string | Property)[];
  adminNotes?: string;
  matchedAt?: string | null;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: { url: string; publicId?: string };
  author: string | User;
  categories: string[];
  tags: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export interface ApiError {
  message: string;
  error?: string;
}
