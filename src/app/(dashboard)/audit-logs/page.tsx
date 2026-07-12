"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Terminal, Globe, Shield, ShieldAlert,
  Eye, Download, Settings, Filter, CheckCircle, XCircle,
  AlertTriangle, Cpu, Layers, GitBranch, ArrowUpRight, FileText
} from "lucide-react";
import { rbacApi } from "@/features/rbac/api/api";
import Select from "@/components/common/Select";
import Pagination from "@/components/common/Pagination";

export default function AuditLogsForensicPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "security" | "retention">("logs");
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [correlationTimeline, setCorrelationTimeline] = useState<any[]>([]);

  // Advanced filters drawer states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterIp, setFilterIp] = useState("");
  const [filterCorrelationId, setFilterCorrelationId] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Statistics
  const [stats, setStats] = useState<any>({
    totalEvents: 0,
    securityEvents: 0,
    failedLogins: 0,
    permissionChanges: 0,
    roleChanges: 0,
    criticalEvents: 0,
    todayEvents: 0,
    exportedReports: 0,
    suspiciousActivities: 0,
    activeSessions: 0,
    impersonationEvents: 0,
    apiCalls: 0,
  });

  // Retention Policies
  const [retentionPolicies, setRetentionPolicies] = useState<any[]>([
    { category: "AUDIT", label: "Audit Logs", days: 2555, description: "Compliance records and administrative activities (7 Years)." },
    { category: "SECURITY", label: "Security Events", days: 3650, description: "Logins, brute force alerts, password resets (10 Years)." },
    { category: "API", label: "API Requests", days: 90, description: "Raw incoming middleware request payloads (90 Days)." },
  ]);

  // Export Progress simulation
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportStatus, setExportStatus] = useState("");

  const loadStats = async () => {
    try {
      const res = await rbacApi.getAuditStats();
      if (res.data.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load audit statistics", err);
    }
  };

  const loadRetention = async () => {
    try {
      const res = await rbacApi.getRetentionPolicies();
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setRetentionPolicies(res.data.data.map((p: any) => ({
          category: p.category,
          label: p.category === "AUDIT" ? "Audit Logs" : p.category === "SECURITY" ? "Security Events" : "API Requests",
          days: p.retentionDays,
          description: p.category === "AUDIT"
            ? "Compliance records and administrative activities (7 Years)."
            : p.category === "SECURITY"
              ? "Logins, brute force alerts, password resets (10 Years)."
              : "Raw incoming middleware request payloads (90 Days).",
        })));
      }
    } catch (err) {
      console.error("Failed to load retention policies", err);
    }
  };

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      if (search) params.search = search;
      if (selectedModule !== "ALL") params.module = selectedModule;
      if (selectedSeverity !== "ALL") params.severity = selectedSeverity;
      if (selectedStatus !== "ALL") params.status = selectedStatus;
      if (filterCountry) params.country = filterCountry;
      if (filterIp) params.ipAddress = filterIp;
      if (filterCorrelationId) params.correlationId = filterCorrelationId;

      const res = await rbacApi.getForensicLogs(params);
      if (res.data.success && res.data.data) {
        setLogs(res.data.data.logs || []);
        setTotalLogs(res.data.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load forensic logs", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedModule, selectedSeverity, selectedStatus, filterCountry, filterIp, filterCorrelationId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
    loadRetention();
  }, []);

  const handleInspectLog = async (log: any) => {
    setSelectedLog(log);
    setCorrelationTimeline([]);
    if (log.correlationId) {
      try {
        const res = await rbacApi.getCorrelationTimeline(log.correlationId);
        if (res.data.success && res.data.data) {
          setCorrelationTimeline(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch correlation timeline", err);
      }
    }
  };

  const handleSaveRetention = async (category: string, days: number) => {
    try {
      await rbacApi.updateRetentionPolicy({ category, retentionDays: days });
      alert("Retention policy updated successfully.");
      loadRetention();
    } catch (err) {
      console.error("Failed to update retention policy", err);
      alert("Failed to update retention policy.");
    }
  };

  const triggerExport = async (format: string) => {
    setExportProgress(10);
    setExportStatus("Requesting async export job...");
    try {
      const res = await rbacApi.exportAuditLogs({
        exportType: format,
        filters: {
          search,
          module: selectedModule !== "ALL" ? selectedModule : undefined,
          severity: selectedSeverity !== "ALL" ? selectedSeverity : undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        }
      });

      if (res.data.success && res.data.data) {
        setExportProgress(50);
        setExportStatus("Export job queued. Generating file...");
        setTimeout(() => {
          setExportProgress(100);
          setExportStatus(`Export file successfully queued. Job ID: ${res.data.success ? res.data.data.id : ""}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to trigger export", err);
      setExportProgress(null);
      setExportStatus("");
      alert("Failed to trigger export.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Shield className="text-primary h-9 w-9" />
            Forensic Audit & Compliance Console
          </h1>
          <p className="mt-1.5 text-text-light text-sm max-w-2xl">
            Strictly immutable, append-only log vault tracking admin actions, correlation graphs, and automated data archiving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerExport("CSV")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition shadow-sm"
          >
            <Download className="h-4.5 w-4.5" />
            Async Export
          </button>
        </div>
      </div>

      {/* Statistics dashboard cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Events", value: stats.totalEvents, icon: Layers, color: "text-blue-500" },
          { label: "Security Events", value: stats.securityEvents, icon: ShieldAlert, color: "text-orange-500" },
          { label: "Failed Logins", value: stats.failedLogins, icon: AlertTriangle, color: "text-red-500" },
          { label: "Role Changes", value: stats.roleChanges, icon: GitBranch, color: "text-purple-500" },
          { label: "Critical Alerts", value: stats.criticalEvents, icon: ShieldAlert, color: "text-red-600 animate-pulse" },
          { label: "API Requests", value: stats.apiCalls, icon: Cpu, color: "text-emerald-500" },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow transition flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-light">{c.label}</span>
                <Icon className={`h-4.5 w-4.5 ${c.color}`} />
              </div>
              <div className="text-xl font-bold tracking-tight">{(c.value ?? 0).toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs panels bar */}
      <div className="flex items-center border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${activeTab === "logs" ? "border-primary text-primary" : "border-transparent text-text-light hover:text-text"
            }`}
        >
          Audit Logs Stream
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${activeTab === "security" ? "border-primary text-primary" : "border-transparent text-text-light hover:text-text"
            }`}
        >
          Security Operations
        </button>
        <button
          onClick={() => setActiveTab("retention")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${activeTab === "retention" ? "border-primary text-primary" : "border-transparent text-text-light hover:text-text"
            }`}
        >
          Retention & Archival
        </button>
      </div>

      {/* Active Tab: Audit Logs Stream */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Export Queue notification */}
          {exportProgress !== null && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{exportStatus}</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${exportProgress}%` }}></div>
                </div>
              </div>
              {exportProgress === 100 && (
                <button
                  onClick={() => setExportProgress(null)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}

          {/* Filters console */}
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light h-4.5 w-4.5" />
                <input
                  type="text"
                  placeholder="Search by User, Event ID, Correlation ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-11 pr-4 text-sm text-text placeholder:text-text-light/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Basic filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-32">
                  <Select name="module" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                    <option value="ALL">All Modules</option>
                    <option value="AUTH">AUTH</option>
                    <option value="TENDER">TENDER</option>
                    <option value="RBAC">RBAC</option>
                    <option value="USER">USER</option>
                    <option value="PAYMENT">PAYMENT</option>
                    <option value="SYSTEM">SYSTEM</option>
                  </Select>
                </div>

                <div className="w-32">
                  <Select name="severity" value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)}>
                    <option value="ALL">All Severities</option>
                    <option value="INFO">INFO</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </Select>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold border border-border rounded-xl bg-background hover:bg-border/35 transition"
                >
                  <Filter className="h-4 w-4" />
                  Advanced
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-text-light mb-1.5">Country Filter</label>
                  <input
                    type="text"
                    placeholder="e.g. United States, United Kingdom"
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface py-2 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-light mb-1.5">Client IP Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.105"
                    value={filterIp}
                    onChange={(e) => setFilterIp(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface py-2 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-light mb-1.5">Correlation ID</label>
                  <input
                    type="text"
                    placeholder="e.g. corr_992011"
                    value={filterCorrelationId}
                    onChange={(e) => setFilterCorrelationId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface py-2 px-3 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logs Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-background/70 font-semibold text-text-light">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Event ID</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-text-light italic animate-pulse">
                      Retrieving log vaults from secure backend storage...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-text-light italic">
                      No compliance audit records found matching active query settings.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-background/40 transition">
                      <td className="p-4 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-4 text-xs font-semibold text-primary">{log.eventId || "N/A"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${log.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" :
                          log.severity === "HIGH" ? "bg-orange-500/10 text-orange-500" :
                            log.severity === "MEDIUM" ? "bg-yellow-500/10 text-yellow-500" :
                              "bg-blue-500/10 text-blue-500"
                          }`}>
                          {log.severity || "INFO"}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-text">{log.action}</td>
                      <td className="p-4 text-xs font-semibold text-text-light">{log.module || "SYSTEM"}</td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-text">{log.actorEmail}</div>
                        {log.ipAddress && <div className="text-[10px] text-text-light font-mono">{log.ipAddress}</div>}
                      </td>
                      <td className="p-4 text-xs text-text-light">{log.metadata?.country || "Localhost"}</td>
                      <td className="p-4">
                        {log.status === "SUCCESS" || !log.status ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleInspectLog(log)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalLogs > pageSize && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalItems={totalLogs}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Forensic Details Drawer */}
          {selectedLog && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-3xl bg-surface border-l border-border h-full shadow-2xl overflow-y-auto flex flex-col justify-between">
                {/* Header */}
                <div className="p-6 border-b border-border bg-background flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded font-mono">
                        {selectedLog.eventId || "EVENT"}
                      </span>
                      <span className="text-xs text-text-light">
                        Correlation: {selectedLog.correlationId || "None"}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mt-1">Forensic Investigation Details</h2>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-text-light hover:text-text font-bold text-lg"
                  >
                    Close
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 flex-1">
                  {/* General Summary */}
                  <div className="grid grid-cols-2 gap-4 bg-background rounded-2xl p-4 border border-border/50">
                    <div>
                      <span className="block text-xs font-semibold text-text-light">Actor</span>
                      <span className="text-sm font-semibold text-text">{selectedLog.actorEmail}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-text-light">Target User ID</span>
                      <span className="text-sm font-semibold text-text">{selectedLog.targetUserId || "None"}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-text-light">Affected Entity</span>
                      <span className="text-sm font-semibold text-text">{selectedLog.entityType}: {selectedLog.entityId}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-text-light">Request ID</span>
                      <span className="text-sm font-mono text-xs text-text">{selectedLog.requestId || "None"}</span>
                    </div>
                  </div>

                  {/* Correlation Visualizer Graph/Flowchart */}
                  {selectedLog.correlationId && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5">
                        <GitBranch className="h-4 w-4 text-primary" />
                        Correlation Graph Timeline
                      </h3>
                      <div className="bg-background rounded-2xl p-4 border border-border/60 flex items-center gap-3 overflow-x-auto">
                        {correlationTimeline.length === 0 ? (
                          <div className="text-xs text-text-light italic">No correlated events found in this session flow.</div>
                        ) : (
                          correlationTimeline.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-3 shrink-0">
                              <div className={`px-3 py-2 rounded-lg text-xs text-center border ${item.id === selectedLog.id ? "bg-primary/20 border-primary" : "bg-background border-border"
                                }`}>
                                <div className="font-bold">{item.action}</div>
                                <div className="text-[9px] text-text-light font-mono">{item.module} ({new Date(item.createdAt).toLocaleTimeString()})</div>
                              </div>
                              {idx < correlationTimeline.length - 1 && (
                                <ArrowUpRight className="h-4 w-4 text-text-light" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Old/New State Diffs */}
                  {(selectedLog.before || selectedLog.after) && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-text-light uppercase tracking-wider">
                        Old / New Value Diffs
                      </h3>
                      <div className="bg-background border border-border rounded-2xl p-4 font-mono text-xs space-y-1">
                        {selectedLog.before && (
                          <div className="text-red-500 bg-red-500/5 p-2 rounded-lg mb-2">
                            <span className="font-bold">- OLD VALUES</span>
                            <pre className="mt-1 text-[11px] overflow-x-auto">
                              {JSON.stringify(selectedLog.before, null, 2)}
                            </pre>
                          </div>
                        )}
                        {selectedLog.after && (
                          <div className="text-emerald-500 bg-emerald-500/5 p-2 rounded-lg">
                            <span className="font-bold">+ NEW VALUES</span>
                            <pre className="mt-1 text-[11px] overflow-x-auto">
                              {JSON.stringify(selectedLog.after, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata and Device Context */}
                  {selectedLog.metadata && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-text-light uppercase tracking-wider">
                        Client Headers & Location
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                        <div className="p-3 bg-background rounded-xl border border-border/50">
                          <span className="block text-[10px] text-text-light">Browser</span>
                          {selectedLog.metadata.browser || "Unknown"}
                        </div>
                        <div className="p-3 bg-background rounded-xl border border-border/50">
                          <span className="block text-[10px] text-text-light">OS</span>
                          {selectedLog.metadata.os || "Unknown"}
                        </div>
                        <div className="p-3 bg-background rounded-xl border border-border/50">
                          <span className="block text-[10px] text-text-light">HTTP Method</span>
                          {selectedLog.metadata.method || "Unknown"}
                        </div>
                        <div className="p-3 bg-background rounded-xl border border-border/50">
                          <span className="block text-[10px] text-text-light">Response Code</span>
                          {selectedLog.metadata.responseCode || "Unknown"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-border bg-background flex items-center justify-between">
                  <button
                    onClick={() => {
                      alert(`Forwarding event ${selectedLog.eventId} to SIEM Splunk endpoint...`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-text hover:underline"
                  >
                    <Terminal className="h-4 w-4" />
                    SIEM Forwarder
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-border hover:bg-border/60 transition"
                  >
                    Close Drawer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Tab: Security Operations */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Security alerts triggers panel */}
          <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-red-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-red-500">Critical Threat Warnings</h3>
                <p className="text-xs text-text-light mt-0.5">Suspicious activities flagged within the last 24 hours.</p>
              </div>
            </div>

            <div className="divide-y divide-red-500/10">
              <div className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-text">Brute Force Attempt</span>
                  <span className="ml-2 text-xs text-text-light">IP: 103.22.45.109 (China)</span>
                </div>
                <span className="text-xs font-mono font-bold text-red-500">5 FAILURES IN 10 MINS</span>
              </div>
              <div className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-text">Administrative Impersonation</span>
                  <span className="ml-2 text-xs text-text-light">User: admin_john impersonated vendor_alice</span>
                </div>
                <span className="text-xs font-mono font-bold text-orange-500">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Logins history table */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Login Access Audit Trail
              </h3>
            </div>
            <div className="p-4 text-sm text-text-light">
              No failed authentication events recorded today outside brute force triggers. Everything is operational.
            </div>
          </div>
        </div>
      )}

      {/* Active Tab: Retention & Archival */}
      {activeTab === "retention" && (
        <div className="grid gap-6 md:grid-cols-3">
          {retentionPolicies.map((policy) => (
            <div key={policy.category} className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">{policy.label}</h3>
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-text-light leading-relaxed">{policy.description}</p>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-light">Retention Days limit</label>
                <input
                  type="number"
                  value={policy.days}
                  onChange={(e) => {
                    const days = parseInt(e.target.value || "0", 10);
                    setRetentionPolicies((prev) =>
                      prev.map((p) => (p.category === policy.category ? { ...p, days } : p))
                    );
                  }}
                  className="w-full rounded-xl border border-border bg-surface py-2 px-3 text-sm font-semibold"
                />
              </div>

              <button
                onClick={() => handleSaveRetention(policy.category, policy.days)}
                className="w-full py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition"
              >
                Apply Retention rule
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
