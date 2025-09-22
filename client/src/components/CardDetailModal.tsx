import { useState } from "react";
import { Card as CardType } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import DomainBadge from "./DomainBadge";
import { formatCurrency } from "../logic/pricing";
import { sanitizeText } from "../logic/guards";
import { Zap, Clock, ShoppingCart, TrendingUp, TrendingDown, Info, Lock, Unlock } from "lucide-react";

interface CardDetailModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: () => void;
  discountedPrice?: number;
  inCart?: boolean;
  disabled?: boolean;
}

export default function CardDetailModal({ 
  card, 
  isOpen, 
  onClose, 
  onAddToCart,
  discountedPrice,
  inCart = false,
  disabled = false 
}: CardDetailModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  if (!card) return null;

  const finalPrice = discountedPrice ?? card.baseCostK;
  const hasDiscount = discountedPrice !== undefined && discountedPrice < card.baseCostK;

  const handlePasswordSubmit = () => {
    if (passwordInput === "MDDS.01!") {
      setIsUnlocked(true);
      setShowPasswordInput(false);
      setPasswordError("");
      setPasswordInput("");
    } else {
      setPasswordError("Incorrect password");
      setPasswordInput("");
    }
  };

  const handleClose = () => {
    setIsUnlocked(false);
    setShowPasswordInput(false);
    setPasswordInput("");
    setPasswordError("");
    onClose();
  };

  const getTypeIcon = () => {
    switch (card.type) {
      case 'asset': return <Zap className="w-5 h-5" />;
      case 'permanent': return <ShoppingCart className="w-5 h-5" />;
      case 'expert': return <Clock className="w-5 h-5" />;
    }
  };

  const getTypeDescription = () => {
    switch (card.type) {
      case 'asset': return 'Provides immediate deterrence effects when purchased';
      case 'permanent': return 'Provides ongoing discounts to specified cards';
      case 'expert': return 'Becomes available next turn for informational purposes only';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-card-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span data-testid="text-modal-card-name">{sanitizeText(card.name)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Always Visible: Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Card ID</h4>
              <p className="font-mono" data-testid="text-modal-card-id">{card.id}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Cost</h4>
              <div className="flex items-center gap-4">
                {hasDiscount && (
                  <div className="text-sm text-muted-foreground line-through">
                    Original: {formatCurrency(card.baseCostK)}
                  </div>
                )}
                <div className={`text-lg font-bold ${hasDiscount ? 'text-green-600' : ''}`} data-testid="text-modal-price">
                  {formatCurrency(finalPrice)}
                </div>
                {hasDiscount && (
                  <Badge variant="secondary" className="text-green-600">
                    -{formatCurrency(card.baseCostK - finalPrice)} discount
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Protected Information Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">Detailed Information</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                className="flex items-center gap-2"
                data-testid="button-unlock-details"
              >
                {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {isUnlocked ? 'Unlocked' : 'Unlock Details'}
              </Button>
            </div>

            {showPasswordInput && !isUnlocked && (
              <div className="space-y-2 p-3 bg-muted rounded-md">
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    data-testid="input-password"
                  />
                  <Button onClick={handlePasswordSubmit} size="sm" data-testid="button-submit-password">
                    Unlock
                  </Button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
              </div>
            )}

            {isUnlocked && (
              <div className="space-y-4">
                {/* Type Information */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Type & Domain</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {getTypeIcon()}
                      <span className="ml-1">{sanitizeText(card.type.charAt(0).toUpperCase() + card.type.slice(1))}</span>
                    </Badge>
                    <DomainBadge domain={card.domain} />
                  </div>
                </div>

                {/* Type-specific Details */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {sanitizeText(getTypeDescription())}
                  </p>

                  {/* Asset Effects */}
                  {card.type === 'asset' && card.effects && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Effects</h5>
                      {card.effects.map((effect, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white border border-border rounded-md">
                          {effect.delta > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm text-foreground">
                            {effect.target === 'self' ? 'Self' : 'Opponent'} {effect.domain}: 
                            <span className={effect.delta > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {effect.delta > 0 ? '+' : ''}{effect.delta}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Permanent Discounts */}
                  {card.type === 'permanent' && card.permanentMods && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Provides Discounts</h5>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium text-green-600 mb-2">
                          -{formatCurrency(card.permanentMods.flatDiscountK)} discount to:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {card.permanentMods.appliesToCardIds.map(cardId => (
                            <Badge key={cardId} variant="secondary" className="text-xs">
                              {cardId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expert Info */}
                  {card.type === 'expert' && card.expertInfo && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Expert Information</h5>
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm" data-testid="text-expert-info">
                          {sanitizeText(card.expertInfo)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {onAddToCart && (
            <div className="flex gap-2">
              <Button
                onClick={onAddToCart}
                disabled={disabled || inCart}
                className="flex-1"
                data-testid="button-modal-add-cart"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {inCart ? 'In Cart' : 'Add to Cart'}
              </Button>
              <Button variant="outline" onClick={handleClose} data-testid="button-modal-close">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}