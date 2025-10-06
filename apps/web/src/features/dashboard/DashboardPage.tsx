import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Icon,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiUsers, FiMessageSquare, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { useCustom } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, change, icon, color }: any) => (
  <Card>
    <CardBody>
      <HStack justify="space-between">
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" color="gray.600">
            {title}
          </Text>
          <Stat>
            <StatNumber fontSize="2xl">{value}</StatNumber>
            <StatHelpText>
              <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
              {Math.abs(change)}%
            </StatHelpText>
          </Stat>
        </VStack>
        <Icon as={icon} boxSize={8} color={color} />
      </HStack>
    </CardBody>
  </Card>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const feedbackVolume = useCustom<{ series: { date: string; count: number }[] }>({
    url: '/reports/feedback-volume',
    method: 'get',
    config: { query: { groupBy: 'day' } },
  });

  const repliesMetrics = useCustom<{ avgApprovalHours: number; avgReplyHours: number; totalApproved: number; totalReplies: number }>({
    url: '/reports/replies-metrics',
    method: 'get',
  });

  const workload = useCustom<Array<{ userId: string; email: string; role: string; totalReplies: number }>>({
    url: '/reports/workload',
    method: 'get',
  });

  const audits = useCustom<{ data: Array<{ id: string; action: string; resource: string; createdAt: string }> }>({
    url: '/audits',
    method: 'get',
    config: { query: { page: 1, limit: 5 } },
  });

  const totalFeedback = (feedbackVolume.data?.data?.series || []).reduce((s, x) => s + x.count, 0);
  const totalApproved = repliesMetrics.data?.data?.totalApproved || 0;
  const totalReplies = repliesMetrics.data?.data?.totalReplies || 0;
  const activeUsers = workload.data?.data?.length || 0;

  const loading = feedbackVolume.isLoading || repliesMetrics.isLoading || workload.isLoading;

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Dashboard
          </Heading>
          <Text color="gray.600">
            Welcome to your CRM dashboard. Here's an overview of your system.
          </Text>
        </Box>

        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          <GridItem>
            <StatCard
              title="Total Customers"
              value={activeUsers}
              change={0}
              icon={FiUsers}
              color="blue.500"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="New Feedback"
              value={totalFeedback}
              change={0}
              icon={FiMessageSquare}
              color="green.500"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="Resolved Issues"
              value={totalApproved}
              change={0}
              icon={FiCheckCircle}
              color="purple.500"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="Active Users"
              value={activeUsers}
              change={0}
              icon={FiActivity}
              color="orange.500"
            />
          </GridItem>
        </Grid>

        <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Recent Activity</Heading>
              </CardHeader>
              <CardBody>
                {audits.isLoading ? (
                  <Flex justify="center" py={6}><Spinner /></Flex>
                ) : audits.data?.data?.data?.length ? (
                  <VStack spacing={3} align="stretch">
                    {audits.data.data.data.map((log) => (
                      <Box key={log.id} p={3} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="medium">
                          {log.action.replace('.', ' ')}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(log.createdAt).toLocaleString()} • {log.resource}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Alert status="info"><AlertIcon />No recent activity</Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Quick Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Box p={3} bg="blue.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'blue.100' }} onClick={() => navigate('/customers')} role="button">
                    <Text fontSize="sm" fontWeight="medium" color="blue.700">
                      View All Customers
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      Manage customer information
                    </Text>
                  </Box>
                  <Box p={3} bg="green.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'green.100' }} onClick={() => navigate('/replies')} role="button">
                    <Text fontSize="sm" fontWeight="medium" color="green.700">
                      Review Pending Replies
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      Approve or reject replies
                    </Text>
                  </Box>
                  <Box p={3} bg="purple.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'purple.100' }} onClick={() => navigate('/audit')} role="button">
                    <Text fontSize="sm" fontWeight="medium" color="purple.700">
                      View Audit Logs
                    </Text>
                    <Text fontSize="xs" color="purple.600">
                      Track system activities
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};
