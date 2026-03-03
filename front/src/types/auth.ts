export interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: "admin" | "editor" | "user" | "guest";
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  registro: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}
