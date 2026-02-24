
export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerInitials: string;
  biller: string;
  amount: number;
  status: TransactionStatus;
  agentCommission?: number;
  platformFee?: number;
}

export interface BillerPerformance {
  name: string;
  amount: number;
  percentage: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  activeUsers: number;
  newBillers: number;
  revenueChange: string;
  transactionsChange: string;
  usersChange: string;
  billersChange: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: string;
  children?: AdminMenuItem[];
}

export interface AdminMenuSection {
  id: string;
  title?: string;
  items: AdminMenuItem[];
}

export interface Agent {
  id: string;
  name: string;
  shopName: string;
  location: string;
  floatBalance: number;
  totalEarnings: number;
  status: 'Active' | 'Suspended' | 'Pending';
  onboardedDate: string;
  initials: string;
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  agentRate: number;    // % what the agent gets
  platformRate: number; // % what esebills keeps
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface SystemConfig {
  platformName: string;
  primaryColor: string;
  accentColor: string;
  globalCommission: number;
  allowAgentRegistrations: boolean;
  maintenanceMode: boolean;
  minWithdrawal: number;
  maxDailyTransaction: number;
}
