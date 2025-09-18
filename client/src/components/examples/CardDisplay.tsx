import CardDisplay from '../CardDisplay';
import { Card } from '@shared/schema';

export default function CardDisplayExample() {
  const sampleCard: Card = {
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

  const discountedCard: Card = {
    id: "E1",
    name: "Economic Sanctions Package",
    domain: "economy", 
    type: "permanent",
    baseCostK: 120,
    permanentMods: {
      flatDiscountK: 50,
      appliesToCardIds: ["E5", "E7"]
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      <CardDisplay 
        card={sampleCard}
        onAddToCart={() => console.log('Added to cart:', sampleCard.id)}
        onViewDetails={() => console.log('View details:', sampleCard.id)}
      />
      <CardDisplay 
        card={discountedCard}
        discountedPrice={70}
        onAddToCart={() => console.log('Added to cart:', discountedCard.id)}
        onViewDetails={() => console.log('View details:', discountedCard.id)}
        inCart={true}
      />
    </div>
  );
}