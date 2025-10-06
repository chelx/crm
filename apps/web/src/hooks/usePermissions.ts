import { useGetIdentity } from '@refinedev/core';
import { UserRole } from '@/types';

export const usePermissions = () => {
  const { data: user } = useGetIdentity<{ role: UserRole }>();

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const isCSO = () => hasRole('CSO');
  const isManager = () => hasRole('MANAGER');
  const isManagerOrHigher = () => hasRole(['CSO', 'MANAGER']);

  const canManageUsers = () => isManager();
  const canApproveReplies = () => isManager();
  const canViewAuditLogs = () => isManagerOrHigher();
  const canManageCustomers = () => isManagerOrHigher();
  const canManageFeedback = () => isManagerOrHigher();

  return {
    user,
    hasRole,
    isCSO,
    isManager,
    isManagerOrHigher,
    canManageUsers,
    canApproveReplies,
    canViewAuditLogs,
    canManageCustomers,
    canManageFeedback,
  };
};
