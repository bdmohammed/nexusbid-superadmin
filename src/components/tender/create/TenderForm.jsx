"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import TenderStepper from "./TenderStepper";
import TenderNavigation from "./TenderNavigation";

import BasicInfoStep from "./steps/BasicInfoStep";
import LocationStep from "./steps/LocationStep";
import DetailsStep from "./steps/DetailsStep";
import DocumentsStep from "./steps/DocumentsStep";
import ReviewStep from "./steps/ReviewStep";

const steps = ["Basic Info", "Location", "Details", "Documents", "Review"];

export default function TenderForm() {
  const methods = useForm({
    mode: "onChange",

    defaultValues: {
      // ==========================================
      // STEP 1 : BASIC INFORMATION
      // ==========================================

      title: "",
      referenceNumber: "TDR-2026-001",

      tenderType: "",

      category: "",
      subCategory: "",

      currency: "INR",

      budgetMin: "",
      budgetMax: "",

      description: "",

      // ==========================================
      // STEP 2 : LOCATION
      // ==========================================

      country: "",
      state: "",
      city: "",
      pinCode: "",

      address: "",

      contactPerson: "",
      contactNumber: "",

      siteVisit: "No",

      mapLink: "",

      latitude: "",
      longitude: "",

      // ==========================================
      // STEP 3 : TENDER DETAILS
      // ==========================================

      openingDate: "",
      closingDate: "",

      projectDuration: "",

      bidValidity: "",

      emdAmount: "",

      securityDeposit: "",

      paymentTerms: "",

      priority: "Medium",

      evaluationMethod: "Technical",

      visibility: "Public",

      eligibility: "",

      specialConditions: "",

      // ==========================================
      // STEP 4 : DOCUMENTS
      // ==========================================

      tenderDocument: null,
      boqDocument: null,
      technicalDocument: null,
      drawings: null,
      nitDocument: null,
      termsDocument: null,
      internalNotes: "",

      additionalDocuments: [],

      // ==========================================
      // STEP 5 : REVIEW
      // ==========================================

      publishNow: true,
    },
  });

  const [step, setStep] = useState(0);

  const StepComponents = [
    BasicInfoStep,
    LocationStep,
    DetailsStep,
    DocumentsStep,
    ReviewStep,
  ];

  const CurrentStep = StepComponents[step];

  const nextStep = async () => {
    let fields = [];

    switch (step) {
      case 0:
        fields = [
          "title",
          // "tenderType",
          // "category",
          "subCategory",
          "description",
        ];
        break;

      case 1:
        fields = [
          // "country",
          "state",
          "city",
          "address",
        ];
        break;

      case 2:
        fields = ["openingDate", "closingDate"];
        break;

      case 3:
        // Document validation can be added later
        fields = [];
        break;

      default:
        fields = [];
    }

    const valid = await methods.trigger(fields);

    if (!valid) return;

    setStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setStep((prev) => prev - 1);
  };

  const submitForm = (data) => {
    console.log("Tender Data :", data);

    // TODO:
    // API Integration

    alert("Tender Created Successfully");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submitForm)} className="space-y-8">
        {/* =======================================
            PAGE HEADER
        ======================================== */}

        <div>
          <h1 className="mt-2 text-4xl font-bold text-text">Create Tender</h1>

          <p className="mt-2 text-text-light">
            Complete all five steps to publish a new tender.
          </p>
        </div>

        {/* =======================================
            STEPPER
        ======================================== */}

        <TenderStepper steps={steps} currentStep={step} />

        {/* =======================================
            STEP CONTENT
        ======================================== */}

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <CurrentStep />
        </div>

        {/* =======================================
            FOOTER NAVIGATION
        ======================================== */}

        <TenderNavigation
          currentStep={step}
          totalSteps={steps.length}
          onPrevious={previousStep}
          onNext={nextStep}
        />
      </form>
    </FormProvider>
  );
}
