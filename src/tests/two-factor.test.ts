import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateTwoFactorSecret, 
  generateTwoFactorQRCode, 
  verifyTwoFactorCode,
  markSessionAs2FAVerified,
  disableTwoFactor
} from '../lib/auth/two-factor';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Mock do cliente Supabase
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: () => ({
        update: () => ({
          eq: () => ({
            error: null
          })
        }),
        select: () => ({
          eq: () => ({
            single: () => ({
              data: { two_factor_secret: 'TEST_SECRET' },
              error: null
            })
          })
        })
      })
    })
  };
});

// Mock do otplib
vi.mock('otplib', () => {
  return {
    authenticator: {
      generateSecret: () => 'TEST_SECRET',
      keyuri: () => 'otpauth://totp/PrevGestao:test@example.com?secret=TEST_SECRET&issuer=PrevGestao',
      verify: ({ token }) => token === '123456'
    }
  };
});

// Mock do QRCode
vi.mock('qrcode', () => {
  return {
    toDataURL: () => Promise.resolve('data:image/png;base64,TEST_QR_CODE')
  };
});

describe('Two Factor Authentication', () => {
  const userId = 'test-user-id';
  const email = 'test@example.com';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should generate a two factor secret', async () => {
    const secret = await generateTwoFactorSecret(userId);
    expect(secret).toBe('TEST_SECRET');
  });
  
  it('should generate a QR code for two factor authentication', async () => {
    const result = await generateTwoFactorQRCode(userId, email);
    expect(result.qrCodeDataUrl).toBe('data:image/png;base64,TEST_QR_CODE');
    expect(result.secret).toBe('TEST_SECRET');
  });
  
  it('should verify a valid two factor code', async () => {
    const isValid = await verifyTwoFactorCode(userId, '123456');
    expect(isValid).toBe(true);
  });
  
  it('should reject an invalid two factor code', async () => {
    const isValid = await verifyTwoFactorCode(userId, '654321');
    expect(isValid).toBe(false);
  });
  
  it('should mark a session as 2FA verified', async () => {
    const result = await markSessionAs2FAVerified(userId);
    expect(result).toBe(true);
  });
  
  it('should disable two factor authentication', async () => {
    const result = await disableTwoFactor(userId);
    expect(result).toBe(true);
  });
});
