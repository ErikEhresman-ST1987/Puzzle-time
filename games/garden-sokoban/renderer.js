export async function createGardenRenderer(host,state) {
  const PIXI=window.PIXI;
  if (!PIXI) throw new Error('PixiJS is not available');
  const app=new PIXI.Application();
  await app.init({resizeTo:host,background:0x173a31,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true});
  host.appendChild(app.canvas);
  const graphics=new PIXI.Graphics();
  app.stage.addChild(graphics);
  function draw() {
    graphics.clear();
    const w=host.clientWidth,h=host.clientHeight,step=Math.min(w/state.width,h/state.height);
    const ox=(w-step*state.width)/2,oy=(h-step*state.height)/2;
    for (let y=0;y<state.height;y++) for(let x=0;x<state.width;x++){
      const id=y*100+x,left=ox+x*step,top=oy+y*step;
      const wall=state.walls.has(id),target=state.targets.has(id),crate=state.crates.has(id),player=state.player===id;
      if (wall) {
        graphics.rect(left,top,step+.5,step+.5).fill(0x316e52);
        graphics.roundRect(left+step*.08,top+step*.08,step*.84,step*.84,step*.13).fill(0x497e5a);
        graphics.roundRect(left+step*.17,top+step*.14,step*.64,step*.18,step*.07).fill({color:0x9dc784,alpha:.48});
      } else {
        graphics.rect(left,top,step+.5,step+.5).fill((x+y)%2?0xd5c7a0:0xe5d7b1);
        graphics.circle(left+step*.17,top+step*.24,step*.018).fill(0xbaa97d);
        graphics.circle(left+step*.76,top+step*.73,step*.025).fill(0xc2b286);
        if (target) {
          graphics.circle(left+step*.5,top+step*.5,step*.34).fill(0x6a9461);
          graphics.circle(left+step*.5,top+step*.5,step*.25).fill(0xf3d68d);
          graphics.circle(left+step*.5,top+step*.5,step*.15).fill(0x79a76c);
        }
        if (crate) {
          graphics.roundRect(left+step*.13,top+step*.16,step*.75,step*.75,step*.09).fill(0x6b3f24);
          graphics.roundRect(left+step*.11,top+step*.1,step*.74,step*.74,step*.09).fill(0xc78949);
          graphics.rect(left+step*.23,top+step*.18,step*.08,step*.56).fill(0xe9b66b);
          graphics.rect(left+step*.63,top+step*.18,step*.08,step*.56).fill(0xe9b66b);
          graphics.rect(left+step*.2,top+step*.38,step*.57,step*.07).fill(0x92572f);
          if(target) graphics.circle(left+step*.5,top+step*.49,step*.08).fill(0xffe7a6);
        }
        if(player) {
          graphics.ellipse(left+step*.5,top+step*.8,step*.25,step*.10).fill({color:0x52452e,alpha:.28});
          graphics.roundRect(left+step*.3,top+step*.42,step*.4,step*.36,step*.13).fill(0x4a80a5);
          graphics.circle(left+step*.5,top+step*.37,step*.2).fill(0xf5c99a);
          graphics.ellipse(left+step*.5,top+step*.23,step*.29,step*.11).fill(0xe5b75b);
          graphics.roundRect(left+step*.35,top+step*.12,step*.3,step*.13,step*.05).fill(0xb9893c);
          graphics.circle(left+step*.43,top+step*.37,step*.023).fill(0x44352a);
          graphics.circle(left+step*.57,top+step*.37,step*.023).fill(0x44352a);
        }
      }
    }
  }
  const observer=new ResizeObserver(draw);
  observer.observe(host);
  draw();
  return {draw,destroy(){observer.disconnect();app.destroy(true,{children:true});}};
}
