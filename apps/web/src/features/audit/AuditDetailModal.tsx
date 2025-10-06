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
  Code,
} from '@chakra-ui/react';
import { FiUser, FiCalendar, FiActivity, FiTarget } from 'react-icons/fi';
import { AuditLog } from '@/types';

interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLog;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  isOpen,
  onClose,
  auditLog,
}) => {
  // Theme-aware colors
  const panelBg = useColorModeValue('gray.50', 'gray.700');
  const panelBorder = useColorModeValue('gray.200', 'gray.600');
  const panelText = useColorModeValue('gray.800', 'gray.100');
  const subtleText = useColorModeValue('gray.500', 'gray.400');
  const infoText = useColorModeValue('gray.600', 'gray.300');

  const accentBg = useColorModeValue('blue.50', 'blue.900');
  const accentBorder = useColorModeValue('blue.200', 'blue.700');

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'green';
    if (action.includes('updated')) return 'blue';
    if (action.includes('deleted')) return 'red';
    if (action.includes('approved')) return 'green';
    if (action.includes('rejected')) return 'red';
    if (action.includes('submitted')) return 'yellow';
    if (action.includes('merged')) return 'purple';
    return 'gray';
  };

  const formatAction = (action: string) => {
    return action.replace('.', ' ').replace(/([A-Z])/g, ' $1').trim();
  };

  const formatResource = (resource: string) => {
    const [type, id] = resource.split(':');
    return `${type.charAt(0).toUpperCase() + type.slice(1)} (${id})`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          Audit Log Details
          <HStack spacing={2} mt={2}>
            <Badge colorScheme={getActionColor(auditLog.action)}>
              {formatAction(auditLog.action)}
            </Badge>
            <Text fontSize="sm" color={subtleText}>
              {formatResource(auditLog.resource)}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={6}>
            {/* Action Information */}
            <Box w="100%">
              <Alert 
                status="info"
                bg={accentBg}
                borderColor={accentBorder}
                color={panelText}
              >
                <AlertIcon color={panelText} />
                <Text fontSize="sm">
                  This audit log records a {formatAction(auditLog.action).toLowerCase()} action performed in the system.
                </Text>
              </Alert>
            </Box>

            {/* Actor Information */}
            <Box w="100%">
              <Text fontWeight="bold" fontSize="lg" color={panelText}>Actor Information</Text>
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
                    <FiUser size={16} />
                    <Text fontWeight="medium" color={panelText}>User:</Text>
                    <Text color={panelText}>{auditLog.actor?.email || 'Unknown'}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="medium" color={panelText}>Role:</Text>
                    <Badge colorScheme="blue">{auditLog.actor?.role}</Badge>
                  </HStack>
                  <HStack>
                    <Text fontWeight="medium" color={panelText}>User ID:</Text>
                    <Text fontSize="sm" color={infoText}>{auditLog.actorId}</Text>
                  </HStack>
                </VStack>
              </Box>
            </Box>

            <Divider />

            {/* Action Details */}
            <Box w="100%">
              <Text fontWeight="bold" fontSize="lg" color={panelText}>Action Details</Text>
              <Box
                p={4}
                bg={accentBg}
                borderRadius="md"
                border="1px solid"
                borderColor={accentBorder}
                mt={2}
              >
                <VStack align="start" spacing={2}>
                  <HStack>
                    <FiActivity size={16} />
                    <Text fontWeight="medium" color={panelText}>Action:</Text>
                    <Badge colorScheme={getActionColor(auditLog.action)}>
                      {formatAction(auditLog.action)}
                    </Badge>
                  </HStack>
                  <HStack>
                    <FiTarget size={16} />
                    <Text fontWeight="medium" color={panelText}>Resource:</Text>
                    <Text color={panelText}>{formatResource(auditLog.resource)}</Text>
                  </HStack>
                </VStack>
              </Box>
            </Box>

            <Divider />

            {/* Metadata */}
            {auditLog.metadata && Object.keys(auditLog.metadata).length > 0 && (
              <Box w="100%">
                <Text fontWeight="bold" fontSize="lg" color={panelText}>Additional Information</Text>
                <Box
                  p={4}
                  bg={panelBg}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={panelBorder}
                  mt={2}
                >
                  <Code
                    p={3}
                    borderRadius="md"
                    bg={useColorModeValue('gray.100', 'gray.800')}
                    color={panelText}
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                    display="block"
                    w="100%"
                  >
                    {JSON.stringify(auditLog.metadata, null, 2)}
                  </Code>
                </Box>
              </Box>
            )}

            <Divider />

            {/* Timeline */}
            <Box w="100%">
              <Text fontWeight="bold" fontSize="lg" color={panelText}>Timeline</Text>
              <VStack align="start" spacing={2} mt={2}>
                <HStack>
                  <FiCalendar size={16} />
                  <Text fontWeight="medium" minW="120px" color={panelText}>Created:</Text>
                  <Text fontSize="sm" color={panelText}>{new Date(auditLog.createdAt).toLocaleString()}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="medium" minW="120px" color={panelText}>Updated:</Text>
                  <Text fontSize="sm" color={panelText}>{new Date(auditLog.updatedAt).toLocaleString()}</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
