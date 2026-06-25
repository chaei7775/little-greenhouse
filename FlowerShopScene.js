class FlowerShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FlowerShopScene' });
  }

  create() {
    this.saveData = this.scene.get('GameScene').saveData;

    // 배경
    this.add.image(240, 400, 'flowershop_bg').setDisplaySize(480, 800);

    // 타이틀바
    this.add.rectangle(240, 25, 480, 50, 0xf5e6c8, 1).setOrigin(0.5, 0.5);
    this.add.text(240, 25, '🌸 꽃집', {
      fontSize: '18px', color: '#5c3d1e', fontFamily: 'Georgia', fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // 온실로 돌아가기 버튼
    const backBtn = this.add.text(50, 25, '← 온실', {
      fontSize: '14px', color: '#5c3d1e', fontFamily: 'Arial'
    }).setOrigin(0.5, 0.5).setInteractive();
    backBtn.on('pointerdown', () => {
      this.scene.stop('FlowerShopScene');
      this.scene.resume('GameScene');
    });

    // 플레이어
    this.player = this.add.image(240, 620, 'player').setDisplaySize(100, 140);
    this.player.setDepth(10);
    this.targetX = 240;
    this.targetY = 620;

    // 터치 이동
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y > 720) return;
      this.targetX = ptr.x;
      this.targetY = ptr.y;
    });

    this.cursors = this.input.keyboard.createCursorKeys();
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