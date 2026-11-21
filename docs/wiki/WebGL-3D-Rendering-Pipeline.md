# Interactive 3D WebGL Rendering Pipeline

## 1. Scene Graph Architecture

The rendering pipeline is implemented using `@react-three/fiber` (R3F) and Three.js, loading anatomical GLTF assets with procedural material overrides.

```
Canvas (WebGL2Renderer)
  └── PerspectiveCamera (fov: 45, near: 0.1, far: 1000)
  └── AmbientLight + DirectionalLights
  └── OrbitControls (damped rotation, restricted zoom boundaries)
  └── NeuralModelGroup
        ├── Deep-Cloned Meshes (Prefrontal, Limbic, Hippocampus, etc.)
        └── Custom MeshStandardMaterial / ShaderMaterial
              └── Uniforms: uTime, uScore, uColor, uPulseSpeed
```

---

## 2. Dynamic Material Shader Binding

Each brain region receives a normalized score $S \in [0, 100]$ from the psychometric calculation:

- **High Performance / Homeostasis ($S \ge 75$):** Material shifts to cyan/teal spectra ($#00F2FE$, $#4FACFE$) with stable low-frequency pulsing.
- **Moderate Load ($50 \le S < 75$):** Material shifts to amber/warm tones ($#F6D365$, $#FDA085$).
- **Elevated Demand / Exhaustion ($S < 50$):** Material displays accelerated pulsation in magenta/crimson spectra ($#FF0844$, $#FFB199$).

---

## 3. GPU Memory Management

To maintain a sustained 60 FPS profile on mobile and integrated graphics hardware:
- All geometries, materials, and textures undergo recursive `dispose()` calls upon component unmounting.
- Frame updates rely strictly on delta timestamps via `useFrame((state, delta) => ...)` to ensure frame-rate-independent interpolation.
- Raycaster checks for pointer interactions are throttled to pointer-move events rather than polling inside the render loop.
