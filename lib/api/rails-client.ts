/**
 * Rails API Client
 * 
 * Handles communication with Rails backend API
 */

const RAILS_API_URL = process.env.NEXT_PUBLIC_RAILS_API_URL || 'http://localhost:3000';

export class RailsAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'RailsAPIError';
  }
}

/**
 * Main API client for Rails backend
 */
export async function railsAPI<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get token from localStorage (client-side only)
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('rails_auth_token') 
    : null;

  const url = `${RAILS_API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJSON ? await response.json() : { error: response.statusText };
      throw new RailsAPIError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Return parsed JSON or empty object
    return isJSON ? await response.json() : ({} as T);
  } catch (error) {
    if (error instanceof RailsAPIError) {
      throw error;
    }
    throw new RailsAPIError(
      error instanceof Error ? error.message : 'Unknown error',
      0
    );
  }
}

/**
 * Authentication helpers
 */
export const auth = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    const response = await railsAPI<{ user: any; token?: string }>('/api/v1/login', {
      method: 'POST',
      body: JSON.stringify({ user: { email, password } }),
    });

    // Store token from Authorization header or response body
    if (typeof window !== 'undefined') {
      const token = response.token;
      if (token) {
        localStorage.setItem('rails_auth_token', token);
      }
    }

    return response;
  },

  /**
   * Logout current user
   */
  async logout() {
    try {
      await railsAPI('/api/v1/logout', { method: 'DELETE' });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rails_auth_token');
      }
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return railsAPI<{ user: any }>('/api/v1/me');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('rails_auth_token');
  },
};

/**
 * Members API
 */
export const members = {
  /**
   * Get all members with pagination
   */
  async list(page = 1, status?: string) {
    let url = `/api/v1/members?page=${page}`;
    if (status) url += `&status=${status}`;
    return railsAPI<{ members: any[]; meta: any }>(url);
  },

  /**
   * Get pending members
   */
  async getPending(page = 1) {
    return railsAPI<{ members: any[]; meta: any }>(`/api/v1/members/pending?page=${page}`);
  },

  /**
   * Get member by ID
   */
  async get(id: string) {
    return railsAPI<{ member: any }>(`/api/v1/members/${id}`);
  },

  /**
   * Create new member
   */
  async create(data: any) {
    return railsAPI<{ member: any }>('/api/v1/members', {
      method: 'POST',
      body: JSON.stringify({ member: data }),
    });
  },

  /**
   * Update member
   */
  async update(id: string, data: any) {
    return railsAPI<{ member: any }>(`/api/v1/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ member: data }),
    });
  },

  /**
   * Approve member
   */
  async approve(id: string) {
    return railsAPI<{ message: string; member: any }>(`/api/v1/members/${id}/approve`, {
      method: 'POST',
    });
  },

  /**
   * Reject member
   */
  async reject(id: string, reason?: string) {
    return railsAPI<{ message: string; member: any }>(`/api/v1/members/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Suspend member
   */
  async suspend(id: string, reason?: string) {
    return railsAPI<{ message: string; member: any }>(`/api/v1/members/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

/**
 * Membership Tiers API
 */
export const membershipTiers = {
  /**
   * Get all membership tiers
   */
  async list() {
    return railsAPI<{ membership_tiers: any[] }>('/api/v1/membership_tiers');
  },

  /**
   * Get tier by ID
   */
  async get(id: string) {
    return railsAPI<{ membership_tier: any }>(`/api/v1/membership_tiers/${id}`);
  },
};

/**
 * Membership Applications API
 */
export const membershipApplications = {
  /**
   * Get all applications
   */
  async list(page = 1) {
    return railsAPI<{ membership_applications: any[]; meta: any }>(
      `/api/v1/membership_applications?page=${page}`
    );
  },

  /**
   * Get application by ID
   */
  async get(id: string) {
    return railsAPI<{ membership_application: any }>(`/api/v1/membership_applications/${id}`);
  },

  /**
   * Create new application
   */
  async create(data: any) {
    return railsAPI<{ membership_application: any }>('/api/v1/membership_applications', {
      method: 'POST',
      body: JSON.stringify({ membership_application: data }),
    });
  },

  /**
   * Approve application
   */
  async approve(id: string, comments?: string) {
    return railsAPI<{ message: string }>(`/api/v1/membership_applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  },

  /**
   * Reject application
   */
  async reject(id: string, comments: string) {
    return railsAPI<{ message: string }>(`/api/v1/membership_applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  },

  /**
   * Withdraw application
   */
  async withdraw(id: string) {
    return railsAPI<{ message: string }>(`/api/v1/membership_applications/${id}/withdraw`, {
      method: 'POST',
    });
  },
};
