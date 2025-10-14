import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMDDSStore } from '../state/store';
import { applyDomainQuotas } from '../logic/filters';
import { calculateDiscountedPrice, calculateCartTotal } from '../logic/pricing';
import { validateTurn1Restrictions, validatePooledBudget } from '../logic/turnEngine';
import AppHeader from '../components/AppHeader';
import TeamPanel from '../components/TeamPanel';
import CardShop from '../components/CardShop';
import CardDetailModal from '../components/CardDetailModal';
import { SkipForward, FileCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DeterrenceChart from '../components/DeterrenceChart';
import CartDisplay from '../components/CartDisplay';
import TurnBasedLogs from '../components/Statistics';
import DomainStatistics from '../components/DomainStatistics';
import cardsData from '../data/cards.json';
import { Card, Domain } from '@shared/schema';
import { generateMDDSReport, generateMDDSReportBase64 } from '../utils/pdfGenerator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SinglePlayerGame() {
  const store = useMDDSStore();
  const currentTeam = useMDDSStore(state => state.currentTeam);
  const phase = useMDDSStore(state => state.phase);
  const turn = useMDDSStore(state => state.turn);
  const [, setLocation] = useLocation();
  const [availableCards, setAvailableCards] = useState(applyDomainQuotas(cardsData as Card[]));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showShopAndCarts, setShowShopAndCarts] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const { toast } = useToast();

  // Initialize single-player session
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionName = `AI Strategy ${new Date().toLocaleString()}`;
        store.updateSessionName(sessionName);
        
        // Create database session
        await apiRequest('POST', '/api/sessions', {
          sessionName: sessionName,
          gameState: {
            turn: store.turn,
            maxTurns: store.maxTurns,
            currentTeam: store.currentTeam,
            teams: store.teams,
            phase: store.phase,
            strategyLog: store.strategyLog
          },
          sessionInfo: store.sessionInfo,
          turnStatistics: store.turnStatistics,
          lastUpdated: new Date().toISOString()
        });

        store.setActiveDatabaseSession(sessionName);
        await store.syncToDatabase();
        store.saveToLocalStorage();
      } catch (err) {
        console.error('Error creating single-player session:', err);
        toast({
          title: "Session Error",
          description: "Failed to create AI strategy session",
          variant: "destructive"
        });
      }
    };

    initSession();
  }, []);

  // AI logic - automatically plays when it's Russia's turn
  useEffect(() => {
    console.log('[AI Effect] Team:', currentTeam, 'Phase:', phase, 'isAIThinking:', isAIThinking);
    if (currentTeam === 'Russia' && phase === 'purchase' && !isAIThinking) {
      console.log('[AI Effect] Triggering AI decision...');
      setIsAIThinking(true);
      
      // Delay AI action for realism
      setTimeout(() => {
        makeAIDecision();
      }, 1500);
    }
  }, [currentTeam, phase, isAIThinking]);

  const makeAIDecision = () => {
    const russiaState = store.teams.Russia;
    const budget = russiaState.budget;
    const turn = store.turn;
    
    // Filter available cards for Russia
    const russiaAvailableCards = availableCards.filter(card => {
      const price = calculateDiscountedPrice(card, russiaState.ownedPermanents);
      return price <= budget && (card.baseCostK <= 200 || turn >= 2);
    });

    if (russiaAvailableCards.length === 0) {
      // No cards available, commit empty cart
      setTimeout(() => {
        handleCommitPurchases();
      }, 500);
      return;
    }

    // AI Strategy: Prioritize permanent cards, then balance domains
    let selectedCards: Card[] = [];
    let remainingBudget = budget;
    let spentPerDomain: Record<Domain, number> = {
      joint: 0, economy: 0, cognitive: 0, space: 0, cyber: 0
    };

    // Turn 1: Must spend exactly 200K per domain
    if (turn === 1) {
      const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
      
      for (const domain of domains) {
        const domainCards = russiaAvailableCards
          .filter(c => c.domain === domain)
          .sort((a, b) => {
            // Prioritize permanents, then by effectiveness
            if (a.type === 'permanent' && b.type !== 'permanent') return -1;
            if (a.type !== 'permanent' && b.type === 'permanent') return 1;
            return b.baseCostK - a.baseCostK;
          });

        let domainBudget = 200;
        for (const card of domainCards) {
          const price = calculateDiscountedPrice(card, russiaState.ownedPermanents);
          if (price <= domainBudget) {
            selectedCards.push(card);
            domainBudget -= price;
            spentPerDomain[domain] += price;
            
            if (domainBudget === 0) break;
          }
        }
      }
    } else {
      // Turn 2+: Pooled budget strategy
      // 1. First, get permanents if budget allows
      const permanents = russiaAvailableCards
        .filter(c => c.type === 'permanent')
        .sort((a, b) => b.baseCostK - a.baseCostK);

      for (const card of permanents) {
        const price = calculateDiscountedPrice(card, russiaState.ownedPermanents);
        if (price <= remainingBudget && price <= 500) {
          selectedCards.push(card);
          remainingBudget -= price;
        }
      }

      // 2. Then, balance spending across domains
      const domains: Domain[] = ['joint', 'economy', 'cognitive', 'space', 'cyber'];
      const shuffledDomains = domains.sort(() => Math.random() - 0.5);

      for (const domain of shuffledDomains) {
        const domainCards = russiaAvailableCards
          .filter(c => c.domain === domain && !selectedCards.includes(c))
          .sort((a, b) => b.baseCostK - a.baseCostK);

        for (const card of domainCards) {
          const price = calculateDiscountedPrice(card, russiaState.ownedPermanents);
          if (price <= remainingBudget && price <= 300) {
            selectedCards.push(card);
            remainingBudget -= price;
            break;
          }
        }
      }
    }

    // Add cards to Russia's cart
    selectedCards.forEach(card => {
      store.addToCart('Russia', card);
    });

    // Commit purchases after a short delay
    setTimeout(() => {
      handleCommitPurchases();
    }, 1000);
  };

  const handleSave = () => {
    store.saveToLocalStorage();
    toast({
      title: "Saved",
      description: "Strategy state saved successfully",
    });
  };

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset? This will clear all progress.')) {
      store.resetStrategy();
      store.saveToLocalStorage();
      toast({
        title: "Reset",
        description: "Strategy has been reset",
      });
    }
  };

  const handleSetMaxTurns = (turns: number) => {
    // Max turns setter logic would go here
    toast({
      title: "Max Turns Updated",
      description: `Maximum turns set to ${turns}`,
    });
  };

  const handleDownloadPDF = async () => {
    try {
      await generateMDDSReport({
        currentTurn: store.turn,
        maxTurns: store.maxTurns,
        natoTeam: store.teams.NATO,
        russiaTeam: store.teams.Russia,
        turnStatistics: store.turnStatistics,
        strategyLog: store.strategyLog,
        sessionInfo: store.sessionInfo
      });
      toast({
        title: "PDF Generated",
        description: "Strategy report downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  const handleFinishGameSession = async () => {
    setShowFinishDialog(true);
  };

  const confirmFinishSession = async () => {
    setIsFinishing(true);
    try {
      const pdfBase64 = await generateMDDSReportBase64({
        currentTurn: store.turn,
        maxTurns: store.maxTurns,
        natoTeam: store.teams.NATO,
        russiaTeam: store.teams.Russia,
        turnStatistics: store.turnStatistics,
        strategyLog: store.strategyLog,
        sessionInfo: store.sessionInfo
      });
      
      if (!store.activeDatabaseSession) {
        throw new Error('No active database session');
      }

      await apiRequest('PUT', `/api/sessions/${encodeURIComponent(store.activeDatabaseSession)}`, {
        finalReport: pdfBase64,
        gameState: {
          turn: store.turn,
          maxTurns: store.maxTurns,
          currentTeam: store.currentTeam,
          teams: store.teams,
          phase: store.phase,
          strategyLog: store.strategyLog
        },
        sessionInfo: store.sessionInfo,
        turnStatistics: store.turnStatistics,
        lastUpdated: new Date().toISOString()
      });

      toast({
        title: "Session Finished",
        description: "AI strategy session has been completed and saved",
      });

      store.resetStrategy();
      store.saveToLocalStorage();
      setLocation('/');
    } catch (error) {
      console.error('Error finishing session:', error);
      toast({
        title: "Error",
        description: "Failed to finish session",
        variant: "destructive"
      });
    } finally {
      setIsFinishing(false);
      setShowFinishDialog(false);
    }
  };

  const handleCommitPurchases = () => {
    console.log('[Commit] Starting commit for team:', store.currentTeam, 'turn:', store.turn);
    const errors: string[] = [];

    if (store.currentTeam === 'NATO') {
      const natoCart = store.teams.NATO.cart;
      const natoState = store.teams.NATO;

      if (store.turn === 1) {
        const validation = validateTurn1Restrictions(natoCart, natoState);
        errors.push(...validation.errors);
      } else {
        const validation = validatePooledBudget(natoCart, natoState);
        errors.push(...validation.errors);
      }
    } else {
      const russiaCart = store.teams.Russia.cart;
      const russiaState = store.teams.Russia;

      if (store.turn === 1) {
        const validation = validateTurn1Restrictions(russiaCart, russiaState);
        errors.push(...validation.errors);
      } else {
        const validation = validatePooledBudget(russiaCart, russiaState);
        errors.push(...validation.errors);
      }
    }

    if (errors.length === 0) {
      console.log('[Commit] Validation passed, committing purchases');
      store.commitTeamPurchases(store.currentTeam);
      setValidationErrors([]);
      
      if (store.currentTeam === 'NATO') {
        console.log('[Commit] NATO committed, switching to Russia in 500ms...');
        // After NATO commits, switch to Russia (which will trigger AI)
        setTimeout(() => {
          console.log('[Commit] Switching team to Russia');
          store.setCurrentTeam('Russia');
        }, 500);
      } else if (store.currentTeam === 'Russia') {
        console.log('[Commit] Russia committed, advancing turn and switching to NATO in 500ms...');
        // AI automatically advances turn after committing
        setTimeout(() => {
          console.log('[Commit] Advancing turn and switching to NATO');
          store.advanceGameTurn();
          store.setCurrentTeam('NATO');
          setIsAIThinking(false); // Reset after team switch to prevent re-trigger
        }, 500);
      }
    } else {
      console.log('[Commit] Validation failed:', errors);
      setValidationErrors(errors);
      if (store.currentTeam === 'Russia') {
        setIsAIThinking(false);
      }
    }
  };

  const handleAdvanceTurn = () => {
    store.advanceGameTurn();
    setValidationErrors([]);
  };

  const canCommit = store.phase === 'purchase';
  const canAdvance = store.phase === 'commit';

  const natoState = store.teams.NATO;
  const russiaState = store.teams.Russia;

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      <AppHeader
        currentTurn={store.turn}
        maxTurns={store.maxTurns}
        onSave={handleSave}
        onResetProgress={handleResetProgress}
        onSetMaxTurns={handleSetMaxTurns}
        onDownloadPDF={handleDownloadPDF}
        onFinishGameSession={handleFinishGameSession}
        showShopAndCarts={showShopAndCarts}
        onToggleShopAndCarts={() => setShowShopAndCarts(!showShopAndCarts)}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Single Player vs AI</h2>
          {isAIThinking && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>AI is thinking...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TeamPanel 
            team="NATO" 
            teamState={natoState}
            isActive={store.currentTeam === 'NATO'}
            currentTurn={store.turn}
          />
          <TeamPanel 
            team="Russia" 
            teamState={russiaState}
            isActive={store.currentTeam === 'Russia'}
            currentTurn={store.turn}
          />
        </div>

        <DeterrenceChart natoTeam={natoState} russiaTeam={russiaState} />

        {showShopAndCarts && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CartDisplay
                team="NATO"
                cartItems={natoState.cart}
                onRemoveFromCart={(cardId) => store.removeFromCart('NATO', cardId)}
                getDiscountedPrice={(card) => calculateDiscountedPrice(card, natoState.ownedPermanents)}
                cartTotal={calculateCartTotal(natoState.cart, natoState.ownedPermanents)}
                onConfirmPurchases={handleCommitPurchases}
                canConfirm={canCommit && store.currentTeam === 'NATO'}
                budget={natoState.budget}
              />
              <CartDisplay
                team="Russia"
                cartItems={russiaState.cart}
                onRemoveFromCart={(cardId) => store.removeFromCart('Russia', cardId)}
                getDiscountedPrice={(card) => calculateDiscountedPrice(card, russiaState.ownedPermanents)}
                cartTotal={calculateCartTotal(russiaState.cart, russiaState.ownedPermanents)}
                canConfirm={false}
                budget={russiaState.budget}
              />
            </div>

            <CardShop
              cards={availableCards}
              onAddToCart={(card) => store.addToCart('NATO', card)}
              onViewDetails={(card) => store.setSelectedCard(card)}
              cartItems={natoState.cart}
              natoCartItems={natoState.cart}
              russiaCartItems={russiaState.cart}
              getDiscountedPrice={(card) => calculateDiscountedPrice(card, natoState.ownedPermanents)}
              getNATOPrice={(card) => calculateDiscountedPrice(card, natoState.ownedPermanents)}
              getRussiaPrice={(card) => calculateDiscountedPrice(card, russiaState.ownedPermanents)}
              disabled={store.currentTeam !== 'NATO' || store.phase !== 'purchase'}
              onAddToNATOCart={(card) => store.addToCart('NATO', card)}
              onAddToRussiaCart={() => {}}
              currentTurn={store.turn}
              natoTeamState={natoState}
              russiaTeamState={russiaState}
            />
          </>
        )}

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Turn Control</h3>
          {isAIThinking && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3" data-testid="ai-thinking-indicator">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">AI is thinking...</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground" data-testid="text-current-turn">Current Turn: {store.turn}/{store.maxTurns}</div>
              <div className="text-sm text-muted-foreground" data-testid="text-current-phase">Phase: {store.phase}</div>
              <div className="text-sm text-muted-foreground" data-testid="text-current-team">Current Team: {store.currentTeam}</div>
            </div>
            <div className="flex gap-2">
              {canCommit && store.currentTeam === 'NATO' && (
                <Button 
                  onClick={handleCommitPurchases} 
                  disabled={isAIThinking}
                  data-testid="button-commit-purchases"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Commit Purchases
                </Button>
              )}
              {canAdvance && (
                <Button 
                  onClick={handleAdvanceTurn} 
                  disabled={isAIThinking}
                  data-testid="button-advance-turn"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Advance Turn
                </Button>
              )}
            </div>
          </div>
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              {validationErrors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-600 dark:text-red-400">{error}</p>
              ))}
            </div>
          )}
        </div>

        <TurnBasedLogs />
        <DomainStatistics />
      </div>

      <CardDetailModal
        card={store.selectedCard}
        isOpen={!!store.selectedCard}
        onClose={() => store.setSelectedCard(null)}
        onAddToCart={() => {
          if (store.selectedCard && store.currentTeam === 'NATO') {
            store.addToCart('NATO', store.selectedCard);
            store.setSelectedCard(null);
          }
        }}
        discountedPrice={store.selectedCard ? calculateDiscountedPrice(store.selectedCard, natoState.ownedPermanents) : undefined}
        inCart={store.selectedCard ? natoState.cart.some(c => c.id === store.selectedCard?.id) : false}
        disabled={store.phase !== 'purchase' || store.currentTeam !== 'NATO'}
      />

      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish AI Strategy Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finish this session? A PDF report will be generated and the session will be saved to the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isFinishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinishSession} disabled={isFinishing}>
              {isFinishing ? 'Finishing...' : 'Finish Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
