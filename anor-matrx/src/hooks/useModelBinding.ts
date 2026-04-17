import { useEffect } from 'react';
import { useAppConfigStore } from '../store/app-config.store';

export function useModelBinding() {
  const modelBinding = useAppConfigStore((s) => s.modelBinding);
  const loading = useAppConfigStore((s) => s.loading.models);
  const error = useAppConfigStore((s) => s.error.models);
  const loadModelBinding = useAppConfigStore((s) => s.loadModelBinding);

  useEffect(() => {
    if (!modelBinding && !loading) {
      loadModelBinding();
    }
  }, [modelBinding, loading, loadModelBinding]);

  return { modelBinding, loading, error, reload: loadModelBinding };
}