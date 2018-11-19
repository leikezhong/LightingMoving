var baseEntity = require("baseEntity");
var sunBombEntity = require("sunBombEntity");
cc.Class({
    extends: baseEntity,

    init:function(initPos){
        this._super();
        this.entityType = gameConst.ENTITY_TYPE.SUN;
        this.initPos = initPos;
        this.itemCount = 0;
        this.radius = 0;

        this.sunParticle = cc.instantiate(cc.loader.getRes("prefabs/sun_particle"));
        battle.layerManager.enemyLayer.addChild(this.sunParticle);

        this.sunParticle.x = initPos.x;
        this.sunParticle.y = initPos.y;

        this.lastColor = new cc.Color(Math.floor(battle.battleManager.getRandom() * 255), Math.floor(battle.battleManager.getRandom() * 255), Math.floor(battle.battleManager.getRandom() * 255), 255);

        this.particleSystem = this.sunParticle.getComponent(cc.ParticleSystem);
        this.particleSystem.startColor = this.lastColor;
        this.particleSystem.endColor = this.lastColor;

        this.sunParticle.getComponent("sunParticle").host = this;

        this.moveType = 0;
        this.moveCount = 0;
        this.nowMoveInterval = battle.battleManager.mainMoveInterval;

        // console.log("create sun entity");
    },

    getFromPool:function(initPos){
        this.baseFrame = 0;
        this.isInPool = false;
        this.initPos = initPos;
        this.itemCount = 0;
        this.moveType = battle.battleManager.getSunMoveType();
        this.moveCount = 0;
        this.radius = 0;
        this.nowMoveInterval = battle.battleManager.mainMoveInterval;
        if(this.moveType == 3){
            if(this.initPos.x < -battle.battleManager.winSize.width * .5 + 150){
                this.initPos.x = -battle.battleManager.winSize.width * .5 + 150;
            }else if(this.initPos.x > battle.battleManager.winSize.width * .5 - 150){
                this.initPos.x = battle.battleManager.winSize.width * .5 - 150;
            }
        }
        if(this.sunParticle && this.particleSystem){
            this.sunParticle.x = this.initPos.x;
            this.sunParticle.y = this.initPos.y;
            this.sunParticle.active = true;
            this.lastColor = new cc.Color(Math.floor(battle.battleManager.getRandom() * 255), Math.floor(battle.battleManager.getRandom() * 255), Math.floor(battle.battleManager.getRandom() * 255), 255);
            this.particleSystem.startColor = this.lastColor;
            this.particleSystem.endColor = this.lastColor;
            this.particleSystem.resetSystem();
        }
        battle.entityManager.addEntity(this);
    },

    putInPool:function(){
        this.baseFrame = 0;
        this.isInPool = true;
        if(this.particleSystem && this.sunParticle){
            this.sunParticle.active = false;
            this.particleSystem.stopSystem();
        }
        battle.entityManager.removeEntity(this);
    },

    getEntityX:function(){
        return this.sunParticle.x;
    },

    getEntityY:function(){
        return this.sunParticle.y;
    },

    createBomb:function(){
        var bomb = battle.poolManager.getFromPool(gameConst.ENTITY_TYPE.SUN_BOMB);
        if(bomb){
            bomb.getFromPool(cc.p(this.getEntityX(), this.getEntityY()), this.lastColor);
        }else{
            bomb = new sunBombEntity();
            bomb.init(cc.p(this.getEntityX(), this.getEntityY()), this.lastColor);
        }
        battle.poolManager.putInPool(this);
    },

    step:function(){
        if(this.isInPool)   return;
        this._super();
        this.moveStep();
    },

    moveStep:function(){
        this.moveCount++;
        if(this.sunParticle){
            switch(this.moveType){
                case 0:
                    //直线向下
                    this.sunParticle.y -= this.nowMoveInterval;
                    break;
                case 1:
                    //顺时针
                    this.itemCount++;
                    this.radius = (Math.PI / 180) * this.itemCount * 3;
                    this.sunParticle.x = this.initPos.x - Math.sin(this.radius) * 200;
                    this.sunParticle.y = this.initPos.y - Math.cos(this.radius) * 30 * this.nowMoveInterval - this.nowMoveInterval * this.moveCount * .09;
                    break;
                case 2:
                    //逆时针
                    this.itemCount++;
                    this.radius = (Math.PI / 180) * this.itemCount * 3;
                    this.sunParticle.x = this.initPos.x + Math.sin(this.radius) * 200;
                    this.sunParticle.y = this.initPos.y - Math.cos(this.radius) * 30 * this.nowMoveInterval - this.nowMoveInterval * this.moveCount * .09;
                    break;
                case 3:
                    //曲线
                    this.itemCount++;
                    this.radius = (Math.PI / 180) * this.itemCount * 3;
                    this.sunParticle.x = this.initPos.x + Math.sin(this.radius) * 150;
                    this.sunParticle.y = this.initPos.y - this.nowMoveInterval * this.moveCount * .8;
                    break;
                case 4:
                    //折线
                    if(!this.moveDirect){
                        this.moveDirect = battle.battleManager.getRandom()<0.5?-1:1;
                    }
                    this.sunParticle.x += this.moveDirect * this.nowMoveInterval * .6;
                    this.sunParticle.y -= this.nowMoveInterval;
                    if(this.sunParticle.x < -battle.battleManager.winSize.width * .5 + 10){
                        this.moveDirect = -this.moveDirect;
                        this.sunParticle.x = -battle.battleManager.winSize.width * .5 + 10;
                    }else if(this.sunParticle.x > battle.battleManager.winSize.width * .5 - 10){
                        this.moveDirect = -this.moveDirect;
                        this.sunParticle.x = battle.battleManager.winSize.width * .5 - 10;
                    }
                    break;
                case 5:
                    //
                    
                    break;
            }
            if(this.sunParticle.y < -battle.battleManager.winSize.height * .6){
                battle.poolManager.putInPool(this);
                battle.battleManager.changeEnergyBar();
            }
        }
    },

    clear:function(){
        this.particleSystem = null;
        if(this.sunParticle){
            this.sunParticle.destroy();
            this.sunParticle = null;
        }
        this._super();
    }
})