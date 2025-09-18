import { useState } from 'react';
import { Button } from "@/components/ui/button";
import CardDetailModal from '../CardDetailModal';
import { Card } from '@shared/schema';

export default function CardDetailModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const sampleAssetCard: Card = {
    id: "J1",
    name: "Strategic Command Center",
    domain: "joint",
    type: "asset",
    baseCostK: 150,
    effects: [
      { target: "self", domain: "joint", delta: 15 },
      { target: "opponent", domain: "joint", delta: -5 }
    ]
  };

  const samplePermanentCard: Card = {
    id: "E2",
    name: "Trade Alliance Network",
    domain: "economy",
    type: "permanent",
    baseCostK: 180,
    permanentMods: {
      flatDiscountK: 50,
      appliesToCardIds: ["E5", "E7", "J4"]
    }
  };

  const sampleExpertCard: Card = {
    id: "CG3",
    name: "Information Warfare Specialist",
    domain: "cognitive",
    type: "expert",
    baseCostK: 100,
    expertInfo: "Provides strategic insights on information campaigns and cognitive influence strategies across multiple domains."
  };

  const openModal = (card: Card) => {
    setSelectedCard(card);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => openModal(sampleAssetCard)}>
          View Asset Card
        </Button>
        <Button onClick={() => openModal(samplePermanentCard)}>
          View Permanent Card  
        </Button>
        <Button onClick={() => openModal(sampleExpertCard)}>
          View Expert Card
        </Button>
      </div>

      <CardDetailModal
        card={selectedCard}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAddToCart={() => console.log('Added to cart:', selectedCard?.id)}
        discountedPrice={selectedCard?.id === 'E2' ? 130 : undefined}
      />
    </div>
  );
}