class FieldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FieldScene' });
  }

  create() {
    this.saveData = this.scene.get('GameScene').saveData;

    // 배경
    this.add.image(240, 400, 'field_bg').setDisplaySize(480, 800);

    // 타이틀바
    this.add.rectangle(240, 25, 480, 50, 0xf5e6c8, 1).setOrigin(0.5, 0.5);
    this.add.text(240, 25, '🌿 꽃씨 채집', {
      fontSize: '18px', color: '#5c3d1e', fontFamily: 'Georgia', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const backBtn = this.add.text(50, 25, '← 온실', {
      fontSize: '14px', color: '#5c3d1e', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    backBtn.on('pointerdown', () => {
      this.scene.stop('FieldScene');
      this.scene.resume('GameScene');
    });

    // 씨앗 스폰
    this.seeds = [];
    this.spawnSeeds();

    // 플레이어
    this.player = this.add.image(240, 600, 'player').setDisplaySize(100, 140);
    this.player.setDepth(10);
    this.targetX = 240;
    this.targetY = 600;

    // 터치 이동
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y < 50) return;
      this.targetX = ptr.x;
      this.targetY = ptr.y;
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    if (!this.scene.isActive('UIScene')) {
    this.scene.launch('UIScene');
}

    // 7초마다 씨앗 1개 생성
    this.time.addEvent({
      delay: 7000,
      callback: this.spawnOneSeed,
      callbackScope: this,
      loop: true
   });
}

 spawnSeeds() {
    const basicFlowers = ['red_rose', 'white_rose', 'tulip', 'daisy', 'purple_lavender'];
    const uncommonFlowers = ['pink_rose', 'yellow_tulip', 'white_daisy', 'blue_tulip'];
    const rareFlowers = ['moonlight_rose', 'starlight_daisy', 'rainbow_tulip'];

    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(40, 440);
      const y = Phaser.Math.Between(100, 750);
      
      const roll = Math.random() * 100;
      let flowerId;
      if (roll < 70) {
        flowerId = basicFlowers[Phaser.Math.Between(0, basicFlowers.length - 1)];
      } else if (roll < 90) {
        flowerId = uncommonFlowers[Phaser.Math.Between(0, uncommonFlowers.length - 1)];
      } else {
        flowerId = rareFlowers[Phaser.Math.Between(0, rareFlowers.length - 1)];
      }

      const flower = FlowerData.getFlower(flowerId);
      const seed = this.add.image(x, y, 'seed').setDisplaySize(40, 40).setDepth(5);
      seed.flowerId = flowerId;
      this.seeds.push(seed);
    }
  }

  spawnOneSeed() {
    const basicFlowers = ['red_rose', 'white_rose', 'tulip', 'daisy', 'purple_lavender'];
    const uncommonFlowers = ['pink_rose', 'yellow_tulip', 'white_daisy', 'blue_tulip'];
    const rareFlowers = ['moonlight_rose', 'starlight_daisy', 'rainbow_tulip'];

    const x = Phaser.Math.Between(40, 440);
    const y = Phaser.Math.Between(100, 750);
    
    const roll = Math.random() * 100;
    let flowerId;
    if (roll < 70) {
      flowerId = basicFlowers[Phaser.Math.Between(0, basicFlowers.length - 1)];
    } else if (roll < 90) {
      flowerId = uncommonFlowers[Phaser.Math.Between(0, uncommonFlowers.length - 1)];
    } else {
      flowerId = rareFlowers[Phaser.Math.Between(0, rareFlowers.length - 1)];
    }

    const flower = FlowerData.getFlower(flowerId);
    const seed = this.add.image(x, y, 'seed').setDisplaySize(40, 40).setDepth(5);

    seed.flowerId = flowerId;
    this.seeds.push(seed);
  }
  showFieldRareDiscovery(flowerId) {
    const flower = FlowerData.getFlower(flowerId);
    if (!flower) return;

    const panel = this.add.container(240, 400);
    const bg = this.add.rectangle(0, 0, 350, 280, 0x1a1a2e, 0.97).setOrigin(0.5, 0.5);
    const star = this.add.text(0, -90, '✨', { fontSize: '40px' }).setOrigin(0.5, 0.5);
    const emoji = this.add.text(0, -30, flower.emoji, { fontSize: '50px' }).setOrigin(0.5, 0.5);
    const name = this.add.text(0, 40, `${flower.name} 씨앗 발견!`, {
      fontSize: '20px', color: '#ffd700', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5);
    const closeBtn = this.add.text(0, 110, '[ 확인 ]', {
      fontSize: '18px', color: '#7fff7f', fontFamily: 'Arial',
      backgroundColor: '#2d5a27', padding: { x: 20, y: 10 }
    }).setOrigin(0.5, 0.5).setInteractive();

    closeBtn.on('pointerdown', () => panel.destroy());
    panel.add([bg, star, emoji, name, closeBtn]);
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

    // 씨앗 근처 체크
    this.seeds.forEach(seed => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, seed.x, seed.y);
      if (d < 50) {
        seed.setAlpha(1);
        if (!seed.collected) {
          seed.collected = true;
          const flower = FlowerData.getFlower(seed.flowerId);
          SaveSystem.addToInventory(this.saveData, seed.flowerId);
          SaveSystem.save(this.saveData);
          if (flower.rarity === 'rare') {
            this.showMessage(`🌟 희귀 씨앗 발견!`);
            this.showFieldRareDiscovery(seed.flowerId);
          } else if (flower.rarity === 'uncommon') {
            this.showMessage(`✨ 특별한 씨앗 발견! ${flower.name}`);
          } else {
            this.showMessage(`🌱 ${flower.name} 씨앗 획득!`);
          }

          this.tweens.add({
            targets: seed,
            y: seed.y - 30,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              seed.destroy();
              this.seeds = this.seeds.filter(s => s !== seed);
            }
          });
        }
      }
    });
  }
}