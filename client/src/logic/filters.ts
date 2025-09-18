import { Card, Domain } from '@shared/schema';

// Domain quotas enforcement
export function applyDomainQuotas(cards: Card[]): Card[] {
  const quotas: Record<Domain, number> = {
    economy: 10,
    cyber: 11, 
    joint: 9,
    space: 10,
    cognitive: 13
  };

  const byDomain: Record<Domain, Card[]> = {
    economy: [],
    cyber: [],
    joint: [],
    space: [],
    cognitive: []
  };

  // Group cards by domain
  for (const card of cards) {
    byDomain[card.domain].push(card);
  }

  const kept: Card[] = [];
  
  // Apply quotas for each domain
  for (const domain of Object.keys(byDomain) as Domain[]) {
    const domainCards = byDomain[domain];
    
    // Sort by numeric part of ID (e.g., J1, J2, ...)
    const sorted = domainCards.slice().sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    
    // Keep only the quota amount
    kept.push(...sorted.slice(0, quotas[domain]));
  }

  return kept;
}

// Infer domain from card ID prefix
export function inferDomainFromId(id: string): Domain {
  const prefix = id.match(/^[A-Z]+/)?.[0] || '';
  
  switch (prefix) {
    case 'E': return 'economy';
    case 'CY': return 'cyber';
    case 'CG': return 'cognitive';
    case 'S': return 'space';
    case 'J': return 'joint';
    default: throw new Error(`Unknown domain prefix in card ID: ${id}`);
  }
}