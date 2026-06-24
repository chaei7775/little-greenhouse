const FlowerData = {
  flowers: [],
  recipes: [],
  waters: [],

  async load() {
    const [flowersRes, recipesRes, watersRes] = await Promise.all([
      fetch('data/flowers.json?v=2'),
      fetch('data/recipes.json?v=2'),
      fetch('data/waters.json?v=2')
    ]);
    this.flowers = await flowersRes.json();
    this.recipes = await recipesRes.json();
    this.waters = await watersRes.json();
    console.log('꽃 데이터 로드 완료:', this.flowers.length, '종');
    console.log('물 데이터 로드 완료:', this.waters.length, '종');
  },

  getFlower(id) {
    return this.flowers.find(f => f.id === id);
  },

  getWater(id) {
    return this.waters.find(w => w.id === id);
  },

 breed(flowerA, flowerB, rareBonus = 0) {
    const recipe = this.recipes.find(r =>
      (r.a === flowerA && r.b === flowerB) ||
      (r.a === flowerB && r.b === flowerA)
    );

    if (!recipe) return null;

    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const result of recipe.results) {
      const flower = this.getFlower(result.flower);
      let chance = result.chance;
      // 희귀 꽃이면 보너스 확률 추가
      if (flower && flower.rarity === 'rare') {
        chance += rareBonus;
      }
      cumulative += chance;
      if (roll < cumulative) {
        return result.flower;
      }
    }

    return null;
  },

  getRarity(id) {
    const flower = this.getFlower(id);
    return flower ? flower.rarity : null;
  }
};