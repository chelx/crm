import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Container,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@refinedev/core';
import { LoginCredentials } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginPage = () => {
  const { mutate: login, isLoading, error } = useLogin<LoginCredentials>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginCredentials) => {
    login(data);
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="md">
        <Card shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={2}>
                <Box
                  w={16}
                  h={16}
                  bg="brand.500"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  C
                </Box>
                <Heading size="lg" color="brand.500">
                  CRM System
                </Heading>
                <Text color="gray.600" textAlign="center">
                  Sign in to your account
                </Text>
              </VStack>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error.message || 'Login failed'}
                </Alert>
              )}

              <Box w="full">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        size="lg"
                        {...register('email')}
                      />
                      {errors.email && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.email.message}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        size="lg"
                        {...register('password')}
                      />
                      {errors.password && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.password.message}
                        </Text>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      isLoading={isLoading}
                      loadingText="Signing in..."
                      mt={4}
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>
              </Box>

              <Box
                bg="blue.50"
                p={4}
                borderRadius="md"
                w="full"
                border="1px solid"
                borderColor="blue.200"
              >
                <Text fontSize="sm" color="blue.700" textAlign="center" fontWeight="medium">
                  Demo Credentials
                </Text>
                <Text fontSize="sm" color="blue.600" textAlign="center" mt={1}>
                  Email: cso@example.com<br />
                  Password: password123
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};
