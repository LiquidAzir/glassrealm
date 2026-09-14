import { SHOP, TAVERN } from './content.js';

// A merchant/event discount must not create a buy-and-immediately-sell (or
// alchemize) gold loop. Gathered/crafted-only goods retain their full reward.
export function tradeValue(key, offered, buyPrice) {
  let cheapest = Infinity;
  for (const s of SHOP.stock) if (s.key === key) cheapest = Math.min(cheapest, buyPrice(key, s.price));
  for (const s of TAVERN) if (s.key === key) cheapest = Math.min(cheapest, s.price);
  return Math.max(0, Math.min(Math.round(offered), cheapest - 1));
}
