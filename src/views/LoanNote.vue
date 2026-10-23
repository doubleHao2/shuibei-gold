<template>
  <main class="min-h-screen bg-[#0d0e12] px-4 py-6 text-zinc-100 sm:px-6">
    <div class="mx-auto max-w-5xl">
      <RouterLink to="/" class="text-sm text-amber-300 hover:text-amber-200">← 返回工作台</RouterLink>
      <div class="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div><p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500">COUNTER LEDGER</p><h1 class="mt-1 text-2xl font-semibold">借货 / 还货凭证</h1><p class="mt-2 text-sm text-zinc-400">先把货、克重、责任人和约定时间写清楚，减少口头账遗漏。</p></div>
        <button v-if="savedNotes.length" type="button" class="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-rose-400/50 hover:text-rose-300" @click="clearHistory">清空本机记录</button>
      </div>

      <div class="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form class="space-y-4 border border-zinc-800 bg-[#141519] p-4 sm:p-5" @submit.prevent="createNote">
          <div class="grid grid-cols-2 gap-2">
            <button v-for="mode in modes" :key="mode.value" type="button" :class="['border px-3 py-2.5 text-sm', form.mode === mode.value ? 'border-amber-400/60 bg-amber-400/10 text-amber-200' : 'border-zinc-700 text-zinc-400']" @click="selectMode(mode.value)">{{ mode.label }}</button>
          </div>
          <label v-if="form.mode === 'return'" class="block text-xs text-zinc-400">关联待归还借货记录<select v-model="form.relatedLoanId" class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" @change="applyRelatedLoan"><option value="">选择原借货记录（也可手动填写）</option><option v-for="note in pendingLoans" :key="note.id" :value="note.id">{{ note.item }} · {{ note.counterparty }} · {{ note.weight || 0 }}g</option></select></label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="text-xs text-zinc-400">对方姓名 / 档口<input v-model.trim="form.counterparty" required maxlength="40" class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" placeholder="例如：张师傅 / XX档口" /></label>
            <label class="text-xs text-zinc-400">联系电话（选填）<input v-model.trim="form.phone" inputmode="tel" maxlength="30" class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" placeholder="便于核对身份" /></label>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="text-xs text-zinc-400">货品 / 款号<input v-model.trim="form.item" required maxlength="80" class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" placeholder="如：古法手镯，A102" /></label>
            <label class="text-xs text-zinc-400">件数<input v-model.number="form.quantity" type="number" min="1" step="1" required class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" /></label>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <label class="text-xs text-zinc-400">总克重（g）<input v-model.number="form.weight" type="number" min="0" step="0.001" class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" placeholder="可选" /></label>
            <label class="text-xs text-zinc-400">约定金额（¥）<input v-model.number="form.amount" type="number" min="0" step="0.01" class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" placeholder="可选" /></label>
            <label class="text-xs text-zinc-400">预计归还日期<input v-model="form.dueDate" type="date" class="mt-1.5 w-full border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" /></label>
          </div>
          <label class="block text-xs text-zinc-400">备注<textarea v-model.trim="form.remark" rows="3" maxlength="300" class="mt-1.5 w-full resize-y border border-zinc-700 bg-[#0d0e12] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-400/60" placeholder="成色、配件、包装、特殊约定等"></textarea></label>
          <label class="block text-xs text-zinc-400">货品照片（选填）<input type="file" accept="image/*" class="mt-1.5 block w-full text-xs text-zinc-400 file:mr-3 file:border file:border-zinc-700 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:text-zinc-200" @change="handlePhoto" /></label>
          <p v-if="form.photo" class="text-[11px] text-amber-300">已附加照片：{{ form.photoName }} <button type="button" class="ml-2 underline" @click="removePhoto">移除</button></p>
          <p v-if="errorMessage" class="text-xs text-rose-300">{{ errorMessage }}</p>
          <div class="flex flex-wrap gap-2 pt-1"><button type="submit" class="bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300">生成并保存凭证</button><button type="button" class="border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-500" @click="resetForm">重置表单</button></div>
          <p class="text-[11px] leading-5 text-zinc-500">记录仅保存在当前设备浏览器中。清理浏览器数据或更换设备可能导致记录丢失，请及时导出或截图备份。</p>
        </form>

        <aside class="space-y-4">
          <section class="border border-amber-500/25 bg-[#171611] p-4">
            <div class="flex items-center justify-between gap-2"><h2 class="text-sm font-semibold text-amber-100">凭证预览</h2><span class="text-[10px] text-zinc-500">{{ previewNumber }}</span></div>
            <article class="mt-3 border border-zinc-700 bg-[#101115] p-4">
                <div class="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3"><div><p class="text-[10px] text-zinc-500">水贝档口 · 货品交接确认</p><h3 class="mt-1 text-base font-semibold text-amber-200">{{ form.mode === 'lend' ? '借货凭证' : '还货确认' }}</h3></div><span :class="['border px-2 py-1 text-[10px]', form.mode === 'lend' ? 'border-amber-500/40 text-amber-300' : 'border-emerald-500/40 text-emerald-300']">{{ form.mode === 'lend' ? '待归还' : '已归还' }}</span></div>
              <p v-if="form.mode === 'return' && form.relatedLoanId" class="mt-2 text-[10px] text-emerald-300">关联原借货记录：{{ form.relatedLoanId }}</p>
              <dl class="mt-3 space-y-2 text-xs"><div class="flex justify-between gap-3"><dt class="text-zinc-500">对方</dt><dd class="text-right text-zinc-200">{{ form.counterparty || '未填写' }}<span v-if="form.phone" class="ml-1 text-zinc-500">{{ form.phone }}</span></dd></div><div class="flex justify-between gap-3"><dt class="text-zinc-500">货品</dt><dd class="text-right text-zinc-200">{{ form.item || '未填写' }}</dd></div><div class="flex justify-between gap-3"><dt class="text-zinc-500">件数 / 克重</dt><dd class="text-right text-zinc-200">{{ form.quantity || 0 }} 件 / {{ Number(form.weight || 0).toFixed(3) }} g</dd></div><div class="flex justify-between gap-3"><dt class="text-zinc-500">约定金额</dt><dd class="text-right text-zinc-200">{{ Number(form.amount || 0) ? `¥${Number(form.amount).toFixed(2)}` : '未填写' }}</dd></div><div v-if="form.dueDate" class="flex justify-between gap-3"><dt class="text-zinc-500">预计归还</dt><dd class="text-right text-zinc-200">{{ form.dueDate }}</dd></div></dl>
              <img v-if="form.photo" :src="form.photo" class="mt-3 max-h-40 w-full object-contain" alt="货品照片" />
              <p v-if="form.remark" class="mt-3 border-t border-zinc-800 pt-3 text-xs leading-5 text-zinc-400">备注：{{ form.remark }}</p>
              <p class="mt-3 border-t border-zinc-800 pt-3 text-[10px] leading-4 text-zinc-500">请双方核对货品、件数、重量及约定后，在微信中回复确认。本凭证用于双方对账留存。</p>
            </article>
            <div class="mt-3 grid grid-cols-2 gap-2"><button type="button" class="border border-amber-500/40 px-3 py-2 text-xs text-amber-200 hover:bg-amber-400/10" @click="copyConfirmation">复制微信确认文本</button><button type="button" class="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500" @click="saveNote">保存到本机记录</button></div>
            <p v-if="feedback" class="mt-2 text-xs text-emerald-300" role="status">{{ feedback }}</p>
          </section>
          <section class="border border-zinc-800 bg-[#141519] p-4"><div class="flex items-center justify-between"><h2 class="text-sm font-semibold">本机最近记录</h2><span class="text-xs text-zinc-500">{{ savedNotes.length }} 条</span></div><p v-if="!savedNotes.length" class="mt-3 text-xs text-zinc-500">保存的凭证会显示在这里。</p><ul v-else class="mt-3 space-y-2"><li v-for="note in savedNotes.slice(0, 8)" :key="note.id" class="flex items-center justify-between gap-2 border-t border-zinc-800 pt-2"><button type="button" class="min-w-0 text-left" @click="loadNote(note)"><span class="block truncate text-xs text-zinc-200">{{ note.item }} · {{ note.counterparty }}</span><span class="mt-1 block text-[10px] text-zinc-500">{{ note.mode === 'lend' ? '借货' : '还货' }} · {{ note.createdAt }}</span></button><button type="button" class="shrink-0 text-[10px] text-rose-300" aria-label="删除记录" @click="deleteNote(note.id)">删除</button></li></ul></section>
        </aside>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';

const STORAGE_KEY = 'shuibei-loan-notes-v1';
const modes = [{ value: 'lend', label: '借出 / 借货' }, { value: 'return', label: '归还 / 还货' }];
const initialForm = () => ({ mode: 'lend', counterparty: '', phone: '', item: '', quantity: 1, weight: '', amount: '', dueDate: '', remark: '', photo: '', photoName: '', recordId: '', createdAt: '', relatedLoanId: '' });
const form = reactive(initialForm());
const savedNotes = ref([]);
const errorMessage = ref('');
const feedback = ref('');
const previewNumber = computed(() => `SB-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`);
const pendingLoans = computed(() => savedNotes.value.filter((note) => note.mode === 'lend' && !savedNotes.value.some((item) => item.mode === 'return' && item.relatedLoanId === note.id)));

function selectMode(mode) {
  form.mode = mode;
  if (mode !== 'return') form.relatedLoanId = '';
}
function applyRelatedLoan() {
  const loan = savedNotes.value.find((item) => item.id === form.relatedLoanId);
  if (!loan) return;
  form.counterparty = loan.counterparty;
  form.phone = loan.phone;
  form.item = loan.item;
  form.quantity = loan.quantity;
  form.weight = loan.weight;
  form.amount = loan.amount;
  form.dueDate = '';
  form.remark = `归还关联借货：${loan.id}`;
}

function loadSaved() {
  try { savedNotes.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { savedNotes.value = []; }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedNotes.value)); return true; }
  catch { errorMessage.value = '本机存储空间不足，请移除照片后重试。'; return false; }
}
function handlePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { errorMessage.value = '请选择图片文件。'; return; }
  if (file.size > 2 * 1024 * 1024) { errorMessage.value = '照片请控制在 2MB 以内，避免占满本机存储。'; event.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = () => { form.photo = String(reader.result || ''); form.photoName = file.name; errorMessage.value = ''; };
  reader.onerror = () => { errorMessage.value = '照片读取失败，请重试。'; };
  reader.readAsDataURL(file);
}
function removePhoto() { form.photo = ''; form.photoName = ''; }
function noteData() { return { ...form, quantity: Number(form.quantity || 1), weight: Number(form.weight || 0), amount: Number(form.amount || 0) }; }
function createNote() { errorMessage.value = ''; feedback.value = ''; saveNote(); }
function saveNote() {
  if (!form.counterparty || !form.item) { errorMessage.value = '请先填写对方姓名和货品信息。'; return; }
  if (form.mode === 'return' && form.relatedLoanId) {
    const loan = savedNotes.value.find((item) => item.id === form.relatedLoanId);
    if (loan) {
      form.counterparty = form.counterparty || loan.counterparty;
      form.phone = form.phone || loan.phone;
      form.item = form.item || loan.item;
      form.quantity = form.quantity || loan.quantity;
      form.weight = form.weight || loan.weight;
    }
  }
  const note = { ...noteData(), id: form.recordId || crypto.randomUUID?.() || `${Date.now()}`, createdAt: form.createdAt || new Date().toLocaleString('zh-CN', { hour12: false }) };
  savedNotes.value = [note, ...savedNotes.value.filter((item) => item.id !== note.id)];
  form.recordId = note.id;
  form.createdAt = note.createdAt;
  if (persist()) feedback.value = '凭证已保存到本机浏览器。';
}
function confirmationText() {
  return `【水贝档口${form.mode === 'lend' ? '借货凭证' : '还货确认'}】\n对方：${form.counterparty || '未填写'}${form.phone ? `（${form.phone}）` : ''}\n货品/款号：${form.item || '未填写'}\n件数：${Number(form.quantity || 0)} 件\n总克重：${Number(form.weight || 0).toFixed(3)} g\n约定金额：${Number(form.amount || 0) ? `¥${Number(form.amount).toFixed(2)}` : '未填写'}${form.dueDate ? `\n预计归还：${form.dueDate}` : ''}${form.remark ? `\n备注：${form.remark}` : ''}\n请核对以上信息无误后回复“确认”。\n凭证生成时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`;
}
async function copyConfirmation() {
  try { await navigator.clipboard.writeText(confirmationText()); feedback.value = '确认文本已复制，可粘贴到微信聊天。'; }
  catch { feedback.value = '浏览器未开放剪贴板权限，请手动选择并复制凭证信息。'; }
}
function loadNote(note) { Object.assign(form, initialForm(), note); feedback.value = '已载入该条记录，修改后再次保存会覆盖原记录。'; }
function deleteNote(id) { savedNotes.value = savedNotes.value.filter((note) => note.id !== id); persist(); }
function clearHistory() { if (window.confirm('确定清空本机保存的全部凭证吗？此操作无法撤销。')) { savedNotes.value = []; persist(); } }
function resetForm() { Object.assign(form, initialForm()); errorMessage.value = ''; feedback.value = '已新建一张空白凭证。'; }
onMounted(loadSaved);
</script>
