import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Sword, Eye, EyeOff } from 'lucide-react';
import { useMDDSStore } from '@/state/store';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Domain, Card } from '@shared/schema';
import cardsData from '../data/cards.json';

const domainColors = {
  joint: { color: '#9CA3AF', textClass: 'text-gray-500' },
  economy: { color: '#10B981', textClass: 'text-green-500' },
  cognitive: { color: '#8B5CF6', textClass: 'text-purple-500' },
  space: { color: '#3B82F6', textClass: 'text-blue-500' },
  cyber: { color: '#F59E0B', textClass: 'text-yellow-500' }
} as const;

interface IndividualChartProps {
  title: string;
  team: 'NATO' | 'Russia';
  type: 'Defense' | 'Offense';
  data: any[];
  visibleDomains: Record<Domain, boolean>;
  onToggleDomain: (domain: Domain) => void;
  bgClass: string;
}

function IndividualChart({ title, team, type, data, visibleDomains, onToggleDomain, bgClass }: IndividualChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border border-border/50">
          <p className="font-semibold mb-2">{`Turn ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            const domain = entry.dataKey;
            const color = domainColors[domain as Domain]?.color || '#666';
            const Icon = type === 'Defense' ? Shield : Sword;
            return (
              <p key={index} style={{ color }} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {domain}: {entry.value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${bgClass} p-4 rounded-lg border border-border/50`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">{title}</h4>
        <div className="flex gap-1">
          {(Object.keys(domainColors) as Domain[]).map(domain => (
            <button
              key={domain}
              onClick={() => onToggleDomain(domain)}
              className={`w-3 h-3 rounded-full transition-opacity ${
                visibleDomains[domain] ? 'opacity-100' : 'opacity-30'
              }`}
              style={{ backgroundColor: domainColors[domain].color }}
              title={`Toggle ${domain}`}
              data-testid={`toggle-${team.toLowerCase()}-${type.toLowerCase()}-${domain}`}
            />
          ))}
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis 
              dataKey="turn" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              fontSize={10}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              fontSize={10}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {(Object.keys(domainColors) as Domain[]).map(domain => {
              if (!visibleDomains[domain]) return null;
              const color = domainColors[domain].color;
              return (
                <Line
                  key={domain}
                  type="monotone"
                  dataKey={domain}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 1, r: 2 }}
                  name={domain}
                />
              );
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DefenseOffenseChart() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleDomains, setVisibleDomains] = useState<Record<Domain, boolean>>({
    joint: true,
    economy: true,
    cognitive: true,
    space: true,
    cyber: true
  });
  
  const turnStatistics = useMDDSStore(state => state.turnStatistics);
  const strategyLog = useMDDSStore(state => state.strategyLog);
  
  const cards = cardsData as Card[];

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

  // Prepare data for NATO Defense chart
  const natoDefenseData = turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: stat.natoDeterrence.joint,
    economy: stat.natoDeterrence.economy,
    cognitive: stat.natoDeterrence.cognitive,
    space: stat.natoDeterrence.space,
    cyber: stat.natoDeterrence.cyber
  }));

  // Calculate NATO's effects on Russia's dimensions for each turn
  const calculateNatoEffectsOnRussia = () => {
    const effectsByTurn: Record<number, Record<Domain, number>> = {};
    
    // Initialize all turns with zero effects
    turnStatistics.forEach(stat => {
      effectsByTurn[stat.turn] = {
        joint: 0,
        economy: 0,
        cognitive: 0,
        space: 0,
        cyber: 0
      };
    });
    
    // Process strategy log to find NATO card purchases
    strategyLog.forEach(logEntry => {
      if (logEntry.team === 'NATO' && logEntry.action.includes('purchased')) {
        // Extract card ID from the action string (format: "NATO purchased CardName (ID) for XK")
        const cardIdMatch = logEntry.action.match(/\(([^)]+)\)/);
        if (cardIdMatch) {
          const cardId = cardIdMatch[1];
          const card = cards.find(c => c.id === cardId);
          
          if (card && card.effects) {
            // Sum positive effects on opponent (Russia)
            card.effects.forEach(effect => {
              if (effect.target === 'opponent' && effect.delta > 0) {
                effectsByTurn[logEntry.turn][effect.domain] += effect.delta;
              }
            });
          }
        }
      }
    });
    
    return effectsByTurn;
  };
  
  const natoEffectsOnRussia = calculateNatoEffectsOnRussia();
  
  // Prepare data for NATO Offense chart (showing effects on Russia)
  const natoOffenseData = turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: natoEffectsOnRussia[stat.turn]?.joint || 0,
    economy: natoEffectsOnRussia[stat.turn]?.economy || 0,
    cognitive: natoEffectsOnRussia[stat.turn]?.cognitive || 0,
    space: natoEffectsOnRussia[stat.turn]?.space || 0,
    cyber: natoEffectsOnRussia[stat.turn]?.cyber || 0
  }));

  // Prepare data for Russia Defense chart
  const russiaDefenseData = turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: stat.russiaDeterrence.joint,
    economy: stat.russiaDeterrence.economy,
    cognitive: stat.russiaDeterrence.cognitive,
    space: stat.russiaDeterrence.space,
    cyber: stat.russiaDeterrence.cyber
  }));

  // Prepare data for Russia Offense chart
  const russiaOffenseData = turnStatistics.map(stat => ({
    turn: stat.turn,
    joint: 100 - stat.natoDeterrence.joint,
    economy: 100 - stat.natoDeterrence.economy,
    cognitive: 100 - stat.natoDeterrence.cognitive,
    space: 100 - stat.natoDeterrence.space,
    cyber: 100 - stat.natoDeterrence.cyber
  }));

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
            (Four interactive domain charts)
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
          {/* Global Domain Controls */}
          <div className="p-3 glass-panel">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Domain Visibility (Global):</span>
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
                  data-testid={`button-toggle-global-domain-${domain}`}
                >
                  {visibleDomains[domain] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Four Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* NATO Defense Chart */}
            <IndividualChart
              title="NATO Defensive Strategy"
              team="NATO"
              type="Defense"
              data={natoDefenseData}
              visibleDomains={visibleDomains}
              onToggleDomain={toggleDomainVisibility}
              bgClass="bg-blue-50/5 dark:bg-blue-950/20"
            />
            
            {/* NATO Offense Chart */}
            <IndividualChart
              title="NATO Effects on Russia"
              team="NATO"
              type="Offense"
              data={natoOffenseData}
              visibleDomains={visibleDomains}
              onToggleDomain={toggleDomainVisibility}
              bgClass="bg-blue-50/5 dark:bg-blue-950/20"
            />
            
            {/* Russia Defense Chart */}
            <IndividualChart
              title="Russia Defensive Strategy"
              team="Russia"
              type="Defense"
              data={russiaDefenseData}
              visibleDomains={visibleDomains}
              onToggleDomain={toggleDomainVisibility}
              bgClass="bg-red-50/5 dark:bg-red-950/20"
            />
            
            {/* Russia Offense Chart */}
            <IndividualChart
              title="Russia Offensive Strategy"
              team="Russia"
              type="Offense"
              data={russiaOffenseData}
              visibleDomains={visibleDomains}
              onToggleDomain={toggleDomainVisibility}
              bgClass="bg-red-50/5 dark:bg-red-950/20"
            />
          </div>
          
          {/* Legend */}
          <div className="text-xs text-muted-foreground p-3 glass-panel">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(Object.entries(domainColors) as [Domain, typeof domainColors[Domain]][]).map(([domain, config]) => (
                <div key={domain} className="flex items-center justify-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className={config.textClass}>{domain.charAt(0).toUpperCase() + domain.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}