"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Step1NID, type Step1Data } from "@/components/onboarding/step-1-nid";
import {
  Step2NIDScan,
  type Step2Data,
} from "@/components/onboarding/step-2-nid-scan";
import {
  Step3CustomerInfo,
  type Step3Data,
} from "@/components/onboarding/step-3-customer-info";
import {
  Step4Photograph,
  type Step4Data,
} from "@/components/onboarding/step-4-photograph";
import {
  Step5Signature,
  type Step5Data,
} from "@/components/onboarding/step-5-signature";
import {
  Step6Screening,
  type AllFormData,
} from "@/components/onboarding/step-6-screening";

interface FormState {
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
  step5?: Step5Data;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormState>({});

  const markCompleted = useCallback(
    (step: number) => {
      setCompletedSteps((prev) =>
        prev.includes(step) ? prev : [...prev, step]
      );
    },
    []
  );

  const handleStep1 = useCallback(
    (data: Step1Data) => {
      setFormData((prev) => ({ ...prev, step1: data }));
      markCompleted(1);
      setCurrentStep(2);
      toast.success("NID verification submitted");
    },
    [markCompleted]
  );

  const handleStep2 = useCallback(
    (data: Step2Data) => {
      setFormData((prev) => ({ ...prev, step2: data }));
      markCompleted(2);
      setCurrentStep(3);
      toast.success("NID images uploaded");
    },
    [markCompleted]
  );

  const handleStep3 = useCallback(
    (data: Step3Data) => {
      setFormData((prev) => ({ ...prev, step3: data }));
      markCompleted(3);
      setCurrentStep(4);
      toast.success("Customer information saved");
    },
    [markCompleted]
  );

  const handleStep4 = useCallback(
    (data: Step4Data) => {
      setFormData((prev) => ({ ...prev, step4: data }));
      markCompleted(4);
      setCurrentStep(5);
      toast.success("Photograph uploaded");
    },
    [markCompleted]
  );

  const handleStep5 = useCallback(
    (data: Step5Data) => {
      setFormData((prev) => ({ ...prev, step5: data }));
      markCompleted(5);
      setCurrentStep(6);
      toast.success("Signature captured");
    },
    [markCompleted]
  );

  const handleFinalSubmit = useCallback(
    (data: { screeningChecks: unknown[] }) => {
      // Phase 1: Mock submission - just show success and redirect
      const hasFlagged = (
        data.screeningChecks as Array<{ status: string }>
      ).some((c) => c.status === "flagged");

      if (hasFlagged) {
        toast.warning(
          "Some screening checks are flagged. Customer has been submitted for review."
        );
      } else {
        toast.success(
          "Customer onboarding completed successfully! Account is pending approval."
        );
      }

      markCompleted(6);

      // Redirect after a brief delay
      setTimeout(() => {
        router.push("/customers");
      }, 2000);
    },
    [markCompleted, router]
  );

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  const kycTier = formData.step1?.kycTier ?? "simplified";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Customer Onboarding
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete all steps to onboard a new customer
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Step Content */}
      <div className="mt-6">
        {currentStep === 1 && (
          <Step1NID onNext={handleStep1} defaultValues={formData.step1} />
        )}

        {currentStep === 2 && (
          <Step2NIDScan
            onNext={handleStep2}
            onBack={goBack}
            defaultValues={formData.step2}
          />
        )}

        {currentStep === 3 && (
          <Step3CustomerInfo
            onNext={handleStep3}
            onBack={goBack}
            defaultValues={{
              ...formData.step3,
              dateOfBirth:
                formData.step3?.dateOfBirth ?? formData.step1?.dateOfBirth ?? "",
            }}
            kycTier={kycTier}
          />
        )}

        {currentStep === 4 && (
          <Step4Photograph
            onNext={handleStep4}
            onBack={goBack}
            defaultValues={formData.step4}
          />
        )}

        {currentStep === 5 && (
          <Step5Signature
            onNext={handleStep5}
            onBack={goBack}
            defaultValues={formData.step5}
          />
        )}

        {currentStep === 6 &&
          formData.step1 &&
          formData.step2 &&
          formData.step3 &&
          formData.step4 &&
          formData.step5 && (
            <Step6Screening
              onSubmit={handleFinalSubmit}
              onBack={goBack}
              allFormData={
                {
                  step1: formData.step1,
                  step2: formData.step2,
                  step3: formData.step3,
                  step4: formData.step4,
                  step5: formData.step5,
                } as AllFormData
              }
            />
          )}
      </div>
    </div>
  );
}
