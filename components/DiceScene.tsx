'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'

const D20_RADIUS = 0.5
const D8_RADIUS = 0.4
const FLOAT_AMPLITUDE = 0.06
const FLOAT_SPEED = 0.5
const IDLE_ROTATION_SPEED = 0.12
const DRAG_SENSITIVITY = 0.004

export default function DiceScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    group: THREE.Group
  } | null>(null)
  const animationRef = useRef<number>(0)
  const isDraggingRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = Math.max(container.clientWidth, 260)
    const height = Math.max(container.clientHeight, 280)
    const scene = new THREE.Scene()
    scene.background = null as unknown as THREE.Color

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, 0, 3.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(2, 3, 2)
    scene.add(dir)
    const back = new THREE.DirectionalLight(0x88aacc, 0.3)
    back.position.set(-1, -1, -1)
    scene.add(back)

    const group = new THREE.Group()
    group.position.set(0, -0.6, 0)
    scene.add(group)

    const d20Geo = new THREE.IcosahedronGeometry(D20_RADIUS, 0)
    const d20Mat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      metalness: 0.3,
      roughness: 0.6,
    })
    const d20 = new THREE.Mesh(d20Geo, d20Mat)
    d20.position.set(-0.6, 0, 0)
    group.add(d20)

    const d8Geo = new THREE.OctahedronGeometry(D8_RADIUS, 0)
    const d8Mat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      metalness: 0.3,
      roughness: 0.6,
    })
    const d8 = new THREE.Mesh(d8Geo, d8Mat)
    d8.position.set(0.6, 0, 0)
    group.add(d8)

    sceneRef.current = { scene, camera, renderer, group }

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return
      const w = Math.max(containerRef.current.clientWidth, 260)
      const h = Math.max(containerRef.current.clientHeight, 280)
      sceneRef.current.camera.aspect = w / h
      sceneRef.current.camera.updateProjectionMatrix()
      sceneRef.current.renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    const getPointer = (e: MouseEvent | Touch) => ({ x: e.clientX, y: e.clientY })

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const pointer = 'touches' in e ? getPointer(e.touches[0]) : getPointer(e as MouseEvent)
      isDraggingRef.current = true
      lastPointerRef.current = pointer
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !sceneRef.current) return
      if ('touches' in e) e.preventDefault()
      const pointer = 'touches' in e ? getPointer(e.touches[0]) : getPointer(e as MouseEvent)
      const dx = pointer.x - lastPointerRef.current.x
      const dy = pointer.y - lastPointerRef.current.y
      lastPointerRef.current = pointer
      const g = sceneRef.current.group
      g.rotation.y += dx * DRAG_SENSITIVITY
      g.rotation.x += dy * DRAG_SENSITIVITY
      g.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, g.rotation.x))
    }

    const onPointerUp = () => {
      isDraggingRef.current = false
    }

    container.addEventListener('mousedown', onPointerDown)
    container.addEventListener('mousemove', onPointerMove)
    container.addEventListener('mouseup', onPointerUp)
    container.addEventListener('mouseleave', onPointerUp)
    container.addEventListener('touchstart', onPointerDown, { passive: true })
    container.addEventListener('touchmove', onPointerMove, { passive: false })
    container.addEventListener('touchend', onPointerUp)
    container.addEventListener('touchcancel', onPointerUp)

    let startTime = Date.now() / 1000
    function animate() {
      animationRef.current = requestAnimationFrame(animate)
      const ctx = sceneRef.current
      if (!ctx) return
      const t = Date.now() / 1000
      const elapsed = t - startTime

      const floatY = Math.sin(elapsed * FLOAT_SPEED) * FLOAT_AMPLITUDE
      const floatX = Math.sin(elapsed * FLOAT_SPEED * 0.7 + 0.5) * FLOAT_AMPLITUDE * 0.5
      ctx.group.position.y = -0.6 + floatY
      ctx.group.position.x = floatX * 0.5
      if (!isDraggingRef.current) {
        ctx.group.rotation.y += IDLE_ROTATION_SPEED * 0.008
        ctx.group.rotation.x += Math.sin(elapsed * 0.3) * 0.002
      }

      ctx.renderer.render(ctx.scene, ctx.camera)
    }
    animate()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousedown', onPointerDown)
      container.removeEventListener('mousemove', onPointerMove)
      container.removeEventListener('mouseup', onPointerUp)
      container.removeEventListener('mouseleave', onPointerUp)
      container.removeEventListener('touchstart', onPointerDown)
      container.removeEventListener('touchmove', onPointerMove)
      container.removeEventListener('touchend', onPointerUp)
      container.removeEventListener('touchcancel', onPointerUp)
      cancelAnimationFrame(animationRef.current)
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  return (
    <div className="relative select-none w-full min-w-[260px] min-h-[280px]">
      <div
        ref={containerRef}
        className="w-full min-w-[260px] min-h-[280px] h-[300px] md:h-[360px] cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl"
        aria-label="Dados d20 e d8 — arraste para girar"
      />
    </div>
  )
}
