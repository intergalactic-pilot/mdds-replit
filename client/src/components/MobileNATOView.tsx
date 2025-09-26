import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMDDSStore } from '@/state/store';
import DomainBadge from './DomainBadge';
import { Domain } from '@shared/schema';

export default function MobileNATOView() {
  const sessionInfo = useMDDSStore(state => state.sessionInfo);
  const natoTeam = useMDDSStore(state => state.teams.NATO);
  
  const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Session Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center text-blue-600">NATO Strategy</CardTitle>
          <p className="text-center text-sm text-muted-foreground">{sessionInfo.sessionName}</p>
        </CardHeader>
      </Card>

      {/* Total Deterrence */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Total Deterrence Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{natoTeam.totalDeterrence}</div>
            <p className="text-sm text-muted-foreground">NATO Total</p>
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold">{natoTeam.budget}K</div>
            <p className="text-sm text-muted-foreground">Available Budget</p>
          </div>
        </CardContent>
      </Card>

      {/* Dimensional Deterrence */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dimensional Deterrence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domains.map((domain) => (
            <div key={domain} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DomainBadge domain={domain} />
                <span className="text-sm capitalize">{domain}</span>
              </div>
              <Badge variant="outline" className="text-blue-600">
                {natoTeam.deterrence[domain]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cart Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{natoTeam.cart.length}</div>
            <p className="text-sm text-muted-foreground">Cards in Cart</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}