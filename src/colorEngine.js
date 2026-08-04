/**
 * FLUXhub — Color Engine v2.0
 * Moteur OKLCH fidèle au système de surfaces Claude Design.
 * Calcule tous les tokens client depuis primary + secondary uniquement.
 */

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16)
  return [(n>>16)&255, (n>>8)&255, n&255]
}

function srgbToLinear(c) {
  const v = c/255
  return v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4)
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? c*12.92 : 1.055*Math.pow(c,1/2.4)-0.055
}

function rgbToXyz(r,g,b) {
  const rl=srgbToLinear(r), gl=srgbToLinear(g), bl=srgbToLinear(b)
  return [
    0.4124564*rl + 0.3575761*gl + 0.1804375*bl,
    0.2126729*rl + 0.7151522*gl + 0.0721750*bl,
    0.0193339*rl + 0.1191920*gl + 0.9503041*bl
  ]
}

function xyzToLab(x,y,z) {
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787*t + 16/116
  const xn=0.95047, yn=1.00000, zn=1.08883
  return [116*f(y/yn)-16, 500*(f(x/xn)-f(y/yn)), 200*(f(y/yn)-f(z/zn))]
}

function labToLch(L,a,b) {
  return [L, Math.sqrt(a*a+b*b), Math.atan2(b,a)]
}

function lchToLab(L,C,h) {
  return [L, C*Math.cos(h), C*Math.sin(h)]
}

function labToXyz(L,a,b) {
  const fy=(L+16)/116, fx=a/500+fy, fz=fy-b/200
  const xn=0.95047, yn=1.00000, zn=1.08883
  const x = fx>0.206897 ? Math.pow(fx,3) : (fx-16/116)/7.787
  const y = fy>0.206897 ? Math.pow(fy,3) : (fy-16/116)/7.787
  const z = fz>0.206897 ? Math.pow(fz,3) : (fz-16/116)/7.787
  return [x*xn, y*yn, z*zn]
}

function xyzToRgb(x,y,z) {
  const rl =  3.2404542*x - 1.5371385*y - 0.4985314*z
  const gl = -0.9692660*x + 1.8760108*y + 0.0415560*z
  const bl =  0.0556434*x - 0.2040259*y + 1.0572252*z
  return [
    Math.round(Math.min(255,Math.max(0, linearToSrgb(rl)*255))),
    Math.round(Math.min(255,Math.max(0, linearToSrgb(gl)*255))),
    Math.round(Math.min(255,Math.max(0, linearToSrgb(bl)*255)))
  ]
}

function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')
}

function hexToLch(hex) {
  const [r,g,b] = hexToRgb(hex)
  const [x,y,z] = rgbToXyz(r,g,b)
  const [L,a,bb] = xyzToLab(x,y,z)
  const [Lc,C,h] = labToLch(L,a,bb)
  // Normaliser L en 0-1
  return { L: Lc/100, C: C/100, h }
}

function lchToHex(L, C, h) {
  const Ln = L*100, Cn = C*100
  const [La,a,b] = lchToLab(Ln,Cn,h)
  const [x,y,z] = labToXyz(La,a,b)
  const [r,g,bb] = xyzToRgb(x,y,z)
  return rgbToHex(r,g,bb)
}

function relLum(hex) {
  const [r,g,b] = hexToRgb(hex).map(c => srgbToLinear(c))
  return 0.2126*r + 0.7152*g + 0.0722*b
}

function contrast(h1, h2) {
  const a = relLum(h1)+0.05, b = relLum(h2)+0.05
  return a > b ? a/b : b/a
}

function lerpHue(h, target, t) {
  let d = target - h
  while (d > Math.PI) d -= 2*Math.PI
  while (d < -Math.PI) d += 2*Math.PI
  return h + d*t
}

function inkOn(lch, bgHex, ratio) {
  let L = lch.L
  for (let i=0; i<80; i++) {
    const hex = lchToHex(L, lch.C, lch.h)
    if (contrast(hex, bgHex) >= ratio) return hex
    L -= 0.018
    if (L <= 0.12) return lchToHex(0.12, lch.C, lch.h)
  }
  return lchToHex(L, lch.C, lch.h)
}

export function computeTokens(primaryHex, secondaryHex) {
  const P = hexToLch(primaryHex)
  const S = hexToLch(secondaryHex || primaryHex)

  const WARM = 70 * Math.PI/180
  const nHue = lerpHue(P.h, WARM, 0.42)
  const N = (L, cap) => lchToHex(L, Math.min(P.C, cap), nHue)

  const primaryTint  = lchToHex(0.945, Math.min(P.C*0.5,  0.050), P.h)
  const primaryTint2 = lchToHex(0.968, Math.min(P.C*0.45, 0.038), P.h)
  const secTint      = lchToHex(0.945, Math.min(S.C*0.5,  0.055), S.h)
  const secSoft      = lchToHex(0.850, Math.min(S.C*0.55, 0.070), S.h)
  const secWash      = lchToHex(0.974, Math.min(S.C*0.40, 0.032), S.h)

  const primarySolid = inkOn(P, '#ffffff', 4.5)
  const secSolid     = inkOn(S, '#ffffff', 4.5)

  return {
    '--client-primary':            primaryHex,
    '--client-primary-dark':       lchToHex(Math.max(P.L-0.10, 0.20), P.C, P.h),
    '--client-primary-solid':      primarySolid,
    '--client-primary-ink':        inkOn(P, primaryTint, 4.5),
    '--client-primary-tint':       primaryTint,
    '--client-primary-tint-2':     primaryTint2,
    '--client-primary-contrast':   '#ffffff',
    '--client-secondary':          secondaryHex || primaryHex,
    '--client-secondary-dark':     lchToHex(Math.max(S.L-0.10, 0.20), S.C, S.h),
    '--client-secondary-solid':    secSolid,
    '--client-secondary-ink':      inkOn(S, secTint, 4.5),
    '--client-secondary-tint':     secTint,
    '--client-secondary-wash':     secWash,
    '--client-secondary-soft':     secSoft,
    '--client-secondary-contrast': '#ffffff',
    '--client-bg-base':   N(0.985, 0.011),
    '--client-bg-alt':    N(0.963, 0.017),
    '--client-surface':   N(0.996, 0.004),
    '--client-surface-2': N(0.988, 0.008),
    '--client-line':      N(0.918, 0.014),
    '--client-line-soft': N(0.945, 0.011),
    '--client-ink':       N(0.255, 0.020),
    '--client-ink-soft':  N(0.460, 0.022),
    '--client-ink-mute':  N(0.630, 0.020),
    '--client-ink-faint': N(0.800, 0.016),
    // Compat legacy
    '--client-primary-light':       primaryTint,
    '--client-secondary-light':     secWash,
    '--client-tint':                primaryTint,
  }
}
