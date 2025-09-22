import { useState } from 'react';
import { ChevronDown, ChevronUp, LineChart } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { Domain } from '@shared/schema';

const domainColors = {
  joint: { color: '#9CA3AF', bgClass: 'bg-gray-500/20', textClass: 'text-gray-500' },
  economy: { color: '#10B981', bgClass: 'bg-green-500/20', textClass: 'text-green-500' },
  cognitive: { color: '#8B5CF6', bgClass: 'bg-purple-500/20', textClass: 'text-purple-500' },
  space: { color: '#3B82F6', bgClass: 'bg-blue-500/20', textClass: 'text-blue-500' },
  cyber: { color: '#F59E0B', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-500' }
} as const;

export default function DomainStatistics() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const turnStatistics = useMDDSStore(state => state.turnStatistics);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Only show if we have 2+ turns of data
  if (turnStatistics.length < 2) {
    return null;
  }

  // Prepare chart data with 100 as baseline reference
  const chartData = turnStatistics.map(stat => {
    const differences: any = { turn: stat.turn };
    Object.keys(stat.natoDeterrence).forEach(domain => {
      const natoValue = stat.natoDeterrence[domain as keyof typeof stat.natoDeterrence];
      const russiaValue = stat.russiaDeterrence[domain as keyof typeof stat.russiaDeterrence];
      // Calculate difference from 100 baseline: (NATO - 100) - (Russia - 100) = NATO - Russia
      differences[domain] = (natoValue - 100) - (russiaValue - 100);
    });
    return differences;
  });

  // Get domain-specific data for selected domain with 100 baseline reference
  const getDomainSpecificData = (domain: Domain) => {
    return turnStatistics.map(stat => ({
      turn: stat.turn,
      natoValue: stat.natoDeterrence[domain] - 100,
      russiaValue: stat.russiaDeterrence[domain] - 100,
      difference: (stat.natoDeterrence[domain] - 100) - (stat.russiaDeterrence[domain] - 100)
    }));
  };

  return (
    <div className="glass-card border border-border/50">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 hover-elevate transition-all duration-300 text-left"
        data-testid="button-toggle-domain-statistics"
      >
        <div className="flex items-center gap-3">
          <LineChart className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Statistics</h2>
          <span className="text-sm text-muted-foreground">
            (Domain-based differences per turn)
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
        <div className="border-t border-border/50 p-4 space-y-6" data-testid="domain-statistics-content">
          {/* Domain Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Select Domain for Detailed Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(domainColors).map(([domain, config]) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain as Domain)}
                  className={`p-3 rounded-md border transition-all duration-200 text-sm font-medium hover-elevate ${
                    selectedDomain === domain 
                      ? `${config.bgClass} border-current ${config.textClass}` 
                      : 'border-border/50 hover:border-border text-muted-foreground'
                  }`}
                  data-testid={`button-select-domain-${domain}`}
                >
                  <div className="capitalize">{domain}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Overall Charts */}
          <div className="space-y-6">
            {/* Line Chart showing domain differences over time */}
            <div className="glass-panel p-4">
              <h4 className="text-sm font-semibold mb-3">Domain Deterrence Differences (Baseline: 100)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="turn" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="joint" 
                    stroke={domainColors.joint.color} 
                    name="Joint"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="economy" 
                    stroke={domainColors.economy.color} 
                    name="Economy"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cognitive" 
                    stroke={domainColors.cognitive.color} 
                    name="Cognitive"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="space" 
                    stroke={domainColors.space.color} 
                    name="Space"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cyber" 
                    stroke={domainColors.cyber.color} 
                    name="Cyber"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Domain-Specific Analysis */}
          {selectedDomain && (
            <div className="space-y-4" data-testid={`domain-analysis-${selectedDomain}`}>
              <div className="glass-panel p-4">
                <h4 className={`text-sm font-semibold mb-3 capitalize ${domainColors[selectedDomain].textClass}`}>
                  {selectedDomain} Domain Analysis
                </h4>
                
                {/* Domain-specific line chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={getDomainSpecificData(selectedDomain)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="turn" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="natoValue" 
                      stroke="#3B82F6" 
                      name="NATO (vs 100)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="russiaValue" 
                      stroke="#EF4444" 
                      name="Russia (vs 100)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="difference" 
                      stroke={domainColors[selectedDomain].color} 
                      name="Difference (NATO - Russia)"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              {/* Domain statistics table */}
              <div className="glass-panel p-4">
                <h5 className="text-sm font-semibold mb-3">Turn-by-Turn Data</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-3 font-medium">Turn</th>
                        <th className="text-center py-2 px-3 font-medium text-blue-400">NATO</th>
                        <th className="text-center py-2 px-3 font-medium text-red-400">Russia</th>
                        <th className={`text-center py-2 px-3 font-medium ${domainColors[selectedDomain].textClass}`}>
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDomainSpecificData(selectedDomain).map((data, index) => (
                        <tr key={index} className="border-b border-border/20">
                          <td className="py-2 px-3 font-medium">Turn {data.turn}</td>
                          <td className="text-center py-2 px-3 text-blue-400 font-semibold">
                            {data.natoValue}
                          </td>
                          <td className="text-center py-2 px-3 text-red-400 font-semibold">
                            {data.russiaValue}
                          </td>
                          <td className={`text-center py-2 px-3 font-semibold ${
                            data.difference > 0 ? 'text-blue-400' : 
                            data.difference < 0 ? 'text-red-400' : 
                            'text-muted-foreground'
                          }`}>
                            {data.difference > 0 ? `+${data.difference}` : data.difference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}