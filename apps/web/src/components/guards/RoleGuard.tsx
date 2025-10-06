import { ReactNode } from 'react';
import { UserRole } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { Box, Text, VStack } from '@chakra-ui/react';
import { FiLock } from 'react-icons/fi';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: ReactNode;
}

export const RoleGuard = ({ children, allowedRoles, fallback }: RoleGuardProps) => {
  const { hasRole, user } = usePermissions();

  if (!user) {
    return null;
  }

  if (!hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box p={8} textAlign="center">
        <VStack spacing={4}>
          <FiLock size={48} color="gray" />
          <Text fontSize="lg" fontWeight="medium" color="gray.600">
            Access Denied
          </Text>
          <Text color="gray.500">
            You don't have permission to access this resource.
          </Text>
          <Text fontSize="sm" color="gray.400">
            Required role: {Array.isArray(allowedRoles) ? allowedRoles.join(' or ') : allowedRoles}
            <br />
            Your role: {user.role}
          </Text>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
};
