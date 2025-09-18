import CardShop from '../CardShop';
import { Card } from '@shared/schema';

export default function CardShopExample() {
  const sampleCards: Card[] = [
    {
      id: "J1",
      name: "Strategic Command Center",
      domain: "joint",
      type: "asset", 
      baseCostK: 150,
      effects: [{ target: "self", domain: "joint", delta: 15 }]
    },
    {
      id: "E1", 
      name: "Economic Sanctions Package",
      domain: "economy",
      type: "asset",
      baseCostK: 120
    },
    {
      id: "CY1",
      name: "Cyber Defense Grid", 
      domain: "cyber",
      type: "permanent",
      baseCostK: 140,
      permanentMods: {
        flatDiscountK: 50,
        appliesToCardIds: ["CY3", "CY5"]
      }
    },
    {
      id: "S1",
      name: "Space Strategic Advisor",
      domain: "space", 
      type: "expert",
      baseCostK: 100,
      expertInfo: "Provides space domain strategic guidance"
    }
  ];

  const cartItems = [sampleCards[0]]; // J1 is in cart

  return (
    <div className="max-w-6xl">
      <CardShop
        cards={sampleCards}
        onAddToCart={(card) => console.log('Add to cart:', card.id)}
        onViewDetails={(card) => console.log('View details:', card.id)}
        cartItems={cartItems}
        getDiscountedPrice={(card) => card.baseCostK - 10} // 10K discount simulation
      />
    </div>
  );
}