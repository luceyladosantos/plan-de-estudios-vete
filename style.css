:root{
  --bg: #ffeef4;        /* rosita pastel claro */
  --card: #ffffff;
  --border: #f0dbe4;
  --available: #29a745; /* verde */
  --not-available: #bdbdbd; /* gris */
  --accent: #ff98b6;
  --text: #2d2d2d;
  --muted: #666;
  --shadow: 0 6px 18px rgba(0,0,0,0.06);
  --radius: 12px;
  font-family: Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  background: linear-gradient(180deg, var(--bg), #fff);
  color:var(--text);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  padding:20px;
}

/* Header */
header{
  text-align:left;
  margin-bottom:18px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
header h1{
  margin:0;
  font-size:1.3rem;
  color:#333;
}
header p{margin:0;color:var(--muted)}
.top-controls { display:flex; gap:8px; align-items:center; }

/* Layout */
.container{
  display:flex;
  gap:18px;
  align-items:flex-start;
}

/* Sidebar */
.sidebar{
  width:320px;
  background:rgba(255,255,255,0.92);
  border:1px solid var(--border);
  border-radius:12px;
  padding:12px;
  box-shadow:var(--shadow);
}
.sidebar h3{ margin:0 0 8px }
.muted{ color:var(--muted); font-size:0.9rem }
.small{ font-size:0.85rem }

/* Textarea */
textarea{
  width:100%;
  padding:8px;
  border-radius:8px;
  border:1px solid var(--border);
  font-family:monospace;
  resize:vertical;
}

/* Malla container: columns per year */
.malla{
  display:flex;
  gap:16px;
  align-items:flex-start;
  overflow:auto;
  padding:4px;
  flex:1;
}

/* Each year column */
.year-column{
  min-width:220px;
  background:rgba(255,255,255,0.95);
  border:1px solid var(--border);
  border-radius:12px;
  padding:12px;
  box-shadow:var(--shadow);
}
.year-column h3{
  margin:0 0 8px;
  font-size:1.05rem;
  color:var(--accent);
  text-align:center;
}

/* Subject card */
.subject{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
  padding:10px;
  margin:9px 0;
  border-radius:10px;
  background:linear-gradient(180deg, #fff, #fff);
  border:1px solid var(--border);
  cursor:pointer;
  transition:transform .12s ease, box-shadow .12s ease;
  user-select:none;
}
.subject:hover{ transform:translateY(-4px); box-shadow:0 10px 20px rgba(0,0,0,0.06) }

/* Name and small meta */
.sub-left{
  display:flex;
  flex-direction:column;
}
.sub-name{ font-weight:600; font-size:0.95rem; color:#2b2b2b }
.sub-meta{ font-size:0.78rem; color:var(--muted) }

/* status pill */
.pill{
  padding:6px 8px;
  border-radius:999px;
  font-weight:600;
  font-size:0.78rem;
  color:white;
  min-width:56px;
  text-align:center;
}

/* Colors depending on state - default is not available */
.available{ background:var(--available) }
.not-available{ background:var(--not-available) }
.approved-indicator{ margin-left:8px; color:var(--available); font-weight:700 }

/* Modal */
.modal{
  position:fixed;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(0,0,0,0.35);
  z-index:999;
}
.modal.hidden{ display:none }
.modal-content{
  width: min(520px, 96%);
  background:var(--card);
  border-radius:12px;
  padding:18px;
  box-shadow:var(--shadow);
  position:relative;
}
.close{
  position:absolute;
  top:10px;
  right:10px;
  border:none;
  background:transparent;
  font-size:20px;
  cursor:pointer;
  color:var(--muted);
}
.modal-actions{
  display:flex;
  gap:10px;
  margin-top:12px;
}
.btn{
  padding:10px 12px;
  border-radius:10px;
  border:none;
  cursor:pointer;
  font-weight:600;
  background:var(--accent);
  color:white;
}
.btn.small{ padding:6px 8px; font-size:0.9rem; border-radius:8px }
.btn.secondary{
  background:transparent;
  border:2px solid var(--accent);
  color:var(--accent);
}
.hint{ margin-top:10px; color:var(--muted); font-size:0.9rem }

/* Responsive */
@media (max-width:1000px){
  .container{ flex-direction:column; }
  .sidebar{ width:100% }
  .malla{ flex-direction:column; }
  .year-column{ width:100% }
}
