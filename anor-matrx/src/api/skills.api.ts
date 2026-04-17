import { apiRequest } from './client';
import type { SkillEntry } from '../types/system';

export const skillsApi = {
  list() {
    return apiRequest<SkillEntry[]>('/skills');
  },
};