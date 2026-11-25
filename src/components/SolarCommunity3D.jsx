import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/** Interactive miniature community solar micro-grid. Drag to rotate the scene. */
export default function SolarCommunity3D() {
  const hostRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    let renderer
    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
      camera.position.set(10, 8, 12)
      camera.lookAt(0, 0.8, 0)
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15
      renderer.domElement.setAttribute('aria-label', 'Interactive 3D solar-powered community. Drag to rotate.')
      host.appendChild(renderer.domElement)

      scene.add(new THREE.HemisphereLight(0xf4fff4, 0x667d70, 2.1))
      const sunLight = new THREE.DirectionalLight(0xffedc7, 3.1)
      sunLight.position.set(5, 10, 7); sunLight.castShadow = true; sunLight.shadow.mapSize.set(1024, 1024); scene.add(sunLight)
      const fill = new THREE.DirectionalLight(0xb8e4ee, 1.4); fill.position.set(-7, 5, -5); scene.add(fill)

      const world = new THREE.Group(); scene.add(world)
      const material = (color, roughness = 0.78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness })
      const grass = material('#b9cdb6'), wall = material('#f1eadb'), side = material('#d0c5b1'), roof = material('#53645d'), panel = material('#174b68', 0.24, 0.45), trim = material('#fff8e9'), glass = material('#8db8b8', 0.25, 0.15)
      const box = (parent, size, mat, pos, rot = [0,0,0]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat); m.position.set(...pos); m.rotation.set(...rot); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m }

      // Floating landscaped community platform.
      box(world, [10.8, .28, 8.2], grass, [0, -.15, 0])
      const housePositions = [[-3.15, 1.55], [0, 1.65], [3.15, 1.45], [-1.65, -1.75], [1.8, -1.8]]
      housePositions.forEach(([x,z], index) => {
        const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = index % 2 ? .18 : -.12; world.add(h)
        box(h, [1.72, 1.2, 1.48], wall, [0, .62, 0])
        box(h, [.06, 1.2, 1.48], side, [.89, .62, 0])
        box(h, [1.02, .12, 1.9], roof, [-.43, 1.32, 0], [0,0,-.38])
        box(h, [1.02, .12, 1.9], roof, [.43, 1.32, 0], [0,0,.38])
        const solar = new THREE.Group(); solar.position.set(-.43, 1.43, 0); solar.rotation.z = -.38; h.add(solar)
        for (let r=0;r<2;r++) for (let c=0;c<2;c++) {
          const px=(c-.5)*.48, pz=(r-.5)*.86
          box(solar, [.45,.035,.82], panel, [px,0,pz])
          for(let line=1;line<=3;line++) box(solar,[.008,.012,.78],material('#8dbac7',.35,.2),[px-.225+line*.1125,.022,pz])
          for(let line=1;line<=3;line++) box(solar,[.42,.012,.008],material('#8dbac7',.35,.2),[px,.023,pz-.41+line*.205])
        }
        box(h,[.38,.68,.045],material('#96775d'),[.55,.36,.77])
        for(const wx of [-.52,.12]) { box(h,[.42,.44,.04],trim,[wx,.73,.77]); box(h,[.34,.35,.025],glass,[wx,.73,.80]) }
      })

      // Shared battery and distribution hub.
      const battery = new THREE.Group(); battery.position.set(0,.15,-3.15); world.add(battery)
      box(battery,[1.12,1.45,.82],material('#526e62',.42,.18),[0,.73,0])
      box(battery,[.78,.86,.05],material('#d9eee0',.3),[0,.77,.44])
      box(battery,[.34,.1,.07],material('#5b9b79',.3),[0,1.38,.48])
      const batteryLabel = new THREE.Mesh(new THREE.BoxGeometry(.22,.08,.025),material('#f5fff5',.3)); batteryLabel.position.set(0,.9,.49); battery.add(batteryLabel)

      // Warm sun and stylized trees.
      const sun = new THREE.Mesh(new THREE.SphereGeometry(.48,32,24),new THREE.MeshBasicMaterial({color:'#f0cf91'})); sun.position.set(4.2,4.7,-3.5); world.add(sun)
      const trunk=material('#92775b'), leaves=material('#789773')
      for(const [x,z] of [[-4.7,2.8],[4.7,2.5],[-4.6,-2.7],[4.5,-2.5]]) { const t=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,.58,8),trunk);t.position.set(x,.29,z);world.add(t);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,1),leaves);crown.position.set(x,.78,z);world.add(crown) }

      // Glowing energy routes and moving particles.
      const routeMat = new THREE.LineBasicMaterial({color:'#67b99a',transparent:true,opacity:.72})
      const routes = [[new THREE.Vector3(-3.1,1.7,1.5),new THREE.Vector3(-1.7,.65,-2.2),new THREE.Vector3(0,.9,-3.15)],[new THREE.Vector3(0,1.7,1.6),new THREE.Vector3(0,.9,-3.15)],[new THREE.Vector3(3.1,1.6,1.4),new THREE.Vector3(1.7,.7,-2.2),new THREE.Vector3(0,.9,-3.15)]]
      const particleSets=[]
      routes.forEach((points,idx)=>{const curve=new THREE.CatmullRomCurve3(points);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),routeMat);world.add(line);const particles=[];for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),new THREE.MeshBasicMaterial({color:idx===1?'#f4d18c':'#73d7b0'}));world.add(p);particles.push({mesh:p,curve,offset:i/3})}particleSets.push(particles)})

      let dragging=false,prevX=0,targetY=-.18,raf=0
      const down=e=>{dragging=true;prevX=e.clientX;renderer.domElement.setPointerCapture?.(e.pointerId)}
      const move=e=>{if(!dragging)return;targetY+=(e.clientX-prevX)*.008;prevX=e.clientX}
      const up=()=>{dragging=false}
      renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up)
      const resize=()=>{const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
      const observer=new ResizeObserver(resize);observer.observe(host);resize()
      const clock=new THREE.Clock()
      const animate=()=>{raf=requestAnimationFrame(animate);const t=clock.getElapsedTime();if(!dragging)targetY+=.0008;world.rotation.y+=(targetY-world.rotation.y)*.055;sun.position.y=4.7+Math.sin(t*.7)*.08;particleSets.flat().forEach(p=>p.mesh.position.copy(p.curve.getPoint((t*.13+p.offset)%1)));renderer.render(scene,camera)}
      animate()
      return ()=>{cancelAnimationFrame(raf);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())});renderer.dispose();renderer.domElement.remove()}
    } catch (error) { console.error('SolarConnect community 3D failed:',error); renderer?.dispose(); setFailed(true); return undefined }
  }, [])

  return <div className="sc-community-3d-wrap"><div ref={hostRef} className="sc-community-3d" role="img" aria-label="Interactive 3D miniature of a solar-powered community with five homes, rooftop panels, energy connections and shared battery storage" />{failed&&<div className="sc-community-fallback">☀️<strong>Solar-powered community</strong><span>3D preview is unavailable on this device.</span></div>}</div>
}
