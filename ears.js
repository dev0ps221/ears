class Ears{
    //Evts
    registerTrigger(tn,cb){
        let callback = cb
        this.triggers[tn] = {
            name:tn,
            getCb:()=>{
                return callback
            }
        }
    }
    forgetTrigger(tn){
        if(this.triggers.hasOwnProperty(tn)) delete(this.triggers[tn])
    }
    registerCallBack(tn,cb){
        this.callbacks[tn] = cb
    }
    forgetCallBack(tn){
        if(this.callbacks.hasOwnProperty(tn)) delete(this.callbacks[tn])
    }
    removeAction(an){
        if(this.actions.hasOwnProperty(an)) delete(this.actions[an])
    }
    addAction(an,af){
        this.actions[an] = af
    }
    getAction(an){
        return this.actions[an] ? this.actions[an] : null 
    }
    do(an,...args){
        const action = this.getAction(an)
        !action ? action : action(...args)
    }
    getCallBack(tn){
        return this.callbacks.hasOwnProperty(tn)?this.callbacks[tn]:null
    }
    getTrigger(tn){
        return this.triggers.hasOwnProperty(tn)?this.triggers[tn]:null
    }
    doTrigger(tn,trigger,data){
        this.triggered[tn]={trigger,data}
    }
    undoTrigger(tn){
        if(this.getTrigger(tn)) delete(this.getTrigger(tn))
    }
    setBaseActions(){
        const actions = [
            [
                'on',(triggername,triggercb)=>{
                    this.registerCallBack(triggername,triggercb)
                    this.registerTrigger(triggername,this.getCallBack(triggername))
                }
            ],
            [
                'off',(triggername)=>{
                    this.forgetCallBack(triggername)
                    this.forgetTrigger(triggername)
                    this.undoTrigger(triggername)
                }
            ],[
                'trigger',(triggername,...data)=>{
                    if(this.getTrigger(triggername)){
                        this.doTrigger(triggername,this.getTrigger(triggername).getCb(),data)
                    }else{
                        let interv = setInterval(
                            ()=>{
                                if(this.getTrigger(triggername)){
                                    this.doTrigger(triggername,this.getTrigger(triggername).getCb(),data)
                                    clearInterval(interv)
                                }
                            }
                        )
                    }    
                }
            ]
        ]
        actions.forEach(
            ([name,callback])=>{
                this.actions[name] = callback
            }
        )
    }
    eventLoop(){
        if(Object.keys(this.triggers).length){
            Object.keys(this.triggers).forEach(
                tn=>{
                    if(this.triggered.hasOwnProperty(tn)){
                        this.triggered[tn].trigger(...this.triggered[tn].data)
                        delete(this.triggered[tn])
                    }
                }
            )
        }
    }
    loop(){
        this.evtsInterval = setInterval(()=>{this.eventLoop()},1500)
    }
    endloop(){
        clearInterval(this.evtsInterval)
    }
    mute(){
        this.endloop()
    }
    constructor(){
        this.triggers = {}
        this.triggered={}
        this.callbacks= {}
        this.actions={}
        this.setBaseActions()
        this.loop()
    }

}

class Ear{


    whenReady(cb){
        this.when('ready',cb)
    }
    when(context,action){
        this.on(context,action)
    }
    listenReady(){
        let readyinterval = null
        readyinterval = setInterval(
            ()=>{
                if(this.ready){
                this.trigger('ready',this)
                clearInterval(readyinterval)
                }
            },1000
        )
    }
    on(an,fn){
        
        this.evts.do("on",an,fn)
    }
    off(an){
        
        this.evts.do("off",an)
    }
    forget(an){
        this.evts.do("off",an)
    }
    trigger(an,...args){
        this.evts.do("trigger",an,...args)
    }
    endloop(){
        this.mute()
    }
    mute(){
        this.evts.mute()
    }
    setReady(){
        this.ready = true
    }
    static build(...obj){
        
        return Object.assign(new Ear(),...obj)
    }
    constructor(){  
      this.evts   = new Ears()
      this.listenReady()
    }

}

module.exports = {
    Ears,Ear
}
