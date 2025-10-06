import { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  VStack,
  Text,
  Select,
  Button,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import { useCustom } from '@refinedev/core';

type NotificationStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'READ';

export const NotificationsPage = () => {
  const [status, setStatus] = useState<NotificationStatus | ''>('');

  const listQuery = useCustom<{ data: any[]; meta?: any }>({
    url: '/notifications',
    method: 'get',
    config: {
      query: {
        status: status || undefined,
        page: 1,
        limit: 50,
      },
    },
  });

  const markAll = async () => {
    await fetch('http://localhost:3001/v1/notifications/read-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    listQuery.refetch?.();
  };

  const notifications = Array.isArray((listQuery.data as any)?.data)
    ? (listQuery.data as any).data
    : [];

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'READ':
        return 'gray';
      case 'PENDING':
        return 'yellow';
      case 'DELIVERED':
        return 'blue';
      case 'FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" align="center" flexWrap="wrap" rowGap={3}>
          <Heading size="lg">Notifications</Heading>
          <HStack spacing={3}>
            <Select
              placeholder="All statuses"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              maxW="220px"
              size="sm"
            >
              <option value="PENDING">Pending</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed</option>
              <option value="READ">Read</option>
            </Select>
            <HStack spacing={3}>
              <Button size="sm" onClick={() => listQuery.refetch?.()}>Refresh</Button>
              <Button size="sm" colorScheme="blue" variant="outline" onClick={markAll}>Mark all as read</Button>
            </HStack>
          </HStack>
        </HStack>

        <Card>
          <CardHeader>
            <Heading size="md">Recent</Heading>
          </CardHeader>
          <CardBody>
            {listQuery.isLoading ? (
              <Flex justify="center" py={6}><Spinner /></Flex>
            ) : notifications.length ? (
              <VStack align="stretch" spacing={3}>
                {notifications.map((n: any) => (
                  <Box key={n.id} p={3} borderWidth="1px" borderRadius="md" w="full">
                    <HStack align="start" justify="space-between" w="full">
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text fontWeight="bold" noOfLines={1}>{n.title || n.type}</Text>
                        <Text fontSize="sm" color="gray.600" wordBreak="break-word" whiteSpace="pre-wrap">
                          {n.message}
                        </Text>
                        <Text fontSize="xs" color="gray.500">{new Date(n.createdAt).toLocaleString()}</Text>
                      </VStack>
                      <Badge colorScheme={getStatusColor(n.status)}>{n.status}</Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Alert status="info"><AlertIcon />No notifications</Alert>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};


