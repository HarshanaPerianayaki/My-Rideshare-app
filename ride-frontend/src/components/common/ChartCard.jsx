import React from 'react';
import {
    ResponsiveContainer,
    AreaChart, Area,
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const ChartCard = ({
    title,
    type = 'area',
    data,
    loading,
    colors = ['#3b82f6', '#8b5cf6'],
    height = 300,
    currency = true,
    percentage = false
}) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-100 rounded-md w-1/3 mb-6"></div>
                <div className="h-64 bg-gray-50 rounded-xl w-full"></div>
            </div>
        );
    }

    if (!data || !data.labels || data.labels.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs">{title}</h4>
                <p className="text-gray-300 text-sm mt-2">No data available for this period</p>
            </div>
        );
    }

    const chartData = data.labels.map((label, index) => ({
        name: label,
        value: data.data[index]
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 text-white p-3 rounded-xl shadow-2xl border border-gray-700">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                    <p className="text-lg font-black italic">
                        {currency && '₹'}{payload[0].value}{percentage && '%'}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            tickFormatter={(val) => currency ? `₹${val}` : val}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={colors[0]}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            strokeWidth={3}
                            animationDuration={1500}
                        />
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar
                            dataKey="value"
                            fill={colors[0]}
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                            animationDuration={1500}
                        />
                    </BarChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            animationDuration={1500}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span className="text-xs font-bold text-gray-500">{value}</span>}
                        />
                    </PieChart>
                );
            case 'line':
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={colors[0]}
                            strokeWidth={4}
                            dot={{ fill: colors[0], strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl group relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h3>
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
            </div>
            <div style={{ width: '100%', height: height }}>
                <ResponsiveContainer>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartCard;
