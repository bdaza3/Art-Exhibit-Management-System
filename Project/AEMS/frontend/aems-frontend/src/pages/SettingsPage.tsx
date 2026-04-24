import React, { useEffect, useState } from "react";
import "./SettingsPage.css";
import PageTopBar from "../components/PageTopBar";

type Settings = {
  displayName: string;
  email: string;
  notifications: boolean;
  marketingEmails: boolean;
};

type UISettings = {
  fontSize: number; // px
  fontFamily: string;
  theme: "dark" | "light";
  reducedMotion: boolean;
  density: "comfortable" | "compact";
};

const KEY = "aems_settings";
const UI_KEY = "aems_ui_settings";

const DEFAULT_UI: UISettings = {
  fontSize: 16,
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  theme: "dark",
  reducedMotion: false,
  density: "comfortable",
};

function loadUISettings(): UISettings {
  try {
    const raw = localStorage.getItem(UI_KEY);
    return raw ? { ...DEFAULT_UI, ...(JSON.parse(raw) as Partial<UISettings>) } : DEFAULT_UI;
  } catch {
    return DEFAULT_UI;
  }
}

function applyUISettings(u: UISettings) {
  // global text size
  document.documentElement.style.fontSize = `${u.fontSize}px`;

  // global font
  document.documentElement.style.setProperty("--app-font", u.fontFamily);
  document.body.style.fontFamily = "var(--app-font)";

  // flags for global CSS
  document.body.dataset.theme = u.theme;
  document.body.dataset.density = u.density;
  document.body.dataset.motion = u.reducedMotion ? "reduced" : "normal";
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw
      ? (JSON.parse(raw) as Settings)
      : {
          displayName: "Customer",
          email: "customer@example.com",
          notifications: true,
          marketingEmails: false,
        };
  } catch {
    return {
      displayName: "Customer",
      email: "customer@example.com",
      notifications: true,
      marketingEmails: false,
    };
  }
}



export default function SettingsPage() {
  const [s, setS] = useState<Settings>(() => loadSettings());
const [ui, setUi] = useState<UISettings>(() => loadUISettings());
  const [saved, setSaved] = useState(false);

useEffect(() => {
  localStorage.setItem(KEY, JSON.stringify(s));
  setSaved(true);
  const t = setTimeout(() => setSaved(false), 1200);
  return () => clearTimeout(t);
}, [s]);

// apply once on mount
useEffect(() => {
  applyUISettings(ui);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// save + apply UI settings
useEffect(() => {
  localStorage.setItem(UI_KEY, JSON.stringify(ui));
  applyUISettings(ui);
}, [ui]);

  return (
    <div className="settings-page">

        <PageTopBar title="Settings" />

      <div className="settings-header">
        {saved && <span className="pill">Saved</span>}
      </div>

      <div className="settings-card">
        <h3>Profile</h3>

        <label>
          Display name
          <input
            value={s.displayName}
            onChange={(e) => setS({ ...s, displayName: e.target.value })}
            placeholder="Your name"
          />
        </label>

        <label>
          Email
          <input
            value={s.email}
            onChange={(e) => setS({ ...s, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="settings-card">
        <h3>Notifications</h3>

        <div className="toggle-row">
          <div>
            <div className="toggle-title">App notifications</div>
            <div className="muted">Order updates, ticket reminders</div>
          </div>
          <input
            type="checkbox"
            checked={s.notifications}
            onChange={(e) => setS({ ...s, notifications: e.target.checked })}
          />
        </div>

        <div className="toggle-row">
          <div>
            <div className="toggle-title">Marketing emails</div>
            <div className="muted">New exhibitions and featured artists</div>
          </div>
          <input
            type="checkbox"
            checked={s.marketingEmails}
            onChange={(e) => setS({ ...s, marketingEmails: e.target.checked })}
          />
        </div>
      </div>

      {/*<div className="settings-card danger-zone">
        <h3>Danger zone</h3>
        <button
          className="btn btn-ghost danger"
          onClick={() => alert("Hook this to your logout/delete flow later")}
        >
          Log out everywhere (placeholder)
        </button>
      </div>
      */}
      <div className="settings-card">
  <h3>Appearance</h3>

  {/* Theme */}
  <div className="field">
    <div className="field-label">Theme</div>
    <select
      value={ui.theme}
      onChange={(e) => setUi({ ...ui, theme: e.target.value as UISettings["theme"] })}
    >
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  </div>

  {/* Font size */}
  <div className="field">
    <div className="field-label">Font size</div>
    <div className="range-row">
      <input
        type="range"
        min={14}
        max={20}
        value={ui.fontSize}
        onChange={(e) => setUi({ ...ui, fontSize: Number(e.target.value) })}
      />
      <span className="range-value">{ui.fontSize}px</span>
    </div>
  </div>

  {/* Font family */}
  <div className="field">
    <div className="field-label">Font</div>
    <select
      value={ui.fontFamily}
      onChange={(e) => setUi({ ...ui, fontFamily: e.target.value })}
    >
      <option value="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif">
        Inter / System (Modern)
      </option>
      <option value="Georgia, 'Times New Roman', serif">Georgia (Classic)</option>
      <option value="'Playfair Display', Georgia, serif">Playfair (Luxury)</option>
      <option value="'Courier New', Courier, monospace">Monospace</option>
    </select>
  </div>

  {/* Density */}
  <div className="field">
    <div className="field-label">Layout density</div>
    <select
      value={ui.density}
      onChange={(e) => setUi({ ...ui, density: e.target.value as UISettings["density"] })}
    >
      <option value="comfortable">Comfortable</option>
      <option value="compact">Compact</option>
    </select>
  </div>

  {/* Reduced motion */}
  <div className="toggle-row">
    <div>
      <div className="toggle-title">Reduce motion</div>
      <div className="muted">Disables most animations</div>
    </div>
    <input
      type="checkbox"
      checked={ui.reducedMotion}
      onChange={(e) => setUi({ ...ui, reducedMotion: e.target.checked })}
    />
  </div>

  <button className="btn btn-ghost" onClick={() => setUi(DEFAULT_UI)}>
    Reset appearance
  </button>
</div>
    </div>
    
  );
}