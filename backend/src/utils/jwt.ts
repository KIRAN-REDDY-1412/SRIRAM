import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'resqai_emergency_super_secret_key_2026_jwt_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'victim' | 'volunteer' | 'admin';
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
