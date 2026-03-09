import React, { useState, useEffect } from 'react';
import './Reports.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReportProps {
  lang: Language;
}

// Interfaces for API response
interface RevenueData {
  month: string;
  thisYear: number;
  lastYear: number;
}

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface ReportData {
  revenue: RevenueData[];
  expenses: ExpenseData[];
  totalExpense: number;
}

const Reports: React.FC<ReportProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock API Call
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock Data
      const mockRevenue: RevenueData[] = [
        { month: 'Jan', thisYear: 15000, lastYear: 11000 },
        { month: 'Feb', thisYear: 19000, lastYear: 12500 },
        { month: 'Mar', thisYear: 22000, lastYear: 11000 },
        { month: 'Apr', thisYear: 18000, lastYear: 14000 },
        { month: 'May', thisYear: 24000, lastYear: 12500 },
        { month: 'Jun', thisYear: 30000, lastYear: 14500 },
        { month: 'Jul', thisYear: 34000, lastYear: 16500 },
      ];

      const mockExpenses: ExpenseData[] = [
        { name: 'Maintenance', value: 4980, color: '#3b82f6' }, // blue
        { name: 'Utilities', value: 3112, color: '#10b981' },   // green
        { name: 'Staff', value: 2490, color: '#f59e0b' },       // orange
        { name: 'Taxes', value: 1868, color: '#ef4444' },       // red
      ];

      setData({
        revenue: mockRevenue,
        expenses: mockExpenses,
        totalExpense: 12450
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (Array.isArray(value)) {
      const first = (value as unknown[])[0];
      return typeof first === 'number' ? first : Number(first ?? 0);
    }
    if (typeof value === 'string') return Number(value);
    return 0;
  };

  const formatTooltipValue = (value: unknown) => formatCurrency(toNumber(value));

  const getTranslatedExpenseName = (name: string) => {
    if (lang !== 'vn') return name;
    switch (name) {
      case 'Maintenance': return 'Bảo trì';
      case 'Utilities': return 'Tiện ích';
      case 'Staff': return 'Nhân sự';
      case 'Taxes': return 'Thuế';
      default: return name;
    }
  };

  return (
    <div className="reports-container">
      {/* KPI Row */}
      <div className="reports-kpi-row">
        <div className="card report-kpi">
           <div className="kpi-icon blue">🟦</div>
           <div className="kpi-trend positive">+12% ↗</div>
           <div className="kpi-label">{t.reports}</div>
           <div className="kpi-value">$45,280.00</div>
        </div>
        <div className="card report-kpi">
           <div className="kpi-icon red">🧧</div>
           <div className="kpi-trend positive">+4% ↗</div>
           <div className="kpi-label">{lang === 'vn' ? 'TỔNG CHI PHÍ' : 'TOTAL EXPENSES'}</div>
           <div className="kpi-value">$12,450.00</div>
        </div>
        <div className="card report-kpi">
           <div className="kpi-icon green">💹</div>
           <div className="kpi-trend positive">+18% ↗</div>
           <div className="kpi-label">{lang === 'vn' ? 'LỢI NHUẬN RÒNG' : 'NET PROFIT'}</div>
           <div className="kpi-value">$32,830.00</div>
        </div>
        <div className="card report-kpi">
           <div className="kpi-icon orange">💼</div>
           <div className="kpi-trend negative">-2% ↘</div>
           <div className="kpi-label">{lang === 'vn' ? 'NỢ CHƯA THU' : 'UNPAID DUES'}</div>
           <div className="kpi-value">$1,200.00</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="reports-charts-row">
         {/* Line Chart */}
         <div className="card chart-card line-chart">
            <div className="chart-header">
               <div className="chart-title">{lang === 'vn' ? 'Xu hướng doanh thu hàng tháng' : 'Monthly Revenue Trend'}</div>
            </div>
            <div className="chart-visual line-visual">
              {loading ? (
                <div className="loading-chart">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.revenue}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [formatTooltipValue(value), '']}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#374151', fontSize: '12px', fontWeight: 500 }}>{value === 'thisYear' ? (lang === 'vn' ? 'Năm nay' : 'This Year') : (lang === 'vn' ? 'Năm ngoái' : 'Last Year')}</span>}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lastYear" 
                      stroke="#e2e8f0" 
                      strokeWidth={3} 
                      dot={false} 
                      strokeDasharray="5 5" 
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="thisYear" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
         </div>

         {/* Donut Chart */}
         <div className="card chart-card donut-chart">
            <div className="chart-title">{lang === 'vn' ? 'Phân bổ chi phí' : 'Expense Breakdown'}</div>
            <div className="chart-visual donut-visual">
               {loading ? (
                 <div className="loading-chart">Loading chart...</div>
               ) : (
                 <div className="donut-container">
                    <div className="donut-wrapper">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={data?.expenses}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {data?.expenses.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatTooltipValue(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Text */}
                      <div className="donut-center-text">
                        <div className="total-label">Total</div>
                        <div className="total-val">{data ? `$${(data.totalExpense / 1000).toFixed(1)}k` : ''}</div>
                      </div>
                    </div>
                    
                    <div className="custom-legend">
                      {data?.expenses.map((entry, index) => (
                        <div key={index} className="legend-row">
                          <div className="legend-label-group">
                            <span className="legend-box" style={{ backgroundColor: entry.color }} />
                            {getTranslatedExpenseName(entry.name)}
                          </div>
                          <strong>{formatCurrency(entry.value)}</strong>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* P&L Table */}
      <div className="card reports-table-card">
         <div className="table-header">
            <div className="table-title">Monthly Profit & Loss Summary</div>
            <a href="#" className="view-all">View All Months</a>
         </div>
         <table className="reports-table">
            <thead>
               <tr>
                  <th>MONTH</th>
                  <th>REVENUE</th>
                  <th>EXPENSES</th>
                  <th>MAINTENANCE</th>
                  <th>TAX RESERVE</th>
                  <th>NET PROFIT</th>
                  <th>STATUS</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td><strong>June 2023</strong></td>
                  <td>$45,280</td>
                  <td className="red-text">-$12,450</td>
                  <td>$4,980</td>
                  <td>$1,868</td>
                  <td className="green-text"><strong>+$32,830</strong></td>
                  <td><span className="settled-tag">SETTLED</span></td>
               </tr>
               <tr>
                  <td><strong>May 2023</strong></td>
                  <td>$42,150</td>
                  <td className="red-text">-$11,800</td>
                  <td>$3,200</td>
                  <td>$1,500</td>
                  <td className="green-text"><strong>+$30,350</strong></td>
                  <td><span className="settled-tag">SETTLED</span></td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default Reports;
