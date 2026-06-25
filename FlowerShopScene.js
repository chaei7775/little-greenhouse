class FlowerShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FlowerShopScene' });
  }

  create() {
    this.saveData = this.scene.get('GameScene').saveData;
    if (!this.saveData.displaySlots) this.saveData.displaySlots = [null, null, null, null];
    if (!this.saveData.bouquetInventory) this.saveData.bouquetInventory = [];

    // 배경
    this.add.image(240, 400, 'flowershop_bg').setDisplaySize(480, 800);

    // 타이틀바
    this.add.rectangle(240, 25, 480, 50, 0xf5e6c8, 1).setOrigin(0.5, 0.5);
    this.add.text(240, 25, '🌸 꽃집', {
      fontSize: '18px', color: '#5c3d1e', fontFamily: 'Georgia', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const backBtn = this.add.text(50, 25, '← 온실', {
      fontSize: '14px', color: '#5c3d1e', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    backBtn.on('pointerdown', () => {
      this.scene.stop('FlowerShopScene');
      this.scene.resume('GameScene');
    });

    // 가방 버튼
const bagBtn = this.add.text(440, 25, '🎒', {
  fontSize: '22px', fontFamily: 'Arial'
}).setOrigin(0.5, 0.5).setInteractive();

bagBtn.on('pointerdown', () => {
  this.showShopInventory(this.saveData.inventory);
});

    this.createDisplayShelves();
    this.createWorkTable();

    // 플레이어
    this.player = this.add.image(240, 620, 'player').setDisplaySize(100, 140);
    this.player.setDepth(10);
    this.targetX = 240;
    this.targetY = 620;

    // 터치 이동
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 720) return;
      if (ptr.y < 50) return; // 타이틀바 터치 무시
      this.targetX = ptr.x;
      this.targetY = ptr.y;
    });

    
    this.cursors = this.input.keyboard.createCursorKeys();

    // UIScene 실행
    this.scene.launch('UIScene');

// 손님 타이머
    this.guestTimer = this.time.addEvent({
      delay: 30000,
      callback: this.spawnGuest,
      callbackScope: this,
      loop: true
    });
   }

  createDisplayShelves() {
    const positions = [
      { x: 80, y: 180 }, { x: 200, y: 180 }, { x: 320, y: 180 }, { x: 440, y: 180 },
      { x: 80, y: 290 }, { x: 200, y: 290 }, { x: 320, y: 290 }, { x: 440, y: 290 }
    ];
    
    // displaySlots 8칸으로 확장
    if (this.saveData.displaySlots.length < 8) {
      this.saveData.displaySlots = [...this.saveData.displaySlots, ...Array(8 - this.saveData.displaySlots.length).fill(null)];
    }

    positions.forEach((pos, i) => {
      this.add.rectangle(pos.x, pos.y, 90, 90, 0xf5e6c8, 0.8)
        .setOrigin(0.5, 0.5)
        .setStrokeStyle(2, 0xd4a373);
      
      const slot = this.saveData.displaySlots[i];
      if (slot) {
        const bouquet = FlowerData.bouquets.find(b => b.id === slot.id);
        if (bouquet) {
          this.add.text(pos.x, pos.y - 5, bouquet.emoji, {
            fontSize: '35px', fontFamily: 'Arial'
          }).setOrigin(0.5, 0.5);
          this.add.text(pos.x, pos.y + 35, bouquet.name, {
            fontSize: '8px', color: '#5c3d1e', fontFamily: 'Arial'
          }).setOrigin(0.5, 0.5);
        }
      } else {
        this.add.text(pos.x, pos.y, '+', {
          fontSize: '30px', color: '#d4a373', fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5).setInteractive()
        .on('pointerdown', () => this.showBouquetPanel(i));
      }
    });
  }

  createWorkTable() {
    this.add.rectangle(240, 430, 280, 100, 0xf5e6c8, 0.8)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(2, 0xd4a373);
    
    this.add.text(240, 415, '🌿 꽃다발 작업대', {
      fontSize: '14px', color: '#5c3d1e', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const makeBtn = this.add.text(240, 445, '[ 꽃다발 만들기 ]', {
      fontSize: '14px', color: '#5c3d1e', fontFamily: 'Georgia', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5).setInteractive();

    makeBtn.on('pointerdown', () => this.showMakeBouquetPanel());
  }

  showMakeBouquetPanel() {
    if (this.makePanel) this.makePanel.destroy();

    this.makePanel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 420, 550, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -250, '💐 꽃다발 만들기', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(190, -250, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.makePanel.destroy());

    this.makePanel.add([bg, title, closeBtn]);

    FlowerData.bouquets.forEach((bouquet, i) => {
      const y = i * 60 - 190;
      
      const canMake = bouquet.flowers.every(flowerId => 
        (this.saveData.inventory[flowerId] || 0) > 0
      );

      const price = bouquet.flowers.reduce((sum, flowerId) => {
        const flower = FlowerData.getFlower(flowerId);
        return sum + (flower ? flower.price * 8 : 0);
      }, 0);

      const btn = this.add.text(0, y, `${bouquet.emoji} ${bouquet.name}  💰${price}`, {
        fontSize: '14px',
        color: canMake ? '#ffffff' : '#666666',
        backgroundColor: canMake ? '#2d5a27' : '#333333',
        padding: { x: 15, y: 8 },
        fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      if (canMake) {
        btn.setInteractive();
        btn.on('pointerdown', () => {
          bouquet.flowers.forEach(flowerId => {
            this.saveData.inventory[flowerId]--;
          });
          this.saveData.bouquetInventory.push({ id: bouquet.id, price });
          SaveSystem.save(this.saveData);
          this.makePanel.destroy();
          this.showMessage(`💐 ${bouquet.name} 완성!`);
        });
      }

      this.makePanel.add(btn);
    });
  }

  showBouquetPanel(slotIndex) {
    if (this.bouquetPanel) this.bouquetPanel.destroy();

    const bouquets = this.saveData.bouquetInventory;
    if (bouquets.length === 0) {
      this.showMessage('진열할 꽃다발이 없어요!');
      return;
    }

    this.bouquetPanel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 380, 400, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -170, '진열할 꽃다발 선택', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);
    const closeBtn = this.add.text(170, -170, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.bouquetPanel.destroy());

    this.bouquetPanel.add([bg, title, closeBtn]);

    bouquets.forEach((b, i) => {
      const bouquet = FlowerData.bouquets.find(bq => bq.id === b.id);
      if (!bouquet) return;
      const y = i * 60 - 100;

      const btn = this.add.text(0, y, `${bouquet.emoji} ${bouquet.name}  💰${b.price}`, {
        fontSize: '14px', color: '#ffffff',
        backgroundColor: '#2d5a27', padding: { x: 15, y: 8 },
        fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5).setInteractive();

      btn.on('pointerdown', () => {
        this.saveData.displaySlots[slotIndex] = b;
        this.saveData.bouquetInventory.splice(i, 1);
        SaveSystem.save(this.saveData);
        this.bouquetPanel.destroy();
        this.scene.restart();
      });

      this.bouquetPanel.add(btn);
    });
  }

  spawnGuest() {
    // 진열대에 꽃다발 있는지 체크
    const hasItems = this.saveData.displaySlots.some(slot => slot !== null);
    if (!hasItems) return;

    // 손님 등장 (문에서 걸어옴)
    this.guest = this.add.text(430, 120, '🚶‍♀️', {
      fontSize: '40px', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setDepth(5);

    // 진열대로 걸어오기
    this.tweens.add({
      targets: this.guest,
      x: 240,
      y: 280,
      duration: 2000,
      ease: 'Linear',
      onComplete: () => {
        this.guestBrowse();
      }
    });
  }

  guestBrowse() {
    // 꽃다발 구경하다가 구매
    this.time.delayedCall(2000, () => {
      // 랜덤으로 꽃다발 구매
      const filledSlots = this.saveData.displaySlots
        .map((slot, i) => ({ slot, i }))
        .filter(({ slot }) => slot !== null);

      if (filledSlots.length === 0) {
        this.guestLeave();
        return;
      }

      const { slot, i } = filledSlots[Math.floor(Math.random() * filledSlots.length)];
      const bouquet = FlowerData.bouquets.find(b => b.id === slot.id);

      // 구매!
      this.sound.play('coin');
      this.saveData.money += slot.price;
      this.saveData.displaySlots[i] = null;
      SaveSystem.save(this.saveData);

      this.showMessage(`💰 ${bouquet.name} 판매! +${slot.price}`);
      this.guestLeave();
      this.scene.restart();
    });
  }

  guestLeave() {
    if (!this.guest) return;
    this.tweens.add({
      targets: this.guest,
      x: 430,
      y: 120,
      duration: 2000,
      ease: 'Linear',
      onComplete: () => {
        if (this.guest) this.guest.destroy();
      }
    });
  }

  showShopInventory(inventory) {
    if (this.invPanel) this.invPanel.destroy();

    this.invPanel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 420, 500, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const title = this.add.text(0, -220, '🎒 인벤토리', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const closeBtn = this.add.text(190, -220, '✕', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    closeBtn.on('pointerdown', () => this.invPanel.destroy());

    this.invPanel.add([bg, title, closeBtn]);
    const moneyText = this.add.text(0, -185, `💰 ${this.saveData.money}`, {
  fontSize: '14px', color: '#ffd700', fontFamily: 'Arial'
}).setOrigin(0.5, 0.5);
this.invPanel.add(moneyText);

    const flowers = Object.keys(inventory).filter(id => inventory[id] > 0);

    if (flowers.length === 0) {
      const empty = this.add.text(0, 0, '꽃이 없어요!', {
        fontSize: '16px', color: '#aaaaaa', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);
      this.invPanel.add(empty);
      return;
    }

    flowers.forEach((id, i) => {
      const flower = FlowerData.getFlower(id);
      if (!flower) return;
      const x = (i % 4) * 90 - 135;
      const y = Math.floor(i / 4) * 90 - 130;

      const item = this.add.image(x, y, id).setDisplaySize(50, 50);
      const name = this.add.text(x, y + 35, flower.name, {
        fontSize: '9px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);
      const count = this.add.text(x + 22, y - 18, `x${inventory[id]}`, {
        fontSize: '10px', color: '#ffd700', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      this.invPanel.add([item, name, count]);
    });
  }
  showMessage(text) {
    const msg = this.add.text(240, 700, text, {
      fontSize: '14px', color: '#ffffff',
      backgroundColor: '#5c3d1e', padding: { x: 12, y: 8 },
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);
    this.time.delayedCall(2000, () => msg.destroy());
  }

  update() {
    const speed = 3;
    const dx = this.targetX - this.player.x;
    const dy = this.targetY - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      this.player.x += (dx / dist) * speed;
      this.player.y += (dy / dist) * speed;
    }

    if (this.cursors.left.isDown) this.player.x -= speed;
    if (this.cursors.right.isDown) this.player.x += speed;
    if (this.cursors.up.isDown) this.player.y -= speed;
    if (this.cursors.down.isDown) this.player.y += speed;

    this.player.x = Phaser.Math.Clamp(this.player.x, 30, 450);
    this.player.y = Phaser.Math.Clamp(this.player.y, 60, 760);
  }
}