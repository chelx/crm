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
  Badge,
  Divider,
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiTag } from 'react-icons/fi';
import { Customer } from '@/types';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerDetailModal = ({ isOpen, onClose, customer }: CustomerDetailModalProps) => {
  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text fontSize="xl" fontWeight="bold">
              {customer.name}
            </Text>
            <Badge colorScheme="blue" variant="subtle">
              Customer
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <Heading size="md">Basic Information</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                  <GridItem>
                    <HStack spacing={3}>
                      <FiMail color="gray" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          Email
                        </Text>
                        <Text fontWeight="medium">
                          {customer.email}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>

                  <GridItem>
                    <HStack spacing={3}>
                      <FiPhone color="gray" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          Phone
                        </Text>
                        <Text fontWeight="medium">
                          {customer.phone || 'Not provided'}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>

                  <GridItem>
                    <HStack spacing={3}>
                      <FiMapPin color="gray" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          Address
                        </Text>
                        <Text fontWeight="medium">
                          {customer.address || 'Not provided'}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>

                  <GridItem>
                    <HStack spacing={3}>
                      <FiCalendar color="gray" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          Created
                        </Text>
                        <Text fontWeight="medium">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <HStack>
                    <FiTag color="gray" />
                    <Heading size="md">Tags</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <HStack spacing={2} flexWrap="wrap">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} colorScheme="blue" variant="subtle" p={2}>
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </CardBody>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <Heading size="md">Recent Activity</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">
                      Customer created
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {new Date(customer.createdAt).toLocaleString()}
                    </Text>
                  </Box>
                  
                  {customer.updatedAt !== customer.createdAt && (
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <Text fontSize="sm" fontWeight="medium">
                        Customer updated
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {new Date(customer.updatedAt).toLocaleString()}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};