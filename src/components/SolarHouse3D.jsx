import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/** Interactive WebGL miniature: a rooftop solar home on a landscaped platform. */
export default function SolarHouse3D() {
  const hostRef = useRef(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(7.8, 6.1, 8.8)
    camera.lookAt(0, 1.15, 0)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch (error) {
      console.error('SolarConnect 3D could not initialize WebGL:', error)
      setWebglFailed(true)
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.domElement.setAttribute('aria-label', 'Rotating 3D solar-powered house model. Drag to rotate.')
    host.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xfff8e9, 0x7b8b78, 2.1))
    const key = new THREE.DirectionalLight(0xfff1d5, 3.2)
    key.position.set(5, 9, 6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xc5e0e8, 1.25)
    fill.position.set(-5, 4, -3)
    scene.add(fill)

    const model = new THREE.Group()
    scene.add(model)
    const mat = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness })
    const groundMat = mat('#d9dfcf')
    const wallMat = mat('#eee7d8')
    const sideMat = mat('#cfc5b2')
    const roofMat = mat('#454e49', 0.78)
    const panelMat = mat('#173c55', 0.28, 0.42)
    const glassMat = new THREE.MeshStandardMaterial({ color: '#8eb4b4', roughness: 0.22, metalness: 0.18 })
    const trimMat = mat('#f7f0e3')

    const box = (parent, size, material, position, rotation = [0, 0, 0], cast = true) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
      mesh.position.set(...position)
      mesh.rotation.set(...rotation)
      mesh.castShadow = cast
      mesh.receiveShadow = true
      parent.add(mesh)
      return mesh
    }

    // Floating landscaped plinth and house volume.
    box(model, [5.6, 0.22, 4.4], groundMat, [0, 0, 0])
    box(model, [2.85, 1.72, 2.35], wallMat, [0, 1.02, 0.05])
    box(model, [0.08, 1.72, 2.35], sideMat, [1.47, 1.02, 0.05])

    // Two roof slopes meet at a ridge; dark fascia gives the model depth.
    const roofLeft = box(model, [1.72, 0.16, 2.85], roofMat, [-0.78, 2.02, 0], [0, 0, -0.42])
    const roofRight = box(model, [1.72, 0.16, 2.85], roofMat, [0.78, 2.02, 0], [0, 0, 0.42])
    roofLeft.position.y = 2.03
    roofRight.position.y = 2.03

    // Six individually modelled solar modules mounted flush to the left roof plane.
    const panelGroup = new THREE.Group()
    panelGroup.position.set(-0.78, 2.19, 0)
    panelGroup.rotation.z = -0.42
    model.add(panelGroup)
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const x = (col - 1) * 0.49
        const z = (row - 0.5) * 1.18
        box(panelGroup, [0.46, 0.045, 1.12], panelMat, [x, 0, z], [0, 0, 0], false)
        // Fine silver cell dividers on every panel.
        for (let line = 1; line <= 3; line += 1) {
          box(panelGroup, [0.008, 0.012, 1.08], mat('#83a8b6', 0.35, 0.25), [x - 0.23 + line * 0.115, 0.027, z], [0, 0, 0], false)
        }
        for (let line = 1; line <= 5; line += 1) {
          box(panelGroup, [0.43, 0.012, 0.008], mat('#83a8b6', 0.35, 0.25), [x, 0.028, z - 0.56 + line * 0.16], [0, 0, 0], false)
        }
      }
    }

    // Front facade: windows, frames, door, and porch.
    for (const x of [-0.88, 0.15]) {
      box(model, [0.64, 0.68, 0.055], trimMat, [x, 1.1, 1.235], [0, 0, 0], false)
      box(model, [0.52, 0.56, 0.035], glassMat, [x, 1.1, 1.27], [0, 0, 0], false)
      box(model, [0.025, 0.56, 0.02], trimMat, [x, 1.1, 1.295], [0, 0, 0], false)
      box(model, [0.52, 0.025, 0.02], trimMat, [x, 1.1, 1.295], [0, 0, 0], false)
    }
    box(model, [0.52, 1.05, 0.08], mat('#8a705b'), [0.94, 0.68, 1.25], [0, 0, 0], false)
    box(model, [0.72, 0.12, 0.62], sideMat, [0.94, 0.12, 1.48])

    // Small trees with spherical canopies add scale and a miniature diorama feel.
    const trunkMat = mat('#8b765e')
    const leafMats = [mat('#6f8b68'), mat('#8ba17a'), mat('#58775d')]
    const tree = (x, z, scale = 1, leaf = 0) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.1 * scale, 0.62 * scale, 8), trunkMat)
      trunk.position.set(x, 0.48 * scale, z)
      trunk.castShadow = true
      model.add(trunk)
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.43 * scale, 1), leafMats[leaf % leafMats.length])
      crown.position.set(x, 0.93 * scale, z)
      crown.castShadow = true
      model.add(crown)
    }
    tree(-2.15, 1.25, 1.05, 0); tree(2.12, 1.3, 0.92, 1); tree(-2.2, -1.25, 0.78, 2); tree(2.18, -1.25, 0.85, 0)

    // Warm sun orb, suspended behind the roofline.
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), new THREE.MeshBasicMaterial({ color: '#e8c58d' }))
    sun.position.set(2.5, 3.6, -1.8)
    model.add(sun)

    let frame = 0
    let dragging = false
    let previousX = 0
    let targetRotation = -0.16
    const onPointerDown = (event) => { dragging = true; previousX = event.clientX; renderer.domElement.setPointerCapture?.(event.pointerId) }
    const onPointerMove = (event) => {
      if (!dragging) return
      targetRotation += (event.clientX - previousX) * 0.008
      previousX = event.clientX
    }
    const onPointerUp = () => { dragging = false }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerUp)

    const resize = () => {
      const width = Math.max(host.clientWidth, 1)
      const height = Math.max(host.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!dragging) targetRotation += 0.0018
      model.rotation.y += (targetRotation - model.rotation.y) * 0.08
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="sc-three-house-wrap">
      <div ref={hostRef} className="sc-three-house" role="img" aria-label="Interactive three-dimensional model of a home with rooftop solar panels" />
      {webglFailed && (
        <div className="sc-3d-fallback" role="img" aria-label="Isometric illustration of a solar powered home">
          <div className="fallback-sun" />
          <div className="fallback-house"><div className="fallback-roof"><div className="fallback-panels">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div></div><div className="fallback-front"><i /><i /><b /></div><div className="fallback-side" /></div>
          <span className="fallback-tree tree-a" /><span className="fallback-tree tree-b" /><span className="fallback-base" />
          <small>3D preview unavailable — showing isometric view</small>
        </div>
      )}
    </div>
  )
}
