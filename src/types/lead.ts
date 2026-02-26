export type LeadType = "INQUIRY" | "SELL_TO_US" | "CHAT";
export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";
export type LeadSource = "WEBSITE" | "WHATSAPP" | "CHATBOT" | "REFERRAL" | "WALK_IN" | "OTHER";

export interface ILead {
  _id: string;
  type: LeadType;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  notes: string;
  status: LeadStatus;
  assignedUserId?: string;
  relatedProductId?: string;
  threadId?: string;
  tags: string[];
  images?: string[]; // For sell-to-us photo uploads
  desiredPrice?: number;
  currency?: string;
  productBrand?: string;
  productModel?: string;
  productReference?: string;
  productYear?: number;
  productCondition?: string;
  createdAt: Date;
  updatedAt: Date;
}
