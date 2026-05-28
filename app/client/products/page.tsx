import { redirect } from 'next/navigation';
import { getClientSession } from '@/lib/client-auth';
import ClientProductCatalog from './ClientProductCatalog';

export default async function ClientProductsPage() {
  const session = await getClientSession();
  if (!session) {
    redirect('/client/login');
  }

  return <ClientProductCatalog />;
}
