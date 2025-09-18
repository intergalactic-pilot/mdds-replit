import { useState, useEffect } from 'react';
import { useMDDSStore } from '../state/store';
import { applyDomainQuotas } from '../logic/filters';
import { calculateDiscountedPrice, calculateCartTotal } from '../logic/pricing';
import { validateTurn1Restrictions, validatePooledBudget } from '../logic/turnEngine';
import AppHeader from '../components/AppHeader';
import TeamPanel from '../components/TeamPanel';
import CardShop from '../components/CardShop';
import CardDetailModal from '../components/CardDetailModal';
import TurnController from '../components/TurnController';
import DeterrenceChart from '../components/DeterrenceChart';
import CartDisplay from '../components/CartDisplay';
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
    <div className="min-h-screen">
      <AppHeader
        currentTurn={store.turn}
        maxTurns={store.maxTurns}
        onNewStrategy={() => {
          if (confirm('Reset all progress and start a new strategy?')) {
            store.resetStrategy();
          }
        }}
        onSave={() => {
          store.saveToLocalStorage();
          alert('Strategy saved to local storage!');
        }}
        onLoad={() => {
          const success = store.loadFromLocalStorage();
          if (success) {
            alert('Strategy loaded successfully!');
          } else {
            alert('No saved strategy found.');
          }
          return success;
        }}
        onExport={store.exportState}
        onImport={store.importState}
        onConcludeStrategy={() => {
          if (confirm('Conclude this strategy? This will end the current session.')) {
            store.concludeStrategy(store.currentTeam);
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
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)]">
                <div className="glass-panel p-4">
                  <TeamPanel
                    team={store.currentTeam}
                    teamState={currentTeamState}
                    isActive={true}
                  />
                </div>
                <div className="glass-panel p-4">
                  <TeamPanel
                    team={opponentTeam}
                    teamState={opponentTeamState}
                  />
                </div>
              </div>
            </div>

            {/* Main Content - Wider */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="space-y-4 lg:space-y-6">
                {/* Budget Summary */}
                <div className="glass-card p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h3 className="font-semibold text-lg">Current Budget Status</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Cart Total:</span>
                      <span className={`font-mono font-bold text-lg ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                        {cartTotal}K
                      </span>
                      <span className="text-sm text-muted-foreground">/ {currentTeamState.budget}K</span>
                    </div>
                  </div>
                  {!canAfford && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Cart total exceeds available budget
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Shop */}
                <div className="glass-card p-4 lg:p-6">
                  <CardShop
                    cards={availableCards}
                    onAddToCart={(card) => store.addToCart(store.currentTeam, card)}
                    onViewDetails={(card) => store.setSelectedCard(card)}
                    cartItems={currentTeamState.cart}
                    getDiscountedPrice={getDiscountedPrice}
                    disabled={store.phase !== 'purchase'}
                    onAddToNATOCart={(card) => store.addToCart('NATO', card)}
                    onAddToRussiaCart={(card) => store.addToCart('Russia', card)}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar - Turn Controller and Cart */}
            <div className="lg:col-span-2 order-3">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="glass-panel p-4">
                  <TurnController
                    currentTurn={store.turn}
                    maxTurns={store.maxTurns}
                    currentTeam={store.currentTeam}
                    phase={store.phase}
                    onCommitPurchases={() => {
                      store.commitTeamPurchases(store.currentTeam);
                      store.saveToLocalStorage(); // Auto-save after commits
                    }}
                    onAdvanceTurn={() => {
                      store.advanceGameTurn();
                      store.saveToLocalStorage(); // Auto-save after turn advance
                    }}
                    canCommit={canCommit && canAfford}
                    canAdvance={canAdvance}
                    validationErrors={validationErrors}
                  />
                </div>

                <div className="glass-panel p-4">
                  <CartDisplay
                    team="NATO"
                    cartItems={natoState.cart}
                    onRemoveFromCart={(cardId) => store.removeFromCart('NATO', cardId)}
                    getDiscountedPrice={priceForNATO}
                    cartTotal={natoCartTotal}
                  />
                </div>

                <div className="glass-panel p-4">
                  <CartDisplay
                    team="Russia"
                    cartItems={russiaState.cart}
                    onRemoveFromCart={(cardId) => store.removeFromCart('Russia', cardId)}
                    getDiscountedPrice={priceForRussia}
                    cartTotal={russiaCartTotal}
                  />
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
}