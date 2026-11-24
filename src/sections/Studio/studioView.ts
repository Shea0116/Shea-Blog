import * as THREE from 'three'
import { buildStudio, type ExhibitId } from './studioModel'

export const FLIGHT_MS = 470

interface ViewOptions {
  labels: Partial<Record<ExhibitId, HTMLButtonElement>>
  onSelect: (id: ExhibitId) => void
  onLost: () => void
}

export function createStudioView(stage: HTMLDivElement, { labels, onSelect, onLost }: ViewOptions) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true })
  if (!context) throw new Error('WebGL 2 is unavailable')
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65))
  renderer.setClearColor(0, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.13
  renderer.shadowMap.enabled = true
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true
  canvas.className = 'studio__canvas'
  canvas.setAttribute('aria-hidden', 'true')
  stage.prepend(canvas)

  const scene = new THREE.Scene()
  const model = buildStudio(scene)
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 60)
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const origin = new THREE.Vector3(0, 1.62, 0)
  const target = origin.clone()
  const sourceTarget = origin.clone()
  const desiredTarget = origin.clone()
  const point = new THREE.Vector3()
  const pointer = new THREE.Vector2()
  const ray = new THREE.Raycaster()
  const cursorExhibits = new Map<THREE.Object3D, ExhibitId>(model.exhibits.map(({ object, id }) => [object, id]))
  let width = 0
  let height = 0
  let angle = 0.65
  let zoom = 1
  let sourceZoom = 1
  let desiredZoom = 1
  let startedAt = 0
  let animationLength = 0
  let request = 0
  let inView = true
  let lost = false
  let selected: ExhibitId | null = null
  let modelHover: ExhibitId | null = null
  let labelHover: ExhibitId | null = null
  let drag: { id: number; x: number; angle: number; moved: boolean } | null = null
  const objectFloor = new Map(model.exhibits.map(({ object }) => [object, object.position.y]))

  function draw(now: number) {
    request = 0
    if (width < 1 || height < 1) return
    const elapsed = animationLength ? Math.min((now - startedAt) / animationLength, 1) : 1
    const progress = 1 - Math.pow(1 - elapsed, 3)
    target.lerpVectors(sourceTarget, desiredTarget, progress)
    zoom = THREE.MathUtils.lerp(sourceZoom, desiredZoom, progress)
    const aspect = width / height
    const viewHeight = Math.max(9.35, 10.5 / aspect) / zoom
    camera.top = viewHeight / 2
    camera.bottom = -camera.top
    camera.right = camera.top * aspect
    camera.left = -camera.right
    camera.position.set(target.x + Math.sin(angle) * 13, target.y + 8.8, target.z + Math.cos(angle) * 13)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const hovered = selected || labelHover || modelHover
    const placed: { x: number; y: number }[] = []
    for (const { id, object, anchor } of model.exhibits) {
      const lift = !motion.matches && id === hovered ? (id === 'about' ? 0.06 : 0.11) : 0
      object.position.y = objectFloor.get(object)! + lift
      const label = labels[id]
      if (!label) continue
      label.toggleAttribute('data-highlighted', hovered === id)
      point.copy(anchor)
      point.y += lift
      point.project(camera)
      const x = THREE.MathUtils.clamp((point.x + 1) * width / 2, 43, width - 43)
      let y = THREE.MathUtils.clamp((1 - point.y) * height / 2, 50, height - 15)
      for (const other of placed) {
        if (Math.abs(x - other.x) >= (width < 500 ? 66 : 77) || Math.abs(y - other.y) >= 50) continue
        y = y < other.y && other.y >= 100 ? other.y - 50 : Math.min(other.y + 50, height - 15)
      }
      placed.push({ x, y })
      label.style.setProperty('--exhibit-x', `${x}px`)
      label.style.setProperty('--exhibit-y', `${y}px`)
    }
    renderer.render(scene, camera)
    if (elapsed < 1) invalidate()
  }

  function invalidate() {
    if (!request && inView && !document.hidden && !lost) request = requestAnimationFrame(draw)
  }

  function resize() {
    width = stage.clientWidth
    height = stage.clientHeight
    if (width && height) renderer.setSize(width, height, false)
    invalidate()
  }

  function hit(event: PointerEvent) {
    if (selected) return null
    const bounds = canvas.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return null
    pointer.set(
      (event.clientX - bounds.left) / bounds.width * 2 - 1,
      1 - (event.clientY - bounds.top) / bounds.height * 2,
    )
    ray.setFromCamera(pointer, camera)
    let object: THREE.Object3D | null = ray.intersectObject(model.room, true).find(({ object }) => object.visible)?.object ?? null
    while (object && !cursorExhibits.has(object)) object = object.parent
    return object ? cursorExhibits.get(object)! : null
  }

  function setModelHover(id: ExhibitId | null) {
    if (modelHover === id) return
    modelHover = id
    canvas.toggleAttribute('data-interactive', Boolean(id))
    invalidate()
  }

  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary || selected) return
    drag = { id: event.pointerId, x: event.clientX, angle, moved: false }
    canvas.setPointerCapture(event.pointerId)
  }

  function pointerMove(event: PointerEvent) {
    if (drag?.id === event.pointerId) {
      const dx = event.clientX - drag.x
      if (Math.abs(dx) > 5) drag.moved = true
      if (drag.moved) {
        canvas.setAttribute('data-dragging', '')
        setModelHover(null)
        angle = THREE.MathUtils.clamp(drag.angle - dx * 0.005, 0.25, 0.99)
        invalidate()
        return
      }
    }
    if (event.pointerType === 'mouse') setModelHover(hit(event))
  }

  function pointerUp(event: PointerEvent) {
    const clicked = drag?.id === event.pointerId && !drag.moved && event.target === canvas
    pointerCancel()
    const id = clicked ? hit(event) : null
    if (id) onSelect(id)
  }

  function pointerCancel() {
    drag = null
    canvas.removeAttribute('data-dragging')
  }

  function contextLost(event: Event) {
    event.preventDefault()
    lost = true
    if (request) cancelAnimationFrame(request)
    request = 0
    onLost()
  }

  function clearHover() {
    setModelHover(null)
  }

  const resizer = new ResizeObserver(resize)
  resizer.observe(stage)
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    if (inView) invalidate()
  })
  observer.observe(stage)
  document.addEventListener('visibilitychange', invalidate)
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerCancel)
  canvas.addEventListener('lostpointercapture', pointerCancel)
  canvas.addEventListener('pointerleave', clearHover)
  canvas.addEventListener('webglcontextlost', contextLost)

  resize()
  if (request) cancelAnimationFrame(request)
  try {
    draw(performance.now())
  } catch (error) {
    dispose()
    throw error
  }

  function dispose() {
    if (request) cancelAnimationFrame(request)
    resizer.disconnect()
    observer.disconnect()
    document.removeEventListener('visibilitychange', invalidate)
    model.dispose()
    renderer.dispose()
    canvas.remove()
  }

  return {
    setDay(day: boolean) {
      model.setDay(day)
      invalidate()
    },
    hover(id: ExhibitId | null) {
      labelHover = id
      invalidate()
    },
    focus(id: ExhibitId | null) {
      selected = id
      setModelHover(null)
      sourceTarget.copy(target)
      sourceZoom = zoom
      const exhibit = model.exhibits.find((item) => item.id === id)
      const shouldMove = exhibit && !motion.matches
      desiredTarget.copy(shouldMove ? exhibit.focus : origin)
      desiredZoom = shouldMove ? 1.49 : 1
      animationLength = motion.matches ? 0 : id ? FLIGHT_MS : 360
      startedAt = performance.now()
      invalidate()
      return animationLength
    },
    reset() {
      angle = 0.65
      invalidate()
    },
    dispose,
  }
}
