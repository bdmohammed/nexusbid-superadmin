"use client";

import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import BasicInfoStep from "./steps/BasicInfoStep";
import DetailsStep from "./steps/DetailsStep";
import DocumentsStep from "./steps/DocumentsStep";
import LocationStep from "./steps/LocationStep";
import ReviewStep from "./steps/ReviewStep";
import TenderNavigation from "./TenderNavigation";
import TenderStepper from "./TenderStepper";
import { useRouter } from "next/navigation";
import { useCategories } from "@/features/categories/api/queries";
import { useStates } from "@/features/country/api/queries";
import { toast } from "sonner";
import { tenderApi } from "@/features/tenders";
import { TenderSubmitReviewModal } from "../TenderGovernanceModals";

const steps = ["Basic Info", "Location", "Details", "Documents", "Review"];

interface TenderFormInput {
  title: string;
  referenceNumber: string;
  tenderType: string;
  category: string;
  currency: string;
  budgetMin: string;
  budgetMax: string;
  description: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  siteVisit: string;
  mapLink: string;
  placeId: string;
  formattedAddress: string;
  openingDate: string;
  closingDate: string;
  projectDuration: string;
  bidValidity: string;
  emdAmount: string;
  securityDeposit: string;
  paymentTerms: string;
  priority: string;
  evaluationMethod: string;
  visibility: string;
  eligibility: string;
  specialConditions: string;
  internalNotes: string;
  publishNow: boolean;
}

const StepComponents = [
  BasicInfoStep,
  LocationStep,
  DetailsStep,
  DocumentsStep,
  ReviewStep,
];

