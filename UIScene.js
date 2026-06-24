class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }


  create() {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    console.log('UIScene create 실행됨');
    this.gameScene = this.scene.get('GameScene');
    this.createHUD();
    this.createActionButton();
  }

createHUD() {
    this.add.rectangle(240, 25, 480, 50, 0xf5e6c8, 1).setOrigin(0.5, 0.5);
    const gameScene = this.scene.get('GameScene');
    const nickname = gameScene.saveData?.nickname || '작은 온실';
    const level = gameScene.saveData?.level || 1;
    
    this.add.text(50, 25, `Lv ${level}`, {
      fontSize: '14px',
      color: '#5c3d1e',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 25, `🌿 ${nickname}님의 온실`, {
      fontSize: '16px',
      color: '#5c3d1e',
      fontFamily: 'Georgia',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // 가방 버튼
    const bagBtn = this.add.text(440, 25, '🎒', {
      fontSize: '22px', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();

    bagBtn.on('pointerdown', () => {
      const inventory = gameScene.saveData.inventory;
      this.showInventory(inventory);
    });
  }

 createActionButton() {
    this.actionBtn = this.add.text(240, 750, '', {
      fontSize: '16px',
      color: '#5c3d1e',
      fontFamily: 'Georgia',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5).setInteractive().setVisible(false);

    this.actionBtn.on('pointerdown', () => {
      this.gameScene.handleAction();
    });
  }

  showAction(text) {
    if (!this.actionBtn) return;
    this.actionBtn.setText(text);
    this.actionBtn.setVisible(true);
  }

  hideAction() {
    if (!this.actionBtn) return;
    this.actionBtn.setVisible(false);
  }

  // 도감 팝업
  showDex(discovered) {
    // 기존 팝업 제거
    if (this.dexPanel) this.dexPanel.destroy();

    this.dexPanel = this.add.container(240, 400);

    const bg = this.add.rectangle(0, 0, 400, 500, 0x1a1a2e, 0.95).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -220, '🌸 꽃 도감', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(180, -220, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.dexPanel.destroy());

    this.dexPanel.add([bg, title, closeBtn]);

    // 꽃 목록
    FlowerData.flowers.forEach((flower, i) => {
      const isDiscovered = discovered.includes(flower.id);
      const x = (i % 4) * 90 - 135;
      const y = Math.floor(i / 4) * 90 - 150;

     const item = isDiscovered 
  ? this.add.image(x, y, flower.id).setDisplaySize(50, 50)
  : this.add.text(x, y, '❓', { fontSize: '30px', fontFamily: 'Arial' }).setOrigin(0.5, 0.5);
      const label = this.add.text(x, y + 35,
        isDiscovered ? flower.name : '???', {
        fontSize: '10px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      this.dexPanel.add([item, label]);
    });
  }

  // 희귀 꽃 발견 연출
showRareDiscovery(flowerId) {
    const flower = FlowerData.getFlower(flowerId);
    if (!flower) return;

    const panel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 350, 280, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const star = this.add.text(0, -90, '✨', { fontSize: '40px' }).setOrigin(0.5, 0.5);
    const emoji = this.add.text(0, -30, flower.emoji, { fontSize: '50px' }).setOrigin(0.5, 0.5);
    const name = this.add.text(0, 40, `${flower.name} 발견!`, {
      fontSize: '22px', color: '#ffd700', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);
    const sub = this.add.text(0, 80, '도감에 등록되었습니다!', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);
    const closeBtn = this.add.text(0, 120, '[ 확인 ]', {
      fontSize: '18px', color: '#7fff7f', fontFamily: 'Arial',
      backgroundColor: '#2d5a27', padding: { x: 20, y: 10 }
    }).setOrigin(0.5, 0.5).setInteractive();

    closeBtn.on('pointerdown', () => panel.destroy());
    panel.add([bg, star, emoji, name, sub, closeBtn]);
  }
  // 교배 선택 팝업
  showBreedingPanel(inventory, onBreed) {
    if (this.breedPanel) this.breedPanel.destroy();

    this.breedPanel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 420, 550, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -250, '🔬 교배할 꽃 선택', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(190, -250, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.breedPanel.destroy());

    this.breedPanel.add([bg, title, closeBtn]);

    // 선택된 꽃 슬롯
    const slotA = this.add.text(-80, -190, '?', {
      fontSize: '40px', fontFamily: 'Arial',
      backgroundColor: '#2d5a27', padding: { x: 15, y: 10 }
    }).setOrigin(0.5, 0.5);

    const plus = this.add.text(0, -190, '+', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const slotB = this.add.text(80, -190, '?', {
      fontSize: '40px', fontFamily: 'Arial',
      backgroundColor: '#2d5a27', padding: { x: 15, y: 10 }
    }).setOrigin(0.5, 0.5);

    this.breedPanel.add([slotA, plus, slotB]);

    // 선택 상태
    let selectedA = null;
    let selectedB = null;
    let selectingSlot = 'A';

    const slotLabel = this.add.text(0, -140, '👆 A 슬롯에 넣을 꽃 선택', {
      fontSize: '12px', color: '#aaffaa', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);
    this.breedPanel.add(slotLabel);

    // 인벤토리 꽃 목록
    const flowers = Object.keys(inventory).filter(id => inventory[id] > 0);
    flowers.forEach((id, i) => {
      const flower = FlowerData.getFlower(id);
      if (!flower) return;
      const x = (i % 4) * 90 - 135;
      const y = Math.floor(i / 4) * 90 - 80;

     const item = this.add.image(x, y, id).setDisplaySize(50, 50).setInteractive();
const name = this.add.text(x, y + 35, flower.name, {
  fontSize: '9px', color: '#ffffff', fontFamily: 'Arial'
}).setOrigin(0.5, 0.5);


      const count = this.add.text(x + 20, y + 20, `x${inventory[id]}`, {
        fontSize: '10px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      item.on('pointerdown', () => {
        if (selectingSlot === 'A') {
          selectedA = id;
          slotA.setText(flower.emoji);
          selectingSlot = 'B';
          slotLabel.setText('👆 B 슬롯에 넣을 꽃 선택');
        } else {
          selectedB = id;
          slotB.setText(flower.emoji);
          slotLabel.setText('✅ 준비 완료!');
        }
      });

      this.breedPanel.add([item, name, count]);
    });

    // 교배 시작 버튼
    const startBtn = this.add.text(0, 230, '[ 교배 시작 ]', {
      fontSize: '18px', color: '#ffd700', fontFamily: 'Arial',
      backgroundColor: '#5c3d1e', padding: { x: 20, y: 10 }
    }).setOrigin(0.5, 0.5).setInteractive();

    startBtn.on('pointerdown', () => {
      if (!selectedA || !selectedB) {
        slotLabel.setText('❌ 꽃을 2개 선택해주세요!');
        return;
      }
      this.breedPanel.destroy();
      onBreed(selectedA, selectedB);
    });

    this.breedPanel.add(startBtn);
  }
  // 물주기 선택 팝업
  showWaterPanel(waterInventory, onWater) {
    if (this.waterPanel) this.waterPanel.destroy();

    this.waterPanel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 380, 350, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -150, '💧 물 선택', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(170, -150, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.waterPanel.destroy());

    this.waterPanel.add([bg, title, closeBtn]);

    const waters = FlowerData.waters;
    waters.forEach((water, i) => {
      const y = i * 90 - 70;
      const count = waterInventory[water.id] || 0;

      const btn = this.add.text(0, y, `${water.emoji} ${water.name}  x${count}`, {
        fontSize: '18px', color: count > 0 ? '#ffffff' : '#666666',
        backgroundColor: count > 0 ? '#2d5a27' : '#333333',
        padding: { x: 20, y: 12 },
        fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      const desc = this.add.text(0, y + 30, 
       water.effect === 'speed'   ? '성장 속도 +50%' :
       water.effect === 'rare'    ? `희귀 확률 +${water.value}%` :
       water.effect === 'special' ? `희귀 확률 +${water.value}%` : '',
        { fontSize: '11px', color: '#aaaaaa', fontFamily: 'Arial' }
      ).setOrigin(0.5, 0.5);

      if (count > 0) {
        btn.setInteractive();
        btn.on('pointerdown', () => {
          this.waterPanel.destroy();
          onWater(water.id);
        });
      }

      this.waterPanel.add([btn, desc]);
    });
  }
  // 씨앗 선택 팝업
  showSeedPanel(inventory, onSelect) {
    if (this.seedPanel) this.seedPanel.destroy();

    this.seedPanel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 420, 500, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -220, '🌱 심을 씨앗 선택', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(190, -220, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.seedPanel.destroy());

    this.seedPanel.add([bg, title, closeBtn]);

    // 심을 수 있는 씨앗 목록 (growTime > 0인 것만)
    const seeds = Object.keys(inventory).filter(id => {
      const flower = FlowerData.getFlower(id);
      return flower && flower.growTime > 0 && inventory[id] > 0;
    });

    if (seeds.length === 0) {
      const empty = this.add.text(0, 0, '심을 씨앗이 없어요!', {
        fontSize: '16px', color: '#aaaaaa', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);
      this.seedPanel.add(empty);
      return;
    }

    seeds.forEach((id, i) => {
      const flower = FlowerData.getFlower(id);
      const x = (i % 4) * 90 - 135;
      const y = Math.floor(i / 4) * 90 - 130;

     const item = this.add.image(x, y, id).setDisplaySize(50, 50).setInteractive();

      const name = this.add.text(x, y + 38, flower.name, {
        fontSize: '9px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      const count = this.add.text(x + 22, y - 18, `x${inventory[id]}`, {
        fontSize: '10px', color: '#ffd700', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      item.on('pointerdown', () => {
        this.seedPanel.destroy();
        onSelect(id);
      });

      this.seedPanel.add([item, name, count]);
    });
  }
 showInventory(inventory) {
    if (this.inventoryPanel) this.inventoryPanel.destroy();

    this.inventoryPanel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 420, 500, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -220, '🎒 인벤토리', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(190, -220, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.inventoryPanel.destroy());

    this.inventoryPanel.add([bg, title, closeBtn]);

    const flowers = Object.keys(inventory).filter(id => inventory[id] > 0);

    if (flowers.length === 0) {
      const empty = this.add.text(0, 0, '꽃이 없어요!', {
        fontSize: '16px', color: '#aaaaaa', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);
      this.inventoryPanel.add(empty);
      return;
    }

    flowers.forEach((id, i) => {
      const flower = FlowerData.getFlower(id);
      if (!flower) return;
      const x = (i % 4) * 90 - 135;
      const y = Math.floor(i / 4) * 90 - 130;

      // 이모지 대신 이미지 사용
      const item = this.add.image(x, y, id).setDisplaySize(50, 50);

      const name = this.add.text(x, y + 35, flower.name, {
        fontSize: '9px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      const count = this.add.text(x + 22, y - 18, `x${inventory[id]}`, {
        fontSize: '10px', color: '#ffd700', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      this.inventoryPanel.add([item, name, count]);
    });
  }
}