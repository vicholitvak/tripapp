'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { InvitationService } from '@/lib/services/invitationService';
import { ProviderService } from '@/lib/services/providerService';
import {
  Invitation,
  Provider,
  OnboardingProgress,
  ProviderType,
} from '@/types/provider';

interface OnboardingContextType {
  // Estado
  invitation: Invitation | null;
  provider: Provider | null;
  progress: OnboardingProgress | null;
  currentStep: number;
  loading: boolean;
  error: string | null;

  // Draft data
  draftData: OnboardingProgress['draftData'];

  // Métodos
  validateInvitation: (code: string) => Promise<boolean>;
  startOnboarding: (type: ProviderType) => Promise<void>;
  updateDraft: (step: string, data: Partial<OnboardingProgress['draftData']>) => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  submitForApproval: () => Promise<void>;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const TOTAL_STEPS = 7;
const STORAGE_KEY = 'onboarding_draft';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<OnboardingProgress['draftData']>({});

  const loadProgress = useCallback(async () => {
    if (!user) return;

    try {
      const existingProgress = await ProviderService.getOnboardingProgress(user.uid);
      if (existingProgress) {
        setProgress(existingProgress);
        setDraftData(existingProgress.draftData);
        setCurrentStep(existingProgress.currentStep);
      }

      const existingProvider = await ProviderService.getByUserId(user.uid);
      if (existingProvider) {
        setProvider(existingProvider);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, [user]);

  // Cargar draft desde localStorage al inicio
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDraftData(parsed.draftData || {});
          setCurrentStep(parsed.currentStep || 0);
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }

      // Cargar progreso desde Firestore
      loadProgress();
    }
  }, [user, loadProgress]);

  // Auto-guardar en localStorage cuando cambia draftData
  useEffect(() => {
    if (user && Object.keys(draftData).length > 0) {
      localStorage.setItem(
        `${STORAGE_KEY}_${user.uid}`,
        JSON.stringify({ draftData, currentStep })
      );
    }
  }, [draftData, currentStep, user]);

  const validateInvitation = async (code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await InvitationService.validateCode(code);

      if (!result.valid) {
        setError(result.error || 'Código inválido');
        setLoading(false);
        return false;
      }

      setInvitation(result.invitation!);
      setLoading(false);
      return true;
    } catch (err) {
      setError('Error al validar la invitación');
      setLoading(false);
      return false;
    }
  };

  const startOnboarding = async (type: ProviderType) => {
    if (!user || !invitation) {
      setError('Usuario o invitación no encontrados');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear progreso de onboarding
      const newProgress = await ProviderService.createOnboardingProgress(
        user.uid,
        invitation.code
      );

      setProgress(newProgress);
      setDraftData({ type });
      setCurrentStep(1);

      // Marcar invitación como usada
      if (invitation.id) {
        await InvitationService.markAsUsed(invitation.id, user.uid);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error starting onboarding:', err);
      setError('Error al iniciar el proceso');
      setLoading(false);
    }
  };

  const updateDraft = async (
    step: string,
    data: Partial<OnboardingProgress['draftData']>
  ) => {
    if (!user) return;

    const updatedDraft = { ...draftData, ...data };
    setDraftData(updatedDraft);

    try {
      // Guardar en Firestore
      await ProviderService.updateOnboardingProgress(user.uid, step, data);

      // Actualizar progress local
      if (progress) {
        const completedSteps = progress.completedSteps.includes(step)
          ? progress.completedSteps
          : [...progress.completedSteps, step];

        setProgress({
          ...progress,
          completedSteps,
          currentStep: completedSteps.length,
          draftData: updatedDraft,
        });
      }
    } catch (err) {
      console.error('Error updating draft:', err);
      setError('Error al guardar el progreso');
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
    }
  };

  const submitForApproval = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Completar onboarding y crear provider
      const newProvider = await ProviderService.completeOnboarding(user.uid);
      setProvider(newProvider);

      // Limpiar localStorage
      localStorage.removeItem(`${STORAGE_KEY}_${user.uid}`);

      setLoading(false);
    } catch (err) {
      console.error('Error submitting for approval:', err);
      setError('Error al enviar para aprobación');
      setLoading(false);
      throw err;
    }
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.uid}`);
    }
    setInvitation(null);
    setProvider(null);
    setProgress(null);
    setCurrentStep(0);
    setDraftData({});
    setError(null);
  };

  const value: OnboardingContextType = {
    invitation,
    provider,
    progress,
    currentStep,
    loading,
    error,
    draftData,
    validateInvitation,
    startOnboarding,
    updateDraft,
    nextStep,
    previousStep,
    goToStep,
    submitForApproval,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
