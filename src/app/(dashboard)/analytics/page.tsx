'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  Filter,
  Grid,
  Layers,
  Mail,
  MapPin,
  PieChart,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import PremiumFeatureUpsell from '@/components/common/PremiumFeatureUpsell';
import Card from '@/components/ui/Card';
import { usePermissions } from '@/hooks/usePermissions';

export default function AnalyticsPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('analytics.view');
  const canViewFinancial = hasPermission('analytics.financial');
  const canViewUsers = hasPermission('analytics.users');
  const canViewVendors = hasPermission('analytics.vendors');
  const canViewSystem = hasPermission('analytics.system');
  const canManageReports = hasPermission('analytics.reports');
  const canAccessAI = hasPermission('analytics.ai');
  const canExport = hasPermission('analytics.export');

  // Tab management
  const [activeTab, setActiveTab] = useState('overview');

  // Global filters
  const [granularity, setGranularity] = useState('daily');
  const [dateRange, setDateRange] = useState('30days');
  const [country, setCountry] = useState('all');
  const [category, setCategory] = useState('all');
  const [tenderType, setTenderType] = useState('all');
  const [currency, setCurrency] = useState('USD');
  const [planFilter, setPlanFilter] = useState('all');

  // Customization & layout
  const [layoutWidgets, setLayoutWidgets] = useState<string[]>([
    'kpi-revenue',
    'kpi-tenders',
    'kpi-conversion',
    'kpi-success',
    'chart-tenders',
    'chart-categories',
  ]);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Async Export state
  const [exportJobs, setExportJobs] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Mock Alert Registry
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      key: 'churn_rate',
      title: 'Subscriber Churn Increased',
      condition: 'churn > 5%',
      actual: '6.2%',
      severity: 'HIGH',
      resolved: false,
    },
    {
      id: '2',
      key: 'failed_payments',
      title: 'Failed Credit Card Payments Spike',
      condition: 'failed > 10',
      actual: '14 CC',
      severity: 'CRITICAL',
      resolved: false,
    },
  ]);

  // AI recommendations
  const insights = [
    {
      text: 'Tender participation dropped 14% this week in Healthcare segments. Consider launching direct email invitations.',
      type: 'warning',
    },
    {
      text: 'Construction tenders currently hold the highest average award budget ($480k) with 8.2 bidders average.',
      type: 'success',
    },
    {
      text: 'Renewal rates improved 18.2% after introducing the Enterprise Subscription Plan version 2.',
      type: 'info',
    },
  ];

  // Mock aggregates datasets
  const overviewData = [
    { name: 'Mon', visitors: 4000, bids: 2400, revenue: 14000 },
    { name: 'Tue', visitors: 3000, bids: 1398, revenue: 22100 },
    { name: 'Wed', visitors: 2000, bids: 9800, revenue: 22900 },
    { name: 'Thu', visitors: 2780, bids: 3908, revenue: 20000 },
    { name: 'Fri', visitors: 1890, bids: 4800, revenue: 21810 },
    { name: 'Sat', visitors: 2390, bids: 3800, revenue: 25000 },
    { name: 'Sun', visitors: 3490, bids: 4300, revenue: 21000 },
  ];

  const categoryBudget = [
    { name: 'IT & Tech Services', budget: 145000, bids: 320 },
    { name: 'Civil Construction', budget: 280000, bids: 450 },
    { name: 'Medical Equipment', budget: 95000, bids: 120 },
    { name: 'Office Logistics', budget: 42000, bids: 90 },
  ];

  // Drill down utility
  const handleDrillDownCategory = (catName: string) => {
    setCategory(catName);
    setActiveTab('categories');
  };

  const handleTriggerExport = (type: string) => {
    setIsExporting(true);
    setExportProgress(10);
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          // Add to jobs list
          setExportJobs((prevJobs) => [
            {
              id: Math.random().toString(),
              type,
              status: 'COMPLETED',
              fileUrl: '#',
              createdAt: new Date().toLocaleTimeString(),
            },
            ...prevJobs,
          ]);
          return 100;
        }
        return prev + 30;
      });
    }, 1000);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  if (!canView) {
    return (
      <PremiumFeatureUpsell
        title="Analytics & Insights"
        description="Monitor system activity, track tender conversion rates, generate daily transaction graphs, and run audit performance reports."
        moduleName="Analytics"
        icon={BarChart3}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Top actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-text">
            <BarChart3 className="text-primary h-8 w-8" />
            BI Analytics Console
          </h1>
          <p className="mt-1.5 text-text-light">
            Enterprise analytics, domain aggregation rollups, and infrastructure latency dashboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border bg-surface text-sm rounded-xl font-semibold shadow-sm hover:bg-background transition"
          >
            <Grid size={16} />
            Widgets Config
          </button>
          <button
            onClick={() => handleTriggerExport('overview')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-surface text-sm rounded-xl font-bold hover:bg-primary-dark transition disabled:opacity-55"
          >
            <Download size={16} />
            {isExporting ? `Exporting (${exportProgress}%)` : 'Async Export'}
          </button>
        </div>
      </div>

      {/* Alert Notifications banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                alert.severity === 'CRITICAL'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              } shadow-sm transition`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-extrabold text-sm block">{alert.title}</span>
                  <span className="text-xs opacity-90">
                    Condition: {alert.condition} | Actual: {alert.actual}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleResolveAlert(alert.id)}
                className="text-xs px-3 py-1 bg-surface border rounded-lg font-bold text-text hover:bg-background transition"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Global Filters Panel */}
      <Card className="p-5 bg-surface/60 backdrop-blur-md border-border/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-text">
            <Filter size={16} />
            Global Slice Filters
          </div>
          <button
            onClick={() => {
              setCountry('all');
              setCategory('all');
              setTenderType('all');
              setCurrency('USD');
              setPlanFilter('all');
            }}
            className="text-xs text-primary font-bold hover:underline"
          >
            Reset All
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-light block">Granularity</label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-light block">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last 1 Year</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-light block">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Global</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="India">India</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-light block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Fields</option>
              <option value="IT & Tech Services">IT & Tech Services</option>
              <option value="Civil Construction">Civil Construction</option>
              <option value="Medical Equipment">Medical Equipment</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-light block">Tender Type</label>
            <select
              value={tenderType}
              onChange={(e) => setTenderType(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="Government RFP">Government RFP</option>
              <option value="Commercial Bid">Commercial Bid</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-light block">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-light block">Plan</label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Subscription</option>
              <option value="basic">Basic Tier</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="border-b border-border/60 flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'Overview', icon: Layers, allowed: true },
          { id: 'tenders', label: 'Tenders', icon: FileText, allowed: true },
          { id: 'bidding', label: 'Bidding', icon: TrendingUp, allowed: true },
          {
            id: 'revenue',
            label: 'Revenue',
            icon: DollarSign,
            allowed: canViewFinancial,
          },
          {
            id: 'subscriptions',
            label: 'Subscriptions',
            icon: PieChart,
            allowed: canViewFinancial,
          },
          { id: 'users', label: 'Users', icon: Users, allowed: canViewUsers },
          {
            id: 'vendors',
            label: 'Vendors',
            icon: CheckCircle,
            allowed: canViewVendors,
          },
          { id: 'traffic', label: 'Traffic', icon: Clock, allowed: true },
          {
            id: 'categories',
            label: 'Categories',
            icon: BarChart3,
            allowed: true,
          },
          { id: 'geography', label: 'Geography', icon: MapPin, allowed: true },
          {
            id: 'reports',
            label: 'Scheduled Reports',
            icon: Mail,
            allowed: canManageReports,
          },
          {
            id: 'system',
            label: 'System Health',
            icon: Zap,
            allowed: canViewSystem,
          },
        ].map((tab) => {
          if (!tab.allowed) return null;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-light hover:text-text'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENTS ─── */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* AI Recommendation Widget */}
          {canAccessAI && (
            <Card className="p-6 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-blue-500/10 border-indigo-200/50 space-y-3">
              <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-sm">
                <Sparkles className="h-5 w-5 animate-pulse text-indigo-600" />
                AI-Driven Rec Engine Insights
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="bg-surface/80 p-3 rounded-lg border border-border/40 text-xs text-text shadow-sm"
                  >
                    {insight.text}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Widgets Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5 bg-surface/50 border-border/70">
              <span className="text-[11px] font-bold text-text-light block uppercase tracking-wider">
                Total Aggregated Budget
              </span>
              <h3 className="text-2xl font-black mt-2 text-text">$840,490,000</h3>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">
                +14.2% vs last month
              </span>
            </Card>
            <Card className="p-5 bg-surface/50 border-border/70">
              <span className="text-[11px] font-bold text-text-light block uppercase tracking-wider">
                Monthly Recurring Revenue (MRR)
              </span>
              <h3 className="text-2xl font-black mt-2 text-text">$125,000</h3>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">
                +8.4% growth rate
              </span>
            </Card>
            <Card className="p-5 bg-surface/50 border-border/70">
              <span className="text-[11px] font-bold text-text-light block uppercase tracking-wider">
                Conversion rate
              </span>
              <h3 className="text-2xl font-black mt-2 text-text">3.42%</h3>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">
                +0.8% increase
              </span>
            </Card>
            <Card className="p-5 bg-surface/50 border-border/70">
              <span className="text-[11px] font-bold text-text-light block uppercase tracking-wider">
                Subscriber Churn rate
              </span>
              <h3 className="text-2xl font-black mt-2 text-text">2.85%</h3>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">
                -0.4% improvement
              </span>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 p-6 bg-surface/50 border-border/80 space-y-4">
              <h3 className="font-bold text-sm text-text">
                Visitor Counts & Analytical Traffic Curves
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overviewData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 bg-surface/50 border-border/80 space-y-4">
              <h3 className="font-bold text-sm text-text">Top category budgets</h3>
              <div className="space-y-4">
                {categoryBudget.map((c, i) => (
                  <div
                    key={i}
                    className="space-y-1.5 cursor-pointer"
                    onClick={() => handleDrillDownCategory(c.name)}
                  >
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text hover:underline">{c.name}</span>
                      <span className="text-text-light">${(c.budget / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(c.budget / 300000) * 100}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. TENDERS */}
      {activeTab === 'tenders' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">Tender Lifecycles & Creation Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" name="Created" fill="#8884d8" />
                <Bar dataKey="bids" name="Awarded" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 3. BIDDING */}
      {activeTab === 'bidding' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">Bidding funnels & response latencies</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 bg-background border rounded-xl text-center">
              <span className="text-xs text-text-light block">Bids Submitted</span>
              <span className="text-2xl font-black mt-1 block">12,940</span>
            </div>
            <div className="p-4 bg-background border rounded-xl text-center">
              <span className="text-xs text-text-light block">Bids Qualified</span>
              <span className="text-2xl font-black mt-1 block">9,840</span>
            </div>
            <div className="p-4 bg-background border rounded-xl text-center">
              <span className="text-xs text-text-light block">Bids Rejected</span>
              <span className="text-2xl font-black mt-1 block">3,100</span>
            </div>
          </div>
        </Card>
      )}

      {/* 4. REVENUE */}
      {activeTab === 'revenue' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">MRR / ARR financial progression</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overviewData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 5. SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">Plan Tiers splits</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="p-5 border rounded-xl bg-background/50 text-center">
              <h4 className="font-bold text-xs text-text-light uppercase">Professional Plan</h4>
              <span className="text-3xl font-black mt-2 block text-primary">320 Users</span>
              <span className="text-xs mt-1 block text-text-light">$49 / mo billing</span>
            </div>
            <div className="p-5 border rounded-xl bg-background/50 text-center">
              <h4 className="font-bold text-xs text-text-light uppercase">Enterprise Tier</h4>
              <span className="text-3xl font-black mt-2 block text-indigo-600">84 Accounts</span>
              <span className="text-xs mt-1 block text-text-light">$299 / mo custom</span>
            </div>
            <div className="p-5 border rounded-xl bg-background/50 text-center">
              <h4 className="font-bold text-xs text-text-light uppercase">Basic Access</h4>
              <span className="text-3xl font-black mt-2 block text-text">412 Users</span>
              <span className="text-xs mt-1 block text-text-light">Free plan versions</span>
            </div>
          </div>
        </Card>
      )}

      {/* 6. USERS */}
      {activeTab === 'users' && (
        <Card className="p-6 bg-surface/50 border-border space-y-4">
          <h3 className="font-bold text-lg text-text">User accounts verification progression</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" name="Active sessions" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 7. VENDORS */}
      {activeTab === 'vendors' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">Vendor bid success leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b text-text-light uppercase tracking-wider font-bold">
                  <th className="py-2.5">Vendor Name</th>
                  <th>Bids Submitted</th>
                  <th>Awarded Count</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    name: 'Acme Logistics Corp',
                    bids: 124,
                    wins: 48,
                    rate: '38.7%',
                  },
                  {
                    name: 'Global Tech Integrations',
                    bids: 84,
                    wins: 32,
                    rate: '38.0%',
                  },
                  {
                    name: 'Cascade Engineering Services',
                    bids: 92,
                    wins: 28,
                    rate: '30.4%',
                  },
                ].map((v, idx) => (
                  <tr key={idx} className="hover:bg-background/40 transition">
                    <td className="py-3 font-bold text-text">{v.name}</td>
                    <td>{v.bids}</td>
                    <td>{v.wins}</td>
                    <td className="text-primary font-bold">{v.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 8. TRAFFIC */}
      {activeTab === 'traffic' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">Traffic analysis</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-text-light">Device distribution</h4>
              <div className="space-y-2">
                {[
                  { device: 'Desktop', share: '72.4%' },
                  { device: 'Mobile', share: '24.1%' },
                  { device: 'Tablet', share: '3.5%' },
                ].map((d, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="font-bold text-text">{d.device}</span>
                    <span className="text-text-light font-bold">{d.share}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-text-light">Top search keyword queries</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'construction rfp',
                  'it services bid',
                  'usa government tender',
                  'medical supply requests',
                  'logistics',
                ].map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-background border rounded-lg text-xs font-semibold text-text"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 9. CATEGORIES */}
      {activeTab === 'categories' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">Top fields categorized</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBudget}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" name="Aggregated budget ($)" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 10. GEOGRAPHY */}
      {activeTab === 'geography' && (
        <Card className="p-6 bg-surface/50 border-border space-y-6">
          <h3 className="font-bold text-lg text-text">Regional geographic distributions</h3>
          <div className="space-y-4">
            {[
              { region: 'California, USA', density: 450, budget: '$142M' },
              { region: 'Ontario, Canada', density: 240, budget: '$89M' },
              { region: 'Maharashtra, India', density: 310, budget: '$64M' },
            ].map((r, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs p-3 border rounded-xl bg-background/50"
              >
                <span className="font-bold text-text">{r.region}</span>
                <div className="flex gap-4">
                  <span className="text-text-light">{r.density} Tenders</span>
                  <span className="text-primary font-bold">{r.budget}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 11. REPORTS */}
      {activeTab === 'reports' && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 p-6 bg-surface/50 border-border space-y-6">
            <h3 className="font-bold text-lg text-text">Create Scheduled analytical report</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-light">Report Name</label>
                  <input
                    type="text"
                    placeholder="Weekly Revenue and Traffic Summary"
                    className="w-full text-xs bg-background border rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-light">Frequency</label>
                  <select className="w-full text-xs bg-background border rounded-lg px-2.5 py-2 focus:outline-none">
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-light">Timezone</label>
                  <select className="w-full text-xs bg-background border rounded-lg px-2.5 py-2 focus:outline-none">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">EST (UTC-5)</option>
                    <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-light">Recipients Role</label>
                  <select className="w-full text-xs bg-background border rounded-lg px-2.5 py-2 focus:outline-none">
                    <option value="admin">Administrator Role</option>
                    <option value="finance">Finance Role</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-primary text-surface text-xs rounded-lg font-bold hover:bg-primary-dark transition"
              >
                Schedule Report
              </button>
            </form>
          </Card>

          <Card className="p-6 bg-surface/50 border-border space-y-4">
            <h3 className="font-bold text-sm text-text">Async Export jobs history</h3>
            <div className="space-y-3">
              {exportJobs.length === 0 ? (
                <span className="text-xs text-text-light block text-center py-8">
                  No export jobs triggered yet.
                </span>
              ) : (
                exportJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 border rounded-xl bg-background/50 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-text block uppercase">{job.type} csv</span>
                      <span className="text-[10px] text-text-light">{job.createdAt}</span>
                    </div>
                    <a
                      href={job.fileUrl}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold hover:bg-emerald-100 transition"
                    >
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 12. SYSTEM HEALTH */}
      {activeTab === 'system' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-surface/50 border-border space-y-4">
            <h3 className="font-bold text-lg text-text">API & Database latencies</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-light font-semibold">API average response latency</span>
                <span className="font-bold text-emerald-600">142 ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-light font-semibold">Database Queries per second</span>
                <span className="font-bold text-text">64 QPS</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-light font-semibold">Cache hit ratio</span>
                <span className="font-bold text-primary">94.2%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-surface/50 border-border space-y-4">
            <h3 className="font-bold text-lg text-text">Background queues depths</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-light font-semibold">Active background workers</span>
                <span className="font-bold text-text">3 threads</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-light font-semibold">BullMQ pending queue length</span>
                <span className="font-bold text-primary">2 tasks</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-light font-semibold">Failed cron schedules</span>
                <span className="font-bold text-emerald-600">0</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Customize widget configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-text/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-surface border-border shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h3 className="font-bold text-lg text-text flex items-center gap-2">
                <Settings size={18} />
                Dashboard Personalization
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-xs text-text-light hover:underline font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-text-light block font-semibold">
                Toggle widgets to render in your customized dashboard view layout:
              </span>
              {[
                { key: 'kpi-revenue', name: 'Total Budget Aggregations' },
                { key: 'kpi-tenders', name: 'MRR / ARR Financial Details' },
                { key: 'kpi-conversion', name: 'Conversion Rate calculations' },
                { key: 'kpi-success', name: 'Subscriber Churn statistics' },
                { key: 'chart-tenders', name: 'Tenders traffic curves' },
                { key: 'chart-categories', name: 'Top categories budgets' },
              ].map((w) => (
                <label
                  key={w.key}
                  className="flex items-center gap-3 text-xs font-bold text-text cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={layoutWidgets.includes(w.key)}
                    onChange={() => {
                      if (layoutWidgets.includes(w.key)) {
                        setLayoutWidgets(layoutWidgets.filter((item) => item !== w.key));
                      } else {
                        setLayoutWidgets([...layoutWidgets, w.key]);
                      }
                    }}
                    className="rounded border-border focus:ring-primary h-4 w-4"
                  />
                  {w.name}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-primary text-surface text-xs rounded-xl font-bold hover:bg-primary-dark transition"
              >
                Save Layout Config
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
