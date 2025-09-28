import { useMDDSStore } from '@/state/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Domain } from '@shared/schema';

const domainColors = {
  joint: { color: '#9CA3AF', bgClass: 'bg-gray-500/20', textClass: 'text-gray-500' },
  economy: { color: '#10B981', bgClass: 'bg-green-500/20', textClass: 'text-green-500' },
  cognitive: { color: '#8B5CF6', bgClass: 'bg-purple-500/20', textClass: 'text-purple-500' },
  space: { color: '#3B82F6', bgClass: 'bg-blue-500/20', textClass: 'text-blue-500' },
  cyber: { color: '#F59E0B', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-500' }
} as const;

interface TeamDomainStatisticsProps {
  team: 'NATO' | 'Russia';
}

export default function TeamDomainStatistics({ team }: TeamDomainStatisticsProps) {
  const turnStatistics = useMDDSStore(state => state.turnStatistics);
  const teamColor = team === 'NATO' ? '#3B82F6' : '#EF4444';
  const teamColorClass = team === 'NATO' ? 'text-blue-600' : 'text-red-600';

  // Only show if we have 2+ turns of data
  if (turnStatistics.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Insufficient data for analytics</p>
        <p className="text-xs">At least 2 turns of data required</p>
      </div>
    );
  }

  // Prepare team-specific chart data
  const teamChartData = turnStatistics.map(stat => {
    const deterrence = team === 'NATO' ? stat.natoDeterrence : stat.russiaDeterrence;
    return {
      turn: stat.turn,
      joint: deterrence.joint,
      economy: deterrence.economy,
      cognitive: deterrence.cognitive,
      space: deterrence.space,
      cyber: deterrence.cyber,
      total: Object.values(deterrence).reduce((sum, value) => sum + value, 0)
    };
  });

  // Get current (latest) values for this team
  const latestStats = turnStatistics[turnStatistics.length - 1];
  const currentDeterrence = team === 'NATO' ? latestStats.natoDeterrence : latestStats.russiaDeterrence;

  return (
    <div className="space-y-6">
      {/* Domain Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(domainColors).map(([domain, config]) => {
          const value = currentDeterrence[domain as Domain];
          const change = turnStatistics.length > 1 
            ? value - (team === 'NATO' 
                ? turnStatistics[turnStatistics.length - 2].natoDeterrence[domain as Domain]
                : turnStatistics[turnStatistics.length - 2].russiaDeterrence[domain as Domain])
            : 0;
          
          return (
            <Card key={domain} className="text-center">
              <CardContent className="p-4">
                <Badge className={`${config.bgClass} ${config.textClass} mb-2`}>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </Badge>
                <div className={`text-2xl font-bold ${teamColorClass}`}>
                  {value}
                </div>
                {change !== 0 && (
                  <div className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change > 0 ? '+' : ''}{change}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Team Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className={`${teamColorClass}`}>
            {team} Domain Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <RechartsLineChart data={teamChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="turn" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                
                {/* Domain lines */}
                <Line 
                  type="monotone" 
                  dataKey="joint" 
                  stroke={domainColors.joint.color}
                  strokeWidth={2}
                  name="Joint"
                />
                <Line 
                  type="monotone" 
                  dataKey="economy" 
                  stroke={domainColors.economy.color}
                  strokeWidth={2}
                  name="Economy"
                />
                <Line 
                  type="monotone" 
                  dataKey="cognitive" 
                  stroke={domainColors.cognitive.color}
                  strokeWidth={2}
                  name="Cognitive"
                />
                <Line 
                  type="monotone" 
                  dataKey="space" 
                  stroke={domainColors.space.color}
                  strokeWidth={2}
                  name="Space"
                />
                <Line 
                  type="monotone" 
                  dataKey="cyber" 
                  stroke={domainColors.cyber.color}
                  strokeWidth={2}
                  name="Cyber"
                />
                
                {/* Total deterrence line */}
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={teamColor}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Total Deterrence"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Domain Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className={teamColorClass}>Domain Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 font-medium">Domain</th>
                  <th className="text-center py-2 px-3 font-medium">Current</th>
                  <th className="text-center py-2 px-3 font-medium">Previous</th>
                  <th className="text-center py-2 px-3 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(domainColors).map(([domain, config]) => {
                  const currentValue = currentDeterrence[domain as Domain];
                  const previousValue = turnStatistics.length > 1 
                    ? (team === 'NATO' 
                        ? turnStatistics[turnStatistics.length - 2].natoDeterrence[domain as Domain]
                        : turnStatistics[turnStatistics.length - 2].russiaDeterrence[domain as Domain])
                    : currentValue;
                  const change = currentValue - previousValue;
                  
                  return (
                    <tr key={domain} className="border-b border-border/20">
                      <td className="py-2 px-3">
                        <Badge className={`${config.bgClass} ${config.textClass}`}>
                          {domain.charAt(0).toUpperCase() + domain.slice(1)}
                        </Badge>
                      </td>
                      <td className={`text-center py-2 px-3 font-semibold ${teamColorClass}`}>
                        {currentValue}
                      </td>
                      <td className="text-center py-2 px-3 text-muted-foreground">
                        {previousValue}
                      </td>
                      <td className={`text-center py-2 px-3 font-semibold ${
                        change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {change > 0 ? '+' : ''}{change}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}