import { redirect } from 'next/navigation';
import { getClientSession } from '@/lib/client-auth';
import ClientDashboard from './ClientDashboard';

export default async function ClientDashboardPage() {
  const session = await getClientSession();
  if (!session) {
    redirect('/client/login');
  }

  return <ClientDashboard />;
}
