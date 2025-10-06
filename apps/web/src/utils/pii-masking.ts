import { UserRole } from '@/types';

export const maskPII = (data: any, userRole: UserRole): any => {
  if (!data || typeof data !== 'object') return data;

  const masked = { ...data };

  // If user is not MANAGER, mask sensitive fields
  if (userRole !== 'MANAGER') {
    if (masked.email) {
      masked.email = maskEmail(masked.email);
    }
    if (masked.phone) {
      masked.phone = maskPhone(masked.phone);
    }
    if (masked.name) {
      masked.name = maskName(masked.name);
    }
  }

  // Recursively mask nested objects
  Object.keys(masked).forEach(key => {
    if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskPII(masked[key], userRole);
    }
  });

  return masked;
};

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
};

const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone;
  return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`;
};

const maskName = (name: string): string => {
  const parts = name.split(' ');
  return parts.map(part => {
    if (part.length <= 2) return part;
    return `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`;
  }).join(' ');
};
