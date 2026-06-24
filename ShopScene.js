class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.saveData = this.scene.get('GameScene').saveData;

    this.add.rectangle(240, 400, 480, 800, 0xfdf6e3).setOrigin(0.5, 0.5);

    this.add.text(240, 40, '🌸 꽃 상점', {
      fontSize: '22px', color: '#5c3d1e', fontFamily: 'Georgia', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.moneyText = this.add.text(400, 40, `💰 ${this.saveData.money}`, {
      fontSize: '16px', color: '#5c3d1e', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const backBtn = this.add.text(50, 40, '← 온실', {
      fontSize: '16px', color: '#5c3d1e', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    backBtn.on('pointerdown', () => {
      this.scene.stop('ShopScene');
      this.scene.resume('GameScene');
    });

    this.createSellSection();
    this.createBuySection();
  }

  createSellSection() {
    this.add.text(240, 90, '🌷 꽃 팔기', {
      fontSize: '16px', color: '#5c3d1e', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const inventory = this.saveData.inventory;
    const flowers = Object.keys(inventory).filter(id => inventory[id] > 0);

    if (flowers.length === 0) {
      this.add.text(240, 150, '팔 꽃이 없어요!', {
        fontSize: '14px', color: '#aaaaaa', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);
      return;
    }

    flowers.forEach((id, i) => {
      const flower = FlowerData.getFlower(id);
      if (!flower) return;
      const x = (i % 4) * 100 + 65;
      const y = Math.floor(i / 4) * 90 + 150;

      const item = this.add.image(x, y, flower.id).setDisplaySize(50, 50).setInteractive();
    

      this.add.text(x, y + 35, `x${inventory[id]}`, {
        fontSize: '11px', color: '#5c3d1e', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      this.add.text(x, y + 50, `💰${Math.floor(flower.price * 4)}`, {
        fontSize: '11px', color: '#c8860a', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      item.on('pointerdown', () => {
        this.showQuantityPopup('sell', id, flower, inventory[id]);
      });
    });
  }

 createBuySection() {
    this.add.text(240, 370, '🌱 씨앗 구매', {
      fontSize: '16px', color: '#5c3d1e', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // 기본꽃 씨앗만 판매
    const seedIds = ['red_rose', 'white_rose', 'tulip', 'daisy', 'purple_lavender'];
    seedIds.forEach((id, i) => {
      const flower = FlowerData.getFlower(id);
      if (!flower) return;
      const price = Math.floor(flower.price * 0.5);
      const x = (i % 4) * 100 + 65;
      const y = Math.floor(i / 4) * 90 + 430;

     const item = this.add.image(x, y, flower.id).setDisplaySize(50, 50).setInteractive();
      this.add.text(x, y + 35, `💰${price}`, {
        fontSize: '11px', color: '#c8860a', fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5);

      item.on('pointerdown', () => {
        this.showQuantityPopup('buy', id, flower, null, price);
      });
    });

    this.add.text(240, 560, '💧 물 구매', {
      fontSize: '16px', color: '#5c3d1e', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const waters = FlowerData.waters;
    waters.forEach((water, i) => {
      const y = i * 70 + 620;
      const count = this.saveData.waterInventory[water.id] || 0;
      const price = water.id === 'clear_water' ? 10 : water.id === 'moonlight_dew' ? 30 : 100;

      const btn = this.add.text(240, y, `${water.emoji} ${water.name}  💰${price}  (보유: ${count})`, {
        fontSize: '14px', color: '#5c3d1e',
        backgroundColor: '#f5e6c8', padding: { x: 15, y: 8 },
        fontFamily: 'Arial'
      }).setOrigin(0.5, 0.5).setInteractive();

      btn.on('pointerdown', () => {
        this.showQuantityPopup('buy', water.id, water, null, price);
      });
    });
  }

  showQuantityPopup(type, id, item, maxQty, price) {
    if (this.popup) this.popup.destroy();

    this.popup = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 300, 220, 0x1a1a2e, 0.95).setOrigin(0.5, 0.5);

    const title = this.add.text(0, -80, type === 'sell' ? `${item.emoji} 판매` : `${item.emoji} 구매`, {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const priceText = this.add.text(0, -45, type === 'sell' ? `개당 💰${Math.floor(item.price * 4)}` : `개당 💰${price}`, {
      fontSize: '14px', color: '#ffd700', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    let qty = 1;

    const qtyText = this.add.text(0, 0, `${qty}개`, {
      fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const totalText = this.add.text(0, 35, type === 'sell' ? `총 💰${qty * Math.floor(item.price * 4)}` : `총 💰${qty * price}`, {
      fontSize: '14px', color: '#ffd700', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);

    const minusBtn = this.add.text(-60, 0, '－', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial',
      backgroundColor: '#5c3d1e', padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0.5).setInteractive();

    const plusBtn = this.add.text(60, 0, '＋', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial',
      backgroundColor: '#5c3d1e', padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0.5).setInteractive();

    minusBtn.on('pointerdown', () => {
      if (qty > 1) {
        qty--;
        qtyText.setText(`${qty}개`);
       totalText.setText(type === 'sell' ? `총 💰${qty * Math.floor(item.price * 4)}` : `총 💰${qty * price}`);
      }
    });

    plusBtn.on('pointerdown', () => {
      const limit = type === 'sell' ? maxQty : Math.floor(this.saveData.money / price);
      if (qty < limit) {
        qty++;
        qtyText.setText(`${qty}개`);
        totalText.setText(type === 'sell' ? `총 💰${qty * Math.floor(item.price * 4)}` : `총 💰${qty * price}`);
      }
    });

    const confirmBtn = this.add.text(50, 85, '확인', {
      fontSize: '16px', color: '#ffffff',
      backgroundColor: '#2d5a27', padding: { x: 20, y: 8 },
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();

    const cancelBtn = this.add.text(-50, 85, '취소', {
      fontSize: '16px', color: '#ffffff',
      backgroundColor: '#8b0000', padding: { x: 20, y: 8 },
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();

    cancelBtn.on('pointerdown', () => this.popup.destroy());

    confirmBtn.on('pointerdown', () => {
      if (type === 'sell') {
        this.saveData.inventory[id] -= qty;
        this.saveData.money += qty * Math.floor(item.price * 4);
      } else {
        const total = qty * price;
        if (this.saveData.money >= total) {
          this.saveData.money -= total;
          this.saveData.waterInventory[id] = (this.saveData.waterInventory[id] || 0) + qty;
        }
      }
      SaveSystem.save(this.saveData);
      this.popup.destroy();
      this.scene.restart();
    });

    this.popup.add([bg, title, priceText, qtyText, totalText, minusBtn, plusBtn, confirmBtn, cancelBtn]);
  }

  showMessage(text) {
    const msg = this.add.text(240, 760, text, {
      fontSize: '14px', color: '#ffffff',
      backgroundColor: '#5c3d1e', padding: { x: 12, y: 8 },
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);
    this.time.delayedCall(2000, () => msg.destroy());
  }
}