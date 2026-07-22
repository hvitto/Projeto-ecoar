import * as THREE from 'three'
import type { DiceFaceResult } from '@/lib/dice/rollExpression'

const SUPPORTED = new Set([4, 6, 8, 10, 12, 20])

function geometryForSides(sides: number): THREE.BufferGeometry {
  const s = SUPPORTED.has(sides) ? sides : 20
  switch (s) {
    case 4:
      return new THREE.TetrahedronGeometry(0.55, 0)
    case 6:
      return new THREE.BoxGeometry(0.85, 0.85, 0.85)
    case 8:
      return new THREE.OctahedronGeometry(0.55, 0)
    case 10:
      return new THREE.ConeGeometry(0.5, 0.9, 10)
    case 12:
      return new THREE.DodecahedronGeometry(0.55, 0)
    default:
      return new THREE.IcosahedronGeometry(0.55, 0)
  }
}

function colorForSides(sides: number): number {
  switch (sides) {
    case 4:
      return 0xf59e0b
    case 6:
      return 0x0d9488
    case 8:
      return 0x0f766e
    case 10:
      return 0x6366f1
    case 12:
      return 0x14b8a6
    default:
      return 0x0d9488
  }
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutBounce(t: number) {
  const n1 = 7.5625
  const d1 = 2.75
  if (t < 1 / d1) return n1 * t * t
  if (t < 2 / d1) {
    const x = t - 1.5 / d1
    return n1 * x * x + 0.75
  }
  if (t < 2.5 / d1) {
    const x = t - 2.25 / d1
    return n1 * x * x + 0.9375
  }
  const x = t - 2.625 / d1
  return n1 * x * x + 0.984375
}

export type DiceSceneHandle = {
  dispose: () => void
}

type ThrowDieState = {
  mesh: THREE.Mesh
  label: HTMLDivElement
  startX: number
  endX: number
  startZ: number
  endZ: number
  startY: number
  groundY: number
  spinX: number
  spinY: number
  spinZ: number
  endRot: THREE.Euler
  delay: number
}

export function mountDiceThrowScene(
  container: HTMLElement,
  dice: DiceFaceResult[],
  options?: { durationMs?: number; onSettled?: () => void },
): DiceSceneHandle {
  const durationMs = options?.durationMs ?? 1800
  const visible = dice.slice(0, 4)
  const width = Math.max(container.clientWidth || window.innerWidth, 320)
  const height = Math.max(container.clientHeight || window.innerHeight, 320)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
  camera.position.set(0, 7.5, 0.15)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'
  container.appendChild(renderer.domElement)
  container.style.position = container.style.position || 'relative'

  scene.add(new THREE.AmbientLight(0xffffff, 0.85))
  const key = new THREE.DirectionalLight(0xffffff, 1.05)
  key.position.set(3, 10, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x88aacc, 0.4)
  fill.position.set(-4, 6, -3)
  scene.add(fill)

  const spacing = visible.length <= 2 ? 1.6 : 1.25
  const startXBase = -((visible.length - 1) * spacing) / 2
  const states: ThrowDieState[] = []
  const disposables: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []

  visible.forEach((die, i) => {
    const geo = geometryForSides(die.sides)
    const mat = new THREE.MeshStandardMaterial({
      color: colorForSides(die.sides),
      metalness: 0.28,
      roughness: 0.48,
    })
    disposables.push(geo)
    materials.push(mat)
    const mesh = new THREE.Mesh(geo, mat)

    const endX = startXBase + i * spacing + (Math.random() - 0.5) * 0.35
    const endZ = (Math.random() - 0.5) * 1.4
    const fromLeft = Math.random() > 0.5
    const startX = fromLeft ? -6.5 - Math.random() * 2 : 6.5 + Math.random() * 2
    const startZ = -4.5 - Math.random() * 2.5
    const startY = 5.5 + Math.random() * 2.5
    const groundY = die.sides === 6 ? 0.42 : 0.48

    mesh.position.set(startX, startY, startZ)
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
    scene.add(mesh)

    const label = document.createElement('div')
    label.textContent = String(die.value)
    label.style.cssText =
      'position:absolute;pointer-events:none;font-weight:800;font-size:clamp(1.4rem,3vw,2.25rem);color:#f8fafc;text-shadow:0 2px 8px rgba(0,0,0,.85);transform:translate(-50%,-50%);opacity:0;transition:opacity .2s ease;z-index:2'
    container.appendChild(label)

    states.push({
      mesh,
      label,
      startX,
      endX,
      startZ,
      endZ,
      startY,
      groundY,
      spinX: 10 + Math.random() * 12,
      spinY: 8 + Math.random() * 10,
      spinZ: 7 + Math.random() * 9,
      endRot: new THREE.Euler(
        die.sides === 6 ? 0 : 0.2 + i * 0.06,
        die.sides === 6 ? 0 : 0.35 + i * 0.1,
        0,
      ),
      delay: i * 0.07,
    })
  })

  const start = performance.now()
  let frame = 0
  let settled = false

  const projectLabel = (mesh: THREE.Mesh, el: HTMLDivElement) => {
    const v = mesh.position.clone()
    v.y += 0.65
    v.project(camera)
    const x = (v.x * 0.5 + 0.5) * container.clientWidth
    const y = (-v.y * 0.5 + 0.5) * container.clientHeight
    el.style.left = `${x}px`
    el.style.top = `${y}px`
  }

  const heightAt = (t: number, startY: number, groundY: number) => {
    if (t < 0.58) {
      const u = t / 0.58
      const arc = Math.sin(u * Math.PI) * 2.2
      return startY + (groundY - startY) * easeOutCubic(u) + arc * (1 - u)
    }
    const u = (t - 0.58) / 0.42
    const bounce = (1 - easeOutBounce(Math.min(1, u))) * 0.85
    return groundY + bounce
  }

  const tick = (now: number) => {
    const raw = Math.min(1, (now - start) / durationMs)

    states.forEach((s) => {
      const local = Math.min(1, Math.max(0, (raw - s.delay) / Math.max(0.55, 1 - s.delay * 0.45)))
      const e = easeOutCubic(local)
      s.mesh.position.x = s.startX + (s.endX - s.startX) * e
      s.mesh.position.z = s.startZ + (s.endZ - s.startZ) * e
      s.mesh.position.y = heightAt(local, s.startY, s.groundY)

      if (local < 0.76) {
        s.mesh.rotation.x += s.spinX * 0.018 * (1 - local)
        s.mesh.rotation.y += s.spinY * 0.018 * (1 - local)
        s.mesh.rotation.z += s.spinZ * 0.018 * (1 - local)
      } else {
        const settle = easeOutCubic((local - 0.76) / 0.24)
        s.mesh.rotation.x += (s.endRot.x - s.mesh.rotation.x) * settle
        s.mesh.rotation.y += (s.endRot.y - s.mesh.rotation.y) * settle
        s.mesh.rotation.z += (s.endRot.z - s.mesh.rotation.z) * settle
      }

      projectLabel(s.mesh, s.label)
      if (local >= 0.68) s.label.style.opacity = '1'
    })

    renderer.render(scene, camera)

    if (raw < 1) {
      frame = requestAnimationFrame(tick)
    } else if (!settled) {
      settled = true
      options?.onSettled?.()
    }
  }

  frame = requestAnimationFrame(tick)

  const onResize = () => {
    const w = Math.max(container.clientWidth || window.innerWidth, 320)
    const h = Math.max(container.clientHeight || window.innerHeight, 320)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  return {
    dispose: () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      states.forEach((s) => {
        s.label.remove()
        scene.remove(s.mesh)
      })
      disposables.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    },
  }
}

export function mountDiceRollScene(
  container: HTMLElement,
  dice: DiceFaceResult[],
  options?: { durationMs?: number; onSettled?: () => void },
): DiceSceneHandle {
  return mountDiceThrowScene(container, dice, options)
}
