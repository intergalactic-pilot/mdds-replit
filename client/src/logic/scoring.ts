import { Card, CardEffect, Domain, TeamState } from '@shared/schema';

// Apply card effects to deterrence values
export function applyCardEffects(
  card: Card,
  buyerTeam: TeamState,
  opponentTeam: TeamState
): { buyer: TeamState; opponent: TeamState } {
  if (!card.effects || card.type !== 'asset') {
    return { buyer: buyerTeam, opponent: opponentTeam };
  }

  const newBuyer = { ...buyerTeam };
  const newOpponent = { ...opponentTeam };

  for (const effect of card.effects) {
    if (effect.target === 'self') {
      // Apply effect to buyer
      newBuyer.deterrence[effect.domain] = Math.max(
        0, 
        newBuyer.deterrence[effect.domain] + effect.delta
      );
    } else {
      // Apply effect to opponent
      newOpponent.deterrence[effect.domain] = Math.max(
        0,
        newOpponent.deterrence[effect.domain] + effect.delta
      );
    }
  }

  // Recalculate total deterrence
  newBuyer.totalDeterrence = calculateTotalDeterrence(newBuyer.deterrence);
  newOpponent.totalDeterrence = calculateTotalDeterrence(newOpponent.deterrence);

  return { buyer: newBuyer, opponent: newOpponent };
}

// Calculate total deterrence from all domains
export function calculateTotalDeterrence(deterrence: Record<Domain, number>): number {
  return Object.values(deterrence).reduce((sum, value) => sum + value, 0);
}

// Initialize default deterrence values
export function getInitialDeterrence(): Record<Domain, number> {
  return {
    joint: 100,
    economy: 100,
    cognitive: 100,
    space: 100,
    cyber: 100
  };
}

// Calculate deterrence delta between two states
export function calculateDeterrenceDelta(
  before: Record<Domain, number>,
  after: Record<Domain, number>
): Record<Domain, number> {
  const delta: Record<Domain, number> = {} as Record<Domain, number>;
  
  for (const domain of Object.keys(before) as Domain[]) {
    delta[domain] = after[domain] - before[domain];
  }
  
  return delta;
}