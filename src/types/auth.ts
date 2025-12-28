export type User = {
  id: number;
  email: string;
  role: 'admin' | 'employee';
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type RegisterDTO = {
  email: string;
  password: string;
  role?: 'admin' | 'employee';
};

export type AuthResponseDTO = {
  user: User;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
