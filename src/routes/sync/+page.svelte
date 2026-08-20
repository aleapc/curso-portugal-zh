<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { decodeSync, importSync } from '$lib/sync';

  // 'fora' = link aberto no navegador (não no PWA instalado): no iOS o storage é
  // SEPARADO — importar aqui gravava no lugar errado e mostrava sucesso falso.
  let estado = $state<'lendo' | 'preview' | 'ok' | 'erro' | 'fora'>('lendo');
  let detalhe = $state('');
  let codigo = $state('');
  let previa = $state<{ ale: number; dea: number } | null>(null);
  let copiado = $state(false);

  onMount(() => {
    const m = window.location.hash.match(/s=(ES1.[A-Za-z0-9_-]+)/);
    if (!m) {
      estado = 'erro';
      detalhe = '这个链接里没有代码。请对方再发一次。';
      return;
    }
    codigo = m[1];
    const data = decodeSync(codigo);
    if (!data) {
      estado = 'erro';
      detalhe = '无效代码——请对方重新生成一次。';
      return;
    }
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!standalone) {
      estado = 'fora';
      return;
    }
    // Dentro do app: mostra o que vai entrar e ESPERA confirmação (merge é
    // irreversível — união sem undo).
    previa = { ale: data.ale.length, dea: data.dea.length };
    estado = 'preview';
  });

  function confirmar() {
    const r = importSync(codigo);
    if (r) {
      estado = 'ok';
      detalhe = `已合并 +${r.ale} 和 +${r.dea}。🎉`;
    } else {
      estado = 'erro';
      detalhe = '无效代码。';
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      copiado = true;
    } catch {
      /* iOS antigo sem clipboard API — o textarea abaixo permite copiar na mão */
    }
  }
</script>

<div class="mt-10 text-center">
  {#if estado === 'lendo'}
    <p>正在读取代码……</p>
  {:else if estado === 'preview'}
    <h1 class="text-2xl font-extrabold">同步?🔄</h1>
    <p class="mt-2 text-carvao/70">
      这段代码带有 {previa?.ale ?? 0} + {previa?.dea ?? 0} 条已完成部分。导入是合并,不会删除任何东西。
    </p>
    <button class="btn-primary mt-4" onclick={confirmar}>现在导入</button>
  {:else if estado === 'ok'}
    <h1 class="text-2xl font-extrabold text-salvia">完成 ✅</h1>
    <p role="status" class="mt-2 text-carvao/70">{detalhe}</p>
  {:else if estado === 'fora'}
    <h1 class="text-2xl font-extrabold">就差一步 📲</h1>
    <p class="mx-auto mt-2 max-w-sm text-carvao/70">
      这个链接是在<b>浏览器</b>里打开的——但你的进度是存在主屏幕上的 <b>Diga！应用</b> 里的。请复制代码,再粘贴到应用里:
    </p>
    <ol class="mx-auto mt-3 max-w-sm space-y-1 text-left text-sm text-carvao/70">
      <li>1. 点下面的<b>复制代码</b></li>
      <li>2. 从主屏幕打开 <b>Diga！</b>应用（电脑上就打开课程首页）</li>
      <li>3. 在<b>同步</b>那栏粘贴并导入</li>
    </ol>
    <button class="btn-primary mt-4" onclick={copiar}>
      {copiado ? '✅ 已复制' : '📋 复制代码'}
    </button>
    <textarea
      class="mx-auto mt-3 block w-full max-w-sm rounded-xl border border-black/10 bg-white p-2 text-[10px] text-carvao/60"
      rows="3"
      readonly
      onclick={(e) => (e.currentTarget as HTMLTextAreaElement).select()}>{codigo}</textarea
    >
  {:else}
    <h1 class="text-2xl font-extrabold text-terracota">嗯…… 🤔</h1>
    <p role="status" class="mt-2 text-carvao/70">{detalhe}</p>
  {/if}
  <a href="{base}/" class="btn-primary mt-6 inline-block">进入课程</a>
</div>
