import { useEffect } from 'react';
import { useAppConfigStore } from '../store/app-config.store';

export function useSkillsLibrary() {
  const skills = useAppConfigStore((s) => s.skills);
  const loading = useAppConfigStore((s) => s.loading.skills);
  const error = useAppConfigStore((s) => s.error.skills);
  const loadSkills = useAppConfigStore((s) => s.loadSkills);

  useEffect(() => {
    if (!skills.length && !loading) {
      loadSkills();
    }
  }, [skills.length, loading, loadSkills]);

  return { skills, loading, error, reload: loadSkills };
}