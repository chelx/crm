import { Routes, Route } from 'react-router-dom';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/chakra-ui';
import { Authenticated } from '@refinedev/core';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { Header } from '@/components/layout/Header';

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <ThemedLayoutV2
    Header={() => <Header />}
    Sider={() => <ThemedSiderV2 />}
    Title={() => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3182ce',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          C
        </div>
        <span style={{ fontWeight: 'bold' }}>CRM System</span>
      </div>
    )}
  >
    {children}
  </ThemedLayoutV2>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <Authenticated fallback={<LoginPage />} key="authenticated-routes">
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/customers" element={<div>Customers Page - Coming Soon</div>} />
                <Route path="/feedback" element={<div>Feedback Page - Coming Soon</div>} />
                <Route path="/replies" element={<div>Replies Page - Coming Soon</div>} />
                <Route path="/audit" element={<div>Audit Page - Coming Soon</div>} />
              </Routes>
            </AppLayout>
          </Authenticated>
        }
      />
    </Routes>
  );
};
