import { useAuth } from '../../context/index.js';

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')?.[0] ?? 'Usuario';
  const targetRole = user?.profile?.targetRole || 'Ingeniero de Software Senior';

  return (
    <div className="mx-auto max-w-[1180px] pl-0 pr-8">
    </div>
  );
}
