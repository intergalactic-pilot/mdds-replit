import { useState, useEffect } from 'react';
import { useMDDSStore } from '../state/store';
import { applyDomainQuotas } from '../logic/filters';
import { calculateDiscountedPrice, calculateCartTotal } from '../logic/pricing';
import { validateTurn1Restrictions, validatePooledBudget } from '../logic/turnEngine';
import AppHeader from '../components/AppHeader';
import TeamPanel from '../components/TeamPanel';
import CardShop from '../components/CardShop';
import CardDetailModal from '../components/CardDetailModal';
import { SkipForward } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DeterrenceChart from '../components/DeterrenceChart';
import CartDisplay from '../components/CartDisplay';
import MobileFooter from '../components/MobileFooter';
import Statistics from '../components/Statistics';
import cardsData from '../data/cards.json';
import { Card } from '@shared/schema';

export default function MDDSStrategy() {
  const store = useMDDSStore();
  const [availableCards, setAvailableCards] = useState(applyDomainQuotas(cardsData as Card[]));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update validation errors when cart or turn changes
  useEffect(() => {
    const currentTeamState = store.teams[store.currentTeam];
    
    if (store.turn === 1) {
      const validation = validateTurn1Restrictions(currentTeamState.cart, currentTeamState);
      setValidationErrors(validation.errors);
    } else {
      const validation = validatePooledBudget(currentTeamState.cart, currentTeamState);
      setValidationErrors(validation.errors);
    }
  }, [store.teams, store.currentTeam, store.turn]);

  // Load from localStorage on mount
  useEffect(() => {
    store.loadFromLocalStorage();
  }, []);

  const currentTeamState = store.teams[store.currentTeam];
  const opponentTeam = store.currentTeam === 'NATO' ? 'Russia' : 'NATO';
  const opponentTeamState = store.teams[opponentTeam];

  const getDiscountedPrice = (card: any) => {
    return calculateDiscountedPrice(card, currentTeamState.ownedPermanents);
  };

  const canCommit = currentTeamState.cart.length > 0;
  const canAdvance = store.phase === 'commit' || store.turn >= store.maxTurns;

  const cartTotal = calculateCartTotal(currentTeamState.cart, currentTeamState.ownedPermanents);
  const canAfford = cartTotal <= currentTeamState.budget;

  // Per-team cart calculations for dual cart display
  const natoState = store.teams.NATO;
  const russiaState = store.teams.Russia;
  const priceForNATO = (card: Card) => calculateDiscountedPrice(card, natoState.ownedPermanents);
  const priceForRussia = (card: Card) => calculateDiscountedPrice(card, russiaState.ownedPermanents);
  const natoCartTotal = calculateCartTotal(natoState.cart, natoState.ownedPermanents);
  const russiaCartTotal = calculateCartTotal(russiaState.cart, russiaState.ownedPermanents);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <AppHeader
        currentTurn={store.turn}
        maxTurns={store.maxTurns}
        onSave={() => {
          store.saveToLocalStorage();
          alert('Strategy saved to local storage!');
        }}
        onResetProgress={() => {
          if (confirm('Reset all progress and start a new strategy?')) {
            store.resetStrategy();
          }
        }}
        onSetMaxTurns={(turns) => {
          // Note: This could be enhanced to update the store
          console.log('Set max turns:', turns);
        }}
      />

      <div className="container mx-auto px-4 py-6 max-w-full">
        <div className="space-y-6">
          {/* Deterrence Chart - Full Width */}
          <DeterrenceChart 
            natoTeam={store.teams.NATO}
            russiaTeam={store.teams.Russia}
          />

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-6">
            {/* Left Sidebar - Team Panels */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="space-y-4">
                <div className="glass-panel p-3 lg:p-4">
                  <TeamPanel
                    team={store.currentTeam}
                    teamState={currentTeamState}
                    isActive={true}
                  />
                </div>
                <div className="glass-panel p-3 lg:p-4">
                  <TeamPanel
                    team={opponentTeam}
                    teamState={opponentTeamState}
                  />
                </div>
              </div>
            </div>

            {/* Main Content - Wider */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="space-y-4 lg:space-y-6">
                {/* Card Shop */}
                <div className="glass-card p-3 lg:p-6">
                  <CardShop
                    cards={availableCards}
                    onAddToCart={(card) => store.addToCart(store.currentTeam, card)}
                    onViewDetails={(card) => store.setSelectedCard(card)}
                    cartItems={currentTeamState.cart}
                    getDiscountedPrice={getDiscountedPrice}
                    getNATOPrice={priceForNATO}
                    getRussiaPrice={priceForRussia}
                    disabled={store.phase !== 'purchase'}
                    onAddToNATOCart={(card) => store.addToCart('NATO', card)}
                    onAddToRussiaCart={(card) => store.addToCart('Russia', card)}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar - NATO and Russia Carts */}
            <div className="lg:col-span-2 order-3">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="glass-panel p-3 lg:p-4">
                  <CartDisplay
                    team="NATO"
                    cartItems={natoState.cart}
                    onRemoveFromCart={(cardId) => store.removeFromCart('NATO', cardId)}
                    getDiscountedPrice={priceForNATO}
                    cartTotal={natoCartTotal}
                    onConfirmPurchases={() => {
                      store.commitTeamPurchases('NATO');
                      store.saveToLocalStorage();
                    }}
                    canConfirm={natoState.cart.length > 0 && natoCartTotal <= natoState.budget}
                    budget={natoState.budget}
                  />
                </div>

                <div className="glass-panel p-3 lg:p-4">
                  <CartDisplay
                    team="Russia"
                    cartItems={russiaState.cart}
                    onRemoveFromCart={(cardId) => store.removeFromCart('Russia', cardId)}
                    getDiscountedPrice={priceForRussia}
                    cartTotal={russiaCartTotal}
                    onConfirmPurchases={() => {
                      store.commitTeamPurchases('Russia');
                      store.saveToLocalStorage();
                    }}
                    canConfirm={russiaState.cart.length > 0 && russiaCartTotal <= russiaState.budget}
                    budget={russiaState.budget}
                  />
                </div>

                {/* Finish Turn Button - Hidden on Mobile */}
                <div className="glass-panel p-3 lg:p-4 hidden md:block">
                  <Button
                    onClick={() => {
                      store.advanceGameTurn();
                      store.saveToLocalStorage();
                    }}
                    size="lg"
                    variant="outline"
                    className="w-full"
                    data-testid="button-finish-turn"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Finish Turn {store.turn}/{store.maxTurns}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="mt-6">
          <Statistics />
        </div>
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={store.selectedCard}
        isOpen={!!store.selectedCard}
        onClose={() => store.setSelectedCard(null)}
        onAddToCart={() => {
          if (store.selectedCard) {
            store.addToCart(store.currentTeam, store.selectedCard);
            store.setSelectedCard(null);
          }
        }}
        discountedPrice={store.selectedCard ? getDiscountedPrice(store.selectedCard) : undefined}
        inCart={store.selectedCard ? currentTeamState.cart.some(c => c.id === store.selectedCard?.id) : false}
        disabled={store.phase !== 'purchase'}
      />
      
      {/* Motto Container */}
      <div className="w-full border-t border-border bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 max-w-full">
          <p className="text-center text-muted-foreground italic text-sm">
            Link your visions with reality.
          </p>
        </div>
      </div>
      
      {/* Mobile Footer Navigation */}
      <MobileFooter />
    </div>
  );
}