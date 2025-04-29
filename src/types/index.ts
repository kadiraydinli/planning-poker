// Global interfaces and types for the application

export interface Vote {
  [key: string]: string;
}

export interface User {
  name: string;
  isAdmin: boolean;
  joinedAt: string;
  sessionId?: string;
  userId?: string;
  isConnected?: boolean;
  deletedAt?: string;
}

export interface Users {
  [key: string]: User;
}

export interface Room {
  name: string;
  scaleType: string;
  votes: Vote;
  revealed: boolean;
  users: Users;
  adminId?: string;
  deletedAt?: string;
  chartType?: 'pie' | 'bar';
}

export interface VoteDataItem {
  name: string;
  value: number;
  point: string;
  count: number;
} 