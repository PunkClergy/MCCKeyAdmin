# WiseLink Auto Global（MCCKey）多语言说明文档

> uni-app + Vue3 海外车控 App，支持 App-Plus / 微信小程序多端。本文档说明项目多语言（i18n）架构、接入规范、默认语言策略、本次改造范围与验收方式。

| 项目信息 | 值 |
| --- | --- |
| 应用名称 | WiseLink Auto Global |
| 包名 | `net.wiselink.auto` |
| versionName / versionCode | `1.3.3` / `260916` |
| 技术栈 | uni-app（Vue3，含 `.nvue` / Weex），HBuilderX 编译 |
| 后端接口 | `https://k1sw.wiselink.net.cn`（业务成功码 `1000`，登录失效码 `9000`） |

---

## 1. 支持语种（9 种）

前端 storage 内部码与后端 `lang` 请求头标准码的映射见 `utils/request/http.js` 的 `langCodeMap`。

| 内部码（storage `language`） | 后端 lang 头 | 语言名称 |
| --- | --- | --- |
| `zhCn` | `zh_CN` | 简体中文 |
| `enUs` | `en_US` | English（默认） |
| `msMy` | `ms_MY` | Bahasa Melayu |
| `ptBr` | `pt_BR` | Português (Brasil) |
| `taSg` | `ta_SG` | தமிழ் (Singapore) |
| `thTh` | `th_TH` | ภาษาไทย |
| `idId` | `id_ID` | Bahasa Indonesia |
| `miNz` | `mi_NZ` | Te Reo Māori |
| `esEs` | `es_ES` | Español |

> 词库中少量历史键保留了 `jaJp`（日语）字段，前端默认逻辑不启用，仅为历史兼容保留，无需维护翻译。

---

## 2. 多语言架构（三条通道）

| 通道 | 位置 | 职责 | 说明 |
| --- | --- | --- | --- |
| A 前端词库 | `utils/langtips.js`、`utils/langtitle.js` | 前端静态 UI 文案、导航标题 | 页面通过 `tips.Key[lang]` / `titles[route][lang]` 取值 |
| B 后端多语 | 接口响应 `multiName` / `multiText` / `msg`，请求头 `lang` | 字典化业务数据（菜单、权限树、区域等）与服务端提示 | 前端直出，缺失时用前端兜底词条 |
| C Hybrid 地图页 | `hybrid/html/js/position.js`、`risk.js`、`trajectory.js`、`sendKey.js` | 地图页按钮与兜底提示文案 | 内置 `buttonTexts` 9 语对象，`DEFAULT_LANG = 'enUs'` |

### 数据流
1. 页面 `onShow` 读取 `uni.getStorageSync('language')`，无缓存时默认 `enUs`。
2. `http.js` 请求拦截器把内部码映射为后端标准码写入请求头 `lang`，同时注入 `token`、`funAreaId`、`programType`。
3. 前端展示静态文案走通道 A；字典数据展示 `item.multiName` 等走通道 B；地图页走通道 C。

---

## 3. 词库文件

| 文件 | 内容 | 规模 |
| --- | --- | --- |
| `utils/langtips.js` | 全部功能文案键 `export const tips = { ... }` | 410 键，9 语齐全 |
| `utils/langtitle.js` | 页面导航标题键 `export const titles = { ... }`，键为页面路由 | 24 键，9 语齐全 |

词条块固定 9 语顺序：`zhCn → enUs → msMy → ptBr → taSg → thTh → idId → miNz → esEs`，每个语种值不得留空。

### 新增词条示例

在 `langtips.js` 末尾 `}` 前追加（逗号、缩进与既有块保持一致，文件为 CRLF 换行）：

```js
"ConfirmUploadPhotos": {
    "zhCn": "确认上传照片",
    "enUs": "Confirm Upload Photos",
    "msMy": "Sahkan Muat Naik Foto",
    "ptBr": "Confirmar Enviar Fotos",
    "taSg": "புகைப்படங்களைப் பதிவேற்ற உறுதிசெய்",
    "thTh": "ยืนยันอัปโหลดรูปภาพ",
    "idId": "Konfirmasi Unggah Foto",
    "miNz": "Whakaū te tuku whakaahua",
    "esEs": "Confirmar subida de fotos"
},
```

导航标题词条（`langtitle.js`）以路由为键，例如 `"zoneCenter/control": { ... }`。

---

## 4. 页面接入规范（开发者指南）

### 4.1 引入与挂载

