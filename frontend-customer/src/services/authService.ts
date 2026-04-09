export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'customer';
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
}

interface StoredAuthAccount extends AuthUser {
  password: string;
  role: 'admin' | 'customer';
}

const storage = typeof window !== 'undefined' ? window.localStorage : null;
const AUTH_ACCOUNTS_STORAGE_KEY = 'novatech-auth-accounts';

export const ADMIN_LOGIN_EMAIL = 'adminphone@gmail.com';
export const ADMIN_LOGIN_PASSWORD = '1';
export const ADMIN_REDIRECT_URL = 'https://thu6chieunhom2-bandienthoai.kesug.com/admin-ui/users';

const ADMIN_ACCOUNT: StoredAuthAccount = {
  id: 'admin-fixed-account',
  name: 'Admin',
  email: ADMIN_LOGIN_EMAIL,
  password: ADMIN_LOGIN_PASSWORD,
  phone: '',
  address: '',
  role: 'admin',
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const generateUserId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createToken = (userId: string) => `local-token-${userId}-${Date.now()}`;

const sanitizeUser = ({ password, ...user }: StoredAuthAccount): AuthUser => user;

const persistAccounts = (accounts: StoredAuthAccount[]) => {
  storage?.setItem(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

const readAccounts = (): StoredAuthAccount[] => {
  const fallbackAccounts = [ADMIN_ACCOUNT];

  if (!storage) {
    return fallbackAccounts;
  }

  const rawAccounts = storage.getItem(AUTH_ACCOUNTS_STORAGE_KEY);

  if (!rawAccounts) {
    persistAccounts(fallbackAccounts);
    return fallbackAccounts;
  }

  try {
    const parsedAccounts = JSON.parse(rawAccounts);

    if (!Array.isArray(parsedAccounts)) {
      persistAccounts(fallbackAccounts);
      return fallbackAccounts;
    }

    const normalizedAccounts = parsedAccounts
      .map((account): StoredAuthAccount | null => {
        if (!account || typeof account !== 'object') {
          return null;
        }

        const candidate = account as Partial<StoredAuthAccount>;
        const email = normalizeEmail(String(candidate.email ?? ''));
        const password = String(candidate.password ?? '');
        const name = String(candidate.name ?? '').trim();

        if (!email || !password || !name) {
          return null;
        }

        return {
          id: String(candidate.id ?? generateUserId()),
          name,
          email,
          password,
          phone: String(candidate.phone ?? '').trim(),
          address: String(candidate.address ?? '').trim(),
          role: candidate.role === 'admin' ? 'admin' : 'customer',
        };
      })
      .filter((account): account is StoredAuthAccount => account !== null)
      .filter((account) => account.email !== ADMIN_LOGIN_EMAIL);

    const accounts = [ADMIN_ACCOUNT, ...normalizedAccounts];
    persistAccounts(accounts);
    return accounts;
  } catch {
    persistAccounts(fallbackAccounts);
    return fallbackAccounts;
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = password.trim();
    const account = readAccounts().find((item) => item.email === normalizedEmail);

    if (!account || account.password !== normalizedPassword) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    return {
      user: sanitizeUser(account),
      token: createToken(account.id),
    };
  },
  register: async (payload: RegisterPayload): Promise<AuthUser> => {
    const normalizedEmail = normalizeEmail(payload.email);
    const password = payload.password.trim();
    const name = payload.name.trim();
    const phone = payload.phone.trim();
    const address = payload.address.trim();

    if (!normalizedEmail || !password || !name || !phone || !address) {
      throw new Error('Vui lòng nhập đầy đủ thông tin đăng ký.');
    }

    const accounts = readAccounts();

    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error('Email này đã tồn tại. Vui lòng dùng email khác.');
    }

    const newAccount: StoredAuthAccount = {
      id: generateUserId(),
      email: normalizedEmail,
      password,
      name,
      phone,
      address,
      role: 'customer',
    };

    persistAccounts([...accounts, newAccount]);
    return sanitizeUser(newAccount);
  },
};
