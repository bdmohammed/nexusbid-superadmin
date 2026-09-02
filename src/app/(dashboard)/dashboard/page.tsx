'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { CustomizerBar } from './components/CustomizerBar';
// Sub-components import
import { DashboardBanner } from './components/DashboardBanner';
import { WidgetCard } from './components/WidgetCard';
import ActivityWidget from './widgets/ActivityWidget';
import AlertWidget from './widgets/AlertWidget';
import NotificationsWidget from './widgets/NotificationsWidget';
import QuickActionsWidget from './widgets/QuickActionsWidget';
// Widgets import
import RevenueWidget from './widgets/RevenueWidget';
import ReviewQueueWidget from './widgets/ReviewQueueWidget';
import SystemHealthWidget from './widgets/SystemHealthWidget';
import TenderWorkflowWidget from './widgets/TenderWorkflowWidget';
import UsersWidget from './widgets/UsersWidget';

import {
  useDashboardConfig,
  useResetDashboardLayout,
  useUpdateDashboardLayout,
} from '@/features/dashboard/api/queries';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/http';

export default function Dashboard() {
  const { isInitializing } = usePermissions();

  const { data: config, isLoading: isConfigLoading } = useDashboardConfig();
  const updateLayoutMutation = useUpdateDashboardLayout();
  const resetLayoutMutation = useResetDashboardLayout();

  const [registry, setRegistry] = useState<any[]>([]);
  const [layout, setLayout] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // SSE Live Data registries
  const [liveQueue, setLiveQueue] = useState<any>(null);
  const [liveAlerts, setLiveAlerts] = useState<any>(null);
  const [liveHealth, setLiveHealth] = useState<any>(null);
  const [sseConnected, setSseConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Permission Checks
  // const canViewDashboard = hasPermission("dashboard.view");
  // const canCustomizeGrid = hasPermission("dashboard.export") || isSuperAdmin;

  useEffect(() => {
    if (config) {
      setRegistry(config.widgets || []);
      const sortedLayout = (config.layout || []).sort((a: any, b: any) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });
      setLayout(sortedLayout);
    }
  }, [config]);

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

    es.addEventListener('review_queue', (event: MessageEvent) => {
      try {
        setLiveQueue(JSON.parse(event.data));
      } catch (err) {
        console.error(err);
      }
    });

    es.addEventListener('alerts', (event: MessageEvent) => {
      try {
        setLiveAlerts(JSON.parse(event.data));
      } catch (err) {
        console.error(err);
      }
    });

    es.addEventListener('health', (event: MessageEvent) => {
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
    // if (!canViewDashboard) return;
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleResetLayout = async () => {
    try {
      await resetLayoutMutation.mutateAsync();
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      alert('Failed to reset layout');
    }
  };

  const handleSaveLayout = async () => {
    try {
      const payload = layout.map((w) => ({
        ...w,
        widgetId: w.widgetId || w.id,
      }));
      await updateLayoutMutation.mutateAsync({ widgets: payload });
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save layout configuration');
    }
  };

  // Layout mutators in edit mode
  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const nextLayout = [...layout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
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

  // const renderRestrictedPlaceholder = (
  //   widgetName: string,
  //   permissionKey: string,
  // ) => (
  //   <div className="p-6 text-center space-y-2 bg-background/30 rounded-xl">
  //     <Lock size={20} className="mx-auto text-amber-500/80" />
  //     <span className="text-xs font-bold text-text block">{widgetName}</span>
  //     <p className="text-[11px] text-text-light max-w-xs mx-auto">
  //       Requires{" "}
  //       <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">
  //         {permissionKey}
  //       </code>{" "}
  //       permission.
  //     </p>
  //   </div>
  // );

  const renderWidgetContent = (widgetId: string) => {
    switch (widgetId) {
      case 'mrr_arr':
        // return hasPermission("subscription.view") ? (
        return <RevenueWidget />;
      // ) : (
      //   renderRestrictedPlaceholder(
      //     "Revenue & ARR Metrics",
      //     "subscription.view",
      //   )
      // );

      case 'tender_workflow':
        // return hasPermission("tender.view") ? (
        return <TenderWorkflowWidget />;
      // ) : (
      //   renderRestrictedPlaceholder("Tender Workflow", "tender.view")
      // );

      case 'users':
        // return hasPermission("user.view") ? (
        return <UsersWidget />;
      // ) : (
      //   renderRestrictedPlaceholder("User Activity", "user.view")
      // );

      case 'review_queue':
        // return hasPermission("tender.approve") ||
        // hasPermission("tender.view") ? (
        return <ReviewQueueWidget liveData={liveQueue} />;
      // ) : (
      //   renderRestrictedPlaceholder("Review Queue", "tender.approve")
      // );

      case 'system_health':
        // return hasPermission("analytics.view") ? (
        return <SystemHealthWidget liveData={liveHealth} />;
      // ) : (
      //   renderRestrictedPlaceholder("System Health", "analytics.view")
      // );

      case 'critical_alerts':
        // return hasPermission("analytics.view") ? (
        return <AlertWidget liveData={liveAlerts} />;
      // ) : (
      //   renderRestrictedPlaceholder("Critical Alerts", "analytics.view")
      // );

      case 'recent_activity':
        // return hasPermission("analytics.view") || hasPermission("user.view") ? (
        return <ActivityWidget />;
      // ) : (
      //   renderRestrictedPlaceholder("Recent Activity", "analytics.view")
      // );

      case 'quick_actions':
        // return hasPermission("user.view") || hasPermission("tender.create") ? (
        return <QuickActionsWidget />;
      // ) : (
      //   renderRestrictedPlaceholder("Quick Actions", "user.view")
      // );

      case 'notifications':
        return <NotificationsWidget />;

      default:
        return <div className="p-4 italic text-text-light">Widget Not Configured</div>;
    }
  };

  // Compile greeting panel details
  const getGreetingText = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isInitializing || isConfigLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-text-light">Loading cockpit...</p>
      </div>
    );
  }

  // Page Access Guard
  // if (!canViewDashboard) {
  //   return (
  //     <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-center space-y-3 animate-fade-in">
  //       <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
  //       <h2 className="text-xl font-bold text-text">
  //         Dashboard Access Restricted
  //       </h2>
  //       <p className="text-xs text-text-light max-w-md mx-auto">
  //         Your account does not have permission (
  //         <code className="bg-background px-1.5 py-0.5 rounded border border-border text-rose-600 dark:text-rose-400 font-mono">
  //           dashboard.view
  //         </code>
  //         ) to view the main administration cockpit. Please contact an
  //         administrator if you require access.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Banner / Greeting Header Component */}
      <DashboardBanner
        greetingText={getGreetingText()}
        liveQueue={liveQueue}
        liveAlerts={liveAlerts}
        sseConnected={sseConnected}
        onConnectSSE={connectSSE}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        canCustomize={true}
      />

      {/* Customizer Layout Controls Panel Component */}
      {isEditMode && (
        <CustomizerBar
          onResetLayout={handleResetLayout}
          onSaveLayout={handleSaveLayout}
          saving={updateLayoutMutation.isPending}
        />
      )}

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {layout.map((item, index) => {
          const widgetId = item.widgetId || item.id;
          const registryItem = registry.find((w) => w.id === widgetId);
          if (!registryItem) return null;

          return (
            <WidgetCard
              key={widgetId}
              item={item}
              index={index}
              totalItems={layout.length}
              registryItem={registryItem}
              isEditMode={isEditMode}
              onMoveWidget={moveWidget}
              onChangeWidgetWidth={changeWidgetWidth}
              onToggleWidgetHide={toggleWidgetHide}
              onToggleWidgetCollapse={toggleWidgetCollapse}
            >
              {renderWidgetContent(widgetId)}
            </WidgetCard>
          );
        })}
      </div>
    </div>
  );
}
