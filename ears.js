class Ears{
    //Evts
    registerTrigger(tn,cb){
      let callback = cb
      let trigger = null
      if(this.triggers.hasOwnProperty(tn)) trigger = this.triggers[tn]
      if(trigger){
        const cbs = trigger.getCb()
        trigger.getCb = ()=>{
          return [callback].concat(cbs)
        }
      }else{
        trigger = {
            name:tn,
            getCb:()=>{
                return [callback]
            }
        }
      }
      this.triggers[tn] = trigger
    }
    forgetTrigger(tn,idx){
        if(this.triggers.hasOwnProperty(tn)){
          let cbs = []
          this.triggers[tn].getCb().map(
            (t,i)=>{
              if(i+1!=idx){
                t = function(){}
              }
              cbs.push(t)
            }
          )
          this.triggers[tn].getCb = ()=>{
            return cbs
          }
        }
    }
    registerCallBack(tn,cb){
        let callback = null
        if(this.callbacks.hasOwnProperty(tn)) callback = this.callbacks[tn]
        this.callbacks[tn] = callback ? [cb].concat(callback) : [cb]
        return this.callbacks[tn].length
    }
    forgetCallBack(tn,idx){
        if(this.callbacks.hasOwnProperty(tn)) delete(this.callbacks[tn][idx])
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
        return !action ? action : action(...args)
    }
    getCallBack(tn,idx){
        return this.callbacks.hasOwnProperty(tn)?this.callbacks[tn][idx-1]:null
    }
    getTrigger(tn){
        return this.triggers.hasOwnProperty(tn)?this.triggers[tn]:null
    }
    doTrigger(tn,trigger,data){
        this.triggered[tn] = (this.triggered.hasOwnProperty(tn)) ? this.triggered[tn].concat([{trigger,data}]) : [{trigger,data}]
    }
    undoTrigger(tn){
        if(this.getTrigger(tn)) delete(this.getTrigger(tn))
    }
    setBaseActions(){
        const actions = [
            [
                'on',(triggername,triggercb)=>{
                    const idx = this.registerCallBack(triggername,triggercb)
                    this.registerTrigger(triggername,this.getCallBack(triggername,idx))
                    return idx
                }
            ],
            [
                'off',(triggername,idx)=>{
                    this.forgetCallBack(triggername,idx)
                    this.forgetTrigger(triggername,idx)
                    this.undoTrigger(triggername,idx)
                }
            ],[
                'trigger',(triggername,...data)=>{
                    let interv = setInterval(
                        ()=>{
                            if(this.getTrigger(triggername)){
                                this.getTrigger(triggername).getCb().map(
                                  triggerfunc=>{
                                    this.doTrigger(triggername,triggerfunc,data)
                                  }
                                )
                                clearInterval(interv)
                            }
                        }
                    )
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
                        this.triggered[tn].map(
                          trigger=>{
                            trigger.trigger(...trigger.data)
                          }
                        )
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
        if(this.isReady())cb()
        else    this.when('ready',cb)
    }
    when(context,action){
        return this.on(context,action)
    }
    listenReady(){
        let readyinterval = null
        readyinterval = setInterval(
            ()=>{
                if(this.isReady()){
                this.trigger('ready',this)
                clearInterval(readyinterval)
                }
            },1000
        )
    }
    on(an,fn){

        return this.evts.do("on",an,fn)

    }
    isReady(){
        return this.ready
    }
    off(an,idx){

        this.evts.do("off",an,idx)
    }
    forget(an,idx){
        this.evts.do("off",an,idx)
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
      this.ready = false
      this.listenReady()
    }
}
if((typeof module) != 'undefined'){
    module.exports = {
        Ears,Ear
    }
}
