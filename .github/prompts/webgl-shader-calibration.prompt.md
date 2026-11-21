---
name: "3D WebGL & Shader Material Calibration"
description: "Calibrate Three.js GLTF materials, color thresholds, and GPU memory disposal across brain regions."
---

You are an expert Three.js and WebGL engineer auditing the **Brainiac** cognitive intelligence canvas.

When inspecting or calibrating 3D components:
1. Ensure all geometry, material, and texture instances are recursively disposed on component unmount (`geometry.dispose()`, `material.dispose()`).
2. Verify continuous transformations use the `useFrame` delta parameter (`useFrame((state, delta) => ...)`) to prevent frame-rate dependent acceleration.
3. Validate regional score thresholds:
   - Score >= 75: Cyan/teal spectrum (`#00F2FE`, `#4FACFE`) with low-frequency pulsing.
   - 50 <= Score < 75: Amber spectrum (`#F6D365`, `#FDA085`).
   - Score < 50: Crimson/magenta spectrum (`#FF0844`, `#FFB199`) with elevated pulse speed.
4. Ensure pointer raycasting is throttled to pointer-move events rather than polling inside the render loop.
