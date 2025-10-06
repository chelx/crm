import { useState } from 'react';
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
  Textarea,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputRightElement,
  useToast,
  Text,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreate } from '@refinedev/core';
import { Customer } from '@/types';

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CreateCustomerForm = z.infer<typeof createCustomerSchema>;

interface CustomerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomerCreateModal = ({ isOpen, onClose, onSuccess }: CustomerCreateModalProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const toast = useToast();
  const { mutate: createCustomer, isLoading } = useCreate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: CreateCustomerForm) => {
    createCustomer({
      resource: 'customers',
      values: {
        ...data,
        tags,
      },
    }, {
      onSuccess: () => {
        toast({
          title: 'Customer created',
          description: 'Customer has been created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        reset();
        setTags([]);
        onSuccess();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to create customer.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  const handleClose = () => {
    reset();
    setTags([]);
    setTagInput('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name *</FormLabel>
                <Input
                  placeholder="Enter customer name"
                  {...register('name')}
                />
                {errors.name && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.name.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email *</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...register('email')}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>Phone</FormLabel>
                <Input
                  placeholder="Enter phone number"
                  {...register('phone')}
                />
                {errors.phone && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.phone.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.address}>
                <FormLabel>Address</FormLabel>
                <Textarea
                  placeholder="Enter address"
                  rows={3}
                  {...register('address')}
                />
                {errors.address && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.address.message}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <InputRightElement>
                    <Button size="sm" onClick={addTag}>
                      <FiPlus />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <HStack spacing={2} mt={2} flexWrap="wrap">
                  {tags.map((tag) => (
                    <Tag key={tag} colorScheme="blue">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => removeTag(tag)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Create Customer
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};