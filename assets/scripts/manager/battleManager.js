var starEntity = require("starEntity");
var sunEntity = require("sunEntity");
var sunBombEntity = require("sunBombEntity");
cc.Class({
    init:function () {
        // console.log("---init battleManager---");
        this.createSunCount = 0;
        this.createSunInterval = 90;

        this.nowAllScore = 0;//score
        this.nowEnergy = 100;
    },

    initBattle:function(){
        this.frameSize = cc.view.getFrameSize();
        this.winSize = cc.director.getWinSize();
        console.log("winSize: ", this.winSize);
        console.log("frameSize: ", this.frameSize);

        this.mainStar = new starEntity();
        this.mainStar.init(cc.p(0, -230));

        this.startX = 0;
        this.startY = 0;
        this.intervalX = 0;
        this.intervalY = 0;

        this.mainCount = 0;
        this.mainMoveInterval = 5;

        this.allMoveType = [0, 0, 0, 0, 3, 3, 4, 4];
        this.nowMoveType = this.allMoveType.concat();

        this.initEntity();
        this.energyBar = battle.layerManager.uiLayer.getChildByName("energyBar").getComponent(cc.ProgressBar);
        if(this.energyBar){
            this.energyBar.node.y = this.winSize.height * .5 - 110;
        }

        this.scoreNow = battle.layerManager.uiLayer.getChildByName("scoreNow").getComponent(cc.Label);
        if(this.scoreNow){
            this.scoreNow.node.y = this.winSize.height * .5 - 150;
            this.scoreNow.string = "Score:" + this.nowAllScore;
        }

        this.wxHead = battle.layerManager.uiLayer.getChildByName("wxHead").getComponent(cc.Sprite);
        if(this.wxHead){
            this.wxHead.node.y = this.winSize.height * .5 - 50;
            var self = this;
            if(battle.wxManager.userInfo && battle.wxManager.userInfo.avatarUrl != ""){
                cc.loader.load({url: battle.wxManager.userInfo.avatarUrl, type: 'jpg'},
                    function (err, texture) {
                        self.wxHead.spriteFrame = new cc.SpriteFrame(texture);
                        self.wxHead.node.width = 60;
                        self.wxHead.node.height = 60;
                    }
                );
            }
        }

        this.wxName = battle.layerManager.uiLayer.getChildByName("wxName").getComponent(cc.Label);
        if(this.wxName){
            this.wxName.node.y = this.winSize.height * .5 - 50;
            if(battle.wxManager.userInfo){
                this.wxName.string = battle.wxManager.userInfo.nickName;
            }
        }

        
    },

    initEntity:function(){
        for(var i = 0; i < 10; i++){
            var sun = new sunEntity();
            sun.init(cc.p(-320 + 640 * this.getRandom(), 640));
            battle.poolManager.putInPool(sun);

            if(i < 5){
                var bomb = new sunBombEntity();
                bomb.init(sun.initPos, sun.lastColor);
                battle.poolManager.putInPool(bomb);
            }
        }
    },

    getRandom:function(){
        return Math.random();
    },

    getSunMoveType:function(){
        if(this.nowMoveType.length == 0){
            this.nowMoveType = this.allMoveType.concat();
        }
        var index = Math.floor(this.getRandom() * this.nowMoveType.length);
        var moveType = this.nowMoveType.splice(index, 1);
        return moveType[0];
    },

    onLeftFunc:function(event){
        if(this.mainStar){
            this.mainStar.moveDirect = -1;
        }
    },

    onRightFunc:function(event){
        if(this.mainStar){
            this.mainStar.moveDirect = 1;
        }
    },

    changeStatus:function(){
        if(this.isGameOver) return;
        if(this.mainMoveInterval < 23){
            this.mainMoveInterval += 0.1;
        }
        if(this.createSunInterval > 30){
            this.createSunInterval--;
        }
        this.nowAllScore += 10;
        this.scoreNow.string = "Score:" + this.nowAllScore;
        if(this.nowEnergy > 0 && this.nowEnergy < 100){
            this.nowEnergy += 5;
            if(this.nowEnergy > 100){
                this.nowEnergy = 100;
            }
            this.energyBar.progress = this.nowEnergy / 100;
        }
        console.log("mainMoveInterval:" + this.mainMoveInterval);
        console.log("createSunInterval:" + this.createSunInterval);
    },

    changeEnergyBar:function(){
        if(this.mainMoveInterval < 23){
            this.mainMoveInterval += 0.1;
        }
        if(this.createSunInterval > 30){
            this.createSunInterval--;
        }
    },

    gameOver:function(){
        if(!this.isGameOver){
            if(this.mainStar){
                this.mainStar.setDead();
            }
            this.isGameOver = true;
            battle.wxManager.nowScore = this.nowAllScore;
            battle.layerManager.uiLayer.getChildByName("gotoRankingBtn").active = true;
            battle.layerManager.uiLayer.getChildByName("scoreTitle").active = true;
            battle.layerManager.uiLayer.getChildByName("scoreLabel").active = true;
            battle.layerManager.uiLayer.getChildByName("scoreLabel").getComponent(cc.Label).string = this.nowAllScore;
            // cc.director.loadScene("rankingScene");
            let score = this.nowAllScore;
            if (CC_WECHATGAME) {
                console.log("提交得分: x1 : " + score);
                window.wx.postMessage({
                    messageType: 3,
                    MAIN_MENU_NUM: "x1",
                    score: score,
                });
            } else {
                console.log("提交得分: x2 : " + score);
            }
        }
    },

    step:function(){
        if(this.isGameOver) return;
        this.mainStep();
        this.createSunStep();
    },

    mainStep:function(){
        if(this.isGameOver) return;
        if(this.mainStar){
            if(this.mainStar.getEntityX() < -320){
                this.gameOver();
            }else if(this.mainStar.getEntityX() > 320){
                this.gameOver();
            }
        }
    },

    createSunStep:function(){
        this.createSunCount++;
        if(this.createSunCount % this.createSunInterval == 0){
            var sun = battle.poolManager.getFromPool(gameConst.ENTITY_TYPE.SUN);
            if(sun){
                sun.getFromPool(cc.p(-this.winSize.width * .4 + this.winSize.width * .8 * this.getRandom(), this.winSize.height * .5));
            }else{
                sun = new sunEntity();
                sun.init(cc.p(-this.winSize.width * .4 + this.winSize.width * .8 * this.getRandom(), this.winSize.height * .5));
            }
        }
    },

    clear:function(){
        this.createSunCount = 0;
        this.createSunInterval = 90;
        this.nowAllScore = 0;
        this.nowEnergy = 100;
    }
})