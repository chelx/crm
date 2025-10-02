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
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiMessageSquare, FiCheckCircle, FiActivity } from 'react-icons/fi';

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
              value="1,234"
              change={12}
              icon={FiUsers}
              color="blue.500"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="New Feedback"
              value="89"
              change={-5}
              icon={FiMessageSquare}
              color="green.500"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="Resolved Issues"
              value="456"
              change={8}
              icon={FiCheckCircle}
              color="purple.500"
            />
          </GridItem>
          <GridItem>
            <StatCard
              title="Active Users"
              value="23"
              change={15}
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
                <VStack spacing={3} align="stretch">
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">
                      New customer registered
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      2 minutes ago
                    </Text>
                  </Box>
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">
                      Feedback received from John Doe
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      15 minutes ago
                    </Text>
                  </Box>
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">
                      Reply approved by Manager
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      1 hour ago
                    </Text>
                  </Box>
                </VStack>
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
                  <Box p={3} bg="blue.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'blue.100' }}>
                    <Text fontSize="sm" fontWeight="medium" color="blue.700">
                      View All Customers
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      Manage customer information
                    </Text>
                  </Box>
                  <Box p={3} bg="green.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'green.100' }}>
                    <Text fontSize="sm" fontWeight="medium" color="green.700">
                      Review Pending Replies
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      Approve or reject replies
                    </Text>
                  </Box>
                  <Box p={3} bg="purple.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'purple.100' }}>
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
