import { useState, useCallback, useEffect } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const mod = (v) => {
  const m = Math.floor((v - 10) / 2);
  return (m >= 0 ? "+" : "") + m;
};
const attrMod = (v) => {
  if (v <= 1) return -5;
  if (v <= 3) return -4;
  if (v <= 5) return -3;
  if (v <= 7) return -2;
  if (v <= 9) return -1;
  if (v <= 11) return 0;
  if (v <= 13) return 1;
  if (v <= 15) return 2;
  if (v <= 17) return 3;
  if (v <= 19) return 4;
  if (v <= 21) return 5;
  if (v <= 23) return 6;
  if (v <= 25) return 7;
  if (v <= 27) return 8;
  if (v <= 29) return 9;
  return 10;
};
const fmtMod = (v) => (v >= 0 ? `+${v}` : `${v}`);

const RACAS = ["Etrean","Felinor","Gremor","Khan","Tiran","Vesperian","Adret","Canor"];
const ATTUNEMENTS = ["Galebreath","Flamecharm","Thundercall","Frostdraw","No Attunement","Metal","Sombra","Sangue"];
const OATHS = ["Oathless","Jetstriker","Arcwarder","Silentheart","Starkindred","Visionshaper","Linkstrider","Fadetrimmer","Dawnwalker","Saltchemist","Blindseer","Blightsurger","Soulbreaker","Contractor"];
const FACCOES = ["Kingdom of Etrea","The Central Authority","The Hundred Legions","The Hive","The Divers","The Ignition Union","Lost Celtor","Children of Navae","The Ministry"];
const REP_LABELS = ["Hostil","Neutro","Favorável","Aliado"];
const REP_COLORS = ["#c0392b","#7f8c8d","#27ae60","#2980b9"];

const ATTR_DEFS = [
  { key:"str", label:"STR", desc:"Força" },
  { key:"fort", label:"FORT", desc:"Fortitude" },
  { key:"agi", label:"AGI", desc:"Agilidade" },
  { key:"int", label:"INT", desc:"Inteligência" },
  { key:"will", label:"WILL", desc:"Willpower" },
  { key:"cha", label:"CHA", desc:"Carisma" },
];

// ── sub-components ────────────────────────────────────────────────────────────
function StatBar({ label, current, max, color, onCurrent, onMax }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:"#8fada8", letterSpacing:2 }}>{label}</span>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          <input
            type="number" min={0} max={max} value={current}
            onChange={e=>onCurrent(Math.max(0,Math.min(max,+e.target.value)))}
            style={numInput}
          />
          <span style={{ color:"#4a6a66", fontSize:11 }}>/</span>
          <input
            type="number" min={1} max={99} value={max}
            onChange={e=>onMax(Math.max(1,+e.target.value))}
            style={numInput}
          />
        </div>
      </div>
      <div style={{ height:6, background:"#0d1f1e", borderRadius:2, overflow:"hidden", border:"1px solid #1e3a36" }}>
        <div style={{
          height:"100%", borderRadius:2, transition:"width .3s",
          background:`linear-gradient(90deg, ${color}, ${color}88)`,
          width:`${Math.min(100,(current/max)*100)}%`
        }}/>
      </div>
    </div>
  );
}

function AttrBox({ def, value, onChange }) {
  const m = attrMod(value);
  return (
    <div style={{
      border:"1px solid #1e3a36", background:"#060f0e",
      padding:"10px 8px", textAlign:"center", position:"relative",
      clipPath:"polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
    }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:"#4a7a74", letterSpacing:3, marginBottom:4 }}>{def.label}</div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
        <button onClick={()=>onChange(Math.max(1,value-1))} style={smallBtn}>−</button>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:22, color:"#c8e8e0", fontWeight:700, minWidth:28, display:"inline-block" }}>{value}</span>
        <button onClick={()=>onChange(Math.min(20,value+1))} style={smallBtn}>+</button>
      </div>
      <div style={{
        marginTop:4, fontFamily:"monospace", fontSize:13,
        color: m >= 3 ? "#4be0c0" : m <= -2 ? "#c05050" : "#7aada8",
        fontWeight:700
      }}>{fmtMod(m)}</div>
      <div style={{ fontSize:8, color:"#2e5550", marginTop:2, letterSpacing:1 }}>{def.desc.toUpperCase()}</div>
    </div>
  );
}

