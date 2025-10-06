export type UserRole = 'CSO' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  customerId: string;
  message: string;
  channel: string;
  createdAt: string;
  customer?: Customer;
  replies?: Reply[];
}

export type ReplyStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Reply {
  id: string;
  feedbackId: string;
  content: string;
  status: ReplyStatus;
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  feedback?: Feedback;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  actor?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
