<template>
  <main class="min-h-screen bg-[#0d0e12] px-4 py-6 text-zinc-100 sm:px-6"><div class="mx-auto max-w-5xl"><RouterLink to="/" class="text-sm text-amber-300">← 返回工作台</RouterLink><div class="mt-6"><p class="text-[10px] uppercase tracking-[0.18em] text-amber-500">CONTENT DESK</p><h1 class="mt-1 text-2xl font-semibold">朋友圈文案与图片助手</h1><p class="mt-2 text-sm text-zinc-400">把实拍图和关键卖点整理成可直接发朋友圈的内容。</p></div><div class="mt-6 grid gap-5 lg:grid-cols-2"><section class="space-y-4 border border-zinc-800 bg-[#141519] p-4 sm:p-5"><label class="block text-xs text-zinc-400">产品名称<input v-model.trim="form.name" class="field" placeholder="如：古法金祥云福字手镯" /></label><div class="grid grid-cols-2 gap-3"><label class="text-xs text-zinc-400">工艺<select v-model="form.craft" class="field"><option>古法金</option><option>足金</option><option>3D硬金</option><option>5G金</option></select></label><label class="text-xs text-zinc-400">克重<input v-model.number="form.weight" type="number" class="field" placeholder="例如 20.5" /></label></div><label class="block text-xs text-zinc-400">核心卖点<input v-model.trim="form.sellingPoint" class="field" placeholder="如：寓意好、厚实、现货" /></label><label class="block text-xs text-zinc-400">适合人群<input v-model.trim="form.audience" class="field" placeholder="如：婚嫁、送长辈、日常佩戴" /></label><label class="block text-xs text-zinc-400">实拍图<input type="file" accept="image/*" class="mt-2 block w-full text-xs text-zinc-400 file:mr-3 file:border file:border-zinc-700 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:text-zinc-200" @change="handleImage" /></label><div class="flex gap-2"><button class="bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950" @click="generate">生成文案</button><button class="border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300" @click="reset">清空</button></div></section><section class="space-y-4"><div class="border border-amber-500/25 bg-[#171611] p-4"><div class="flex items-center justify-between"><h2 class="text-sm font-semibold text-amber-100">图片预览</h2><button v-if="image" class="text-xs text-amber-300" @click="downloadImage">下载图片</button></div><div class="mt-3 grid min-h-64 place-items-center bg-[#0a0b0e] p-3"><img v-if="image" :src="image" :style="{ filter: `brightness(${form.brightness}%) contrast(${form.contrast}%)` }" class="max-h-80 max-w-full object-contain" alt="商品实拍预览" /><p v-else class="text-xs text-zinc-600">上传实拍图后可预览</p></div><div v-if="image" class="mt-3 grid grid-cols-2 gap-3 text-xs text-zinc-400"><label>亮度 {{ form.brightness }}%<input v-model.number="form.brightness" type="range" min="70" max="140" class="w-full accent-amber-400" /></label><label>对比度 {{ form.contrast }}%<input v-model.number="form.contrast" type="range" min="70" max="150" class="w-full accent-amber-400" /></label></div></div><div class="border border-zinc-800 bg-[#141519] p-4"><div class="flex items-center justify-between"><h2 class="text-sm font-semibold">朋友圈文案</h2><button class="text-xs text-amber-300" @click="copyText">复制</button></div><textarea v-model="caption" rows="10" class="mt-3 w-full resize-y border border-zinc-700 bg-[#0d0e12] p-3 text-sm leading-6 text-zinc-200 outline-none focus:border-amber-400/60"></textarea></div></section></div></div></main>
</template>
<script setup>
import { reactive, ref } from 'vue';
const form = reactive({ name: '', craft: '古法金', weight: '', sellingPoint: '', audience: '', brightness: 105, contrast: 110 });
const image = ref(''); const caption = ref('');
function handleImage(event) { const file = event.target.files?.[0]; if (!file || file.size > 5 * 1024 * 1024) return; const reader = new FileReader(); reader.onload = () => { image.value = String(reader.result || ''); }; reader.readAsDataURL(file); }
function generate() { const name = form.name || '今日黄金好物'; caption.value = `【${name}】\n${form.craft}${form.weight ? ` · ${form.weight}g` : ''}\n\n${form.sellingPoint || '质感在线，现货可看'}，${form.audience || '日常佩戴和送礼都合适'}。\n\n支持到店看货 / 视频看货，喜欢的朋友私信我，帮你按今天金价核算到手价。\n#黄金首饰 #水贝档口 #${form.craft}`; }
async function copyText() { try { await navigator.clipboard.writeText(caption.value); } catch {} }
function reset() { Object.assign(form, { name: '', craft: '古法金', weight: '', sellingPoint: '', audience: '', brightness: 105, contrast: 110 }); image.value = ''; caption.value = ''; }
async function downloadImage() {
  if (!image.value) return;
  const source = new Image();
  source.src = image.value;
  await new Promise((resolve) => { source.onload = resolve; source.onerror = resolve; });
  const canvas = document.createElement('canvas');
  canvas.width = source.naturalWidth || source.width;
  canvas.height = source.naturalHeight || source.height;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.filter = `brightness(${form.brightness}%) contrast(${form.contrast}%)`;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/jpeg', 0.92);
  link.download = '水贝商品实拍-已调光.jpg';
  link.click();
}
</script>
<style scoped>.field{margin-top:.375rem;width:100%;border:1px solid rgb(63 63 70);background:#0d0e12;padding:.625rem .75rem;color:#f4f4f5;outline:none}.field:focus{border-color:rgb(251 191 36 / .6)}</style>
