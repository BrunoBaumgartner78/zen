// src/lib/sound.ts
// Leichtgewichtige Sound-Engine auf Basis von <audio>, entsperrt beim 1. User-Klick.
// Methoden: start, setMasterVolume, setChimeInterval, applyWinter, applyTheme,
// clickUi, playRake, playDrop, mute

type Bank = Record<string, HTMLAudioElement>;

export function createSound(urls: {
  wind: string
  birds: string
  chimes: string
  water: string
  crickets: string
  winterWind: string
  snowChimes: string
  rake: string
  gravel: string
  bamboo: string
  click: string
}) {
  const bank: Bank = {};
  const oneShots: Bank = {};
  let started = false;
  let master = 0.8;
  let muted = false;
  let chimeTimer: any = null;
  let chimeIntervalSec = 12;

  const mk = (src: string, loop=false) => {
    const a = new Audio(src);
    a.loop = loop;
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    a.volume = loop ? master * 0.5 : Math.min(1, master);
    return a;
  };

  function ensure() {
    if (!bank['wind']) {
      // Ambience
      bank['wind']       = mk(urls.wind, true);
      bank['birds']      = mk(urls.birds, true);
      bank['water']      = mk(urls.water, true);
      bank['crickets']   = mk(urls.crickets, true);
      bank['winterWind'] = mk(urls.winterWind, true);
      // Periodic
      bank['chimes']     = mk(urls.chimes, false);
      bank['snowChimes'] = mk(urls.snowChimes, false);
      // One-shots
      oneShots['rake']   = mk(urls.rake, false);
      oneShots['gravel'] = mk(urls.gravel, false);
      oneShots['bamboo'] = mk(urls.bamboo, false);
      oneShots['click']  = mk(urls.click, false);
    }
  }

  function playLoop(names: string[]) {
    Object.entries(bank).forEach(([k,a]) => {
      if (!names.includes(k)) a.pause();
    });
    names.forEach(n => {
      const a = bank[n];
      if (!a) return;
      a.currentTime = a.loop ? a.currentTime : 0;
      // nur starten wenn bereits entsperrt
      if (started && !muted) a.play().catch(() => {});
    });
  }

  function scheduleChimes(kind: 'summer'|'winter') {
    if (chimeTimer) clearInterval(chimeTimer);
    chimeTimer = setInterval(() => {
      if (muted) return;
      const a = bank[kind === 'winter' ? 'snowChimes' : 'chimes'];
      if (!a) return;
      a.currentTime = 0;
      a.volume = master * 0.7;
      a.play().catch(() => {});
    }, Math.max(4, chimeIntervalSec) * 1000);
  }

  return {
    async start() {
      if (started) return;
      ensure();
      // einmaliges Anspielen schaltet iOS/Chrome Audio frei
      try {
        for (const k of ['wind','birds','water','crickets','winterWind']) {
          bank[k].muted = true;
          await bank[k].play();
          bank[k].pause();
          bank[k].muted = false;
        }
      } catch {}
      started = true;
    },

    setMasterVolume(v: number) {
      master = Math.max(0, Math.min(1, v));
      Object.values(bank).forEach(a => {
        a.volume = a.loop ? master * 0.5 : Math.min(1, master);
      });
      Object.values(oneShots).forEach(a => (a.volume = Math.min(1, master)));
    },

    setChimeInterval(seconds: number) {
      chimeIntervalSec = seconds;
    },

    applyTheme(theme: 'morning'|'day'|'dusk'|'night') {
      ensure();
      // simple themenlogik
      if (theme === 'night') {
        playLoop(['water','crickets']);
      } else if (theme === 'dusk') {
        playLoop(['wind','water']);
      } else if (theme === 'morning') {
        playLoop(['wind','birds']);
      } else {
        playLoop(['wind','birds','water']);
      }
      scheduleChimes('summer');
    },

    applyWinter(on: boolean) {
      ensure();
      if (on) {
        playLoop(['winterWind']);
        scheduleChimes('winter');
      } else {
        this.applyTheme('day');
      }
    },

    clickUi() {
      const a = oneShots['click']; if (!a) return;
      a.currentTime = 0; a.volume = Math.min(1, master); if (!muted) a.play().catch(()=>{});
    },

    playRake() {
      const a = oneShots['rake']; if (!a) return;
      a.currentTime = 0; a.volume = Math.min(1, master*0.9); if (!muted) a.play().catch(()=>{});
    },

    playDrop() {
      const a = oneShots['gravel'] || oneShots['bamboo']; if (!a) return;
      a.currentTime = 0; a.volume = Math.min(1, master*0.8); if (!muted) a.play().catch(()=>{});
    },

    mute(m: boolean) {
      muted = m;
      const actives = Object.values(bank);
      actives.forEach(a => (a.muted = muted));
      if (!muted) {
        actives.forEach(a => { if (a.loop) a.play().catch(()=>{}); });
      }
    },
  };
}
