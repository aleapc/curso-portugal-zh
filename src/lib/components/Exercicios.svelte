<script lang="ts">
  import type { Exercise } from '$lib/types';
  import { playKey, recognizeOnce, recognitionSupported, normalize } from '$lib/speech';

  let { exercicios }: { exercicios: Exercise[] } = $props();

  // Respostas e acertos por índice de exercício.
  let escolhas = $state<Record<number, number | null>>({});
  let preenche = $state<Record<number, string>>({});
  let pares = $state<Record<number, Record<number, number | null>>>({});
  let falaResultado = $state<Record<number, { ok: boolean; ouvido: string } | null>>({});
  let revelado = $state<Record<number, boolean>>({});

  function marcar(i: number, op: number) {
    escolhas[i] = op;
    revelado[i] = true;
  }

  function conferirPreencher(i: number) {
    revelado[i] = true;
  }

  function preencherOk(ex: Extract<Exercise, { tipo: 'preencher' }>, i: number): boolean {
    return normalize(preenche[i] ?? '') === normalize(ex.resposta);
  }

  async function ouvirFalar(ex: Extract<Exercise, { tipo: 'falar' }>, i: number) {
    falaResultado[i] = null;
    try {
      const ouvido = await recognizeOnce('es-MX');
      const ok = normalize(ouvido).includes(normalize(ex.alvo));
      falaResultado[i] = { ok, ouvido };
    } catch {
      falaResultado[i] = { ok: false, ouvido: '（没能听到——请检查麦克风）' };
    }
  }

  // Pareamento: clica num es, depois num pt; guarda o índice escolhido.
  let parSelEs = $state<Record<number, number | null>>({});
  function escolherEs(i: number, idx: number) {
    parSelEs[i] = idx;
  }
  function escolherPt(i: number, idxPt: number) {
    const es = parSelEs[i];
    if (es == null) return;
    pares[i] = { ...(pares[i] ?? {}), [es]: idxPt };
    parSelEs[i] = null;
  }
  function parOk(i: number, idxEs: number): boolean {
    return pares[i]?.[idxEs] === idxEs; // pares estão alinhados por índice no dado
  }
</script>

<div class="space-y-5">
  {#each exercicios as ex, i}
    <div class="card p-4">
      <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-oceano">
        练习 {i + 1}
      </div>

      {#if ex.tipo === 'mcq'}
        <p class="mb-3 font-medium">{ex.pergunta}</p>
        <div class="grid gap-2">
          {#each ex.opcoes as op, o}
            <button
              type="button"
              onclick={() => marcar(i, o)}
              class="rounded-xl border px-3 py-2 text-left transition
                {revelado[i] && o === ex.correta ? 'border-salvia bg-salvia/20' : ''}
                {revelado[i] && escolhas[i] === o && o !== ex.correta ? 'border-terracota bg-terracota/10' : ''}
                {!revelado[i] ? 'border-black/10 hover:border-oceano/40' : 'border-black/10'}"
            >
              {op}
            </button>
          {/each}
        </div>
        {#if revelado[i]}
          <p class="mt-2 text-sm {escolhas[i] === ex.correta ? 'text-salvia' : 'text-terracota'}">
            {escolhas[i] === ex.correta ? '正确！✔' : `答案是：${ex.opcoes[ex.correta]}`}
            {#if ex.explica}<span class="text-carvao/70"> — {ex.explica}</span>{/if}
          </p>
        {/if}

      {:else if ex.tipo === 'preencher'}
        <p class="mb-3 font-medium">{ex.frase}</p>
        <div class="flex flex-wrap items-center gap-2">
          <input
            bind:value={preenche[i]}
            placeholder="在这里输入"
            class="rounded-xl border border-black/10 px-3 py-2 focus:border-oceano focus:outline-none"
          />
          <button type="button" class="btn-primary" onclick={() => conferirPreencher(i)}>
            检查
          </button>
          {#if ex.dica}<span class="text-xs text-carvao/50">提示：{ex.dica}</span>{/if}
        </div>
        {#if revelado[i]}
          <p class="mt-2 text-sm {preencherOk(ex, i) ? 'text-salvia' : 'text-terracota'}">
            {preencherOk(ex, i) ? '正确！✔' : `答案：${ex.resposta}`}
          </p>
        {/if}

      {:else if ex.tipo === 'escuta'}
        <div class="mb-3 flex items-center gap-3">
          <button
            type="button"
            class="btn-primary"
            onclick={() => playKey(ex.audioKey, ex.texto)}
          >
            ▶ 听
          </button>
          <span class="text-sm text-carvao/60">你听到了什么？</span>
        </div>
        <div class="grid gap-2">
          {#each ex.opcoes as op, o}
            <button
              type="button"
              onclick={() => marcar(i, o)}
              class="rounded-xl border px-3 py-2 text-left transition
                {revelado[i] && o === ex.correta ? 'border-salvia bg-salvia/20' : ''}
                {revelado[i] && escolhas[i] === o && o !== ex.correta ? 'border-terracota bg-terracota/10' : ''}
                {!revelado[i] ? 'border-black/10 hover:border-oceano/40' : 'border-black/10'}"
            >
              {op}
            </button>
          {/each}
        </div>
        {#if revelado[i]}
          <p class="mt-2 text-sm {escolhas[i] === ex.correta ? 'text-salvia' : 'text-terracota'}">
            {escolhas[i] === ex.correta ? '正确！✔' : `答案是：${ex.opcoes[ex.correta]}`}
          </p>
        {/if}

      {:else if ex.tipo === 'parear'}
        <p class="mb-3 font-medium">点一个葡萄牙语词，然后点对应的中文。</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            {#each ex.pares as par, e}
              <button
                type="button"
                onclick={() => escolherEs(i, e)}
                class="w-full rounded-xl border px-3 py-2 text-left transition
                  {parSelEs[i] === e ? 'border-oceano bg-oceano/10' : 'border-black/10'}
                  {pares[i]?.[e] != null ? 'opacity-60' : ''}"
              >
                {par.es}
              </button>
            {/each}
          </div>
          <div class="space-y-2">
            {#each ex.pares as par, p}
              <button
                type="button"
                onclick={() => escolherPt(i, p)}
                class="w-full rounded-xl border border-black/10 px-3 py-2 text-left transition hover:border-oceano/40"
              >
                {par.pt}
              </button>
            {/each}
          </div>
        </div>
        {#if pares[i] && Object.keys(pares[i]).length === ex.pares.length}
          <p class="mt-3 text-sm {ex.pares.every((_, e) => parOk(i, e)) ? 'text-salvia' : 'text-terracota'}">
            {ex.pares.every((_, e) => parOk(i, e))
              ? '全部正确！✔'
              : '有些配对错了——再点一次重新开始。'}
          </p>
        {/if}

      {:else if ex.tipo === 'falar'}
        <p class="mb-3 font-medium">{ex.pt}</p>
        {#if recognitionSupported()}
          <button type="button" class="btn-primary" onclick={() => ouvirFalar(ex, i)}>
            🎤 说
          </button>
          {#if falaResultado[i]}
            <p class="mt-2 text-sm {falaResultado[i]?.ok ? 'text-salvia' : 'text-terracota'}">
              {falaResultado[i]?.ok ? '很好！✔' : '差一点——再试一次。'}
              <span class="text-carvao/60"> （听到："{falaResultado[i]?.ouvido}"）</span>
            </p>
          {/if}
        {:else}
          <p class="text-sm text-carvao/50">
            此浏览器不支持语音识别（请尝试手机版 Chrome）。
          </p>
        {/if}
      {/if}
    </div>
  {/each}
</div>
