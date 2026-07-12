"use client";

import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, Settings2, RefreshCw, AlertCircle, Sparkles, Check, Undo } from "lucide-react";
import { apiClient } from "@/lib/http";

// Widgets import
import RevenueWidget from "./widgets/RevenueWidget";
import TenderWorkflowWidget from "./widgets/TenderWorkflowWidget";
import UsersWidget from "./widgets/UsersWidget";
import ReviewQueueWidget from "./widgets/ReviewQueueWidget";
import AlertWidget from "./widgets/AlertWidget";
import ActivityWidget from "./widgets/ActivityWidget";
import NotificationsWidget from "./widgets/NotificationsWidget";
import SystemHealthWidget from "./widgets/SystemHealthWidget";
import QuickActionsWidget from "./widgets/QuickActionsWidget";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [registry, setRegistry] = useState<any[]>([]);
  const [layout, setLayout] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // SSE Live Data registries
  const [liveQueue, setLiveQueue] = useState<any>(null);
  const [liveAlerts, setLiveAlerts] = useState<any>(null);
  const [liveHealth, setLiveHealth] = useState<any>(null);
  const [sseConnected, setSseConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/dashboard/config");
      if (res.data?.data) {
        setRegistry(res.data.data.widgets || []);
        
        // Sort layout items according to stored order
        const sortedLayout = (res.data.data.layout || []).sort((a: any, b: any) => {
          if (a.y !== b.y) return a.y - b.y;
          return a.x - b.x;
        });
        setLayout(sortedLayout);
      }
    } catch (err) {
      console.error("Failed to load dashboard configuration", err);
    } finally {
      setLoading(false);
    }
  };

  // SSE connection establishment
  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const tokenUrl = `${apiClient.defaults.baseURL}/dashboard/stream`;
    
    // Establishing EventSource connection
    const es = new EventSource(tokenUrl, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      setSseConnected(true);
    };

    es.addEventListener("review_queue", (event: MessageEvent) => {
      try {
        setLiveQueue(JSON.parse(event.data));
      } catch (err) {
        console.error(err);
      }
    });

    es.addEventListener("alerts", (event: MessageEvent) => {
      try {
        setLiveAlerts(JSON.parse(event.data));
      } catch (err) {
        console.error(err);
      }
    });

    es.addEventListener("health", (event: MessageEvent) => {
      try {
        setLiveHealth(JSON.parse(event.data));
      } catch (err) {
        console.error(err);
      }
    });

    es.onerror = () => {
      setSseConnected(false);
    };
  };

  useEffect(() => {
    loadConfig();
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleResetLayout = async () => {
    try {
      await apiClient.post("/dashboard/layout/reset");
      loadConfig();
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to reset layout");
    }
  };

  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      await apiClient.patch("/dashboard/layout", { widgets: layout });
      setIsEditMode(false);
      loadConfig();
    } catch (err) {
      console.error(err);
      alert("Failed to save layout configuration");
    } finally {
      setSaving(false);
    }
  };

  // Layout mutators in edit mode
  const moveWidget = (index: number, direction: "up" | "down") => {
    const nextLayout = [...layout];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextLayout.length) return;

    // Swap placement order values
    const temp = nextLayout[index];
    nextLayout[index] = nextLayout[targetIndex];
    nextLayout[targetIndex] = temp;

    // Re-index x/y coordinates logically
    nextLayout.forEach((w, idx) => {
      w.y = Math.floor(idx / 3) * 2;
      w.x = (idx % 3) * 2;
    });

    setLayout(nextLayout);
  };

  const changeWidgetWidth = (index: number, width: number) => {
    const nextLayout = [...layout];
    nextLayout[index].w = width;
    setLayout(nextLayout);
  };

  const toggleWidgetHide = (index: number) => {
    const nextLayout = [...layout];
    nextLayout[index].hidden = !nextLayout[index].hidden;
    setLayout(nextLayout);
  };

  const toggleWidgetCollapse = (index: number) => {
    const nextLayout = [...layout];
    nextLayout[index].collapsed = !nextLayout[index].collapsed;
    setLayout(nextLayout);
  };

  const renderWidgetContent = (widgetId: string) => {
    switch (widgetId) {
      case "mrr_arr":
        return <RevenueWidget />;
      case "tender_workflow":
        return <TenderWorkflowWidget />;
      case "users":
        return <UsersWidget />;
      case "review_queue":
        return <ReviewQueueWidget liveData={liveQueue} />;
      case "system_health":
        return <SystemHealthWidget liveData={liveHealth} />;
      case "critical_alerts":
        return <AlertWidget liveData={liveAlerts} />;
      case "recent_activity":
        return <ActivityWidget />;
      case "quick_actions":
        return <QuickActionsWidget />;
      case "notifications":
        return <NotificationsWidget />;
      default:
        return <div className="p-4 italic text-text-light">Widget Not Configured</div>;
    }
  };

  // Compile greeting panel details
  const getGreetingText = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-text-light">Loading customizable cockpit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner / Greeting */}
      <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black tracking-tight text-text flex items-center gap-2">
            <Sparkles className="text-primary h-6 w-6 animate-pulse" />
            {getGreetingText()}!
          </h1>
          <p className="text-xs text-text-light font-medium max-w-xl">
            {liveQueue?.pendingTenderReviews > 0 ? `${liveQueue.pendingTenderReviews} Tenders require compliance reviews.` : "All tender review queues are clear."}{" "}
            {liveAlerts?.securityAlerts > 0 ? `${liveAlerts.securityAlerts} Security threats flagged today.` : "No active security threats logged."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sseConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Feed Connected
            </span>
          ) : (
            <button
              onClick={connectSSE}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-600 bg-amber-500/10 rounded-full hover:bg-amber-500/20 transition"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Reconnect stream
            </button>
          )}

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
              isEditMode 
                ? "bg-primary border-primary text-white" 
                : "border-border bg-surface text-text hover:bg-border/30"
            }`}
          >
            <Settings2 className="h-4 w-4" />
            {isEditMode ? "Exit Customizer" : "Customize Grid"}
          </button>
        </div>
      </div>

      {/* Customizer Layout Controls Panel */}
      {isEditMode && (
        <div className="p-4 rounded-2xl border border-dashed border-primary/45 bg-primary/5 flex items-center justify-between gap-4 animate-fade-in">
          <div className="text-xs font-semibold text-text-light">
            Customizer mode active: drag/order widgets, adjust width sizes, or hide columns.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetLayout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-surface text-text hover:bg-border/40"
            >
              <Undo className="h-3.5 w-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={handleSaveLayout}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-dark shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Layout"}
            </button>
          </div>
        </div>
      )}

      {/* Main Widgets CSS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {layout.map((item, index) => {
          const registryItem = registry.find((w) => w.id === item.widgetId);
          if (!registryItem) return null;
          if (item.hidden && !isEditMode) return null;

          // Determine Tailwind grid-column width classes based on customization parameters
          const gridColSpan = item.w === 1 ? "md:col-span-2" : item.w === 2 ? "md:col-span-3" : "md:col-span-6";

          return (
            <div
              key={item.widgetId}
              className={`rounded-2xl border bg-surface shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 ${gridColSpan} ${
                item.hidden ? "opacity-45 border-dashed border-red-500/50" : "border-border"
              }`}
            >
              {/* Header with edit tools overlay */}
              {isEditMode && (
                <div className="p-2 border-b border-border bg-background flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-text-light">{registryItem.title}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Position shift */}
                    <button
                      onClick={() => moveWidget(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded text-text-light hover:bg-border disabled:opacity-30 text-[10px]"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => moveWidget(index, "down")}
                      disabled={index === layout.length - 1}
                      className="p-1 rounded text-text-light hover:bg-border disabled:opacity-30 text-[10px]"
                    >
                      ▶
                    </button>

                    {/* Width adjustment */}
                    <select
                      value={item.w}
                      onChange={(e) => changeWidgetWidth(index, parseInt(e.target.value, 10))}
                      className="text-[10px] bg-surface border border-border rounded px-1 py-0.5 outline-none"
                    >
                      <option value={1}>1/3 Width</option>
                      <option value={2}>1/2 Width</option>
                      <option value={3}>Full Width</option>
                    </select>

                    {/* Hide toggle */}
                    <button
                      onClick={() => toggleWidgetHide(index)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        item.hidden ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-border text-text"
                      }`}
                    >
                      {item.hidden ? "Show" : "Hide"}
                    </button>

                    {/* Collapse toggle */}
                    <button
                      onClick={() => toggleWidgetCollapse(index)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text"
                    >
                      {item.collapsed ? "Expand" : "Collapse"}
                    </button>
                  </div>
                </div>
              )}

              {/* Widget Body */}
              {!item.collapsed && (
                <div className="flex-1">
                  {renderWidgetContent(item.widgetId)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
