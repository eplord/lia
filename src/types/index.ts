// Common TypeScript types shared between client and server

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Bookmark {
  id: string;
  userId: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  image: string | null;
  content: string | null;
  markdown: string | null;
  isPinned: boolean;
  isArchived: boolean;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  collectionId: string | null;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  isPublic: boolean;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
