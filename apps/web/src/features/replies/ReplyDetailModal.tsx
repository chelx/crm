import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Box,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Reply } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

interface ReplyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reply: Reply;
  onStatusChanged: () => void;
}

export const ReplyDetailModal: React.FC<ReplyDetailModalProps> = ({
  isOpen,
  onClose,
  reply,
  onStatusChanged,
}) => {
  const toast = useToast();
  const { isManager } = usePermissions();

  // Colors for contrast in light/dark modes
  const panelBg = useColorModeValue('gray.50', 'gray.700');
  const panelText = useColorModeValue('gray.800', 'gray.100');
  const panelBorder = useColorModeValue('gray.200', 'gray.600');
  const subtleText = useColorModeValue('gray.500', 'gray.400');
  const accentBg = useColorModeValue('blue.50', 'blue.900');
  const accentBorder = useColorModeValue('blue.200', 'blue.700');

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

  const handleApprove = async () => {
    try {
      const response = await fetch(`http://localhost:3001/v1/replies/${reply.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          comment: 'Approved from detail view',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve reply');
      }

      toast({
        title: 'Reply approved.',
        description: 'The reply has been approved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onStatusChanged();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error approving reply.',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`http://localhost:3001/v1/replies/${reply.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          comment: 'Rejected from detail view',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject reply');
      }

      toast({
        title: 'Reply rejected.',
        description: 'The reply has been rejected.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onStatusChanged();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error rejecting reply.',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'This reply is still being drafted and has not been submitted for review.';
      case 'submitted':
        return 'This reply has been submitted and is waiting for manager approval.';
      case 'approved':
        return 'This reply has been approved by a manager and is ready to be sent to the customer.';
      case 'rejected':
        return 'This reply has been rejected by a manager and needs to be revised.';
      default:
        return 'Unknown status.';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          Reply Details
          <HStack spacing={2} mt={2}>
            <Badge colorScheme={getStatusColor(reply.status)}>
              {reply.status.toUpperCase()}
            </Badge>
            <Text fontSize="sm" color={subtleText}>
              by {reply.submittedBy}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={6}>
            {/* Status Information */}
            <Box w="100%">
              <Alert status={reply.status === 'APPROVED' ? 'success' : reply.status === 'REJECTED' ? 'error' : 'info'}>
                <AlertIcon />
                <Text fontSize="sm">{getStatusDescription(reply.status)}</Text>
              </Alert>
            </Box>

            {/* Feedback Context */}
            {reply.feedback && (
              <Box w="100%">
                <Text fontWeight="bold" fontSize="lg" color={panelText}>Original Feedback</Text>
                <Box
                  p={4}
                  bg={panelBg}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={panelBorder}
                  mt={2}
                >
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontWeight="medium" color={panelText}>Customer:</Text>
                      <Text color={panelText}>{reply.feedback.customer?.name || 'Unknown'}</Text>
                      <Text color={subtleText}>({reply.feedback.customer?.email})</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium" color={panelText}>Channel:</Text>
                      <Badge colorScheme="blue">{reply.feedback.channel}</Badge>
                    </HStack>
                    <Box>
                      <Text fontWeight="medium" mb={2} color={panelText}>Message:</Text>
                      <Text whiteSpace="pre-wrap" fontSize="sm" color={panelText}>
                        {reply.feedback.message}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </Box>
            )}

            <Divider />

            {/* Reply Content */}
            <Box w="100%">
              <Text fontWeight="bold" fontSize="lg" color={panelText}>Reply Content</Text>
              <Box
                p={4}
                bg={accentBg}
                borderRadius="md"
                border="1px solid"
                borderColor={accentBorder}
                mt={2}
              >
                <Text whiteSpace="pre-wrap" color={panelText}>{reply.content}</Text>
              </Box>
            </Box>

            <Divider />

            {/* Timeline */}
            <Box w="100%">
              <Text fontWeight="bold" fontSize="lg" color={panelText}>Timeline</Text>
              <VStack align="start" spacing={2} mt={2}>
                <HStack>
                  <Text fontWeight="medium" minW="120px" color={panelText}>Created:</Text>
                  <Text fontSize="sm" color={panelText}>{new Date(reply.createdAt).toLocaleString()}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="medium" minW="120px" color={panelText}>Updated:</Text>
                  <Text fontSize="sm" color={panelText}>{new Date(reply.updatedAt).toLocaleString()}</Text>
                </HStack>
                {reply.reviewedAt && (
                  <HStack>
                    <Text fontWeight="medium" minW="120px" color={panelText}>Reviewed:</Text>
                    <Text fontSize="sm" color={panelText}>{new Date(reply.reviewedAt).toLocaleString()}</Text>
                  </HStack>
                )}
                {reply.reviewedBy && (
                  <HStack>
                    <Text fontWeight="medium" minW="120px" color={panelText}>Reviewed by:</Text>
                    <Text fontSize="sm" color={panelText}>{reply.reviewedBy}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
            {isManager() && reply.status === 'SUBMITTED' && (
              <>
                <Button colorScheme="green" onClick={handleApprove}>
                  Approve Reply
                </Button>
                <Button colorScheme="red" onClick={handleReject}>
                  Reject Reply
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
