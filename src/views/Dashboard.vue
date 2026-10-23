<template>
  <div class="min-h-screen bg-[#0d0e12] text-zinc-100 antialiased selection:bg-amber-400/30">
    <header class="border-b border-amber-500/20 bg-[#0d0e12]">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <RouterLink to="/" class="flex min-w-0 items-center gap-3" aria-label="水贝档口工作台首页">
          <span class="grid h-10 w-10 shrink-0 place-items-center border border-amber-400/50 bg-amber-400/10 text-lg text-amber-300">金</span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold tracking-wide text-amber-100">水贝档口工作台</span>
            <span class="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">SHUIBEI · COUNTER DESK</span>
          </span>
        </RouterLink>
        <span class="hidden text-xs text-zinc-500 sm:block">高效报价 · 清晰记账 · 快速出图</span>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-9 lg:px-8">
      <section class="border border-amber-500/25 bg-[#15161b] p-4 sm:p-5" aria-labelledby="market-title">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span :class="['absolute inline-flex h-full w-full animate-ping rounded-full opacity-70', movementClass]"></span>
                <span :class="['relative inline-flex h-2.5 w-2.5 rounded-full', movementClass]"></span>
              </span>
              <h1 id="market-title" class="text-xs font-medium text-zinc-300">上金所 Au99.99 黄金大盘价</h1>
              <span :class="['border px-1.5 py-0.5 text-[10px]', quoteSource === 'real' ? 'border-emerald-500/40 text-emerald-300' : 'border-amber-500/40 text-amber-300']">
                {{ quoteSource === 'real' ? '实时行情' : '手动报价' }}
              </span>
            </div>
            <div class="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p class="font-mono text-3xl font-semibold tabular-nums text-amber-200 sm:text-4xl">¥{{ priceText }}<span class="ml-1 text-sm font-normal text-zinc-400">/克</span></p>
              <p :class="['font-mono text-xs tabular-nums', movementTextClass]">{{ movementLabel }}</p>
            </div>
            <p class="mt-2 text-[11px] text-zinc-500">{{ quoteSourceLabel }}<span v-if="updatedAt"> · 更新 {{ updatedAt }}</span></p>
            <p v-if="quoteError" class="mt-1 text-xs text-rose-300">行情暂不可用：{{ quoteError }}</p>
          </div>
          <div class="flex items-center gap-2 self-center">
            <button type="button" class="border border-zinc-700 px-3 py-2 text-xs font-mono text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-200 disabled:opacity-50" :disabled="isRefreshing" aria-label="金价减一元" @click="adjustPrice(-1)">−1</button>
            <button type="button" class="border border-zinc-700 px-3 py-2 text-xs font-mono text-zinc-200 transition hover:border-amber-400/60 hover:text-amber-200 disabled:opacity-50" :disabled="isRefreshing" aria-label="金价加一元" @click="adjustPrice(1)">+1</button>
            <button type="button" class="grid h-9 w-9 place-items-center border border-amber-500/40 text-amber-300 transition hover:bg-amber-400/10 disabled:opacity-50" :disabled="isRefreshing" :aria-label="isRefreshing ? '正在刷新行情' : '刷新行情'" title="刷新行情" @click="refreshGoldPrice">
              <svg :class="['h-4 w-4', isRefreshing ? 'animate-spin' : '']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7v5h-5M4 17v-5h5m10-1a7 7 0 0 0-12.9-3M5 13a7 7 0 0 0 12.9 3" /></svg>
            </button>
          </div>
        </div>
      </section>

      <section class="mt-8" aria-labelledby="tools-title">
        <div class="mb-4 flex items-end justify-between gap-3">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500">COUNTER TOOLS</p>
            <h2 id="tools-title" class="mt-1 text-lg font-semibold text-zinc-100">档口工具</h2>
          </div>
          <span class="text-xs text-zinc-500">常用功能</span>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <RouterLink to="/calculator" class="group flex min-h-40 flex-col border border-emerald-500/25 bg-[#14171a] p-4 transition hover:border-emerald-400/60 hover:bg-[#171c1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
            <div class="flex items-start justify-between gap-3">
              <span class="grid h-9 w-9 place-items-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-300" aria-hidden="true"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7"/><path stroke-linecap="round" d="M17 6h2v2"/></svg></span>
              <span class="border border-emerald-500/40 px-2 py-1 text-[10px] font-medium text-emerald-300">免费</span>
            </div>
            <h3 class="mt-4 text-sm font-semibold text-zinc-100 group-hover:text-emerald-100">金价速算 / 每日海报</h3>
            <p class="mt-1.5 text-xs leading-5 text-zinc-400">3秒自动计算工费，一键生成高奢朋友圈海报</p>
            <span class="mt-auto flex items-center gap-1 pt-4 text-xs text-emerald-300">打开工具 <span aria-hidden="true">→</span></span>
          </RouterLink>

          <RouterLink to="/loan-note" class="group flex min-h-40 flex-col border border-amber-500/30 bg-[#191711] p-4 transition hover:border-amber-400/60 hover:bg-[#1d1a12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400">
            <div class="flex items-start justify-between gap-3">
              <span class="grid h-9 w-9 place-items-center border border-amber-500/30 bg-amber-500/10 text-amber-300" aria-hidden="true"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M14 4v4h4M8.5 13h7M8.5 16.5h5"/></svg></span>
              <span class="border border-amber-400/45 px-2 py-1 text-[10px] font-medium text-amber-300">VIP 刚需</span>
            </div>
            <h3 class="mt-4 text-sm font-semibold text-zinc-100 group-hover:text-amber-100">极简记账 / 借货凭证</h3>
            <p class="mt-1.5 text-xs leading-5 text-zinc-400">拍照+录入克重，生成微信确认凭证，防漏账</p>
            <span class="mt-auto flex items-center gap-1 pt-4 text-xs text-amber-300">查看预留页 <span aria-hidden="true">→</span></span>
          </RouterLink>

          <button type="button" class="group flex min-h-40 flex-col border border-zinc-800 bg-[#141519] p-4 text-left transition hover:border-amber-500/35 hover:bg-[#17171a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400" @click="showComingSoon">
            <div class="flex items-start justify-between gap-3"><span class="grid h-9 w-9 place-items-center border border-zinc-700 bg-zinc-800/60 text-amber-300" aria-hidden="true"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/><circle cx="12" cy="12" r="4"/></svg></span><span class="border border-rose-400/40 px-2 py-1 text-[10px] font-semibold uppercase text-rose-300">HOT</span></div>
            <h3 class="mt-4 text-sm font-semibold text-zinc-100 group-hover:text-amber-100">AI 朋友圈文案与修图</h3>
            <p class="mt-1.5 text-xs leading-5 text-zinc-400">爆款实拍图一键打光/换背景，AI 润色文案</p>
            <span class="mt-auto flex items-center gap-1 pt-4 text-xs text-zinc-500">内测功能 <span aria-hidden="true">→</span></span>
          </button>

          <button type="button" class="group flex min-h-40 flex-col border border-zinc-800 bg-[#141519] p-4 text-left transition hover:border-amber-500/35 hover:bg-[#17171a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400" @click="showComingSoon">
            <div class="flex items-start justify-between gap-3"><span class="grid h-9 w-9 place-items-center border border-zinc-700 bg-zinc-800/60 text-amber-300" aria-hidden="true"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7.5h10M14 4l3.5 3.5L14 11m6 5.5H10M10 13l-3.5 3.5L10 20"/></svg></span><span class="border border-sky-400/35 px-2 py-1 text-[10px] font-medium text-sky-300">内测</span></div>
            <h3 class="mt-4 text-sm font-semibold text-zinc-100 group-hover:text-amber-100">一键搬货与多群同步</h3>
            <p class="mt-1.5 text-xs leading-5 text-zinc-400">批量抓取供应商爆款，自动加价同步</p>
            <span class="mt-auto flex items-center gap-1 pt-4 text-xs text-zinc-500">敬请期待 <span aria-hidden="true">→</span></span>
          </button>

          <button type="button" class="group flex min-h-40 flex-col border border-zinc-800 bg-[#141519] p-4 text-left transition hover:border-amber-500/35 hover:bg-[#17171a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400" @click="showComingSoon">
            <div class="flex items-start justify-between gap-3"><span class="grid h-9 w-9 place-items-center border border-zinc-700 bg-zinc-800/60 text-amber-300" aria-hidden="true"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10.8" cy="10.8" r="6.8"/><path stroke-linecap="round" stroke-linejoin="round" d="m16 16 4.5 4.5M8.5 10.8h4.6m-2.3-2.3v4.6"/></svg></span><span class="border border-violet-400/35 px-2 py-1 text-[10px] font-medium text-violet-300">即将上线</span></div>
            <h3 class="mt-4 text-sm font-semibold text-zinc-100 group-hover:text-amber-100">以图搜图 / 柜台对货助手</h3>
            <p class="mt-1.5 text-xs leading-5 text-zinc-400">拍照 0.5 秒精准查款式与柜台库存</p>
            <span class="mt-auto flex items-center gap-1 pt-4 text-xs text-zinc-500">敬请期待 <span aria-hidden="true">→</span></span>
          </button>
        </div>
      </section>

      <footer class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-4 text-[11px] text-zinc-600">
        <span>行情数据仅供参考，以实际交易报价为准</span>
        <span>水贝档口工作台</span>
      </footer>
    </main>

    <Transition enter-active-class="transition duration-200" enter-from-class="translate-y-2 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-2 opacity-0">
      <div v-if="toastVisible" class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-amber-400/30 bg-[#202126] px-4 py-3 text-sm text-zinc-100 shadow-xl" role="status" aria-live="polite">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

const basePrice = ref(0);
const quoteSource = ref('manual');
const updatedAt = ref('');
const changePercent = ref(null);
const isRefreshing = ref(false);
const quoteError = ref('');
const toastVisible = ref(false);
const toastMessage = ref('');
let refreshTimer;
let toastTimer;

const priceText = computed(() => Number(basePrice.value || 0).toFixed(2));
const movementClass = computed(() => {
  if (changePercent.value === null || changePercent.value === 0) return 'bg-zinc-400';
  return changePercent.value > 0 ? 'bg-red-500' : 'bg-emerald-500';
});
const movementTextClass = computed(() => {
  if (changePercent.value === null || changePercent.value === 0) return 'text-zinc-400';
  return changePercent.value > 0 ? 'text-red-400' : 'text-emerald-400';
});
const movementLabel = computed(() => {
  if (changePercent.value === null) return '涨跌幅 --';
  return `涨跌幅 ${changePercent.value > 0 ? '+' : ''}${changePercent.value.toFixed(2)}%`;
});
const quoteSourceLabel = computed(() => quoteSource.value === 'real' ? '新浪财经 · Au99.99' : '等待同步行情');

function showComingSoon() {
  toastMessage.value = '该功能正在内测中，敬请期待';
  toastVisible.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastVisible.value = false; }, 2600);
}

function adjustPrice(delta) {
  basePrice.value = Math.max(0, Number((Number(basePrice.value || 0) + delta).toFixed(2)));
  quoteSource.value = 'manual';
  changePercent.value = null;
  quoteError.value = '';
}

async function refreshGoldPrice() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  quoteError.value = '';
  try {
    const response = await fetch('/api/gold-price', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || `行情服务返回 HTTP ${response.status}`);
    const price = Number(payload.price);
    if (!Number.isFinite(price) || price <= 0) throw new Error('行情响应中没有有效金价');
    basePrice.value = price;
    quoteSource.value = 'real';
    changePercent.value = Number.isFinite(Number(payload.changePercent)) ? Number(payload.changePercent) : null;
    updatedAt.value = payload.updatedAt ? new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' }).format(new Date(payload.updatedAt)) : '';
  } catch (error) {
    quoteError.value = error instanceof Error ? error.message : '获取行情失败';
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(() => {
  void refreshGoldPrice();
  refreshTimer = setInterval(() => { void refreshGoldPrice(); }, 60000);
});

onUnmounted(() => {
  clearInterval(refreshTimer);
  clearTimeout(toastTimer);
});
</script>
