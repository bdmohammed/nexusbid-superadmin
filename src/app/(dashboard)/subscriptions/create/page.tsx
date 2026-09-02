'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Layers,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import { useCreatePlan } from '@/features/subscriptions';

export default function CreatePlanWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const createPlanMutation = useCreatePlan();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    badge: '',
    planType: 'all-access',
    priceCents: 0,
    currency: 'USD',
    durationDays: 30,
    trialDays: 0,
    setupFeeCents: 0,
    isRecurring: true,
    isFeatured: false,
    countryPricing: [] as {
      country: string;
      currency: string;
      priceCents: number;
    }[],
    categoryPricing: [] as { categoryId: string; priceCents: number }[],
    features: [] as { featureKey: string; limitValue: string }[],
    targetCountry: '',
    targetStateId: '',
    targetCategoryId: '',
    bundleSize: 5,
  });

  // Country Pricing row inputs
  const [newCountry, setNewCountry] = useState({
    country: '',
    currency: 'USD',
    priceCents: 0,
  });
  // Features catalog key choices
  const featureCatalog = [
    { key: 'max_tenders', label: 'Max Bid Submissions' },
    { key: 'api_access', label: 'Developer API Access' },
    { key: 'ai_search', label: 'AI Search Assistant' },
    { key: 'unlimited_documents', label: 'Unlimited Documents' },
  ];

  function addCountryPricing() {
    if (!newCountry.country) return;
    setFormData((prev) => ({
      ...prev,
      countryPricing: [...prev.countryPricing, newCountry],
    }));
    setNewCountry({ country: '', currency: 'USD', priceCents: 0 });
  }

  function removeCountryPricing(idx: number) {
    setFormData((prev) => ({
      ...prev,
      countryPricing: prev.countryPricing.filter((_, i) => i !== idx),
    }));
  }

  function handleFeatureLimit(key: string, value: string) {
    setFormData((prev) => {
      const idx = prev.features.findIndex((f) => f.featureKey === key);
      const updated = [...prev.features];
      if (idx > -1) {
        if (!value) {
          updated.splice(idx, 1);
        } else {
          updated[idx]!.limitValue = value;
        }
      } else if (value) {
        updated.push({ featureKey: key, limitValue: value });
      }
      return { ...prev, features: updated };
    });
  }

  const steps = [
    { id: 1, name: 'Plan Info', icon: FileText },
    { id: 2, name: 'Pricing Setup', icon: DollarSign },
    { id: 3, name: 'Geographic Pricing', icon: DollarSign },
    { id: 4, name: 'Features & Limits', icon: Layers },
    { id: 5, name: 'Summary & Review', icon: Check },
  ];

  async function handleFinalSubmit() {
    try {
      //@ts-ignore
      await createPlanMutation.mutateAsync({
        name: formData.name,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        priceCents: Math.round(Number(formData.priceCents) * 100),
        currency: formData.currency,
        durationDays: Number(formData.durationDays),
        trialDays: Number(formData.trialDays),
        setupFeeCents: Math.round(Number(formData.setupFeeCents) * 100),
        isRecurring: formData.isRecurring,
        isFeatured: formData.isFeatured,
        badge: formData.badge || undefined,
        planType: formData.planType as any,
        targetStateId: formData.targetStateId || undefined,
        targetCountry: formData.targetCountry || undefined,
        targetCategoryId: formData.targetCategoryId || undefined,
        bundleSize: formData.bundleSize ? Number(formData.bundleSize) : undefined,
        features: formData.features,
        countryPricing: formData.countryPricing.map((cp) => ({
          ...cp,
          priceCents: Math.round(Number(cp.priceCents) * 100),
        })),
        categoryPricing: formData.categoryPricing.map((cp) => ({
          ...cp,
          priceCents: Math.round(Number(cp.priceCents) * 100),
        })),
      });

      toast.success('Plan created successfully!');
      router.push('/subscriptions?view=plan-list');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create plan.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Link
          href="/subscriptions"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-light hover:text-text transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">Create Subscription Plan</h1>
          <p className="text-sm text-text-light mt-0.5">
            Setup new versioned pricing tiers for vendors.
          </p>
        </div>
      </div>

      {/* Progress Wizard Bar */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -translate-y-1/2 -z-10" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isActive = step === s.id;

            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 bg-surface px-4 z-10">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                    isCompleted
                      ? 'border-primary bg-primary text-white'
                      : isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-border text-text-light bg-surface'
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span
                  className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-text-light'}`}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm min-h-[350px]">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text">Step 1: Plan Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-text-light uppercase">Plan Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Professional Plan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-light uppercase">
                  Featured Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Most Popular"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-text-light uppercase">
                Subtitle / Caption
              </label>
              <input
                type="text"
                placeholder="Brief summary sentence"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-light uppercase">Description</label>
              <textarea
                placeholder="Full details of what is included..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-light uppercase">
                Plan Target Type
              </label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              >
                <option value="all-access">All-Access (Unrestricted)</option>
                <option value="state">State-Specific</option>
                <option value="country">Country-Specific</option>
                <option value="category">Category-Specific</option>
                <option value="bundle">Category Bundle</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text">Step 2: Pricing Configuration</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-text-light uppercase">
                  Price (in Cents) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4900 for $49.00"
                  value={formData.priceCents || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceCents: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-light uppercase">Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-light uppercase">
                  Duration Cycles (Days) *
                </label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationDays: parseInt(e.target.value, 10) || 30,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-light uppercase">
                  Trial Period (Days)
                </label>
                <input
                  type="number"
                  value={formData.trialDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trialDays: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Is Recurring Subscription
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Feature this Plan
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text">Step 3: Geographic Price Overrides</h2>
            <p className="text-xs text-text-light">
              Define regional pricing rules based on customer location.
            </p>

            <div className="flex flex-wrap gap-2.5 items-end bg-background p-4 rounded-xl border border-border">
              <div className="flex-1 min-w-[150px]">
                <label className="text-[10px] font-bold uppercase text-text-light">Country</label>
                <input
                  type="text"
                  placeholder="e.g. Canada"
                  value={newCountry.country}
                  onChange={(e) => setNewCountry({ ...newCountry, country: e.target.value })}
                  className="mt-1 w-full rounded border border-border bg-surface p-2 text-xs outline-none"
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] font-bold uppercase text-text-light">Currency</label>
                <input
                  type="text"
                  value={newCountry.currency}
                  onChange={(e) => setNewCountry({ ...newCountry, currency: e.target.value })}
                  className="mt-1 w-full rounded border border-border bg-surface p-2 text-xs outline-none"
                />
              </div>
              <div className="w-32">
                <label className="text-[10px] font-bold uppercase text-text-light">
                  Price (Cents)
                </label>
                <input
                  type="number"
                  placeholder="6500"
                  value={newCountry.priceCents || ''}
                  onChange={(e) =>
                    setNewCountry({
                      ...newCountry,
                      priceCents: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="mt-1 w-full rounded border border-border bg-surface p-2 text-xs outline-none"
                />
              </div>
              <Button type="button" size="sm" onClick={addCountryPricing}>
                Add Rule
              </Button>
            </div>

            {formData.countryPricing.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background font-semibold text-text-light uppercase">
                    <tr>
                      <th className="px-4 py-2">Country</th>
                      <th className="px-4 py-2">Currency</th>
                      <th className="px-4 py-2">Price (Cents)</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {formData.countryPricing.map((cp, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-bold">{cp.country}</td>
                        <td className="px-4 py-2">{cp.currency}</td>
                        <td className="px-4 py-2">${(cp.priceCents / 100).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeCountryPricing(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text">Step 4: Features & Capabilities</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {featureCatalog.map((feat) => {
                const currentVal =
                  formData.features.find((f) => f.featureKey === feat.key)?.limitValue || '';

                return (
                  <div
                    key={feat.key}
                    className="border border-border p-4 rounded-xl bg-background flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-sm font-semibold text-text">{feat.label}</span>
                      <p className="text-[10px] text-text-light mt-0.5">Key: {feat.key}</p>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 50 (or leave empty to exclude)"
                      value={currentVal}
                      onChange={(e) => handleFeatureLimit(feat.key, e.target.value)}
                      className="mt-3 w-full rounded border border-border bg-surface p-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-text">Step 5: Review & Submit</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-text-light uppercase tracking-wider">
                  Plan Information
                </h3>
                <div className="border border-border p-4 rounded-xl bg-background text-sm space-y-2">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Subtitle:</strong> {formData.subtitle || 'None'}
                  </p>
                  <p>
                    <strong>Type:</strong> {formData.planType}
                  </p>
                  <p>
                    <strong>Featured:</strong> {formData.isFeatured ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-text-light uppercase tracking-wider">
                  Default Pricing
                </h3>
                <div className="border border-border p-4 rounded-xl bg-background text-sm space-y-2">
                  <p>
                    <strong>Price:</strong> ${(formData.priceCents / 100).toFixed(2)}{' '}
                    {formData.currency}
                  </p>
                  <p>
                    <strong>Duration:</strong> {formData.durationDays} Days
                  </p>
                  <p>
                    <strong>Trial Period:</strong> {formData.trialDays} Days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          leftIcon={ChevronLeft}
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
        >
          Back
        </Button>
        {step < 5 ? (
          <Button
            rightIcon={ChevronRight}
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !formData.name}
          >
            Next Step
          </Button>
        ) : (
          <Button onClick={handleFinalSubmit} disabled={createPlanMutation.isPending}>
            {createPlanMutation.isPending ? 'Creating Plan...' : 'Submit Plan for Review'}
          </Button>
        )}
      </div>
    </div>
  );
}
