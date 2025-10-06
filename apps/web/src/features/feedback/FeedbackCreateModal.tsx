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
  Input,
  FormErrorMessage,
  VStack,
  Select,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreate } from '@refinedev/core';
import { useList } from '@refinedev/core';
import { Customer } from '@/types';

interface FeedbackCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const createFeedbackSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
  channel: z.enum(['email', 'phone', 'chat', 'social'], {
    required_error: 'Channel is required',
  }),
});

type CreateFeedbackForm = z.infer<typeof createFeedbackSchema>;

export const FeedbackCreateModal: React.FC<FeedbackCreateModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const toast = useToast();
  const { mutate: createFeedback, isLoading } = useCreate();

  // Fetch customers for dropdown
  const { data: customersData } = useList<Customer>({
    resource: 'customers',
    pagination: {
      current: 1,
      pageSize: 100,
    },
  });

  const customers = Array.isArray(customersData?.data) ? customersData.data : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateFeedbackForm>({
    resolver: zodResolver(createFeedbackSchema),
    defaultValues: {
      customerId: '',
      message: '',
      channel: 'email',
    },
  });

  const onSubmit = (data: CreateFeedbackForm) => {
    createFeedback(
      {
        resource: 'feedback',
        values: data,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Feedback created.',
            description: 'New feedback has been added successfully.',
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
            title: 'Error creating feedback.',
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
        <ModalHeader>Create New Feedback</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.customerId}>
                <FormLabel htmlFor="customerId">Customer</FormLabel>
                <Select
                  id="customerId"
                  placeholder="Select customer"
                  {...register('customerId')}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.customerId && errors.customerId.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.channel}>
                <FormLabel htmlFor="channel">Channel</FormLabel>
                <Select
                  id="channel"
                  {...register('channel')}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="chat">Chat</option>
                  <option value="social">Social Media</option>
                </Select>
                <FormErrorMessage>{errors.channel && errors.channel.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.message}>
                <FormLabel htmlFor="message">Message</FormLabel>
                <Textarea
                  id="message"
                  rows={6}
                  placeholder="Enter customer feedback message..."
                  {...register('message')}
                />
                <FormErrorMessage>{errors.message && errors.message.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isLoading}>
              Create Feedback
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
