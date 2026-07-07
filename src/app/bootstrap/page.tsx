'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api/api';

export default function BootstrapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success_approve' | 'success_reject' | 'error'>('idle');
  const [adminDetails, setAdminDetails] = useState<{ name: string; email: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Verify token on load
  useEffect(() => {
    if (!token) {
      setVerifyStatus('error');
      setErrorMsg('No bootstrap token provided. Please check the setup link sent to your email.');
      return;
    }

    setVerifyStatus('loading');
    authApi.bootstrapVerify(token)
      .then((res) => {
        const data = res.data;
        if (!data.success) {
          setVerifyStatus('error');
          setErrorMsg(data.message || 'Verification failed.');
          return;
        }
        setAdminDetails(data.data);
        setVerifyStatus('success');
      })
      .catch((err: any) => {
        setVerifyStatus('error');
        setErrorMsg(err.response?.data?.message || 'The bootstrap link is invalid, expired, or bootstrap setup has already been completed.');
      });
  }, [token]);

  // 2. Approve/Reject Admin
  const handleAction = async (action: 'approve' | 'reject') => {
    if (!token) return;
    setActionStatus('loading');
    try {
      const res = await authApi.bootstrapApprove(token, action);
      const data = res.data;
      if (!data.success) {
        setActionStatus('error');
        setErrorMsg(data.message || `${action === 'approve' ? 'Bootstrap approval' : 'Rejection'} failed.`);
        return;
      }
      setActionStatus(action === 'approve' ? 'success_approve' : 'success_reject');
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (err: any) {
      setActionStatus('error');
      setErrorMsg(err.response?.data?.message || `Bootstrap ${action} action failed. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#0a0f1d] relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-lg p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6 uppercase tracking-wider">
            System Initialization
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Admin Bootstrap Setup
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md mx-auto">
            Review and approve the first administrator to initialize the NexusBid enterprise environment.
          </p>

          {/* Loading Token state */}
          {verifyStatus === 'loading' && (
            <div className="py-12 space-y-6">
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm animate-pulse">Verifying secure bootstrap token...</p>
            </div>
          )}

          {/* Error state */}
          {(verifyStatus === 'error' || actionStatus === 'error') && (
            <div className="py-6 space-y-6">
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
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all duration-200 text-sm"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Success verification - Pending action state */}
          {verifyStatus === 'success' && actionStatus === 'idle' && adminDetails && (
            <div className="space-y-8 animate-fadeIn">
              <div className="p-6 bg-white/[0.01] border border-white/[0.04] rounded-2xl text-left space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2">
                  Administrator Candidate Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-400 mb-0.5">Full Name</span>
                    <span className="text-white font-medium">{adminDetails.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 mb-0.5">Email Address</span>
                    <span className="text-white font-medium">{adminDetails.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 mb-0.5">Assigned Target Role</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                      SUPER_ADMIN
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-left text-xs text-blue-300 leading-relaxed">
                <strong>Security Notice:</strong> Approving this setup will activate this administrator account and assign them the highest system privileges. This bootstrap page will be disabled permanently after execution.
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleAction('reject')}
                  className="w-full sm:w-1/2 py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleAction('approve')}
                  className="w-full sm:w-1/2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
                >
                  Approve & Bootstrap
                </button>
              </div>
            </div>
          )}

          {/* Action Loading State */}
          {actionStatus === 'loading' && (
            <div className="py-12 space-y-6">
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm animate-pulse">Processing request details...</p>
            </div>
          )}

          {/* Action Success Approve State */}
          {actionStatus === 'success_approve' && (
            <div className="py-8 space-y-6 animate-scaleUp">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl">
                  ✓
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">System Bootstrapped!</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                  The first Super Admin has been configured successfully. Redirecting you to the sign in page to access the admin dashboard...
                </p>
              </div>
              <div className="flex justify-center pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-widest">
                  Redirecting in 5 seconds
                </div>
              </div>
            </div>
          )}

          {/* Action Success Reject State */}
          {actionStatus === 'success_reject' && (
            <div className="py-8 space-y-6 animate-scaleUp">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl">
                  ✕
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Request Rejected</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                  The administrator registration request has been rejected successfully. Redirecting you to the sign in page...
                </p>
              </div>
              <div className="flex justify-center pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-widest">
                  Redirecting in 5 seconds
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