```js
import { tips } from '@/utils/langtips.js'
import { titles } from '@/utils/langtitle.js'

export default {
  data() {
    return {
      lang: 'enUs',   // 初始默认值；onShow 以本地缓存覆盖
      tips: tips
    }
  },
  onShow() {
    this.lang = uni.getStorageSync('language') || 'enUs'
    uni.setNavigationBarTitle({ title: titles['路由名'][this.lang] })
  }
}
```

### 4.2 取值写法

| 场景 | 正确写法 | 备注 |
| --- | --- | --- |
| 模板文本 | `{{ tips.Key[lang] }}` | 模板直接用 `lang` |
| 方法内 toast / 弹窗 | `this.tips.Key[this.lang]` | 必须带 `this.` |
| 导航标题 | `titles['路由名'][this.lang]` | 路由键需存在于 `langtitle.js` |
| 后端数据兜底 | `res.msg || this.tips.Key[this.lang]` | `res.msg` 直出，仅在为空时兜底 |

> **注意**：模板内不要使用 `tips?.Key[lang]` 可选链写法（微信小程序 WXML 编译对 `?.` 后接下标转译不稳，可能导致文案空白）；`tips` 已在 `data` 挂载，直接点号访问即可。

### 4.3 语言切换
- 存储键：`uni.setStorageSync('language', value)`，选项值即内部码（见第 1 节表）。
- 语言选择列表（个人中心）按 9 语本名展示，切换后刷新当前页数据与标题。

### 4.4 默认语言策略
- **新用户（本地无 `language` 记录）：默认英文 `enUs`**，与后端 `http.js` 默认 `en_US` 保持一致。
- **老用户（已手动选过语言）：一律以本地 `language` 存储值为准**，默认值不覆盖用户选择。

---

## 5. 本次改造范围

### 5.1 网络层
- `utils/request/http.js`：`lang` 头由原先错误的正则写法改为显式 `langCodeMap` 9 语标准码映射，默认 `en_US`；`token` 注入与 `9000` 跳登录逻辑保持不变。

### 5.2 词库扩展
- `utils/langtips.js`：268 → **410 键**，补齐预检、还车、围栏、用车、风控、空态/加载/报错等文案。
- `utils/langtitle.js`：18 → **24 键**，补齐各功能页导航标题。

### 5.3 页面与组件（按分组）

| 分组 | 文件 |
| --- | --- |
| 启动 / 登录 / 注册 | `App.vue`、`pages/login/index.vue`、`pages/userCenter/register.vue`、`pages/userCenter/completeCustomerInfo.vue` |
| 首页 / 个人中心 | `pages/index/index.vue`、`pages/userCenter/index.vue`、`pages/userCenter/K7.vue`、`pages/userCenter/userGuide.vue` |
| 功能中心 | `pages/zoneCenter/index.vue`、`control.vue`、`onlineCarHailing.vue`、`netKeySending.vue`、`sendKeyToRenter.vue`、`maintainRemind.vue`、`returnPhotos.vue`、`returnRecord.vue`、`alarmOutOfFence.vue`、`carKeyConfig.vue`、`bizKeyConfig.vue`、`carServiceKey.nvue`、`userRole.vue`、`rolePermission.vue`、`transferAdmin.vue`、`alarmDeviceRemove.vue` |
| 控车 / 轨迹 / 风控（nvue） | `position.nvue`、`trajectory.nvue`、`riskManagement.nvue` |
| 公共组件 | `components/custom-header/index.vue`、`components/custom-header/index.nvue` |
| Hybrid 地图脚本 | `hybrid/html/js/position.js`、`risk.js`、`trajectory.js`、`sendKey.js` |

### 5.4 同步修复的确定性缺陷
- `control.vue`：缺失键 `ConfirmBtn` 复用现有 `Confirm`；方法内 `this.tips.Tip[lang]` 补 `this.lang`；解绑确认弹窗全角括号改为中性 `[]`。
- `maintainRemind.vue`：方法内裸 `tips[lang]` 改为 `this.tips.X[this.lang]`。
- `netKeySending.vue`：修复 `<label>` 漏 `{{ }}` 插值；picker 选项按语言重建。
- `register.vue`：补齐 `data.lang` 声明；空白绑定改为合法词条。
- `onlineCarHailing.vue`：修复一处 `this.tips?.Edit[lang]` 漏 `this.lang`；免责说明、删除/解绑确认等文案词条化。
- 各页面初始占位中文（picker 选项、按钮初始态）清空为 `''`，运行时由 `onShow` 用词条重建，避免首帧闪现中文。

---

