import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Sword, BarChart3 } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Domain } from '@shared/schema';

const domainColors = {
  joint: { color: '#9CA3AF', bgClass: 'bg-gray-500/20', textClass: 'text-gray-500' },
  economy: { color: '#10B981', bgClass: 'bg-green-500/20', textClass: 'text-green-500' },
  cognitive: { color: '#8B5CF6', bgClass: 'bg-purple-500/20', textClass: 'text-purple-500' },
  space: { color: '#3B82F6', bgClass: 'bg-blue-500/20', textClass: 'text-blue-500' },
  cyber: { color: '#F59E0B', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-500' }
} as const;

type StatisticMode = 'defense' | 'offense' | 'both';
type TeamFilter = 'NATO' | 'Russia' | 'both';

export default function DefenseOffenseStatistics() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<StatisticMode>('both');
  const [selectedTeam, setSelectedTeam] = useState<TeamFilter>('both');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  
  const store = useMDDSStore();
  const { teams } = store;

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Calculate defense and offense statistics
  const getDefenseOffenseData = () => {
    const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
    
    return domains.map(domain => {
      const natoDefense = teams.NATO.deterrence[domain];
      const russiaDefense = teams.Russia.deterrence[domain];
      
      // Offense = How much damage dealt to opponent (100 - opponent's current deterrence)
      const natoOffense = 100 - russiaDefense;
      const russiaOffense = 100 - natoDefense;
      
      return {
        domain,
        natoDefense,
        russiaDefense,
        natoOffense,
        russiaOffense,
        domainCapitalized: domain.charAt(0).toUpperCase() + domain.slice(1)
      };
    });
  };

  const chartData = getDefenseOffenseData();

  // Filter data based on selected domain
  const filteredData = selectedDomain 
    ? chartData.filter(item => item.domain === selectedDomain)
    : chartData;

  // Get data keys based on selected mode and team
  const getDataKeys = () => {
    const keys = [];
    
    if (selectedMode === 'defense' || selectedMode === 'both') {
      if (selectedTeam === 'NATO' || selectedTeam === 'both') {
        keys.push({ key: 'natoDefense', name: 'NATO Defense', color: '#3B82F6' });
      }
      if (selectedTeam === 'Russia' || selectedTeam === 'both') {
        keys.push({ key: 'russiaDefense', name: 'Russia Defense', color: '#EF4444' });
      }
    }
    
    if (selectedMode === 'offense' || selectedMode === 'both') {
      if (selectedTeam === 'NATO' || selectedTeam === 'both') {
        keys.push({ key: 'natoOffense', name: 'NATO Offense', color: '#06B6D4' });
      }
      if (selectedTeam === 'Russia' || selectedTeam === 'both') {
        keys.push({ key: 'russiaOffense', name: 'Russia Offense', color: '#F97316' });
      }
    }
    
    return keys;
  };

  const dataKeys = getDataKeys();

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
          
          {/* Control Panel */}
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Statistics Mode</h3>
              <div className="flex gap-2">
                {[
                  { mode: 'defense' as StatisticMode, icon: Shield, label: 'Defense Only' },
                  { mode: 'offense' as StatisticMode, icon: Sword, label: 'Offense Only' },
                  { mode: 'both' as StatisticMode, icon: BarChart3, label: 'Both' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 hover-elevate ${
                      selectedMode === mode
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border/50 hover:border-border text-muted-foreground'
                    }`}
                    data-testid={`button-mode-${mode}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Team Filter</h3>
              <div className="flex gap-2">
                {[
                  { team: 'NATO' as TeamFilter, label: 'NATO Only', color: 'text-blue-400' },
                  { team: 'Russia' as TeamFilter, label: 'Russia Only', color: 'text-red-400' },
                  { team: 'both' as TeamFilter, label: 'Both Teams', color: 'text-muted-foreground' }
                ].map(({ team, label, color }) => (
                  <button
                    key={team}
                    onClick={() => setSelectedTeam(team)}
                    className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 hover-elevate ${
                      selectedTeam === team
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-border/50 hover:border-border text-muted-foreground'
                    }`}
                    data-testid={`button-team-${team}`}
                  >
                    <span className={selectedTeam !== team ? '' : color}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Domain Selection */}
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
                        ? `${config.bgClass} border-current ${config.textClass}`
                        : 'border-border/50 hover:border-border text-muted-foreground'
                    }`}
                    data-testid={`button-domain-${domain}`}
                  >
                    <span className="capitalize">{domain}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Chart */}
          <div className="glass-panel p-4">
            <h4 className="text-sm font-semibold mb-4">
              {selectedMode === 'defense' ? 'Defense Statistics' : 
               selectedMode === 'offense' ? 'Offense Statistics' : 
               'Defense & Offense Statistics'}
              {selectedDomain && ` - ${selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Domain`}
            </h4>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="domainCapitalized" 
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
                {dataKeys.map(({ key, name, color }) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    fill={color} 
                    name={name}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="glass-panel p-4">
            <h4 className="text-sm font-semibold mb-3">Detailed Statistics</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 font-medium">Domain</th>
                    {(selectedTeam === 'NATO' || selectedTeam === 'both') && (
                      <>
                        {(selectedMode === 'defense' || selectedMode === 'both') && (
                          <th className="text-center py-2 px-3 font-medium text-blue-400">NATO Defense</th>
                        )}
                        {(selectedMode === 'offense' || selectedMode === 'both') && (
                          <th className="text-center py-2 px-3 font-medium text-cyan-400">NATO Offense</th>
                        )}
                      </>
                    )}
                    {(selectedTeam === 'Russia' || selectedTeam === 'both') && (
                      <>
                        {(selectedMode === 'defense' || selectedMode === 'both') && (
                          <th className="text-center py-2 px-3 font-medium text-red-400">Russia Defense</th>
                        )}
                        {(selectedMode === 'offense' || selectedMode === 'both') && (
                          <th className="text-center py-2 px-3 font-medium text-orange-400">Russia Offense</th>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((data) => (
                    <tr key={data.domain} className="border-b border-border/20">
                      <td className={`py-2 px-3 font-medium capitalize ${domainColors[data.domain].textClass}`}>
                        {data.domain}
                      </td>
                      {(selectedTeam === 'NATO' || selectedTeam === 'both') && (
                        <>
                          {(selectedMode === 'defense' || selectedMode === 'both') && (
                            <td className="text-center py-2 px-3 text-blue-400 font-semibold">
                              {data.natoDefense}
                            </td>
                          )}
                          {(selectedMode === 'offense' || selectedMode === 'both') && (
                            <td className="text-center py-2 px-3 text-cyan-400 font-semibold">
                              {data.natoOffense}
                            </td>
                          )}
                        </>
                      )}
                      {(selectedTeam === 'Russia' || selectedTeam === 'both') && (
                        <>
                          {(selectedMode === 'defense' || selectedMode === 'both') && (
                            <td className="text-center py-2 px-3 text-red-400 font-semibold">
                              {data.russiaDefense}
                            </td>
                          )}
                          {(selectedMode === 'offense' || selectedMode === 'both') && (
                            <td className="text-center py-2 px-3 text-orange-400 font-semibold">
                              {data.russiaOffense}
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend/Explanation */}
          <div className="glass-panel p-4 bg-muted/20">
            <h4 className="text-sm font-semibold mb-2">Statistics Explanation</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong className="text-blue-400">Defense:</strong> Current deterrence level in each domain (higher = better protected)</p>
              <p><strong className="text-cyan-400/text-orange-400">Offense:</strong> Impact dealt to opponent's deterrence (100 - opponent's current deterrence)</p>
              <p><strong>Domains:</strong> Joint, Economy, Cognitive, Space, Cyber - click to filter</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}