import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMDDSStore } from '../state/store';
import { useIsMobile } from '../hooks/use-mobile';
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
import MobileFooter from '../components/MobileFooter';
import TurnBasedLogs from '../components/Statistics';
import DomainStatistics from '../components/DomainStatistics';
import cardsData from '../data/cards.json';
import { Card } from '@shared/schema';
import { generateMDDSReport, generateMDDSReportBase64 } from '../utils/pdfGenerator';
import LoginScreen from '../components/LoginScreen';
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

export default function MDDSStrategy() {
  const store = useMDDSStore();
  const isMobile = useIsMobile();
  const showLoginScreen = useMDDSStore(state => state.showLoginScreen);
  const [, setLocation] = useLocation();
  const [availableCards, setAvailableCards] = useState(applyDomainQuotas(cardsData as Card[]));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showShopAndCarts, setShowShopAndCarts] = useState(true);
  const { toast } = useToast();

  // Redirect mobile users to mobile login interface
  useEffect(() => {
    // Check screen size immediately and redirect if mobile
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      if (isMobileDevice) {
        setLocation('/mobile');
      }
    };

    // Check immediately
    checkMobile();
    
    // Also check when the hook updates
    if (isMobile) {
      setLocation('/mobile');
    }
  }, [isMobile, setLocation]);

  // Early return for mobile to prevent flashing
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }

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
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const handleFinishGameSession = async () => {
    // Guard against missing session name
    if (!store.sessionInfo?.sessionName) {
      toast({
        title: "Session name missing",
        description: "Cannot finish session without a valid session name.",
        variant: "destructive",
      });
      return;
    }

    setIsFinishing(true);
    try {
      const reportData = {
        currentTurn: store.turn,
        maxTurns: store.maxTurns,
        natoTeam: store.teams.NATO,
        russiaTeam: store.teams.Russia,
        turnStatistics: store.turnStatistics,
        strategyLog: store.strategyLog,
        sessionInfo: store.sessionInfo
      };

      // Generate and download PDF
      await generateMDDSReport(reportData);

      // Generate PDF as base64 for database
      const pdfData = await generateMDDSReportBase64(reportData);

      // Save PDF to database
      const sessionName = store.sessionInfo.sessionName;
      await apiRequest('PUT', `/api/sessions/${encodeURIComponent(sessionName)}`, {
        finalReport: pdfData,
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
        title: "Game session completed",
        description: "Report downloaded and saved to the database.",
        duration: 5000,
      });

      setShowFinishDialog(false);
    } catch (error) {
      console.error('Failed to finish game session:', error);
      toast({
        title: "Failed to save report",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Show login screen on first load or after reset */}
      {showLoginScreen && <LoginScreen />}
      
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
        onDownloadPDF={handleDownloadPDF}
        onFinishGameSession={() => setShowFinishDialog(true)}
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
                    currentTurn={store.turn}
                  />
                </div>
                <div className="glass-panel p-3 lg:p-4">
                  <TeamPanel
                    team={opponentTeam}
                    teamState={opponentTeamState}
                    currentTurn={store.turn}
                  />
                </div>
              </div>
            </div>

            {/* Main Content - Wider */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="space-y-4 lg:space-y-6">
                {/* Card Shop */}
                {showShopAndCarts && (
                  <div className="glass-card p-3 lg:p-6">
                    <CardShop
                      cards={availableCards}
                      onAddToCart={(card) => store.addToCart(store.currentTeam, card)}
                      onViewDetails={(card) => store.setSelectedCard(card)}
                      cartItems={currentTeamState.cart}
                      natoCartItems={natoState.cart}
                      russiaCartItems={russiaState.cart}
                      getDiscountedPrice={getDiscountedPrice}
                      getNATOPrice={priceForNATO}
                      getRussiaPrice={priceForRussia}
                      disabled={store.phase !== 'purchase'}
                      onAddToNATOCart={(card) => store.addToCart('NATO', card)}
                      onAddToRussiaCart={(card) => store.addToCart('Russia', card)}
                      currentTurn={store.turn}
                      natoTeamState={natoState}
                      russiaTeamState={russiaState}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - NATO and Russia Carts */}
            <div className="lg:col-span-2 order-3">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Visibility Toggle Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowShopAndCarts(!showShopAndCarts)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    data-testid="button-toggle-shop-visibility"
                  >
                    {showShopAndCarts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showShopAndCarts ? 'Hide' : 'Show'} Shop & Carts
                  </Button>
                </div>

                {showShopAndCarts && (
                  <>
                    <div className="glass-panel p-3 lg:p-4">
                      <CartDisplay
                        team="NATO"
                        cartItems={natoState.cart}
                        onRemoveFromCart={(cardId) => store.removeFromCart('NATO', cardId)}
                        getDiscountedPrice={priceForNATO}
                        cartTotal={natoCartTotal}
                        onConfirmPurchases={() => {
                          // Validate before committing NATO purchases
                          const natoValidation = store.turn === 1 
                            ? validateTurn1Restrictions(natoState.cart, natoState)
                            : validatePooledBudget(natoState.cart, natoState);
                          
                          if (!natoValidation.valid) {
                            // Don't commit if validation fails - errors will be visible in validation display
                            return;
                          }
                          
                          store.commitTeamPurchases('NATO');
                          store.saveToLocalStorage();
                        }}
                        canConfirm={(() => {
                          if (natoState.cart.length === 0) return false;
                          if (natoCartTotal > natoState.budget) return false;
                          
                          // Check team-specific validation
                          const natoValidation = store.turn === 1 
                            ? validateTurn1Restrictions(natoState.cart, natoState)
                            : validatePooledBudget(natoState.cart, natoState);
                          
                          return natoValidation.valid;
                        })()}
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
                          // Validate before committing Russia purchases
                          const russiaValidation = store.turn === 1 
                            ? validateTurn1Restrictions(russiaState.cart, russiaState)
                            : validatePooledBudget(russiaState.cart, russiaState);
                          
                          if (!russiaValidation.valid) {
                            // Don't commit if validation fails - errors will be visible in validation display
                            return;
                          }
                          
                          store.commitTeamPurchases('Russia');
                          store.saveToLocalStorage();
                        }}
                        canConfirm={(() => {
                          if (russiaState.cart.length === 0) return false;
                          if (russiaCartTotal > russiaState.budget) return false;
                          
                          // Check team-specific validation
                          const russiaValidation = store.turn === 1 
                            ? validateTurn1Restrictions(russiaState.cart, russiaState)
                            : validatePooledBudget(russiaState.cart, russiaState);
                          
                          return russiaValidation.valid;
                        })()}
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
                        Finish Turn ({store.turn})
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        
        {/* Statistics Section */}
        {showShopAndCarts && (
          <div className="mt-6">
            <DomainStatistics />
          </div>
        )}
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

      {/* Finish Game Session Confirmation Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent data-testid="dialog-finish-game">
          <AlertDialogHeader>
            <AlertDialogTitle>Finish the Game Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will generate a final PDF report and save it to the database. You can continue playing after this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-finish">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinishGameSession}
              disabled={isFinishing}
              data-testid="button-confirm-finish"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isFinishing ? "Generating..." : "Yes, Finish Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}