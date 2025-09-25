import { useState } from 'react';
import { ChevronDown, ChevronUp, LineChart, BarChart3, TrendingUp, Minus, MoreHorizontal } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Domain } from '@shared/schema';
import DefenseOffenseChart from './DefenseOffenseChart';

const domainColors = {
  joint: { color: '#9CA3AF', bgClass: 'bg-gray-500/20', textClass: 'text-gray-500' },
  economy: { color: '#10B981', bgClass: 'bg-green-500/20', textClass: 'text-green-500' },
  cognitive: { color: '#8B5CF6', bgClass: 'bg-purple-500/20', textClass: 'text-purple-500' },
  space: { color: '#3B82F6', bgClass: 'bg-blue-500/20', textClass: 'text-blue-500' },
  cyber: { color: '#F59E0B', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-500' }
} as const;

export default function DomainStatistics() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverallStatsExpanded, setIsOverallStatsExpanded] = useState(false);
  const [isDomainBasedStatsExpanded, setIsDomainBasedStatsExpanded] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  
  // Interactive controls for Overall Statistics
  const [showRussia, setShowRussia] = useState(true);
  const [visibleDomains, setVisibleDomains] = useState<Record<Domain, boolean>>({
    joint: true,
    economy: true,
    cognitive: true,
    space: true,
    cyber: true
  });
  
  const turnStatistics = useMDDSStore(state => state.turnStatistics);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  const toggleDomainVisibility = (domain: Domain) => {
    setVisibleDomains(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }));
  };

  // Only show if we have 2+ turns of data
  if (turnStatistics.length < 2) {
    return null;
  }

  // Prepare chart data with 100 as baseline reference
  const chartData = turnStatistics.map(stat => {
    const differences: Record<string, number> = { turn: stat.turn };
    Object.keys(stat.natoDeterrence).forEach(domain => {
      const natoValue = stat.natoDeterrence[domain as keyof typeof stat.natoDeterrence];
      const russiaValue = stat.russiaDeterrence[domain as keyof typeof stat.russiaDeterrence];
      // Calculate difference from 100 baseline: (NATO - 100) - (Russia - 100) = NATO - Russia
      differences[domain] = (natoValue - 100) - (russiaValue - 100);
    });
    return differences;
  });

  // Prepare overall chart data showing all domains for each turn
  const overallChartData = turnStatistics.map(stat => {
    const data: Record<string, number> = { turn: stat.turn };
    // Add NATO and Russia values for all domains
    Object.keys(stat.natoDeterrence).forEach(domain => {
      data[`nato_${domain}`] = stat.natoDeterrence[domain as keyof typeof stat.natoDeterrence];
      data[`russia_${domain}`] = stat.russiaDeterrence[domain as keyof typeof stat.russiaDeterrence];
    });
    return data;
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
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border/50 p-4 space-y-4" data-testid="domain-statistics-content">
          
          {/* Overall Statistics */}
          <div className="space-y-3">
            <button
              onClick={() => setIsOverallStatsExpanded(!isOverallStatsExpanded)}
              className="w-full flex items-center justify-between p-3 glass-panel hover-elevate transition-all duration-300 text-left"
              data-testid="button-toggle-overall-stats"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <h3 className="font-semibold">Overall Statistics</h3>
              </div>
              {isOverallStatsExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            {isOverallStatsExpanded && (
              <div className="space-y-4" data-testid="overall-stats-content">
                {/* Interactive Controls */}
                <div className="glass-panel p-4 space-y-4">
                  <h4 className="text-sm font-semibold">Chart Controls</h4>
                  
                  {/* Team Toggle */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-muted-foreground">Teams</h5>
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-2 rounded-md text-xs font-medium transition-all hover-elevate ${
                          true ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'border border-border/50 text-muted-foreground'
                        }`}
                        data-testid="toggle-nato"
                      >
                        NATO
                      </button>
                      <button
                        onClick={() => setShowRussia(!showRussia)}
                        className={`px-3 py-2 rounded-md text-xs font-medium transition-all hover-elevate ${
                          showRussia ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'border border-border/50 text-muted-foreground'
                        }`}
                        data-testid="toggle-russia"
                      >
                        Russia
                      </button>
                    </div>
                  </div>
                  
                  {/* Domain Toggles */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-muted-foreground">Domains</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(domainColors).map(([domain, config]) => (
                        <button
                          key={domain}
                          onClick={() => toggleDomainVisibility(domain as Domain)}
                          className={`px-3 py-2 rounded-md text-xs font-medium transition-all hover-elevate capitalize ${
                            visibleDomains[domain as Domain] 
                              ? `${config.bgClass} ${config.textClass} border border-current` 
                              : 'border border-border/50 text-muted-foreground'
                          }`}
                          data-testid={`toggle-domain-${domain}`}
                        >
                          {domain}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Combined Chart */}
                <div className="glass-panel p-4">
                  <h4 className="text-sm font-semibold mb-3">Combined NATO vs Russia - All Domains Over Time</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsLineChart data={overallChartData}>
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
                      
                      {/* NATO Lines - Always visible */}
                      {visibleDomains.joint && (
                        <Line 
                          type="monotone" 
                          dataKey="nato_joint" 
                          stroke={domainColors.joint.color} 
                          name="NATO Joint"
                          strokeWidth={2}
                        />
                      )}
                      {visibleDomains.economy && (
                        <Line 
                          type="monotone" 
                          dataKey="nato_economy" 
                          stroke={domainColors.economy.color} 
                          name="NATO Economy"
                          strokeWidth={2}
                        />
                      )}
                      {visibleDomains.cognitive && (
                        <Line 
                          type="monotone" 
                          dataKey="nato_cognitive" 
                          stroke={domainColors.cognitive.color} 
                          name="NATO Cognitive"
                          strokeWidth={2}
                        />
                      )}
                      {visibleDomains.space && (
                        <Line 
                          type="monotone" 
                          dataKey="nato_space" 
                          stroke={domainColors.space.color} 
                          name="NATO Space"
                          strokeWidth={2}
                        />
                      )}
                      {visibleDomains.cyber && (
                        <Line 
                          type="monotone" 
                          dataKey="nato_cyber" 
                          stroke={domainColors.cyber.color} 
                          name="NATO Cyber"
                          strokeWidth={2}
                        />
                      )}
                      
                      {/* Russia Lines - Togglable */}
                      {showRussia && visibleDomains.joint && (
                        <Line 
                          type="monotone" 
                          dataKey="russia_joint" 
                          stroke={domainColors.joint.color} 
                          name="Russia Joint"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      )}
                      {showRussia && visibleDomains.economy && (
                        <Line 
                          type="monotone" 
                          dataKey="russia_economy" 
                          stroke={domainColors.economy.color} 
                          name="Russia Economy"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      )}
                      {showRussia && visibleDomains.cognitive && (
                        <Line 
                          type="monotone" 
                          dataKey="russia_cognitive" 
                          stroke={domainColors.cognitive.color} 
                          name="Russia Cognitive"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      )}
                      {showRussia && visibleDomains.space && (
                        <Line 
                          type="monotone" 
                          dataKey="russia_space" 
                          stroke={domainColors.space.color} 
                          name="Russia Space"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      )}
                      {showRussia && visibleDomains.cyber && (
                        <Line 
                          type="monotone" 
                          dataKey="russia_cyber" 
                          stroke={domainColors.cyber.color} 
                          name="Russia Cyber"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      )}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                  
                  {/* Custom Team Legend */}
                  <div className="mt-4 flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-blue-400" strokeWidth={3} />
                      <span className="text-sm text-blue-400 font-medium">NATO (Solid Lines)</span>
                    </div>
                    {showRussia && (
                      <div className="flex items-center gap-2">
                        <MoreHorizontal className="w-4 h-4 text-red-400" strokeWidth={3} />
                        <span className="text-sm text-red-400 font-medium">Russia (Dashed Lines)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dimension-based Statistics */}
          <div className="space-y-3">
            <button
              onClick={() => setIsDomainBasedStatsExpanded(!isDomainBasedStatsExpanded)}
              className="w-full flex items-center justify-between p-3 glass-panel hover-elevate transition-all duration-300 text-left"
              data-testid="button-toggle-domain-based-stats"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <h3 className="font-semibold">Dimension-based Statistics</h3>
              </div>
              {isDomainBasedStatsExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            {isDomainBasedStatsExpanded && (
              <div className="space-y-6" data-testid="domain-based-stats-content">
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

                {/* Domain Differences Chart */}
          <div className="space-y-6">
            {/* Line Chart showing domain differences over time */}
            <div className="glass-panel p-4">
              <h4 className="text-sm font-semibold mb-3">Dimensional Deterrence Differences</h4>
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

          {/* Defensive/Offensive Statistics Chart */}
          <DefenseOffenseChart />
        </div>
      )}
    </div>
  );
}