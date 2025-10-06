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
  useToast,
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiMoreVertical, FiEye, FiMessageSquare } from 'react-icons/fi';
import { useList } from '@refinedev/core';
import { usePermissions } from '@/hooks/usePermissions';
import { Feedback } from '@/types';
import { FeedbackCreateModal } from './FeedbackCreateModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';

export const FeedbackPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const { canManageFeedback } = usePermissions();

  const { data, isLoading, error, refetch } = useList<Feedback>({
    resource: 'feedback',
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
      ...(selectedChannel ? [{
        field: 'channel',
        operator: 'eq' as const,
        value: selectedChannel,
      }] : []),
    ],
  });

  const handleView = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    onDetailOpen();
  };

  const getChannelColor = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return 'blue';
      case 'phone':
        return 'green';
      case 'chat':
        return 'purple';
      case 'social':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const feedbackList = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total || 0;

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load feedback. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Feedback Management</Heading>
          {canManageFeedback() && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onCreateOpen}
            >
              Add Feedback
            </Button>
          )}
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
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="Filter by channel"
                maxW="200px"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="chat">Chat</option>
                <option value="social">Social</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <Text color="gray.600">
              {total} feedback item{total !== 1 ? 's' : ''} found
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
                    <Th>Customer</Th>
                    <Th>Message</Th>
                    <Th>Channel</Th>
                    <Th>Replies</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {feedbackList.map((feedback) => (
                    <Tr key={feedback.id}>
                      <Td fontWeight="medium">
                        {feedback.customer?.name || 'Unknown Customer'}
                      </Td>
                      <Td maxW="300px" isTruncated>
                        {feedback.message}
                      </Td>
                      <Td>
                        <Badge colorScheme={getChannelColor(feedback.channel)}>
                          {feedback.channel}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <FiMessageSquare />
                          <Text fontSize="sm">
                            {feedback.replies?.length || 0}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>{new Date(feedback.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => handleView(feedback)}>
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
            {feedbackList.length === 0 && !isLoading && (
              <Flex justify="center" py={8}>
                <VStack spacing={4}>
                  <Text color="gray.500">No feedback found</Text>
                  {canManageFeedback() && (
                    <Button colorScheme="blue" onClick={onCreateOpen}>
                      Add First Feedback
                    </Button>
                  )}
                </VStack>
              </Flex>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modals */}
      <FeedbackCreateModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={() => {
          onCreateClose();
          refetch();
        }}
      />

      {selectedFeedback && (
        <FeedbackDetailModal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          feedback={selectedFeedback}
          onReplyAdded={() => {
            refetch();
          }}
        />
      )}
    </Box>
  );
};