## 6. 明确不改的边界（合规保留项）

| 保留项 | 原因 |
| --- | --- |
| 后端 `res.msg` / `data.msg` / `response.msg` 直出 | 服务端按 `lang` 头返回多语；前端只加 `\|\| 兜底词条`，不替换 msg 本身 |
| `pages.json` 导航标题、`manifest.json` 权限说明、Hybrid HTML `<title>` | 约定不在前端词库改造范围 |
| 业务提交枚举值：`'一键启动'`、`'智信通'`、`currentArea='国内'`、操作码、picker `value: 1/0`、字段名 `namezhCn` | 提交给后端的数据值，非展示文案 |
| 不渲染死数据（如 `rolePermission.c_tabs`、未使用的初始占位） | 模板不消费，不做词条化 |
| 语言列表本名（中文 / English / Bahasa Melayu …） | 名称按原名展示，不翻译 |
| `console.*` 调试输出、代码注释、`utils/tips.js`、`utils/public.js`、`components/MapCom`、`DomVideoPlayer.vue` | 死代码或注释，不属于 UI 文案 |

---

## 7. 校验结果

| 校验项 | 方式 | 结果 |
| --- | --- | --- |
| 词库 JS 语法 | `node --check`（ESM） | `langtips.js`、`langtitle.js` 均通过 |
| 9 语完整性 | 逐键比对 9 语种缺失 / 空值 | tips 410、titles 24，缺失 0、空值 0 |
| 词条引用存在性 | 全量提取 `tips.Key[lang]`、`titles[route][lang]` 与词库求差 | 悬空引用 0 |
| 方法区引用规范 | 扫描裸 `tips[lang]`、缺 `this.lang` | 0 处 |
| 模板插值 / 标签配平 | `{{ }}`、`<template>` 配平检查 | 0 异常 |
| 换行符 | 字节级 CRLF / 裸 LF 统计 | 改动文件全部 CRLF（Hybrid `position.js` 保持原 LF），无混合 |

---

## 8. 验收测试清单

1. **默认语言**：清除模拟器缓存（`uni.removeStorageSync('language')` 或开发者工具「清除全部缓存」）后冷启动，登录页 / 首页 / 功能区默认英文。
2. **切换语言**：个人中心依次切换 8 种语言，导航标题、按钮、toast、空态、加载态、报错提示同步切换；切回中文后重进保持中文（用户选择优先）。
3. **重点页面回归**：K7 预检页日志、还车照片、围栏报警、发送电子钥匙、网约车免责弹窗与删除解绑、4 个 nvue 页面空态 / 加载 / 网络错误。
4. **网络与异常**：断网或接口失败时，兜底 toast 正常显示且不报错；后端 `msg` 有值时优先展示服务端文案。
5. **老用户兼容**：已存 `language` 的账号进入后仍按所选语言展示，不受默认英文影响。
6. **小程序编译**：确认无 `?.` 模板报错、无词条空白（`undefined` 直接渲染）。

---

## 9. 目录速查

```
utils/
  langtips.js            # 静态文案词库（410 键）
  langtitle.js           # 导航标题词库（24 键）
  request/http.js        # 请求拦截：lang 头映射、token 注入、9000 跳登录
pages/
  login/                 # 登录
  index/                 # 首页（功能专区展开 / 收起：Expand / Collapse）
  userCenter/            # 个人中心、注册、完善资料、K7 预检、使用指南
  zoneCenter/            # 功能中心各业务页（含 nvue 控车 / 轨迹 / 风控）
components/
  custom-header/         # 自定义头部（.vue + .nvue）
hybrid/html/js/          # 地图页内置 9 语文案
```

> 备份：词库改动前原始版本已在开发工作区备份，需要回滚时以备份覆盖 `langtips.js` / `langtitle.js` 即可。

---

## 10. 更新记录（Changelog）

> 格式：版本号（`versionName` / `versionCode`）· 日期 · 分组（新增 / 优化 / 修复 / 变更）。新记录追加在表格顶部。未升级 `versionCode` 的迭代按"批次"标注在对应版本下。

### v1.3.3（260916）— 2026-10-30 · 新增西班牙语（esEs）批次

