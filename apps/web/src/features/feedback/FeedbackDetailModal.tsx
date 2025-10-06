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
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useCreate } from '@refinedev/core';
import { Feedback, Reply } from '@/types';

interface FeedbackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback;
  onReplyAdded: () => void;
}

const createReplySchema = z.object({
  content: z.string().min(1, 'Reply content is required').max(2000, 'Reply is too long'),
});

type CreateReplyForm = z.infer<typeof createReplySchema>;

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  isOpen,
  onClose,
  feedback,
  onReplyAdded,
}) => {
  const toast = useToast();
  const { mutate: createReply, isLoading: isCreatingReply } = useCreate();
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Colors for light/dark modes to maintain sufficient contrast
  const panelBg = useColorModeValue('gray.50', 'gray.700');
  const panelText = useColorModeValue('gray.800', 'gray.100');
  const panelBorder = useColorModeValue('gray.200', 'gray.600');
  const infoText = useColorModeValue('gray.600', 'gray.300');
  const subtleText = useColorModeValue('gray.500', 'gray.400');
  const accentBg = useColorModeValue('blue.50', 'blue.900');
  const accentBorder = useColorModeValue('blue.200', 'blue.700');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateReplyForm>({
    resolver: zodResolver(createReplySchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmitReply = (data: CreateReplyForm) => {
    createReply(
      {
        resource: 'replies',
        values: {
          feedbackId: feedback.id,
          content: data.content,
          status: 'DRAFT',
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Reply created.',
            description: 'Your reply has been saved as draft.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          onReplyAdded();
          setShowReplyForm(false);
          reset();
        },
        onError: (error: any) => {
          toast({
            title: 'Error creating reply.',
            description: error.message || 'An unexpected error occurred.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        },
      },
    );
  };

  const handleSubmitReply = async (replyId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/v1/replies/${replyId}/submit`, {
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

      onReplyAdded();
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

  const getReplyStatusColor = (status: string) => {
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

  const handleClose = () => {
    setShowReplyForm(false);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          Feedback Details
          <Text fontSize="sm" fontWeight="normal" color={subtleText}>
            From: {feedback.customer?.name || 'Unknown Customer'}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={6}>
            {/* Customer Info */}
            <Box w="100%">
              <Text fontWeight="bold" fontSize="lg">Customer Information</Text>
              <HStack spacing={4} mt={2}>
                <Box>
                  <Text fontSize="sm" color={infoText}>Name:</Text>
                  <Text fontWeight="medium" color={panelText}>{feedback.customer?.name || 'Unknown'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={infoText}>Email:</Text>
                  <Text color={panelText}>{feedback.customer?.email || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color={infoText}>Phone:</Text>
                  <Text color={panelText}>{feedback.customer?.phone || 'N/A'}</Text>
                </Box>
              </HStack>
            </Box>

            <Divider />

            {/* Feedback Details */}
            <Box w="100%">
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold" fontSize="lg">Feedback</Text>
                <Badge colorScheme={getChannelColor(feedback.channel)}>
                  {feedback.channel.toUpperCase()}
                </Badge>
              </HStack>
              
              <Box
                p={4}
                bg={panelBg}
                borderRadius="md"
                border="1px solid"
                borderColor={panelBorder}
              >
                <Text whiteSpace="pre-wrap" color={panelText}>{feedback.message}</Text>
              </Box>
              
              <Text fontSize="sm" color={subtleText} mt={2}>
                Received: {new Date(feedback.createdAt).toLocaleString()}
              </Text>
            </Box>

            <Divider />

            {/* Replies Section */}
            <Box w="100%">
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold" fontSize="lg">Replies</Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  {showReplyForm ? 'Cancel' : 'Add Reply'}
                </Button>
              </HStack>

              {/* Reply Form */}
              {showReplyForm && (
                <Box mb={4} p={4} bg={accentBg} borderRadius="md" border="1px solid" borderColor={accentBorder}>
                  <form onSubmit={handleSubmit(onSubmitReply)}>
                    <VStack spacing={3}>
                      <FormControl isInvalid={!!errors.content}>
                        <FormLabel htmlFor="content">Reply Content</FormLabel>
                        <Textarea
                          id="content"
                          rows={4}
                          placeholder="Write your reply..."
                          {...register('content')}
                        />
                        <FormErrorMessage>{errors.content && errors.content.message}</FormErrorMessage>
                      </FormControl>
                      <HStack w="100%" justify="flex-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowReplyForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          type="submit"
                          isLoading={isCreatingReply}
                        >
                          Save as Draft
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </Box>
              )}

              {/* Replies List */}
              {feedback.replies && feedback.replies.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {feedback.replies.map((reply: Reply) => (
                    <Box
                      key={reply.id}
                      p={3}
                      bg={panelBg}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={panelBorder}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium" color={panelText}>
                          Reply by: {reply.submittedBy}
                        </Text>
                        <HStack>
                          <Badge colorScheme={getReplyStatusColor(reply.status)}>
                            {reply.status.toUpperCase()}
                          </Badge>
                          {reply.status === 'DRAFT' && (
                            <Button
                              size="xs"
                              colorScheme="green"
                              onClick={() => handleSubmitReply(reply.id)}
                            >
                              Submit for Approval
                            </Button>
                          )}
                        </HStack>
                      </HStack>
                      <Text fontSize="sm" whiteSpace="pre-wrap" color={panelText}>
                        {reply.content}
                      </Text>
                      <Text fontSize="xs" color={subtleText} mt={2}>
                        Created: {new Date(reply.createdAt).toLocaleString()}
                        {reply.reviewedAt && (
                          <> • Reviewed: {new Date(reply.reviewedAt).toLocaleString()}</>
                        )}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  No replies yet. Add a reply to respond to this feedback.
                </Alert>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
