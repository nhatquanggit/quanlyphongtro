export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RoomType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
  VIP: 'VIP',
  STUDIO: 'STUDIO',
} as const;

export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const RoomStatus = {
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const TenantStatus = {
  ACTIVE: 'ACTIVE',
  ENDING_SOON: 'ENDING_SOON',
  PAST: 'PAST',
} as const;

export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export const ContractStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
} as const;

export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export const InvoiceStatus = {
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CARD: 'CARD',
  MOMO: 'MOMO',
  ZALO_PAY: 'ZALO_PAY',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const MaintenanceType = {
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  FURNITURE: 'FURNITURE',
  OTHER: 'OTHER',
} as const;

export type MaintenanceType = (typeof MaintenanceType)[keyof typeof MaintenanceType];

export const MaintenanceUrgency = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type MaintenanceUrgency = (typeof MaintenanceUrgency)[keyof typeof MaintenanceUrgency];

export const MaintenanceStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const ExpenseCategory = {
  MAINTENANCE: 'MAINTENANCE',
  UTILITIES: 'UTILITIES',
  SALARY: 'SALARY',
  TAX: 'TAX',
  OTHER: 'OTHER',
} as const;

export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const ReportType = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export const NotificationType = {
  PAYMENT: 'PAYMENT',
  MAINTENANCE: 'MAINTENANCE',
  CONTRACT: 'CONTRACT',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];