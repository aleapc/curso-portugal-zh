<script lang="ts">
  import { curso } from '$lib/curso.config';
  import { onMount, onDestroy } from 'svelte';
  import type { Episode, Step } from '$lib/types';
  import { markDone } from '$lib/state.svelte';
  import { pararAudio, tocarClipe, urlDoClipe } from '$lib/audio';
  import GestoRitmo from '$lib/components/GestoRitmo.svelte';

  let { episodio }: { episodio: Episode } = $props();
  const steps = episodio.steps;
  const total = steps.length;

  type Fase = 'parado' | 'tocando' | 'pausa' | 'aguardando' | 'fim';

  let index = $state(0);
  let fase = $state<Fase>('parado');
  let mostrarEs = $state(false);
  let gravando = $state(false);
  let recUrl = $state<string | null>(null);
  let micErro = $state(false);
  let erroAudio = $state(false);

  // Modo: estudo (controle passo a passo) ou carro (áudio-livro contínuo, mãos livres)
  let modo = $state<'estudo' | 'carro'>(
    typeof localStorage !== 'undefined' && localStorage.getItem(`${curso.sku}:modo`) === 'carro'
      ? 'carro'
      : 'estudo'
  );
  function setModo(m: 'estudo' | 'carro') {
    modo = m;
    if (typeof localStorage !== 'undefined') localStorage.setItem(`${curso.sku}:modo`, m);
  }

  // Velocidade da pausa pra responder (persistida)
  const velocidades = [
    { nome: '短', f: 0.7 },
    { nome: '中', f: 1 },
    { nome: '长', f: 1.5 }
  ];
  let fator = $state(
    typeof localStorage !== 'undefined' ? Number(localStorage.getItem(`${curso.sku}:pausa`)) || 1 : 1
  );
  function setFator(f: number) {
    fator = f;
    if (typeof localStorage !== 'undefined') localStorage.setItem(`${curso.sku}:pausa`, String(f));
  }

  const step = $derived(steps[index]);
  const ehPt = $derived(step?.tipo === 'intro' || step?.tipo === 'recap');

  let token = 0;
  let cancelCurrent: (() => void) | null = null;

  const src = urlDoClipe;

  // O elemento é COMPARTILHADO ($lib/audio.ts) — o player não tem mais um
  // `<audio>` próprio. Quem cancela é o pararAudio(), que resolve o clipe em voo
  // como 'cancelado'; a fila do run() continua sendo controlada pelo `token`.
  function playClip(key?: string): Promise<void> {
    if (!key) return Promise.resolve();
    cancelCurrent = pararAudio;
    return tocarClipe(key).then((r) => {
      if (r === 'erro') erroAudio = true;
    });
  }

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      cancelCurrent = () => {
        clearTimeout(t);
        resolve();
      };
    });
  }

  function halt() {
    token++;
    const c = cancelCurrent;
    cancelCurrent = null;
    if (c) c();
    // Elemento compartilhado: garante silêncio mesmo saindo durante uma pausa,
    // quando o cancelCurrent da vez era o clearTimeout do wait().
    pararAudio();
    vozAudio?.pause();
    void stopRec();
  }

  function pausaMs(s: Step) {
    const txt = s.es || '';
    return Math.max(2600, txt.length * 130 + 1400) * fator;
  }

  function setPlaybackState(s: 'playing' | 'paused' | 'none') {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = s;
    }
  }

  async function run(from: number) {
    halt();
    const my = token;
    erroAudio = false; // reset por AÇÃO do usuário, não por clipe (o banner persiste)
    setPlaybackState('playing');
    for (let i = from; i < steps.length; i++) {
      if (my !== token) return;
      index = i;
      const s = steps[i];
      mostrarEs = false;

      if (s.tipo === 'responde') {
        fase = 'tocando';
        await playClip(s.promptAudioKey);
        if (my !== token) return;
        fase = 'pausa';
        if (recUrl) URL.revokeObjectURL(recUrl);
        recUrl = null;
        // Captura o flag: se desmarcar "gravar" durante a pausa, o recorder já
        // iniciado ainda recebe stop() (antes ficava gravando pra sempre).
        const rec = gravando;
        if (rec) {
          await startRec();
          // Se pausou/navegou ENQUANTO o getUserMedia estava em voo (prompt de
          // permissão aberto), o recorder pode ter iniciado depois do halt() —
          // parar aqui, senão ficava gravando com a UI em "parado".
          if (my !== token) {
            void stopRec();
            return;
          }
        }
        await wait(pausaMs(s));
        if (my !== token) return;
        if (rec) await stopRec();
        if (modo === 'carro') {
          mostrarEs = true;
          fase = 'tocando';
          await playClip(s.audioKey);
        } else {
          // modo estudo: espera o usuário (ouvir resposta / próximo)
          fase = 'aguardando';
          setPlaybackState('paused');
          return;
        }
      } else if (s.tipo === 'shadow') {
        fase = 'tocando';
        await playClip(s.audioKey);
        if (my !== token) return;
        fase = 'pausa';
        await wait(pausaMs(s));
      } else {
        if (s.tipo === 'ouvir') mostrarEs = true;
        fase = 'tocando';
        await playClip(s.audioKey);
      }

      if (my !== token) return;
      await wait(350);
      if (my !== token) return;
    }
    fase = 'fim';
    setPlaybackState('none');
    markDone(episodio.id);
  }

  // Modo estudo: tocar a resposta nativa sob demanda, sem avançar.
  async function ouvirResposta() {
    halt();
    const my = token;
    erroAudio = false;
    mostrarEs = true;
    fase = 'tocando';
    setPlaybackState('playing');
    await playClip(steps[index].audioKey);
    if (my !== token) return;
    fase = 'aguardando';
    setPlaybackState('paused');
  }

  function comecar() {
    run(index);
  }
  function pausar() {
    halt();
    fase = 'parado';
    setPlaybackState('paused');
  }
  function repetir() {
    run(index);
  }
  function proximo() {
    if (index < total - 1) run(index + 1);
    else {
      halt(); // sem isto, ⏭ no último passo deixava o áudio tocando sob o "✅ concluída"
      fase = 'fim';
      setPlaybackState('none');
      markDone(episodio.id);
    }
  }
  function anterior() {
    run(Math.max(0, index - 1));
  }
  function reiniciar() {
    run(0);
  }

  // Botão central depende da fase
  function botaoCentral() {
    if (fase === 'tocando' || fase === 'pausa') pausar();
    else if (fase === 'aguardando') ouvirResposta();
    else if (fase === 'fim') reiniciar();
    else comecar();
  }

  // --- gravação opcional (comparar a sua voz) ---
  let mediaStream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];
  let vozAudio: HTMLAudioElement | null = null;
  let destruido = false;

  async function startRec() {
    try {
      if (!mediaStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Durante o await (prompt de permissão!) o usuário pode ter desmarcado
        // "gravar" ou saído da página — soltar o stream na hora, senão o mic
        // ficava aberto (indicador laranja) sem dono.
        if (!gravando || destruido) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStream = stream;
      }
      micErro = false;
      chunks = [];
      recorder = new MediaRecorder(mediaStream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.start();
    } catch {
      gravando = false;
      micErro = true; // antes o checkbox se desmarcava sozinho, sem explicação
    }
  }
  function stopRec(): Promise<void> {
    return new Promise((resolve) => {
      if (!recorder || recorder.state === 'inactive') return resolve();
      const r = recorder;
      r.onstop = () => {
        // Componente destruído ou recorder já substituído: NÃO criar blob URL
        // (vazaria) nem ressuscitar um take antigo por cima do recUrl atual.
        if (destruido || r !== recorder) return resolve();
        if (recUrl) URL.revokeObjectURL(recUrl);
        recUrl = URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' }));
        resolve();
      };
      r.stop();
    });
  }
  // Libera o microfone de verdade (o indicador laranja do iPhone apagava só
  // ao fechar o app — getUserMedia sem track.stop() em lugar nenhum).
  function releaseMic() {
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        /* já parado */
      }
    }
    recorder = null;
    mediaStream?.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  function ouvirVoce() {
    if (!recUrl) return;
    pararAudio(); // a sua gravação toca sozinha, nunca por cima do nativo
    // Reusa uma instância (antes cada clique empilhava uma reprodução nova).
    if (!vozAudio) vozAudio = new Audio();
    vozAudio.pause();
    vozAudio.src = recUrl;
    vozAudio.currentTime = 0;
    vozAudio.play().catch(() => {});
  }

  // --- baixar a parte pra ouvir offline ---
  // No iOS o <audio> pede os mp3 com Range (206), que NÃO popula o cache.
  // Este botão baixa os clipes com fetch normal (200) direto pro cache do SW.
  let baixando = $state(false);
  let baixado = $state(false);
  let baixaProg = $state(0);
  const clipKeys = [
    ...new Set(
      steps.flatMap((s) => [s.audioKey, s.promptAudioKey]).filter((k): k is string => !!k)
    )
  ];
  async function baixarParte() {
    if (baixando || typeof caches === 'undefined') return;
    baixando = true;
    baixaProg = 0;
    let falhas = 0;
    try {
      const cache = await caches.open('audio-clips');
      for (const k of clipKeys) {
        const url = src(k);
        try {
          if (!(await cache.match(url))) {
            const r = await fetch(url);
            if (r.ok) await cache.put(url, r);
            else falhas++;
          }
        } catch {
          falhas++;
        }
        baixaProg++;
      }
      baixado = falhas === 0;
      if (falhas > 0) erroAudio = true;
    } catch {
      erroAudio = true;
    } finally {
      baixando = false;
    }
  }

  const vozNome: Record<string, string> = {
    Bia: 'Bia',
    Eduardo: 'Eduardo',
    Nan: 'Nan',
    Ploy: 'Ploy'
  };
  const acao: Record<string, string> = {
    ouvir: '听',
    responde: '轮到你',
    shadow: '跟他们一起说'
  };
  function badge(s?: Step): string {
    if (!s) return '';
    if (s.tipo === 'intro' || s.tipo === 'recap') return vozNome[s.voz ?? ''] ?? '向导';
    return acao[s.tipo] ?? '';
  }

  onMount(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${episodio.titulo} (Ep. ${episodio.numero}${episodio.parte ? ' · ' + episodio.parte : ''})`,
          artist: 'Diga! Portuguese',
          album: 'Diga! Portuguese'
        });
        navigator.mediaSession.setActionHandler('play', () => botaoCentral());
        navigator.mediaSession.setActionHandler('pause', () => pausar());
        navigator.mediaSession.setActionHandler('nexttrack', () => proximo());
        navigator.mediaSession.setActionHandler('previoustrack', () => anterior());
      } catch {
        /* MediaSession parcial em alguns navegadores */
      }
    }
  });

  onDestroy(() => {
    // Ordem importa: destruido primeiro (bloqueia onstop tardio de criar blob
    // URL órfão), releaseMic antes do halt (o stopRec do halt vira no-op).
    destruido = true;
    releaseMic();
    halt();
    if (recUrl) URL.revokeObjectURL(recUrl);
    vozAudio?.pause();
    vozAudio = null;
    setPlaybackState('none');
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
      } catch {
        /* ok */
      }
    }
  });
</script>

<!-- Seletor de modo -->
<div class="mb-3 flex items-center justify-center gap-1 rounded-full bg-black/5 p-1 text-sm">
  <button
    type="button"
    onclick={() => setModo('estudo')}
    aria-pressed={modo === 'estudo'}
    class="flex-1 rounded-full px-3 py-1.5 font-medium transition {modo === 'estudo'
      ? 'bg-white shadow text-terracota'
      : 'text-carvao/60'}"
  >
    📚 学习
  </button>
  <button
    type="button"
    onclick={() => setModo('carro')}
    aria-pressed={modo === 'carro'}
    class="flex-1 rounded-full px-3 py-1.5 font-medium transition {modo === 'carro'
      ? 'bg-white shadow text-terracota'
      : 'text-carvao/60'}"
  >
    🚗 车上
  </button>
</div>

<div class="flex items-center justify-between text-sm">
  <span class="font-semibold text-oceano">
    第 {episodio.numero} 集{episodio.parte ? ` · ${episodio.parte}` : ''}
  </span>
  <span class="text-carvao/50">{index + 1} / {total}</span>
</div>
<div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
  <div class="h-full bg-terracota transition-all" style="width: {((index + 1) / total) * 100}%"></div>
</div>

<!-- Palco do passo atual -->
<div class="card mt-4 flex min-h-[220px] flex-col items-center justify-center gap-3 p-5 text-center">
  <span
    class="pill {step?.tipo === 'responde' || step?.tipo === 'shadow'
      ? 'bg-terracota/15 text-terracota'
      : ehPt
        ? 'bg-sol/30 text-carvao/70'
        : 'bg-oceano/15 text-oceano'}"
  >
    {badge(step)}
  </span>

  {#if fase === 'pausa' && step?.tipo === 'responde'}
    <p class="text-lg font-medium text-carvao/80">{step.promptPt}</p>
    <p class="text-2xl font-extrabold text-terracota">🎤 现在说！</p>
    {#key index}
      <div class="h-2 w-40 overflow-hidden rounded-full bg-black/10">
        <div class="barra h-full bg-terracota" style="animation-duration: {pausaMs(step)}ms"></div>
      </div>
    {/key}
  {:else if fase === 'aguardando' && step?.tipo === 'responde'}
    <p class="text-lg font-medium text-carvao/80">{step.promptPt}</p>
    {#if mostrarEs}
      <p class="text-3xl font-extrabold">{step.es}</p>
      {#if step.pinyin}<p class="text-lg font-medium text-oceano">{step.pinyin}</p>{/if}
      <p class="text-carvao/55">{step.pt}</p>
    {:else}
      <p class="text-sm text-carvao/50">说完了吗？听母语版本，或者继续下一步。</p>
    {/if}
    {#if recUrl}
      <button class="btn bg-oceano text-white text-sm" onclick={ouvirVoce}>▶ 听你自己</button>
    {/if}
  {:else if fase === 'pausa' && step?.tipo === 'shadow'}
    <p class="text-2xl font-extrabold text-terracota">🗣️ 跟他们一起说！</p>
    <p class="text-sm text-carvao/50">试着不看文字</p>
  {:else if ehPt}
    <p class="text-lg leading-relaxed text-carvao/90">{step?.pt}</p>
  {:else}
    {#if mostrarEs}
      <p class="text-3xl font-extrabold">{step?.es}</p>
      {#if step?.pinyin}<p class="text-lg font-medium text-oceano">{step.pinyin}</p>{/if}
    {:else}
      <p class="text-2xl font-extrabold tracking-widest text-carvao/30">· · ·</p>
    {/if}
    <p class="text-carvao/55">{step?.pt}</p>
  {/if}

  {#if step?.mapaGestos}
    <div class="flex flex-wrap items-start justify-center gap-x-5 gap-y-2">
      {#each [1, 2, 3, 4] as n}
        <GestoRitmo gesto={n as 1 | 2 | 3 | 4} rotulo tamanho="p" />
      {/each}
    </div>
  {:else if step?.gesto}
    <GestoRitmo gesto={step.gesto} />
  {/if}

  {#if !ehPt && !mostrarEs && fase !== 'pausa'}
    <button class="-m-2 p-3 text-xs text-oceano underline" onclick={() => (mostrarEs = true)}
      >显示文字</button
    >
  {/if}

  {#if erroAudio}
    <p role="status" class="text-xs font-medium text-terracota">
      ⚠️ 音频不可用——请检查网络（或出发前使用"离线保存"）。
    </p>
  {/if}
</div>

<!-- Controles -->
<div class="mt-4 flex items-center justify-center gap-3">
  <button
    class="btn bg-white text-lg ring-1 ring-black/10"
    onclick={anterior}
    aria-label="上一步">⏮</button
  >

  {#if fase === 'aguardando'}
    <button class="btn-primary px-6 py-3" onclick={ouvirResposta}>▶ 听答案</button>
    <button class="btn bg-salvia px-6 py-3 text-white" onclick={proximo}>⏭ 下一步</button>
  {:else}
    <button class="btn-primary px-8 py-3 text-lg" onclick={botaoCentral}>
      {#if fase === 'parado'}{index === 0 ? '▶ 开始' : '▶ 继续'}
      {:else if fase === 'fim'}↺ 再一次
      {:else}⏸ 暂停{/if}
    </button>
  {/if}

  <button
    class="btn bg-white text-lg ring-1 ring-black/10"
    onclick={proximo}
    aria-label="下一步">⏭</button
  >
</div>

<div class="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm">
  <button class="-my-2 px-2 py-3 text-oceano" onclick={repetir}>⟲ 重复本步</button>
  <label class="flex cursor-pointer items-center gap-1 py-2 text-carvao/60">
    <input
      type="checkbox"
      bind:checked={gravando}
      onchange={() => {
        if (!gravando) releaseMic();
      }}
    />
    🎙️ 录我的声音
  </label>
</div>
{#if micErro}
  <p role="status" class="mt-1 text-center text-xs text-terracota">
    ⚠️ 无法访问麦克风——请在 iPhone 设置 › Diga! › 麦克风 中授权。
  </p>
{/if}

<div class="mt-2 flex items-center justify-center gap-2 text-xs text-carvao/70">
  <span>发言停顿：</span>
  {#each velocidades as v}
    <button
      type="button"
      onclick={() => setFator(v.f)}
      aria-pressed={fator === v.f}
      class="relative rounded-full px-3 py-1.5 before:absolute before:-inset-x-1 before:-inset-y-2.5 before:content-[''] {fator ===
      v.f
        ? 'bg-oceano text-white'
        : 'ring-1 ring-black/10'}"
    >
      {v.nome}
    </button>
  {/each}
</div>

<div class="mt-3 flex justify-center">
  <button
    type="button"
    class="text-xs text-carvao/60 underline disabled:opacity-50"
    onclick={baixarParte}
    disabled={baixando || baixado}
  >
    {#if baixando}⬇ 下载中…… {baixaProg}/{clipKeys.length}
    {:else if baixado}✅ 已保存供离线使用
    {:else}⬇ 保存本部分供离线使用{/if}
  </button>
</div>

{#if modo === 'carro'}
  <p class="mt-3 text-center text-xs text-carvao/45">
    🚗 车上模式：自动连续播放。使用方向盘按键或锁屏来播放、暂停和跳过。
  </p>
{/if}

{#if fase === 'fim'}
  <p class="mt-5 text-center text-lg font-semibold text-salvia">✅ 本部分完成！</p>
{/if}

<style>
  @keyframes encolher {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
  .barra {
    animation-name: encolher;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
</style>
