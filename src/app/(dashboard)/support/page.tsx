"use client";

import React, { useState } from "react";
import { HelpCircle, MessageSquare, BookOpen, Plus, Search, FileText } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import PremiumFeatureUpsell from "@/components/common/PremiumFeatureUpsell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SupportPage() {
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([
    { id: "TKT-4820", subject: "PayPal invoice mismatch for billing cycle June", status: "OPEN", priority: "HIGH", date: "2026-07-04" },
    { id: "TKT-3901", subject: "Unable to sync custom RoleVersionPermission schema", status: "RESOLVED", priority: "MEDIUM", date: "2026-07-02" },
    { id: "TKT-2900", subject: "Requesting SSO/OIDC Okta metadata setup", status: "CLOSED", priority: "LOW", date: "2026-06-28" }
  ]);

  const canView = hasPermission("support.view");

  if (!canView) {
    return (
      <PremiumFeatureUpsell
        title="Enterprise Help & Support"
        description="Access 24/7 dedicated support engineers, open high-priority workspace tickets, search knowledgebase articles, and manage enterprise SLA commitments."
        moduleName="Support & Ticketing"
        icon={HelpCircle}
      />
    );
  }

  const filteredTickets = tickets.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="text-primary h-8 w-8" />
            Support & Ticketing Center
          </h1>
          <p className="mt-1 text-text-light">
            Need help? Ask questions, open technical support tickets, and reference the platform configuration guides.
          </p>
        </div>

        <Button leftIcon={Plus} onClick={() => alert("Creating tickets is only permitted for active subscription tiers.")}>
          Open New Ticket
        </Button>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Knowledge Base */}
        <Card className="md:col-span-2 p-6 bg-surface/50 border-border/80 space-y-6">
          <h3 className="text-lg font-bold text-text flex items-center gap-2 border-b border-border/50 pb-3">
            <BookOpen className="h-5 w-5 text-primary" />
            Knowledge Base Quick Guides
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl border border-border/60 bg-background/40 hover:bg-background transition cursor-pointer">
              <h4 className="font-bold text-sm text-text hover:text-primary transition">RBAC Version Control Guide</h4>
              <p className="text-xs text-text-light mt-1.5 leading-relaxed">
                Learn how role versions, locking mechanisms, reviewer assignments, and approval state transitions work.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-background/40 hover:bg-background transition cursor-pointer">
              <h4 className="font-bold text-sm text-text hover:text-primary transition">Database Migration Best Practices</h4>
              <p className="text-xs text-text-light mt-1.5 leading-relaxed">
                Ensure zero downtime when synchronizing typeorm schema changes with production postgres servers.
              </p>
            </div>
          </div>
        </Card>

        {/* Support SLA Status */}
        <Card className="p-6 bg-surface/50 border-border/80 space-y-4">
          <h3 className="text-lg font-bold text-text border-b border-border/50 pb-3">SLA Status</h3>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-light">Active Plan:</span>
              <span className="text-primary font-bold">ENTERPRISE PLUS</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-light">Response SLA:</span>
              <span className="text-text">Under 2 hours</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-light">Assigned Engineer:</span>
              <span className="text-text">Sarah Connor</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Ticket List */}
      <Card className="p-6 bg-surface/50 border-border/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Support Ticket Logs
          </h3>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-light" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-text-light uppercase bg-background/55">
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Opened Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-sidebar-hover/20">
                  <td className="p-3 font-semibold text-primary">{t.id}</td>
                  <td className="p-3 text-text font-medium">{t.subject}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      t.priority === "HIGH" ? "bg-red-100 text-red-700" :
                      t.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      t.status === "OPEN" ? "bg-green-100 text-green-700 animate-pulse" :
                      t.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-text-light text-xs">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
