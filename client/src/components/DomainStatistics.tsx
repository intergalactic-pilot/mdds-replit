import { useState } from 'react';
import { ChevronDown, ChevronUp, LineChart, BarChart3, TrendingUp, Minus, MoreHorizontal, ZoomIn, Shield, Sword } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [activeSection, setActiveSection] = useState<'overall' | 'dimension' | 'defense' | null>(null);
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
          
          {/* Three Square Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              onClick={() => setActiveSection(activeSection === 'overall' ? null : 'overall')}
              className={`p-4 text-center font-semibold transition-all duration-300 hover-elevate ${
                activeSection === 'overall' 
                  ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50' 
                  : 'glass-panel border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
              style={{ borderRadius: '3px' }}
              data-testid="button-overall-statistics"
            >
              <BarChart3 className="w-5 h-5 mx-auto mb-2" />
              <div className="text-sm">Overall Statistics</div>
            </button>
            
            <button
              onClick={() => setActiveSection(activeSection === 'dimension' ? null : 'dimension')}
              className={`p-4 text-center font-semibold transition-all duration-300 hover-elevate ${
                activeSection === 'dimension' 
                  ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                  : 'glass-panel border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
              style={{ borderRadius: '3px' }}
              data-testid="button-dimension-statistics"
            >
              <TrendingUp className="w-5 h-5 mx-auto mb-2" />
              <div className="text-sm">Dimension Based Statistics</div>
            </button>
            
            <button
              onClick={() => setActiveSection(activeSection === 'defense' ? null : 'defense')}
              className={`p-4 text-center font-semibold transition-all duration-300 hover-elevate ${
                activeSection === 'defense' 
                  ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/50' 
                  : 'glass-panel border border-border/50 text-muted-foreground hover:text-foreground'
              }`}
              style={{ borderRadius: '3px' }}
              data-testid="button-defense-offense-statistics"
            >
              <div className="flex items-center justify-center gap-1 mb-2">
                <Shield className="w-4 h-4" />
                <Sword className="w-4 h-4" />
              </div>
              <div className="text-sm">Defensive/Offensive Statistics Chart</div>
            </button>
          </div>
          
          {/* Overall Statistics Content */}
          {activeSection === 'overall' && (
            <div className="space-y-6" data-testid="overall-stats-content">
              {/* Domain Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Select Dimension for Detailed Analysis</h3>
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

              {/* Domain Table when selected */}
              {selectedDomain && (
                <div className="glass-panel p-4">
                  <h4 className="text-sm font-semibold mb-3 capitalize">{selectedDomain} Domain Analysis</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-2 px-3 font-medium">Turn</th>
                          <th className="text-center py-2 px-3 font-medium text-blue-400">NATO Value</th>
                          <th className="text-center py-2 px-3 font-medium text-red-400">Russia Value</th>
                          <th className="text-center py-2 px-3 font-medium">Difference</th>
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
              )}
            </div>
          )}

          {/* Dimension-based Statistics Content */}
          {activeSection === 'dimension' && (
            <div className="space-y-4" data-testid="domain-based-stats-content">
              {/* Table-based Deterrence Statistics */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Deterrence Statistics Table
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-1 font-medium">Turn</th>
                        <th className="text-center py-2 px-1 font-medium text-blue-400">NATO Total</th>
                        <th className="text-center py-2 px-1 font-medium text-red-400">Russia Total</th>
                        <th className="text-center py-2 px-1 font-medium text-gray-500">Joint</th>
                        <th className="text-center py-2 px-1 font-medium text-green-500">Economy</th>
                        <th className="text-center py-2 px-1 font-medium text-purple-500">Cognitive</th>
                        <th className="text-center py-2 px-1 font-medium text-blue-500">Space</th>
                        <th className="text-center py-2 px-1 font-medium text-yellow-500">Cyber</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnStatistics.map((stat, index) => (
                        <tr key={index} className="border-b border-border/20">
                          <td className="py-2 px-1 font-medium" data-testid={`turn-${stat.turn}`}>
                            Turn {stat.turn}
                          </td>
                          <td className="text-center py-2 px-1 text-blue-400 font-semibold" data-testid={`nato-total-${stat.turn}`}>
                            {stat.natoTotalDeterrence}
                          </td>
                          <td className="text-center py-2 px-1 text-red-400 font-semibold" data-testid={`russia-total-${stat.turn}`}>
                            {stat.russiaTotalDeterrence}
                          </td>
                          <td className="text-center py-2 px-1" data-testid={`joint-${stat.turn}`}>
                            <div className="space-y-1 text-xs">
                              <div className="text-blue-400 font-medium">{stat.natoDeterrence.joint}</div>
                              <div className="text-red-400 font-medium">{stat.russiaDeterrence.joint}</div>
                            </div>
                          </td>
                          <td className="text-center py-2 px-1" data-testid={`economy-${stat.turn}`}>
                            <div className="space-y-1 text-xs">
                              <div className="text-blue-400 font-medium">{stat.natoDeterrence.economy}</div>
                              <div className="text-red-400 font-medium">{stat.russiaDeterrence.economy}</div>
                            </div>
                          </td>
                          <td className="text-center py-2 px-1" data-testid={`cognitive-${stat.turn}`}>
                            <div className="space-y-1 text-xs">
                              <div className="text-blue-400 font-medium">{stat.natoDeterrence.cognitive}</div>
                              <div className="text-red-400 font-medium">{stat.russiaDeterrence.cognitive}</div>
                            </div>
                          </td>
                          <td className="text-center py-2 px-1" data-testid={`space-${stat.turn}`}>
                            <div className="space-y-1 text-xs">
                              <div className="text-blue-400 font-medium">{stat.natoDeterrence.space}</div>
                              <div className="text-red-400 font-medium">{stat.russiaDeterrence.space}</div>
                            </div>
                          </td>
                          <td className="text-center py-2 px-1" data-testid={`cyber-${stat.turn}`}>
                            <div className="space-y-1 text-xs">
                              <div className="text-blue-400 font-medium">{stat.natoDeterrence.cyber}</div>
                              <div className="text-red-400 font-medium">{stat.russiaDeterrence.cyber}</div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
                  <h5 className="text-xs font-medium text-muted-foreground">Dimensions</h5>
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Combined NATO vs Russia - All Domains Over Time</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md border border-border/50 hover-elevate transition-all"
                        data-testid="button-zoom-combined-chart"
                      >
                        <ZoomIn className="w-3 h-3" />
                        Expand
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl w-[90vw] h-[65vh] p-4">
                      <DialogTitle className="text-center">Combined NATO vs Russia - All Domains Over Time</DialogTitle>
                      <div className="flex-1 mt-1">
                        <ResponsiveContainer width="100%" height={450}>
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
                            
                            {/* NATO Lines */}
                            {visibleDomains.joint && (
                              <Line 
                                type="monotone" 
                                dataKey="nato_joint" 
                                stroke={domainColors.joint.color} 
                                name="NATO Joint"
                                strokeWidth={3}
                              />
                            )}
                            {visibleDomains.economy && (
                              <Line 
                                type="monotone" 
                                dataKey="nato_economy" 
                                stroke={domainColors.economy.color} 
                                name="NATO Economy"
                                strokeWidth={3}
                              />
                            )}
                            {visibleDomains.cognitive && (
                              <Line 
                                type="monotone" 
                                dataKey="nato_cognitive" 
                                stroke={domainColors.cognitive.color} 
                                name="NATO Cognitive"
                                strokeWidth={3}
                              />
                            )}
                            {visibleDomains.space && (
                              <Line 
                                type="monotone" 
                                dataKey="nato_space" 
                                stroke={domainColors.space.color} 
                                name="NATO Space"
                                strokeWidth={3}
                              />
                            )}
                            {visibleDomains.cyber && (
                              <Line 
                                type="monotone" 
                                dataKey="nato_cyber" 
                                stroke={domainColors.cyber.color} 
                                name="NATO Cyber"
                                strokeWidth={3}
                              />
                            )}

                            {/* Russia Lines - Dashed */}
                            {showRussia && visibleDomains.joint && (
                              <Line 
                                type="monotone" 
                                dataKey="russia_joint" 
                                stroke={domainColors.joint.color} 
                                name="Russia Joint"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                              />
                            )}
                            {showRussia && visibleDomains.economy && (
                              <Line 
                                type="monotone" 
                                dataKey="russia_economy" 
                                stroke={domainColors.economy.color} 
                                name="Russia Economy"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                              />
                            )}
                            {showRussia && visibleDomains.cognitive && (
                              <Line 
                                type="monotone" 
                                dataKey="russia_cognitive" 
                                stroke={domainColors.cognitive.color} 
                                name="Russia Cognitive"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                              />
                            )}
                            {showRussia && visibleDomains.space && (
                              <Line 
                                type="monotone" 
                                dataKey="russia_space" 
                                stroke={domainColors.space.color} 
                                name="Russia Space"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                              />
                            )}
                            {showRussia && visibleDomains.cyber && (
                              <Line 
                                type="monotone" 
                                dataKey="russia_cyber" 
                                stroke={domainColors.cyber.color} 
                                name="Russia Cyber"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                              />
                            )}
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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


          {/* Defensive/Offensive Statistics Chart Content */}
          {activeSection === 'defense' && (
            <div className="space-y-4" data-testid="defense-offense-stats-content">
              <DefenseOffenseChart forceExpanded={true} hideToggle={true} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}