**新增**
- 新增第 9 语种西班牙语：内部码 `esEs`，后端标准码 `es_ES`；个人中心语言列表新增 `Español` 选项。
- `utils/langtips.js`（410 键）、`utils/langtitle.js`（24 键）全部补齐 `esEs` 词条，覆盖导航标题、按钮、toast、K7 预检说明、免责条款、更新提示等。
- 4 个 Hybrid 地图脚本 `buttonTexts`、`addressFail`、`mapSdkNotReady` 补齐西语；`sendKey.js` 谷歌 geocode `langMap` 增加 `esEs: 'es-ES'`（其余脚本由内部码自动推导为 `es-es`）。
- `utils/request/http.js` 的 `langCodeMap` 增加 `esEs: 'es_ES'`。

**变更**
- 默认语言仍为 `enUs`；西班牙语仅作为可选语言，不改变新用户默认值与老用户本地选择。

**校验**
- 9 语缺失 0、空值 0；tips / titles 悬空引用 0；模板配平 0；两个词库与 4 个 Hybrid 脚本 `node --check` 通过；词库文件保持 CRLF、零裸 LF。

### v1.3.3（260916）— 2026-10-30 · 多语言补齐批次

**新增**
- 接入 8 语种体系：`zhCn`、`enUs`、`msMy`、`ptBr`、`taSg`、`thTh`、`idId`、`miNz`，前端 storage 键统一为 `language`。
- 静态文案词库 `utils/langtips.js` 扩展至 **410 键**（原 268 键）。
- 导航标题词库 `utils/langtitle.js` 扩展至 **24 键**（原 18 键）。
- 登录 / 注册 / 首页 / 个人中心 / K7 预检 / 使用指南 / 还车照片 / 围栏报警 / 发送电子钥匙 / 网约车列表等页面文案词条化。
- 4 个 Hybrid 地图脚本（`position` / `risk` / `trajectory` / `sendKey`）内置 8 语 `buttonTexts`。

**优化**
- `utils/request/http.js` 新增显式 `langCodeMap`，前端内部码 ↔ 后端标准码（如 `zhCn→zh_CN`、`enUs→en_US`），替代原先不稳定的正则写法。
- 4 个 `nvue` 页面（控车 / 轨迹 / 风控 / 车务钥匙）及 `custom-header` 双端（`.vue` / `.nvue`）统一接入词条取值。
- 各页面 picker 选项、按钮初始态改为运行时按当前语言重建，避免首帧闪现中文。
- 后端 `res.msg` 与前端兜底词条组合展示：服务端有值优先直出，为空时回退前端词条。

**修复**
- 首页功能区「展开 / 收起」（`Expand` / `Collapse`）模板可选链 `tips?.Key[lang]` 在小程序 WXML 编译不稳导致文案不显示，改为直接点号访问。
- `control.vue`：缺失引用 `ConfirmBtn` 复用 `Confirm`；补全 `this.lang` 绑定；确认弹窗全角括号改为中性分隔符。
- `maintainRemind.vue`：方法内裸 `tips[lang]` 改为 `this.tips.Key[this.lang]`。
- `netKeySending.vue`：修复 `<label>` 缺失 `{{ }}` 插值；picker 选项按语言重建。
- `onlineCarHailing.vue`：修复一处 `this.tips?.Edit[lang]` 漏 `this.lang`。
- `register.vue`：补齐 `data.lang` 声明；空白绑定替换为合法词条。
- `completeCustomerInfo.vue` / `login/index.vue`：修正默认语言码与 `pageRoute`，清理废弃 `langs: {}` 空对象。

**变更（默认语言策略）**
- 无本地语言记录的新用户默认英文 `enUs`（与后端默认 `en_US` 对齐）；已选择过语言的老用户继续沿用本地存储值，默认值不覆盖用户选择。
- 批量统一 28 个页面 / 组件文件：26 处 `data.lang` 初始值、30 处读取兜底 `|| 'zhCn'` 改为 `|| 'enUs'`。

**边界保留（本次刻意不改）**
- `pages.json` 导航标题、`manifest.json` 权限说明、Hybrid HTML `<title>` 未词条化。
- 业务提交值（`'一键启动'`、`'智信通'`、`currentArea='国内'`、操作码、picker `value: 1/0`、后端字段 `namezhCn`）保持原样。
- 死代码与注释（`utils/tips.js`、`utils/public.js`、`components/MapCom`、`DomVideoPlayer.vue` 等）未纳入改造。

**校验**
- tips / titles 悬空引用 0；模板插值与标签配平 0 异常；方法区引用规范 0 问题；词库 8 语缺失 0、空值 0；改动文件换行统一 CRLF。

### 待填写模板（后续迭代复制使用）

```markdown
### vX.Y.Z（versionCode）— YYYY-MM-DD · 批次名
**新增**：
**优化**：
**修复**：
**变更**：
**校验 / 回归**：
```

