## Description

Provide a concise summary of the changes introduced in this pull request and the underlying motivation. Reference associated issue tickets where applicable.

Fixes #(issue)

---

## Type of Change

- [ ] Bug fix (non-breaking change resolving a defect)
- [ ] Feature implementation (non-breaking change introducing new capability)
- [ ] UI/UX styling or layout refinement
- [ ] Neuroscience or psychometric engine calibration
- [ ] Performance optimization (WebGL, bundle size, execution latency)
- [ ] Documentation update
- [ ] Infrastructure, CI/CD, or dependency maintenance

---

## 3D WebGL & Performance Verification (If Applicable)

- [ ] Verified sustained 60 FPS rendering on target hardware.
- [ ] Confirmed explicit disposal of Three.js geometries, materials, and textures on component unmount to prevent GPU memory leaks.
- [ ] Validated responsive canvas resizing across viewport breakpoints without distortion or aspect ratio skew.
- [ ] Verified graceful degradation if WebGL context is lost or unsupported.

---

## Technical Quality Checklist

- [ ] Code follows project architecture conventions and TypeScript/JavaScript standards.
- [ ] Local build passes cleanly (`npm run build`).
- [ ] Backend syntax check executes without error (`node --check server.js`).
- [ ] No secrets, private credentials, or debug environment variables are committed.
- [ ] Associated documentation, type definitions, or README references updated.

---

## Visual & Telemetry Artifacts (If Applicable)

Include relevant reproduction captures, profiling traces, or before/after visual comparisons:
