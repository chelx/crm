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
} from '@chakra-ui/react';
import { FiSearch, FiMoreVertical, FiEye, FiCheck, FiX, FiEdit, FiPlus, FiSend } from 'react-icons/fi';
import { useList } from '@refinedev/core';
import { usePermissions } from '@/hooks/usePermissions';
import { Reply } from '@/types';
import { ReplyDetailModal } from './ReplyDetailModal';
import { ReplyApprovalModal } from './ReplyApprovalModal';
import { ReplyEditModal } from './ReplyEditModal';
import { ReplyCreateModal } from './ReplyCreateModal';
import { ReplyStatistics } from './ReplyStatistics';

export const RepliesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedReply, setSelectedReply] = useState<Reply | null>(null);
  
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isApprovalOpen, onOpen: onApprovalOpen, onClose: onApprovalClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  
  const toast = useToast();
  const { isManager } = usePermissions();

  const { data, isLoading, error, refetch } = useList<Reply>({
    resource: 'replies',
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
      ...(selectedStatus ? [{
        field: 'status',
        operator: 'eq' as const,
        value: selectedStatus,
      }] : []),
    ],
  });

  const handleView = (reply: Reply) => {
    setSelectedReply(reply);
    onDetailOpen();
  };

  const handleApprove = (reply: Reply) => {
    setSelectedReply(reply);
    onApprovalOpen();
  };

  const handleEdit = (reply: Reply) => {
    setSelectedReply(reply);
    onEditOpen();
  };

  const handleSubmitReply = async (reply: Reply) => {
    try {
      const response = await fetch(`http://localhost:3001/v1/replies/${reply.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          status: 'SUBMITTED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      toast({
        title: 'Reply submitted.',
        description: 'Your reply has been submitted for approval.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error submitting reply.',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'gray';
      case 'submitted':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const replies = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total || 0;

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load replies. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Replies Management</Heading>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onCreateOpen}
            >
              Add Reply
            </Button>
            {isManager() && (
              <Badge colorScheme="blue" fontSize="sm" p={2}>
                Manager View - Can Approve/Reject
              </Badge>
            )}
          </HStack>
        </Flex>

        {/* Statistics */}
        <ReplyStatistics />

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Search replies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="Filter by status"
                maxW="200px"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <Text color="gray.600">
              {total} repl{total !== 1 ? 'ies' : 'y'} found
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
                    <Th>Feedback</Th>
                    <Th>Content Preview</Th>
                    <Th>Submitted By</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {replies.map((reply) => (
                    <Tr key={reply.id}>
                      <Td fontWeight="medium">
                        {reply.feedback?.customer?.name || 'Unknown Customer'}
                        <Text fontSize="sm" color="gray.500">
                          {reply.feedback?.customer?.email}
                        </Text>
                      </Td>
                      <Td maxW="300px" isTruncated>
                        {reply.content}
                      </Td>
                      <Td>{reply.submittedBy}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(reply.status)}>
                          {reply.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(reply.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => handleView(reply)}>
                              View Details
                            </MenuItem>
                            {(reply.status === 'DRAFT' || reply.status === 'REJECTED') && (
                              <MenuItem icon={<FiEdit />} onClick={() => handleEdit(reply)}>
                                Edit Reply
                              </MenuItem>
                            )}
                            {reply.status === 'DRAFT' && (
                              <MenuItem 
                                icon={<FiSend />} 
                                onClick={() => handleSubmitReply(reply)}
                                color="blue.600"
                              >
                                Submit for Approval
                              </MenuItem>
                            )}
                            {isManager() && reply.status === 'SUBMITTED' && (
                              <>
                                <MenuItem 
                                  icon={<FiCheck />} 
                                  onClick={() => handleApprove(reply)}
                                  color="green.600"
                                >
                                  Approve
                                </MenuItem>
                                <MenuItem 
                                  icon={<FiX />} 
                                  onClick={() => handleApprove(reply)}
                                  color="red.600"
                                >
                                  Reject
                                </MenuItem>
                              </>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
            {replies.length === 0 && !isLoading && (
              <Flex justify="center" py={8}>
                <Text color="gray.500">No replies found</Text>
              </Flex>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modals */}
      <ReplyCreateModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={() => {
          refetch();
        }}
      />

      {selectedReply && (
        <>
          <ReplyDetailModal
            isOpen={isDetailOpen}
            onClose={onDetailClose}
            reply={selectedReply}
            onStatusChanged={() => {
              refetch();
            }}
          />
          
          <ReplyApprovalModal
            isOpen={isApprovalOpen}
            onClose={onApprovalClose}
            reply={selectedReply}
            onApprovalComplete={() => {
              refetch();
              setSelectedReply(null);
            }}
          />
          
          <ReplyEditModal
            isOpen={isEditOpen}
            onClose={onEditClose}
            reply={selectedReply}
            onUpdated={() => {
              refetch();
            }}
          />
        </>
      )}
    </Box>
  );
};
