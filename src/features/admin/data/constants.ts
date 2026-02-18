
import { Transaction, TransactionStatus, BillerPerformance, DashboardStats, NavItem, ServiceCategory, SystemConfig, Agent, FAQItem } from './types';

export const MOCK_STATS: DashboardStats = {
  totalRevenue: 240500,
  totalTransactions: 12450,
  activeUsers: 8200,
  newBillers: 14,
  revenueChange: '+12.5% vs LW',
  transactionsChange: '+8.2% vs LW',
  usersChange: '+5.1% vs LW',
  billersChange: '+2.4% vs LW',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: 'May 24, 2024',
    time: '14:23 PM',
    customerName: 'Tinashe Musekiwa',
    customerInitials: 'TM',
    biller: 'ZESA Electricity',
    amount: 150.00,
    status: TransactionStatus.SUCCESS,
    agentCommission: 3.75,
    platformFee: 1.50
  },
  {
    id: '2',
    date: 'May 24, 2024',
    time: '13:58 PM',
    customerName: 'Chipo Chino',
    customerInitials: 'CC',
    biller: 'ZINWA Water',
    amount: 45.00,
    status: TransactionStatus.PENDING,
    agentCommission: 1.12,
    platformFee: 0.45
  },
  {
    id: '4',
    date: 'May 23, 2024',
    time: '17:45 PM',
    customerName: 'Grace Nyathi',
    customerInitials: 'GN',
    biller: 'Econet Broadband',
    amount: 10.00,
    status: TransactionStatus.SUCCESS,
    agentCommission: 0.50,
    platformFee: 0.20
  },
];

export const MOCK_AGENTS: Agent[] = [
  { id: 'AG-10293', name: 'Tinashe Chando', shopName: 'TC General Store', location: 'Harare CBD', floatBalance: 452.10, totalEarnings: 1240.50, status: 'Active', onboardedDate: 'Jan 12, 2024', initials: 'TC' },
  { id: 'AG-10295', name: 'Memory Moyo', shopName: 'Memory Communications', location: 'Bulawayo', floatBalance: 89.20, totalEarnings: 450.00, status: 'Active', onboardedDate: 'Feb 05, 2024', initials: 'MM' },
  { id: 'AG-10301', name: 'Sipho Sibanda', shopName: 'Sipho Tech Hub', location: 'Gweru', floatBalance: 1200.00, totalEarnings: 2100.80, status: 'Active', onboardedDate: 'Mar 15, 2024', initials: 'SS' },
  { id: 'AG-10310', name: 'Farai Gumbo', shopName: 'Gumbo Kiosk', location: 'Mutare', floatBalance: 0.00, totalEarnings: 120.00, status: 'Suspended', onboardedDate: 'Apr 20, 2024', initials: 'FG' },
  { id: 'AG-10315', name: 'Rutendo Mpofu', shopName: 'Ru Enterprise', location: 'Harare West', floatBalance: 25.50, totalEarnings: 88.00, status: 'Pending', onboardedDate: 'May 02, 2024', initials: 'RM' },
];

export const BILLER_PERFORMANCE: BillerPerformance[] = [
  { name: 'ZESA (Electricity)', amount: 84200, percentage: 75 },
  { name: 'ZINWA (Water)', amount: 42500, percentage: 45 },
  { name: 'TelOne (Internet)', amount: 31200, percentage: 35 },
  { name: 'Econet (Airtime)', amount: 28000, percentage: 30 },
  { name: 'NetOne (Airtime)', amount: 12000, percentage: 15 },
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
  { id: 'billers', label: 'Billers', icon: 'corporate_fare' },
  { id: 'agents', label: 'Agents', icon: 'storefront' },
  { id: 'commissions', label: 'Commissions', icon: 'payments' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'messaging', label: 'SMS & Email', icon: 'chat_bubble' },
  { id: 'reports', label: 'Reports', icon: 'analytics' },
];

export const PREFERENCE_ITEMS: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: 'account_circle' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'support', label: 'Support', icon: 'help' },
];

export const REVENUE_DATA = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 8000 },
  { month: 'Jun', revenue: 7000 },
];

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  platformName: 'EseBills',
  primaryColor: '#7e56c2',
  accentColor: '#a3e635',
  globalCommission: 2.5,
  allowAgentRegistrations: true,
  maintenanceMode: false,
  minWithdrawal: 10.00,
  maxDailyTransaction: 5000.00,
};

export const INITIAL_CATEGORIES: ServiceCategory[] = [
  { id: 'util', label: 'Utilities', icon: 'bolt', isActive: true, agentRate: 2.5, platformRate: 1.0 },
  { id: 'air', label: 'Airtime', icon: 'cell_tower', isActive: true, agentRate: 5.0, platformRate: 2.0 },
  { id: 'net', label: 'Internet', icon: 'wifi', isActive: true, agentRate: 3.5, platformRate: 1.5 },
  { id: 'edu', label: 'Education', icon: 'school', isActive: true, agentRate: 1.5, platformRate: 0.5 },
  { id: 'ins', label: 'Insurance', icon: 'verified_user', isActive: true, agentRate: 4.0, platformRate: 2.5 },
];

export const INITIAL_FAQS: FAQItem[] = [
  { id: '1', category: 'General', question: 'What is EseBills?', answer: 'EseBills is a unified digital payment platform that allows you to pay utility bills (Electricity, Water), buy airtime, and settle school or corporate fees instantly from one secure dashboard.' },
  { id: '2', category: 'General', question: 'Do I need an account to pay a bill?', answer: 'You can pay bills as a guest for many services, but creating an EseWallet account allows you to track your payment history, save account numbers for one-click payments, and maintain a pre-funded balance for faster checkout.' },
  { id: '3', category: 'Payments', question: 'How long does a ZESA token take to arrive?', answer: 'ZESA prepaid tokens are generated instantly. You will see the token on your screen immediately after payment, and it will also be sent to you via SMS and Email.' },
  { id: '4', category: 'Payments', question: 'What currencies are supported?', answer: 'We currently support ZiG (Zimbabwe Gold) and USD. You can switch your preferred settlement currency in your account settings or during the checkout process.' },
  { id: '5', category: 'Security', question: 'Is my payment information secure?', answer: 'Yes. EseBills uses bank-grade 256-bit SSL encryption. We never store your mobile money PINs or banking passwords. All sensitive authorizations happen directly on the provider\'s secure network.' },
  { id: '6', category: 'Agents', question: 'How do I become an EseAgent?', answer: 'Click on "Register as EseAgent" on our home page. Once your application is reviewed and approved, you can fund your float and start selling services to earn commissions immediately.' },
  { id: '7', category: 'General', question: 'What happens if a transaction fails?', answer: 'If a transaction fails but funds were deducted from your wallet, our system automatically initiates a reversal within 15 minutes. For mobile money failures, reversals depend on the network provider (usually within 1-2 hours).' },
  { id: '8', category: 'Payments', question: 'Can I pay for multiple accounts at once?', answer: 'Yes! Our Enterprise "Bulk Payment" feature allows corporate users and agents to upload CSV or Excel files containing hundreds of meter or account numbers for automated batch processing.' },
];
