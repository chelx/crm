import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { useList } from '@refinedev/core';
import { Reply } from '@/types';

export const ReplyStatistics = () => {
  const { data: repliesData, isLoading } = useList<Reply>({
    resource: 'replies',
    pagination: {
      current: 1,
      pageSize: 1000, // Get all replies for statistics
    },
  });

  const replies = Array.isArray(repliesData?.data) ? repliesData.data : [];
  
  // Calculate statistics
  const totalReplies = replies.length;
  const draftReplies = replies.filter(r => r.status === 'DRAFT').length;
  const submittedReplies = replies.filter(r => r.status === 'SUBMITTED').length;
  const approvedReplies = replies.filter(r => r.status === 'APPROVED').length;
  const rejectedReplies = replies.filter(r => r.status === 'REJECTED').length;
  
  const approvalRate = totalReplies > 0 ? Math.round((approvedReplies / (approvedReplies + rejectedReplies)) * 100) : 0;
  const pendingApproval = submittedReplies;

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (isLoading) {
    return (
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <Text>Loading statistics...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} borderColor={borderColor}>
      <CardHeader>
        <Heading size="md">Reply Statistics</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Overview Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Total Replies</StatLabel>
              <StatNumber>{totalReplies}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                All time
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Pending Approval</StatLabel>
              <StatNumber color="yellow.500">{pendingApproval}</StatNumber>
              <StatHelpText>
                Awaiting review
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Approved</StatLabel>
              <StatNumber color="green.500">{approvedReplies}</StatNumber>
              <StatHelpText>
                Ready to send
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Approval Rate</StatLabel>
              <StatNumber color="blue.500">{approvalRate}%</StatNumber>
              <StatHelpText>
                Success rate
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Status Breakdown */}
          <Box>
            <Text fontWeight="bold" mb={3}>Status Breakdown</Text>
            <VStack spacing={3} align="stretch">
              <Box>
                <HStack justify="space-between" mb={1}>
                  <HStack>
                    <Badge colorScheme="gray">DRAFT</Badge>
                    <Text fontSize="sm">{draftReplies} replies</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {totalReplies > 0 ? Math.round((draftReplies / totalReplies) * 100) : 0}%
                  </Text>
                </HStack>
                <Progress 
                  value={totalReplies > 0 ? (draftReplies / totalReplies) * 100 : 0} 
                  colorScheme="gray" 
                  size="sm" 
                />
              </Box>
              
              <Box>
                <HStack justify="space-between" mb={1}>
                  <HStack>
                    <Badge colorScheme="yellow">SUBMITTED</Badge>
                    <Text fontSize="sm">{submittedReplies} replies</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {totalReplies > 0 ? Math.round((submittedReplies / totalReplies) * 100) : 0}%
                  </Text>
                </HStack>
                <Progress 
                  value={totalReplies > 0 ? (submittedReplies / totalReplies) * 100 : 0} 
                  colorScheme="yellow" 
                  size="sm" 
                />
              </Box>
              
              <Box>
                <HStack justify="space-between" mb={1}>
                  <HStack>
                    <Badge colorScheme="green">APPROVED</Badge>
                    <Text fontSize="sm">{approvedReplies} replies</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {totalReplies > 0 ? Math.round((approvedReplies / totalReplies) * 100) : 0}%
                  </Text>
                </HStack>
                <Progress 
                  value={totalReplies > 0 ? (approvedReplies / totalReplies) * 100 : 0} 
                  colorScheme="green" 
                  size="sm" 
                />
              </Box>
              
              <Box>
                <HStack justify="space-between" mb={1}>
                  <HStack>
                    <Badge colorScheme="red">REJECTED</Badge>
                    <Text fontSize="sm">{rejectedReplies} replies</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {totalReplies > 0 ? Math.round((rejectedReplies / totalReplies) * 100) : 0}%
                  </Text>
                </HStack>
                <Progress 
                  value={totalReplies > 0 ? (rejectedReplies / totalReplies) * 100 : 0} 
                  colorScheme="red" 
                  size="sm" 
                />
              </Box>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};
