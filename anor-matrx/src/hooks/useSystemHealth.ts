import { useEffect } from 'react';
import { useAppConfigStore } from '../store/app-config.store';

export function useSystemHealth() {
  const health = useAppConfigStore((s) => s.health);
  const loading = useAppConfigStore((s) => s.loading.health);
  const error = useAppConfigStore((s) => s.error.health);
  const loadHealth = useAppConfigStore((s) => s.loadHealth);

  useEffect(() => {
    if (!health && !loading) {
      loadHealth();
    }
  }, [health, loading, loadHealth]);

  return { health, loading, error, reload: loadHealth };
}