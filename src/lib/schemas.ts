import { z } from 'zod';
import type { Kind, WorkspaceMode, TaxMode, PaymentStatus } from '@/types';

export const KindSchema = z.enum(['encaissement', 'decaissement']);
export const WorkspaceModeSchema = z.enum(['personal', 'business']);
export const TaxModeSchema = z.enum(['HT', 'TVA']);
export const PaymentStatusSchema = z.enum(['paid', 'partial', 'unpaid']);
export const BusinessProfileTypeSchema = z.enum(['freelance', 'company']);

export const SubAmountSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value_cents: z.number().int(),
});

export const OperationTypeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
  defaultAmount_cents: z.number().int().optional(),
  kind: KindSchema.optional(),
});

export const OperationSchema = z.object({
  id: z.string().min(1),
  monthId: z.string().min(1),
  label: z.string().min(1),
  operationTypeId: z.string().optional(),
  operationTypeLabel: z.string(),
  kind: KindSchema,
  amount_cents: z.number().int().nonnegative(),
  subAmounts: z.array(SubAmountSchema).optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
  notes: z.string().optional(),
  workspaceMode: WorkspaceModeSchema.optional(),
});

export const MonthSchema = z.object({
  id: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  status: z.enum(['active', 'archived']),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
});

export const ExtraFeeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  amount_cents: z.number().int(),
});

export const BusinessCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
});

export const BusinessSupplierSchema = z.object({
  id: z.string().min(1),
  brandName: z.string().min(1),
  avatarUrl: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  socialLinks: z.object({
    insta: z.string().optional(),
    fb: z.string().optional(),
    tiktok: z.string().optional(),
    other: z.string().optional(),
  }).optional(),
  merchandiseType: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
});

export const BusinessProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['product', 'service']),
  defaultPrice_cents: z.number().int().nonnegative(),
  resellerPrice_cents: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  isActive: z.boolean(),
  isFree: z.boolean().optional(),
  discountRate: z.number().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
});

export const BusinessClientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  clientType: z.enum(['perso', 'pro']).optional(),
  isVip: z.boolean().optional(),
  defaultDiscountRate: z.number().optional(),
  freeProductIds: z.array(z.string()).optional(),
  totalSpent_cents: z.number().int(),
  totalPending_cents: z.number().int(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
});

export const OrderItemSchema = z.object({
  id: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number(),
  unitCostPrice_cents: z.number().int(),
  unitSellingPrice_cents: z.number().int(),
  isFree: z.boolean().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  saveToCatalog: z.boolean().optional(),
});

export const BusinessOrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  date: z.string().datetime({ offset: true }).or(z.string()),
  clientId: z.string().optional(),
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientAddress: z.string().optional(),
  
  items: z.array(OrderItemSchema),
  
  // Legacy fields
  productName: z.string().optional(),
  quantity: z.number().optional(),
  unitCostPrice_cents: z.number().int().optional(),
  unitSellingPrice_cents: z.number().int().optional(),
  isFree: z.boolean().optional(),
  
  discountRate: z.number().optional(),
  discountAmount_cents: z.number().int().optional(),
  
  taxMode: TaxModeSchema,
  taxRate: z.number().optional(),
  amountHT_cents: z.number().int(),
  amountTVA_cents: z.number().int(),
  amountTTC_cents: z.number().int(),
  
  shippingFee_cents: z.number().int(),
  extraFees: z.array(ExtraFeeSchema),
  totalFees_cents: z.number().int(),
  
  paymentMethod: z.string().optional(),
  documentType: z.enum(['invoice', 'delivery_note', 'receipt']).optional(),
  invoiceNumber: z.string().optional(),
  deliveryNoteNumber: z.string().optional(),
  
  paymentStatus: PaymentStatusSchema,
  advancePaid_cents: z.number().int(),
  remainingBalance_cents: z.number().int(),
  dueDate: z.string().datetime({ offset: true }).or(z.string()).optional(),
  
  netProfit_cents: z.number().int(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
});

export const BusinessFeeSchema = z.object({
  id: z.string().min(1),
  date: z.string().datetime({ offset: true }).or(z.string()),
  label: z.string().min(1),
  amount_cents: z.number().int(),
  category: z.string(),
  supplierName: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  userId: z.string().min(1),
});
