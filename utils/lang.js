/**
 * 全局语言解析（唯一出口）
 * 规则：只认 9 种受支持的语言码；存储值缺失、为空、非法或无法识别时，一律回落到英语 enUs。
 * 不要在各页面里自行拼 fallback，统一调用 getLang() / setLang() / initLang()。
 */
export const DEFAULT_LANG = 'enUs'

export const SUPPORTED_LANGS = ['zhCn', 'enUs', 'msMy', 'ptBr', 'taSg', 'thTh', 'idId', 'miNz', 'esEs']

// 常见别名（系统语言码、旧值、大小写变体）→ 内部语言码
const LANG_ALIAS = {
	zhcn: 'zhCn', 'zh-cn': 'zhCn', zh_cn: 'zhCn', zh_hans: 'zhCn', 'zh-hans': 'zhCn',
	zh_hant: 'zhCn', 'zh-hant': 'zhCn', zhs: 'zhCn', zht: 'zhCn', zh: 'zhCn', cn: 'zhCn', chinese: 'zhCn',
	enus: 'enUs', 'en-us': 'enUs', en_us: 'enUs', en: 'enUs', eng: 'enUs', english: 'enUs',
	msmy: 'msMy', 'ms-my': 'msMy', ms_my: 'msMy', ms: 'msMy', malay: 'msMy',
	ptbr: 'ptBr', 'pt-br': 'ptBr', pt_br: 'ptBr', pt: 'ptBr', 'pt-pt': 'ptBr', portuguese: 'ptBr',
	tasg: 'taSg', 'ta-sg': 'taSg', ta_sg: 'taSg', ta: 'taSg', tamil: 'taSg',
	thth: 'thTh', 'th-th': 'thTh', th_th: 'thTh', th: 'thTh', thai: 'thTh',
	idid: 'idId', 'id-id': 'idId', id_id: 'idId', id: 'idId', inid: 'idId', 'in-id': 'idId', indonesian: 'idId',
	minz: 'miNz', 'mi-nz': 'miNz', mi_nz: 'miNz', mi: 'miNz', maori: 'miNz',
	eses: 'esEs', 'es-es': 'esEs', es_es: 'esEs', es: 'esEs', 'es-419': 'esEs', spanish: 'esEs'
}

/**
 * 把任意输入归一化成受支持的语言码；识别不了就返回 DEFAULT_LANG。
 * @param {*} raw
 * @returns {string}
 */
export function normalizeLang(raw) {
	if (typeof raw !== 'string') return DEFAULT_LANG
	const key = raw.trim()
	if (!key) return DEFAULT_LANG
	if (SUPPORTED_LANGS.indexOf(key) >= 0) return key
	const hit = LANG_ALIAS[key.toLowerCase()]
	return hit || DEFAULT_LANG
}

/** 当前语言；检测不到一律英语 */
export function getLang() {
	return normalizeLang(uni.getStorageSync('language'))
}

/** 写入语言（先归一化，永远不会写进脏值）；返回最终生效的语言码 */
export function setLang(raw) {
	const lang = normalizeLang(raw)
	uni.setStorageSync('language', lang)
	return lang
}

/** App 启动时调用：纠正历史脏值并回写，保证全应用读到同一个值 */
export function initLang() {
	return setLang(uni.getStorageSync('language'))
}
