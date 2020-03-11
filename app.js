
new Vue({
	el: '#monsterGame',
  data: {
  	levelSelected: false,
    levelDifficulty: '',
    levelSpeed: 0,
  	gameStarted: false,
  	you: {
    	name: '',
    	wins: 0,
    	hp: 100
    },
    enemy: {
    	name: '',
    	wins: 0,
    	hp: 100
    },
    enemyAttackInterval: null,
    enemyHealInterval: null,
    specialAttackInterval: null,
    disabledSpecialAttack: true,
    actions: []
  },
  computed: {
  	hpLeftYou: function() {
    	return { width: this.getWidthCalculation(this.you) }
    },
    hpLeftEnemy: function() {
    	return { width: this.getWidthCalculation(this.enemy) }
    }
  },
  methods: {
  	resetDifficulty: function() {
    	this.levelSelected = false;
      this.levelDifficulty = '';
      this.levelSpeed = 0;
      
      this.you.wins = 0;
      this.enemy.wins = 0;
    },
  	setDifficulty: function(difficulty) {
    	if (!this.you.name || !this.enemy.name) {
      	alert('Select your name and enemy name before going to battle');
        return;
      }
      this.levelSelected = true;
      this.levelDifficulty = difficulty;
      
      switch (this.levelDifficulty) {
      	case 'easy': this.levelSpeed = 10; break;
        case 'medium': this.levelSpeed = 7; break;
        case 'hard': this.levelSpeed = 4; break;
      }
    },
  	getWidthCalculation: function(obj) {
    	if (!obj) return;
      
    	const hp = obj.hp;
    	const divide = (hp > 100) ? 100 : (hp < 0) ? 0 : hp;
      
      obj.hp = divide;
      return (divide !== 0) ? `calc(100% / (100 / ${divide}))` : 0;
    },
    generateEnemyAttackTime: function() { 
    	return Math.floor(Math.random() * 100) * this.levelSpeed;
    },
    generateEnemyHealTime: function() {
    	return Math.floor(Math.random() * 100) * (this.levelSpeed * 4);
    },
    generateAttackHp: _ => Math.floor(Math.random() * 10),
    generateHealHp: _ =>  Math.floor(Math.random() * 4) + 1,
    generateSpecialAttackHp: function() { 
    	const output = Math.floor(Math.random() * 50);
      if (output < 15) {
      	this.generateSpecialAttackHp();
      }
      
      return output;
    },
    setEnemyToAttack: function() {
    	const vm = this;
      const enemyAttackTime = this.generateEnemyAttackTime();
      
      this.enemyAttackInterval = setInterval(function(){
      	const enemyAttack = vm.generateAttackHp()
      	vm.you.hp -= enemyAttack;
        
      	if (vm.you.hp <= 0) {
        	vm.resetGame();
          vm.enemy.wins++;
          
          alert("YOU LOST! ENEMY BEAT THE SHIT OUT OF YOU");
          return;
        }
        
        const action = { type: '', label: '' }
        
        if (enemyAttack > 0) {
        	action.type = 'enemy-hit';
        	action.label = `${vm.enemy.name} hits ${vm.you.name} for ${enemyAttack} HP`
          
        } else {
        	action.type = 'enemy-missed';
          action.label =  `PHEEW, You we're lucky! ${vm.enemy.name} missed ${vm.you.name}!`
        }
                
        vm.actions.unshift(action);
      }, enemyAttackTime)
    },
    setEnemyToHeal: function() {
    	const vm = this;
      const enemyHealTime = this.generateEnemyHealTime();
      
      this.enemyHealInterval = setInterval(function(){
      	const healHp = vm.generateHealHp();
        vm.enemy.hp += healHp;
        
        vm.actions.unshift({
          type: 'enemy-heal',
          label: `${vm.enemy.name} heals with ${healHp} HP`
        })
      }, enemyHealTime)
    },
    setYouSpecialAttack: function() {
    	const vm = this;
      this.specialAttackInterval = setInterval(function(){
      	vm.disabledSpecialAttack = parseInt(Math.random() * 1000) % 7 !== 0;
      }, 500);
    },
    startGame: function() {
    	this.gameStarted = true;
			
      this.setEnemyToAttack();
      this.setEnemyToHeal();
      
      this.setYouSpecialAttack();
    },
    attack: function() {
    	const youAttack = this.generateAttackHp()
      this.enemy.hp -= youAttack;
      
      if (this.enemy.hp <= 0) {
        this.resetGame();
        this.you.wins++;

        alert("CONGRATULATIONS! You won!! Wanna go again?");
        return;
      }

      const action = { type: '', label: '' }
      if (youAttack > 0) {
      	action.type = 'you-hit';
        action.label = `${this.you.name} hits ${this.enemy.name} with a ${youAttack} damage!`;
        
      } else {
      	action.type = 'you-missed';
        action.label = `OH SHIT! ${this.you.name} missed ${this.enemy.name}... so close`;
      }
      
      this.actions.unshift(action);
    },
    specialAttack: function() {
    	if (this.disabledSpecialAttack) {
      	return;
      }
      
    	const youSpecialAttack = this.generateSpecialAttackHp()
      this.enemy.hp -= youSpecialAttack;
      
      if (this.enemy.hp <= 0) {
      	this.resetGame();
        this.you.wins += 3;
        
        alert("OMG! YOU DESTROYED YOUR OPPONENT WITH THE SPECIAL ATTACK!! You get 3 wins");
        return
      }
      
      this.actions.unshift({ 
      	type: 'you-hit-special',
        label: `SPECIAL ATTACK COMBO: ${this.you.name} hits ${this.enemy.name} with ${youSpecialAttack} damage!`
      });
    },
    heal: function() {
    	const healHp = this.generateHealHp();
    	this.you.hp += healHp;
      
      this.actions.unshift({
      	type: 'you-heal',
        label: `${this.you.name} heals with ${healHp} HP`
      })
    },
    giveUp: function() {
    	this.resetGame();
      this.enemy.wins++;
      
      if (confirm("YOU PUSSY! QUITERS ARE NEVER WINNERS, TRY AGAIN?")) {
      	this.startGame()
      }
    },
    resetGame: function() {
    	clearInterval(this.enemyAttackInterval);
      clearInterval(this.enemyHealInterval);
      clearInterval(this.specialAttackInterval);
    	
      this.you.hp = 100;
      this.enemy.hp = 100;
      
      this.gameStarted = false;
      this.actions = [];
    }
  }
})
