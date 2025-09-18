import DomainBadge from '../DomainBadge';

export default function DomainBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <DomainBadge domain="joint" />
      <DomainBadge domain="economy" />
      <DomainBadge domain="cognitive" />
      <DomainBadge domain="space" />
      <DomainBadge domain="cyber" />
    </div>
  );
}