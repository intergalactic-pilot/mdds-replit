import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Sword, Eye, EyeOff, Activity, Target } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Domain } from '@shared/schema';

const domainColors = {
  joint: { color: '#9CA3AF', textClass: 'text-gray-500' },
  economy: { color: '#10B981', textClass: 'text-green-500' },
  cognitive: { color: '#8B5CF6', textClass: 'text-purple-500' },
  space: { color: '#3B82F6', textClass: 'text-blue-500' },
  cyber: { color: '#F59E0B', textClass: 'text-yellow-500' }
} as const;

export default function DefenseOffenseChart() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNATO, setShowNATO] = useState(true);
  const [showRussia, setShowRussia] = useState(true);
  const [selectedView, setSelectedView] = useState<'defense' | 'offense' | 'both'>('both');
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

  // Prepare chart data for defense and offense
  const chartData = turnStatistics.map(stat => {
    const dataPoint: any = { turn: stat.turn };
    
    // Add defense data (each team's own deterrence)
    if (selectedView === 'defense' || selectedView === 'both') {
      Object.keys(stat.natoDeterrence).forEach(domain => {
        const domainKey = domain as Domain;
        if (visibleDomains[domainKey]) {
          if (showNATO) {
            dataPoint[`NATO_Defense_${domain}`] = stat.natoDeterrence[domainKey];
          }
          if (showRussia) {
            dataPoint[`Russia_Defense_${domain}`] = stat.russiaDeterrence[domainKey];
          }
        }
      });
    }
    
    // Add offense data (impact on opponent: 100 - opponent's deterrence)
    if (selectedView === 'offense' || selectedView === 'both') {
      Object.keys(stat.natoDeterrence).forEach(domain => {
        const domainKey = domain as Domain;
        if (visibleDomains[domainKey]) {
          if (showNATO) {
            dataPoint[`NATO_Offense_${domain}`] = 100 - stat.russiaDeterrence[domainKey];
          }
          if (showRussia) {
            dataPoint[`Russia_Offense_${domain}`] = 100 - stat.natoDeterrence[domainKey];
          }
        }
      });
    }
    
    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border border-border/50">
          <p className="font-semibold mb-2">{`Turn ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            const [team, type, domain] = entry.dataKey.split('_');
            const color = domainColors[domain as Domain]?.color || '#666';
            const Icon = type === 'Defense' ? Shield : Sword;
            return (
              <p key={index} style={{ color }} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {team} {type} ({domain}): {entry.value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-3 glass-panel hover-elevate transition-all duration-300 text-left"
        data-testid="button-toggle-defense-offense-chart"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-blue-500" />
            <Sword className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-semibold">Defensive/Offensive Statistics Chart</h3>
          <span className="text-sm text-muted-foreground">
            (Interactive trends)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-4">
          {/* Interactive Controls */}
          <div className="flex flex-wrap gap-4 p-3 glass-panel">
            {/* View Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View:</span>
              <div className="flex gap-1">
                {(['defense', 'offense', 'both'] as const).map(view => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedView === view
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                    data-testid={`button-view-${view}`}
                  >
                    {view === 'defense' ? (
                      <><Shield className="w-3 h-3" /> Defense</>
                    ) : view === 'offense' ? (
                      <><Sword className="w-3 h-3" /> Offense</>
                    ) : (
                      <><Activity className="w-3 h-3" /> Both</>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Visibility */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Teams:</span>
              <button
                onClick={() => setShowNATO(!showNATO)}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                  showNATO ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary/50'
                }`}
                data-testid="button-toggle-nato"
              >
                {showNATO ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                NATO
              </button>
              <button
                onClick={() => setShowRussia(!showRussia)}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                  showRussia ? 'bg-red-500/20 text-red-400' : 'bg-secondary/50'
                }`}
                data-testid="button-toggle-russia"
              >
                {showRussia ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                Russia
              </button>
            </div>
          </div>

          {/* Domain Filter Controls */}
          <div className="p-3 glass-panel">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Domains:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(domainColors) as Domain[]).map(domain => (
                <button
                  key={domain}
                  onClick={() => toggleDomainVisibility(domain)}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                    visibleDomains[domain]
                      ? `${domainColors[domain].textClass} bg-current/20`
                      : 'bg-secondary/50 text-muted-foreground'
                  }`}
                  data-testid={`button-toggle-domain-${domain}`}
                >
                  {visibleDomains[domain] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="turn" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Defense Lines */}
                {(selectedView === 'defense' || selectedView === 'both') && 
                  Object.keys(domainColors).map(domain => {
                    if (!visibleDomains[domain as Domain]) return null;
                    const color = domainColors[domain as Domain].color;
                    return [
                      showNATO && (
                        <Line
                          key={`NATO_Defense_${domain}`}
                          type="monotone"
                          dataKey={`NATO_Defense_${domain}`}
                          stroke={color}
                          strokeWidth={2}
                          strokeDasharray="none"
                          dot={{ fill: color, strokeWidth: 1, r: 3 }}
                          name={`NATO Defense (${domain})`}
                        />
                      ),
                      showRussia && (
                        <Line
                          key={`Russia_Defense_${domain}`}
                          type="monotone"
                          dataKey={`Russia_Defense_${domain}`}
                          stroke={color}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: color, strokeWidth: 1, r: 3 }}
                          name={`Russia Defense (${domain})`}
                        />
                      )
                    ];
                  }).flat()}

                {/* Offense Lines */}
                {(selectedView === 'offense' || selectedView === 'both') && 
                  Object.keys(domainColors).map(domain => {
                    if (!visibleDomains[domain as Domain]) return null;
                    const color = domainColors[domain as Domain].color;
                    return [
                      showNATO && (
                        <Line
                          key={`NATO_Offense_${domain}`}
                          type="monotone"
                          dataKey={`NATO_Offense_${domain}`}
                          stroke={color}
                          strokeWidth={2}
                          strokeDasharray="2 2"
                          dot={{ fill: color, strokeWidth: 1, r: 3 }}
                          name={`NATO Offense (${domain})`}
                        />
                      ),
                      showRussia && (
                        <Line
                          key={`Russia_Offense_${domain}`}
                          type="monotone"
                          dataKey={`Russia_Offense_${domain}`}
                          stroke={color}
                          strokeWidth={2}
                          strokeDasharray="8 2"
                          dot={{ fill: color, strokeWidth: 1, r: 3 }}
                          name={`Russia Offense (${domain})`}
                        />
                      )
                    ];
                  }).flat()}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend Explanation */}
          <div className="text-xs text-muted-foreground p-3 glass-panel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <strong>Defense:</strong> Team's own deterrence values (solid lines for NATO, dashed for Russia)
              </div>
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3" />
                <strong>Offense:</strong> Impact on opponent (dotted lines for NATO, dash-dot for Russia)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}