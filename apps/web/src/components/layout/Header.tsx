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
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { User } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactElement;
}

const NavItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Customers', href: '/customers' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Replies', href: '/replies' },
  { label: 'Audit Logs', href: '/audit' },
];

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: user } = useGetIdentity<User>();
  const { mutate: logout } = useLogout();

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} px={4} boxShadow="sm">
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
            {NavItems.map((item) => (
              <RouterLink key={item.href} to={item.href}>
                <Text
                  px={2}
                  py={1}
                  rounded="md"
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
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
            {NavItems.map((item) => (
              <RouterLink key={item.href} to={item.href}>
                <Text
                  px={2}
                  py={1}
                  rounded="md"
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
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
