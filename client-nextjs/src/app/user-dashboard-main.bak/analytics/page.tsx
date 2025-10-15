'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import QueryAnalytics from '@/components/user/QueryAnalytics'; // From prior refactor
import Spinner from '@/components/ui/Spinner';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// New ScheduleAnalytics Component
const ScheduleAnalytics: React.FC = () => {
  const [filter, setFilter] = useState({ dateRange: '7d', source: 'all' });
  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['schedules', filter],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/schedules?dateRange=${filter.dateRange}&source=${filter.source}`);
      if (!res.ok) throw new Error('Failed to fetch schedules');
      return res.json();
    },
  });

  return (
    <motion.div
      className="bg-[#1E2A44] rounded-xl shadow-xl p-6 min-h-[200px]"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="bg-transparent border-none">
        <CardHeader>
          <CardTitle className="text-xl font-inter text-gray-200">Scheduled Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Select
              value={filter.dateRange}
              onValueChange={(value) => setFilter({ ...filter, dateRange: value })}
            >
              <SelectTrigger className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filter.source}
              onValueChange={(value) => setFilter({ ...filter, source: value })}
            >
              <SelectTrigger className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200">
                <SelectValue placeholder="Data Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="erp">ERP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div className="text-red-400 font-inter text-base">{error.message}</div>
          ) : (
            <div>
              <p className="text-gray-300 font-inter text-base mb-4">
                {schedules.length} active schedules. Next run: <span className="text-[#2E7D7D]">{schedules[0]?.nextRun || 'N/A'}</span>
              </p>
              <Button
                className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white font-inter text-base"
                onClick={() => alert('Create new schedule')} // Replace with API call
              >
                New Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Mock Data (Replace with API-driven normalized reports)
const kpiData = { daily: 5.2, monthly: 12.8, yoy: 22.4, customers: 1200 };
const trendData = [
  { date: '2025-01', sales: 12000, profit: 3200 },
  { date: '2025-02', sales: 13500, profit: 4100 },
  { date: '2025-03', sales: 12800, profit: 3900 },
  { date: '2025-04', sales: 14500, profit: 4700 },
  { date: '2025-05', sales: 16000, profit: 5200 },
  { date: '2025-06', sales: 15500, profit: 5100 },
  { date: '2025-07', sales: 17000, profit: 5900 },
];
const topNData = [
  { product: 'Product A', sales: 5200 },
  { product: 'Product B', sales: 4800 },
  { product: 'Product C', sales: 4300 },
  { product: 'Product D', sales: 3900 },
  { product: 'Product E', sales: 3700 },
];

// Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1E2A44] flex items-center justify-center text-white">
          <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
            <p className="text-red-400 font-inter text-lg">Failed to load analytics</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AnalyticsPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [pivotConfig, setPivotConfig] = useState({ rows: 'product', cols: 'date', values: 'sales' });
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      return res.json();
    },
  });

  const handleAskAI = async () => {
    try {
      const context = { reports, pivotConfig, trendData, topNData }; // Include normalized data
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiQuestion, context }),
      });
      if (!res.ok) throw new Error('Failed to get AI response');
      const { answer } = await res.json();
      setAiResponse(answer || 'No insights available.');
    } catch (err: any) {
      setAiResponse(`Error: ${err.message}`);
    }
  };

  // Pivot Table Data (Derived from reports)
  const pivotData = reports.reduce((acc: any, report: any) => {
    report.data.forEach((row: any) => {
      const key = `${row[pivotConfig.rows]}-${row[pivotConfig.cols]}`;
      acc[key] = acc[key] || { [pivotConfig.rows]: row[pivotConfig.rows], [pivotConfig.cols]: row[pivotConfig.cols], [pivotConfig.values]: 0 };
      acc[key][pivotConfig.values] += row[pivotConfig.values] || 0;
    });
    return Object.values(acc);
  }, {});

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-[#1E2A44] p-6 font-inter text-white">
        {/* KPI Cards */}
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
            className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6"
          >
            <Card className="bg-transparent border-none">
              <CardHeader>
                <CardTitle className="text-lg font-inter text-gray-200">Daily Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#2E7D7D]">{kpiData.daily}%</p>
              </CardContent>
            </Card>
          </motion.div>
          {/* Repeat for other KPIs */}
        </section>

        {/* Query Analytics Section */}
        <section className="mb-8">
          <QueryAnalytics />
        </section>

        {/* Schedule Analytics Section */}
        <section className="mb-8">
          <ScheduleAnalytics />
        </section>

        {/* Sales Trends */}
        <section className="mb-8">
          <motion.div
            className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6"
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
          >
            <Card className="bg-transparent border-none">
              <CardHeader>
                <CardTitle className="text-lg font-inter text-gray-200">Sales & Profit Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} />
                    <XAxis dataKey="date" stroke="#text-gray-300" />
                    <YAxis stroke="#text-gray-300" />
                    <Tooltip contentStyle={{ background: '#1E2A44', border: '1px solid #2E7D7D' }} />
                    <Line type="monotone" dataKey="sales" stroke="#2E7D7D" name="Sales" />
                    <Line type="monotone" dataKey="profit" stroke="#A3BFFA" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Pivot Table */}
        <section className="mb-8">
          <motion.div
            className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6"
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
          >
            <Card className="bg-transparent border-none">
              <CardHeader>
                <CardTitle className="text-lg font-inter text-gray-200">Pivot Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-4">
                  <Select
                    value={pivotConfig.rows}
                    onValueChange={(value) => setPivotConfig({ ...pivotConfig, rows: value })}
                  >
                    <SelectTrigger className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="region">Region</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={pivotConfig.cols}
                    onValueChange={(value) => setPivotConfig({ ...pivotConfig, cols: value })}
                  >
                    <SelectTrigger className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200">
                      <SelectValue placeholder="Columns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2E7D7D]">
                      <TableHead className="text-gray-200 font-inter text-base">{pivotConfig.rows}</TableHead>
                      <TableHead className="text-gray-200 font-inter text-base">{pivotConfig.cols}</TableHead>
                      <TableHead className="text-gray-200 font-inter text-base">Sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(pivotData).map((row: any, idx: number) => (
                      <TableRow key={idx} className="border-[#2E7D7D]">
                        <TableCell className="text-gray-300 font-inter text-base">{row[pivotConfig.rows]}</TableCell>
                        <TableCell className="text-gray-300 font-inter text-base">{row[pivotConfig.cols]}</TableCell>
                        <TableCell className="text-gray-300 font-inter text-base">{row.sales}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* AI Query Section */}
        <section className="mb-8">
          <motion.div
            className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6"
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
          >
            <Card className="bg-transparent border-none">
              <CardHeader>
                <CardTitle className="text-lg font-inter text-gray-200">Ask AI Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex mb-4">
                  <Input
                    placeholder="E.g., Explain sales trends for Q2"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200 font-inter text-base"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={handleAskAI}
                      disabled={!aiQuestion.trim()}
                      className="ml-2 bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white font-inter text-base"
                    >
                      Ask AI
                    </Button>
                  </motion.div>
                </div>
                {aiResponse && (
                  <div className="text-base font-inter text-gray-300">{aiResponse}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </ErrorBoundary>
  );
}