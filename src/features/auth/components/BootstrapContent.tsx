'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { authApi } from '@/features/auth/api/api';
import { getErrorMessage } from '@/lib/errors';

export function BootstrapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [actionStatus, setActionStatus] = useState<
    'idle' | 'loading' | 'success_approve' | 'success_reject' | 'error'
  >('idle');
  const [adminDetails, setAdminDetails] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Verify token on load
  useEffect(() => {
    if (!token) {
      setVerifyStatus('error');
      setErrorMsg('No bootstrap token provided. Please check the setup link sent to your email.');
      return;
    }

    setVerifyStatus('loading');
    authApi
      .bootstrapVerify(token)
      .then((res) => {
        const { data } = res;
        if (!data.success) {
          setVerifyStatus('error');
          setErrorMsg(data.message || 'Verification failed.');
          return;
        }
        setAdminDetails(data.data);
        setVerifyStatus('success');
      })
      .catch((err: unknown) => {
        setVerifyStatus('error');
        setErrorMsg(
          getErrorMessage(err) ||
            'The bootstrap link is invalid, expired, or bootstrap setup has already been completed.',
        );
      });
  }, [token]);

  // 2. Approve/Reject Admin
  const handleAction = async (action: 'approve' | 'reject') => {
    if (!token) return;
    setActionStatus('loading');
    try {
      const res = await authApi.bootstrapApprove(token, action);
      const { data } = res;
      if (!data.success) {
        setActionStatus('error');
        setErrorMsg(
          data.message || `${action === 'approve' ? 'Bootstrap approval' : 'Rejection'} failed.`,
        );
        return;
      }
      setActionStatus(action === 'approve' ? 'success_approve' : 'success_reject');
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (err: unknown) {
      setActionStatus('error');
      setErrorMsg(getErrorMessage(err) || `Bootstrap ${action} action failed. Please try again.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Token state */}
      {verifyStatus === 'loading' && (
        <div className="py-12 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#003EC7]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#003EC7] animate-spin" />
            </div>
          </div>
          <p className="text-[var(--muted)] text-sm animate-pulse">
            Verifying secure bootstrap token...
          </p>
        </div>
      )}

      {/* Error state */}
      {(verifyStatus === 'error' || actionStatus === 'error') && (
        <div className="py-6 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl font-light">
              ✕
            </div>
          </div>
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <p className="text-red-400 text-sm leading-relaxed">{errorMsg}</p>
          </div>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)]/80 text-[var(--foreground)] font-medium rounded-xl border border-[var(--border)] transition-all duration-200 text-sm"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Success verification - Pending action state */}
      {verifyStatus === 'success' && actionStatus === 'idle' && adminDetails && (
        <div className="space-y-6">
          <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-2xl text-left space-y-4">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
              Administrator Candidate Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-[var(--muted)] mb-0.5">Full Name</span>
                <span className="text-[var(--foreground)] font-medium">{adminDetails.name}</span>
              </div>
              <div>
                <span className="block text-xs text-[var(--muted)] mb-0.5">Email Address</span>
                <span className="text-[var(--foreground)] font-medium">{adminDetails.email}</span>
              </div>
              <div>
                <span className="block text-xs text-[var(--muted)] mb-0.5">
                  Assigned Target Role
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-500">
                  SUPER_ADMIN
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#003EC7]/5 border border-[#003EC7]/10 rounded-2xl text-left text-xs text-[#003EC7] leading-relaxed">
            <strong>Security Notice:</strong> Approving this setup will activate this administrator
            account and assign them the highest system privileges. This bootstrap page will be
            disabled permanently after execution.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleAction('reject')}
              className="w-full sm:w-1/2 py-3.5 px-6 bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)]/80 text-[var(--foreground)] font-semibold rounded-xl border border-[var(--border)] active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
            >
              Reject Request
            </button>
            <button
              type="button"
              onClick={() => handleAction('approve')}
              className="w-full sm:w-1/2 py-3.5 px-6 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-xl shadow-lg shadow-[#003EC7]/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
            >
              Approve & Bootstrap
            </button>
          </div>
        </div>
      )}

      {/* Action Loading State */}
      {actionStatus === 'loading' && (
        <div className="py-12 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#003EC7]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#003EC7] animate-spin" />
            </div>
          </div>
          <p className="text-[var(--muted)] text-sm animate-pulse">Processing request details...</p>
        </div>
      )}

      {/* Action Success Approve State */}
      {actionStatus === 'success_approve' && (
        <div className="py-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-3xl">
              ✓
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--foreground)]">System Bootstrapped!</h3>
            <p className="text-[var(--muted)] text-sm max-w-sm mx-auto leading-relaxed">
              The first Super Admin has been configured successfully. Redirecting you to the sign in
              page to access the admin dashboard...
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[10px] text-[var(--muted)] uppercase tracking-widest">
              Redirecting in 5 seconds
            </div>
          </div>
        </div>
      )}

      {/* Action Success Reject State */}
      {actionStatus === 'success_reject' && (
        <div className="py-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl">
              ✕
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--foreground)]">Request Rejected</h3>
            <p className="text-[var(--muted)] text-sm max-w-sm mx-auto leading-relaxed">
              The administrator registration request has been rejected successfully. Redirecting you
              to the sign in page...
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[10px] text-[var(--muted)] uppercase tracking-widest">
              Redirecting in 5 seconds
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BootstrapContent;
