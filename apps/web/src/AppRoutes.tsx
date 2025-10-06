import { Routes, Route } from 'react-router-dom';
import { ThemedLayoutV2 } from '@refinedev/chakra-ui';
import { Authenticated } from '@refinedev/core';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { FeedbackPage } from '@/features/feedback/FeedbackPage';
import { RepliesPage } from '@/features/replies/RepliesPage';
import { AuditPage } from '@/features/audit/AuditPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { Header } from '@/components/layout/Header';
import { CustomSider } from '@/components/layout/CustomSider';
import { RoleGuard } from '@/components/guards/RoleGuard';

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <ThemedLayoutV2
    Header={() => <Header />}
    Sider={() => <CustomSider />}
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
                <Route 
                  path="/customers" 
                  element={
                    <RoleGuard allowedRoles={['CSO', 'MANAGER']}>
                      <CustomersPage />
                    </RoleGuard>
                  } 
                />
                <Route 
                  path="/feedback" 
                  element={
                    <RoleGuard allowedRoles={['CSO', 'MANAGER']}>
                      <FeedbackPage />
                    </RoleGuard>
                  } 
                />
                <Route 
                  path="/replies" 
                  element={
                    <RoleGuard allowedRoles={['CSO', 'MANAGER']}>
                      <RepliesPage />
                    </RoleGuard>
                  } 
                />
                    <Route 
                      path="/audit" 
                      element={
                        <RoleGuard allowedRoles={['MANAGER']}>
                          <AuditPage />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/reports" 
                      element={
                        <RoleGuard allowedRoles={['MANAGER']}>
                          <ReportsPage />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/notifications" 
                      element={
                        <RoleGuard allowedRoles={['CSO', 'MANAGER']}>
                          <NotificationsPage />
                        </RoleGuard>
                      } 
                    />
              </Routes>
            </AppLayout>
          </Authenticated>
        }
      />
    </Routes>
  );
};
