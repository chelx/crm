import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  FormErrorMessage,
  VStack,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreate } from '@refinedev/core';
import { useList } from '@refinedev/core';
import { Feedback } from '@/types';

interface ReplyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const createReplySchema = z.object({
  feedbackId: z.string().min(1, 'Feedback is required'),
  content: z.string().min(1, 'Reply content is required').max(2000, 'Reply is too long'),
});

type CreateReplyForm = z.infer<typeof createReplySchema>;

export const ReplyCreateModal: React.FC<ReplyCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const { mutate: createReply, isLoading } = useCreate();

  // Fetch feedback for dropdown
  const { data: feedbackData } = useList<Feedback>({
    resource: 'feedback',
    pagination: {
      current: 1,
      pageSize: 100,
    },
  });

  const feedbackList = Array.isArray(feedbackData?.data) ? feedbackData.data : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateReplyForm>({
    resolver: zodResolver(createReplySchema),
    defaultValues: {
      feedbackId: '',
      content: '',
    },
  });

  const onSubmit = (data: CreateReplyForm) => {
    createReply(
      {
        resource: 'replies',
        values: {
          ...data,
          status: 'DRAFT',
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Reply created.',
            description: 'New reply has been created as draft.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          onSuccess();
          onClose();
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

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Reply</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.feedbackId}>
                <FormLabel htmlFor="feedbackId">Feedback</FormLabel>
                <Select
                  id="feedbackId"
                  placeholder="Select feedback to reply to"
                  {...register('feedbackId')}
                >
                  {feedbackList.map((feedback) => (
                    <option key={feedback.id} value={feedback.id}>
                      {feedback.customer?.name || 'Unknown Customer'} - {feedback.message.substring(0, 50)}...
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.feedbackId && errors.feedbackId.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.content}>
                <FormLabel htmlFor="content">Reply Content</FormLabel>
                <Textarea
                  id="content"
                  rows={8}
                  placeholder="Write your reply..."
                  {...register('content')}
                />
                <FormErrorMessage>{errors.content && errors.content.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isLoading}>
              Create Reply
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
