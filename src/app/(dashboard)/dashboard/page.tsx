'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

import { CustomizerBar } from './components/CustomizerBar';
// Sub-components import
import { DashboardBanner } from './components/DashboardBanner';
import { WidgetCard } from './components/WidgetCard';
import AlertWidget from './widgets/AlertWidget';
// Widgets import
import RevenueWidget from './widgets/RevenueWidget';
import SystemHealthWidget from './widgets/SystemHealthWidget';
import TenderWorkflowWidget from './widgets/TenderWorkflowWidget';
import UsersWidget from './widgets/UsersWidget';

import type { WidgetDefinition } from '@/features/dashboard/types';
import type { JSX } from 'react';
import {
  useDashboardConfig,
  useResetDashboardLayout,
  useUpdateDashboardLayout,
} from '@/features/dashboard/api/queries';
import { useDashboardStream } from '@/hooks/useDashboardStream';
import { usePermissions } from '@/hooks/usePermissions';
import { logger } from '@/lib/logger';

const widgets = {
  mrr_arr: RevenueWidget,
  users: UsersWidget,
  tender_workflow: TenderWorkflowWidget,
  system_health: SystemHealthWidget,
  critical_alerts: AlertWidget,
} as const;

type WidgetId = keyof typeof widgets;

const UnknownWidget = () => <div className="p-4 italic text-text-light">Widget Not Configured</div>;
// New Code
export default function DashboardPage() {
  const { isInitializing, hasPermission } = usePermissions();

  const { data: config, isLoading: isConfigLoading } = useDashboardConfig();

  const updateLayoutMutation = useUpdateDashboardLayout();

  const resetLayoutMutation = useResetDashboardLayout();

  /**
   * Starts the dashboard SSE connection.
   * The hook owns the EventSource lifecycle and
   * synchronizes live snapshots into Zustand.
   */
  useDashboardStream();

  /**
   * Local page state.
   *
   * The dashboard data itself now lives entirely in
   * Zustand. The page only manages layout editing.
   */
  const [layout, setLayout] = useState<WidgetDefinition[]>([]);
  const [savedLayout, setSavedLayout] = useState<WidgetDefinition[]>([]);

  const [isEditMode, setIsEditMode] = useState(false);

  /**
   * Permission checks.
   */
  const canViewDashboard = hasPermission('dashboard.view');

  /**
   * Initialize widget layout once configuration
   * has been loaded.
   */
  useEffect(() => {
    if (!config) {
      return;
    }

    const sortedLayout = [...config.widgets].sort((a, b) => {
      if (a.defaultLayout.y !== b.defaultLayout.y) {
        return a.defaultLayout.y - b.defaultLayout.y;
      }

      return a.defaultLayout.x - b.defaultLayout.x;
    });

    setLayout(sortedLayout);
  }, [config]);

  useEffect(() => {
    if (!config) {
      return;
    }

    const sortedLayout = [...config.widgets].sort(/* ... */);

    setLayout(sortedLayout);
    setSavedLayout(sortedLayout);
  }, [config]);

  /**
   * Restore default dashboard layout.
   */
  const handleResetLayout = async () => {
    try {
      const updatedLayout = await resetLayoutMutation.mutateAsync();

      setLayout(updatedLayout.widgets);
      setSavedLayout(updatedLayout.widgets);
      setIsEditMode(false);
    } catch (err) {
      logger.error('Failed to reset dashboard layout', err as Error, {
        context: {
          source: 'Dashboard',
          action: 'resetLayout',
        },
      });

      alert('Failed to reset layout');
    }
  };

  /**
   * Persist widget layout.
   */
  const handleSaveLayout = async () => {
    try {
      const widgets = layout.map((widget) => ({
        id: widget.id,
        ...widget.defaultLayout,
      }));

      await updateLayoutMutation.mutateAsync({
        widgets,
      });
      setSavedLayout(layout);
      setIsEditMode(false);
    } catch (err) {
      logger.error('Failed to save dashboard layout', err as Error, {
        context: {
          source: 'Dashboard',
          action: 'saveLayout',
        },
      });

      alert('Failed to save layout configuration');
    }
  };

  /**
   * Move widget position while editing.
   */
  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const nextLayout = [...layout];

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= nextLayout.length) {
      return;
    }

    [nextLayout[index], nextLayout[targetIndex]] = [nextLayout[targetIndex]!, nextLayout[index]!];

    /**
     * Recalculate layout coordinates.
     */
    const reordered = nextLayout.map((widget, index) => ({
      ...widget,
      defaultLayout: {
        ...widget.defaultLayout,
        y: Math.floor(index / 3) * 2,
        x: (index % 3) * 2,
      },
    }));

    setLayout(reordered);
  };

  /**
   * Change widget width.
   */
  const changeWidgetWidth = (index: number, width: number) => {
    setLayout((current) =>
      current.map((widget, i) =>
        i === index
          ? {
              ...widget,
              defaultLayout: {
                ...widget.defaultLayout,
                w: width,
              },
            }
          : widget,
      ),
    );
  };

  /**
   * Hide / show widget.
   */
  const toggleWidgetHide = (index: number) => {
    setLayout((current) =>
      current.map((widget, i) =>
        i === index
          ? {
              ...widget,
              defaultLayout: {
                ...widget.defaultLayout,
                hidden: !widget.defaultLayout.hidden,
              },
            }
          : widget,
      ),
    );
  };

  /**
   * Collapse / expand widget.
   */
  const toggleWidgetCollapse = (index: number) => {
    setLayout((current) =>
      current.map((widget, i) =>
        i === index
          ? {
              ...widget,
              defaultLayout: {
                ...widget.defaultLayout,
                collapsed: !widget.defaultLayout.collapsed,
              },
            }
          : widget,
      ),
    );
  };

  /**
   * Render widget content.
   */
  const renderWidgetContent = (widgetId: WidgetId) => {
    const Widget = widgets[widgetId] as (() => JSX.Element) | undefined;

    return Widget ? <Widget /> : <UnknownWidget />;
  };

  /**
   * Greeting banner.
   */
  const getGreetingText = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good Morning';
    }

    if (hour < 18) {
      return 'Good Afternoon';
    }

    return 'Good Evening';
  }, []);

  const serializeLayout = (widgets: WidgetDefinition[]) =>
    widgets.map(({ id, defaultLayout }) => ({
      id,
      x: defaultLayout.x,
      y: defaultLayout.y,
      w: defaultLayout.w,
      h: defaultLayout.h,
      hidden: defaultLayout.hidden,
      collapsed: defaultLayout.collapsed,
    }));

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(serializeLayout(layout)) !== JSON.stringify(serializeLayout(savedLayout));
  }, [layout, savedLayout]);

  /**
   * Loading state.
   */
  if (isInitializing || isConfigLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />

        <p className="text-sm font-semibold text-text-light">Loading cockpit...</p>
      </div>
    );
  }

  /**
   * Permission guard.
   */
  if (!canViewDashboard) {
    return (
      <div className="space-y-3 rounded-3xl border border-rose-500/30 bg-rose-500/5 p-8 text-center animate-fade-in">
        <ShieldAlert className="mx-auto h-10 w-10 text-rose-500" />

        <h2 className="text-xl font-bold text-text">Dashboard Access Restricted</h2>

        <p className="mx-auto max-w-md text-xs text-text-light">
          Your account does not have permission (
          <code className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-rose-600 dark:text-rose-400">
            dashboard.view
          </code>
          ) to view the administration dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardBanner
        greetingText={getGreetingText}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((value) => !value)}
        canCustomize
      />

      {isEditMode && (
        <CustomizerBar
          onResetLayout={handleResetLayout}
          onSaveLayout={handleSaveLayout}
          saving={updateLayoutMutation.isPending}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
        {layout.map((item, index) => (
          <WidgetCard
            key={item.id}
            item={item}
            index={index}
            totalItems={layout.length}
            isEditMode={isEditMode}
            onMoveWidget={moveWidget}
            onChangeWidgetWidth={changeWidgetWidth}
            onToggleWidgetHide={toggleWidgetHide}
            onToggleWidgetCollapse={toggleWidgetCollapse}
          >
            {renderWidgetContent(item.id as WidgetId)}
          </WidgetCard>
        ))}
      </div>
    </div>
  );
}
