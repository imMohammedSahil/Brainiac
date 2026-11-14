import React, { useState } from 'react';
import ColorFillCard from './ColorFillCard';
import './ColorFillCardDemo.css';

export default function ColorFillCardDemo() {
  const [fillColor, setFillColor] = useState('#ffffff');
  const [baseColor, setBaseColor] = useState('#080808');
  const [fillTextColor, setFillTextColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [secondaryTextColor, setSecondaryTextColor] = useState('#a1a1aa');
  const [fillSecondaryTextColor, setFillSecondaryTextColor] = useState('#18181b');
  const [duration, setDuration] = useState(2400);
  const [origin, setOrigin] = useState('bottom-left');
  const [lift, setLift] = useState(-4);
  const [trigger, setTrigger] = useState('hover');

  const codeSnippet = `<ColorFillCard
  title="Interactive Card"
  description="A high-performance card component featuring an ultra-smooth liquid color flood on hover with seamless contrast transitions."
  baseColor="${baseColor}"
  fillColor="${fillColor}"
  origin="${origin}"
  duration={${duration}}
  trigger="${trigger}"
  lift={${lift}}
/>`;

  return (
    <div className="cfc-demo-root">
      <div className="cfc-demo-header">
        <div className="cfc-badge">Open-Source Component</div>
        <h1 className="cfc-title">ColorFillCard Playground</h1>
        <p className="cfc-subtitle">
          An ultra-smooth radial color flood micro-interaction component for React.
        </p>
      </div>

      <div className="cfc-demo-grid">
        {/* Left Side: Live Preview Area */}
        <div className="cfc-preview-container">
          <div className="cfc-preview-toolbar">
            <span className="cfc-preview-status">
              Live Preview • {trigger === 'hover' ? 'Hover over card' : 'Click card to toggle'}
            </span>
          </div>

          <div className="cfc-cards-display">
            <ColorFillCard
              title="Interactive Card"
              description="A high-performance card component featuring an ultra-smooth liquid color flood on hover with seamless contrast transitions."
              baseColor={baseColor}
              fillColor={fillColor}
              textColor={textColor}
              fillTextColor={fillTextColor}
              secondaryTextColor={secondaryTextColor}
              fillSecondaryTextColor={fillSecondaryTextColor}
              duration={duration}
              origin={origin}
              lift={lift}
              trigger={trigger}
              className="cfc-showcase-card"
            />
          </div>

          {/* Generated Code Snippet */}
          <div className="cfc-snippet-box">
            <div className="cfc-snippet-header">
              <span>Code Snippet (Ready to Copy)</span>
              <button
                className="cfc-copy-btn"
                onClick={() => navigator.clipboard?.writeText(codeSnippet)}
              >
                Copy JSX
              </button>
            </div>
            <pre className="cfc-snippet-code">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Right Side: Prop Controllers */}
        <div className="cfc-controls-panel">
          <h2 className="cfc-panel-title">Component Props Control</h2>

          <div className="cfc-control-group">
            <label className="cfc-label">Origin Bloom Anchor</label>
            <select
              className="cfc-select"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              <option value="bottom-left">Bottom-Left (Original Brainiac)</option>
              <option value="mouse">Cursor Tracking (Bloom from mouse)</option>
              <option value="center">Center Radial Bloom</option>
              <option value="top-left">Top-Left</option>
              <option value="top-right">Top-Right</option>
              <option value="bottom-right">Bottom-Right</option>
            </select>
          </div>

          <div className="cfc-control-group">
            <label className="cfc-label">Trigger Mode</label>
            <div className="cfc-button-group">
              <button
                className={`cfc-toggle-btn ${trigger === 'hover' ? 'active' : ''}`}
                onClick={() => setTrigger('hover')}
              >
                Hover
              </button>
              <button
                className={`cfc-toggle-btn ${trigger === 'click' ? 'active' : ''}`}
                onClick={() => setTrigger('click')}
              >
                Click / Toggle
              </button>
            </div>
          </div>

          <div className="cfc-control-group">
            <div className="cfc-label-row">
              <label className="cfc-label">Cinematic Transition Duration</label>
              <span className="cfc-val">{(duration / 1000).toFixed(1)}s ({duration}ms)</span>
            </div>
            <input
              type="range"
              min="800"
              max="5000"
              step="100"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="cfc-range"
            />
          </div>

          <div className="cfc-control-group">
            <div className="cfc-label-row">
              <label className="cfc-label">Hover Elevation Lift</label>
              <span className="cfc-val">{lift}px</span>
            </div>
            <input
              type="range"
              min="-12"
              max="0"
              step="1"
              value={lift}
              onChange={(e) => setLift(Number(e.target.value))}
              className="cfc-range"
            />
          </div>

          <div className="cfc-control-row">
            <div className="cfc-color-item">
              <label className="cfc-label">Fill Color</label>
              <div className="cfc-color-input-wrapper">
                <input
                  type="color"
                  value={fillColor.startsWith('#') ? fillColor : '#ffffff'}
                  onChange={(e) => setFillColor(e.target.value)}
                />
                <span>{fillColor}</span>
              </div>
            </div>

            <div className="cfc-color-item">
              <label className="cfc-label">Base Card Color</label>
              <div className="cfc-color-input-wrapper">
                <input
                  type="color"
                  value={baseColor.startsWith('#') ? baseColor : '#080808'}
                  onChange={(e) => setBaseColor(e.target.value)}
                />
                <span>{baseColor}</span>
              </div>
            </div>
          </div>

          <div className="cfc-control-row">
            <div className="cfc-color-item">
              <label className="cfc-label">Filled Text Color</label>
              <div className="cfc-color-input-wrapper">
                <input
                  type="color"
                  value={fillTextColor.startsWith('#') ? fillTextColor : '#000000'}
                  onChange={(e) => setFillTextColor(e.target.value)}
                />
                <span>{fillTextColor}</span>
              </div>
            </div>

            <div className="cfc-color-item">
              <label className="cfc-label">Base Text Color</label>
              <div className="cfc-color-input-wrapper">
                <input
                  type="color"
                  value={textColor.startsWith('#') ? textColor : '#ffffff'}
                  onChange={(e) => setTextColor(e.target.value)}
                />
                <span>{textColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

