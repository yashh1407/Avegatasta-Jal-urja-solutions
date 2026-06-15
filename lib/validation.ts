import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(1).max(5000),
  gstin: z.string().max(15).optional().or(z.literal('')),
});

export const inquirySchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(1).max(5000),
});

export const orderSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  phone: z.string().max(20).optional(),
  products: z.array(z.unknown()).max(100),
  total: z.number().nonnegative(),
});

export const registrationSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  phone: z.string().min(1).max(20),
  gstin: z.string().max(15).optional().or(z.literal('')),
});

export const productInquirySchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(255).optional().or(z.literal('')),
  message: z.string().min(1).max(5000),
  productName: z.string().min(1).max(255),
  productId: z.string().max(255).optional(),
  gstin: z.string().max(15).optional().or(z.literal('')),
});

export const clientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  address: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(20).optional(),
  company_name: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
});

export const clientProductSchema = z.object({
  product_id: z.string().max(255).optional(),
  product_name: z.string().min(1).max(255),
  serial_number: z.string().max(255).optional(),
  batch_number: z.string().max(100).optional(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  install_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  warranty_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  next_service_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type ProductInquiryInput = z.infer<typeof productInquirySchema>;
export const amcPlanSchema = z.object({
  name: z.string().min(1).max(255),
  duration_months: z.number().int().positive(),
  coverage_description: z.string().max(5000).optional(),
  price: z.number().nonnegative(),
  service_interval_days: z.number().int().positive(),
});

export const clientAmcSchema = z.object({
  amc_plan_id: z.number().int().positive(),
  client_product_id: z.number().int().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'expired', 'renewed']).default('active'),
  notes: z.string().max(5000).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientProductInput = z.infer<typeof clientProductSchema>;
export type AmcPlanInput = z.infer<typeof amcPlanSchema>;
export type ClientAmcInput = z.infer<typeof clientAmcSchema>;

// Client Portal Auth
export const clientLoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
});

export const clientForgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export const clientResetPasswordSchema = z.object({
  token: z.string().min(1).max(255),
  password: z.string().min(8).max(255),
});

// Behavior Analytics Event
export const clientEventSchema = z.object({
  event_type: z.enum(['view', 'search']),
  entity_id: z.string().max(255).optional(),
  query: z.string().max(500).optional(),
});

export type ClientLoginInput = z.infer<typeof clientLoginSchema>;
export type ClientForgotPasswordInput = z.infer<typeof clientForgotPasswordSchema>;
export type ClientResetPasswordInput = z.infer<typeof clientResetPasswordSchema>;
export type ClientEventInput = z.infer<typeof clientEventSchema>;

export const enterpriseInquirySchema = z.object({
  name: z.string().min(1).max(255),
  company: z.string().min(1).max(255),
  designation: z.string().max(255).optional(),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(255),
  project_type: z.string().max(255).optional(),
  scale: z.string().max(100).optional(),
  message: z.string().min(1).max(5000),
  gstin: z.string().max(15).optional().or(z.literal('')),
});

export type EnterpriseInquiryInput = z.infer<typeof enterpriseInquirySchema>;

// Team Members
export const teamMemberSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.enum(['Sales', 'Support', 'Technical', 'Management', 'Other']),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  avatar_url: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  joined_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
});
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

// Brands
export const brandSchema = z.object({
  name: z.string().min(1).max(255),
  logo_url: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  website: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});
export type BrandInput = z.infer<typeof brandSchema>;

// Admin Orders
export const adminOrderSchema = z.object({
  client_id: z.number().int().positive(),
  order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']).default('pending'),
  total_amount: z.number().nonnegative().default(0),
  notes: z.string().max(5000).optional(),
});
export type AdminOrderInput = z.infer<typeof adminOrderSchema>;

// Admin Order Items
export const adminOrderItemSchema = z.object({
  product_id: z.string().max(255).optional().nullable(),
  product_name: z.string().min(1).max(255),
  quantity: z.coerce.number().int().positive().default(1),
  unit_price: z.coerce.number().nonnegative(),
  serial_number: z.string().max(255).optional().nullable(),
  install_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  warranty_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
});
export type AdminOrderItemInput = z.infer<typeof adminOrderItemSchema>;

// Admin Order Addons
export const adminOrderAddonSchema = z.object({
  addon_name: z.string().min(1).max(255),
  addon_description: z.string().max(5000).optional(),
  price: z.number().nonnegative().default(0),
  active: z.boolean().default(true),
});
export type AdminOrderAddonInput = z.infer<typeof adminOrderAddonSchema>;

// Admin Invoices
export const adminInvoiceSchema = z.object({
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  amount: z.number().nonnegative(),
  status: z.enum(['draft', 'sent', 'paid']).default('draft'),
  pdf_url: z.string().max(500).optional(),
});
export type AdminInvoiceInput = z.infer<typeof adminInvoiceSchema>;

// Product Lifecycle Events
export const productLifecycleEventSchema = z.object({
  event_type: z.enum(['installed', 'serviced', 'repaired', 'replaced', 'retired']),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(5000).optional(),
  performed_by: z.string().max(255).optional(),
});
export type ProductLifecycleEventInput = z.infer<typeof productLifecycleEventSchema>;
