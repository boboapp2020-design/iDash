/**
 * iDash Style Family library — the THIRD axis, orthogonal to template
 * (structure) and theme (accent hue): the deep "skin" (surface color,
 * radius, shadow, border, type). Grounded directly in the design-token
 * patterns from the user-supplied dashboard-design-brain skill
 * (references/style-library.md) — every family below maps 1:1 to one of
 * that library's named entries, not an invented look.
 *
 * Deterministic selection (P5: no random design choices) — one family per
 * domain pack, matching the skill's own "Picking logic" heuristic (§Family
 * picking): regulated/money → restraint; monitoring/all-day screens → dark
 * ops; consumer/energetic → gradient/bento; humane/people → warm paper.
 * The user's existing accent-color picker (theme_palette.js) stays a
 * SEPARATE choice layered on top — it only tints --primary; it no longer
 * decides light/dark, since the family now owns the full surface (bg, card,
 * border, radius, shadow, font). This mirrors the skill's own design: each
 * style bundles a complete token set, accent is "one brand hue" within it.
 *
 * Browser-compatible, no build step. Attaches window.iDashStyleLibrary.
 */
(function () {
  'use strict';

  var FAMILIES = {
    // A2 Soft Neutral — shadcn-era calm product UI. Safe default for the
    // generic/"executive" module where no stronger industry signal exists.
    soft_neutral: {
      id: 'soft_neutral',
      name: 'Soft Neutral',
      description: 'โทนสงบ โมเดิร์น เหมาะกับภาพรวมทั่วไป',
      dark: false,
      tokens: {
        bg: '#F8F9FB', cardBg: '#FFFFFF', sidebarBg: '#FFFFFF',
        text: '#0f172a', textSecondary: '#475569', textMuted: '#94a3b8',
        border: '#e5e9f0',
        radius: '12px', radiusSm: '8px', radiusLg: '18px',
        shadowSm: '0 1px 2px rgba(15,23,42,.05)',
        shadow: '0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)',
        shadowMd: '0 4px 6px -1px rgba(15,23,42,.06), 0 2px 4px -2px rgba(15,23,42,.04)',
        shadowLg: '0 10px 15px -3px rgba(15,23,42,.08), 0 4px 6px -4px rgba(15,23,42,.04)',
        font: "'Inter', 'Noto Sans Thai', system-ui, -apple-system, sans-serif"
      }
    },

    // B2 Terminal / Ops Console — mission control for all-day monitoring
    // screens (manufacturing floor displays).
    ops_console: {
      id: 'ops_console',
      name: 'Ops Console',
      description: 'ห้องควบคุมโทนมืด ตัวเลขโมโนสเปซ เหมาะกับจอเฝ้าระวังทั้งวัน',
      dark: true,
      tokens: {
        bg: '#0A0E14', cardBg: '#111826', sidebarBg: '#0A0E14',
        text: '#EAECEF', textSecondary: '#9aa5b8', textMuted: '#5b6577',
        border: '#1c2634',
        radius: '6px', radiusSm: '4px', radiusLg: '10px',
        shadowSm: '0 1px 2px rgba(0,0,0,.45)',
        shadow: '0 1px 3px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.4)',
        shadowMd: '0 4px 6px -1px rgba(0,0,0,.55), 0 2px 4px -2px rgba(0,0,0,.4)',
        shadowLg: '0 10px 15px -3px rgba(0,0,0,.6), 0 4px 6px -4px rgba(0,0,0,.45)',
        font: "'JetBrains Mono', 'Noto Sans Thai', ui-monospace, monospace",
        mono: true
      }
    },

    // E1 Fintech Trust — regulated/money → restraint = trust.
    fintech_trust: {
      id: 'fintech_trust',
      name: 'Fintech Trust',
      description: 'โทนน้ำเงินเข้มหรูหรา น่าเชื่อถือ เหมาะกับข้อมูลการเงิน',
      dark: false,
      tokens: {
        bg: '#F7F9FC', cardBg: '#FFFFFF', sidebarBg: '#0A2540',
        text: '#0A2540', textSecondary: '#3b5876', textMuted: '#8a9bb0',
        border: '#dde5ef',
        radius: '10px', radiusSm: '7px', radiusLg: '16px',
        shadowSm: '0 1px 2px rgba(10,37,64,.05)',
        shadow: '0 1px 3px rgba(10,37,64,.07), 0 1px 2px rgba(10,37,64,.04)',
        shadowMd: '0 4px 6px -1px rgba(10,37,64,.08), 0 2px 4px -2px rgba(10,37,64,.05)',
        shadowLg: '0 10px 15px -3px rgba(10,37,64,.1), 0 4px 6px -4px rgba(10,37,64,.05)',
        font: "'Inter', 'Noto Sans Thai', system-ui, -apple-system, sans-serif"
      }
    },

    // D1 Bento Grid — modular tiles, operational tracking (warehouse ops).
    bento: {
      id: 'bento',
      name: 'Bento Grid',
      description: 'การ์ดโมดูลาร์ ขอบมนใหญ่ ให้ความรู้สึกทันสมัยเป็นระเบียบ',
      dark: false,
      tokens: {
        bg: '#F5F6F8', cardBg: '#FFFFFF', sidebarBg: '#FFFFFF',
        text: '#18181b', textSecondary: '#52525b', textMuted: '#a1a1aa',
        border: '#e4e4e7',
        radius: '18px', radiusSm: '12px', radiusLg: '24px',
        shadowSm: '0 1px 2px rgba(0,0,0,.04)',
        shadow: '0 2px 4px rgba(0,0,0,.05)',
        shadowMd: '0 6px 10px -2px rgba(0,0,0,.06), 0 3px 5px -3px rgba(0,0,0,.04)',
        shadowLg: '0 14px 20px -4px rgba(0,0,0,.08), 0 5px 8px -5px rgba(0,0,0,.04)',
        font: "'Inter', 'Noto Sans Thai', system-ui, -apple-system, sans-serif"
      }
    },

    // A3 Warm Paper — humane, approachable (people/HR).
    warm_paper: {
      id: 'warm_paper',
      name: 'Warm Paper',
      description: 'โทนอบอุ่น กระดาษครีม เหมาะกับข้อมูลคน/องค์กร',
      dark: false,
      tokens: {
        bg: '#FBF8F3', cardBg: '#FFFFFF', sidebarBg: '#FFFFFF',
        text: '#292524', textSecondary: '#6b5f56', textMuted: '#a89d92',
        border: '#eee6da',
        radius: '14px', radiusSm: '9px', radiusLg: '20px',
        shadowSm: '0 1px 2px rgba(41,37,36,.05)',
        shadow: '0 1px 3px rgba(41,37,36,.06), 0 1px 2px rgba(41,37,36,.04)',
        shadowMd: '0 4px 6px -1px rgba(41,37,36,.07), 0 2px 4px -2px rgba(41,37,36,.04)',
        shadowLg: '0 10px 15px -3px rgba(41,37,36,.08), 0 4px 6px -4px rgba(41,37,36,.04)',
        font: "'Source Serif 4', 'Noto Serif Thai', Georgia, serif",
        headingSerif: true
      }
    },

    // C4 Aurora / Gradient Mesh — modern SaaS, energetic (sales/CRM).
    aurora: {
      id: 'aurora',
      name: 'Aurora',
      description: 'พื้นหลังไล่เฉดนุ่มนวล การ์ดสะอาด ให้ความรู้สึกทันสมัยมีพลัง',
      dark: false,
      tokens: {
        bg: '#FCFAFF', cardBg: '#FFFFFF', sidebarBg: '#FFFFFF',
        text: '#1e1b2e', textSecondary: '#5b5470', textMuted: '#a39cb5',
        border: '#ebe5f7',
        radius: '16px', radiusSm: '11px', radiusLg: '22px',
        shadowSm: '0 1px 2px rgba(79,70,229,.05)',
        shadow: '0 1px 3px rgba(79,70,229,.08), 0 1px 2px rgba(79,70,229,.04)',
        shadowMd: '0 4px 6px -1px rgba(79,70,229,.09), 0 2px 4px -2px rgba(79,70,229,.05)',
        shadowLg: '0 10px 15px -3px rgba(79,70,229,.1), 0 4px 6px -4px rgba(79,70,229,.05)',
        font: "'Inter', 'Noto Sans Thai', system-ui, -apple-system, sans-serif",
        auroraBg: true
      }
    },

    // D3 Raw Schematic — control-panel honesty, systems monitoring
    // (logistics/transport flows).
    raw_schematic: {
      id: 'raw_schematic',
      name: 'Raw Schematic',
      description: 'โทนขาวเข้ม เส้นกริดชัด ให้ความรู้สึกระบบ/แผนภาพควบคุม',
      dark: false,
      tokens: {
        bg: '#FFFFFF', cardBg: '#FFFFFF', sidebarBg: '#FFFFFF',
        text: '#111111', textSecondary: '#444444', textMuted: '#8a8a8a',
        border: '#d9d9d9',
        radius: '4px', radiusSm: '2px', radiusLg: '8px',
        shadowSm: 'none',
        shadow: '0 0 0 1px #eeeeee',
        shadowMd: '0 0 0 1px #e2e2e2',
        shadowLg: '0 4px 10px rgba(0,0,0,.08)',
        font: "'IBM Plex Mono', 'Noto Sans Thai', ui-monospace, monospace",
        mono: true,
        schematicBorder: true
      }
    },

    // B1 Slate Pro — professional dark, heavy-industry ops (sugar factory).
    slate_pro: {
      id: 'slate_pro',
      name: 'Slate Pro',
      description: 'มืดมืออาชีพ สบายตา เหมาะกับสายการผลิต/โรงงาน',
      dark: true,
      tokens: {
        bg: '#0F172A', cardBg: '#1E293B', sidebarBg: '#0F172A',
        text: '#F1F5F9', textSecondary: '#94A3B8', textMuted: '#64748b',
        border: '#334155',
        radius: '12px', radiusSm: '8px', radiusLg: '18px',
        shadowSm: '0 1px 2px rgba(0,0,0,.4)',
        shadow: '0 1px 3px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.35)',
        shadowMd: '0 4px 6px -1px rgba(0,0,0,.5), 0 2px 4px -2px rgba(0,0,0,.4)',
        shadowLg: '0 10px 15px -3px rgba(0,0,0,.55), 0 4px 6px -4px rgba(0,0,0,.4)',
        font: "'Inter', 'Noto Sans Thai', system-ui, -apple-system, sans-serif"
      }
    }
  };

  // One family per domain pack — deterministic, matches the skill's own
  // industry presets (§3 Business-domain presets / §Picking logic).
  var DOMAIN_STYLE_MAP = {
    generic_business: 'soft_neutral',
    manufacturing: 'ops_console',
    finance_accounting: 'fintech_trust',
    inventory_warehouse: 'bento',
    hr_people: 'warm_paper',
    sales_crm: 'aurora',
    logistics_transport: 'raw_schematic',
    sugar_factory: 'slate_pro'
  };

  function getFamilyForDomain(domainId) {
    var key = DOMAIN_STYLE_MAP[domainId] || 'soft_neutral';
    return FAMILIES[key];
  }

  window.iDashStyleLibrary = {
    FAMILIES: FAMILIES,
    DOMAIN_STYLE_MAP: DOMAIN_STYLE_MAP,
    getFamilyForDomain: getFamilyForDomain
  };
})();
