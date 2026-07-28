/**
 * Shared theme palette — 216 themes.
 * Categories: light, dark, colorful (colored bg), pastel, professional.
 * Synced with interactive_dashboard_generator.js buildThemeLibrary().
 */
(function () {
  'use strict';

  var chart7 = {
    blue:    ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
    green:   ['#059669','#0284c7','#d97706','#7c3aed','#e11d48','#0891b2','#65a30d'],
    purple:  ['#7c3aed','#2563eb','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444'],
    rose:    ['#e11d48','#7c3aed','#2563eb','#10b981','#f59e0b','#06b6d4','#84cc16'],
    amber:   ['#d97706','#059669','#2563eb','#e11d48','#7c3aed','#0891b2','#65a30d'],
    teal:    ['#0d9488','#6366f1','#f43f5e','#eab308','#8b5cf6','#3b82f6','#22c55e'],
    sky:     ['#0284c7','#16a34a','#ea580c','#9333ea','#db2777','#0891b2','#ca8a04'],
    indigo:  ['#4f46e5','#059669','#dc2626','#ca8a04','#db2777','#0891b2','#65a30d'],
    orange:  ['#ea580c','#0284c7','#16a34a','#7c3aed','#e11d48','#0d9488','#ca8a04'],
    cyan:    ['#0891b2','#4f46e5','#dc2626','#d97706','#ec4899','#16a34a','#9333ea'],
    fuchsia: ['#c026d3','#2563eb','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16'],
    slate:   ['#475569','#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'],
    coral:   ['#f97316','#06b6d4','#8b5cf6','#10b981','#e11d48','#3b82f6','#84cc16'],
    lime:    ['#65a30d','#2563eb','#dc2626','#9333ea','#0891b2','#ea580c','#ec4899'],
    wine:    ['#881337','#1d4ed8','#059669','#d97706','#7c3aed','#0891b2','#65a30d'],
    pastelM: ['#60a5fa','#34d399','#fbbf24','#c084fc','#f472b6','#22d3ee','#a3e635'],
    neonM:   ['#22d3ee','#a3e635','#f472b6','#fbbf24','#818cf8','#fb923c','#34d399'],
    warmM:   ['#fb923c','#60a5fa','#34d399','#c084fc','#f472b6','#22d3ee','#a3e635'],
    mono_b:  ['#1e3a8a','#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'],
    mono_g:  ['#064e3b','#047857','#059669','#10b981','#34d399','#6ee7b7','#a7f3d0'],
    sunsetM: ['#dc2626','#ea580c','#f97316','#f59e0b','#eab308','#84cc16','#22c55e'],
    luxuryM: ['#fbbf24','#f472b6','#818cf8','#34d399','#fb923c','#22d3ee','#a3e635'],
    corpM:   ['#1e40af','#047857','#b91c1c','#a16207','#7e22ce','#0e7490','#4d7c0f'],
    execM:   ['#334155','#1d4ed8','#047857','#b91c1c','#7e22ce','#0e7490','#a16207']
  };

  // Helper: lighten a hex color for text
  function lighten(hex, pct) {
    var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    r = Math.min(255, Math.round(r + (255-r)*pct));
    g = Math.min(255, Math.round(g + (255-g)*pct));
    b = Math.min(255, Math.round(b + (255-b)*pct));
    return '#' + [r,g,b].map(function(c){return c.toString(16).padStart(2,'0')}).join('');
  }
  function darken(hex, pct) {
    var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    r = Math.round(r * (1-pct)); g = Math.round(g * (1-pct)); b = Math.round(b * (1-pct));
    return '#' + [r,g,b].map(function(c){return c.toString(16).padStart(2,'0')}).join('');
  }

  var themes = [];

  // ═══════════════════════════════════════════════════════════════
  // LIGHT THEMES (white/near-white bg) — 40
  // ═══════════════════════════════════════════════════════════════
  var lightDefs = [
    ['ocean_blue','Ocean Blue','#2563eb',chart7.blue,'#f8fafc','#e2e8f0'],
    ['emerald','Emerald','#059669',chart7.green,'#f0fdf4','#d1fae5'],
    ['violet','Violet','#7c3aed',chart7.purple,'#faf5ff','#e9d5ff'],
    ['rose','Rose Pink','#e11d48',chart7.rose,'#fff1f2','#fecdd3'],
    ['amber','Amber Gold','#d97706',chart7.amber,'#fffbeb','#fde68a'],
    ['teal','Teal','#0d9488',chart7.teal,'#f0fdfa','#ccfbf1'],
    ['sky','Sky','#0284c7',chart7.sky,'#f0f9ff','#bae6fd'],
    ['indigo','Indigo','#4f46e5',chart7.indigo,'#eef2ff','#c7d2fe'],
    ['lime','Lime','#65a30d',chart7.lime,'#f7fee7','#d9f99d'],
    ['orange','Orange','#ea580c',chart7.orange,'#fff7ed','#fed7aa'],
    ['cyan','Cyan','#0891b2',chart7.cyan,'#ecfeff','#a5f3fc'],
    ['fuchsia','Fuchsia','#c026d3',chart7.fuchsia,'#fdf4ff','#f5d0fe'],
    ['slate','Slate','#475569',chart7.slate,'#f8fafc','#e2e8f0'],
    ['coral','Coral','#f97316',chart7.coral,'#fff7ed','#ffedd5'],
    ['mint','Mint','#14b8a6',chart7.teal,'#f0fdfa','#99f6e4'],
    ['warm_gray','Warm Gray','#78716c',['#78716c','#2563eb','#10b981','#f59e0b','#ec4899','#06b6d4','#7c3aed'],'#fafaf9','#e7e5e4'],
    ['sapphire','Sapphire','#1d4ed8',['#1d4ed8','#059669','#dc2626','#eab308','#a855f7','#06b6d4','#65a30d'],'#eff6ff','#bfdbfe'],
    ['peach','Peach','#fb923c',['#fb923c','#4f46e5','#14b8a6','#e11d48','#8b5cf6','#0284c7','#84cc16'],'#fff7ed','#fed7aa'],
    ['forest','Forest','#166534',['#166534','#1d4ed8','#dc2626','#eab308','#9333ea','#0891b2','#ea580c'],'#f0fdf4','#bbf7d0'],
    ['mauve','Mauve','#a21caf',['#a21caf','#2563eb','#059669','#f59e0b','#ef4444','#0d9488','#84cc16'],'#fdf4ff','#f0abfc'],
    ['steel','Steel','#3b82f6',['#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#14b8a6','#f97316'],'#f1f5f9','#cbd5e1'],
    ['wine','Wine','#881337',chart7.wine,'#fff1f2','#fda4af'],
    ['lemon','Lemon','#ca8a04',['#ca8a04','#2563eb','#e11d48','#059669','#7c3aed','#0891b2','#ea580c'],'#fefce8','#fde047'],
    ['arctic','Arctic','#0ea5e9',['#0ea5e9','#8b5cf6','#f43f5e','#eab308','#22c55e','#f97316','#ec4899'],'#f0f9ff','#bae6fd'],
    ['plum','Plum','#9333ea',['#9333ea','#0284c7','#dc2626','#16a34a','#d97706','#0891b2','#e11d48'],'#faf5ff','#d8b4fe'],
    ['cherry','Cherry','#be123c',['#be123c','#1d4ed8','#047857','#a16207','#7e22ce','#0e7490','#4d7c0f'],'#fff1f2','#fecdd3'],
    ['nordic','Nordic','#64748b',['#64748b','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'],'#f1f5f9','#cbd5e1'],
    ['sunset','Sunset','#f97316',chart7.sunsetM,'#fffbeb','#fde68a'],
    ['mono_blue','Mono Blue','#2563eb',chart7.mono_b,'#f8fafc','#e2e8f0'],
    ['mono_green','Mono Green','#059669',chart7.mono_g,'#f0fdf4','#d1fae5'],
    ['crimson','Crimson','#dc2626',['#dc2626','#2563eb','#059669','#f59e0b','#7c3aed','#0891b2','#84cc16'],'#fef2f2','#fecaca'],
    ['turquoise','Turquoise','#0891b2',['#0891b2','#7c3aed','#f43f5e','#f59e0b','#16a34a','#ea580c','#ec4899'],'#ecfeff','#a5f3fc'],
    ['gold','Gold','#b45309',['#b45309','#1e40af','#047857','#b91c1c','#7e22ce','#0e7490','#4d7c0f'],'#fffbeb','#fde68a'],
    ['jade','Jade','#047857',['#047857','#4f46e5','#dc2626','#eab308','#c026d3','#0284c7','#ea580c'],'#ecfdf5','#a7f3d0'],
    ['magenta','Magenta','#db2777',['#db2777','#2563eb','#059669','#f59e0b','#7c3aed','#06b6d4','#84cc16'],'#fdf2f8','#fbcfe8'],
    ['cobalt','Cobalt','#1d4ed8',['#1d4ed8','#10b981','#f59e0b','#ef4444','#a855f7','#06b6d4','#84cc16'],'#eff6ff','#bfdbfe'],
    ['rust','Rust','#c2410c',['#c2410c','#0284c7','#059669','#7c3aed','#e11d48','#0891b2','#84cc16'],'#fff7ed','#fed7aa'],
    ['olive','Olive','#4d7c0f',['#4d7c0f','#2563eb','#dc2626','#d97706','#7c3aed','#0891b2','#ec4899'],'#f7fee7','#d9f99d'],
    ['periwinkle','Periwinkle','#6366f1',['#6366f1','#10b981','#f59e0b','#e11d48','#06b6d4','#84cc16','#f97316'],'#eef2ff','#c7d2fe'],
    ['clay','Clay','#92400e',['#92400e','#1d4ed8','#047857','#7e22ce','#e11d48','#0891b2','#4d7c0f'],'#fffbeb','#fde68a']
  ];

  lightDefs.forEach(function(d) {
    themes.push({ id:d[0], name:d[1], accent:d[2], chart:d[3], bg:d[4], cardBg:'#ffffff', border:d[5], textPrimary:'#0f172a', textSecondary:'#64748b', textMuted:'#94a3b8', dark:false, category:'light' });
  });

  // ═══════════════════════════════════════════════════════════════
  // DARK THEMES (dark bg) — 40
  // ═══════════════════════════════════════════════════════════════
  var darkDefs = [
    ['dark_navy','Dark Navy','#3b82f6',chart7.blue,'#0f172a','#1e293b','#334155','#f1f5f9','#94a3b8','#64748b'],
    ['dark_emerald','Dark Emerald','#10b981',chart7.green,'#022c22','#064e3b','#065f46','#ecfdf5','#6ee7b7','#34d399'],
    ['dark_purple','Dark Purple','#a855f7',chart7.purple,'#1e1b4b','#312e81','#3730a3','#eef2ff','#a5b4fc','#818cf8'],
    ['dark_rose','Dark Rose','#f43f5e',chart7.rose,'#1c1917','#292524','#44403c','#fafaf9','#d6d3d1','#a8a29e'],
    ['dark_ocean','Dark Ocean','#0ea5e9',['#0ea5e9','#22c55e','#f59e0b','#a855f7','#f43f5e','#14b8a6','#84cc16'],'#0c4a6e','#075985','#0369a1','#f0f9ff','#7dd3fc','#38bdf8'],
    ['dark_carbon','Dark Carbon','#6366f1',['#6366f1','#10b981','#f59e0b','#ec4899','#06b6d4','#ef4444','#84cc16'],'#18181b','#27272a','#3f3f46','#fafafa','#a1a1aa','#71717a'],
    ['dark_midnight','Dark Midnight','#818cf8',chart7.neonM,'#020617','#0f172a','#1e293b','#f8fafc','#94a3b8','#64748b'],
    ['dark_forest','Dark Forest','#22c55e',['#22c55e','#6366f1','#f43f5e','#eab308','#ec4899','#0ea5e9','#f97316'],'#052e16','#14532d','#166534','#f0fdf4','#86efac','#4ade80'],
    ['dark_wine','Dark Wine','#fb7185',chart7.warmM,'#1c1917','#292524','#44403c','#fafaf9','#d6d3d1','#a8a29e'],
    ['dark_slate','Dark Slate','#94a3b8',['#94a3b8','#60a5fa','#34d399','#fbbf24','#f472b6','#22d3ee','#a3e635'],'#0f172a','#1e293b','#334155','#f1f5f9','#cbd5e1','#94a3b8'],
    ['dark_amber','Dark Amber','#f59e0b',['#f59e0b','#3b82f6','#10b981','#a855f7','#f43f5e','#06b6d4','#84cc16'],'#1c1917','#292524','#44403c','#fefce8','#fde68a','#fcd34d'],
    ['dark_teal','Dark Teal','#14b8a6',chart7.teal,'#042f2e','#134e4a','#115e59','#f0fdfa','#5eead4','#2dd4bf'],
    ['dark_cyan','Dark Cyan','#06b6d4',chart7.cyan,'#083344','#164e63','#155e75','#ecfeff','#67e8f9','#22d3ee'],
    ['dark_coral','Dark Coral','#fb923c',chart7.warmM,'#1c1917','#292524','#44403c','#fff7ed','#fdba74','#fb923c'],
    ['dark_indigo','Dark Indigo','#818cf8',['#818cf8','#34d399','#fbbf24','#fb7185','#22d3ee','#fb923c','#a3e635'],'#1e1b4b','#312e81','#3730a3','#eef2ff','#a5b4fc','#818cf8'],
    ['dark_magenta','Dark Magenta','#e879f9',['#e879f9','#60a5fa','#34d399','#fbbf24','#fb7185','#22d3ee','#a3e635'],'#1e1b4b','#312e81','#3730a3','#fdf4ff','#e879f9','#d946ef'],
    ['dark_sunset','Dark Sunset','#f97316',chart7.sunsetM,'#1c1917','#292524','#44403c','#fafaf9','#d6d3d1','#a8a29e'],
    ['neon','Neon','#22d3ee',chart7.neonM,'#020617','#0f172a','#1e293b','#f0f9ff','#7dd3fc','#38bdf8'],
    ['dark_luxury','Dark Luxury','#fbbf24',chart7.luxuryM,'#0f0f0f','#1a1a1a','#2a2a2a','#fafafa','#a1a1aa','#71717a'],
    ['dark_cherry','Dark Cherry','#fb7185',['#fb7185','#93c5fd','#6ee7b7','#fcd34d','#d8b4fe','#67e8f9','#bef264'],'#1c1917','#292524','#44403c','#fafaf9','#d6d3d1','#a8a29e'],
    ['dark_steel','Dark Steel','#60a5fa',chart7.blue,'#111827','#1f2937','#374151','#f9fafb','#9ca3af','#6b7280'],
    ['dark_lime','Dark Lime','#a3e635',chart7.lime,'#1a2e05','#365314','#3f6212','#f7fee7','#bef264','#a3e635'],
    ['dark_fuchsia','Dark Fuchsia','#d946ef',chart7.fuchsia,'#2e1065','#4a044e','#701a75','#fdf4ff','#e879f9','#d946ef'],
    ['dark_gold','Dark Gold','#fbbf24',['#fbbf24','#3b82f6','#10b981','#a855f7','#f43f5e','#06b6d4','#84cc16'],'#1c1917','#292524','#44403c','#fefce8','#fde68a','#fcd34d'],
    ['dark_jade','Dark Jade','#34d399',['#34d399','#818cf8','#fb7185','#fbbf24','#22d3ee','#fb923c','#a3e635'],'#022c22','#064e3b','#065f46','#ecfdf5','#6ee7b7','#34d399'],
    ['dark_copper','Dark Copper','#f97316',chart7.orange,'#27150a','#431407','#7c2d12','#fff7ed','#fdba74','#fb923c'],
    ['dark_sapphire','Dark Sapphire','#3b82f6',['#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#84cc16'],'#0c1e3a','#172554','#1e3a5f','#eff6ff','#93c5fd','#60a5fa'],
    ['dark_plum','Dark Plum','#c084fc',['#c084fc','#60a5fa','#34d399','#fbbf24','#fb7185','#22d3ee','#a3e635'],'#2e1065','#3b0764','#581c87','#faf5ff','#d8b4fe','#c084fc'],
    ['dark_crimson','Dark Crimson','#f87171',['#f87171','#60a5fa','#34d399','#fbbf24','#c084fc','#22d3ee','#a3e635'],'#1c1917','#292524','#44403c','#fef2f2','#fca5a5','#f87171'],
    ['dark_arctic','Dark Arctic','#38bdf8',chart7.sky,'#082f49','#0c4a6e','#075985','#f0f9ff','#7dd3fc','#38bdf8'],
    ['dark_turquoise','Dark Turquoise','#2dd4bf',chart7.teal,'#042f2e','#134e4a','#115e59','#f0fdfa','#5eead4','#2dd4bf'],
    ['dark_peach','Dark Peach','#fdba74',['#fdba74','#60a5fa','#34d399','#c084fc','#f472b6','#22d3ee','#a3e635'],'#27150a','#431407','#7c2d12','#fff7ed','#fdba74','#fb923c'],
    ['dark_moss','Dark Moss','#86efac',chart7.green,'#052e16','#14532d','#166534','#f0fdf4','#86efac','#4ade80'],
    ['dark_mauve','Dark Mauve','#d8b4fe',['#d8b4fe','#93c5fd','#6ee7b7','#fcd34d','#f472b6','#67e8f9','#bef264'],'#2e1065','#3b0764','#581c87','#faf5ff','#d8b4fe','#c084fc'],
    ['dark_charcoal','Dark Charcoal','#9ca3af',chart7.slate,'#111827','#1f2937','#374151','#f9fafb','#d1d5db','#9ca3af'],
    ['dark_graphite','Dark Graphite','#a1a1aa',['#a1a1aa','#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4'],'#18181b','#27272a','#3f3f46','#fafafa','#d4d4d8','#a1a1aa'],
    ['dark_onyx','Dark Onyx','#e2e8f0',['#e2e8f0','#60a5fa','#34d399','#fbbf24','#f472b6','#22d3ee','#a3e635'],'#0a0a0a','#171717','#262626','#fafafa','#d4d4d4','#a3a3a3'],
    ['dark_obsidian','Dark Obsidian','#a78bfa',['#a78bfa','#34d399','#fbbf24','#f472b6','#22d3ee','#fb923c','#a3e635'],'#0c0a1d','#1e1b4b','#312e81','#eef2ff','#c7d2fe','#a5b4fc'],
    ['dark_volcanic','Dark Volcanic','#ef4444',['#ef4444','#60a5fa','#34d399','#fbbf24','#c084fc','#22d3ee','#a3e635'],'#1c0505','#450a0a','#7f1d1d','#fef2f2','#fca5a5','#f87171'],
    ['dark_cosmos','Dark Cosmos','#c084fc',['#c084fc','#f472b6','#60a5fa','#34d399','#fbbf24','#22d3ee','#a3e635'],'#09090b','#18181b','#27272a','#fafafa','#d4d4d8','#a1a1aa']
  ];

  darkDefs.forEach(function(d) {
    themes.push({ id:d[0], name:d[1], accent:d[2], chart:d[3], bg:d[4], cardBg:d[5], border:d[6], textPrimary:d[7], textSecondary:d[8], textMuted:d[9], dark:true, category:'dark' });
  });

  // ═══════════════════════════════════════════════════════════════
  // COLORFUL BG THEMES — 60 (colored backgrounds!)
  // ═══════════════════════════════════════════════════════════════
  var colorfulDefs = [
    // Blues
    ['bg_royal_blue','Royal Blue','#1d4ed8',chart7.blue,'#1e3a5f','#1e40af','#1d4ed8','#dbeafe','#93c5fd','#60a5fa'],
    ['bg_ocean_deep','Ocean Deep','#0284c7',chart7.sky,'#0c4a6e','#075985','#0369a1','#e0f2fe','#7dd3fc','#38bdf8'],
    ['bg_cobalt','Cobalt','#2563eb',chart7.blue,'#172554','#1e3a8a','#1e40af','#dbeafe','#93c5fd','#60a5fa'],
    ['bg_navy','Navy','#3b82f6',chart7.blue,'#0f1b3d','#172554','#1e3a8a','#dbeafe','#bfdbfe','#93c5fd'],
    ['bg_cornflower','Cornflower','#6366f1',chart7.indigo,'#2e1065','#3730a3','#4338ca','#e0e7ff','#a5b4fc','#818cf8'],
    // Greens
    ['bg_emerald_rich','Emerald Rich','#10b981',chart7.green,'#064e3b','#065f46','#047857','#d1fae5','#6ee7b7','#34d399'],
    ['bg_forest_deep','Forest Deep','#059669',chart7.green,'#022c22','#064e3b','#065f46','#d1fae5','#6ee7b7','#34d399'],
    ['bg_pine','Pine','#16a34a',['#16a34a','#2563eb','#f59e0b','#7c3aed','#e11d48','#06b6d4','#ea580c'],'#14532d','#166534','#15803d','#bbf7d0','#86efac','#4ade80'],
    ['bg_sage','Sage','#22c55e',['#22c55e','#6366f1','#f43f5e','#eab308','#ec4899','#0ea5e9','#f97316'],'#052e16','#14532d','#166534','#dcfce7','#86efac','#4ade80'],
    ['bg_teal_deep','Teal Deep','#0d9488',chart7.teal,'#042f2e','#134e4a','#115e59','#ccfbf1','#5eead4','#2dd4bf'],
    // Purples
    ['bg_purple_royal','Purple Royal','#8b5cf6',chart7.purple,'#2e1065','#3b0764','#581c87','#ede9fe','#c4b5fd','#a78bfa'],
    ['bg_plum_rich','Plum Rich','#a855f7',chart7.purple,'#3b0764','#581c87','#6b21a8','#f3e8ff','#d8b4fe','#c084fc'],
    ['bg_grape','Grape','#7c3aed',chart7.purple,'#1e1b4b','#312e81','#3730a3','#ede9fe','#c4b5fd','#a78bfa'],
    ['bg_lavender_deep','Lavender Deep','#8b5cf6',['#8b5cf6','#22c55e','#f59e0b','#e11d48','#06b6d4','#f97316','#84cc16'],'#2e1065','#4c1d95','#5b21b6','#ede9fe','#c4b5fd','#a78bfa'],
    ['bg_violet_rich','Violet Rich','#7c3aed',['#7c3aed','#10b981','#f59e0b','#e11d48','#0284c7','#84cc16','#f97316'],'#1e1b4b','#2e1065','#3b0764','#ede9fe','#ddd6fe','#c4b5fd'],
    // Reds/Pinks
    ['bg_burgundy','Burgundy','#f43f5e',chart7.rose,'#4c0519','#881337','#9f1239','#ffe4e6','#fda4af','#fb7185'],
    ['bg_crimson_deep','Crimson Deep','#ef4444',['#ef4444','#60a5fa','#34d399','#fbbf24','#a855f7','#06b6d4','#84cc16'],'#450a0a','#7f1d1d','#991b1b','#fee2e2','#fca5a5','#f87171'],
    ['bg_rose_dark','Rose Dark','#fb7185',chart7.rose,'#4c0519','#881337','#9f1239','#fff1f2','#fecdd3','#fda4af'],
    ['bg_magenta_rich','Magenta Rich','#ec4899',['#ec4899','#3b82f6','#10b981','#f59e0b','#7c3aed','#06b6d4','#84cc16'],'#500724','#831843','#9d174d','#fce7f3','#f9a8d4','#f472b6'],
    ['bg_fuschia_deep','Fuchsia Deep','#d946ef',chart7.fuchsia,'#4a044e','#701a75','#86198f','#fae8ff','#e879f9','#d946ef'],
    // Oranges/Ambers
    ['bg_rust','Rust','#f97316',chart7.orange,'#431407','#7c2d12','#9a3412','#ffedd5','#fdba74','#fb923c'],
    ['bg_amber_rich','Amber Rich','#f59e0b',chart7.amber,'#451a03','#78350f','#92400e','#fef3c7','#fde68a','#fcd34d'],
    ['bg_bronze','Bronze','#d97706',chart7.amber,'#78350f','#92400e','#a16207','#fef3c7','#fde68a','#fcd34d'],
    ['bg_terracotta','Terracotta','#ea580c',chart7.orange,'#431407','#7c2d12','#9a3412','#fff7ed','#fdba74','#fb923c'],
    ['bg_copper','Copper','#c2410c',['#c2410c','#0284c7','#059669','#7c3aed','#e11d48','#0891b2','#84cc16'],'#7c2d12','#9a3412','#c2410c','#ffedd5','#fdba74','#fb923c'],
    // Cyans/Teals
    ['bg_petrol','Petrol','#06b6d4',chart7.cyan,'#083344','#164e63','#155e75','#cffafe','#67e8f9','#22d3ee'],
    ['bg_aqua','Aqua','#22d3ee',['#22d3ee','#a855f7','#f43f5e','#f59e0b','#22c55e','#f97316','#ec4899'],'#083344','#164e63','#155e75','#cffafe','#67e8f9','#22d3ee'],
    ['bg_turquoise_deep','Turquoise Deep','#14b8a6',chart7.teal,'#042f2e','#134e4a','#115e59','#ccfbf1','#5eead4','#2dd4bf'],
    ['bg_cerulean','Cerulean','#0ea5e9',chart7.sky,'#082f49','#0c4a6e','#075985','#e0f2fe','#7dd3fc','#38bdf8'],
    ['bg_marine','Marine','#0284c7',chart7.sky,'#0c4a6e','#075985','#0369a1','#e0f2fe','#bae6fd','#7dd3fc'],
    // Warm tones
    ['bg_chocolate','Chocolate','#d97706',chart7.amber,'#27150a','#431407','#78350f','#fef3c7','#fde68a','#fcd34d'],
    ['bg_coffee','Coffee','#92400e',['#92400e','#2563eb','#059669','#7c3aed','#e11d48','#0891b2','#84cc16'],'#27150a','#431407','#78350f','#fef3c7','#fde68a','#fcd34d'],
    ['bg_mahogany','Mahogany','#b91c1c',['#b91c1c','#2563eb','#059669','#d97706','#7c3aed','#0891b2','#84cc16'],'#450a0a','#7f1d1d','#991b1b','#fee2e2','#fca5a5','#f87171'],
    ['bg_wine_deep','Wine Deep','#9f1239',chart7.wine,'#4c0519','#881337','#9f1239','#ffe4e6','#fda4af','#fb7185'],
    ['bg_sienna','Sienna','#b45309',['#b45309','#1d4ed8','#047857','#7c3aed','#e11d48','#0891b2','#4d7c0f'],'#451a03','#78350f','#92400e','#fef3c7','#fde68a','#fcd34d'],
    // Cool/Misc
    ['bg_midnight_blue','Midnight Blue','#60a5fa',chart7.blue,'#0f172a','#172554','#1e3a8a','#dbeafe','#93c5fd','#60a5fa'],
    ['bg_electric','Electric','#a78bfa',chart7.neonM,'#0c0a1d','#1e1b4b','#312e81','#ede9fe','#c4b5fd','#a78bfa'],
    ['bg_storm','Storm','#94a3b8',chart7.slate,'#0f172a','#1e293b','#334155','#f1f5f9','#cbd5e1','#94a3b8'],
    ['bg_steel_blue','Steel Blue','#60a5fa',['#60a5fa','#34d399','#fbbf24','#f472b6','#22d3ee','#fb923c','#a3e635'],'#172554','#1e3a8a','#1e40af','#dbeafe','#93c5fd','#60a5fa'],
    ['bg_deep_sea','Deep Sea','#0891b2',chart7.cyan,'#083344','#164e63','#155e75','#cffafe','#a5f3fc','#67e8f9'],
    // Olive/Earth
    ['bg_olive_dark','Olive Dark','#65a30d',chart7.lime,'#1a2e05','#365314','#3f6212','#ecfccb','#bef264','#a3e635'],
    ['bg_moss','Moss','#4d7c0f',['#4d7c0f','#2563eb','#dc2626','#d97706','#7c3aed','#0891b2','#ec4899'],'#1a2e05','#365314','#3f6212','#ecfccb','#d9f99d','#bef264'],
    ['bg_earth','Earth','#78716c',['#78716c','#2563eb','#10b981','#f59e0b','#ec4899','#06b6d4','#7c3aed'],'#1c1917','#292524','#44403c','#f5f5f4','#d6d3d1','#a8a29e'],
    ['bg_clay_warm','Clay Warm','#a16207',chart7.amber,'#451a03','#78350f','#92400e','#fef3c7','#fde68a','#fcd34d'],
    ['bg_sandstone','Sandstone','#d97706',['#d97706','#1d4ed8','#047857','#b91c1c','#7c3aed','#0891b2','#4d7c0f'],'#78350f','#92400e','#a16207','#fef3c7','#fde68a','#fcd34d'],
    // Special
    ['bg_aurora','Aurora','#22d3ee',['#22d3ee','#a3e635','#f472b6','#818cf8','#fbbf24','#fb923c','#34d399'],'#042f2e','#134e4a','#115e59','#ccfbf1','#5eead4','#2dd4bf'],
    ['bg_nebula','Nebula','#c084fc',['#c084fc','#f472b6','#60a5fa','#34d399','#fbbf24','#22d3ee','#a3e635'],'#1e1b4b','#312e81','#3730a3','#ede9fe','#c4b5fd','#a78bfa'],
    ['bg_galaxy','Galaxy','#818cf8',['#818cf8','#34d399','#fbbf24','#fb7185','#22d3ee','#fb923c','#a3e635'],'#0c0a1d','#1e1b4b','#312e81','#eef2ff','#c7d2fe','#a5b4fc'],
    ['bg_inferno','Inferno','#ef4444',['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#14b8a6'],'#1c0505','#450a0a','#7f1d1d','#fee2e2','#fca5a5','#f87171'],
    ['bg_arctic_ice','Arctic Ice','#38bdf8',chart7.sky,'#082f49','#0c4a6e','#075985','#e0f2fe','#bae6fd','#7dd3fc'],
    ['bg_volcano','Volcano','#fb923c',['#fb923c','#ef4444','#f59e0b','#84cc16','#06b6d4','#a855f7','#ec4899'],'#27150a','#431407','#7c2d12','#fff7ed','#fdba74','#fb923c'],
    ['bg_lagoon','Lagoon','#2dd4bf',['#2dd4bf','#818cf8','#fb7185','#fbbf24','#60a5fa','#fb923c','#a3e635'],'#042f2e','#134e4a','#115e59','#ccfbf1','#99f6e4','#5eead4'],
    ['bg_coral_reef','Coral Reef','#f97316',['#f97316','#0ea5e9','#22c55e','#a855f7','#ec4899','#14b8a6','#84cc16'],'#431407','#7c2d12','#9a3412','#ffedd5','#fdba74','#fb923c'],
    ['bg_twilight','Twilight','#a78bfa',['#a78bfa','#f472b6','#60a5fa','#34d399','#fbbf24','#22d3ee','#fb923c'],'#1e1b4b','#312e81','#3730a3','#ede9fe','#ddd6fe','#c4b5fd'],
    ['bg_dusk','Dusk','#f472b6',['#f472b6','#818cf8','#34d399','#fbbf24','#22d3ee','#fb923c','#a3e635'],'#500724','#831843','#9d174d','#fce7f3','#f9a8d4','#f472b6'],
    ['bg_orchid','Orchid','#d946ef',['#d946ef','#60a5fa','#34d399','#fbbf24','#fb7185','#22d3ee','#a3e635'],'#4a044e','#701a75','#86198f','#fae8ff','#f0abfc','#e879f9'],
    ['bg_sunrise','Sunrise','#fb923c',chart7.sunsetM,'#431407','#7c2d12','#9a3412','#fff7ed','#fdba74','#fb923c'],
    ['bg_rainforest','Rainforest','#059669',['#059669','#0284c7','#d97706','#7c3aed','#e11d48','#0891b2','#84cc16'],'#022c22','#064e3b','#065f46','#d1fae5','#6ee7b7','#34d399'],
    ['bg_amethyst','Amethyst','#a855f7',['#a855f7','#22c55e','#f59e0b','#ef4444','#06b6d4','#84cc16','#f97316'],'#2e1065','#3b0764','#581c87','#f3e8ff','#d8b4fe','#c084fc']
  ];

  colorfulDefs.forEach(function(d) {
    themes.push({ id:d[0], name:d[1], accent:d[2], chart:d[3], bg:d[4], cardBg:d[5], border:d[6], textPrimary:d[7], textSecondary:d[8], textMuted:d[9], dark:true, category:'colorful' });
  });

  // ═══════════════════════════════════════════════════════════════
  // PASTEL THEMES — 40 (soft tinted backgrounds)
  // ═══════════════════════════════════════════════════════════════
  var pastelDefs = [
    ['pastel_blue','Pastel Blue','#3b82f6',chart7.pastelM,'#eff6ff','#bfdbfe','#1e3a5f'],
    ['pastel_green','Pastel Green','#22c55e',['#4ade80','#60a5fa','#fbbf24','#c084fc','#f472b6','#22d3ee','#fb923c'],'#f0fdf4','#bbf7d0','#052e16'],
    ['pastel_rose','Pastel Rose','#f43f5e',['#fb7185','#60a5fa','#34d399','#fbbf24','#c084fc','#22d3ee','#a3e635'],'#fff1f2','#fecdd3','#1c1917'],
    ['pastel_purple','Pastel Purple','#a855f7',['#c084fc','#60a5fa','#34d399','#fbbf24','#f472b6','#22d3ee','#a3e635'],'#faf5ff','#e9d5ff','#1e1b4b'],
    ['pastel_amber','Pastel Amber','#f59e0b',['#fbbf24','#60a5fa','#34d399','#c084fc','#f472b6','#22d3ee','#a3e635'],'#fffbeb','#fde68a','#1c1917'],
    ['pastel_teal','Pastel Teal','#14b8a6',['#2dd4bf','#818cf8','#f472b6','#fbbf24','#60a5fa','#fb923c','#a3e635'],'#f0fdfa','#99f6e4','#134e4a'],
    ['pastel_sky','Pastel Sky','#0ea5e9',['#38bdf8','#a3e635','#f472b6','#fbbf24','#818cf8','#fb923c','#34d399'],'#f0f9ff','#bae6fd','#0c4a6e'],
    ['pastel_indigo','Pastel Indigo','#6366f1',['#818cf8','#34d399','#fbbf24','#f472b6','#22d3ee','#fb923c','#a3e635'],'#eef2ff','#c7d2fe','#1e1b4b'],
    ['pastel_orange','Pastel Orange','#f97316',['#fb923c','#60a5fa','#34d399','#c084fc','#f472b6','#22d3ee','#a3e635'],'#fff7ed','#fed7aa','#1c1917'],
    ['pastel_lime','Pastel Lime','#84cc16',['#a3e635','#60a5fa','#f472b6','#fbbf24','#818cf8','#22d3ee','#fb923c'],'#f7fee7','#d9f99d','#1a2e05'],
    ['pastel_fuchsia','Pastel Fuchsia','#d946ef',['#e879f9','#60a5fa','#34d399','#fbbf24','#fb7185','#22d3ee','#a3e635'],'#fdf4ff','#f5d0fe','#1e1b4b'],
    ['pastel_coral','Pastel Coral','#fb923c',['#fdba74','#93c5fd','#6ee7b7','#fcd34d','#d8b4fe','#67e8f9','#bef264'],'#fff7ed','#ffedd5','#1c1917'],
    ['pastel_mint','Pastel Mint','#34d399',['#6ee7b7','#93c5fd','#fcd34d','#d8b4fe','#f9a8d4','#67e8f9','#bef264'],'#ecfdf5','#a7f3d0','#052e16'],
    ['pastel_lavender','Pastel Lavender','#a78bfa',['#c4b5fd','#93c5fd','#6ee7b7','#fcd34d','#f9a8d4','#67e8f9','#bef264'],'#f5f3ff','#ddd6fe','#1e1b4b'],
    ['pastel_peach','Pastel Peach','#fb923c',['#fdba74','#93c5fd','#86efac','#fcd34d','#d8b4fe','#67e8f9','#bef264'],'#fff7ed','#ffedd5','#431407'],
    ['pastel_cyan','Pastel Cyan','#22d3ee',['#67e8f9','#c084fc','#f472b6','#fbbf24','#a3e635','#fb923c','#818cf8'],'#ecfeff','#a5f3fc','#164e63'],
    ['pastel_cherry','Pastel Cherry','#fb7185',['#fda4af','#93c5fd','#86efac','#fcd34d','#d8b4fe','#67e8f9','#bef264'],'#fff1f2','#fecdd3','#4c0519'],
    ['pastel_gold','Pastel Gold','#fbbf24',['#fde68a','#93c5fd','#86efac','#d8b4fe','#f9a8d4','#67e8f9','#bef264'],'#fefce8','#fef08a','#422006'],
    ['pastel_sage','Pastel Sage','#4ade80',['#86efac','#93c5fd','#fcd34d','#d8b4fe','#f9a8d4','#67e8f9','#fdba74'],'#f0fdf4','#bbf7d0','#14532d'],
    ['pastel_blush','Pastel Blush','#f472b6',['#f9a8d4','#93c5fd','#86efac','#fcd34d','#c4b5fd','#67e8f9','#bef264'],'#fdf2f8','#fce7f3','#831843'],
    ['pastel_aqua','Pastel Aqua','#2dd4bf',['#5eead4','#93c5fd','#f472b6','#fcd34d','#c4b5fd','#fb923c','#a3e635'],'#f0fdfa','#99f6e4','#134e4a'],
    ['pastel_violet','Pastel Violet','#8b5cf6',['#a78bfa','#60a5fa','#34d399','#fbbf24','#f472b6','#22d3ee','#fb923c'],'#f5f3ff','#ede9fe','#3b0764'],
    ['pastel_steel','Pastel Steel','#94a3b8',['#cbd5e1','#93c5fd','#86efac','#fcd34d','#d8b4fe','#67e8f9','#fdba74'],'#f1f5f9','#e2e8f0','#0f172a'],
    ['pastel_honey','Pastel Honey','#f59e0b',['#fcd34d','#93c5fd','#86efac','#d8b4fe','#f9a8d4','#67e8f9','#bef264'],'#fffbeb','#fef3c7','#78350f'],
    ['pastel_ice','Pastel Ice','#38bdf8',['#7dd3fc','#c084fc','#f472b6','#fbbf24','#34d399','#fb923c','#a3e635'],'#f0f9ff','#e0f2fe','#0c4a6e'],
    ['pastel_moss','Pastel Moss','#4ade80',['#86efac','#60a5fa','#fbbf24','#c084fc','#f472b6','#22d3ee','#fb923c'],'#f0fdf4','#dcfce7','#166534'],
    ['pastel_sunset','Pastel Sunset','#fb923c',['#fdba74','#fca5a5','#fcd34d','#86efac','#93c5fd','#d8b4fe','#f9a8d4'],'#fff7ed','#ffedd5','#7c2d12'],
    ['pastel_berry','Pastel Berry','#c084fc',['#d8b4fe','#f9a8d4','#93c5fd','#86efac','#fcd34d','#67e8f9','#bef264'],'#faf5ff','#f3e8ff','#581c87'],
    ['pastel_cream','Pastel Cream','#d97706',['#fde68a','#93c5fd','#86efac','#d8b4fe','#f9a8d4','#67e8f9','#fdba74'],'#fffbeb','#fef3c7','#1c1917'],
    ['pastel_dew','Pastel Dew','#34d399',['#6ee7b7','#60a5fa','#f472b6','#fbbf24','#c084fc','#22d3ee','#fb923c'],'#ecfdf5','#d1fae5','#064e3b'],
    ['pastel_dawn','Pastel Dawn','#f472b6',['#f9a8d4','#fcd34d','#93c5fd','#86efac','#c4b5fd','#67e8f9','#bef264'],'#fdf2f8','#fce7f3','#500724'],
    ['pastel_frost','Pastel Frost','#60a5fa',['#93c5fd','#86efac','#fcd34d','#d8b4fe','#f9a8d4','#67e8f9','#bef264'],'#eff6ff','#dbeafe','#1e3a5f'],
    ['pastel_cloud','Pastel Cloud','#94a3b8',['#cbd5e1','#60a5fa','#34d399','#fbbf24','#c084fc','#f472b6','#22d3ee'],'#f8fafc','#f1f5f9','#0f172a'],
    ['pastel_melon','Pastel Melon','#f87171',['#fca5a5','#93c5fd','#86efac','#fcd34d','#d8b4fe','#67e8f9','#bef264'],'#fef2f2','#fee2e2','#7f1d1d'],
    ['pastel_tulip','Pastel Tulip','#e879f9',['#f0abfc','#93c5fd','#86efac','#fcd34d','#fca5a5','#67e8f9','#bef264'],'#fdf4ff','#fae8ff','#701a75'],
    ['pastel_breeze','Pastel Breeze','#22d3ee',['#67e8f9','#86efac','#f472b6','#fcd34d','#c4b5fd','#fb923c','#a3e635'],'#ecfeff','#cffafe','#155e75'],
    ['pastel_lilac','Pastel Lilac','#c084fc',['#d8b4fe','#93c5fd','#86efac','#fcd34d','#f472b6','#67e8f9','#fdba74'],'#faf5ff','#f3e8ff','#3b0764'],
    ['pastel_wheat','Pastel Wheat','#d97706',['#fcd34d','#93c5fd','#86efac','#c4b5fd','#f9a8d4','#67e8f9','#bef264'],'#fffbeb','#fef3c7','#451a03'],
    ['pastel_petal','Pastel Petal','#f472b6',['#f9a8d4','#67e8f9','#86efac','#fcd34d','#93c5fd','#c4b5fd','#bef264'],'#fdf2f8','#fce7f3','#9d174d'],
    ['pastel_marine','Pastel Marine','#0ea5e9',['#7dd3fc','#86efac','#f472b6','#fcd34d','#c4b5fd','#fb923c','#a3e635'],'#f0f9ff','#e0f2fe','#075985']
  ];

  pastelDefs.forEach(function(d) {
    themes.push({ id:d[0], name:d[1], accent:d[2], chart:d[3], bg:d[4], cardBg:'#ffffff', border:d[5], textPrimary:d[6], textSecondary:'#6b7280', textMuted:'#9ca3af', dark:false, category:'pastel' });
  });

  // ═══════════════════════════════════════════════════════════════
  // PROFESSIONAL THEMES — 36 (corporate/executive tones)
  // ═══════════════════════════════════════════════════════════════
  var proDefs = [
    ['corporate','Corporate','#1e40af',chart7.corpM,'#f8fafc','#e2e8f0','#0f172a'],
    ['executive','Executive','#334155',chart7.execM,'#f1f5f9','#cbd5e1','#0f172a'],
    ['warm_pro','Warm Pro','#b45309',['#b45309','#1e40af','#047857','#b91c1c','#7e22ce','#0e7490','#4d7c0f'],'#fffbeb','#fde68a','#1c1917'],
    ['cool_gray','Cool Gray','#4b5563',['#4b5563','#2563eb','#059669','#dc2626','#9333ea','#0891b2','#ca8a04'],'#f9fafb','#e5e7eb','#111827'],
    ['paper','Paper','#1e293b',['#1e293b','#2563eb','#059669','#dc2626','#7c3aed','#0891b2','#d97706'],'#fafaf9','#d6d3d1','#1c1917'],
    ['boardroom','Boardroom','#0f172a',['#0f172a','#1d4ed8','#047857','#b91c1c','#7e22ce','#0e7490','#a16207'],'#f8fafc','#e2e8f0','#0f172a'],
    ['consultant','Consultant','#1e3a5f',['#1e3a5f','#047857','#b91c1c','#a16207','#7e22ce','#0e7490','#4d7c0f'],'#f1f5f9','#cbd5e1','#0f172a'],
    ['architect','Architect','#374151',['#374151','#2563eb','#10b981','#f59e0b','#a855f7','#06b6d4','#ef4444'],'#f9fafb','#e5e7eb','#111827'],
    ['diplomat','Diplomat','#1e40af',['#1e40af','#059669','#b91c1c','#d97706','#7e22ce','#0e7490','#4d7c0f'],'#eff6ff','#bfdbfe','#0f172a'],
    ['banker','Banker','#064e3b',['#064e3b','#1e40af','#b91c1c','#a16207','#7e22ce','#0e7490','#4d7c0f'],'#ecfdf5','#d1fae5','#052e16'],
    ['venture','Venture','#7e22ce',['#7e22ce','#1e40af','#047857','#b91c1c','#a16207','#0e7490','#4d7c0f'],'#faf5ff','#ede9fe','#1e1b4b'],
    ['strategist','Strategist','#0e7490',['#0e7490','#1e40af','#047857','#b91c1c','#7e22ce','#a16207','#4d7c0f'],'#ecfeff','#a5f3fc','#164e63'],
    ['analyst','Analyst','#475569',['#475569','#1d4ed8','#059669','#dc2626','#7c3aed','#0284c7','#ca8a04'],'#f8fafc','#e2e8f0','#0f172a'],
    ['fintech','Fintech','#2563eb',['#2563eb','#059669','#f59e0b','#ef4444','#7c3aed','#06b6d4','#84cc16'],'#f8fafc','#e2e8f0','#0f172a'],
    ['medtech','Medtech','#0891b2',['#0891b2','#059669','#2563eb','#f59e0b','#ec4899','#84cc16','#7c3aed'],'#ecfeff','#a5f3fc','#164e63'],
    ['lawfirm','Law Firm','#1e293b',['#1e293b','#7c3aed','#047857','#b91c1c','#a16207','#0e7490','#4d7c0f'],'#f8fafc','#e2e8f0','#0f172a'],
    ['premium','Premium','#92400e',['#92400e','#1e40af','#047857','#7e22ce','#b91c1c','#0e7490','#4d7c0f'],'#fffbeb','#fde68a','#1c1917'],
    ['govtech','GovTech','#1e40af',['#1e40af','#047857','#a16207','#b91c1c','#7e22ce','#0e7490','#4d7c0f'],'#f1f5f9','#cbd5e1','#0f172a'],
    ['healthcare','Healthcare','#0891b2',['#0891b2','#16a34a','#2563eb','#ea580c','#7c3aed','#e11d48','#84cc16'],'#f0fdfa','#ccfbf1','#134e4a'],
    ['logistics','Logistics','#ea580c',['#ea580c','#1e40af','#047857','#7e22ce','#b91c1c','#0e7490','#ca8a04'],'#fff7ed','#fed7aa','#1c1917'],
    ['agritech','AgriTech','#166534',['#166534','#1d4ed8','#d97706','#b91c1c','#7e22ce','#0891b2','#ea580c'],'#f0fdf4','#bbf7d0','#052e16'],
    ['edtech','EdTech','#4f46e5',['#4f46e5','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16'],'#eef2ff','#c7d2fe','#1e1b4b'],
    ['retail','Retail','#dc2626',['#dc2626','#2563eb','#059669','#f59e0b','#7c3aed','#06b6d4','#84cc16'],'#fef2f2','#fecaca','#1c1917'],
    ['energy','Energy','#d97706',['#d97706','#1e40af','#047857','#b91c1c','#7e22ce','#0e7490','#4d7c0f'],'#fffbeb','#fde68a','#1c1917'],
    ['realestate','Real Estate','#0f766e',['#0f766e','#1e40af','#b91c1c','#a16207','#7e22ce','#ea580c','#4d7c0f'],'#f0fdfa','#ccfbf1','#134e4a'],
    ['media','Media','#c026d3',['#c026d3','#2563eb','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16'],'#fdf4ff','#f5d0fe','#1e1b4b'],
    ['telecom','Telecom','#0284c7',['#0284c7','#059669','#ea580c','#7c3aed','#e11d48','#d97706','#84cc16'],'#f0f9ff','#bae6fd','#0c4a6e'],
    ['insurance','Insurance','#1d4ed8',['#1d4ed8','#047857','#b91c1c','#a16207','#7e22ce','#0e7490','#ea580c'],'#eff6ff','#bfdbfe','#0f172a'],
    ['pharma','Pharma','#0891b2',['#0891b2','#059669','#7c3aed','#e11d48','#d97706','#2563eb','#84cc16'],'#ecfeff','#a5f3fc','#164e63'],
    ['mining','Mining','#78716c',['#78716c','#d97706','#1d4ed8','#047857','#b91c1c','#0891b2','#4d7c0f'],'#fafaf9','#e7e5e4','#1c1917'],
    ['aviation','Aviation','#0c4a6e',['#0c4a6e','#059669','#d97706','#b91c1c','#7e22ce','#ea580c','#4d7c0f'],'#f0f9ff','#bae6fd','#0c4a6e'],
    ['automotive','Automotive','#1e293b',['#1e293b','#ef4444','#3b82f6','#f59e0b','#10b981','#06b6d4','#7c3aed'],'#f1f5f9','#cbd5e1','#0f172a'],
    ['construction','Construction','#92400e',['#92400e','#1e40af','#047857','#7e22ce','#b91c1c','#0e7490','#ea580c'],'#fffbeb','#fef3c7','#1c1917'],
    ['hospitality','Hospitality','#b45309',['#b45309','#047857','#1e40af','#7e22ce','#b91c1c','#0e7490','#4d7c0f'],'#fffbeb','#fde68a','#451a03'],
    ['fashion','Fashion','#ec4899',['#ec4899','#2563eb','#10b981','#f59e0b','#7c3aed','#06b6d4','#84cc16'],'#fdf2f8','#fce7f3','#831843'],
    ['startup','Startup','#8b5cf6',['#8b5cf6','#2563eb','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16'],'#faf5ff','#ede9fe','#3b0764']
  ];

  proDefs.forEach(function(d) {
    themes.push({ id:d[0], name:d[1], accent:d[2], chart:d[3], bg:d[4], cardBg:'#ffffff', border:d[5], textPrimary:d[6], textSecondary:'#64748b', textMuted:'#94a3b8', dark:false, category:'pro' });
  });

  window.iDashThemes = themes;
})();
