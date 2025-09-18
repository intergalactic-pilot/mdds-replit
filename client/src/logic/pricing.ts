import { Card, TeamState } from '@shared/schema';

// Calculate discounted price for a card based on owned permanents
export function calculateDiscountedPrice(
  card: Card, 
  ownedPermanents: Card[]
): number {
  let totalDiscount = 0;
  
  // Check each permanent for discounts that apply to this card
  for (const permanent of ownedPermanents) {
    if (permanent.permanentMods?.appliesToCardIds.includes(card.id)) {
      totalDiscount += permanent.permanentMods.flatDiscountK;
    }
  }
  
  // Price cannot go below 0
  return Math.max(0, card.baseCostK - totalDiscount);
}

// Calculate total cart cost with discounts applied
export function calculateCartTotal(
  cart: Card[], 
  ownedPermanents: Card[]
): number {
  return cart.reduce((total, card) => {
    return total + calculateDiscountedPrice(card, ownedPermanents);
  }, 0);
}

// Check if team can afford the cart
export function canAffordCart(
  cart: Card[], 
  teamState: TeamState
): boolean {
  const cartTotal = calculateCartTotal(cart, teamState.ownedPermanents);
  return teamState.budget >= cartTotal;
}

// Format currency display
export function formatCurrency(amount: number): string {
  return `${amount}K`;
}