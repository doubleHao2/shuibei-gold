<template>
  <div class="min-h-screen bg-[#0d0e12] text-slate-100 font-sans pb-28 antialiased selection:bg-amber-500/30">
    <!-- 顶部状态与品牌栏 -->
    <header class="sticky top-0 z-30 backdrop-blur-md bg-[#0d0e12]/80 border-b border-amber-500/20 px-4 py-3">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg class="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 4.2L19.2 19H4.8L12 6.2z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              水贝金价·海报智算器
            </h1>
            <p class="text-[10px] text-zinc-400 tracking-widest uppercase">SHUIBEI GOLD ESTIMATOR</p>
          </div>
        </div>
        <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs" :class="quoteStateClass">
          <span class="w-1.5 h-1.5 rounded-full" :class="quoteSource === 'real' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"></span>
          <span class="text-[11px] font-medium">{{ quoteStateLabel }}</span>
        </div>
      </div>
    </header>

    <main class="max-w-md mx-auto px-4 pt-4 space-y-5">
      <!-- 1. 今日大盘金价看板 -->
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1d25] via-[#15161d] to-[#101117] border border-amber-500/30 p-4 shadow-xl shadow-black/50">
        <!-- 背景金色流光微晕 -->
        <div class="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-amber-300/80 tracking-wide flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              上金所 Au99.99 基准价
            </span>
            <button 
              @click="refreshGoldPrice" 
              :disabled="isRefreshing"
              class="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded-full active:scale-95 disabled:opacity-50"
            >
              <svg :class="['w-3 h-3', isRefreshing ? 'animate-spin' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{{ isRefreshing ? '刷新中...' : '刷新行情' }}</span>
            </button>
          </div>

          <div class="flex items-baseline justify-between mt-1">
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold text-amber-400 font-mono">¥</span>
              <input 
                type="number" 
                v-model.number="basePrice" 
                @input="setManualPrice"
                step="0.01"
                min="0"
                class="w-36 bg-transparent text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-400 outline-none focus:ring-0 border-b border-dashed border-amber-500/40 pb-0.5"
                placeholder="620"
              />
              <span class="text-sm font-medium text-zinc-400 ml-1">/ 克 (g)</span>
            </div>
            
            <div class="text-right">
              <div class="text-[11px] text-zinc-400">行情波动</div>
              <div class="text-xs font-semibold font-mono flex items-center justify-end gap-0.5" :class="fluctuation >= 0 ? 'text-red-400' : 'text-emerald-400'">
                <span>{{ fluctuation >= 0 ? '+' : '' }}{{ fluctuation.toFixed(2) }}{{ quoteSource === 'real' ? '%' : '' }}</span>
                <span class="text-[10px]">{{ fluctuation >= 0 ? '▲' : '▼' }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span class="truncate">行情来源：{{ quoteSourceLabel }} · 更新：{{ lastUpdateTime }}</span>
            <span v-if="quoteError" class="text-rose-400 truncate max-w-[42%]" :title="quoteError">{{ quoteError }}</span>
            <div class="flex items-center gap-1.5">
              <button 
                v-for="delta in [-2, -1, 1, 2]" 
                :key="delta"
                @click="adjustManualPrice(delta)"
                class="px-1.5 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 font-mono active:scale-95 transition-transform"
              >
                {{ delta > 0 ? '+' + delta : delta }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 工艺选择与工费设定 -->
      <section class="rounded-2xl bg-[#161720] border border-zinc-800/80 p-4 space-y-3.5 shadow-lg">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 bg-amber-500 rounded-full"></span>
            选择金饰工艺类型
          </label>
          <span class="text-[11px] text-zinc-400">工费自动带入支持微调</span>
        </div>

        <!-- 选项卡卡片网格 -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="craft in craftOptions"
            :key="craft.id"
            @click="selectCraft(craft)"
            :class="[
              'relative rounded-xl p-2.5 text-left transition-all duration-200 border flex flex-col justify-between',
              selectedCraftId === craft.id
                ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/20 border-amber-500/60 shadow-md shadow-amber-500/10'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
            ]"
          >
            <div class="flex items-center justify-between w-full">
              <span class="text-xs font-bold" :class="selectedCraftId === craft.id ? 'text-amber-300' : 'text-zinc-200'">
                {{ craft.name }}
              </span>
              <span 
                v-if="craft.badge"
                class="text-[9px] px-1 py-0.2 rounded font-medium"
                :class="selectedCraftId === craft.id ? 'bg-amber-500/30 text-amber-200' : 'bg-zinc-800 text-zinc-400'"
              >
                {{ craft.badge }}
              </span>
            </div>
            <div class="mt-2 text-[11px] font-mono font-medium" :class="selectedCraftId === craft.id ? 'text-amber-400' : 'text-zinc-400'">
              +{{ craft.defaultFee }}元/g
            </div>
          </button>
        </div>

        <!-- 当前工费微调栏 -->
        <div class="flex items-center justify-between bg-zinc-900/90 rounded-xl px-3 py-2 border border-zinc-800">
          <div class="flex items-center gap-2">
            <span class="text-xs text-zinc-300">当前工费单价:</span>
            <div class="flex items-baseline gap-1">
              <span class="text-amber-400 font-mono text-sm font-bold">¥</span>
              <input
                type="number"
                v-model.number="craftFee"
                min="0"
                step="1"
                class="w-16 bg-zinc-800/80 rounded px-2 py-0.5 text-sm font-mono font-bold text-amber-300 outline-none text-center border border-zinc-700 focus:border-amber-500/50"
              />
              <span class="text-xs text-zinc-400">元/克</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button 
              @click="craftFee = Math.max(0, craftFee - 5)"
              class="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center active:scale-95"
            >
              -5
            </button>
            <button 
              @click="craftFee += 5"
              class="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center active:scale-95"
            >
              +5
            </button>
          </div>
        </div>
      </section>

      <!-- 3. 克重输入与实时运算 -->
      <section class="rounded-2xl bg-[#161720] border border-zinc-800/80 p-4 space-y-4 shadow-lg">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 bg-amber-500 rounded-full"></span>
            输入首饰克重 (g)
          </label>
          <span class="text-[11px] text-zinc-400">精确到小数点后2位</span>
        </div>

        <!-- 克重输入与步进器 -->
        <div class="relative">
          <div class="flex items-center bg-zinc-900/90 rounded-xl border border-zinc-800 p-2 focus-within:border-amber-500/50 transition-colors">
            <input 
              type="number" 
              v-model.number="weight" 
              step="0.01" 
              min="0.01"
              class="flex-1 bg-transparent text-2xl font-bold font-mono text-zinc-100 outline-none pl-2"
              placeholder="0.00"
            />
            <span class="text-sm font-medium text-zinc-400 pr-2">克 (g)</span>
            <div class="flex items-center gap-1 pl-2 border-l border-zinc-800">
              <button 
                @click="weight = Number((Math.max(0.1, weight - 0.5)).toFixed(2))"
                class="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded active:scale-95"
              >
                -0.5
              </button>
              <button 
                @click="weight = Number((weight + 0.5).toFixed(2))"
                class="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded active:scale-95"
              >
                +0.5
              </button>
            </div>
          </div>

          <!-- 常用爆款快捷克重 -->
          <div class="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
            <span class="text-[10px] text-zinc-400 shrink-0">快捷:</span>
            <button
              v-for="qWeight in [5.2, 8.8, 12.5, 18.6, 25.0, 36.8]"
              :key="qWeight"
              @click="weight = qWeight"
              :class="[
                'px-2 py-0.5 rounded-full text-[11px] font-mono shrink-0 transition-colors',
                weight === qWeight 
                  ? 'bg-amber-500 text-black font-bold shadow-sm shadow-amber-500/20' 
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              ]"
            >
              {{ qWeight }}g
            </button>
          </div>
        </div>

        <!-- 实时计算结果卡片 -->
        <div class="rounded-xl bg-gradient-to-br from-[#1a1712] via-[#221c13] to-[#171410] border border-amber-500/40 p-4 space-y-3">
          <div class="flex items-baseline justify-between border-b border-amber-500/20 pb-3">
            <div>
              <div class="text-[11px] text-amber-300/80 font-medium">预估结算总价 (Total Amount)</div>
              <div class="text-[10px] text-zinc-400 mt-0.5">计算公式: 克重 × (大盘金价 + 工费)</div>
              <div class="mt-1 text-[9px] text-zinc-500">{{ quoteNote }}</div>
            </div>
            <div class="text-right">
              <span class="text-sm font-bold text-amber-400 font-mono mr-0.5">¥</span>
              <span class="text-3xl font-extrabold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500">
                {{ formatMoney(totalPrice) }}
              </span>
            </div>
          </div>

          <!-- 明细拆解数据项 -->
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-black/30 rounded-lg p-2 border border-zinc-800/60">
              <div class="text-[10px] text-zinc-400">综合单克价</div>
              <div class="text-amber-300 font-mono font-bold mt-0.5">¥{{ unitPrice }}/g</div>
            </div>
            <div class="bg-black/30 rounded-lg p-2 border border-zinc-800/60">
              <div class="text-[10px] text-zinc-400">金料总价值</div>
              <div class="text-zinc-200 font-mono font-semibold mt-0.5">¥{{ formatMoney(materialTotal) }}</div>
            </div>
            <div class="bg-black/30 rounded-lg p-2 border border-zinc-800/60">
              <div class="text-[10px] text-zinc-400">工费总小计</div>
              <div class="text-zinc-200 font-mono font-semibold mt-0.5">¥{{ formatMoney(craftFeeTotal) }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. 海报定制与商家信息 -->
      <section class="rounded-2xl bg-[#161720] border border-zinc-800/80 p-4 space-y-3 shadow-lg">
        <button 
          @click="showCustomSettings = !showCustomSettings"
          class="w-full flex items-center justify-between text-xs font-semibold text-zinc-300"
        >
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 bg-amber-500 rounded-full"></span>
            <span>海报展示与商家信息设置</span>
          </div>
          <div class="flex items-center gap-1 text-[11px] text-amber-400">
            <span>{{ showCustomSettings ? '收起配置' : '展开自定义' }}</span>
            <svg :class="['w-3.5 h-3.5 transition-transform duration-200', showCustomSettings ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <div v-show="showCustomSettings" class="pt-2 space-y-3 border-t border-zinc-800/80">
          <div>
            <label class="text-[11px] text-zinc-400 block mb-1">店铺 / 档口名称</label>
            <input 
              type="text" 
              v-model="merchant.shopName" 
              class="w-full bg-zinc-900/90 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
              placeholder="例如：水贝·臻金世家"
            />
          </div>

          <div>
            <label class="text-[11px] text-zinc-400 block mb-1">联系微信 / 咨询电话</label>
            <input 
              type="text" 
              v-model="merchant.contact" 
              class="w-full bg-zinc-900/90 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
              placeholder="例如：138-8888-6666 (微信同号)"
            />
          </div>

          <div>
            <label class="text-[11px] text-zinc-400 block mb-1">爆款产品名称</label>
            <input 
              type="text" 
              v-model="merchant.productName" 
              class="w-full bg-zinc-900/90 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
              placeholder="例如：【爆款】古法传承·福运金手镯"
            />
          </div>

          <!-- 产品实拍图上传 -->
          <div>
            <label class="text-[11px] text-zinc-400 block mb-1.5">爆款产品实拍图 (替换默认图)</label>
            <div class="flex items-center gap-3">
              <input 
                type="file" 
                ref="fileInputRef" 
                @change="handleFileUpload" 
                accept="image/*" 
                class="hidden" 
              />
              <button 
                @click="triggerUpload"
                class="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ uploadedImage ? '更换实拍图片' : '上传首饰实拍图' }}</span>
              </button>

              <button 
                v-if="uploadedImage"
                @click="resetImage"
                class="text-[11px] text-rose-400 hover:text-rose-300 underline"
              >
                恢复默认金饰图
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. 核心：朋友圈海报预览区 (导出目标容器) -->
      <section class="space-y-3 pt-1">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span class="text-xs font-bold text-amber-300 uppercase tracking-wider">朋友圈海报预览 (实时生成)</span>
          </div>
          <span class="text-[11px] text-zinc-400">所见即所得 · 高清画质</span>
        </div>

        <!-- 外部包装框 -->
        <div class="rounded-2xl p-1 bg-gradient-to-b from-amber-500/40 via-amber-800/20 to-zinc-800/40 shadow-2xl">
          <!-- 海报主体 DOM 节点 (供 html2canvas 截取) -->
          <div 
            ref="posterNodeRef"
            id="gold-poster-capture"
            class="relative w-full overflow-hidden rounded-xl bg-[#111217] text-white p-5 select-none"
            style="background: radial-gradient(circle at 50% 15%, #252219 0%, #13141a 60%, #0d0e12 100%);"
          >
            <!-- 奢华金属边框内衬 -->
            <div class="absolute inset-2 border border-amber-500/25 rounded-lg pointer-events-none"></div>
            <!-- 四角装饰微标 -->
            <div class="absolute top-3 left-3 w-2 h-2 border-t-2 border-l-2 border-amber-400/80 pointer-events-none"></div>
            <div class="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-amber-400/80 pointer-events-none"></div>
            <div class="absolute bottom-3 left-3 w-2 h-2 border-b-2 border-l-2 border-amber-400/80 pointer-events-none"></div>
            <div class="absolute bottom-3 right-3 w-2 h-2 border-b-2 border-r-2 border-amber-400/80 pointer-events-none"></div>

            <div class="relative z-10 space-y-4">
              <!-- 海报头部：品牌与日期 -->
              <div class="flex items-start justify-between border-b border-amber-500/20 pb-3">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-amber-400 font-serif font-black text-base tracking-wide">
                      {{ merchant.shopName }}
                    </span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      源头直供
                    </span>
                  </div>
                  <div class="text-[10px] text-zinc-400 tracking-wider mt-0.5">
                    深圳水贝国际珠宝交易中心 · 批发直销
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-[10px] text-amber-300/80 font-mono">{{ todayDateString }}</div>
                  <div class="text-[9px] text-zinc-500">今日金价行情播报</div>
                </div>
              </div>

              <!-- 海报大盘金价醒目徽标 -->
              <div class="rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/40 p-2.5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-black font-black text-xs shadow-md">
                    Au
                  </div>
                  <div>
                    <div class="text-[10px] text-amber-200/90 font-medium">今日大盘基准价 (Au9999)</div>
                    <div class="text-[9px] text-zinc-400">{{ quoteNote }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold font-mono text-amber-300 flex items-baseline justify-end gap-0.5">
                    <span>¥{{ basePrice }}</span>
                    <span class="text-xs font-normal text-amber-300/80">/克</span>
                  </div>
                </div>
              </div>

              <!-- 爆款产品实物展示区 (支持本地上传或内置高清质感手镯) -->
              <div class="relative rounded-xl overflow-hidden bg-gradient-to-b from-zinc-900 to-black border border-amber-500/20 flex flex-col items-center justify-center p-3">
                <div class="w-full h-44 rounded-lg overflow-hidden flex items-center justify-center relative bg-gradient-to-b from-[#1a1a22] to-[#121216]">
                  <!-- 用户上传的图片 -->
                  <img 
                    v-if="uploadedImage" 
                    :src="uploadedImage" 
                    alt="产品实拍图" 
                    class="w-full h-full object-contain"
                  />
                  <!-- 默认优雅高端黄金饰品矢量插画 -->
                  <div v-else class="flex flex-col items-center justify-center p-4 text-center">
                    <svg class="w-24 h-24 text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.35)]" viewBox="0 0 100 100" fill="none">
                      <!-- 环形古法金手镯造型 -->
                      <circle cx="50" cy="50" r="38" stroke="url(#goldGradient)" stroke-width="8" stroke-linecap="round" />
                      <circle cx="50" cy="50" r="30" stroke="url(#goldInnerGradient)" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
                      <!-- 祥云点缀 -->
                      <path d="M43 45 C43 42, 46 40, 50 40 C54 40, 57 42, 57 45 C60 45, 62 47, 62 50 C62 53, 59 55, 56 55 L44 55 C41 55, 38 53, 38 50 C38 47, 40 45, 43 45 Z" fill="url(#goldGradient)" opacity="0.85" />
                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#FFF0B8" />
                          <stop offset="40%" stop-color="#F59E0B" />
                          <stop offset="70%" stop-color="#D97706" />
                          <stop offset="100%" stop-color="#B45309" />
                        </linearGradient>
                        <linearGradient id="goldInnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#FDE68A" />
                          <stop offset="100%" stop-color="#D97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span class="text-[10px] text-amber-300/70 tracking-widest mt-2 uppercase font-serif">HERITAGE PURE GOLD 999</span>
                  </div>

                  <!-- 品名浮层胶囊 -->
                  <div class="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-[#14151a]/95 border border-amber-500/40 flex items-center justify-between gap-2 shadow-lg">
                    <span class="text-xs font-semibold text-amber-100 leading-normal truncate min-w-0 flex-1">
                      {{ merchant.productName }}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-black font-extrabold uppercase shrink-0">
                      {{ currentCraft.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 规格参数与结算价格清单 -->
              <div class="rounded-xl bg-gradient-to-br from-[#1a1712] to-[#121318] border border-amber-500/30 p-3.5 space-y-3">
                <div class="grid grid-cols-2 gap-2 text-xs border-b border-zinc-800 pb-2.5">
                  <div class="space-y-0.5">
                    <div class="text-[10px] text-zinc-400">首饰克重 / 纯度</div>
                    <div class="font-mono font-bold text-zinc-100 flex items-center gap-1">
                      <span>{{ Number(weight).toFixed(2) }} 克 (g)</span>
                      <span class="text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">足金999</span>
                    </div>
                  </div>
                  <div class="space-y-0.5 text-right">
                    <div class="text-[10px] text-zinc-400">工艺工费标准</div>
                    <div class="font-mono font-bold text-amber-300">
                      +{{ craftFee }} 元/克 ({{ currentCraft.name }})
                    </div>
                  </div>
                </div>

                <!-- 最终报价大字展示 -->
                <div class="flex items-center justify-between pt-0.5">
                  <div>
                    <span class="text-[11px] text-zinc-400 block">专柜到手预估总价</span>
                    <span class="text-[9px] text-amber-400/80">克重 × (大盘金价+工费)</span>
                    <span class="mt-1 block text-[8px] text-zinc-500">{{ quoteSourceLabel }} · {{ lastUpdateTime }}</span>
                  </div>
                  <div class="text-right flex items-baseline justify-end gap-1">
                    <span class="text-sm font-bold text-amber-400 font-mono">¥</span>
                    <span class="text-2xl font-extrabold font-mono tracking-tight text-amber-300">
                      {{ formatMoney(totalPrice) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 海报底部：联系方式与信任背书 -->
              <div class="pt-1 flex items-center justify-between border-t border-amber-500/20 text-[10px] text-zinc-400">
                <div class="space-y-0.5">
                  <div class="text-zinc-200 font-medium flex items-center gap-1">
                    <svg class="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 4V3z"/>
                    </svg>
                    <span>{{ merchant.contact }}</span>
                  </div>
                  <div class="text-[9px] text-zinc-400">
                    一客一价 · 现货即发 · 支持全国各大检测中心复检
                  </div>
                </div>

                <!-- 专属防伪徽印 -->
                <div class="w-10 h-10 rounded-full border border-amber-500/50 flex flex-col items-center justify-center bg-amber-500/10 text-amber-300 text-[8px] leading-tight font-serif text-center shrink-0">
                  <span>水贝</span>
                  <span>正品</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部固定操作栏 -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e12]/95 backdrop-blur-lg border-t border-amber-500/20 p-3">
      <div class="max-w-md mx-auto flex items-center gap-3">
        <button
          @click="generateAndSavePoster"
          :disabled="isGenerating"
          class="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg v-if="!isGenerating" class="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ isGenerating ? '正在渲染高清海报...' : '一键生成并保存海报图片' }}</span>
        </button>
      </div>
    </div>

    <!-- 海报生成成功预览模态框 (适配手机端长按保存) -->
    <div 
      v-if="showPosterModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all"
    >
      <div class="max-w-sm w-full bg-[#181920] border border-amber-500/40 rounded-2xl p-4 flex flex-col items-center space-y-3 shadow-2xl">
        <div class="w-full flex items-center justify-between text-xs font-semibold text-zinc-300 border-b border-zinc-800 pb-2">
          <span class="text-amber-300 flex items-center gap-1">
            <svg class="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            海报已生成 (高清版)
          </span>
          <button @click="showPosterModal = false" class="text-zinc-400 hover:text-white p-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="w-full max-h-[62vh] overflow-y-auto rounded-lg border border-zinc-800 bg-black/50 p-1 flex justify-center">
          <img :src="posterImageUrl" alt="生成的黄金海报" class="max-w-full h-auto rounded shadow-lg" />
        </div>

        <p class="text-[11px] text-amber-200/90 text-center">
          📱 手机端可 <span class="text-amber-400 font-bold underline">长按图片保存到手机相册</span> 直接发朋友圈
        </p>

        <div class="w-full flex gap-2 pt-1">
          <button 
            @click="triggerManualDownload"
            class="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            直接保存到本地
          </button>
          <button 
            @click="showPosterModal = false" 
            class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs active:scale-95"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';

// 1. 大盘金价与行情数据
const basePrice = ref(620); // 手动报价默认值；未配置真实行情服务时明确使用手动模式
const fluctuation = ref(0);
const isRefreshing = ref(false);
const quoteSource = ref('manual');
const quoteUpdatedAt = ref('');
const quoteError = ref('');
const quoteNote = ref('新浪公开行情；以页面显示时点为准');
const autoRefreshTimer = ref(null);
const lastUpdateTime = computed(() => {
  if (!quoteUpdatedAt.value) return '未获取真实行情';
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date(quoteUpdatedAt.value));
});
const quoteSourceLabel = computed(() => quoteSource.value === 'real' ? '新浪 Au99.99' : '手动录入');
const quoteStateLabel = computed(() => quoteSource.value === 'real' ? '行情已同步' : '手动报价');
const quoteStateClass = computed(() => quoteSource.value === 'real'
  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
  : 'bg-amber-950/40 border-amber-500/30 text-amber-300');

const setManualPrice = () => {
  quoteSource.value = 'manual';
    quoteUpdatedAt.value = '';
    quoteError.value = '';
    quoteNote.value = '手动输入价格将暂停自动刷新';
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value);
      autoRefreshTimer.value = null;
    }
};

const adjustManualPrice = (delta) => {
  basePrice.value = Math.max(0, Number((Number(basePrice.value || 0) + delta).toFixed(2)));
  setManualPrice();
};

const refreshGoldPrice = async () => {
  isRefreshing.value = true;
  quoteError.value = '';
  try {
    // 新浪接口没有浏览器 CORS 响应头，必须经同源服务端代理请求；这里读取已转成 JSON 的结果。
    const response = await fetch('/api/gold-price', { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `行情服务返回 HTTP ${response.status}`);
    const price = Number(payload.price);
    const updatedAt = new Date(payload.updatedAt);
    if (!Number.isFinite(price) || price <= 0 || Number.isNaN(updatedAt.getTime())) {
      throw new Error('新浪行情响应无有效 Au99.99 价格或时间');
    }
    const changePercent = Number(payload.changePercent ?? 0);
    fluctuation.value = Number.isFinite(changePercent) ? changePercent : 0;
    basePrice.value = price;
    quoteUpdatedAt.value = updatedAt.toISOString();
    quoteSource.value = 'real';
    quoteNote.value = '来源新浪 gds_AU9999；非交易时段可能返回最近快照';
  } catch (error) {
    quoteError.value = error instanceof Error ? error.message : '获取行情失败';
    quoteNote.value = '行情获取失败，请检查服务端代理或稍后重试';
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(() => {
  void refreshGoldPrice();
  autoRefreshTimer.value = setInterval(() => {
    if (quoteSource.value === 'real') void refreshGoldPrice();
  }, 60_000);
  window.addEventListener('pagehide', () => {
    if (autoRefreshTimer.value) clearInterval(autoRefreshTimer.value);
  }, { once: true });
});

onUnmounted(() => {
  if (autoRefreshTimer.value) clearInterval(autoRefreshTimer.value);
});

// 2. 金饰工艺选项与工费设定
const craftOptions = [
  { id: 'gufa', name: '古法金', defaultFee: 65, badge: '热销' },
  { id: '3d', name: '3D硬金', defaultFee: 45, badge: '精选' },
  { id: 'puzhu', name: '普通足金', defaultFee: 20, badge: '经典' }
];

const selectedCraftId = ref('gufa');
const craftFee = ref(65); // 初始古法金默认 65 元/克

// 切换工艺选项卡
const selectCraft = (craft) => {
  selectedCraftId.value = craft.id;
  craftFee.value = craft.defaultFee;
};

const currentCraft = computed(() => {
  return craftOptions.find(c => c.id === selectedCraftId.value) || craftOptions[0];
});

// 3. 克重与实时价格测算
const weight = ref(12.5); // 默认克重 12.5 克

// 单克综合价格 (大盘 + 工费)
const unitPrice = computed(() => {
  return Number(basePrice.value || 0) + Number(craftFee.value || 0);
});

// 金料总价
const materialTotal = computed(() => {
  return Number(weight.value || 0) * Number(basePrice.value || 0);
});

// 工费总额
const craftFeeTotal = computed(() => {
  return Number(weight.value || 0) * Number(craftFee.value || 0);
});

// 结算总价: 克重 * (大盘金价 + 工费)
const totalPrice = computed(() => {
  return Number(weight.value || 0) * unitPrice.value;
});

// 格式化金额展示
const formatMoney = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// 4. 商家信息与自定义配置
const showCustomSettings = ref(false);
const merchant = reactive({
  shopName: '水贝·老周珠宝',
  contact: '微信/电话: 138-8888-6666',
  productName: '【今日主推】古法金祥云福字手镯'
});

// 5. 产品实拍图上传处理
const uploadedImage = ref(null);
const fileInputRef = ref(null);

const triggerUpload = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 限制图片大小 5MB
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小请控制在 5MB 以内');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const resetImage = () => {
  uploadedImage.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

// 格式化今日日期
const todayDateString = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
});

// 6. 朋友圈海报生成与导出 (html2canvas / Canvas)
const posterNodeRef = ref(null);
const isGenerating = ref(false);
const showPosterModal = ref(false);
const posterImageUrl = ref('');

// 动态加载 html2canvas 确保在任何环境可用
const loadHtml2Canvas = async () => {
  if (window.html2canvas) {
    return window.html2canvas;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload = () => resolve(window.html2canvas);
    script.onerror = () => reject(new Error('html2canvas 加载失败'));
    document.head.appendChild(script);
  });
};

const generateAndSavePoster = async () => {
  if (!posterNodeRef.value) return;
  isGenerating.value = true;

  try {
    const html2canvas = await loadHtml2Canvas();
    
    // 生成高清 Canvas (使用整倍数 2 避免非整倍数导致的亚像素文字渲染变形截断)
    const canvas = await html2canvas(posterNodeRef.value, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#111217',
      logging: false
    });

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    posterImageUrl.value = dataUrl;
    showPosterModal.value = true;

    // 尝试触发自动下载
    triggerManualDownload();
  } catch (err) {
    console.error('海报生成失败:', err);
    alert('海报生成失败，请稍后重试或检查图片资源');
  } finally {
    isGenerating.value = false;
  }
};

const triggerManualDownload = () => {
  if (!posterImageUrl.value) return;
  const link = document.createElement('a');
  link.download = `水贝金价海报_${merchant.shopName}_${todayDateString.value}.png`;
  link.href = posterImageUrl.value;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
/* 隐藏 Chrome, Safari, Edge, Opera 输入框默认箭头 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* 隐藏 Firefox 输入框默认箭头 */
input[type=number] {
  -moz-appearance: textfield;
}

/* 隐藏滚动条 */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
