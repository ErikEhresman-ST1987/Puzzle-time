const PALETTE = {A:0xff827f,B:0xffd26e,C:0x70d8ce};
export async function createColorSortRenderer(host, state) {
  const PIXI=window.PIXI;
  if(!PIXI)throw Error('PixiJS unavailable');
  const app=new PIXI.Application();
  await app.init({resizeTo:host,background:0x14243c,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true});
  host.appendChild(app.canvas);
  const graphics=new PIXI.Graphics();
  app.stage.addChild(graphics);
  let selected=null,animation=null,alive=true,raf=0;
  let positions=[];
  function geometry() {
    const w=host.clientWidth,h=host.clientHeight,n=state.tubes.length;
    const columns=w<390?3:5,rows=Math.ceil(n/columns);
    const spacing=w/columns;
    const tubeW=Math.min(spacing*.65,65);
    const tubeH=Math.min((h-24)/rows*.78,200);
    const radius=Math.min(tubeW*.32,tubeH/10);
    positions=state.tubes.map((_,i)=>{
      const row=Math.floor(i/columns),col=i%columns;
      const used=Math.min(columns,n-row*columns);
      return {x:w/2+(col-(used-1)/2)*spacing,y:(row+.5)*h/rows,tubeW,tubeH,radius};
    });
  }
  function draw() {
    if(!alive)return;
    geometry();
    graphics.clear();
    positions.forEach((p,i)=>{
      const {x,y,tubeW,tubeH,radius}=p,top=y-tubeH/2,left=x-tubeW/2;
      if(selected===i)graphics.roundRect(left-7,top-10,tubeW+14,tubeH+18,14).fill({color:0xffd98b,alpha:.12});
      graphics.roundRect(left,top,tubeW,tubeH,Math.min(17,tubeW*.25)).fill({color:0x8ab1d2,alpha:.10});
      graphics.moveTo(left,top).lineTo(left,top+tubeH-16).quadraticCurveTo(left,top+tubeH,left+16,top+tubeH).lineTo(left+tubeW-16,top+tubeH).quadraticCurveTo(left+tubeW,top+tubeH,left+tubeW,top).stroke({color:selected===i?0xffd98b:0x94b5d0,width:3,cap:'round'});
      const gap=3,ballR=Math.min(radius,(tubeH-24)/9);
      state.tubes[i].forEach((c,j)=>{
        if(animation&&animation.destination===i&&j>=state.tubes[i].length-animation.count)return;
        const cy=top+tubeH-12-ballR-j*(2*ballR+gap)-(selected===i&&j===state.tubes[i].length-1?5:0);
        graphics.circle(x,cy+2,ballR).fill({color:0x09182b,alpha:.3});
        graphics.circle(x,cy,ballR).fill(PALETTE[c]??0xc2b3ed);
        graphics.circle(x-ballR*.32,cy-ballR*.37,ballR*.32).fill({color:0xffffff,alpha:.35});
        graphics.circle(x,cy,ballR).stroke({color:0xffffff,alpha:.26,width:1.5});
      });
    });
    if(animation){
      const a=positions[animation.source],b=positions[animation.destination];
      const progress=animation.progress,eased=progress*progress*(3-2*progress);
      const ballR=Math.min(a.radius,(a.tubeH-24)/9);
      const spacing=2*ballR+3;
      const startY=a.y+a.tubeH/2-12-ballR-state.tubes[animation.source].length*spacing;
      const endY=b.y+b.tubeH/2-12-ballR-(state.tubes[animation.destination].length-animation.count)*spacing;
      for(let j=0;j<animation.count;j++){
        const x=a.x+(b.x-a.x)*eased;
        const y=startY+(endY-startY)*eased-j*spacing-Math.sin(progress*Math.PI)*Math.min(34,a.tubeH*.25);
        graphics.circle(x,y,ballR).fill(PALETTE[animation.color]??0xc2b3ed);
        graphics.circle(x-ballR*.32,y-ballR*.37,ballR*.32).fill({color:0xffffff,alpha:.35});
        graphics.circle(x,y,ballR).stroke({color:0xffffff,alpha:.28,width:1.5});
      }
    }
  }
  const observer=new ResizeObserver(draw);observer.observe(host);
  draw();
  function tubeAt(event) {
    const r=app.canvas.getBoundingClientRect();
    const x=(event.clientX-r.left)*host.clientWidth/r.width,y=(event.clientY-r.top)*host.clientHeight/r.height;
    return positions.findIndex(p=>Math.abs(x-p.x)<=Math.max(30,p.tubeW*.8)&&Math.abs(y-p.y)<=p.tubeH*.6);
  }
  // Animate the committed group from source to destination without changing rules state.
  function transfer(action) {
    return new Promise(resolve=>{
      const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if(reduced||!alive){draw();resolve();return;}
      const start=performance.now(),duration=260;
      animation={...action,progress:0};
      const tick=now=>{
        if(!alive){animation=null;resolve();return;}
        animation.progress=Math.min(1,(now-start)/duration);
        draw();
        if(animation.progress>=1){animation=null;draw();resolve();}
        else raf=requestAnimationFrame(tick);
      };
      raf=requestAnimationFrame(tick);
    });
  }
  return {draw,tubeAt,transfer,setSelected(i){selected=i;draw();},destroy(){alive=false;cancelAnimationFrame(raf);observer.disconnect();app.destroy(true,{children:true});}};
}
