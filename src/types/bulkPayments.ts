import { User } from './auth';

export enum BulkPaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum BulkPaymentFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface BulkPaymentGroupItem {
  id?: number;
  productCode: string;
  recipientIdentifier: string;
  amount: number;
  currencyCode: string;
  recipientName?: string;
  metadata?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface BulkPaymentGroup {
  id: number;
  name: string;
  description?: string;
  items: BulkPaymentGroupItem[];
  user?: User;
  createdDate: string;
  lastModifiedDate?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  version?: number;
  deleted?: boolean;
}

export interface CreateBulkPaymentGroupRequest {
  name: string;
  description?: string;
  items: BulkPaymentGroupItem[];
}

export interface BulkPaymentSchedule {
  id: number;
  name: string;
  group: BulkPaymentGroup;
  frequency: BulkPaymentFrequency;
  nextRunDate: string;
  lastRunDate?: string;
  active: boolean;
  user?: User;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface ScheduleRequest {
  name: string;
  groupId: number;
  frequency: BulkPaymentFrequency;
  startDate?: string;
}

export interface BulkItemDto {
  productCode: string;
  recipientIdentifier: string;
  amount: number;
  currencyCode: string;
  recipientName?: string;
  requiredFields?: Record<string, string>;
}

export interface BulkInitiateRequest {
  name: string;
  items: BulkItemDto[];
}

export interface BulkPaymentRequest {
  id: number;
  name: string;
  status: BulkPaymentStatus;
  totalAmount: number;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  createdDate: string;
  items?: BulkPaymentItem[];
  user?: User;
}

export interface BulkPaymentItem {
  id: number;
  productCode: string;
  recipientIdentifier: string;
  amount: number;
  currencyCode: string;
  status: BulkPaymentStatus;
  errorMessage?: string;
  paymentTransactionRef?: string;
  createdDate: string;
  processedDate?: string;
}
