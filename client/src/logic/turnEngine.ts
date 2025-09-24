import { GameState, Team, Card, TeamState } from '@shared/schema';
import { calculateDiscountedPrice, calculateCartTotal } from './pricing';
import { applyCardEffects } from './scoring';

// Validate turn 1 domain restrictions (200K per domain)
export function validateTurn1Restrictions(
  cart: Card[], 
  team: TeamState
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const domainTotals = { joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0 };
  
  // Calculate spending per domain
  for (const card of cart) {
    const cost = calculateDiscountedPrice(card, team.ownedPermanents);
    domainTotals[card.domain] += cost;
  }
  
  // Check each domain has exactly 200K
  for (const [domain, total] of Object.entries(domainTotals)) {
    if (total !== 200) {
      errors.push(`${domain} domain must have exactly 200K (currently ${total}K)`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Validate turn 2+ budget restrictions (1000K pooled)
export function validatePooledBudget(
  cart: Card[], 
  team: TeamState
): { valid: boolean; errors: string[] } {
  const total = calculateCartTotal(cart, team.ownedPermanents);
  const valid = total <= team.budget;
  
  return {
    valid,
    errors: valid ? [] : [`Total cost ${total}K exceeds budget ${team.budget}K`]
  };
}

// Process card purchases and apply effects
export function commitPurchases(
  gameState: GameState,
  team: Team
): GameState {
  const newGameState = { ...gameState };
  const teamState = newGameState.teams[team];
  const opponentTeam = team === 'NATO' ? 'Russia' : 'NATO';
  const opponentState = newGameState.teams[opponentTeam];
  
  // Calculate costs with discounts
  const totalCost = calculateCartTotal(teamState.cart, teamState.ownedPermanents);
  
  // Deduct budget
  teamState.budget -= totalCost;
  
  // Process each card in cart
  for (const card of teamState.cart) {
    const cardPrice = calculateDiscountedPrice(card, teamState.ownedPermanents);
    
    // Track card purchase for availability logic (initialize if doesn't exist)
    if (!teamState.recentPurchases) {
      teamState.recentPurchases = [];
    }
    teamState.recentPurchases.push({
      cardId: card.id,
      purchasedTurn: gameState.turn
    });
    
    // Log individual card purchase
    newGameState.strategyLog.push({
      turn: gameState.turn,
      team,
      action: `${team} purchased ${card.name} (${card.id}) for ${cardPrice}K`,
      timestamp: new Date()
    });
    
    switch (card.type) {
      case 'asset':
        // Apply immediate effects
        const { buyer, opponent } = applyCardEffects(card, teamState, opponentState);
        newGameState.teams[team] = buyer;
        newGameState.teams[opponentTeam] = opponent;
        break;
        
      case 'permanent':
        // Queue for next turn (permanent discounts activate next turn)
        teamState.permanentsQueue.push({
          card,
          availableTurn: gameState.turn + 1
        });
        break;
        
      case 'expert':
        // Queue for next turn
        teamState.expertsQueue.push({
          card,
          availableTurn: gameState.turn + 1
        });
        break;
    }
  }
  
  // Clear cart (must be done AFTER applying effects to avoid being overwritten)
  newGameState.teams[team].cart = [];
  
  // Add to strategy log
  newGameState.strategyLog.push({
    turn: gameState.turn,
    team,
    action: `Committed purchases: total cost ${totalCost}K`,
    timestamp: new Date()
  });
  
  return newGameState;
}

// Check if a card is available for purchase by a team (not purchased in previous turn)
export function isCardAvailable(cardId: string, team: string, currentTurn: number, teamState: any): boolean {
  // Initialize recentPurchases if it doesn't exist (for migration compatibility)
  if (!teamState.recentPurchases) {
    return true; // If no purchase history, card is available
  }
  
  // Check if this team purchased this card in the previous turn
  const recentPurchase = teamState.recentPurchases.find(
    (purchase: any) => purchase.cardId === cardId && purchase.purchasedTurn === currentTurn - 1
  );
  
  return !recentPurchase; // Available if NOT recently purchased
}

// Advance to next turn
export function advanceTurn(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  
  // Increment turn
  newGameState.turn += 1;
  
  // Activate permanents and experts that are now available
  for (const team of ['NATO', 'Russia'] as Team[]) {
    const teamState = newGameState.teams[team];
    
    // Activate permanents
    teamState.permanentsQueue = teamState.permanentsQueue.filter(permanent => {
      if (permanent.availableTurn <= newGameState.turn) {
        // Permanent becomes active (provides discounts)
        teamState.ownedPermanents.push(permanent.card);
        newGameState.strategyLog.push({
          turn: newGameState.turn,
          team,
          action: `Permanent activated: ${permanent.card.name} (${permanent.card.id}) - discounts now available`,
          timestamp: new Date()
        });
        return false; // Remove from queue
      }
      return true; // Keep in queue
    });
    
    // Activate experts
    teamState.expertsQueue = teamState.expertsQueue.filter(expert => {
      if (expert.availableTurn <= newGameState.turn) {
        // Expert becomes active (informational only)
        newGameState.strategyLog.push({
          turn: newGameState.turn,
          team,
          action: `Expert activated: ${expert.card.name} (informational)`,
          timestamp: new Date()
        });
        return false; // Remove from queue
      }
      return true; // Keep in queue
    });
  }
  
  // Provide fresh budget only for turn 2 (transition from domain-restricted to pooled budget)
  if (newGameState.turn === 2) {
    // Turn 2: Give fresh 1000K pooled budget to both teams
    newGameState.teams.NATO.budget = 1000;
    newGameState.teams.Russia.budget = 1000;
  }
  // Turn 3+: Teams keep whatever budget they have remaining (no reset)
  
  return newGameState;
}