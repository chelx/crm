import { Refine } from '@refinedev/core';
import { RefineThemes, ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/chakra-ui';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { dataProvider } from '@/services/data-provider';
import { authProvider } from '@/services/auth-provider';
import { AppRoutes } from './AppRoutes';
import theme from '@/theme';

function App() {
  return (
    <ChakraProvider theme={RefineThemes.Blue}>
      <BrowserRouter>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
          resources={[
            {
              name: 'customers',
              list: '/customers',
              create: '/customers/create',
              edit: '/customers/edit/:id',
              show: '/customers/show/:id',
            },
            {
              name: 'feedback',
              list: '/feedback',
              show: '/feedback/show/:id',
            },
            {
              name: 'replies',
              list: '/replies',
              create: '/replies/create',
              edit: '/replies/edit/:id',
              show: '/replies/show/:id',
            },
            {
              name: 'audit',
              list: '/audit',
              show: '/audit/show/:id',
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <AppRoutes />
        </Refine>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
