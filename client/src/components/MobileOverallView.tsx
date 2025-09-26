import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMDDSStore } from '@/state/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import DomainBadge from './DomainBadge';
import { Domain } from '@shared/schema';

export default function MobileOverallView() {
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const natoTeam = useMDDSStore(state => state.teams.NATO);
  const russiaTeam = useMDDSStore(state => state.teams.Russia);
  const shareSession = useMDDSStore(state => state.shareSession);
  
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];

  // Prepare data for pie chart
  const pieData = [
    {
      name: 'NATO',
      value: natoTeam.totalDeterrence,
      color: '#3b82f6'
    },
    {
      name: 'Russia',
      value: russiaTeam.totalDeterrence,
      color: '#ef4444'
    }
  ];

  // Domain comparison data
  const domainComparison = domains.map(domain => ({
    domain,
    nato: natoTeam.deterrence[domain],
    russia: russiaTeam.deterrence[domain],
    difference: natoTeam.deterrence[domain] - russiaTeam.deterrence[domain]
  }));

  const handleShareSession = async () => {
    setIsSharing(true);
    try {
      const sessionId = await shareSession();
      if (sessionId) {
        const link = `${window.location.origin}/session/${sessionId}`;
        setShareLink(link);
      } else {
        alert('Failed to create shareable link');
      }
    } catch (error) {
      console.error('Error sharing session:', error);
      alert('Failed to create shareable link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Session Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">Overall Comparison</CardTitle>
          <p className="text-center text-sm text-muted-foreground">{sessionInfo.sessionName}</p>
        </CardHeader>
      </Card>

      {/* Share Session */}
      <Card>
        <CardContent className="pt-4">
          {!shareLink ? (
            <Button 
              onClick={handleShareSession}
              disabled={isSharing}
              className="w-full"
              variant="outline"
              data-testid="button-share-session"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isSharing ? 'Creating link...' : 'Share Session'}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Share this link with others:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-muted rounded border"
                  data-testid="input-share-link"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  variant="outline"
                  data-testid="button-copy-link"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {linkCopied && (
                <p className="text-xs text-green-600">Link copied to clipboard!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Total Deterrence Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Score Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Score Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{natoTeam.totalDeterrence}</div>
              <p className="text-sm text-muted-foreground">NATO</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{russiaTeam.totalDeterrence}</div>
              <p className="text-sm text-muted-foreground">Russia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Domain Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domainComparison.map(({ domain, nato, russia, difference }) => (
            <div key={domain} className="space-y-2">
              <div className="flex items-center gap-2">
                <DomainBadge domain={domain} />
                <span className="text-sm capitalize flex-1">{domain}</span>
                <Badge 
                  variant="outline" 
                  className={difference > 0 ? 'text-blue-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}
                >
                  {difference > 0 ? '+' : ''}{difference}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-blue-600">NATO: {nato}</div>
                <div className="text-red-600">Russia: {russia}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}