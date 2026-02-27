import { useParams, useSearchParams } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';

export function CustomerDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();
  
  // Support both URL params and query params for tab routing
  const activeTab = urlTab || searchParams.get('tab') || 'overview';

  // Render profile tab
  if (activeTab === 'profile') {
    return (
      <div className="animate-in fade-in duration-300">
        <UserProfile />
      </div>
    );
  }

  // Default: overview/dashboard content
  return (
    <div className="min-h-screen bg-background-light font-display text-dark-text">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="bg-white border border-neutral-light rounded-3xl shadow-sm p-10">
          <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
            Customer Portal
          </p>
          <h2 className="text-2xl font-extrabold text-dark-text mt-2">
            Dashboard Coming Soon
          </h2>
          <p className="text-sm text-neutral-text mt-3">
            This space is ready for your customer dashboard content.
          </p>
        </div>
      </div>
    </div>
  );
}
