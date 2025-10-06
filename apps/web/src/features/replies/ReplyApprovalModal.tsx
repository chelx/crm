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
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon,
  Box,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useCustom } from '@refinedev/core';
import { Reply } from '@/types';

interface ReplyApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  reply: Reply;
  onApprovalComplete: () => void;
}

const approvalSchema = z.object({
  comment: z.string().max(500, 'Comment is too long').optional(),
});

type ApprovalForm = z.infer<typeof approvalSchema>;

export const ReplyApprovalModal: React.FC<ReplyApprovalModalProps> = ({
  isOpen,
  onClose,
  reply,
  onApprovalComplete,
}) => {
  const toast = useToast();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Colors for contrast in light/dark modes
  const panelBg = useColorModeValue('gray.50', 'gray.700');
  const panelText = useColorModeValue('gray.800', 'gray.100');
  const panelBorder = useColorModeValue('gray.200', 'gray.600');
  const subtleText = useColorModeValue('gray.500', 'gray.400');
  const infoText = useColorModeValue('gray.600', 'gray.300');
  const accentBg = useColorModeValue('blue.50', 'blue.900');
  const accentBorder = useColorModeValue('blue.200', 'blue.700');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApprovalForm>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      comment: '',
    },
  });

  const handleApproval = async (data: ApprovalForm, actionType: 'approve' | 'reject') => {
    setIsProcessing(true);
    
    try {
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      const url = `http://localhost:3001/v1/replies/${reply.id}/${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          comment: data.comment || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${actionType} reply`);
      }

      toast({
        title: `Reply ${actionType}d successfully.`,
        description: `The reply has been ${actionType}d${data.comment ? ' with your comment' : ''}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onApprovalComplete();
      handleClose();
    } catch (error: any) {
      toast({
        title: `Error ${actionType}ing reply.`,
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    reset();
    setAction(null);
    onClose();
  };

  const onSubmit = (data: ApprovalForm) => {
    if (action) {
      handleApproval(data, action);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Reply Approval
          <Text fontSize="sm" fontWeight="normal" color={subtleText}>
            Review and approve/reject this reply
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack align="start" spacing={6}>
              {/* Reply Context */}
              <Box w="100%">
                <Text fontWeight="bold" fontSize="lg" color={panelText}>Reply to Review</Text>
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
                <HStack mt={2} spacing={4}>
                  <Text fontSize="sm" color={infoText}>
                    <strong>Submitted by:</strong> {reply.submittedBy}
                  </Text>
                  <Text fontSize="sm" color={infoText}>
                    <strong>Created:</strong> {new Date(reply.createdAt).toLocaleString()}
                  </Text>
                </HStack>
              </Box>

              <Divider />

              {/* Approval Actions */}
              <Box w="100%">
                <Text fontWeight="bold" fontSize="lg" mb={4} color={panelText}>
                  Choose Action
                </Text>
                <HStack spacing={4}>
                  <Button
                    colorScheme="green"
                    variant={action === 'approve' ? 'solid' : 'outline'}
                    onClick={() => setAction('approve')}
                    isDisabled={isProcessing}
                  >
                    Approve Reply
                  </Button>
                  <Button
                    colorScheme="red"
                    variant={action === 'reject' ? 'solid' : 'outline'}
                    onClick={() => setAction('reject')}
                    isDisabled={isProcessing}
                  >
                    Reject Reply
                  </Button>
                </HStack>
                
                {action && (
                  <Alert status={action === 'approve' ? 'success' : 'error'} mt={4}>
                    <AlertIcon />
                    <Text fontSize="sm">
                      {action === 'approve' 
                        ? 'This reply will be approved and marked as ready to send to the customer.'
                        : 'This reply will be rejected and returned to draft status for revision.'
                      }
                    </Text>
                  </Alert>
                )}
              </Box>

              {/* Comment Field */}
              {action && (
                <FormControl isInvalid={!!errors.comment}>
                  <FormLabel htmlFor="comment">
                    {action === 'approve' ? 'Approval Comment (Optional)' : 'Rejection Reason (Optional)'}
                  </FormLabel>
                  <Textarea
                    id="comment"
                    rows={3}
                    placeholder={
                      action === 'approve' 
                        ? 'Add any comments about this approval...'
                        : 'Explain why this reply is being rejected...'
                    }
                    {...register('comment')}
                  />
                  <FormErrorMessage>{errors.comment && errors.comment.message}</FormErrorMessage>
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={handleClose} isDisabled={isProcessing}>
              Cancel
            </Button>
            {action && (
              <Button
                colorScheme={action === 'approve' ? 'green' : 'red'}
                type="submit"
                isLoading={isProcessing}
              >
                {action === 'approve' ? 'Approve Reply' : 'Reject Reply'}
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
