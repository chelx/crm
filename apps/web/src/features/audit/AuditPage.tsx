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
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  useDisclosure,
  useColorModeValue,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FiSearch, FiMoreVertical, FiEye, FiCalendar, FiUser, FiActivity, FiDownload } from 'react-icons/fi';
import { useList } from '@refinedev/core';
import { usePermissions } from '@/hooks/usePermissions';
import { AuditLog } from '@/types';
import { AuditDetailModal } from './AuditDetailModal';

export const AuditPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedActor, setSelectedActor] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const toast = useToast();
  const { isManager } = usePermissions();

  // Theme-aware colors
  const panelBg = useColorModeValue('gray.50', 'gray.700');
  const panelText = useColorModeValue('gray.800', 'gray.100');
  const panelBorder = useColorModeValue('gray.200', 'gray.600');
  const subtleText = useColorModeValue('gray.500', 'gray.400');

  const { data, isLoading, error, refetch } = useList<AuditLog>({
    resource: 'audits',
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
      ...(selectedAction ? [{
        field: 'action',
        operator: 'eq' as const,
        value: selectedAction,
      }] : []),
      ...(selectedResource ? [{
        field: 'resource',
        operator: 'contains' as const,
        value: selectedResource,
      }] : []),
      ...(selectedActor ? [{
        field: 'actorId',
        operator: 'eq' as const,
        value: selectedActor,
      }] : []),
      ...(dateFrom ? [{
        field: 'from',
        operator: 'gte' as const,
        value: dateFrom,
      }] : []),
      ...(dateTo ? [{
        field: 'to',
        operator: 'lte' as const,
        value: dateTo,
      }] : []),
    ],
  });

  const handleView = (auditLog: AuditLog) => {
    setSelectedAuditLog(auditLog);
    onDetailOpen();
  };

  const handleExportCSV = () => {
    const csvData = auditLogs.map(log => ({
      'Action': formatAction(log.action),
      'Resource': log.resource,
      'Actor': log.actor?.email || 'Unknown',
      'Role': log.actor?.role || 'N/A',
      'Timestamp': new Date(log.createdAt).toLocaleString(),
      'Metadata': JSON.stringify(log.metadata || {})
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Audit logs exported to CSV file',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'green';
    if (action.includes('updated')) return 'blue';
    if (action.includes('deleted')) return 'red';
    if (action.includes('approved')) return 'green';
    if (action.includes('rejected')) return 'red';
    if (action.includes('submitted')) return 'yellow';
    if (action.includes('merged')) return 'purple';
    return 'gray';
  };

  const formatAction = (action: string) => {
    return action.replace('.', ' ').replace(/([A-Z])/g, ' $1').trim();
  };

  const auditLogs = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total || 0;

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load audit logs. Please try again.
      </Alert>
    );
  }

  if (!isManager()) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Only managers can view audit logs.
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Audit Logs</Heading>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="green"
              variant="outline"
              onClick={handleExportCSV}
              isDisabled={auditLogs.length === 0}
            >
              Export CSV
            </Button>
            <Badge colorScheme="blue" fontSize="sm" p={2}>
              Manager Only - System Activity Tracking
            </Badge>
          </HStack>
        </Flex>

        {/* Filters */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Select
                  placeholder="Filter by action"
                  maxW="200px"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  <option value="customer.created">Customer Created</option>
                  <option value="customer.updated">Customer Updated</option>
                  <option value="customer.deleted">Customer Deleted</option>
                  <option value="customer.merged">Customer Merged</option>
                  <option value="feedback.created">Feedback Created</option>
                  <option value="reply.created">Reply Created</option>
                  <option value="reply.updated">Reply Updated</option>
                  <option value="reply.submitted">Reply Submitted</option>
                  <option value="reply.approved">Reply Approved</option>
                  <option value="reply.rejected">Reply Rejected</option>
                  <option value="auth.login.success">Login Success</option>
                  <option value="auth.login.failed">Login Failed</option>
                  <option value="auth.logout">Logout</option>
                  <option value="auth.refresh.success">Token Refresh</option>
                </Select>
                <Select
                  placeholder="Filter by resource"
                  maxW="200px"
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                >
                  <option value="customer:">Customer</option>
                  <option value="feedback:">Feedback</option>
                  <option value="reply:">Reply</option>
                  <option value="auth">Auth</option>
                </Select>
              </HStack>
              <HStack spacing={4}>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">From Date</FormLabel>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </FormControl>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">To Date</FormLabel>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </FormControl>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Actor ID</FormLabel>
                  <Input
                    type="text"
                    placeholder="Actor ID"
                    value={selectedActor}
                    onChange={(e) => setSelectedActor(e.target.value)}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <Text color={subtleText}>
              {total} audit log{total !== 1 ? 's' : ''} found
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
                    <Th>Action</Th>
                    <Th>Resource</Th>
                    <Th>Actor</Th>
                    <Th>Timestamp</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {auditLogs.map((auditLog) => (
                    <Tr key={auditLog.id}>
                      <Td>
                        <Badge colorScheme={getActionColor(auditLog.action)}>
                          {formatAction(auditLog.action)}
                        </Badge>
                      </Td>
                      <Td fontWeight="medium">
                        {auditLog.resource}
                      </Td>
                      <Td>
                        <HStack>
                          <FiUser size={16} />
                          <Text fontSize="sm">
                            {auditLog.actor?.email || 'Unknown'}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color={subtleText}>
                          {auditLog.actor?.role}
                        </Text>
                      </Td>
                      <Td>
                        <HStack>
                          <FiCalendar size={16} />
                          <Text fontSize="sm">
                            {new Date(auditLog.createdAt).toLocaleString()}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => handleView(auditLog)}>
                              View Details
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
            {auditLogs.length === 0 && !isLoading && (
              <Flex justify="center" py={8}>
                <Text color={subtleText}>No audit logs found</Text>
              </Flex>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modals */}
      {selectedAuditLog && (
        <AuditDetailModal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          auditLog={selectedAuditLog}
        />
      )}
    </Box>
  );
};
