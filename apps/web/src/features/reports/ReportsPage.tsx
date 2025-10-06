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
  Input,
  Select,
  Button,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useCustom } from '@refinedev/core';

export const ReportsPage = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [channel, setChannel] = useState('');

  const panelText = useColorModeValue('gray.800', 'gray.100');
  const subtleText = useColorModeValue('gray.600', 'gray.400');

  const feedbackVolume = useCustom<{ series: { date: string; count: number }[] }>({
    url: '/reports/feedback-volume',
    method: 'get',
    config: {
      query: {
        from: from || undefined,
        to: to || undefined,
        groupBy,
        channel: channel || undefined,
      },
    },
  });

  const repliesMetrics = useCustom<{ avgApprovalHours: number; avgReplyHours: number; totalApproved: number; totalReplies: number }>({
    url: '/reports/replies-metrics',
    method: 'get',
    config: {
      query: { from: from || undefined, to: to || undefined },
    },
  });

  const workload = useCustom<Array<{ userId: string; email: string; role: string; totalReplies: number }>>({
    url: '/reports/workload',
    method: 'get',
    config: {
      query: { from: from || undefined, to: to || undefined },
    },
  });

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">Reporting & Dashboards</Heading>

        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} maxW="200px" />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} maxW="200px" />
              <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)} maxW="200px">
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </Select>
              <Select placeholder="All channels" value={channel} onChange={(e) => setChannel(e.target.value)} maxW="200px">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="chat">Chat</option>
                <option value="social">Social</option>
              </Select>
              <Button onClick={() => { feedbackVolume.refetch(); repliesMetrics.refetch(); workload.refetch(); }}>Refresh</Button>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><Heading size="md">Feedback Volume</Heading></CardHeader>
          <CardBody>
            {feedbackVolume.isLoading ? (
              <Flex justify="center" py={6}><Spinner /></Flex>
            ) : feedbackVolume.data?.data?.series?.length ? (
              <VStack align="stretch" spacing={2}>
                {feedbackVolume.data.data.series.map((item) => (
                  <HStack key={item.date} justify="space-between">
                    <Text color={subtleText}>{item.date}</Text>
                    <Text fontWeight="bold" color={panelText}>{item.count}</Text>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Alert status="info"><AlertIcon />No data</Alert>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><Heading size="md">Reply Performance</Heading></CardHeader>
          <CardBody>
            {repliesMetrics.isLoading ? (
              <Flex justify="center" py={6}><Spinner /></Flex>
            ) : repliesMetrics.data?.data ? (
              <VStack align="start" spacing={2}>
                <Text>Average approval time: <b>{repliesMetrics.data.data.avgApprovalHours}h</b></Text>
                <Text>Average reply turnaround: <b>{repliesMetrics.data.data.avgReplyHours}h</b></Text>
                <Text>Total replies: <b>{repliesMetrics.data.data.totalReplies}</b></Text>
                <Text>Total approved: <b>{repliesMetrics.data.data.totalApproved}</b></Text>
              </VStack>
            ) : (
              <Alert status="info"><AlertIcon />No data</Alert>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><Heading size="md">CSO Workload</Heading></CardHeader>
          <CardBody>
            {workload.isLoading ? (
              <Flex justify="center" py={6}><Spinner /></Flex>
            ) : workload.data?.data?.length ? (
              <VStack align="stretch" spacing={2}>
                {workload.data.data.map((row) => (
                  <HStack key={row.userId} justify="space-between">
                    <Text color={subtleText}>{row.email} ({row.role})</Text>
                    <Text fontWeight="bold" color={panelText}>{row.totalReplies}</Text>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Alert status="info"><AlertIcon />No data</Alert>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};


