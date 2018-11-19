cc.Class({
    extends: cc.Component,

    properties: {
        mainLayer:cc.Node,
        uiLayer:cc.Node
    },

    start:function(){
        cc.director.preloadScene("rankingScene", function () {
            cc.log("rankingScene preloaded");
        });
        // cc.director.setDisplayStats(true);
    },

    onLoad:function(){
        this.allManager = [
            "battleManager",
            "collisionManager",
            "enterFrameManager",
            "entityManager",
            "layerManager",
            "poolManager",
            "resourceManager"
        ];

        for(let i = 0; i < this.allManager.length; i++){
            let manager = require(this.allManager[i]);
            battle[this.allManager[i]] = new manager();
            battle[this.allManager[i]].init();
        }
        battle.resourceManager.loadBaseResource(this.loadComplete.bind(this));
    },

    loadComplete:function(){
        battle.layerManager.initAllLayer(this);
        battle.enterFrameManager.initEnterFrame();
        battle.collisionManager.initCollision();
        battle.battleManager.initBattle();
    },

    update:function(dt){
        battle.battleManager.step();
        battle.entityManager.step();
    },

    gotoRanking:function(){
        cc.director.loadScene("rankingScene");
    },

    onLeftFunc:function(event){
        battle.battleManager.onLeftFunc(event);
    },

    onRightFunc:function(event){
        battle.battleManager.onRightFunc(event);
    },

    onDestroy:function(){
        console.log("battle scene clear!!!");
        battle.battleManager.clear();
        battle.poolManager.clear();
        battle.enterFrameManager.clear();
        battle.entityManager.clear();
        battle.layerManager.clear();
        battle.resourceManager.clear();

        for(let i = 0; i < this.allManager.length; i++){
            let manager = require(this.allManager[i]);
            battle[this.allManager[i]] = null;
        }
    }
});
