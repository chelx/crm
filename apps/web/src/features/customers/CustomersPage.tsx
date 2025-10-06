import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Checkbox,
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiGitMerge } from 'react-icons/fi';
import { useList, useDelete } from '@refinedev/core';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@chakra-ui/react';
import { Customer } from '@/types';
import { CustomerCreateModal } from './CustomerCreateModal';
import { CustomerEditModal } from './CustomerEditModal';
import { CustomerDetailModal } from './CustomerDetailModal';
import { CustomerMergeModal } from './CustomerMergeModal';

export const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isMergeOpen, onOpen: onMergeOpen, onClose: onMergeClose } = useDisclosure();
  
  const toast = useToast();
  const { canManageCustomers, isManager } = usePermissions();
  const { mutate: deleteCustomer } = useDelete();

  const { data, isLoading, error, refetch } = useList<Customer>({
    resource: 'customers',
    pagination: {
      current: 1,
      pageSize: 20,
    },
    filters: [
      ...(searchTerm ? [{
        field: 'search',
        operator: 'contains' as const,
        value: searchTerm,
      }] : []),
      ...(selectedTag ? [{
        field: 'tag',
        operator: 'eq' as const,
        value: selectedTag,
      }] : []),
    ],
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    onEditOpen();
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      deleteCustomer({
        resource: 'customers',
        id: customer.id,
      }, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    onDetailOpen();
  };

  const handleCustomerSelect = (customerId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    }
  };

  const handleMerge = () => {
    if (selectedCustomers.length !== 2) {
      toast({
        title: 'Please select exactly 2 customers to merge.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onMergeOpen();
  };

  const customers = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total || 0;

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load customers. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Customers</Heading>
          <HStack spacing={3}>
            {isManager() && selectedCustomers.length === 2 && (
              <Button
                leftIcon={<FiGitMerge />}
                colorScheme="orange"
                onClick={handleMerge}
              >
                Merge Selected
              </Button>
            )}
            {canManageCustomers() && (
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={onCreateOpen}
              >
                Add Customer
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select
                placeholder="Filter by tag"
                maxW="200px"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="vip">VIP</option>
                <option value="newsletter">Newsletter</option>
                <option value="premium">Premium</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <Text color="gray.600">
              {total} customer{total !== 1 ? 's' : ''} found
            </Text>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" />
              </Flex>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {isManager() && (
                      <Th width="50px">
                        <Checkbox
                          isChecked={selectedCustomers.length === customers.length && customers.length > 0}
                          isIndeterminate={selectedCustomers.length > 0 && selectedCustomers.length < customers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomers(customers.map(c => c.id));
                            } else {
                              setSelectedCustomers([]);
                            }
                          }}
                        />
                      </Th>
                    )}
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Tags</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customers.map((customer) => (
                    <Tr key={customer.id}>
                      {isManager() && (
                        <Td>
                          <Checkbox
                            isChecked={selectedCustomers.includes(customer.id)}
                            onChange={(e) => handleCustomerSelect(customer.id, e.target.checked)}
                          />
                        </Td>
                      )}
                      <Td fontWeight="medium">{customer.name}</Td>
                      <Td>{customer.email}</Td>
                      <Td>{customer.phone || '-'}</Td>
                      <Td>
                        <HStack spacing={1}>
                          {(customer.tags || []).map((tag: string) => (
                            <Badge key={tag} colorScheme="blue" variant="subtle">
                              {tag}
                            </Badge>
                          ))}
                        </HStack>
                      </Td>
                      <Td>{new Date(customer.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => handleView(customer)}>
                              View Details
                            </MenuItem>
                            {canManageCustomers() && (
                              <MenuItem icon={<FiEdit />} onClick={() => handleEdit(customer)}>
                                Edit
                              </MenuItem>
                            )}
                            {isManager() && (
                              <MenuItem 
                                icon={<FiTrash2 />} 
                                color="red.500"
                                onClick={() => handleDelete(customer)}
                              >
                                Delete
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modals */}
      <CustomerCreateModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={() => {
          onCreateClose();
          refetch();
        }}
      />

      <CustomerEditModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        customer={selectedCustomer}
        onSuccess={() => {
          onEditClose();
          refetch();
        }}
      />

      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        customer={selectedCustomer}
      />

      {isManager() && selectedCustomers.length === 2 && (
        <CustomerMergeModal
          isOpen={isMergeOpen}
          onClose={() => {
            onMergeClose();
            setSelectedCustomers([]);
          }}
          sourceCustomer={customers.find(c => c.id === selectedCustomers[0]) || null}
          targetCustomer={customers.find(c => c.id === selectedCustomers[1]) || null}
          onMerged={() => {
            refetch();
            setSelectedCustomers([]);
          }}
        />
      )}
    </Box>
  );
};