function RepBadge({ label, level, onChange }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:10, color:"#6a9a94", fontFamily:"'Cinzel',serif", letterSpacing:1 }}>{label}</span>
        <span style={{ fontSize:10, fontWeight:700, color: REP_COLORS[level] }}>{REP_LABELS[level]}</span>
      </div>
      <div style={{ display:"flex", gap:3 }}>
        {REP_LABELS.map((r,i) => (
          <button key={r} onClick={()=>onChange(i)} style={{
            flex:1, height:5, border:"none", cursor:"pointer", borderRadius:1,
            background: i <= level ? REP_COLORS[level] : "#1a2e2c",
            transition:"background .2s"
          }}/>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children, accent="#1e4a44" }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{
        fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:4,
        color:"#4a8a84", marginBottom:8, borderBottom:`1px solid ${accent}`,
        paddingBottom:4, textTransform:"uppercase"
      }}>{title}</div>
      {children}
    </div>
  );
}

function NotesArea({ value, onChange, placeholder, rows=4 }) {
  return (
    <textarea
      value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{
        width:"100%", background:"#060f0e", border:"1px solid #1e3a36",
        color:"#8ab8b0", fontFamily:"'Courier New',monospace", fontSize:11,
        padding:"8px", resize:"vertical", outline:"none", borderRadius:2,
        lineHeight:1.6, boxSizing:"border-box"
      }}
    />
  );
}

// ── styles ───────────────────────────────────────────────────────────────────
const numInput = {
  width:38, background:"#060f0e", border:"1px solid #1e3a36",
  color:"#c8e8e0", fontFamily:"'Cinzel',serif", fontSize:12,
  textAlign:"center", padding:"2px 4px", outline:"none", borderRadius:2
};
const smallBtn = {
  width:18, height:18, background:"#0d2420", border:"1px solid #2a5a54",
  color:"#4be0c0", cursor:"pointer", fontSize:12, padding:0, lineHeight:1,
  borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center"
};
const selectStyle = {
  background:"#060f0e", border:"1px solid #1e3a36", color:"#8ab8b0",
  fontFamily:"'Cinzel',serif", fontSize:10, padding:"4px 6px",
  outline:"none", width:"100%", borderRadius:2
};
const textInput = {
  background:"#060f0e", border:"1px solid #1e3a36", color:"#c8e8e0",
  fontFamily:"'Cinzel',serif", fontSize:12, padding:"5px 8px",
  outline:"none", width:"100%", boxSizing:"border-box", borderRadius:2
};
const tagStyle = (active, color="#4be0c0") => ({
  padding:"2px 8px", fontSize:9, letterSpacing:2,
  fontFamily:"'Cinzel',serif", border:`1px solid ${active ? color : "#1e3a36"}`,
  background: active ? `${color}22` : "transparent",
  color: active ? color : "#3a6a64", cursor:"pointer", borderRadius:1,
  transition:"all .15s"
});

