import { Browser, BrowserContext, Page } from 'playwright';

/**
 * Interface for Login Session management
 * 
 * Represents an active Playwright login session with
 * browser, context, and page instances
 */
export interface LoginSession {
  /** Unique session identifier */
  sessionId: string;
  
  /** Timestamp when login was initiated */
  loginTime: Date;
  
  /** Playwright Browser instance */
  browser: Browser;
  
  /** Playwright BrowserContext instance */
  context: BrowserContext;
  
  /** Playwright Page instance */
  page: Page;
  
  /** Whether the session is currently active */
  isActive: boolean;
  
  /** Optional: Last activity timestamp */
  lastActivity?: Date;
  
  /** Optional: User identifier associated with session */
  userId?: string;
  
  /** Optional: Bank/financial institution identifier */
  institutionId?: string;
}

/**
 * Interface for Account Information
 */
export interface AccountInfo {
  /** Account identifier */
  accountId: string;
  
  /** Account name/description */
  accountName: string;
  
  /** Account type (checking, savings, credit, etc.) */
  accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';
  
  /** Current balance */
  balance: number;
  
  /** Available balance (for credit accounts) */
  availableBalance?: number;
  
  /** Account number (masked) */
  accountNumber: string;
  
  /** Currency code */
  currency: string;
  
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Interface for Transaction Information
 */
export interface Transaction {
  /** Transaction ID */
  transactionId: string;
  
  /** Account ID this transaction belongs to */
  accountId: string;
  
  /** Transaction date */
  date: Date;
  
  /** Transaction description */
  description: string;
  
  /** Transaction amount (negative for debits, positive for credits) */
  amount: number;
  
  /** Transaction category */
  category?: string;
  
  /** Merchant name */
  merchant?: string;
  
  /** Transaction status */
  status: 'pending' | 'posted' | 'cleared';
  
  /** Reference number */
  referenceNumber?: string;
}

/**
 * Interface for Slack Bot Configuration
 */
export interface SlackBotConfig {
  /** Slack Bot Token */
  botToken: string;
  
  /** Slack Signing Secret */
  signingSecret: string;
  
  /** Slack App Token */
  appToken: string;
  
  /** Default channel for notifications */
  defaultChannel: string;
  
  /** Allowed users/channels */
  allowedUsers?: string[];
  allowedChannels?: string[];
}

/**
 * Interface for Banking Configuration
 */
export interface BankingConfig {
  /** Bank login URL */
  loginUrl: string;
  
  /** Username */
  username: string;
  
  /** Password */
  password: string;
  
  /** MFA method */
  mfaMethod: 'manual' | 'sms' | 'email' | 'totp' | 'push';
  
  /** Institution identifier */
  institutionId: string;
  
  /** Institution name */
  institutionName: string;
}

/**
 * Interface for Scheduled Report Configuration
 */
export interface ReportSchedule {
  /** Report type */
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  
  /** Cron expression for scheduling */
  cronExpression: string;
  
  /** Target channel */
  channel: string;
  
  /** Report format */
  format: 'summary' | 'detailed' | 'chart';
  
  /** Whether the report is active */
  isActive: boolean;
}

/**
 * Interface for Bot Command Response
 */
export interface BotCommandResponse {
  /** Response message */
  text: string;
  
  /** Response type */
  response_type: 'in_channel' | 'ephemeral';
  
  /** Optional attachments */
  attachments?: any[];
  
  /** Optional blocks (for rich formatting) */
  blocks?: any[];
}

/**
 * Interface for Error Handling
 */
export interface BotError {
  /** Error code */
  code: string;
  
  /** Error message */
  message: string;
  
  /** Error details */
  details?: any;
  
  /** Timestamp */
  timestamp: Date;
  
  /** User ID who triggered the error */
  userId?: string;
  
  /** Session ID if applicable */
  sessionId?: string;
}

/**
 * Type for MFA methods
 */
export type MFAMethod = 'manual' | 'sms' | 'email' | 'totp' | 'push';

/**
 * Type for supported account types
 */
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';

/**
 * Type for transaction status
 */
export type TransactionStatus = 'pending' | 'posted' | 'cleared';

/**
 * Type for report types
 */
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';
