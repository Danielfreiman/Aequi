export type RecipeItem = {
  ingredientId: string;
  name: string;
  unitCost: number; // custo por unidade (g/ml/un)
  quantity: number; // quantidade consumida no produto
};

export function calculateProductCost(recipe: RecipeItem[]): number {
  return recipe.reduce((total, item) => total + item.unitCost * item.quantity, 0);
}

/**
 * cost: custo total (ingredientes + fixos unitários)
 * ifoodTax: taxa variável (ex: 0.23 para 23%)
 * desiredMargin: margem alvo sobre o custo (ex: 0.4 para 40%)
 * Retorna preço sugerido garantindo margem após taxa do iFood.
 */
export function calculateIdealPrice(cost: number, ifoodTax: number, desiredMargin: number): number {
  const afterMargin = cost * (1 + desiredMargin);
  return Number((afterMargin / (1 - ifoodTax)).toFixed(2));
}
