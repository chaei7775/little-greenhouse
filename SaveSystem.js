const SaveSystem = {
  SAVE_KEY: 'greenhouse_save',

 defaultSave() {
    return {
      pots: [
        { id: 0, flower: null, plantedAt: null, wateredAt: null, waterBonus: null },
        { id: 1, flower: null, plantedAt: null, wateredAt: null, waterBonus: null },
        { id: 2, flower: null, plantedAt: null, wateredAt: null, waterBonus: null },
        { id: 3, flower: null, plantedAt: null, wateredAt: null, waterBonus: null },
        { id: 4, flower: null, plantedAt: null, wateredAt: null, waterBonus: null },
        { id: 5, flower: null, plantedAt: null, wateredAt: null, waterBonus: null },
      ],
      inventory: {},
      discovered: [],
      breedingSlots: [null, null],
      waterInventory: { clear_water: 5, moonlight_dew: 2, starlight_drop: 1 },
      dailyWater: null,
      nickname: null,
      level: 1,
      exp: 0,
      money: 0,
      reputation: 0,
      shop: null,
    };
  },

  save(data) {
    // localStorage에도 저장 (백업)
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    // Firebase에도 저장
    FirebaseSystem.save(data);
    console.log('저장 완료');
  },

  async load() {
    // Firebase에서 먼저 불러오기
    const cloudData = await FirebaseSystem.load();
    if (cloudData) {
      console.log('클라우드 세이브 불러오기 완료');
      // 도감 12개 채웠는데 shopUnlocked 없으면 자동 설정
      if (cloudData.discovered && cloudData.discovered.length >= 12 && !cloudData.shopUnlocked) {
        cloudData.shopUnlocked = true;
      }
      return cloudData;
    }
    // Firebase 없으면 localStorage
    const saved = localStorage.getItem(this.SAVE_KEY);
    if (saved) {
      console.log('로컬 세이브 불러오기 완료');
      const data = JSON.parse(saved);
      if (data.discovered && data.discovered.length >= 12 && !data.shopUnlocked) {
        data.shopUnlocked = true;
      }
      return data;
    }
    console.log('새 게임 시작');
    return this.defaultSave();
  },

  // 인벤토리에 꽃 추가
  addToInventory(data, flowerId) {
    if (!data.inventory[flowerId]) {
      data.inventory[flowerId] = 0;
    }
    data.inventory[flowerId]++;
  },

  discover(data, flowerId) {
    if (!data.discovered.includes(flowerId)) {
      data.discovered.push(flowerId);
      // 도감 완성 체크
      if (data.discovered.length >= 12 && !data.shopUnlocked) {
        data.shopUnlocked = true;
      }
      return true;
    }
    return false;
  },

  // 성장 완료 여부 체크
 isGrown(pot) {
    if (!pot.flower || !pot.plantedAt) return false;
    const flower = FlowerData.getFlower(pot.flower);
    if (!flower || flower.growTime === 0) return false;
    const elapsed = (Date.now() - pot.plantedAt) / 1000;
    let growTime = flower.growTime;
    // 맑은 물 효과 적용
    if (pot.waterBonus === 'speed') {
      growTime = growTime * 0.5;
    }
    return elapsed >= growTime;
  }
};