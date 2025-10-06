import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  Divider,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useGetIdentity, useLogout, useCustom } from '@refinedev/core';
import { User, UserRole } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { FiBell } from 'react-icons/fi';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactElement;
  requiredRoles?: UserRole[];
}

const NavItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Customers', href: '/customers', requiredRoles: ['CSO', 'MANAGER'] },
  { label: 'Feedback', href: '/feedback', requiredRoles: ['CSO', 'MANAGER'] },
  { label: 'Replies', href: '/replies', requiredRoles: ['CSO', 'MANAGER'] },
  { label: 'Notifications', href: '/notifications', requiredRoles: ['CSO', 'MANAGER'] },
  { label: 'Reports', href: '/reports', requiredRoles: ['MANAGER'] },
  { label: 'Audit Logs', href: '/audit', requiredRoles: ['MANAGER'] },
];

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: user } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();
  const { hasRole } = usePermissions();
  const unreadQuery = useCustom<{ count: number }>({
    url: '/notifications/unread-count',
    method: 'get',
  });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.200', 'gray.700');

  const visibleNavItems = NavItems.filter(item => 
    !item.requiredRoles || hasRole(item.requiredRoles)
  );

  return (
    <Box bg={bgColor} px={4} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color="brand.500">
            CRM System
          </Text>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {visibleNavItems.map((item) => (
              <RouterLink key={item.href} to={item.href}>
                <Text
                  px={2}
                  py={1}
                  rounded="md"
                  _hover={{
                    textDecoration: 'none',
                    bg: hoverBg,
                  }}
                >
                  {item.label}
                </Text>
              </RouterLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Menu>
            <MenuButton as={IconButton} aria-label="Notifications" variant="ghost" icon={<FiBell />}> 
            </MenuButton>
            <MenuList>
              <HStack px={3} py={2} justify="space-between">
                <Text fontWeight="bold">Notifications</Text>
                {unreadQuery.isLoading ? (
                  <Spinner size="xs" />
                ) : (
                  <Badge colorScheme="red">{unreadQuery?.data?.data?.count ?? 0}</Badge>
                )}
              </HStack>
              <Divider />
              <MenuItem onClick={() => window.location.assign('/audit')}>Open Audit Logs</MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Account menu"
              variant="ghost"
              cursor="pointer"
            >
              <HStack>
                <Avatar size="sm" name={user?.email} />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm" color="gray.600">
                    {user?.email}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user?.role}
                  </Text>
                </VStack>
                <ChevronDownIcon />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => logout()}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {visibleNavItems.map((item) => (
              <RouterLink key={item.href} to={item.href}>
                <Text
                  px={2}
                  py={1}
                  rounded="md"
                  _hover={{
                    textDecoration: 'none',
                    bg: hoverBg,
                  }}
                >
                  {item.label}
                </Text>
              </RouterLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};
