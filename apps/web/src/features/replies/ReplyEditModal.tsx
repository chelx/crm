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
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useUpdate } from '@refinedev/core';
import { Reply } from '@/types';

interface ReplyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  reply: Reply;
  onUpdated: () => void;
}

const editReplySchema = z.object({
  content: z.string().min(1, 'Reply content is required').max(2000, 'Reply is too long'),
});

type EditReplyForm = z.infer<typeof editReplySchema>;

export const ReplyEditModal: React.FC<ReplyEditModalProps> = ({
  isOpen,
  onClose,
  reply,
  onUpdated,
}) => {
  const toast = useToast();
  const { mutate: updateReply, isLoading } = useUpdate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditReplyForm>({
    resolver: zodResolver(editReplySchema),
    defaultValues: {
      content: reply.content,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        content: reply.content,
      });
    }
  }, [isOpen, reply.content, reset]);

  const onSubmit = (data: EditReplyForm) => {
    updateReply(
      {
        resource: 'replies',
        id: reply.id,
        values: {
          content: data.content,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Reply updated.',
            description: 'Your reply has been updated successfully.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          onUpdated();
          onClose();
        },
        onError: (error: any) => {
          toast({
            title: 'Error updating reply.',
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

  const canEdit = reply.status === 'DRAFT' || reply.status === 'REJECTED';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Reply</ModalHeader>
        <ModalCloseButton />
        
        {!canEdit && (
          <Alert status="warning" mx={6} mt={4}>
            <AlertIcon />
            This reply cannot be edited because it has been submitted or approved.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.content}>
                <FormLabel htmlFor="content">Reply Content</FormLabel>
                <Textarea
                  id="content"
                  rows={8}
                  placeholder="Write your reply..."
                  {...register('content')}
                  isDisabled={!canEdit}
                />
                <FormErrorMessage>{errors.content && errors.content.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit" 
              isLoading={isLoading}
              isDisabled={!canEdit}
            >
              Update Reply
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
