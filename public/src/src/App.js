import React, { useState, useEffect } from 'react';
import DeepwokenSheet from './DeepwokenSheet';

const SAVE_KEY = 'deepwoken_saves';

function loadSaves() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
  catch { return {}; }
}

export default function App() {
  const [saves, setSaves] = useState(loadSaves);
  const [activeSlot, setActiveSlot] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [showSlots, setShowSlots] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [notification, setNotification] = useState('');

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2200);
  };

  const handleSave = (data) => {
    const slot = activeSlot || ('personagem_' + Date.now());
    const name = data.name || slot;
    const updated = { ...saves, [slot]: { ...data, _savedAt: new Date().toISOString(), _displayName: name } };
    localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
    setSaves(updated);
    setActiveSlot(slot);
    notify(`✓ ${name} salvo!`);
  };

  const handleLoad = (slot) => {
    const data = saves[slot];
    if (data) {
      setSheetData(data);
      setActiveSlot(slot);
      setShowSlots(false);
      notify(`✓ ${data._displayName || slot} carregado!`);
    }
  };

  const handleDelete = (slot) => {
    const updated = { ...saves };
    delete updated[slot];
    localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
    setSaves(updated);
    if (activeSlot === slot) { setActiveSlot(null); setSheetData(null); }
    notify('Personagem deletado.');
  };

  const handleNew = () => {
    setSheetData(null);
    setActiveSlot(null);
    setShowSlots(false);
    notify('Nova ficha em branco!');
  };

  const slotCount = Object.keys(saves).length;

  return (
    <div style={{ background: '#030b0a', minHeight: '100vh' }}>
      {/* ── TOP BAR ── */}
      <div style={{
        background: 'linear-gradient(90deg, #030b0a, #0a2520, #030b0a)',
        borderBottom: '1px solid #1e3a36',
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
      }}>
        <span style={{
          fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 4,
          color: '#4a8a84', flexGrow: 1
        }}>
          DEEPWOKEN RPG
          {activeSlot && saves[activeSlot] ? (
            <span style={{ color: '#2e6a60', marginLeft: 12, fontSize: 9 }}>
              · {saves[activeSlot]._displayName || activeSlot}
            </span>
          ) : null}
        </span>

        <button onClick={handleNew} style={barBtn('#1e4a44', '#4be0c0')}>
          + NOVO
        </button>
        <button onClick={() => setShowSlots(s => !s)} style={barBtn('#1a3530', '#4a9a94')}>
          PERSONAGENS {slotCount > 0 ? `(${slotCount})` : ''}
        </button>
      </div>

      {/* ── NOTIFICATION ── */}
      {notification && (
        <div style={{
          position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)',
          background: '#0d2e28', border: '1px solid #2e7a6e', borderRadius: 4,
          color: '#4be0c0', fontFamily: "'Cinzel',serif", fontSize: 11,
          padding: '8px 20px', zIndex: 9999, letterSpacing: 2,
          boxShadow: '0 4px 20px #000a'
        }}>
          {notification}
        </div>
      )}

      {/* ── SLOT PANEL ── */}
      {showSlots && (
        <div style={{
          position: 'fixed', inset: 0, background: '#000c', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowSlots(false)}>
          <div style={{
            background: '#060f0e', border: '1px solid #1e4a44',
            borderRadius: 4, padding: 24, minWidth: 320, maxWidth: 480,
            boxShadow: '0 8px 40px #000'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 4,
              color: '#4a8a84', marginBottom: 16, borderBottom: '1px solid #1e3a36',
              paddingBottom: 8
            }}>PERSONAGENS SALVOS</div>

            {slotCount === 0 ? (
              <div style={{ color: '#2e5550', fontSize: 11, textAlign: 'center', padding: 20 }}>
                Nenhuma ficha salva ainda.
              </div>
            ) : (
              Object.entries(saves).map(([slot, data]) => (
                <div key={slot} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 0', borderBottom: '1px solid #0d2420'
                }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{
                      fontFamily: "'Cinzel',serif", fontSize: 11,
                      color: activeSlot === slot ? '#4be0c0' : '#7ab8b0'
                    }}>
                      {data._displayName || slot}
                    </div>
                    <div style={{ fontSize: 9, color: '#2e5550', marginTop: 2 }}>
                      {data.raca} · Nív {data.nivel} · {data.attunement}
                      {data._savedAt ? ' · ' + new Date(data._savedAt).toLocaleDateString('pt-BR') : ''}
                    </div>
                  </div>
                  <button onClick={() => handleLoad(slot)} style={barBtn('#1a3530', '#4be0c0', 9)}>
                    CARREGAR
                  </button>
                  <button onClick={() => handleDelete(slot)} style={barBtn('#2a0a0a', '#c0392b', 9)}>
                    ✕
                  </button>
                </div>
              ))
            )}

            <button onClick={() => setShowSlots(false)} style={{
              marginTop: 16, width: '100%', padding: '8px',
              background: 'transparent', border: '1px solid #1e3a36',
              color: '#3a6a64', cursor: 'pointer',
              fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 2
            }}>FECHAR</button>
          </div>
        </div>
      )}

      {/* ── SHEET ── */}
      <DeepwokenSheet
        initialData={sheetData}
        onSave={handleSave}
      />
    </div>
  );
}

const barBtn = (bg, color, size = 10) => ({
  padding: '5px 12px', background: bg,
  border: `1px solid ${color}66`,
  color, cursor: 'pointer',
  fontFamily: "'Cinzel',serif",
  fontSize: size, letterSpacing: 2,
  borderRadius: 2, whiteSpace: 'nowrap'
});
