import { create } from 'zustand';
import type { BoundModelsState, HealthReport, SkillEntry, SettingsState } from '../types/system';
import { modelsApi } from '../api/models.api';
import { systemApi } from '../api/system.api';
import { skillsApi } from '../api/skills.api';

type AppConfigState = {
  health: HealthReport | null;
  modelBinding: BoundModelsState | null;
  skills: SkillEntry[];
  settings: SettingsState | null;
  loading: {
    health: boolean;
    models: boolean;
    skills: boolean;
    settings: boolean;
  };
  error: {
    health: string | null;
    models: string | null;
    skills: string | null;
    settings: string | null;
  };

  loadHealth: () => Promise<void>;
  loadModelBinding: () => Promise<void>;
  loadSkills: () => Promise<void>;
  loadSettings: () => Promise<void>;
  refreshAll: () => Promise<void>;
};

export const useAppConfigStore = create<AppConfigState>((set, get) => ({
  health: null,
  modelBinding: null,
  skills: [],
  settings: null,
  loading: {
    health: false,
    models: false,
    skills: false,
    settings: false,
  },
  error: {
    health: null,
    models: null,
    skills: null,
    settings: null,
  },

  loadHealth: async () => {
    set((state) => ({
      loading: { ...state.loading, health: true },
      error: { ...state.error, health: null },
    }));

    try {
      const health = await systemApi.getHealth();
      set((state) => ({
        health,
        loading: { ...state.loading, health: false },
      }));
    } catch (e: any) {
      set((state) => ({
        loading: { ...state.loading, health: false },
        error: { ...state.error, health: e.message || 'Failed to load health' },
      }));
    }
  },

  loadModelBinding: async () => {
    set((state) => ({
      loading: { ...state.loading, models: true },
      error: { ...state.error, models: null },
    }));

    try {
      const modelBinding = await modelsApi.getBindingState();
      set((state) => ({
        modelBinding,
        loading: { ...state.loading, models: false },
      }));
    } catch (e: any) {
      set((state) => ({
        loading: { ...state.loading, models: false },
        error: { ...state.error, models: e.message || 'Failed to load models' },
      }));
    }
  },

  loadSkills: async () => {
    set((state) => ({
      loading: { ...state.loading, skills: true },
      error: { ...state.error, skills: null },
    }));

    try {
      const skills = await skillsApi.list();
      set((state) => ({
        skills,
        loading: { ...state.loading, skills: false },
      }));
    } catch (e: any) {
      set((state) => ({
        loading: { ...state.loading, skills: false },
        error: { ...state.error, skills: e.message || 'Failed to load skills' },
      }));
    }
  },

  loadSettings: async () => {
    set((state) => ({
      loading: { ...state.loading, settings: true },
      error: { ...state.error, settings: null },
    }));

    try {
      const settings = await systemApi.getStatus();
      set((state) => ({
        settings,
        loading: { ...state.loading, settings: false },
      }));
    } catch (e: any) {
      set((state) => ({
        loading: { ...state.loading, settings: false },
        error: { ...state.error, settings: e.message || 'Failed to load settings' },
      }));
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().loadHealth(),
      get().loadModelBinding(),
      get().loadSkills(),
      get().loadSettings(),
    ]);
  },
}));