export default function TenderForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  // Draft Tender & Document State
  const [draftTenderId, setDraftTenderId] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  const methods = useForm<TenderFormInput>({
    mode: "onChange",
    defaultValues: {
      title: "",
      referenceNumber: "Auto-generated on draft creation",
      tenderType: "",
      category: "",
      currency: "",
      budgetMin: "",
      budgetMax: "",
      description: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
      address: "",
      contactPerson: "",
      contactNumber: "",
      siteVisit: "",
      mapLink: "",
      placeId: "",
      formattedAddress: "",
      openingDate: "",
      closingDate: "",
      projectDuration: "",
      bidValidity: "",
      emdAmount: "",
      securityDeposit: "",
      paymentTerms: "",
      priority: "",
      evaluationMethod: "",
      visibility: "",
      eligibility: "",
      specialConditions: "",
      internalNotes: "",
      publishNow: false,
    },
  });

  const { data: categoryData } = useCategories({
    status: "PUBLISHED",
    limit: 100,
  });
  const rawCategories = categoryData?.categories || [];
  const categories = rawCategories.filter((c: any) => c.status === "PUBLISHED");
  const selectedCountry = methods.watch("country");
  const [tenderId, setTenderId] = useState<string | null>(null);
  const { data: states = [] } = useStates(
    selectedCountry ? { country: selectedCountry } : undefined,
  );

  // Create draft tender on demand or return existing ID
  const ensureDraftCreated = async (): Promise<string> => {
    if (draftTenderId) return draftTenderId;

    const values = methods.getValues();
    const selectedCategoryObj = categories.find(
      (c: any) => c.id === values.category,
    );

    const payload = {
      title: values.title?.trim() || "Untitled Procurement Tender Draft",
      description:
        values.description?.trim() || "Draft procurement tender description.",
      procurementType: values.tenderType || "Services",
      priority: values.priority || "Medium",
      currency: values.currency || "USD",
      visibility: "public",
      department: selectedCategoryObj?.name || undefined,
      categoryId: values.category || undefined,
      stateId: values.state ? parseInt(values.state, 10) : undefined,
    };

    const res = await tenderApi.adminCreate(payload as any);

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Draft tender initialization failed");
    }

    const createdTender = res.data.data;

    setDraftTenderId(createdTender.id);
    setTenderId(createdTender.id);
    if (createdTender.referenceNo) {
      methods.setValue("referenceNumber", createdTender.referenceNo);
    }
    toast.success(`Draft Tender Initialized (${createdTender.referenceNo})`);

    return createdTender.id;
  };

  const CurrentStep = StepComponents[step];

  const nextStep = async () => {
    let fields: (keyof TenderFormInput)[] = [];

    switch (step) {
      case 0:
        fields = ["title", "category", "description", "tenderType"];
        break;
      case 1:
        fields = ["country", "state", "address"];
        break;
      case 2:
        fields = ["openingDate", "closingDate"];
        break;
      default:
        fields = [];
    }

    const valid = await methods.trigger(fields);
    if (!valid) return;

    // Task-oriented auto-save on step progress
    try {
      const tenderId = await ensureDraftCreated();
      setTenderId(tenderId);
      const values = methods.getValues();
      const selectedCategoryObj = categories.find(
        (c: any) => c.id === values.category,
      );
      const selectedStateObj = states.find((s: any) => s.id === values.state);

      if (step === 0) {
        await tenderApi.updateBasicInfo(tenderId, {
          title: values.title,
          description: values.description,
          procurementType: values.tenderType || "Services",
          priority: values.priority,
          currency: values.currency,
          department: selectedCategoryObj?.name || undefined,
          categoryId: values.category || undefined,
        } as any);
      } else if (step === 1) {
        await tenderApi.updateLocation(tenderId, {
          placeId: values.placeId || undefined,
          formattedAddress:
            values.formattedAddress ||
            `${values.address}, ${values.city || ""}, ${selectedStateObj?.name || values.state}, ${values.country}`,
          siteVisitRequired: values.siteVisit === "Yes",
          contactPerson: values.contactPerson || undefined,
          contactPhone: values.contactNumber || undefined,
          stateId: values.state ? parseInt(values.state, 10) : undefined,
        } as any);
      } else if (step === 2) {
        await tenderApi.updateSchedule(tenderId, {
          openingDate: values.openingDate
            ? new Date(values.openingDate).toISOString()
            : undefined,
          closingDate: values.closingDate
            ? new Date(values.closingDate).toISOString()
            : undefined,
        } as any);
        await tenderApi.updateCommercial(tenderId, {
          estimatedBudget: values.budgetMax
            ? parseInt(values.budgetMax, 10)
            : 0,
          currency: values.currency,
          bidValidity: values.bidValidity
            ? parseInt(values.bidValidity, 10)
            : undefined,
          projectDuration: values.projectDuration || undefined,
          emdAmount: values.emdAmount
            ? parseInt(values.emdAmount, 10)
            : undefined,
          securityDeposit: values.securityDeposit
            ? parseInt(values.securityDeposit, 10)
            : undefined,
          paymentTerms: values.paymentTerms || undefined,
          evaluationMethod: values.evaluationMethod || undefined,
          eligibilityCriteria: values.eligibility || undefined,
          specialConditions: values.specialConditions || undefined,
        } as any);
      }
    } catch (err) {
      console.warn("Draft task-oriented save notice:", err);
    }

    setStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setStep((prev) => prev - 1);
  };

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const submitForm = () => {
    setIsSubmitModalOpen(true);
  };
  console.log("isSubmitModalOpen", tenderId, isSubmitModalOpen);
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submitForm)} className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="mt-2 text-4xl font-bold text-text">Create Tender</h1>
          <p className="mt-2 text-text-light text-sm">
            Draft is created automatically. Files are uploaded directly to S3
            via presigned URLs and stored as version metadata in PostgreSQL.
          </p>
        </div>

        {/* Stepper */}
        <TenderStepper steps={steps} currentStep={step} />

        {/* Step Content */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <CurrentStep
            draftTenderId={draftTenderId}
            ensureDraftCreated={ensureDraftCreated}
            uploadedDocs={uploadedDocs}
            setUploadedDocs={setUploadedDocs}
          />
        </div>

        {/* Footer Navigation */}
        <TenderNavigation
          currentStep={step}
          totalSteps={steps.length}
          onPrevious={previousStep}
          onNext={nextStep}
          submitting={submitting}
        />
      </form>

      {/* Governance Submit & Reviewer Assignment Modal */}
      {tenderId && (
        <TenderSubmitReviewModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          tenderId={tenderId}
          onSuccess={() => {
            router.push(`/tenders/${tenderId}`);
          }}
        />
      )}
    </FormProvider>
  );
}
