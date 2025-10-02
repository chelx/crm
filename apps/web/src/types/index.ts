export interface User {
  id: string;
  email: string;
  role: 'CSO' | 'MANAGER';
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
  channel: 'email' | 'phone' | 'chat' | 'social';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export interface Reply {
  id: string;
  feedbackId: string;
  content: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  feedback?: Feedback;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  metadata: Record<string, any>;
  createdAt: string;
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
