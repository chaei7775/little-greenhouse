class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.saveData = null;
    this.player = null;
    this.cursors = null;
    this.pots = [];
    this.breedingTable = null;
    this.nearObject = null;
    this.uiScene = null;
  }

  preload() {
    this.load.image('red_rose', 'images/red_rose.png');
    this.load.image('white_rose', 'images/white_rose.png');
    this.load.image('tulip', 'images/tulip.png');
    this.load.image('daisy', 'images/daisy.png');
    this.load.image('pink_rose', 'images/pink_rose.png');
    this.load.image('yellow_tulip', 'images/yellow_tulip.png');
    this.load.image('white_daisy', 'images/white_daisy.png');
    this.load.image('purple_lavender', 'images/purple_lavender.png');
    this.load.image('blue_tulip', 'images/blue_tulip.png');
    this.load.image('moonlight_rose', 'images/moonlight_rose.png');
    this.load.image('starlight_daisy', 'images/starlight_daisy.png');
    this.load.image('rainbow_tulip', 'images/rainbow_tulip.png');
    this.load.image('pot', 'images/pot.png');
    this.load.image('player', 'images/player.png');
    this.load.image('bg', 'images/bg.png');
    this.load.image('breeding_table', 'images/breeding_table.png');
  }

  async create() {
    await FlowerData.load();
    this.saveData = await SaveSystem.load();

    this.createMap();
    this.createPlayer();
    this.createPots();
    this.createBreedingTable();
    this.createDexButton();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.scene.launch('UIScene');
    this.uiScene = this.scene.get('UIScene');

    // 터치 이동
    this.input.on('pointerdown', (ptr) => {
      this.targetX = ptr.x;
      this.targetY = ptr.y;
    });
  }

 createMap() {
    // 배경 이미지
    this.add.image(240, 425, 'bg').setDisplaySize(480, 800);
  }

 createPlayer() {
    this.player = this.add.image(240, 600, 'player').setDisplaySize(100, 140);
    this.player.setDepth(10);
    this.targetX = 240;
    this.targetY = 600;
  }

 createPots() {
    const positions = [
      { x: 100, y: 200 }, { x: 240, y: 200 }, { x: 380, y: 200 },
      { x: 100, y: 350 }, { x: 240, y: 350 }, { x: 380, y: 350 },
    ];

    positions.forEach((pos, i) => {
      const pot = this.add.container(pos.x, pos.y);
      
      // 화분 이미지
      const potImg = this.add.image(0, 15, 'pot').setDisplaySize(70, 70);
      
      // 꽃 이모지 라벨 (성장중일때)
      const label = this.add.text(0, -10, '', {
        fontSize: '28px', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      pot.add([potImg, label]);
      pot.potIndex = i;
      pot.label = label;
      pot.flowerImage = null;
      pot.type = 'pot';
      this.pots.push(pot);
    });

    this.updatePotDisplay();
  }

 createBreedingTable() {
    this.breedingTable = this.add.container(240, 520);
    const img = this.add.image(0, 0, 'breeding_table').setDisplaySize(130, 195);
    this.breedingTable.add([img]);
    this.breedingTable.type = 'breeding';
  }

 createDexButton() {
    // 도감 버튼
    const dexBtn = this.add.text(430, 750, '📖', {
      fontSize: '30px', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    dexBtn.on('pointerdown', () => {
      this.scene.get('UIScene').showDex(this.saveData.discovered);
    });

    // 상점 버튼
    const shopBtn = this.add.text(240, 780, '🛒', {
      fontSize: '30px', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    shopBtn.on('pointerdown', () => {
      this.scene.pause('GameScene');
      this.scene.launch('ShopScene');
    });
  }

 updatePotDisplay() {
    this.pots.forEach((pot, i) => {
      const potData = this.saveData.pots[i];
      
      // 기존 꽃 이미지 제거
      if (pot.flowerImage) {
        pot.flowerImage.destroy();
        pot.flowerImage = null;
      }

      if (potData.flower) {
        const grown = SaveSystem.isGrown(potData);
        if (grown) {
          // 성숙한 꽃 이미지 표시
          pot.flowerImage = this.add.image(pot.x, pot.y - 21, potData.flower).setDisplaySize(55, 55);
        } else {
          // 성장 중 이모지
          pot.label.setPosition(0, -10);
          pot.label.setText('🌱');
        }
      } else {
        pot.label.setText('');
      }
    });
  }

  handleAction() {
    if (!this.nearObject) return;

    if (this.nearObject.type === 'pot') {
      this.handlePotAction(this.nearObject.potIndex);
    } else if (this.nearObject.type === 'breeding') {
      this.handleBreeding();
    }
  }

  handlePotAction(index) {
    const potData = this.saveData.pots[index];

   if (!potData.flower) {
      // 씨앗 없으면 기본 씨앗 지급
      const seeds = Object.keys(this.saveData.inventory).filter(
        id => this.saveData.inventory[id] > 0 && FlowerData.getFlower(id)?.growTime > 0
      );
      if (seeds.length === 0) {
        this.saveData.inventory['red_rose'] = (this.saveData.inventory['red_rose'] || 0) + 2;
        this.saveData.inventory['white_rose'] = (this.saveData.inventory['white_rose'] || 0) + 2;
        this.saveData.inventory['tulip'] = (this.saveData.inventory['tulip'] || 0) + 2;
        this.saveData.inventory['daisy'] = (this.saveData.inventory['daisy'] || 0) + 2;
        this.saveData.inventory['purple_lavender'] = (this.saveData.inventory['purple_lavender'] || 0) + 2;
        SaveSystem.save(this.saveData);
        this.showMessage('🌱 씨앗을 받았어요! 다시 눌러서 심어보세요.');
        return;
      }
      // 씨앗 선택 팝업
      this.uiScene.showSeedPanel(this.saveData.inventory, (seedId) => {
        potData.flower = seedId;
        potData.plantedAt = Date.now();
        this.saveData.inventory[seedId]--;
        SaveSystem.save(this.saveData);
        this.updatePotDisplay();
        this.showMessage('🌱 씨앗을 심었어요!');
      });

    } else if (SaveSystem.isGrown(potData)) {
      // 수확
      SaveSystem.addToInventory(this.saveData, potData.flower);
      SaveSystem.addToInventory(this.saveData, potData.flower);
      const droppedFlower = FlowerData.getFlower(potData.flower);
const dropRoll = Math.random() * 100;
if (droppedFlower.rarity === 'rare') {
  if (dropRoll < 30) {
    this.saveData.waterInventory.starlight_drop++;
    this.showMessage('⭐ 별빛 물방울을 얻었어요!');
  }
} else if (droppedFlower.rarity === 'uncommon') {
  if (dropRoll < 20) {
    this.saveData.waterInventory.moonlight_dew++;
    this.showMessage('🌙 달빛 이슬을 얻었어요!');
  }
} else {
  if (dropRoll < 10) {
    this.saveData.waterInventory.clear_water++;
    this.showMessage('💧 맑은 물을 얻었어요!');
  }
}
      const isNew = SaveSystem.discover(this.saveData, potData.flower);
      const flower = FlowerData.getFlower(potData.flower);

      if (isNew && flower.rarity === 'rare') {
        this.scene.get('UIScene').showRareDiscovery(potData.flower);
      } else {
        this.showMessage(`${flower.emoji} ${flower.name} 수확!`);
      }

      potData.flower = null;
      potData.plantedAt = null;
      SaveSystem.save(this.saveData);
      this.updatePotDisplay();
   } else {
  // 물주기 팝업 열기
  this.uiScene.showWaterPanel(this.saveData.waterInventory, (waterId) => {
    const water = FlowerData.getWater(waterId);
    if (!water) return;

    this.saveData.waterInventory[waterId]--;

    if (water.effect === 'speed') {
      this.saveData.pots[index].waterBonus = 'speed';
    } else if (water.effect === 'rare') {
      this.saveData.pots[index].waterBonus = 'rare';
    } else if (water.effect === 'special') {
      this.saveData.pots[index].waterBonus = 'special';
    }

    SaveSystem.save(this.saveData);
    this.showMessage(`${water.emoji} ${water.name} 줬어요!`);
  });
}
  }

 handleBreeding() {
    const inventory = this.saveData.inventory;
    const available = Object.keys(inventory).filter(id => inventory[id] > 0);

    if (available.length < 2) {
      this.showMessage('꽃이 2개 이상 필요해요!');
      return;
    }

    // 교배 선택 팝업 열기
    this.uiScene.showBreedingPanel(inventory, (flowerA, flowerB) => {
      const result = FlowerData.breed(flowerA, flowerB);

      // 교배 중 연출
      const flowerAEmoji = FlowerData.getFlower(flowerA).emoji;
      const flowerBEmoji = FlowerData.getFlower(flowerB).emoji;

      const loadingText = this.add.text(240, 400, `${flowerAEmoji}+${flowerBEmoji}`, {
        fontSize: '24px', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      this.tweens.add({
        targets: loadingText,
        angle: 360,
        duration: 1000,
        repeat: 2,
        ease: 'Linear'
      });

      this.time.delayedCall(3000, () => {
        loadingText.destroy();

        if (!result) {
          this.showMessage('❌ 이 조합은 교배가 안 돼요!');
          return;
        }

        inventory[flowerA]--;
        inventory[flowerB]--;
        SaveSystem.addToInventory(this.saveData, result);
        const isNew = SaveSystem.discover(this.saveData, result);
        const flower = FlowerData.getFlower(result);

        if (isNew && flower.rarity === 'rare') {
          this.uiScene.showRareDiscovery(result);
        } else {
          this.showMessage(`✨ 교배 성공! ${flower.emoji} ${flower.name} 씨앗 획득!`);
        }

        SaveSystem.save(this.saveData);
      });
    });
  }

  showMessage(text) {
    const msg = this.add.text(240, 680, text, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#2d5a27',
      padding: { x: 12, y: 8 },
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    this.time.delayedCall(2000, () => msg.destroy());
  }

  update() {
    this.movePlayer();
    this.checkNearObjects();
    this.updatePotDisplay();
  }

  movePlayer() {
    if (!this.player) return;
    const speed = 3;
    const dx = this.targetX - this.player.x;
    const dy = this.targetY - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      this.player.x += (dx / dist) * speed;
      this.player.y += (dy / dist) * speed;
    }

    // 키보드
    if (this.cursors.left.isDown)  this.player.x -= speed;
    if (this.cursors.right.isDown) this.player.x += speed;
    if (this.cursors.up.isDown)    this.player.y -= speed;
    if (this.cursors.down.isDown)  this.player.y += speed;

    // 경계
    this.player.x = Phaser.Math.Clamp(this.player.x, 30, 450);
    this.player.y = Phaser.Math.Clamp(this.player.y, 60, 760);
  }

  checkNearObjects() {
    if (!this.player) return;
    const px = this.player.x;
    const py = this.player.y;
    let nearest = null;
    let minDist = 60;

    // 화분 체크
    this.pots.forEach(pot => {
      const dist = Phaser.Math.Distance.Between(px, py, pot.x, pot.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = pot;
      }
    });

    // 교배대 체크
    const breedDist = Phaser.Math.Distance.Between(px, py, this.breedingTable.x, this.breedingTable.y);
    if (breedDist < minDist) {
      nearest = this.breedingTable;
    }

    this.nearObject = nearest;
    if (nearest) {
  if (nearest.type === 'pot') {
    const potData = this.saveData.pots[nearest.potIndex];
    if (!potData.flower) {
  this.uiScene.showAction('[ 씨앗 심기 ]');
} else if (SaveSystem.isGrown(potData)) {
  this.uiScene.showAction('[ 수확하기 ]');
} else {
  this.uiScene.showAction('[ 💧 물주기 ]');
}
  } else if (nearest.type === 'breeding') {
    this.uiScene.showAction('[ 교배하기 ]');
  }
} else {
  this.uiScene.hideAction();
    }
  }
}

// Phaser 게임 설정
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  transparent: true,
  scene: [GameScene, UIScene, ShopScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);