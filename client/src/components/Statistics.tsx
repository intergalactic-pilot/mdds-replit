import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, TrendingUp } from 'lucide-react';
import { useMDDSStore } from '@/state/store';

const domainColors = {
  joint: 'text-gray-500',
  economy: 'text-green-500',
  cognitive: 'text-purple-500',
  space: 'text-blue-500',
  cyber: 'text-yellow-500'
} as const;

export default function Statistics() {
  const [isExpanded, setIsExpanded] = useState(false);
  const turnStatistics = useMDDSStore(state => state.turnStatistics);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="glass-card border border-border/50">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 hover-elevate transition-all duration-300 text-left"
        data-testid="button-toggle-statistics"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Statistics</h2>
          <span className="text-sm text-muted-foreground">
            ({turnStatistics.length} turn{turnStatistics.length !== 1 ? 's' : ''})
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
        <div className="border-t border-border/50 p-4 space-y-4" data-testid="statistics-content">
          {turnStatistics.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No statistics available yet.</p>
          ) : (
            <div className="space-y-6">
              {/* Statistics Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 font-medium">Turn</th>
                      <th className="text-center py-2 px-3 font-medium text-blue-400">NATO Total</th>
                      <th className="text-center py-2 px-3 font-medium text-red-400">Russia Total</th>
                      <th className="text-center py-2 px-3 font-medium">Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnStatistics.map((stat, index) => {
                      const advantage = stat.natoTotalDeterrence - stat.russiaTotalDeterrence;
                      const advantageColor = advantage > 0 ? 'text-blue-400' : advantage < 0 ? 'text-red-400' : 'text-muted-foreground';
                      
                      return (
                        <tr key={index} className="border-b border-border/20">
                          <td className="py-2 px-3 font-medium" data-testid={`turn-${stat.turn}`}>
                            Turn {stat.turn}
                          </td>
                          <td className="text-center py-2 px-3 text-blue-400 font-semibold" data-testid={`nato-total-${stat.turn}`}>
                            {stat.natoTotalDeterrence}
                          </td>
                          <td className="text-center py-2 px-3 text-red-400 font-semibold" data-testid={`russia-total-${stat.turn}`}>
                            {stat.russiaTotalDeterrence}
                          </td>
                          <td className={`text-center py-2 px-3 font-semibold ${advantageColor}`} data-testid={`advantage-${stat.turn}`}>
                            {advantage > 0 ? `+${advantage}` : advantage}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Domain Breakdown for Latest Turn */}
              {turnStatistics.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Latest Turn Domain Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {Object.entries(turnStatistics[turnStatistics.length - 1].natoDeterrence).map(([domain, natoValue]) => {
                      const russiaValue = turnStatistics[turnStatistics.length - 1].russiaDeterrence[domain as keyof typeof turnStatistics[number]['russiaDeterrence']];
                      const domainAdvantage = natoValue - russiaValue;
                      
                      return (
                        <div key={domain} className="glass-panel p-3 text-center" data-testid={`domain-breakdown-${domain}`}>
                          <h4 className={`font-medium capitalize text-xs mb-2 ${domainColors[domain as keyof typeof domainColors]}`}>
                            {domain}
                          </h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-blue-400">NATO:</span>
                              <span className="font-semibold">{natoValue}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-400">Russia:</span>
                              <span className="font-semibold">{russiaValue}</span>
                            </div>
                            <div className="pt-1 border-t border-border/30">
                              <div className={`font-semibold ${
                                domainAdvantage > 0 ? 'text-blue-400' : 
                                domainAdvantage < 0 ? 'text-red-400' : 
                                'text-muted-foreground'
                              }`}>
                                {domainAdvantage > 0 ? `+${domainAdvantage}` : domainAdvantage}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}