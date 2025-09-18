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
import StrategyLog from '../components/StrategyLog';
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

  return (
    <div className="min-h-screen bg-background">
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Team Panels */}
          <div className="xl:col-span-3 space-y-4">
            <TeamPanel
              team={store.currentTeam}
              teamState={currentTeamState}
              isActive={true}
            />
            <TeamPanel
              team={opponentTeam}
              teamState={opponentTeamState}
            />
          </div>

          {/* Main Content */}
          <div className="xl:col-span-6 space-y-6">
            {/* Budget Summary */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Current Budget Status</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Cart Total:</span>
                  <span className={`font-mono font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    {cartTotal}K
                  </span>
                  <span className="text-sm text-muted-foreground">/ {currentTeamState.budget}K</span>
                </div>
              </div>
              {!canAfford && (
                <p className="text-sm text-red-600">
                  ⚠️ Cart total exceeds available budget
                </p>
              )}
            </div>

            {/* Card Shop */}
            <CardShop
              cards={availableCards}
              onAddToCart={(card) => store.addToCart(store.currentTeam, card)}
              onViewDetails={(card) => store.setSelectedCard(card)}
              cartItems={currentTeamState.cart}
              getDiscountedPrice={getDiscountedPrice}
              disabled={store.phase !== 'purchase'}
            />
          </div>

          {/* Right Sidebar - Controls */}
          <div className="xl:col-span-3 space-y-4">
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

            <StrategyLog
              entries={store.strategyLog}
              maxHeight="400px"
            />
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