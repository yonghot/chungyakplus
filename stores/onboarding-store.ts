import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StepData {
  step1: Record<string, unknown> | null;
  step2: Record<string, unknown> | null;
  step3: Record<string, unknown> | null;
  step4: Record<string, unknown> | null;
}

interface OnboardingState {
  currentStep: number;
  stepData: StepData;
  setStep: (step: number) => void;
  setStepData: (step: 1 | 2 | 3 | 4, data: Record<string, unknown>) => void;
  reset: () => void;
  getMergedData: () => Record<string, unknown>;
}

const initialStepData: StepData = {
  step1: null,
  step2: null,
  step3: null,
  step4: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      stepData: { ...initialStepData },

      setStep: (step: number) => {
        set({ currentStep: step });
      },

      setStepData: (step: 1 | 2 | 3 | 4, data: Record<string, unknown>) => {
        set((state) => ({
          stepData: {
            ...state.stepData,
            [`step${step}`]: data,
          },
        }));
      },

      reset: () => {
        set({
          currentStep: 1,
          stepData: { ...initialStepData },
        });
      },

      getMergedData: () => {
        const { stepData } = get();
        return {
          ...(stepData.step1 ?? {}),
          ...(stepData.step2 ?? {}),
          ...(stepData.step3 ?? {}),
          ...(stepData.step4 ?? {}),
        };
      },
    }),
    {
      name: 'chungyakmate-onboarding',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepData: state.stepData,
      }),
    }
  )
);
