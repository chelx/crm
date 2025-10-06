import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Customer } from '@/types';

interface CustomerMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceCustomer: Customer | null;
  targetCustomer: Customer | null;
  onMerged: () => void;
}

export const CustomerMergeModal: React.FC<CustomerMergeModalProps> = ({
  isOpen,
  onClose,
  sourceCustomer,
  targetCustomer,
  onMerged,
}) => {
  const toast = useToast();
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = async () => {
    if (!sourceCustomer || !targetCustomer) return;

    setIsMerging(true);
    
    try {
      const response = await fetch(`http://localhost:3001/v1/customers/${sourceCustomer.id}/merge/${targetCustomer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to merge customers');
      }

      await response.json();
      
      toast({
        title: 'Customers merged successfully.',
        description: `${sourceCustomer.name} has been merged into ${targetCustomer.name}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onMerged();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error merging customers.',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsMerging(false);
    }
  };

  if (!sourceCustomer || !targetCustomer) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Merge Customers</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Alert status="warning">
              <AlertIcon />
              <Text fontSize="sm">
                This action will merge the source customer into the target customer and cannot be undone.
                All feedback from the source customer will be transferred to the target customer.
              </Text>
            </Alert>

            <Box>
              <Text fontWeight="bold" mb={2} color="red.500">
                Source Customer (will be deleted):
              </Text>
              <Box p={3} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                <Text fontWeight="medium">{sourceCustomer.name}</Text>
                <Text fontSize="sm" color="gray.600">{sourceCustomer.email}</Text>
                {sourceCustomer.phone && (
                  <Text fontSize="sm" color="gray.600">{sourceCustomer.phone}</Text>
                )}
                {sourceCustomer.address && (
                  <Text fontSize="sm" color="gray.600">{sourceCustomer.address}</Text>
                )}
                {sourceCustomer.tags && sourceCustomer.tags.length > 0 && (
                  <HStack spacing={1} mt={1}>
                    {sourceCustomer.tags.map((tag) => (
                      <Badge key={tag} colorScheme="red" variant="subtle" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                )}
              </Box>
            </Box>

            <Box textAlign="center">
              <Text fontSize="lg" fontWeight="bold" color="blue.500">
                ↓ MERGE INTO ↓
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2} color="green.500">
                Target Customer (will be kept):
              </Text>
              <Box p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                <Text fontWeight="medium">{targetCustomer.name}</Text>
                <Text fontSize="sm" color="gray.600">{targetCustomer.email}</Text>
                {targetCustomer.phone && (
                  <Text fontSize="sm" color="gray.600">{targetCustomer.phone}</Text>
                )}
                {targetCustomer.address && (
                  <Text fontSize="sm" color="gray.600">{targetCustomer.address}</Text>
                )}
                {targetCustomer.tags && targetCustomer.tags.length > 0 && (
                  <HStack spacing={1} mt={1}>
                    {targetCustomer.tags.map((tag) => (
                      <Badge key={tag} colorScheme="green" variant="subtle" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                )}
              </Box>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>What will happen:</Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">• All feedback from "{sourceCustomer.name}" will be transferred to "{targetCustomer.name}"</Text>
                <Text fontSize="sm">• "{sourceCustomer.name}" will be soft-deleted (marked as deleted)</Text>
                <Text fontSize="sm">• "{targetCustomer.name}" will remain active</Text>
                <Text fontSize="sm">• This action cannot be undone</Text>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isMerging}>
            Cancel
          </Button>
          <Button 
            colorScheme="red" 
            onClick={handleMerge} 
            isLoading={isMerging}
            loadingText="Merging..."
          >
            Merge Customers
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};