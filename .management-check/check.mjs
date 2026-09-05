import { writeFile } from 'node:fs/promises'
const pages = await (await fetch('http://127.0.0.1:9224/json/list')).json()
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl)
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
let id = 0
const pending = new Map()
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data)
  if (msg.id) { const entry = pending.get(msg.id); pending.delete(msg.id); msg.error ? entry.reject(msg.error) : entry.resolve(msg.result) }
  if (msg.method === 'Runtime.exceptionThrown') console.error('BROWSER ERROR', JSON.stringify(msg.params.exceptionDetails))
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const callId = ++id
  pending.set(callId, { resolve, reject })
  ws.send(JSON.stringify({ id: callId, method, params }))
})
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
await send('Runtime.enable')
await send('Page.enable')
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  Object.defineProperty(window, 'Phaser', { configurable:true,
    get(){return this.__phaser}, set(value){this.__phaser=value; const Game=value.Game;
      value.Game=class extends Game {constructor(...args){super(...args);window.__game=this}}
    }
  })
` })
await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: 'http://127.0.0.1:4174/' })
await pause(1600)
console.log('Game captured:', await evaluate('!!window.__game'))
const screenshot = async name => {
  await pause(180)
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  await writeFile(`/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/.management-check/${name}.png`, Buffer.from(shot.data, 'base64'))
}
await screenshot('menu-360')
await evaluate(`window.__game.scene.getScene('MainMenu').startGame();true`)
await pause(400)
await evaluate(`window.__game.scene.getScene('GameWorld').scene.start('CompanyManagement');true`)
await pause(400)
const results = []
for (const [width, height] of [[360,740],[740,360],[640,360],[360,640]]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await pause(350)
  for (const scene of ['CompanyManagement','VehicleFleet','EmployeeManagement','CustomerReviews','FinancialReport']) {
    await evaluate(`window.__game.scene.getScenes(true)[0].scene.start('${scene}');true`)
    await pause(220)
    if (width === 360 && height === 740 || width === 740) await screenshot(`${scene}-${width}`)
    results.push(await evaluate(`(() => {
      const scene=window.__game.scene.getScene('${scene}');
      const texts=scene.children.list.filter(o=>o.type==='Text' && o.visible);
      const overflow=texts.filter(o=>{const b=o.getBounds();return b.x<0||b.y<0||b.right>${width}+1||b.bottom>${height}+1}).map(o=>o.text);
      const collisions=[];
      for(let i=0;i<texts.length;i++) for(let j=i+1;j<texts.length;j++){
        const a=texts[i].getBounds(),b=texts[j].getBounds();
        if(a.width&&b.width&&a.x<b.right&&b.x<a.right&&a.y<b.bottom&&b.y<a.bottom)collisions.push([texts[i].text,texts[j].text])
      }
      return {scene:'${scene}',width:${width},height:${height},overflow,collisions};
    })()`))
  }
}
console.log(JSON.stringify(results, null, 2))
await writeFile('/home/runner/work/DROPi-Tycoon/DROPi-Tycoon/.management-check/geometry.json', JSON.stringify(results, null, 2))
ws.close()