// ── main component ────────────────────────────────────────────────────────────
export default function DeepwokenSheet({ initialData, onSave }) {
  const D = initialData || {};

  // identity
  const [name, setName] = useState(D.name || ""); 
  const [raca, setRaca] = useState(D.raca || "Etrean");
  const [attunement, setAttunement] = useState(D.attunement || "Galebreath");
  const [oath, setOath] = useState(D.oath || "Oathless");
  const [nivel, setNivel] = useState(D.nivel || 1);
  const [background, setBackground] = useState(D.background || "");

  // attrs
  const [attrs, setAttrs] = useState(D.attrs || { str:10, fort:10, agi:10, int:10, will:10, cha:10 });
  const setAttr = (k,v) => setAttrs(a=>({...a,[k]:v}));

  // derived stats
  const fortMod = attrMod(attrs.fort);
  const agiMod = attrMod(attrs.agi);
  const willMod = attrMod(attrs.will);
  const strVal = attrs.str;

  const maxHP = 10 + fortMod;
  const maxSAN = 8 + willMod;
  const maxCARGA = strVal + 5;
  const baseCA = 8 + agiMod;

  // trackable stats
  const [hp, setHp] = useState(D.hp ?? 10);
  const [maxHpCustom, setMaxHpCustom] = useState(D.maxHpCustom ?? 10);
  const [mana, setMana] = useState(D.mana ?? 8);
  const [postura, setPostura] = useState(D.postura ?? 8);
  const [san, setSan] = useState(D.san ?? 8);
  const [exaustao, setExaustao] = useState(D.exaustao ?? 0);
  const [armadura, setArmadura] = useState(D.armadura ?? 0);

  // faction rep
  const [reps, setReps] = useState(D.reps || Object.fromEntries(FACCOES.map(f=>[f,1])));
  const setRep = (f,v) => setReps(r=>({...r,[f]:v}));

  // mantras & talentos
  const [mantras, setMantras] = useState(D.mantras || ["","","",""]);
  const setMantra = (i,v) => setMantras(m=>{const n=[...m];n[i]=v;return n;});
  const [talentos, setTalentos] = useState(D.talentos || ["",""]);
  const setTalento = (i,v) => setTalentos(t=>{const n=[...t];n[i]=v;return n;});

  // equipment & notes
  const [equipamentos, setEquipamentos] = useState(D.equipamentos || "Arma básica\nArmadura leve\n3 Rações\nMochila");
  const [notas, setNotas] = useState(D.notas || "");
  const [objetivos, setObjetivos] = useState(D.objetivos || "");
  const [aliados, setAliados] = useState(D.aliados || "");

  // reload if initialData changes (load from slot)
  useEffect(() => {
    if (!initialData) return;
    const D2 = initialData;
    setName(D2.name || ""); setRaca(D2.raca || "Etrean");
    setAttunement(D2.attunement || "Galebreath"); setOath(D2.oath || "Oathless");
    setNivel(D2.nivel || 1); setBackground(D2.background || "");
    setAttrs(D2.attrs || { str:10, fort:10, agi:10, int:10, will:10, cha:10 });
    setHp(D2.hp ?? 10); setMaxHpCustom(D2.maxHpCustom ?? 10);
    setMana(D2.mana ?? 8); setPostura(D2.postura ?? 8);
    setSan(D2.san ?? 8); setExaustao(D2.exaustao ?? 0); setArmadura(D2.armadura ?? 0);
    setReps(D2.reps || Object.fromEntries(FACCOES.map(f=>[f,1])));
    setMantras(D2.mantras || ["","","",""]); setTalentos(D2.talentos || ["",""]);
    setEquipamentos(D2.equipamentos || "Arma básica\nArmadura leve\n3 Rações\nMochila");
    setNotas(D2.notas || ""); setObjetivos(D2.objetivos || ""); setAliados(D2.aliados || "");
  }, [initialData]);

  const handleSave = () => {
    if (onSave) onSave({
      name, raca, attunement, oath, nivel, background, attrs,
      hp, maxHpCustom, mana, postura, san, exaustao, armadura,
      reps, mantras, talentos, equipamentos, notas, objetivos, aliados
    });
  };

  // active tab
  const [tab, setTab] = useState("ficha");

  const tabs = [
    { id:"ficha", label:"FICHA" },
    { id:"combate", label:"COMBATE" },
    { id:"faccoes", label:"FACÇÕES" },
    { id:"notas", label:"NOTAS" },
  ];

  const CA = baseCA + armadura;

  return (
    <div style={{
      minHeight:"100vh",
      background:"#030b0a",
      backgroundImage:`
        radial-gradient(ellipse at 20% 10%, #0a2520 0%, transparent 50%),
        radial-gradient(ellipse at 80% 90%, #071a18 0%, transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 40px, #0a1a181a 40px, #0a1a181a 41px),
        repeating-linear-gradient(90deg, transparent, transparent 40px, #0a1a181a 40px, #0a1a181a 41px)
      `,
      fontFamily:"'Georgia',serif",
      padding:"16px",
      color:"#8ab8b0"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@700&display=swap');
        ::-webkit-scrollbar{width:4px;background:#030b0a}
        ::-webkit-scrollbar-thumb{background:#1e4a44}
        input[type=number]::-webkit-inner-spin-button{opacity:0.3}
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        textAlign:"center", marginBottom:20, position:"relative",
        borderBottom:"1px solid #1e3a36", paddingBottom:16
      }}>
        <div style={{
          fontFamily:"'Cinzel Decorative',serif", fontSize:28, fontWeight:700,
          background:"linear-gradient(180deg, #7ae8d8 0%, #3a9a8a 50%, #1a5a50 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          letterSpacing:6, textShadow:"none", lineHeight:1
        }}>DEEPWOKEN</div>
        <div style={{
          fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:8,
          color:"#2e6a60", marginTop:4
        }}>FICHA DE PERSONAGEM</div>
        {onSave && (
          <button onClick={handleSave} style={{
            marginTop:10, padding:"6px 20px",
            background:"#0d2e28", border:"1px solid #2e7a6e",
            color:"#4be0c0", cursor:"pointer",
            fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:3,
            borderRadius:2, display:"inline-block"
          }}>✦ SALVAR FICHA</button>
        )}
        <div style={{
          position:"absolute", top:0, left:0, right:0, bottom:0,
          background:"radial-gradient(ellipse at 50% 50%, #4be0c008 0%, transparent 70%)",
          pointerEvents:"none"
        }}/>
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", gap:2, marginBottom:16 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, padding:"8px 0", fontFamily:"'Cinzel',serif",
            fontSize:9, letterSpacing:3,
            background: tab===t.id ? "#0d2e28" : "transparent",
            border:`1px solid ${tab===t.id ? "#2e7a6e" : "#1a3530"}`,
            color: tab===t.id ? "#4be0c0" : "#3a6a64",
            cursor:"pointer", transition:"all .2s",
            clipPath: tab===t.id ? "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" : "none"
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ FICHA TAB */}
      {tab==="ficha" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          {/* LEFT */}
          <div>
            <Section title="Identidade">
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:9, color:"#3a6a64", marginBottom:3, letterSpacing:2 }}>NOME</div>
                <input value={name} onChange={e=>setName(e.target.value)}
                  placeholder="Nome do personagem..." style={textInput}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:9, color:"#3a6a64", marginBottom:3, letterSpacing:2 }}>RAÇA</div>
                  <select value={raca} onChange={e=>setRaca(e.target.value)} style={selectStyle}>
                    {RACAS.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:9, color:"#3a6a64", marginBottom:3, letterSpacing:2 }}>NÍVEL</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>setNivel(n=>Math.max(1,n-1))} style={smallBtn}>−</button>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:"#c8e8e0", minWidth:24, textAlign:"center" }}>{nivel}</span>
                    <button onClick={()=>setNivel(n=>Math.min(20,n+1))} style={smallBtn}>+</button>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:9, color:"#3a6a64", marginBottom:3, letterSpacing:2 }}>ATTUNEMENT</div>
                <select value={attunement} onChange={e=>setAttunement(e.target.value)} style={selectStyle}>
                  {ATTUNEMENTS.map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:9, color:"#3a6a64", marginBottom:3, letterSpacing:2 }}>OATH</div>
                <select value={oath} onChange={e=>setOath(e.target.value)} style={selectStyle}>
                  {OATHS.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </Section>

            <Section title="Atributos">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
                {ATTR_DEFS.map(d=>(
                  <AttrBox key={d.key} def={d} value={attrs[d.key]}
                    onChange={v=>setAttr(d.key,v)}/>
                ))}
              </div>
            </Section>

            <Section title="Background">
              <NotesArea value={background} onChange={setBackground}
                placeholder="História, motivações, segredos..." rows={4}/>
            </Section>
          </div>

          {/* RIGHT */}
          <div>
            <Section title="Recursos Vitais">
              <StatBar label="VIDA" current={hp} max={maxHpCustom}
                color="#c0392b" onCurrent={setHp} onMax={setMaxHpCustom}/>
              <StatBar label="MANA" current={mana} max={nivel<=4?8:nivel<=9?11:14}
                color="#2980b9" onCurrent={setMana} onMax={()=>{}}/>
              <StatBar label="POSTURA" current={postura} max={8}
                color="#f39c12" onCurrent={setPostura} onMax={()=>{}}/>
              <StatBar label="SANIDADE" current={san} max={8+willMod}
                color="#8e44ad" onCurrent={setSan} onMax={()=>{}}/>

              <div style={{
                display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginTop:10
              }}>
                {[
                  { label:"CA", value:CA, sub:`base ${baseCA}` },
                  { label:"CARGA", value:`${maxCARGA}`, sub:`STR+5` },
                  { label:"EXAUSTÃO", value:`${exaustao}/5`, sub:`-${exaustao} dados` },
                ].map(s=>(
                  <div key={s.label} style={{
                    border:"1px solid #1e3a36", background:"#060f0e",
                    padding:"8px", textAlign:"center",
                    clipPath:"polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))"
                  }}>
                    <div style={{ fontSize:9, color:"#3a6a64", letterSpacing:2 }}>{s.label}</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:"#c8e8e0", margin:"2px 0" }}>{s.value}</div>
                    <div style={{ fontSize:8, color:"#2e5550" }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:9, color:"#3a6a64", letterSpacing:2 }}>EXAUSTÃO</span>
                {[0,1,2,3,4,5].map(i=>(
                  <button key={i} onClick={()=>setExaustao(i)} style={{
                    width:16, height:16, borderRadius:"50%",
                    background: i<=exaustao && exaustao>0 ? "#c0392b" : "#0d1f1e",
                    border:`1px solid ${i<=exaustao && exaustao>0 ? "#c0392b" : "#2a4a44"}`,
                    cursor:"pointer"
                  }}/>
                ))}
              </div>

              <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:9, color:"#3a6a64", letterSpacing:2 }}>ARMADURA +CA</span>
                <input type="number" min={0} max={10} value={armadura}
                  onChange={e=>setArmadura(+e.target.value)}
                  style={{...numInput, width:48}}/>
              </div>
            </Section>

            <Section title="Mantras">
              {mantras.map((m,i)=>(
                <div key={i} style={{ marginBottom:6 }}>
                  <input value={m} onChange={e=>setMantra(i,e.target.value)}
                    placeholder={`Mantra ${i+1}...`}
                    style={{...textInput, fontSize:11, color:"#7ae8d8"}}/>
                </div>
              ))}
              <button onClick={()=>setMantras(m=>[...m,""])} style={{
                width:"100%", padding:"4px", background:"transparent",
                border:"1px dashed #1e4a44", color:"#2e7a6e",
                cursor:"pointer", fontSize:10, fontFamily:"'Cinzel',serif",
                letterSpacing:2
              }}>+ MANTRA</button>
            </Section>

            <Section title="Talentos">
              {talentos.map((t,i)=>(
                <div key={i} style={{ marginBottom:6 }}>
                  <input value={t} onChange={e=>{
                    const n=[...talentos];n[i]=e.target.value;setTalentos(n);
                  }} placeholder={`Talento ${i+1}...`} style={{...textInput, fontSize:11}}/>
                </div>
              ))}
              <button onClick={()=>setTalentos(t=>[...t,""])} style={{
                width:"100%", padding:"4px", background:"transparent",
                border:"1px dashed #1e4a44", color:"#2e7a6e",
                cursor:"pointer", fontSize:10, fontFamily:"'Cinzel',serif",
                letterSpacing:2
              }}>+ TALENTO</button>
            </Section>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ COMBATE TAB */}
      {tab==="combate" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <Section title="Referência de Combate">
              {[
                ["Ataque","1d20 + Atributo ≥ CA"],
                ["Arma Leve","1d4 + STR (2× ataques)"],
                ["Arma Média","1d6 + STR"],
                ["Arma Pesada","1d8 + STR (STR 12 mín)"],
                ["Movimento","9m padrão"],
                ["Parry","1d20 + defesa vs ataque"],
                ["Bloquear Leve","1 Postura / dano ÷2"],
                ["Bloquear Médio","2 Postura / dano ÷2"],
                ["Bloquear Pesado","3 Postura / dano ÷2"],
              ].map(([k,v])=>(
                <div key={k} style={{
                  display:"flex", justifyContent:"space-between",
                  borderBottom:"1px solid #0d2420", padding:"5px 0",
                  fontSize:11
                }}>
                  <span style={{ color:"#4a8a84", fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:1 }}>{k}</span>
                  <span style={{ color:"#8ab8b0", fontFamily:"monospace" }}>{v}</span>
                </div>
              ))}
            </Section>

            <Section title="Estados de Combate" accent="#3a2010">
              {[
                { label:"QUEBRA DE POSTURA", color:"#e67e22", desc:"Atordoado 1 rodada • Dano ×2" },
                { label:"QUEIMANDO", color:"#e74c3c", desc:"1d4 por 1d3 turnos" },
                { label:"LENTIDÃO", color:"#3498db", desc:"−2m deslocamento" },
                { label:"INSTABILIDADE", color:"#9b59b6", desc:"−1d4 Reação/Esquiva" },
                { label:"STAGGER", color:"#f39c12", desc:"−1d6 próximo ataque • deslocamento 2m" },
                { label:"STUN LEVE", color:"#e67e22", desc:"−1d6 Reação" },
              ].map(s=>(
                <div key={s.label} style={{
                  border:`1px solid ${s.color}44`, background:`${s.color}0a`,
                  padding:"6px 8px", marginBottom:4, borderRadius:2,
                  display:"flex", justifyContent:"space-between", alignItems:"center"
                }}>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:s.color, letterSpacing:2 }}>{s.label}</span>
                  <span style={{ fontSize:10, color:"#7a9a94", fontFamily:"monospace" }}>{s.desc}</span>
                </div>
              ))}
            </Section>
          </div>

          <div>
            <Section title="Tracker de Combate">
              <StatBar label="VIDA" current={hp} max={maxHpCustom}
                color="#c0392b" onCurrent={setHp} onMax={setMaxHpCustom}/>
              <StatBar label="POSTURA" current={postura} max={8}
                color="#f39c12" onCurrent={setPostura} onMax={()=>{}}/>
              <StatBar label="MANA" current={mana} max={nivel<=4?8:nivel<=9?11:14}
                color="#2980b9" onCurrent={setMana} onMax={()=>{}}/>

              <div style={{ marginTop:12, marginBottom:12 }}>
                <div style={{ fontSize:9, color:"#3a6a64", letterSpacing:3, marginBottom:8 }}>AÇÕES DO TURNO</div>
                {["Ação Principal","Movimento","Reação"].map(a=>(
                  <div key={a} style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"5px 0", borderBottom:"1px solid #0d2420"
                  }}>
                    <div style={{ width:14, height:14, border:"1px solid #2a6a64", borderRadius:2 }}/>
                    <span style={{ fontSize:11, color:"#6a9a94" }}>{a}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Resistências">
              <div style={{ fontSize:10, color:"#4a7a74", marginBottom:8 }}>
                (1× por combate — reduzem dano base)
              </div>
              {[
                { label:"Res. Leve", dice:"1d4", color:"#27ae60" },
                { label:"Res. Moderada", dice:"1d6", color:"#f39c12" },
              ].map(r=>(
                <div key={r.label} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"6px 8px", border:"1px solid #1e3a36", marginBottom:4,
                  background:"#060f0e"
                }}>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:"#6a9a94" }}>{r.label}</span>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontFamily:"monospace", color:r.color, fontSize:13 }}>{r.dice}</span>
                    <div style={{ width:14, height:14, border:`1px solid ${r.color}88`, borderRadius:2 }}/>
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Equipamentos">
              <NotesArea value={equipamentos} onChange={setEquipamentos}
                placeholder="Armas, armaduras, itens..." rows={6}/>
            </Section>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ FACÇÕES TAB */}
      {tab==="faccoes" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <Section title="Reputação entre Facções">
              <div style={{ fontSize:9, color:"#2e5550", marginBottom:10, letterSpacing:1 }}>
                HOSTIL → NEUTRO → FAVORÁVEL → ALIADO
              </div>
              {FACCOES.map(f=>(
                <RepBadge key={f} label={f} level={reps[f]} onChange={v=>setRep(f,v)}/>
              ))}
            </Section>
          </div>

          <div>
            <Section title="Referência de Facções">
              {[
                { name:"Kingdom of Etrea", desc:"Estado mais antigo. Militar estável. Rival da Authority.", color:"#c0392b" },
                { name:"The Central Authority", desc:"Expansão e controle territorial. Poder dominante.", color:"#e67e22" },
                { name:"The Hundred Legions", desc:"Disciplina marcial. Tradição guerreira. Territórios fortif.", color:"#f39c12" },
                { name:"The Hive", desc:"Isolacionista. Biotecnologia orgânica. Território protegido.", color:"#27ae60" },
                { name:"The Divers", desc:"Exploração das Depths. Pesquisadores. Alto índice mortal.", color:"#2980b9" },
                { name:"The Ignition Union", desc:"Engenharia e tecnologia. Bases superfície/Depths.", color:"#8e44ad" },
                { name:"Lost Celtor", desc:"Civilização afundada. Ruínas submersas. Relações neutras.", color:"#7f8c8d" },
                { name:"Children of Navae", desc:"Tribos nômades. Identidade espiritual. Anti-político.", color:"#1abc9c" },
                { name:"The Ministry", desc:"Sombras políticas/religiosas. Objetivos obscuros.", color:"#2c3e50" },
              ].map(f=>(
                <div key={f.name} style={{
                  borderLeft:`3px solid ${f.color}`, paddingLeft:8,
                  marginBottom:8, paddingBottom:6,
                  borderBottom:"1px solid #0d1f1e"
                }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:f.color, letterSpacing:1 }}>{f.name}</div>
                  <div style={{ fontSize:9, color:"#5a8a84", marginTop:2, lineHeight:1.4 }}>{f.desc}</div>
                </div>
              ))}
            </Section>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ NOTAS TAB */}
      {tab==="notas" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <Section title="Objetivos & Missões">
              <NotesArea value={objetivos} onChange={setObjetivos}
                placeholder="Objetivos atuais, missões em andamento, dívidas políticas..." rows={8}/>
            </Section>
            <Section title="Aliados & Inimigos">
              <NotesArea value={aliados} onChange={setAliados}
                placeholder="Personagens importantes, contatos, rivais..." rows={6}/>
            </Section>
          </div>
          <div>
            <Section title="Notas Gerais">
              <NotesArea value={notas} onChange={setNotas}
                placeholder="Anotações livres, lore descoberta, segredos..." rows={8}/>
            </Section>
            <Section title="Equipamentos & Inventário">
              <NotesArea value={equipamentos} onChange={setEquipamentos}
                placeholder="Inventário completo, itens especiais, moedas..." rows={6}/>
            </Section>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        marginTop:20, textAlign:"center",
        fontFamily:"'Cinzel',serif", fontSize:8,
        letterSpacing:4, color:"#1e3a36",
        borderTop:"1px solid #0d2420", paddingTop:12
      }}>
        DEEPWOKEN RPG · {name || "SEM NOME"} · {raca.toUpperCase()} · NIV {nivel} · {attunement.toUpperCase()} · {oath.toUpperCase()}
      </div>
    </div>
  );
}
