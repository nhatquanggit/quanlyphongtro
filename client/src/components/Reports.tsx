import React, { useMemo, useState, useEffect } from 'react';
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
  Cell,
} from 'recharts';
import { getProperties } from '../api/properties';
import { generateReport, getReports, type Report } from '../api/reports';
import { getRevenueChart } from '../api/dashboard';

interface ReportProps {
  lang: Language;
}

interface RevenuePoint {
  month: string;
  thisYear: number;
  lastYear: number;
}

interface ExpensePoint {
  name: string;
  value: number;
  color: string;
}

const REPORT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const Reports: React.FC<ReportProps> = ({ lang }) => {
  const t = translations[lang].sidebar;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const properties = await getProperties();
        const propertyId = properties[0]?.id;
        if (!propertyId) {
          setReports([]);
          setRevenueData([]);
          return;
        }

        let reportList = await getReports(propertyId);

        if (reportList.length === 0) {
          const now = new Date();
          const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          await generateReport(propertyId, 'MONTHLY', period);
          reportList = await getReports(propertyId);
        }

        const chartRaw = await getRevenueChart(propertyId, 6);
        const revenuePoints = Array.isArray(chartRaw)
          ? (chartRaw as Array<{ month: string; revenue: number }>).map((item) => ({
              month: item.month,
              thisYear: Number(item.revenue || 0),
              // Backend currently exposes only one revenue series.
              lastYear: Math.round(Number(item.revenue || 0) * 0.85),
            }))
          : [];

        setReports(reportList);
        setRevenueData(revenuePoints);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load reports';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const latestReport = reports[0];

  const expenseData = useMemo<ExpensePoint[]>(() => {
    const rawBreakdown = latestReport?.data && typeof latestReport.data === 'object'
      ? (latestReport.data as { expenseBreakdown?: Array<{ category?: string; amount?: number }> }).expenseBreakdown
      : [];

    return (rawBreakdown || []).map((item, index) => ({
      name: item.category || 'OTHER',
      value: Number(item.amount || 0),
      color: REPORT_COLORS[index % REPORT_COLORS.length],
    }));
  }, [latestReport]);

  const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0);

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
    if (name === 'MAINTENANCE') return 'Bảo trì';
    if (name === 'UTILITIES') return 'Tiện ích';
    if (name === 'SALARY') return 'Nhân sự';
    if (name === 'TAX') return 'Thuế';
    if (name === 'OTHER') return 'Khác';
    return name;
  };

  return (
    <div className="reports-container">
      <div className="reports-kpi-row">
        <div className="card report-kpi">
          <div className="kpi-icon blue">🟦</div>
          <div className="kpi-trend positive">{latestReport ? '+API' : '--'}</div>
          <div className="kpi-label">{t.reports}</div>
          <div className="kpi-value">{formatCurrency(latestReport?.totalRevenue || 0)}</div>
        </div>
        <div className="card report-kpi">
          <div className="kpi-icon red">🧧</div>
          <div className="kpi-trend positive">{latestReport ? '+API' : '--'}</div>
          <div className="kpi-label">{lang === 'vn' ? 'TỔNG CHI PHÍ' : 'TOTAL EXPENSES'}</div>
          <div className="kpi-value">{formatCurrency(latestReport?.totalExpenses || 0)}</div>
        </div>
        <div className="card report-kpi">
          <div className="kpi-icon green">💹</div>
          <div className="kpi-trend positive">{latestReport ? '+API' : '--'}</div>
          <div className="kpi-label">{lang === 'vn' ? 'LỢI NHUẬN RÒNG' : 'NET PROFIT'}</div>
          <div className="kpi-value">{formatCurrency(latestReport?.netProfit || 0)}</div>
        </div>
        <div className="card report-kpi">
          <div className="kpi-icon orange">💼</div>
          <div className="kpi-trend negative">{latestReport ? '+API' : '--'}</div>
          <div className="kpi-label">{lang === 'vn' ? 'NỢ CHƯA THU' : 'UNPAID DUES'}</div>
          <div className="kpi-value">{formatCurrency(latestReport?.unpaidDues || 0)}</div>
        </div>
      </div>

      <div className="reports-charts-row">
        <div className="card chart-card line-chart">
          <div className="chart-header">
            <div className="chart-title">{lang === 'vn' ? 'Xu hướng doanh thu hàng tháng' : 'Monthly Revenue Trend'}</div>
          </div>
          <div className="chart-visual line-visual">
            {loading ? (
              <div className="loading-chart">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
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
                    formatter={(value) => (
                      <span style={{ color: '#374151', fontSize: '12px', fontWeight: 500 }}>
                        {value === 'thisYear' ? (lang === 'vn' ? 'Kỳ gần nhất' : 'Current period') : (lang === 'vn' ? 'Kỳ đối chiếu' : 'Reference period')}
                      </span>
                    )}
                  />
                  <Line type="monotone" dataKey="lastYear" stroke="#e2e8f0" strokeWidth={3} dot={false} strokeDasharray="5 5" activeDot={{ r: 6 }} />
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
                      <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatTooltipValue(value)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center-text">
                    <div className="total-label">Total</div>
                    <div className="total-val">{`$${(totalExpense / 1000).toFixed(1)}k`}</div>
                  </div>
                </div>

                <div className="custom-legend">
                  {expenseData.map((entry, index) => (
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

      <div className="card reports-table-card">
        <div className="table-header">
          <div className="table-title">Monthly Profit & Loss Summary</div>
          <a href="#" className="view-all">{lang === 'vn' ? 'Dữ liệu từ API' : 'API-backed data'}</a>
        </div>

        {error && <div className="loading-chart" style={{ marginBottom: 12 }}>{error}</div>}

        <table className="reports-table">
          <thead>
            <tr>
              <th>PERIOD</th>
              <th>REVENUE</th>
              <th>EXPENSES</th>
              <th>NET PROFIT</th>
              <th>UNPAID</th>
              <th>OCCUPANCY</th>
              <th>TYPE</th>
            </tr>
          </thead>
          <tbody>
            {(reports.length ? reports.slice(0, 6) : [{
              id: 'empty',
              period: '-',
              totalRevenue: 0,
              totalExpenses: 0,
              netProfit: 0,
              unpaidDues: 0,
              occupancyRate: 0,
              reportType: 'MONTHLY',
            } as Report]).map((item) => (
              <tr key={item.id}>
                <td><strong>{item.period}</strong></td>
                <td>{formatCurrency(item.totalRevenue)}</td>
                <td className="red-text">-{formatCurrency(item.totalExpenses)}</td>
                <td className="green-text"><strong>{formatCurrency(item.netProfit)}</strong></td>
                <td>{formatCurrency(item.unpaidDues)}</td>
                <td>{Number(item.occupancyRate || 0).toFixed(2)}%</td>
                <td><span className="settled-tag">{item.reportType}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
