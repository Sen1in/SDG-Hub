// frontend/src/pages/Analyze/AnalyzePage.tsx

import React, { useState, useEffect } from 'react';
import analyticsService, { ActiveUserStats } from '../../services/analyticsService';
import ActiveTrendChart from './components/ActiveTrendChart';
import SearchWordCloud from './components/SearchWordCloud';
import PageActiveTime from './components/PageActiveTime';
import { DashboardGauge, MiniGauge, ProgressGauge } from './components/DashboardGauge';
import { RealTimeIndicator, DataStatusIndicator, DataFlowIndicator } from './components/RealTimeIndicator';
import { AnimatedCounter, AnimatedPercentage } from './components/AnimatedCounter';
import { useAuth } from '../../contexts/AuthContext';
import './AnalyzePage.css';

interface StatCardProps {
  icon: 'users' | 'clock' | 'barchart';
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  bgGradient: string;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

// Circular progress bar component
const CircularProgress: React.FC<{ percentage: number; color: string; size?: number }> = ({ 
  percentage, 
  color, 
  size = 80 
}) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${color} transition-all duration-1000 ease-out`}
          style={{
            strokeDasharray,
            strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-300">{percentage}%</span>
      </div>
    </div>
  );
};

// Trend Indicator Component
const TrendIndicator: React.FC<{ trend: 'up' | 'down' | 'stable'; value: string }> = ({ trend, value }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {getTrendIcon()}
      <span className={`text-xs font-medium ${
        trend === 'up' ? 'text-green-600' : 
        trend === 'down' ? 'text-red-600' : 'text-gray-600'
      }`}>
        {value}
      </span>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle,
  color, 
  bgGradient,
  percentage,
  trend,
  trendValue 
}) => {
  const renderIcon = () => {
    const iconProps = {
      className: "h-8 w-8 text-white",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2,
    };
    switch (icon) {
      case 'users':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m9 5.197a6 6 0 004.853-2.47M9 14a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        );
      case 'clock':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'barchart':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`dashboard-card relative overflow-hidden rounded-2xl shadow-soft border border-gray-700 group bg-gray-800`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 ${bgGradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-xl ${color} shadow-lg pulse-glow`}>
                {renderIcon()}
              </div>
              {trend && trendValue && (
                <TrendIndicator trend={trend} value={trendValue} />
              )}
            </div>
            
            <h3 className="text-sm font-medium text-gray-300 mb-1">{title}</h3>
            <div className="flex items-baseline space-x-2">
              <AnimatedCounter
                value={typeof value === 'number' ? value : parseInt(value.toString())}
                duration={1500}
                delay={200}
                className="text-3xl font-bold text-white count-up-animation"
              />
              {subtitle && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
            
            {percentage !== undefined && (
              <div className="mt-4 flex items-center space-x-3">
                <CircularProgress percentage={percentage} color={color} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Activity</span>
                    <AnimatedPercentage
                      value={percentage}
                      maxValue={100}
                      duration={1500}
                      delay={400}
                      className="text-xs"
                    />
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${color} progress-animate`}
                      style={{ 
                        width: `${percentage}%`,
                        '--progress-width': `${percentage}%`
                      } as React.CSSProperties}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className={`w-full h-full ${bgGradient} rounded-full transform translate-x-8 -translate-y-8`}></div>
      </div>
    </div>
  );
};

// Statistical Overview Card
const StatsOverview: React.FC<{ stats: ActiveUserStats }> = ({ stats }) => {
  // Calculate the percentage of activity level
  const todayActivePercentage = Math.round((stats.today_active_users / stats.total_users) * 100);
  const monthActivePercentage = Math.round((stats.this_month_active_users / stats.total_users) * 100);

  return (
    <div className="space-y-8">
      {/* Main statistical card */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon="users" 
          title="Total Users" 
          value={stats.total_users.toLocaleString()}
          subtitle="Registered Users"
          color="bg-sdg-primary" 
          bgGradient="bg-gradient-to-br from-sdg-primary to-blue-600"
        />
        <StatCard 
          icon="clock" 
          title="Active Today" 
          value={stats.today_active_users.toLocaleString()}
          subtitle="Active Users"
          color="bg-sdg-secondary" 
          bgGradient="bg-gradient-to-br from-sdg-secondary to-green-600"
          percentage={todayActivePercentage}
        />
        <StatCard 
          icon="barchart" 
          title="Active This Month" 
          value={stats.this_month_active_users.toLocaleString()}
          subtitle="Monthly Active"
          color="bg-sdg-accent" 
          bgGradient="bg-gradient-to-br from-sdg-accent to-orange-500"
          percentage={monthActivePercentage}
        />
      </div>
      
      {/* Dashboard area */}
      <div className="dashboard-bg rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-sdg-primary rounded-lg flex items-center justify-center pulse-glow">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">User Activity Dashboard</h3>
        </div>
        
        <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardGauge
            value={stats.today_active_users}
            maxValue={stats.total_users}
            title="Today's Activity Rate"
            subtitle="Daily Active User Percentage"
            color="text-sdg-secondary"
            size="md"
          />
          
          <DashboardGauge
            value={stats.this_month_active_users}
            maxValue={stats.total_users}
            title="Monthly Activity Rate"
            subtitle="Monthly Active User Percentage"
            color="text-sdg-accent"
            size="md"
          />
          
          <DashboardGauge
            value={stats.total_users - stats.this_month_active_users}
            maxValue={stats.total_users}
            title="Inactive Users"
            subtitle="Users Not Active This Month"
            color="text-gray-500"
            size="md"
          />
        </div>
      </div>
      
      {/* Data flow analysis */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataFlowIndicator
          title="User Activity Distribution"
          dataPoints={[
            { label: 'Active Today', value: stats.today_active_users, color: 'bg-sdg-secondary' },
            { label: 'Active This Month', value: stats.this_month_active_users, color: 'bg-sdg-accent' },
            { label: 'Inactive', value: stats.total_users - stats.this_month_active_users, color: 'bg-gray-400' }
          ]}
        />
        
        <DataFlowIndicator
          title="Activity Rate Comparison"
          dataPoints={[
            { label: 'Daily Rate', value: Math.round((stats.today_active_users / stats.total_users) * 100), color: 'bg-green-500' },
            { label: 'Monthly Rate', value: Math.round((stats.this_month_active_users / stats.total_users) * 100), color: 'bg-blue-500' },
            { label: 'Inactive Rate', value: Math.round(((stats.total_users - stats.this_month_active_users) / stats.total_users) * 100), color: 'bg-gray-500' }
          ]}
        />
      </div>
    </div>
  );
};

const AnalyzePage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState<ActiveUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isAdmin) {
          setError('You need admin privileges to view analytics data.');
          setLoading(false);
          return;
        }
        
        const trendResult = await analyticsService.getActiveTrendChartData();
        if (trendResult.success && trendResult.data) {
          // Extract the statistics for today and this month from the line chart data.
          const today = new Date().toISOString().split('T')[0]; 
          const currentMonth = new Date().getMonth() + 1; 
          const currentYear = new Date().getFullYear();
          
          // Find today's data
          const todayData = trendResult.data.find(item => item.date === today);
          const todayActiveUsers = todayData ? todayData.count : 0;
          
          // Calculate the total number of active users for this month
          const thisMonthActiveUsers = trendResult.data
            .filter(item => {
              const itemDate = new Date(item.date);
              return itemDate.getMonth() + 1 === currentMonth && 
                     itemDate.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + item.count, 0);
          
          // Obtain the total number of users (from the first API call)
          const statsResult = await analyticsService.getActiveUserStats();
          const totalUsers = statsResult.success && statsResult.data ? statsResult.data.total_users : 0;
          
          // Build dashboard data
          const dashboardStats: ActiveUserStats = {
            total_users: totalUsers,
            today_active_users: todayActiveUsers,
            this_month_active_users: thisMonthActiveUsers
          };
          
          setStats(dashboardStats);
          setLastUpdate(new Date());
        } else {
          setError('Failed to load user statistics. You may not have permission to view this page.');
        }
      } catch (e) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sdg-primary"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sdg-primary font-medium">Loading...</div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </div>
      );
    }

    if (stats) {
      return <StatsOverview stats={stats} />;
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 dashboard-scrollbar">
      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-sdg-primary to-blue-600 rounded-xl flex items-center justify-center gradient-animate">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight text-black">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-black">Real-time monitoring of system usage and user activity</p>
          </div>
        </div>
        
        {/* Real-time status indicator */}
        <div className="flex items-center justify-between">
          <RealTimeIndicator 
            lastUpdate={lastUpdate}
            isLive={true}
            updateInterval={30000}
          />
          
          <div className="flex items-center space-x-3">
            <DataStatusIndicator
              status="online"
              message="Data Source Normal"
            />
            <DataStatusIndicator
              status="online"
              message="API Connection Normal"
            />
          </div>
        </div>
      </header>
      
      <main className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">User Statistics Overview</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full realtime-blink"></div>
              <span>Live Data</span>
            </div>
          </div>
          {renderContent()}
        </section>
        
        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-medium text-white mb-4">Activity Trend</h2>
                <ActiveTrendChart />
              </section>
              
              <section>
                <h2 className="text-lg font-medium text-white mb-4">Popular Search Terms</h2>
                <SearchWordCloud />
              </section>
            </div>

            <section>
              <h2 className="text-lg font-medium text-white mb-4">Page Active Time</h2>
              <PageActiveTime />
            </section>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-300 font-medium">Access Restricted</p>
              <p className="text-gray-400 text-sm mt-2">You need administrator privileges to view detailed analytics.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyzePage;
