import { AppSidebar } from '@/components/app-sidebar';
import { CrashProvider } from '@/components/crash-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CrashProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </CrashProvider>
  );
}
