import * as THREE from 'three'

export type ExhibitId = 'projects' | 'blog' | 'about' | 'favorites' | 'guestbook'

export function buildStudio(scene: THREE.Scene) {
  const cube = new THREE.BoxGeometry()
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 32)
  const sphere = new THREE.SphereGeometry(1, 16, 12)
  const geometry: THREE.BufferGeometry[] = [cube, cylinder, sphere]
  const materials = new Map<number, THREE.MeshStandardMaterial>()
  const prints: THREE.MeshBasicMaterial[] = []
  const p = {
    wall: 0x9d9ace, side: 0x7e83af, trim: 0xc5bce3, slab: 0x414569,
    edge: 0xa298e9, ink: 0x30344f, violet: 0x7874ae, lilac: 0xb0a2e7,
    paper: 0xf5e4cd, oak: 0xa97062, wood: 0xd2957c, metal: 0x27293f,
    coral: 0xe18374, gold: 0xfac27d, mint: 0x7fc2ab,
  }

  function solid(parent: THREE.Object3D, color: number, x: number, y: number, z: number,
    width: number, height: number, depth: number, shape: THREE.BufferGeometry = cube) {
    let material = materials.get(color)
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color, roughness: 0.88 })
      materials.set(color, material)
    }
    const item = new THREE.Mesh(shape, material)
    item.position.set(x, y, z)
    item.scale.set(width, height, depth)
    item.castShadow = true
    item.receiveShadow = true
    parent.add(item)
    return item
  }

  function round(parent: THREE.Object3D, color: number, x: number, y: number, z: number, radius: number, height: number) {
    return solid(parent, color, x, y, z, radius, height, radius, cylinder)
  }

  function group(parent: THREE.Object3D, x: number, y: number, z: number) {
    const item = new THREE.Group()
    item.position.set(x, y, z)
    parent.add(item)
    return item
  }

  function print(parent: THREE.Object3D, x: number, y: number, z: number, width: number, height: number,
    paint: (ctx: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 384
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    paint(ctx)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    prints.push(material)
    const surface = new THREE.PlaneGeometry(width, height)
    geometry.push(surface)
    const mesh = new THREE.Mesh(surface, material)
    mesh.position.set(x, y, z)
    parent.add(mesh)
    return mesh
  }

  function plant(parent: THREE.Object3D, x: number, y: number, z: number, scale: number) {
    const pot = group(parent, x, y, z)
    pot.scale.setScalar(scale)
    round(pot, p.coral, 0, 0.19, 0, 0.24, 0.38)
    round(pot, p.wood, 0, 0.36, 0, 0.262, 0.10)
    round(pot, p.ink, 0, 0.415, 0, 0.215, 0.025)
    for (let i = 0; i < 7; i++) {
      const stem = group(pot, 0, 0.39, 0)
      stem.rotation.y = i * 2.4
      stem.rotation.z = 0.28 + (i % 3) * 0.22
      const height = 0.40 + (i % 4) * 0.12
      solid(stem, 0x598875, 0, height / 2, 0, 0.032, height, 0.032)
      solid(stem, i % 2 ? p.mint : 0x549e8f, 0, height, 0, 0.14, 0.27, 0.054, sphere).rotation.z = -0.35
    }
  }

  const room = group(scene, 0, 0, 0)
  solid(room, p.slab, 0, -0.34, 0, 7.3, 0.53, 5.85)
  solid(room, p.edge, 0, -0.585, 0, 7.32, 0.037, 5.87)
  solid(room, p.ink, 0, -0.64, 0, 7.14, 0.08, 5.67)
  const boards = [0xb38d85, 0xb99185, 0xc19c91, 0xb5908b, 0xc09a8a]
  for (let i = 0; i < 13; i++) {
    const x = -3.35 + i * 0.558
    const seam = 0.55 * ((i % 4) - 1.5)
    solid(room, boards[i % 5], x, -0.046, (seam - 2.88) / 2, 0.551, 0.09, seam + 2.865)
    solid(room, boards[(i + 2) % 5], x, -0.046, (seam + 2.88) / 2, 0.551, 0.09, 2.865 - seam)
  }

  // The back wall is built around an open window.
  solid(room, p.wall, 0.01, 0.7, -2.78, 7.12, 1.4, 0.19)
  solid(room, p.wall, 0.01, 3.71, -2.78, 7.12, 0.58, 0.19)
  solid(room, p.wall, 1.88, 2.41, -2.78, 3.39, 2.02, 0.19)
  solid(room, p.wall, -2.96, 2.41, -2.78, 1.17, 2.02, 0.19)
  solid(room, p.side, -3.53, 2, -0.24, 0.19, 4, 5.27)
  solid(room, p.trim, 0.05, 4.03, -2.78, 7.35, 0.095, 0.24)
  solid(room, p.trim, -3.53, 4.03, -0.23, 0.24, 0.095, 5.13)
  solid(room, p.trim, 0.05, 0.13, -2.65, 7.05, 0.21, 0.07)
  solid(room, p.trim, -3.41, 0.13, -0.13, 0.07, 0.21, 5.03)
  for (const x of [-2.38, -1.11, 0.16]) solid(room, p.trim, x, 2.41, -2.66, 0.09, 2.05, 0.12)
  for (const y of [1.4, 2.42, 3.43]) solid(room, p.trim, -1.11, y, -2.66, 2.62, 0.09, 0.12)
  solid(room, p.paper, -1.11, 1.4, -2.59, 2.75, 0.10, 0.34)

  function skyline(day: boolean) {
    return print(room, -1.11, 2.41, day ? -2.87 : -2.88, 2.55, 2.06, (ctx) => {
      const sky = ctx.createLinearGradient(0, 0, 0, 384)
      sky.addColorStop(0, day ? '#82abd5' : '#161e4c')
      sky.addColorStop(1, day ? '#f5c4ae' : '#7772aa')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, 512, 384)
      ctx.shadowColor = day ? '#ffedd3' : '#ddd1ff'
      ctx.shadowBlur = 25
      ctx.fillStyle = day ? '#fff1cb' : '#f7eaff'
      ctx.beginPath()
      ctx.arc(343, 102, day ? 33 : 25, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      if (!day) {
        for (let i = 0; i < 40; i++) ctx.fillRect((i * 191) % 512, (i * 57) % 228, 2, 2)
      }
      for (let i = 0; i < 15; i++) {
        const x = i * 37
        const y = 257 + (i * 29 % 67)
        ctx.fillStyle = day ? '#8297b2' : '#30365e'
        ctx.fillRect(x, y, 32, 384 - y)
        ctx.fillStyle = day ? '#b7bfd0' : '#dfb391'
        for (let row = y + 12; row < 378; row += 15) {
          for (let col = x + 5; col < x + 27; col += 9) {
            if ((row + col) % 7 < 4) ctx.fillRect(col, row, 3, 5)
          }
        }
      }
    })
  }
  const dayWindow = skyline(true)
  const nightWindow = skyline(false)

  // Books, storage boxes and a woven rug.
  solid(room, p.violet, 0.46, 0.012, 0.91, 3.5, 0.034, 2.41)
  solid(room, p.lilac, 0.46, 0.031, 0.91, 3.28, 0.009, 2.19)
  solid(room, 0x9393bf, 0.46, 0.038, 0.91, 3.12, 0.007, 2.03)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 22; i++) solid(room, p.violet, -1.15 + i * 0.15, 0.015, 0.91 + side * 1.23, 0.035, 0.011, 0.16)
  }
  const shelf = group(room, -3.05, 0, -0.44)
  shelf.rotation.y = Math.PI / 2
  solid(shelf, p.oak, 0, 1.48, -0.23, 2.05, 2.85, 0.08)
  for (const x of [-1.06, 1.06]) solid(shelf, p.wood, x, 1.51, 0, 0.13, 2.96, 0.58)
  for (const y of [0.13, 0.94, 1.76, 2.56, 2.98]) solid(shelf, p.wood, 0, y, 0, 2.18, 0.095, 0.60)
  const bookColors = [p.coral, p.gold, p.mint, p.paper, p.ink, p.lilac]
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 8 - row; i++) {
      const base = [0.18, 0.99, 1.81][row]
      const height = 0.36 + (i * 0.083 + row * 0.19) % 0.31
      const x = -0.85 + i * 0.168 + row * 0.13
      solid(shelf, bookColors[(i + row * 2) % 6], x, base + height / 2, 0.035, 0.148, height, 0.37)
      solid(shelf, p.paper, x, base + height - 0.08, 0.221, 0.1, 0.033, 0.004)
    }
    solid(shelf, row === 1 ? p.lilac : p.ink, 0.72, 0.33 + row * 0.82, 0.03, 0.42, 0.28, 0.4)
    solid(shelf, p.gold, 0.72, 0.37 + row * 0.82, 0.236, 0.14, 0.035, 0.014)
  }
  plant(shelf, 0.61, 3.03, 0, 0.57)

  const desk = group(room, 0.92, 0, -1.82)
  solid(desk, p.wood, 0, 1.24, 0, 3.05, 0.16, 1.27)
  solid(desk, p.oak, 0, 1.17, 0.59, 3.05, 0.087, 0.11)
  solid(desk, p.ink, 1.07, 0.62, -0.04, 0.73, 1.16, 1.01)
  for (const y of [0.25, 0.58, 0.92]) {
    solid(desk, p.violet, 1.07, y, 0.477, 0.66, 0.28, 0.07)
    solid(desk, p.gold, 1.07, y + 0.04, 0.535, 0.18, 0.035, 0.06)
  }
  for (const z of [-0.47, 0.48]) solid(desk, p.metal, -1.33, 0.59, z, 0.095, 1.18, 0.095)
  solid(desk, p.metal, -1.33, 0.13, 0, 0.09, 0.07, 0.98)

  const monitor = group(desk, -0.36, 1.33, -0.20)
  solid(monitor, p.metal, 0, 0.30, -0.07, 0.15, 0.53, 0.17)
  solid(monitor, p.metal, 0, 0.055, 0.01, 0.68, 0.095, 0.4)
  solid(monitor, p.metal, 0, 0.80, 0, 1.75, 1.08, 0.14)
  print(monitor, 0, 0.81, 0.073, 1.62, 0.94, (ctx) => {
    ctx.fillStyle = '#232642'
    ctx.fillRect(0, 0, 512, 384)
    ctx.fillStyle = '#414663'
    ctx.fillRect(0, 0, 512, 44)
    ctx.fillRect(0, 44, 84, 340)
    for (const [i, color] of ['#e9908c', '#edc093', '#a3d5b2'].entries()) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(22 + i * 21, 23, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#777f9e'
      ctx.fillRect(16, 68 + 33 * i, 24 + (i * 15) % 39, 5)
      const x = 118 + (i % 3) * 24
      ctx.fillStyle = i % 2 ? '#92c9bb' : '#b6a4f6'
      ctx.fillRect(x, 69 + 33 * i, 45 + (i * 11) % 45, 8)
      ctx.fillStyle = i % 2 ? '#e0b797' : '#6b84b6'
      ctx.fillRect(x + 101, 69 + 33 * i, 63 + (i * 29) % 111, 8)
    }
  })
  solid(desk, p.ink, -0.35, 1.357, 0.38, 1.15, 0.06, 0.36)
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 12; i++) solid(desk, i === 0 ? p.lilac : p.paper, -0.85 + i * 0.09, 1.393, 0.25 + row * 0.079, 0.071, 0.016, 0.057)
  }
  solid(desk, p.paper, 0.43, 1.35, 0.39, 0.095, 0.065, 0.15, sphere)
  const lamp = group(desk, 1.12, 1.32, 0.06)
  round(lamp, p.metal, 0, 0.035, 0, 0.23, 0.07)
  solid(lamp, p.metal, 0, 0.42, 0, 0.055, 0.82, 0.055)
  solid(lamp, p.metal, -0.19, 0.79, 0, 0.45, 0.05, 0.05)
  round(lamp, p.gold, -0.37, 0.74, 0, 0.24, 0.155)
  const bulb = round(lamp, 0xffebbf, -0.37, 0.66, 0, 0.19, 0.045)
  bulb.material.emissive.set(p.gold)
  const lampLight = new THREE.PointLight(0xffc182, 3, 3.2)
  lampLight.position.set(-0.37, 0.54, 0)
  lamp.add(lampLight)

  const chair = group(room, 0.45, 0, -0.21)
  chair.rotation.y = -0.32
  round(chair, p.metal, 0, 0.34, 0, 0.08, 0.55)
  for (let i = 0; i < 5; i++) {
    const leg = group(chair, 0, 0, 0)
    leg.rotation.y = i * Math.PI * 0.4
    solid(leg, p.metal, 0.2, 0.12, 0, 0.49, 0.068, 0.10)
    round(leg, p.ink, 0.45, 0.062, 0, 0.064, 0.11)
  }
  solid(chair, p.metal, 0, 0.58, 0, 0.86, 0.14, 0.80)
  solid(chair, p.lilac, 0, 0.67, 0, 0.85, 0.15, 0.78)
  solid(chair, p.metal, 0, 0.99, 0.38, 0.69, 0.68, 0.08)
  solid(chair, p.violet, 0, 1.14, 0.31, 0.74, 0.59, 0.15)
  for (const x of [-0.45, 0.45]) {
    solid(chair, p.metal, x, 0.81, 0.14, 0.061, 0.35, 0.066)
    solid(chair, p.ink, x, 0.98, -0.02, 0.115, 0.07, 0.48)
  }

  const frame = group(room, 2.47, 2.82, -2.62)
  solid(frame, p.ink, 0, 0, 0, 1.44, 1.31, 0.095)
  solid(frame, p.paper, 0, 0, 0.055, 1.28, 1.15, 0.035)
  print(frame, 0, 0, 0.075, 1.09, 0.94, (ctx) => {
    ctx.fillStyle = '#a69dd0'
    ctx.fillRect(0, 0, 512, 384)
    ctx.fillStyle = '#f5d8ad'
    ctx.beginPath()
    ctx.arc(382, 99, 40, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#7773a1'
    ctx.beginPath()
    ctx.moveTo(0, 271)
    ctx.lineTo(129, 142)
    ctx.lineTo(281, 324)
    ctx.lineTo(394, 205)
    ctx.lineTo(512, 322)
    ctx.lineTo(512, 384)
    ctx.lineTo(0, 384)
    ctx.fill()
    ctx.fillStyle = '#fff0d9'
    ctx.font = 'bold 77px sans-serif'
    ctx.fillText('Shea', 33, 98)
    ctx.font = '27px sans-serif'
    ctx.fillText('STUDIO', 38, 140)
  })
  plant(room, 2.95, 0, -1.25, 1.08)

  const cabinet = group(room, -2.08, 0, 1.71)
  cabinet.rotation.y = 0.20
  for (const x of [-0.66, 0.66]) {
    for (const z of [-0.31, 0.31]) solid(cabinet, p.metal, x, 0.13, z, 0.1, 0.26, 0.1)
  }
  solid(cabinet, p.oak, 0, 0.53, 0, 1.62, 0.69, 0.84)
  solid(cabinet, p.wood, 0, 0.90, 0, 1.69, 0.11, 0.90)
  for (const x of [-0.38, 0.38]) {
    solid(cabinet, p.wood, x, 0.54, 0.43, 0.69, 0.55, 0.04)
    solid(cabinet, p.gold, x, 0.62, 0.46, 0.18, 0.036, 0.05)
  }
  solid(cabinet, p.ink, 0, 1.02, 0, 1.32, 0.14, 0.70)
  solid(cabinet, p.violet, 0, 1.098, 0, 1.27, 0.035, 0.66)
  round(cabinet, p.metal, -0.18, 1.127, 0, 0.292, 0.041)
  round(cabinet, p.lilac, -0.18, 1.151, 0, 0.19, 0.01)
  round(cabinet, p.coral, -0.18, 1.159, 0, 0.082, 0.013)
  solid(cabinet, p.paper, 0.34, 1.17, 0.012, 0.03, 0.029, 0.39).rotation.y = -0.35

  const table = group(room, 1.44, 0, 1.84)
  round(table, p.ink, 0, 0.07, 0, 0.43, 0.125)
  round(table, p.ink, 0, 0.42, 0, 0.068, 0.83)
  round(table, p.wood, 0, 0.86, 0, 0.68, 0.12)
  round(table, p.paper, -0.34, 1.01, -0.11, 0.105, 0.18)
  round(table, p.oak, -0.34, 1.104, -0.11, 0.08, 0.01)
  const mail = group(table, 0.13, 0.92, 0.04)
  mail.rotation.y = -0.21
  solid(mail, p.paper, 0, 0.036, 0, 0.62, 0.067, 0.42)
  for (const side of [-1, 1]) {
    solid(mail, p.wood, side * 0.13, 0.071, -0.018, 0.35, 0.006, 0.018).rotation.y = side * 0.53
  }
  round(mail, p.coral, 0, 0.078, 0.042, 0.065, 0.019)

  const exhibits = [
    { id: 'projects', object: monitor, anchor: new THREE.Vector3(0.46, 2.98, -2), focus: new THREE.Vector3(0.56, 1.98, -1.58) },
    { id: 'blog', object: shelf, anchor: new THREE.Vector3(-2.86, 3.43, 0.26), focus: new THREE.Vector3(-2.64, 1.79, -0.45) },
    { id: 'about', object: frame, anchor: new THREE.Vector3(2.6, 3.77, -2.58), focus: new THREE.Vector3(2.48, 2.72, -2.32) },
    { id: 'favorites', object: cabinet, anchor: new THREE.Vector3(-2.16, 1.66, 1.93), focus: new THREE.Vector3(-2.08, 0.89, 1.71) },
    { id: 'guestbook', object: table, anchor: new THREE.Vector3(1.73, 1.52, 1.91), focus: new THREE.Vector3(1.53, 0.76, 1.84) },
  ] satisfies { id: ExhibitId; object: THREE.Group; anchor: THREE.Vector3; focus: THREE.Vector3 }[]

  const ambient = new THREE.HemisphereLight(0xd9dcff, 0x9b7192, 1.45)
  const key = new THREE.DirectionalLight(0xffe0be, 2)
  key.position.set(5, 9, 5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 })
  key.shadow.normalBias = 0.023
  key.shadow.bias = -0.00015
  const fill = new THREE.DirectionalLight(0xbcc3ff, 0.8)
  fill.position.set(-3, 4, -6)
  scene.add(ambient, key, fill)

  return {
    room,
    exhibits,
    setDay(day: boolean) {
      if (dayWindow) dayWindow.visible = day
      if (nightWindow) nightWindow.visible = !day
      ambient.intensity = day ? 2.05 : 1.28
      key.intensity = day ? 2.55 : 1.72
      key.color.set(day ? 0xffe7d4 : 0xffd6b0)
      fill.intensity = day ? 0.53 : 0.92
      lampLight.intensity = day ? 0.32 : 4.2
      bulb.material.emissiveIntensity = day ? 0.16 : 0.85
    },
    dispose() {
      key.shadow.dispose()
      geometry.forEach((item) => item.dispose())
      materials.forEach((item) => item.dispose())
      prints.forEach((item) => {
        item.map?.dispose()
        item.dispose()
      })
    },
  }
}
