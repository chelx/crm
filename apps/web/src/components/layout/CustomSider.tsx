import { Box, VStack, Text, Button, Divider } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  requiredRoles?: UserRole[];
}

const NavItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Customers', href: '/customers', requiredRoles: ['CSO', 'MANAGER'] },
  { label: 'Feedback', href: '/feedback', requiredRoles: ['CSO', 'MANAGER'] },
  { label: 'Replies', href: '/replies', requiredRoles: ['CSO', 'MANAGER'] },
  { label: 'Audit Logs', href: '/audit', requiredRoles: ['MANAGER'] },
];

export const CustomSider = () => {
  const location = useLocation();
  const { hasRole } = usePermissions();

  const visibleNavItems = NavItems.filter(item => 
    !item.requiredRoles || hasRole(item.requiredRoles)
  );

  return (
    <Box
      w="250px"
      h="100vh"
      bg="gray.50"
      borderRight="1px"
      borderColor="gray.200"
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color="brand.500" mb={4}>
          CRM System
        </Text>
        
        <Divider />
        
        {visibleNavItems.map((item) => (
          <Button
            key={item.href}
            as={RouterLink}
            to={item.href}
            variant={location.pathname === item.href ? 'solid' : 'outline'}
            colorScheme="blue"
            justifyContent="flex-start"
            size="md"
            bg={location.pathname === item.href ? 'blue.500' : 'white'}
            color={location.pathname === item.href ? 'white' : 'gray.700'}
            borderColor="blue.200"
            _hover={{
              bg: location.pathname === item.href ? 'blue.600' : 'blue.50',
              color: location.pathname === item.href ? 'white' : 'blue.700',
            }}
          >
            {item.label}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};
