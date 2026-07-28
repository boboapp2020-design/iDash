/**
 * iDash HTML Infographic Renderer
 * Takes a dashboardSpec + meta from the pipeline and generates a complete,
 * self-contained HTML infographic page.  Each domain gets a distinct visual
 * skin (palette, layout, icons).  Output works both in-browser (iframe) and
 * as a standalone .html download.
 *
 * Charts are inline SVG — no external JS dependencies.
 * Follows dataviz rules: thin marks, selective labels, no dual axes,
 * categorical hues in fixed order, text never wears data color.
 */
(function () {
  'use strict';

  // ── Number formatting ───────────────────────────────────────────────
  function fmt(v, format) {
    if (v == null || isNaN(v)) return '—';
    var abs = Math.abs(v);
    var prefix = (format && format.kind === 'currency') ? '฿' : '';
    var suffix = (format && format.kind === 'percentage') ? '%' : '';
    if (suffix === '%') {
      return prefix + v.toFixed(1) + suffix;
    }
    if (abs >= 1e9) return prefix + (v / 1e9).toFixed(2) + 'B' + suffix;
    if (abs >= 1e6) return prefix + (v / 1e6).toFixed(2) + 'M' + suffix;
    if (abs >= 1e4) return prefix + (v / 1e3).toFixed(1) + 'K' + suffix;
    if (abs >= 1e3) return prefix + Math.round(v).toLocaleString() + suffix;
    if (Number.isInteger(v)) return prefix + v.toLocaleString() + suffix;
    return prefix + v.toFixed(2) + suffix;
  }

  function pct(v) {
    if (v == null || isNaN(v)) return '—';
    return (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Domain Skins ────────────────────────────────────────────────────
  var SKINS = {
    sales_crm: {
      name: 'Sales & CRM',
      dark: true,
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      headerBg: '#1e293b',
      cardBg: '#1e293b',
      cardBorder: '1px solid rgba(148,163,184,0.12)',
      cardShadow: '0 4px 24px rgba(0,0,0,0.3)',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#3b82f6',
      accentLight: 'rgba(59,130,246,0.15)',
      upColor: '#22c55e',
      downColor: '#ef4444',
      gridLine: 'rgba(148,163,184,0.08)',
      chartColors: ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#6366f1'],
      icon: '📊',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 5-7"/></svg>'
    },
    finance_accounting: {
      name: 'Finance & Accounting',
      dark: false,
      bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      headerBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '1px solid #e2e8f0',
      cardShadow: '0 1px 8px rgba(0,0,0,0.06)',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      accent: '#059669',
      accentLight: 'rgba(5,150,105,0.1)',
      upColor: '#16a34a',
      downColor: '#dc2626',
      gridLine: 'rgba(0,0,0,0.06)',
      chartColors: ['#059669','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#ef4444'],
      icon: '💰',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>'
    },
    manufacturing: {
      name: 'Manufacturing',
      dark: true,
      bg: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)',
      headerBg: '#1e293b',
      cardBg: '#1e293b',
      cardBorder: '1px solid rgba(148,163,184,0.12)',
      cardShadow: '0 4px 24px rgba(0,0,0,0.3)',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#6366f1',
      accentLight: 'rgba(99,102,241,0.15)',
      upColor: '#22c55e',
      downColor: '#ef4444',
      gridLine: 'rgba(148,163,184,0.08)',
      chartColors: ['#6366f1','#22c55e','#f59e0b','#3b82f6','#ec4899','#06b6d4','#f97316','#8b5cf6'],
      icon: '🏭',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20M5 20V8l5 4V8l5 4V4l4 4v12"/></svg>'
    },
    sugar_factory: {
      name: 'Sugar Factory',
      dark: true,
      bg: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
      headerBg: '#161b22',
      cardBg: '#1c2128',
      cardBorder: '1px solid rgba(48,54,61,0.8)',
      cardShadow: '0 4px 24px rgba(0,0,0,0.4)',
      textPrimary: '#e6edf3',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      accent: '#2ea043',
      accentLight: 'rgba(46,160,67,0.15)',
      upColor: '#3fb950',
      downColor: '#f85149',
      gridLine: 'rgba(110,118,129,0.1)',
      chartColors: ['#2ea043','#58a6ff','#d29922','#bc8cff','#f778ba','#39d2c0','#f0883e','#7ee787'],
      icon: '🏭',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20M5 20V8l5 4V8l5 4V4l4 4v12"/></svg>'
    },
    inventory_warehouse: {
      name: 'Inventory & Warehouse',
      dark: false,
      bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      headerBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '1px solid #e9d5ff',
      cardShadow: '0 1px 8px rgba(147,51,234,0.08)',
      textPrimary: '#1e1b4b',
      textSecondary: '#6b21a8',
      textMuted: '#a78bfa',
      accent: '#7c3aed',
      accentLight: 'rgba(124,58,237,0.1)',
      upColor: '#16a34a',
      downColor: '#dc2626',
      gridLine: 'rgba(0,0,0,0.06)',
      chartColors: ['#7c3aed','#06b6d4','#f59e0b','#22c55e','#ec4899','#3b82f6','#f97316','#6366f1'],
      icon: '📦',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>'
    },
    hr_people: {
      name: 'HR & People',
      dark: false,
      bg: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
      headerBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '1px solid #d1fae5',
      cardShadow: '0 1px 8px rgba(5,150,105,0.08)',
      textPrimary: '#064e3b',
      textSecondary: '#047857',
      textMuted: '#6ee7b7',
      accent: '#0d9488',
      accentLight: 'rgba(13,148,136,0.1)',
      upColor: '#16a34a',
      downColor: '#dc2626',
      gridLine: 'rgba(0,0,0,0.06)',
      chartColors: ['#0d9488','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#22c55e','#f97316','#6366f1'],
      icon: '👥',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>'
    },
    hotel_hospitality: {
      name: 'Hotel & Hospitality',
      dark: true,
      bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      headerBg: '#16213e',
      cardBg: '#1a1a2e',
      cardBorder: '1px solid rgba(212,175,55,0.2)',
      cardShadow: '0 4px 24px rgba(0,0,0,0.3)',
      textPrimary: '#f5f5f0',
      textSecondary: '#b8b8a8',
      textMuted: '#7a7a6a',
      accent: '#d4af37',
      accentLight: 'rgba(212,175,55,0.15)',
      upColor: '#22c55e',
      downColor: '#ef4444',
      gridLine: 'rgba(148,163,184,0.08)',
      chartColors: ['#d4af37','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f97316','#f59e0b'],
      icon: '🏨',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h6M9 15h6"/></svg>'
    },
    marketing_digital: {
      name: 'Marketing & Digital',
      dark: true,
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      headerBg: '#1e293b',
      cardBg: '#1e293b',
      cardBorder: '1px solid rgba(139,92,246,0.2)',
      cardShadow: '0 4px 24px rgba(0,0,0,0.3)',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#a855f7',
      accentLight: 'rgba(168,85,247,0.15)',
      upColor: '#22c55e',
      downColor: '#ef4444',
      gridLine: 'rgba(148,163,184,0.08)',
      chartColors: ['#a855f7','#06b6d4','#f59e0b','#22c55e','#ec4899','#3b82f6','#f97316','#6366f1'],
      icon: '📢',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
    },
    ecommerce_retail: {
      name: 'E-commerce & Retail',
      dark: false,
      bg: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
      headerBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '1px solid #fed7aa',
      cardShadow: '0 1px 8px rgba(234,88,12,0.08)',
      textPrimary: '#431407',
      textSecondary: '#9a3412',
      textMuted: '#fdba74',
      accent: '#ea580c',
      accentLight: 'rgba(234,88,12,0.1)',
      upColor: '#16a34a',
      downColor: '#dc2626',
      gridLine: 'rgba(0,0,0,0.06)',
      chartColors: ['#ea580c','#8b5cf6','#06b6d4','#22c55e','#ec4899','#3b82f6','#f59e0b','#6366f1'],
      icon: '🛒',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>'
    },
    education: {
      name: 'Education',
      dark: false,
      bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      headerBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '1px solid #bfdbfe',
      cardShadow: '0 1px 8px rgba(37,99,235,0.08)',
      textPrimary: '#1e3a5f',
      textSecondary: '#2563eb',
      textMuted: '#93c5fd',
      accent: '#2563eb',
      accentLight: 'rgba(37,99,235,0.1)',
      upColor: '#16a34a',
      downColor: '#dc2626',
      gridLine: 'rgba(0,0,0,0.06)',
      chartColors: ['#2563eb','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#6366f1'],
      icon: '🎓',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
    },
    logistics_transport: {
      name: 'Logistics & Transport',
      dark: true,
      bg: 'linear-gradient(135deg, #0c1222 0%, #162032 100%)',
      headerBg: '#162032',
      cardBg: '#1c2a3e',
      cardBorder: '1px solid rgba(249,115,22,0.2)',
      cardShadow: '0 4px 24px rgba(0,0,0,0.3)',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#f97316',
      accentLight: 'rgba(249,115,22,0.15)',
      upColor: '#22c55e',
      downColor: '#ef4444',
      gridLine: 'rgba(148,163,184,0.08)',
      chartColors: ['#f97316','#3b82f6','#22c55e','#8b5cf6','#ec4899','#06b6d4','#f59e0b','#6366f1'],
      icon: '🚛',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
    },
    generic_business: {
      name: 'General Business',
      dark: false,
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      headerBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '1px solid #e2e8f0',
      cardShadow: '0 1px 8px rgba(0,0,0,0.06)',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      accent: '#2563eb',
      accentLight: 'rgba(37,99,235,0.1)',
      upColor: '#16a34a',
      downColor: '#dc2626',
      gridLine: 'rgba(0,0,0,0.06)',
      chartColors: ['#2563eb','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#6366f1'],
      icon: '📈',
      heroIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 5-7"/></svg>'
    }
  };

  function getSkin(domainId) {
    return SKINS[domainId] || SKINS.generic_business;
  }

  // ── KPI Icon by keyword ─────────────────────────────────────────────
  var KPI_ICONS = [
    { keywords: ['revenue','รายได้','ยอดขาย','sales','income'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>', hue: '#3b82f6' },
    { keywords: ['profit','กำไร','margin','net'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', hue: '#22c55e' },
    { keywords: ['cost','ต้นทุน','expense','ค่าใช้จ่าย','spending'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 4H3v16h18V4zM1 10h22"/></svg>', hue: '#f59e0b' },
    { keywords: ['rate','อัตรา','ratio','สัดส่วน','percent','efficiency','oee','yield'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', hue: '#8b5cf6' },
    { keywords: ['customer','ลูกค้า','client','user','member','สมาชิก'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', hue: '#ec4899' },
    { keywords: ['time','เวลา','duration','days','hours','lead','cycle'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', hue: '#06b6d4' },
    { keywords: ['inventory','stock','สินค้า','warehouse','คลัง','quantity','จำนวน','count','total','production','output','unit'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>', hue: '#f97316' },
    { keywords: ['growth','เติบโต','increase','trend','change'], icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', hue: '#6366f1' }
  ];

  function kpiIcon(name) {
    var lower = (name || '').toLowerCase();
    for (var i = 0; i < KPI_ICONS.length; i++) {
      for (var j = 0; j < KPI_ICONS[i].keywords.length; j++) {
        if (lower.indexOf(KPI_ICONS[i].keywords[j]) >= 0)
          return { svg: KPI_ICONS[i].icon, hue: KPI_ICONS[i].hue };
      }
    }
    return { svg: KPI_ICONS[0].icon, hue: '#64748b' };
  }

  // ── SVG Chart Generators ────────────────────────────────────────────

  function sparklineSvg(series, color, w, h) {
    if (!series || series.length < 2) return '';
    var vals = series.map(function (s) { return s.value != null ? s.value : s; });
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    var range = max - min || 1;
    var pad = 2;
    var pts = vals.map(function (v, i) {
      var x = pad + (i / (vals.length - 1)) * (w - 2 * pad);
      var y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var areaClose = (w - pad).toFixed(1) + ',' + (h - pad) + ' ' + pad + ',' + (h - pad);
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:' + h + 'px">' +
      '<polygon points="' + pts + ' ' + areaClose + '" fill="' + color + '" opacity="0.12"/>' +
      '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  }

  function lineChartSvg(widget, skin, w, h) {
    var series = widget.series;
    if (!series || series.length < 2) return '';
    var labels = series.map(function (s) { return s.label != null ? s.label : (s.period != null ? String(s.period) : ''); });
    var vals = series.map(function (s) { return s.value; });
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    var range = max - min || 1;
    min = min - range * 0.05;
    max = max + range * 0.05;
    range = max - min;

    var padL = 60, padR = 20, padT = 20, padB = 40;
    var cw = w - padL - padR, ch = h - padT - padB;
    var gridColor = skin.gridLine;
    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';

    // Y-axis gridlines (5 lines)
    for (var g = 0; g <= 4; g++) {
      var yVal = min + (g / 4) * range;
      var yPos = padT + ch - (g / 4) * ch;
      svg += '<line x1="' + padL + '" y1="' + yPos + '" x2="' + (w - padR) + '" y2="' + yPos + '" stroke="' + gridColor + '" stroke-width="1"/>';
      svg += '<text x="' + (padL - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" fill="' + skin.textMuted + '" font-size="11" font-family="system-ui,sans-serif">' + fmt(yVal, widget.format) + '</text>';
    }

    // Data line + area
    var pts = vals.map(function (v, i) {
      var x = padL + (i / (vals.length - 1)) * cw;
      var y = padT + ch - ((v - min) / range) * ch;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var color = skin.accent;
    var areaClose = (padL + cw).toFixed(1) + ',' + (padT + ch) + ' ' + padL + ',' + (padT + ch);
    svg += '<polygon points="' + pts + ' ' + areaClose + '" fill="' + color + '" opacity="0.1"/>';
    svg += '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

    // End dot + label
    var lastX = padL + cw;
    var lastY = padT + ch - ((vals[vals.length - 1] - min) / range) * ch;
    svg += '<circle cx="' + lastX + '" cy="' + lastY + '" r="4" fill="' + color + '" stroke="' + skin.cardBg + '" stroke-width="2"/>';
    svg += '<text x="' + lastX + '" y="' + (lastY - 10) + '" text-anchor="middle" fill="' + skin.textPrimary + '" font-size="12" font-weight="600" font-family="system-ui,sans-serif">' + fmt(vals[vals.length - 1], widget.format) + '</text>';

    // X-axis labels (max 8)
    var step = Math.max(1, Math.ceil(labels.length / 8));
    for (var xi = 0; xi < labels.length; xi += step) {
      var xp = padL + (xi / (labels.length - 1)) * cw;
      svg += '<text x="' + xp + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + skin.textMuted + '" font-size="10" font-family="system-ui,sans-serif">' + esc(labels[xi]) + '</text>';
    }

    svg += '</svg>';
    return svg;
  }

  // Consumes the composer's multi-line shape: { periods: string[], parts: [{name, values[]}] }
  function multiLineChartSvg(widget, skin, w, h) {
    var periods = widget.periods || [];
    var parts = widget.parts || [];
    if (periods.length < 2 || parts.length < 1) return '';
    var allVals = [];
    parts.forEach(function (p) { (p.values || []).forEach(function (v) { if (v != null && isFinite(v)) allVals.push(v); }); });
    if (allVals.length < 2) return '';
    var min = Math.min.apply(null, allVals);
    var max = Math.max.apply(null, allVals);
    var range = max - min || 1;
    min = min - range * 0.05;
    max = max + range * 0.05;
    range = max - min;

    var padL = 60, padR = 20, padT = 30, padB = 40;
    var cw = w - padL - padR, ch = h - padT - padB;
    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';

    // Legend (top row) — required for ≥2 series
    var lx = padL;
    parts.forEach(function (p, si) {
      var color = skin.chartColors[si % skin.chartColors.length];
      var name = (p.name || '').length > 24 ? p.name.substring(0, 24) + '…' : (p.name || '');
      svg += '<circle cx="' + (lx + 4) + '" cy="10" r="4" fill="' + color + '"/>';
      svg += '<text x="' + (lx + 12) + '" y="14" fill="' + skin.textSecondary + '" font-size="10" font-family="system-ui,sans-serif">' + esc(name) + '</text>';
      lx += 12 + name.length * 5.6 + 18;
    });

    for (var g = 0; g <= 4; g++) {
      var yVal = min + (g / 4) * range;
      var yPos = padT + ch - (g / 4) * ch;
      svg += '<line x1="' + padL + '" y1="' + yPos + '" x2="' + (w - padR) + '" y2="' + yPos + '" stroke="' + skin.gridLine + '" stroke-width="1"/>';
      svg += '<text x="' + (padL - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" fill="' + skin.textMuted + '" font-size="11" font-family="system-ui,sans-serif">' + fmt(yVal, widget.format) + '</text>';
    }

    parts.forEach(function (p, si) {
      var color = skin.chartColors[si % skin.chartColors.length];
      var pts = [];
      var lastPt = null;
      (p.values || []).forEach(function (v, i) {
        if (v == null || !isFinite(v)) return;
        var x = padL + (periods.length > 1 ? (i / (periods.length - 1)) : 0) * cw;
        var y = padT + ch - ((v - min) / range) * ch;
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
        lastPt = { x: x, y: y };
      });
      if (pts.length < 2) return;
      svg += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
      if (lastPt) svg += '<circle cx="' + lastPt.x + '" cy="' + lastPt.y + '" r="4" fill="' + color + '" stroke="' + skin.cardBg + '" stroke-width="2"/>';
    });

    var step = Math.max(1, Math.ceil(periods.length / 8));
    for (var xi = 0; xi < periods.length; xi += step) {
      var xp = padL + (xi / (periods.length - 1)) * cw;
      svg += '<text x="' + xp + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + skin.textMuted + '" font-size="10" font-family="system-ui,sans-serif">' + esc(String(periods[xi])) + '</text>';
    }

    svg += '</svg>';
    return svg;
  }

  // Scatter — composer emits points as [x, y] pairs; r cited in the title per D26
  function scatterSvg(widget, skin, w, h) {
    var raw = widget.points || [];
    var points = raw.map(function (p) {
      return Array.isArray(p) ? { x: p[0], y: p[1] } : p;
    }).filter(function (p) { return p && isFinite(p.x) && isFinite(p.y); });
    if (points.length < 5) return '';
    var xs = points.map(function (p) { return p.x; });
    var ys = points.map(function (p) { return p.y; });
    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    var yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys);
    var xR = (xMax - xMin) || 1, yR = (yMax - yMin) || 1;
    var padL = 60, padR = 16, padT = 14, padB = 44;
    var cw = w - padL - padR, ch = h - padT - padB;
    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    for (var g = 0; g <= 4; g++) {
      var yPos = padT + ch - (g / 4) * ch;
      svg += '<line x1="' + padL + '" y1="' + yPos + '" x2="' + (w - padR) + '" y2="' + yPos + '" stroke="' + skin.gridLine + '" stroke-width="1"/>';
      svg += '<text x="' + (padL - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" fill="' + skin.textMuted + '" font-size="10" font-family="system-ui,sans-serif">' + fmt(yMin + (g / 4) * yR, null) + '</text>';
    }
    points.slice(0, 300).forEach(function (p) {
      var x = padL + ((p.x - xMin) / xR) * cw;
      var y = padT + ch - ((p.y - yMin) / yR) * ch;
      svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5" fill="' + skin.accent + '" opacity="0.55"/>';
    });
    svg += '<text x="' + (padL + cw / 2) + '" y="' + (h - 6) + '" text-anchor="middle" fill="' + skin.textMuted + '" font-size="10" font-family="system-ui,sans-serif">' + esc(widget.xName || '') + '</text>';
    svg += '</svg>';
    return svg;
  }

  // Stacked columns over time — { periods, parts:[{name, values[]}] }, parts ≤5 per doc06
  function stackedTimeSvg(widget, skin, w, h) {
    var periods = widget.periods || [];
    var parts = widget.parts || [];
    if (periods.length < 2 || parts.length < 2) return '';
    var totals = periods.map(function (_, i) {
      return parts.reduce(function (s, p) { var v = (p.values || [])[i]; return s + (v != null && isFinite(v) ? v : 0); }, 0);
    });
    var max = Math.max.apply(null, totals) || 1;
    var padL = 60, padR = 16, padT = 30, padB = 40;
    var cw = w - padL - padR, ch = h - padT - padB;
    var barW = Math.min(26, Math.floor(cw / periods.length * 0.6));
    var slotW = cw / periods.length;
    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    var lx = padL;
    parts.forEach(function (p, si) {
      var color = skin.chartColors[si % skin.chartColors.length];
      var name = (p.name || '').length > 18 ? p.name.substring(0, 18) + '…' : (p.name || '');
      svg += '<rect x="' + lx + '" y="4" width="9" height="9" rx="2" fill="' + color + '"/>';
      svg += '<text x="' + (lx + 13) + '" y="12" fill="' + skin.textSecondary + '" font-size="10" font-family="system-ui,sans-serif">' + esc(name) + '</text>';
      lx += 13 + name.length * 5.6 + 16;
    });
    for (var g = 0; g <= 4; g++) {
      var yPos = padT + ch - (g / 4) * ch;
      svg += '<line x1="' + padL + '" y1="' + yPos + '" x2="' + (w - padR) + '" y2="' + yPos + '" stroke="' + skin.gridLine + '" stroke-width="1"/>';
      svg += '<text x="' + (padL - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" fill="' + skin.textMuted + '" font-size="10" font-family="system-ui,sans-serif">' + fmt((g / 4) * max, widget.format) + '</text>';
    }
    periods.forEach(function (per, i) {
      var x = padL + i * slotW + (slotW - barW) / 2;
      var yCursor = padT + ch;
      parts.forEach(function (p, si) {
        var v = (p.values || [])[i];
        if (v == null || !isFinite(v) || v <= 0) return;
        var hgt = (v / max) * ch;
        yCursor -= hgt;
        svg += '<rect x="' + x.toFixed(1) + '" y="' + (yCursor + 1).toFixed(1) + '" width="' + barW + '" height="' + Math.max(0, hgt - 2).toFixed(1) + '" fill="' + skin.chartColors[si % skin.chartColors.length] + '"/>';
      });
    });
    var step = Math.max(1, Math.ceil(periods.length / 8));
    for (var xi = 0; xi < periods.length; xi += step) {
      var xp = padL + xi * slotW + slotW / 2;
      svg += '<text x="' + xp + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + skin.textMuted + '" font-size="10" font-family="system-ui,sans-serif">' + esc(String(periods[xi])) + '</text>';
    }
    svg += '</svg>';
    return svg;
  }

  function barChartSvg(widget, skin, w, h) {
    var groups = widget.groups;
    if (!groups || groups.length < 1) return '';
    var labels = groups.map(function (g) { return g.group || g.name || g.label || ''; });
    var vals = groups.map(function (g) { return g.value || 0; });
    var max = Math.max.apply(null, vals) || 1;

    var padL = 60, padR = 20, padT = 20, padB = 50;
    var cw = w - padL - padR, ch = h - padT - padB;
    var barW = Math.min(24, Math.floor(cw / groups.length * 0.6));
    var gap = (cw - barW * groups.length) / (groups.length + 1);

    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';

    for (var g = 0; g <= 4; g++) {
      var yVal = (g / 4) * max;
      var yPos = padT + ch - (g / 4) * ch;
      svg += '<line x1="' + padL + '" y1="' + yPos + '" x2="' + (w - padR) + '" y2="' + yPos + '" stroke="' + skin.gridLine + '" stroke-width="1"/>';
      svg += '<text x="' + (padL - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" fill="' + skin.textMuted + '" font-size="11" font-family="system-ui,sans-serif">' + fmt(yVal, widget.format) + '</text>';
    }

    var labelStep = Math.max(1, Math.ceil(groups.length / 8));
    groups.forEach(function (grp, i) {
      var x = padL + gap + i * (barW + gap);
      var barH = (vals[i] / max) * ch;
      var y = padT + ch - barH;
      // A distribution of ONE measure wears one hue; a categorical breakdown
      // gets the fixed-order palette.
      var color = widget.monoColor ? skin.accent : skin.chartColors[i % skin.chartColors.length];
      svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="4" fill="' + color + '"/>';
      svg += '<text x="' + (x + barW / 2) + '" y="' + (y - 6) + '" text-anchor="middle" fill="' + skin.textSecondary + '" font-size="10" font-weight="600" font-family="system-ui,sans-serif">' + fmt(vals[i], widget.format) + '</text>';
      if (i % labelStep !== 0) return;
      var lbl = labels[i].length > 10 ? labels[i].substring(0, 10) + '…' : labels[i];
      svg += '<text x="' + (x + barW / 2) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + skin.textMuted + '" font-size="9" font-family="system-ui,sans-serif" transform="rotate(-30 ' + (x + barW / 2) + ' ' + (h - 8) + ')">' + esc(lbl) + '</text>';
    });

    svg += '</svg>';
    return svg;
  }

  function donutOnlySvg(groups, skin, size, format, centerLabel) {
    var total = groups.reduce(function (s, g) { return s + (g.value || 0); }, 0);
    if (total <= 0) return '';
    var cx = size / 2, cy = size / 2, r = size * 0.44, innerR = r * 0.66;
    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg" style="width:' + size + 'px;height:' + size + 'px;flex-shrink:0">';
    var startAngle = -Math.PI / 2;
    groups.forEach(function (grp, i) {
      var frac = grp.value / total;
      var angle = frac * 2 * Math.PI;
      var endAngle = startAngle + angle;
      var largeArc = angle > Math.PI ? 1 : 0;
      var gap = Math.min(0.03, angle * 0.15);
      var sa = startAngle + gap, ea = endAngle - gap;
      if (ea <= sa) ea = sa + 0.01;
      var x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
      var x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
      var ix1 = cx + innerR * Math.cos(ea), iy1 = cy + innerR * Math.sin(ea);
      var ix2 = cx + innerR * Math.cos(sa), iy2 = cy + innerR * Math.sin(sa);
      var color = skin.chartColors[i % skin.chartColors.length];
      svg += '<path d="M' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' L' + ix1.toFixed(2) + ' ' + iy1.toFixed(2) + ' A' + innerR + ' ' + innerR + ' 0 ' + largeArc + ' 0 ' + ix2.toFixed(2) + ' ' + iy2.toFixed(2) + ' Z" fill="' + color + '"/>';
      startAngle = endAngle;
    });
    svg += '<text x="' + cx + '" y="' + (cy - 3) + '" text-anchor="middle" fill="' + skin.textPrimary + '" font-size="' + Math.round(size * 0.11) + '" font-weight="700" font-family="system-ui,sans-serif">' + fmt(total, format) + '</text>';
    svg += '<text x="' + cx + '" y="' + (cy + Math.round(size * 0.09)) + '" text-anchor="middle" fill="' + skin.textMuted + '" font-size="' + Math.round(size * 0.065) + '" font-family="system-ui,sans-serif">' + esc(centerLabel || 'Total') + '</text>';
    svg += '</svg>';
    return svg;
  }

  function renderDonutCard(w, skin, spanClass) {
    var groups = (w.groups || []).slice(0, 6);
    if (!groups.length) return '';
    var total = groups.reduce(function (s, g) { return s + (g.value || 0); }, 0);
    if (total <= 0) return '';
    var legend = groups.map(function (g, i) {
      var color = skin.chartColors[i % skin.chartColors.length];
      var gname = g.group || g.name || '';
      var name = gname.length > 18 ? gname.substring(0, 18) + '…' : gname;
      return '<div class="ig-legend-item">' +
        '<span class="ig-legend-dot" style="background:' + color + '"></span>' +
        '<span class="ig-legend-name">' + esc(name) + '</span>' +
        '<span class="ig-legend-val">' + fmt(g.value, w.format) + '</span>' +
        '<span class="ig-legend-pct">' + (g.value / total * 100).toFixed(1) + '%</span>' +
        '</div>';
    }).join('');
    return '<div class="ig-chart-card ' + (spanClass || '') + '">' +
      '<div class="ig-chart-title">' + esc(w.nameTH || w.question || '') + '</div>' +
      '<div class="ig-donut-flex">' +
      donutOnlySvg(groups, skin, 150, w.format, 'รวม') +
      '<div class="ig-donut-legend">' + legend + '</div>' +
      '</div></div>';
  }

  function hbarChartSvg(widget, skin, w, h) {
    var groups = widget.groups;
    if (!groups || groups.length < 1) return '';
    var max = Math.max.apply(null, groups.map(function (g) { return g.value || 0; })) || 1;
    var padL = 120, padR = 60, padT = 10, padB = 10;
    var ch = h - padT - padB;
    var barH = Math.min(20, Math.floor(ch / groups.length * 0.65));
    var gap = (ch - barH * groups.length) / (groups.length + 1);
    var cw = w - padL - padR;

    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';

    groups.forEach(function (grp, i) {
      var y = padT + gap + i * (barH + gap);
      var barW = (grp.value / max) * cw;
      var color = skin.chartColors[i % skin.chartColors.length];
      // Rank circle
      svg += '<circle cx="16" cy="' + (y + barH / 2) + '" r="10" fill="' + color + '"/>';
      svg += '<text x="16" y="' + (y + barH / 2 + 4) + '" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="system-ui,sans-serif">' + (i + 1) + '</text>';
      // Label
      var gname = grp.group || grp.name || '';
      var name = gname.length > 14 ? gname.substring(0, 14) + '…' : gname;
      svg += '<text x="32" y="' + (y + barH / 2 + 4) + '" fill="' + skin.textSecondary + '" font-size="11" font-family="system-ui,sans-serif">' + esc(name) + '</text>';
      // Bar
      svg += '<rect x="' + padL + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="4" fill="' + color + '" opacity="0.85"/>';
      // Value
      svg += '<text x="' + (padL + barW + 6) + '" y="' + (y + barH / 2 + 4) + '" fill="' + skin.textPrimary + '" font-size="11" font-weight="600" font-family="system-ui,sans-serif">' + fmt(grp.value, widget.format) + '</text>';
    });

    svg += '</svg>';
    return svg;
  }

  function gaugeRingSvg(value, target, label, skin, w, h) {
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.38;
    var pct = target > 0 ? Math.min(1, value / target) : (value > 100 ? 1 : value / 100);
    var circumference = 2 * Math.PI * r;
    var dashLen = pct * circumference * 0.75;
    var trackLen = circumference * 0.75;
    var color = pct >= 0.9 ? skin.upColor : (pct >= 0.7 ? skin.accent : skin.downColor);

    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + skin.gridLine + '" stroke-width="10" stroke-dasharray="' + trackLen + ' ' + circumference + '" stroke-linecap="round" transform="rotate(135 ' + cx + ' ' + cy + ')"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="10" stroke-dasharray="' + dashLen + ' ' + circumference + '" stroke-linecap="round" transform="rotate(135 ' + cx + ' ' + cy + ')"/>';
    svg += '<text x="' + cx + '" y="' + (cy + 2) + '" text-anchor="middle" fill="' + skin.textPrimary + '" font-size="24" font-weight="700" font-family="system-ui,sans-serif">' + fmt(value) + '</text>';
    svg += '<text x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle" fill="' + skin.textMuted + '" font-size="11" font-family="system-ui,sans-serif">' + esc(label) + '</text>';
    svg += '</svg>';
    return svg;
  }

  // ── Widget renderers → HTML snippet ─────────────────────────────────

  // Real half-vs-half delta from the series (same math as composer's trend
  // status) — never invents a change figure when the series can't support one.
  function seriesDeltaPct(series) {
    if (!series || series.length < 4) return null;
    var vals = series.map(function (p) { return p.value != null ? p.value : p; })
      .filter(function (v) { return typeof v === 'number' && isFinite(v); });
    if (vals.length < 4) return null;
    var mid = Math.floor(vals.length / 2);
    var a = vals.slice(0, mid).reduce(function (s, v) { return s + v; }, 0) / mid;
    var b = vals.slice(mid).reduce(function (s, v) { return s + v; }, 0) / (vals.length - mid);
    if (a === 0) return null;
    return ((b - a) / Math.abs(a)) * 100;
  }

  function renderKpiCard(w, skin, idx) {
    var ic = kpiIcon(w.nameTH || w.kpiId || '');
    var hue = skin.chartColors[idx % skin.chartColors.length] || ic.hue;
    var delta = (w.deltaPct != null && !isNaN(w.deltaPct)) ? w.deltaPct : seriesDeltaPct(w.series);
    var deltaHtml = '';
    if (delta != null && !isNaN(delta)) {
      var goodDir = w.direction === 'lower-better' ? delta < 0 : delta >= 0;
      var dColor = goodDir ? skin.upColor : skin.downColor;
      var arrow = delta >= 0 ? '▲' : '▼';
      deltaHtml = '<span style="color:' + dColor + ';font-weight:600">' + arrow + ' ' + Math.abs(delta).toFixed(1) + '%</span>' +
        '<span style="color:' + skin.textMuted + ';margin-left:5px">ครึ่งหลัง vs ครึ่งแรก</span>';
    } else if (w.target && w.target.benchmark && w.target.benchmark.good != null) {
      deltaHtml = '<span style="color:' + skin.textMuted + '">เป้าหมาย ' + fmt(w.target.benchmark.good, w.format) + '</span>';
    } else {
      deltaHtml = '<span style="color:' + skin.textMuted + '">&nbsp;</span>';
    }
    var sparkHtml = '';
    if (w.series && w.series.length >= 3) {
      sparkHtml = '<div class="ig-kpi-spark">' + sparklineSvg(w.series, hue, 180, 34) + '</div>';
    }

    return '<div class="ig-kpi-card">' +
      '<div class="ig-kpi-top">' +
      '<div class="ig-kpi-icon" style="background:' + hue + '1f;color:' + hue + '">' + ic.svg + '</div>' +
      '<div class="ig-kpi-meta">' +
      '<div class="ig-kpi-label">' + esc(w.nameTH || w.kpiId || '') + '</div>' +
      '<div class="ig-kpi-value">' + fmt(w.value, w.format) + '</div>' +
      '</div></div>' +
      '<div class="ig-kpi-delta">' + deltaHtml + '</div>' +
      sparkHtml +
      '</div>';
  }

  function renderChartCard(w, skin, chartSvg, spanClass) {
    if (!chartSvg) return '';
    return '<div class="ig-chart-card ' + (spanClass || '') + '">' +
      '<div class="ig-chart-title">' + esc(w.nameTH || w.question || '') + '</div>' +
      '<div class="ig-chart-body">' + chartSvg + '</div>' +
      '</div>';
  }

  function renderRankedList(w, skin) {
    var groups = w.groups || [];
    if (!groups.length) return '';
    var max = Math.max.apply(null, groups.map(function (g) { return g.value || 0; })) || 1;
    var rows = groups.map(function (g, i) {
      var pctW = Math.round((g.value / max) * 100);
      var color = skin.chartColors[i % skin.chartColors.length];
      var gname = g.group || g.name || '';
      var name = gname.length > 20 ? gname.substring(0, 20) + '…' : gname;
      return '<div class="ig-rank-row">' +
        '<span class="ig-rank-num" style="background:' + color + '">' + (i + 1) + '</span>' +
        '<span class="ig-rank-name">' + esc(name) + '</span>' +
        '<span class="ig-rank-bar-wrap"><span class="ig-rank-bar" style="width:' + pctW + '%;background:' + color + '"></span></span>' +
        '<span class="ig-rank-val">' + fmt(g.value, w.format) + '</span>' +
        '</div>';
    }).join('');
    return '<div class="ig-chart-card"><div class="ig-chart-title">' + esc(w.nameTH || w.question || '') + '</div>' + rows + '</div>';
  }

  function renderStatusTable(w, skin) {
    // Composer shape: rows [{nameTH, question, value, format, status, severity, deltaPct}]
    var kpis = w.rows || w.kpis || [];
    if (!kpis.length) return '';
    var sevColor = { good: skin.upColor, warn: '#f59e0b', bad: skin.downColor, neutral: skin.accent };
    var rows = kpis.map(function (k) {
      var statusColor = sevColor[k.severity] || skin.accent;
      var ic = kpiIcon(k.nameTH || k.name || '');
      // Delta color follows the evidence-based severity (direction-aware),
      // not the raw sign — "+0.8% downtime" must not read as good news.
      var deltaColor = k.severity === 'good' ? skin.upColor : (k.severity === 'bad' ? skin.downColor : skin.textSecondary);
      var deltaHtml = (k.deltaPct != null && !isNaN(k.deltaPct))
        ? '<span style="color:' + deltaColor + '">' + pct(k.deltaPct) + '</span>' : '—';
      return '<tr>' +
        '<td style="padding:8px 10px;font-weight:500"><span style="display:inline-flex;align-items:center;gap:8px"><span style="width:22px;height:22px;border-radius:6px;background:' + statusColor + '18;color:' + statusColor + ';display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">' + ic.svg.replace('viewBox', 'width="13" height="13" viewBox') + '</span>' + esc(k.nameTH || k.name || '') + '</span></td>' +
        '<td style="padding:8px 10px;font-weight:600;text-align:right">' + fmt(k.value, k.format) + '</td>' +
        '<td style="padding:8px 10px;text-align:right">' + deltaHtml + '</td>' +
        '<td style="padding:8px 10px;text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;background:' + statusColor + '1f;color:' + statusColor + '">' + esc(k.status || '—') + '</span></td>' +
        '</tr>';
    }).join('');
    return '<div class="ig-chart-card"><div class="ig-chart-title">' + esc(w.title || 'สรุปสถานะตัวชี้วัดหลัก') + '</div>' +
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px;color:' + skin.textPrimary + '">' +
      '<thead><tr style="border-bottom:2px solid ' + skin.gridLine + '">' +
      '<th style="padding:7px 10px;text-align:left;font-weight:600;color:' + skin.textSecondary + '">ตัวชี้วัด</th>' +
      '<th style="padding:7px 10px;text-align:right;font-weight:600;color:' + skin.textSecondary + '">ค่า</th>' +
      '<th style="padding:7px 10px;text-align:right;font-weight:600;color:' + skin.textSecondary + '">เปลี่ยนแปลง</th>' +
      '<th style="padding:7px 10px;text-align:center;font-weight:600;color:' + skin.textSecondary + '">สถานะ</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function renderAlertFeed(w, skin, spanClass) {
    var alerts = w.items || w.alerts || [];
    if (!alerts.length) return '';
    var sevColors = { high: '#ef4444', medium: '#f59e0b', info: '#3b82f6' };
    var sevIcons = {
      high: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      medium: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    var items = alerts.map(function (a) {
      var sev = a.severity || 'info';
      var color = sevColors[sev] || sevColors.info;
      var msg = a.message || '';
      var dashIdx = msg.indexOf(' — ');
      var title = dashIdx > 0 ? msg.substring(0, dashIdx) : msg;
      var sub = dashIdx > 0 ? msg.substring(dashIdx + 3) : '';
      return '<div class="ig-alert-item">' +
        '<div class="ig-alert-badge" style="background:' + color + '1c;color:' + color + '">' + (sevIcons[sev] || sevIcons.info) + '</div>' +
        '<div class="ig-alert-body">' +
        '<div class="ig-alert-title">' + esc(title) + '</div>' +
        (sub ? '<div class="ig-alert-sub">' + esc(sub) + '</div>' : '') +
        '</div></div>';
    }).join('');
    return '<div class="ig-chart-card ' + (spanClass || '') + '"><div class="ig-chart-title">' + esc(w.title || 'การแจ้งเตือน') + '</div>' + items + '</div>';
  }

  var STATUS_PILL_WORDS = {
    good: ['completed', 'good', 'ok', 'passed', 'active', 'ดี', 'ดีเยี่ยม', 'ปกติ', 'สำเร็จ', 'เสร็จ', 'approved', 'excellent'],
    warn: ['pending', 'warning', 'low', 'เฝ้าระวัง', 'รอ', 'ล่าช้า', 'ต่ำ'],
    bad: ['critical', 'failed', 'overdue', 'out of stock', 'วิกฤต', 'เกิน', 'ค้าง', 'แย่ลง', 'ต่ำกว่าเป้า']
  };

  function statusPillHtml(text, skin) {
    var lower = String(text).toLowerCase().trim();
    if (!lower || lower.length > 20) return null;
    var color = null;
    if (STATUS_PILL_WORDS.good.some(function (kw) { return lower === kw || lower.indexOf(kw) === 0; })) color = skin.upColor;
    else if (STATUS_PILL_WORDS.bad.some(function (kw) { return lower.indexOf(kw) >= 0; })) color = skin.downColor;
    else if (STATUS_PILL_WORDS.warn.some(function (kw) { return lower.indexOf(kw) >= 0; })) color = '#f59e0b';
    if (!color) return null;
    return '<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;background:' + color + '1f;color:' + color + '">' + esc(text) + '</span>';
  }

  function renderDataTable(w, skin, spanClass) {
    var rows = w.rows || [];
    var cols = (w.columns || []).slice(0, 7);
    if (!rows.length || !cols.length) return '';
    var colKey = function (c) { return typeof c === 'string' ? c : (c.key || c.name || ''); };
    var thRow = cols.map(function (c) {
      return '<th>' + esc(typeof c === 'string' ? c : (c.name || c.key || '')) + '</th>';
    }).join('');
    var trs = rows.slice(0, 8).map(function (r) {
      var tds = cols.map(function (c) {
        var v = r[colKey(c)];
        if (v == null) v = '';
        var isNum = typeof v === 'number';
        var pill = !isNum ? statusPillHtml(v, skin) : null;
        var content = pill || (isNum ? fmt(v, null) : esc(String(v)));
        return '<td' + (isNum ? ' style="text-align:right;font-weight:500"' : '') + '>' + content + '</td>';
      }).join('');
      return '<tr>' + tds + '</tr>';
    }).join('');
    return '<div class="ig-chart-card ' + (spanClass || '') + '"><div class="ig-chart-title">' + esc(w.title || 'รายการข้อมูลล่าสุด') + '</div>' +
      '<div style="overflow-x:auto"><table class="ig-table">' +
      '<thead><tr>' + thRow + '</tr></thead>' +
      '<tbody>' + trs + '</tbody></table></div></div>';
  }

  // ── Insight Story panel ─────────────────────────────────────────────
  // Consumes the insight engine's real shape:
  // { facts, narration: {executiveSummary, topInsights, recommendations, risks, source} }
  function renderInsightPanel(insightStory, skin) {
    var n = insightStory && insightStory.narration;
    if (!n) return '';
    var html = '';
    if (n.executiveSummary) {
      html += '<div class="ig-insight-line" style="font-weight:600;color:' + skin.textPrimary + '">' + esc(n.executiveSummary) + '</div>';
    }
    (n.topInsights || []).slice(0, 5).forEach(function (it) {
      var sevColor = it.severity === 'high' ? skin.downColor : (it.severity === 'medium' ? '#f59e0b' : skin.accent);
      html += '<div class="ig-insight-line"><span style="color:' + sevColor + ';margin-right:6px">●</span>' + esc(it.insight || '') + '</div>';
    });
    (n.recommendations || []).slice(0, 3).forEach(function (r) {
      html += '<div class="ig-insight-line"><span style="color:' + skin.upColor + ';margin-right:6px">▶</span><strong>' + esc(r.action || '') + '</strong>' + (r.why ? ' — ' + esc(r.why) : '') + '</div>';
    });
    (n.risks || []).slice(0, 2).forEach(function (r) {
      html += '<div class="ig-insight-line"><span style="color:' + skin.downColor + ';margin-right:6px">⚠</span>' + esc(r.risk || '') + '</div>';
    });
    if (!html) return '';
    var badge = n.source === 'llm' ? 'AI Narration ✓' : 'คำนวณจากข้อมูลจริง 100%';
    return '<div class="ig-chart-card ig-span-full" style="margin-bottom:14px">' +
      '<div class="ig-chart-title">ข้อค้นพบและข้อเสนอแนะจากข้อมูล <span class="ig-insight-badge">' + badge + '</span></div>' +
      html + '</div>';
  }

  // ── Main page builder ───────────────────────────────────────────────

  // Strip extension + separators, keep Thai/English text as-is (no case
  // folding — Thai has no concept of it, and forcing English title-case on
  // a mixed-script filename reads as broken rather than polished).
  function humanizeFilename(name) {
    if (!name) return '';
    return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  }

  function resolveDashboardTitle(meta, domainName) {
    if (meta && meta.datasetTitle) return meta.datasetTitle;
    var humanized = humanizeFilename(meta && meta.filename);
    if (humanized) return humanized;
    return domainName + ' Dashboard';
  }

  function buildPage(spec, meta, skin) {
    var domainName = (meta && meta.domainNameTH) || skin.name;
    var filename = (meta && meta.filename) || 'Dashboard';
    var templateName = (meta && meta.templateName) || '';
    var dashboardTitle = resolveDashboardTitle(meta, domainName);
    var insightStory = meta && meta.insightStory;
    var now = new Date();
    var dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    // Collect widgets from spec — the composer's real gene vocabulary
    var kpiWidgets = [];
    var trendWidgets = [];      // trend_line (series) / multi_line (periods+parts)
    var stackedWidgets = [];
    var donutWidgets = [];      // donut / treemap → donut+legend card
    var breakdownWidgets = [];  // ranking_hbar / pareto_bar (groups)
    var histogramWidgets = [];
    var scatterWidgets = [];
    var statusTableWidget = null;
    var alertWidget = null;
    var detailTableWidgets = [];
    var insightStrips = [];

    if (spec && spec.pages) {
      spec.pages.forEach(function (page) {
        (page.sections || []).forEach(function (sec) {
          (sec.widgets || []).forEach(function (w) {
            var gid = w.geneId || '';
            if (gid === 'gene.kpi_card_trend' || gid === 'gene.kpi_card_static' || gid === 'gene.kpi_card') kpiWidgets.push(w);
            else if (gid === 'gene.highlight_card' || gid === 'gene.bullet_target') kpiWidgets.push(w);
            else if (gid === 'gene.trend_line' || gid === 'gene.trend' || gid === 'gene.multi_line') trendWidgets.push(w);
            else if (gid === 'gene.stacked_time') stackedWidgets.push(w);
            else if (gid === 'gene.donut' || gid === 'gene.treemap') donutWidgets.push(w);
            else if (gid === 'gene.ranking_hbar' || gid === 'gene.pareto_bar') breakdownWidgets.push(w);
            else if (gid === 'gene.histogram') histogramWidgets.push(w);
            else if (gid === 'gene.scatter_relation') scatterWidgets.push(w);
            else if (gid === 'gene.kpi_status_table') statusTableWidget = w;
            else if (gid === 'gene.alert_feed') alertWidget = w;
            else if (gid === 'gene.detail_table' || gid === 'gene.data_table') detailTableWidgets.push(w);
            else if (gid === 'gene.insight_strip') insightStrips.push(w);
            // gene.gap_card intentionally skipped — data gaps already surface
            // through the composer's alert feed as info items.
          });
        });
      });
    }

    // Dedupe KPI tiles: highlight_card repeats the same KPIs as the headline
    // kpi_card row — keep first occurrence per kpiId only.
    var seenKpi = {};
    kpiWidgets = kpiWidgets.filter(function (w) {
      var key = w.kpiId || w.nameTH;
      if (seenKpi[key]) return false;
      seenKpi[key] = true;
      return true;
    });

    // ── Build HTML sections ──────────────────────────────────────────
    kpiWidgets = kpiWidgets.filter(function (w) { return w.value != null && !isNaN(w.value); });
    var kpiRowHtml = kpiWidgets.slice(0, 6).map(function (w, i) {
      return renderKpiCard(w, skin, i);
    }).join('');

    function trendSvgFor(widget, w, h) {
      if (widget.periods && widget.parts) return multiLineChartSvg(widget, skin, w, h);
      return lineChartSvg(widget, skin, w, h);
    }

    var chartsRowHtml = '';

    // Hero chart (first trend)
    if (trendWidgets.length > 0) {
      chartsRowHtml += renderChartCard(trendWidgets[0], skin, trendSvgFor(trendWidgets[0], 640, 280),
        donutWidgets.length > 0 ? 'ig-span-8' : 'ig-span-full');
    }

    // First donut beside the hero
    if (donutWidgets.length > 0) {
      chartsRowHtml += renderDonutCard(donutWidgets[0], skin, trendWidgets.length > 0 ? 'ig-span-4' : 'ig-span-6');
    }

    // Second row: extra trend / stacked-time / second donut pair up
    var secondRow = [];
    if (trendWidgets.length > 1) secondRow.push(function () { return renderChartCard(trendWidgets[1], skin, trendSvgFor(trendWidgets[1], 520, 240), 'ig-span-6'); });
    if (stackedWidgets.length > 0) secondRow.push(function () { return renderChartCard(stackedWidgets[0], skin, stackedTimeSvg(stackedWidgets[0], skin, 520, 240), 'ig-span-6'); });
    if (donutWidgets.length > 1) secondRow.push(function () { return renderDonutCard(donutWidgets[1], skin, 'ig-span-6'); });
    secondRow.slice(0, 2).forEach(function (f) { chartsRowHtml += f(); });

    // Mid row: Top-N ranked list / breakdown bar / distribution / relation
    var detailRowHtml = '';
    breakdownWidgets.slice(0, 2).forEach(function (bw) {
      if (bw.groups && bw.groups.length >= 2) {
        if (bw.geneId === 'gene.ranking_hbar') {
          detailRowHtml += renderRankedList(bw, skin);
        } else {
          detailRowHtml += renderChartCard(bw, skin, barChartSvg(bw, skin, 450, 240), '');
        }
      }
    });
    if (histogramWidgets.length > 0) {
      var hw = histogramWidgets[0];
      var histGroups = (hw.bins || []).map(function (b) {
        return { name: '≥' + fmt(b.from, null), value: b.count };
      });
      detailRowHtml += renderChartCard(hw, skin, barChartSvg({ groups: histGroups, format: null, monoColor: true }, skin, 450, 240), '');
    }
    var midCards = (detailRowHtml.match(/ig-chart-card/g) || []).length;
    if (scatterWidgets.length > 0 && midCards < 2) {
      detailRowHtml += renderChartCard(scatterWidgets[0], skin, scatterSvg(scatterWidgets[0], skin, 450, 240), '');
    }
    if (statusTableWidget) {
      detailRowHtml += renderStatusTable(statusTableWidget, skin);
    }

    // Bottom row: recent-records table (wide) + alerts (narrow), reference-style
    var bottomRowHtml = '';
    var hasTable = detailTableWidgets.length > 0;
    if (hasTable) {
      bottomRowHtml += renderDataTable(detailTableWidgets[0], skin, alertWidget ? 'ig-span-8' : 'ig-span-full');
    }
    if (alertWidget) {
      if (hasTable) {
        bottomRowHtml += renderAlertFeed(alertWidget, skin, 'ig-span-4');
      } else {
        detailRowHtml += renderAlertFeed(alertWidget, skin, '');
      }
    }

    // Insight panel
    var insightHtml = renderInsightPanel(insightStory, skin);

    // ── Assemble full HTML ───────────────────────────────────────────

    var html = '<!DOCTYPE html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + esc(dashboardTitle) + ' — iDash</title>\n<style>\n' +
      buildCSS(skin) +
      '\n</style>\n</head>\n<body>\n' +
      '<div class="ig-dashboard">\n' +

      // Header
      '<header class="ig-header">\n' +
      '  <div class="ig-header-left">\n' +
      '    <div class="ig-logo">' + skin.heroIcon + '</div>\n' +
      '    <div class="ig-header-text">\n' +
      '      <h1 class="ig-title">' + esc(dashboardTitle) + '</h1>\n' +
      '      <p class="ig-subtitle">' + esc(domainName) + (templateName ? ' — ' + esc(templateName) : '') + '</p>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '  <div class="ig-header-right">\n' +
      '    <span class="ig-date">📅 ' + dateStr + '</span>\n' +
      '    <span class="ig-badge">iDash v2.0</span>\n' +
      '  </div>\n' +
      '</header>\n' +

      // KPI Row
      (kpiRowHtml ? '<section class="ig-kpi-row">\n' + kpiRowHtml + '\n</section>\n' : '') +

      // Charts
      (chartsRowHtml ? '<section class="ig-charts-row">\n' + chartsRowHtml + '\n</section>\n' : '') +

      // Detail
      (detailRowHtml ? '<section class="ig-detail-row">\n' + detailRowHtml + '\n</section>\n' : '') +

      // Bottom row: records table + alerts
      (bottomRowHtml ? '<section class="ig-charts-row">\n' + bottomRowHtml + '\n</section>\n' : '') +

      // Insights
      insightHtml +

      // Footer
      '<footer class="ig-footer">\n' +
      '  <span>Powered by iDash — AI Decision Intelligence Platform</span>\n' +
      '  <span>Generated ' + now.toLocaleString('th-TH') + '</span>\n' +
      '</footer>\n' +

      '</div>\n</body>\n</html>';

    return html;
  }

  // ── CSS builder (per-skin) ──────────────────────────────────────────
  function buildCSS(s) {
    return [
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      'body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: ' + s.bg + '; color: ' + s.textPrimary + '; min-height: 100vh; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
      '.ig-dashboard { max-width: 1440px; margin: 0 auto; padding: 18px 22px; }',

      // Header — slim strip like the references
      '.ig-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: ' + s.headerBg + '; border-radius: 12px; margin-bottom: 14px; border: ' + s.cardBorder + '; box-shadow: ' + s.cardShadow + '; }',
      '.ig-header-left { display: flex; align-items: center; gap: 12px; }',
      '.ig-logo { width: 40px; height: 40px; border-radius: 10px; background: ' + s.accentLight + '; display: flex; align-items: center; justify-content: center; color: ' + s.accent + '; flex-shrink: 0; }',
      '.ig-logo svg { width: 24px; height: 24px; }',
      '.ig-title { font-size: 19px; font-weight: 700; color: ' + s.textPrimary + '; }',
      '.ig-subtitle { font-size: 12px; color: ' + s.textSecondary + '; margin-top: 1px; }',
      '.ig-header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }',
      '.ig-date { font-size: 12px; color: ' + s.textSecondary + '; background: ' + s.accentLight + '; padding: 5px 12px; border-radius: 8px; white-space: nowrap; }',
      '.ig-badge { font-size: 11px; font-weight: 600; color: ' + s.accent + '; background: ' + s.accentLight + '; padding: 4px 10px; border-radius: 6px; white-space: nowrap; }',

      // KPI row — compact stat tiles: icon + label header, value, delta, sparkline
      '.ig-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 14px; }',
      '.ig-kpi-card { background: ' + s.cardBg + '; border: ' + s.cardBorder + '; border-radius: 12px; padding: 14px 16px 10px; box-shadow: ' + s.cardShadow + '; display: flex; flex-direction: column; }',
      '.ig-kpi-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }',
      '.ig-kpi-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.ig-kpi-icon svg { width: 19px; height: 19px; }',
      '.ig-kpi-meta { min-width: 0; }',
      '.ig-kpi-label { font-size: 11px; color: ' + s.textSecondary + '; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.ig-kpi-value { font-size: 21px; font-weight: 700; color: ' + s.textPrimary + '; line-height: 1.15; }',
      '.ig-kpi-delta { font-size: 11px; margin-bottom: 4px; }',
      '.ig-kpi-spark { margin-top: auto; }',

      // Charts grid
      '.ig-charts-row { display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px; margin-bottom: 14px; }',
      '.ig-chart-card { background: ' + s.cardBg + '; border: ' + s.cardBorder + '; border-radius: 12px; padding: 16px; box-shadow: ' + s.cardShadow + '; min-width: 0; }',
      '.ig-span-4 { grid-column: span 4; }',
      '.ig-span-6 { grid-column: span 6; }',
      '.ig-span-8 { grid-column: span 8; }',
      '.ig-span-full { grid-column: 1 / -1; }',
      '.ig-chart-title { font-size: 13.5px; font-weight: 600; color: ' + s.textPrimary + '; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }',
      '.ig-chart-body { width: 100%; }',
      '.ig-chart-body svg { width: 100%; height: auto; }',

      // Donut + HTML legend
      '.ig-donut-flex { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }',
      '.ig-donut-legend { flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 6px; }',
      '.ig-legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }',
      '.ig-legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }',
      '.ig-legend-name { color: ' + s.textSecondary + '; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.ig-legend-val { color: ' + s.textPrimary + '; font-weight: 600; white-space: nowrap; }',
      '.ig-legend-pct { color: ' + s.textMuted + '; font-size: 11px; width: 42px; text-align: right; flex-shrink: 0; }',

      // Detail row (3-up cards)
      '.ig-detail-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-bottom: 14px; }',

      // Ranked list
      '.ig-rank-row { display: flex; align-items: center; gap: 10px; padding: 7px 2px; border-bottom: 1px solid ' + s.gridLine + '; }',
      '.ig-rank-row:last-child { border-bottom: none; }',
      '.ig-rank-num { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0; }',
      '.ig-rank-name { font-size: 12px; color: ' + s.textSecondary + '; width: 110px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.ig-rank-bar-wrap { flex: 1; height: 7px; background: ' + s.gridLine + '; border-radius: 4px; overflow: hidden; }',
      '.ig-rank-bar { height: 100%; border-radius: 4px; }',
      '.ig-rank-val { font-size: 12px; font-weight: 600; color: ' + s.textPrimary + '; width: 72px; text-align: right; flex-shrink: 0; }',

      // Data table — zebra + tight cells
      '.ig-table { width: 100%; border-collapse: collapse; font-size: 12px; }',
      '.ig-table th { padding: 7px 10px; text-align: left; font-weight: 600; color: ' + s.textSecondary + '; white-space: nowrap; border-bottom: 2px solid ' + s.gridLine + '; }',
      '.ig-table td { padding: 7px 10px; color: ' + s.textPrimary + '; border-bottom: 1px solid ' + s.gridLine + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }',
      '.ig-table tbody tr:nth-child(even) { background: ' + (s.dark ? 'rgba(148,163,184,0.04)' : 'rgba(0,0,0,0.02)') + '; }',

      // Alert feed — colored icon badge + title/sub
      '.ig-alert-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 2px; border-bottom: 1px solid ' + s.gridLine + '; }',
      '.ig-alert-item:last-child { border-bottom: none; }',
      '.ig-alert-badge { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.ig-alert-badge svg { width: 16px; height: 16px; }',
      '.ig-alert-body { min-width: 0; }',
      '.ig-alert-title { font-size: 12px; font-weight: 600; color: ' + s.textPrimary + '; line-height: 1.35; }',
      '.ig-alert-sub { font-size: 11px; color: ' + s.textMuted + '; margin-top: 1px; }',

      // Insight
      '.ig-insight-line { font-size: 13px; color: ' + s.textSecondary + '; line-height: 1.6; padding: 3px 0; }',
      '.ig-insight-badge { font-size: 10px; font-weight: 600; color: ' + s.accent + '; background: ' + s.accentLight + '; padding: 2px 8px; border-radius: 4px; }',

      // Footer
      '.ig-footer { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid ' + s.gridLine + '; font-size: 11px; color: ' + s.textMuted + '; }',

      // Print
      '@media print { body { background: ' + (s.dark ? s.bg : '#fff') + ' !important; } .ig-dashboard { padding: 10px; } }',

      // Responsive (breakpoints tuned for iframe widths, not just device widths)
      '@media (max-width: 640px) { .ig-span-4, .ig-span-8 { grid-column: span 12; } .ig-span-6 { grid-column: span 12; } }',
      '@media (max-width: 480px) { .ig-charts-row { grid-template-columns: 1fr; } .ig-span-4, .ig-span-6, .ig-span-8, .ig-span-full { grid-column: span 1; } .ig-kpi-row { grid-template-columns: repeat(2, 1fr); } }',
      '@media (max-width: 360px) { .ig-kpi-row { grid-template-columns: 1fr; } .ig-header { flex-direction: column; align-items: flex-start; gap: 10px; } }'
    ].join('\n');
  }

  // ── Public API ──────────────────────────────────────────────────────

  function generate(spec, meta) {
    var domainId = (meta && meta.domainId) || 'generic_business';
    var skin = getSkin(domainId);
    var html = buildPage(spec, meta, skin);
    var domainName = (meta && meta.domainNameTH) || skin.name;
    return { html: html, title: resolveDashboardTitle(meta, domainName) };
  }

  window.iDashInfographic = {
    generate: generate,
    getSkin: getSkin,
    SKINS: SKINS,
    resolveDashboardTitle: resolveDashboardTitle
  };

})();
