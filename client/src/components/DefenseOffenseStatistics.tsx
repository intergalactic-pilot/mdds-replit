import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Sword, BarChart3 } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Domain } from '@shared/schema';

const domainColors = {
  joint: { color: '#1F2937', label: 'JOINT' },
  space: { color: '#3B82F6', label: 'SPACE' },
  cyber: { color: '#F59E0B', label: 'CYBER' },
  cognitive: { color: '#8B5CF6', label: 'COGNITIVE' },
  economy: { color: '#10B981', label: 'ECONOMY' }
} as const;

export default function DefenseOffenseStatistics() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  
  const store = useMDDSStore();
  const { turnStatistics } = store;

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Only show if we have data
  if (turnStatistics.length === 0) {
    return null;
  }

  // Prepare chart data for each team's defense and offense over time
  const getChartData = () => {
    return turnStatistics.map(stat => {
      const data: any = { turn: stat.turn };
      
      // Add NATO defensive data (normalized as percentage of baseline 100)
      Object.keys(stat.natoDeterrence).forEach(domain => {
        data[`nato_defense_${domain}`] = stat.natoDeterrence[domain as keyof typeof stat.natoDeterrence] / 100;
      });
      
      // Add Russia defensive data (normalized as percentage of baseline 100)
      Object.keys(stat.russiaDeterrence).forEach(domain => {
        data[`russia_defense_${domain}`] = stat.russiaDeterrence[domain as keyof typeof stat.russiaDeterrence] / 100;
      });
      
      // Add NATO offensive data (impact on Russia, shown as negative values as in reference image)
      Object.keys(stat.russiaDeterrence).forEach(domain => {
        data[`nato_offense_${domain}`] = -(100 - stat.russiaDeterrence[domain as keyof typeof stat.russiaDeterrence]);
      });
      
      // Add Russia offensive data (impact on NATO, shown as negative values as in reference image)
      Object.keys(stat.natoDeterrence).forEach(domain => {
        data[`russia_offense_${domain}`] = -(100 - stat.natoDeterrence[domain as keyof typeof stat.natoDeterrence]);
      });
      
      return data;
    });
  };

  const chartData = getChartData();

  return (
    <div className="glass-card border border-border/50">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 hover-elevate transition-all duration-300 text-left"
        data-testid="button-toggle-defense-offense-statistics"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">NATO/Russia Defense/Offense Statistics</h2>
          <span className="text-sm text-muted-foreground">
            (Interactive domain analysis)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border/50 p-4 space-y-6" data-testid="defense-offense-statistics-content">
          
          {/* Domain Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Domain Filter</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDomain(null)}
                className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 hover-elevate ${
                  selectedDomain === null
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border/50 hover:border-border text-muted-foreground'
                }`}
                data-testid="button-domain-all"
              >
                All Domains
              </button>
              {Object.entries(domainColors).map(([domain, config]) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain as Domain)}
                  className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 hover-elevate ${
                    selectedDomain === domain
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'border-border/50 hover:border-border text-muted-foreground'
                  }`}
                  data-testid={`button-domain-${domain}`}
                >
                  <span className="capitalize">{domain}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modern 2x2 Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NATO Defensive Strategy */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-lg border">
              <h4 className="text-lg font-semibold mb-4 text-blue-600">NATO Defensive Strategy</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="turn" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                    domain={['dataMin - 0.05', 'dataMax + 0.05']}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  {Object.entries(domainColors).map(([domain, config]) => (
                    (!selectedDomain || selectedDomain === domain) && (
                      <Line 
                        key={domain}
                        type="monotone" 
                        dataKey={`nato_defense_${domain}`}
                        stroke={config.color} 
                        strokeWidth={3}
                        name={`${config.label}`}
                        connectNulls={false}
                        dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                      />
                    )
                  ))}
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="line"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* NATO Offensive Strategy */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border">
              <h4 className="text-lg font-semibold mb-4 text-blue-600">NATO Offensive Strategy</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="turn" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                    domain={[-45, 0]}
                    ticks={[0, -5, -10, -15, -20, -25, -30, -35, -40, -45]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  {Object.entries(domainColors).map(([domain, config]) => (
                    (!selectedDomain || selectedDomain === domain) && (
                      <Line 
                        key={domain}
                        type="monotone" 
                        dataKey={`nato_offense_${domain}`}
                        stroke={config.color} 
                        strokeWidth={3}
                        name={`${config.label}`}
                        connectNulls={false}
                        dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                      />
                    )
                  ))}
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="line"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Russia Defensive Strategy */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border">
              <h4 className="text-lg font-semibold mb-4 text-red-600">Russia Defensive Strategy</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="turn" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                    domain={['dataMin - 0.05', 'dataMax + 0.05']}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  {Object.entries(domainColors).map(([domain, config]) => (
                    (!selectedDomain || selectedDomain === domain) && (
                      <Line 
                        key={domain}
                        type="monotone" 
                        dataKey={`russia_defense_${domain}`}
                        stroke={config.color} 
                        strokeWidth={3}
                        name={`${config.label}`}
                        connectNulls={false}
                        dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                      />
                    )
                  ))}
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="line"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Russia Offensive Strategy */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border">
              <h4 className="text-lg font-semibold mb-4 text-red-600">Russia Offensive Strategy</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="turn" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={{ stroke: '#64748b' }}
                    domain={[-45, 0]}
                    ticks={[0, -5, -10, -15, -20, -25, -30, -35, -40, -45]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  {Object.entries(domainColors).map(([domain, config]) => (
                    (!selectedDomain || selectedDomain === domain) && (
                      <Line 
                        key={domain}
                        type="monotone" 
                        dataKey={`russia_offense_${domain}`}
                        stroke={config.color} 
                        strokeWidth={3}
                        name={`${config.label}`}
                        connectNulls={false}
                        dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                      />
                    )
                  ))}
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="line"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend/Explanation */}
          <div className="glass-panel p-4 bg-muted/20">
            <h4 className="text-sm font-semibold mb-2">Chart Explanation</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong className="text-blue-600">Defensive Strategy:</strong> Shows how each domain's deterrence strength changes over turns (normalized from baseline 100)</p>
              <p><strong className="text-red-600">Offensive Strategy:</strong> Shows the impact each team has on the opponent's deterrence capabilities</p>
              <p><strong>Domains:</strong> Five strategic domains - Joint, Space, Cyber, Cognitive, Economy. Click domain filters above to focus on specific domains.</p>
              <p><strong>Turns:</strong> X-axis shows strategic progression over time with line charts displaying trends and patterns</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}