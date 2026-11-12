<template>
	<view class="sk-page" :style="{ height: screenHeight + 'px' }">
		<!-- 装饰性背景光效（保持原有天蓝主题） -->
		<view class="sk-glow sk-glow--1"></view>
		<view class="sk-glow sk-glow--2"></view>
		<view class="sk-glow sk-glow--3"></view>

		<!-- ===== 主卡片 ===== -->
		<view class="sk-shell">
			<!-- 顶部分段切换 -->
			<view class="sk-seg">
				<view class="sk-seg__item" :class="{ 'sk-seg__item--on': activeTab === 1 }" @tap.stop="switchTab(1)">
					{{ tips.SendKey[lang] }}
				</view>
				<view class="sk-seg__item" :class="{ 'sk-seg__item--on': activeTab === 2 }" @tap.stop="switchTab(2)">
					{{ tips.UsageLogs[lang] }}
				</view>
			</view>

			<view class="sk-body">
				<!-- ===== Tab1：车辆列表 ===== -->
				<view v-if="activeTab === 1" class="sk-pane">
					<scroll-view scroll-y class="sk-scroll" @scrolltolower="loadCarList" :show-scrollbar="false">
						<view class="sk-car" v-for="(item, idx) in carList" :key="idx">
							<view class="sk-car__head">
								<view class="sk-plate">
									<image src="/static/car_icon.png" class="sk-plate__icon" mode="aspectFit" />
									<text class="sk-plate__text">{{ item.platenumber }}</text>
								</view>
								<text class="sk-car__model" v-if="!item.bluetoothKey">{{ item.vehicleSerialName || '-' }} {{ item.vehicleModeName || '' }}</text>
							</view>
							<view class="sk-specs">
								<view class="sk-spec" v-if="!item.bluetoothKey">
									<text class="sk-spec__k">{{ tips.VIN[lang] }}</text>
									<text class="sk-spec__v">{{ item.vin || '-' }}</text>
								</view>
								<view class="sk-spec" v-if="!item.bluetoothKey">
									<text class="sk-spec__k">{{ tips.FuelCapacity[lang] }}</text>
									<text class="sk-spec__v">{{ item.xsgw ? item.xsgw + 'L' : '-' }}</text>
								</view>
								<view class="sk-spec">
									<text class="sk-spec__k">{{ tips.DeviceID[lang] }}</text>
									<text class="sk-spec__v">{{ item.sn || '-' }}</text>
								</view>
							</view>
							<view class="sk-car__foot">
								<view class="sk-btn-sm" :data-item="item" @tap="openSendKeyModal">{{ tips.SendKey[lang] }}</view>
							</view>
						</view>
						<view class="sk-empty" v-if="carList.length < 1">
							<view class="sk-empty__ring">
								<image src="/static/car_icon.png" class="sk-empty__icon" mode="aspectFit" />
							</view>
							<text class="sk-empty__text">{{ tips.NoData[lang] }}</text>
						</view>
					</scroll-view>
				</view>

				<!-- ===== Tab2：使用记录 ===== -->
				<view v-if="activeTab === 2" class="sk-pane">
					<view class="sk-filter">
						<view class="sk-search">
							<icon type="search" size="14" color="#4facfe" class="sk-search__icon" />
							<input class="sk-search__input" :placeholder="tips.PlateDeviceUser[lang]" placeholder-style="color:#a9bccf" @blur="onSearchBlur" />
						</view>
						<view class="sk-filter__row">
							<view class="sk-chips">
								<view class="sk-chip" :class="{ 'sk-chip--on': recordStatus == 0 }" @tap="changeRecordStatus" data-id="0">
									{{ tips.InUse[lang] }}
								</view>
								<view class="sk-chip" :class="{ 'sk-chip--on': recordStatus == 1 }" @tap="changeRecordStatus" data-id="1">
									{{ tips.Expired[lang] }}
								</view>
							</view>
							<view class="sk-total">
								<text>{{ tips.Total[lang] }}</text>
								<text class="sk-total__num">{{ recordTotal }}</text>
								<text>{{ tips.Records[lang] }}</text>
							</view>
						</view>
					</view>
					<scroll-view scroll-y class="sk-scroll" @scrolltolower="loadRecordList" :show-scrollbar="false">
						<view class="sk-rec" v-for="(item, idx) in recordList" :key="idx">
							<view class="sk-rec__head">
								<view class="sk-plate sk-plate--sm">
									<text class="sk-plate__text">{{ item.platenumber }}</text>
								</view>
								<view class="sk-tag sk-tag--on" v-if="item.status == 0">
									<view class="sk-tag__dot"></view>
									<text>{{ tips.InUse[lang] }}</text>
								</view>
								<view class="sk-tag sk-tag--off" v-else>
									<view class="sk-tag__dot"></view>
									<text>{{ tips.Expired[lang] }}</text>
								</view>
							</view>
							<view class="sk-rec__meta">
								<text class="sk-rec__user">{{ item.personname }}</text>
								<text class="sk-rec__dot">·</text>
								<text class="sk-rec__phone">{{ item.mobile }}</text>
							</view>
							<view class="sk-rec__period">
								<text>{{ item.startdate || '-' }}</text>
								<text class="sk-rec__arrow">→</text>
								<text>{{ item.enddate || '-' }}</text>
							</view>
							<view class="sk-rec__ops">
								<block v-if="!item.status">
									<view class="sk-link" @tap="openEditKeyModal" :data-item="item">{{ tips.Edit[lang] }}</view>
									<view class="sk-flex"></view>
									<view class="sk-op sk-op--ghost" @tap="copyLink" :data-item="item">{{ copied ? tips.Copied[lang] : tips.CopyLink[lang] }}</view>
									<view class="sk-op sk-op--danger" @tap="cancelRentKey" :data-item="item">{{ tips.CancelCarUse[lang] }}</view>
								</block>
								<block v-else>
									<view class="sk-flex"></view>
									<view class="sk-op sk-op--ghost" @tap="previewImages" :data-item="item">{{ tips.ViewPhotos[lang] }}</view>
								</block>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 底部固定按钮 -->
			<view class="sk-footbar">
				<view class="sk-cta" @tap="openGlobalSendModal">{{ tips.SendKey[lang] }}</view>
			</view>
		</view>

		<!-- ====== 下发钥匙弹窗 ====== -->
		<view class="sk-mask" v-if="showSendModal" @tap="closeSendKeyModal"></view>
		<view class="sk-sheet" v-if="showSendModal">
			<view class="sk-grabber"></view>
			<form @submit="submitSendKey">
				<view class="sk-sheet__inner">
					<view class="sk-sheet__head">
						<text class="sk-sheet__title">{{ tips.SendKey[lang] }}</text>
						<view class="sk-close" @tap="closeSendKeyModal">✕</view>
					</view>
					<scroll-view scroll-y class="sk-sheet__body" :show-scrollbar="false">
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.PlateNo[lang] }}</text>
							<view class="sk-row__ctl">
								<view v-if="isManualInput" class="sk-input-wrap">
									<input class="sk-input" @focus="onInputFocus" @blur="onInputBlur"
									:placeholder="tips.EnterPlateNo[lang]" placeholder-style="color:#a9bccf" name="platenumber" :value="searchKeyword"
									@input="onSearchInput" confirm-type="search" />
									<view v-if="searchList.length > 0 && searchKeyword.trim() !== ''" class="sk-drop">
										<view class="sk-drop__item" v-for="(item, idx) in searchList" :key="idx" @tap="selectPlate" :data-item="item">
											{{ item.platenumber }}
										</view>
									</view>
								</view>
								<text v-else class="sk-static">{{ selectCarData.platenumber }}</text>
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.User[lang] }}</text>
							<view class="sk-row__ctl">
								<input class="sk-input" @focus="onInputFocus" @blur="onInputBlur" :placeholder="tips.EnterUser[lang]" placeholder-style="color:#a9bccf" name="personName" />
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.StartTime[lang] }}</text>
							<view class="sk-row__ctl sk-row__ctl--pickers">
								<picker mode="date" data-index="startDate" @change="changeDateTime">
									<view class="sk-picker"><text>{{ startDate }}</text><text class="sk-caret">›</text></view>
								</picker>
								<picker mode="time" data-index="startTime" @change="changeDateTime">
									<view class="sk-picker sk-picker--gap"><text>{{ startTime }}</text><text class="sk-caret">›</text></view>
								</picker>
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.EndTime[lang] }}</text>
							<view class="sk-row__ctl sk-row__ctl--pickers">
								<picker mode="date" data-index="endDate" @change="changeDateTime">
									<view class="sk-picker"><text>{{ endDate }}</text><text class="sk-caret">›</text></view>
								</picker>
								<picker mode="time" data-index="endTime" @change="changeDateTime">
									<view class="sk-picker sk-picker--gap"><text>{{ endTime }}</text><text class="sk-caret">›</text></view>
								</picker>
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.MultiUserAllowed[lang] }}</text>
							<view class="sk-row__ctl">
								<picker mode="selector" :range="multiOptions" range-key="name" @change="changeMultiSelect" :value="multiIndex">
									<view class="sk-picker"><text>{{ multiOptions[multiIndex].name }}</text><text class="sk-caret">›</text></view>
								</picker>
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.Remark[lang] }}</text>
							<view class="sk-row__ctl">
								<input class="sk-input" :placeholder="tips.EnterParkingPos[lang]" placeholder-style="color:#a9bccf" name="bak" />
							</view>
						</view>
					</scroll-view>
					<view class="sk-sheet__foot">
						<button form-type="submit" class="sk-submit">{{ tips.Confirm[lang] }}</button>
					</view>
				</view>
			</form>
		</view>

		<!-- ====== 编辑钥匙弹窗 ====== -->
		<view class="sk-mask" v-if="showEditModal" @tap="closeEditKeyModal"></view>
		<view class="sk-sheet" v-if="showEditModal">
			<view class="sk-grabber"></view>
			<form @submit="submitEditKey">
				<view class="sk-sheet__inner">
					<view class="sk-sheet__head">
						<text class="sk-sheet__title">{{ tips.Edit[lang] }}</text>
						<view class="sk-close" @tap="closeEditKeyModal">✕</view>
					</view>
					<scroll-view scroll-y class="sk-sheet__body" :show-scrollbar="false">
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.PlateNo[lang] }}</text>
							<text class="sk-static">{{ editRecordData.platenumber }}</text>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.User[lang] }}</text>
							<text class="sk-static">{{ editRecordData.personname }}</text>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.StartTime[lang] }}</text>
							<view class="sk-row__ctl sk-row__ctl--pickers">
								<picker mode="date" data-index="startDate" @change="changeDateTime">
									<view class="sk-picker"><text>{{ startDate }}</text><text class="sk-caret">›</text></view>
								</picker>
								<picker mode="time" data-index="startTime" @change="changeDateTime">
									<view class="sk-picker sk-picker--gap"><text>{{ startTime }}</text><text class="sk-caret">›</text></view>
								</picker>
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.EndTime[lang] }}</text>
							<view class="sk-row__ctl sk-row__ctl--pickers">
								<picker mode="date" data-index="endDate" @change="changeDateTime">
									<view class="sk-picker"><text>{{ endDate }}</text><text class="sk-caret">›</text></view>
								</picker>
								<picker mode="time" data-index="endTime" @change="changeDateTime">
									<view class="sk-picker sk-picker--gap"><text>{{ endTime }}</text><text class="sk-caret">›</text></view>
								</picker>
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.MultiUserAllowed[lang] }}</text>
							<view class="sk-row__ctl">
								<picker mode="selector" :range="multiOptions" range-key="name" @change="changeMultiSelect" :value="multiIndex">
									<view class="sk-picker"><text>{{ multiOptions[multiIndex].name }}</text><text class="sk-caret">›</text></view>
								</picker>
							</view>
						</view>
						<view class="sk-row">
							<text class="sk-row__label">{{ tips.Remark[lang] }}</text>
							<text class="sk-static">{{ editRecordData.bak || '-' }}</text>
						</view>
					</scroll-view>
					<view class="sk-sheet__foot">
						<button form-type="submit" class="sk-submit">{{ tips.Confirm[lang] }}</button>
					</view>
				</view>
			</form>
		</view>
	</view>
</template>

<script>
	import {
		u_addOrUpdate,
		u_updateRentKey,
		u_carList,
		u_rentRecord,
		u_sendRentKey,
		u_cancelRentKey
	} from '@/api/index'
	import {
		titles
	} from '@/utils/langtitle.js'
	import {
		tips
	} from '@/utils/langtips.js'
	export default {
		data() {
			return {
				screenHeight: 0,
				screenWidth: 0,
				statusBarHeight: 0,
				carPage: 1,
				carList: [],
				imgDomain: 'https://fin3.wiselink.net.cn/fin/',
				recordList: [],
				recordPage: 1,
				activeTab: 1,
				showSendModal: false,
				startDate: '',
				startTime: '',
				endDate: '',
				endTime: '',
				copied: false,
				showEditModal: false,
				editRecordData: {},
				isManualInput: false,
				recordStatus: '0',
				searchKeyword: '',
				multiOptions: [{ name: '', value: 1 }, { name: '', value: 0 }],
				multiIndex: 0,
				openType: 1,
				searchList: [],
				showSearchList: false,
				searchTimer: null,
				selectCarData: {},
				vehId: '',
				recordTotal: 0,
				searchParam: '',
				lang: 'enUs',
				tips: tips
			}
		},
		methods: {
			// ===== 新增：切换Tab时关闭所有弹窗 =====
			switchTab(tab) {
				this.activeTab = tab;
				// 强制关闭所有弹窗和下拉列表
				this.showSendModal = false;
				this.showEditModal = false;
				this.showSearchList = false;
				this.searchList = [];
				// 如果当前正在编辑状态，重置
				this.isManualInput = false;
			},
			changeOpenType(e) {
				this.openType = e.detail.value
			},
			changeMultiSelect(e) {
				this.multiIndex = e.detail.value
			},
			onSearchInput(e) {
				const val = e.detail.value.trim()
				this.searchKeyword = val
				clearTimeout(this.searchTimer)
				this.searchTimer = setTimeout(() => {
					this.doSearchFilter(val)
				}, 500)
			},
			onInputBlur() {
				this.showSearchList = false
			},
			onInputFocus() {
				this.showSearchList = true
			},
			doSearchFilter(keyword) {
				if (!keyword) {
					this.searchList = []
					return
				}
				const lower = keyword.toLowerCase()
				this.searchList = this.carList.filter(i => i?.platenumber?.toLowerCase().includes(lower))
			},
			selectPlate(e) {
				this.searchKeyword = e.currentTarget.dataset.item.platenumber
				this.searchList = []
			},
			changeRecordStatus(e) {
				this.recordStatus = e.currentTarget.dataset.id
				this.recordPage = 1
				this.recordList = []
				this.getRecordList()
			},
			openGlobalSendModal() {
				this.showEditModal = false
				this.showSendModal = true
				this.isManualInput = true
				this.openType = 1
			},
			initDateTime() {
				const fmtDate = d => {
					const y = d.getFullYear()
					const m = (d.getMonth() + 1).toString().padStart(2, '0')
					const day = d.getDate().toString().padStart(2, '0')
					return `${y}-${m}-${day}`
				}
				const fmtTime = d => {
					const h = d.getHours().toString().padStart(2, '0')
					const mi = d.getMinutes().toString().padStart(2, '0')
					return `${h}:${mi}`
				}
				const now = new Date()
				const tomorrow = new Date(now)
				tomorrow.setDate(now.getDate() + 1)
				this.startDate = fmtDate(now)
				this.endDate = fmtDate(tomorrow)
				this.startTime = fmtTime(now)
				this.endTime = fmtTime(now)
			},
			openSendKeyModal(e) {
				const item = e.currentTarget.dataset.item
				this.selectCarData = item
				this.showEditModal = false
				this.showSendModal = true
				this.vehId = item.id
				this.openType = 1
			},
			closeSendKeyModal() {
				this.selectCarData = {}
				this.searchKeyword = ''
				this.showSendModal = false
				this.isManualInput = false
			},
			closeEditKeyModal() {
				this.showEditModal = false
				this.editRecordData = {}
			},
			loadCarList() {
				this.carPage++
				this.getCarList()
			},
			loadRecordList() {
				this.recordPage++
				this.getRecordList()
			},
			async getCarList() {
				try {
					const res = await u_carList({ page: this.carPage })
					if (res.code === 1000) this.carList = this.carList.concat(res.content)
				} catch (e) {}
			},
			onSearchBlur(e) {
				this.searchParam = e.detail.value
				this.recordPage = 1
				this.recordList = []
				this.getRecordList()
			},
			async getRecordList() {
				try {
					const res = await u_rentRecord({
						page: this.recordPage,
						status: this.recordStatus,
						comParam: this.searchParam || ''
					})
					this.recordTotal = res.count || 0
					this.recordList = [...this.recordList, ...res.content]
				} catch (e) {}
			},
			previewImages(e) {
				const item = e.currentTarget.dataset.item
				if (!item) return
				const imgs = [item.img1, item.img2, item.img3, item.img4, item.img5].filter(Boolean)
				if (!imgs.length) return uni.showToast({ title: this.tips.NoData[this.lang], icon: 'none' })
				const urls = imgs.map(u => this.imgDomain + u.replace(/\\/g, '/'))
				uni.previewImage({ urls })
			},
			async submitSendKey(e) {
				const form = e.detail.value
				if (!form.personName) return uni.showToast({ title: this.tips.EnterUser[this.lang], icon: 'none' })
				const build = (d, t) => `${d} ${t || '00:00'}:00`
				const params = {
					vehId: this.vehId || '',
					client: this.openType,
					startDate: build(this.startDate, this.startTime),
					endDate: build(this.endDate, this.endTime),
					personName: form.personName,
					bak: form.bak,
					platenumber: form.platenumber || '',
					multipleUsed: this.multiOptions[this.multiIndex].value
				}
				try {
					const res = await u_sendRentKey(params)
					if (res.code !== 1000) throw new Error(res.msg)
					this.showSendModal = false
					this.carList = []
					this.recordList = []
					this.recordPage = 1
					setTimeout(() => {
						this.getCarList()
						this.getRecordList()
					}, 1000)
					uni.showModal({ title: this.tips.SendSuccess[this.lang], content: res.msg, showCancel: false })
				} catch (err) {
					uni.showToast({ title: err.message || this.tips.SendFailed[this.lang], icon: 'none' })
				}
			},
			changeDateTime(e) {
				this[e.currentTarget.dataset.index] = e.detail.value
			},
			async cancelRentKey(e) {
				try {
					const code = e.currentTarget.dataset.item.controlcode
					const res = await u_cancelRentKey({ controlCode: code })
					if (res.code === 1000) {
						this.recordList = []
						this.recordPage = 1
						this.getRecordList()
					}
				} catch (e) {}
			},
			copyLink(e) {
				const txt = e.currentTarget.dataset.item.simplecode
				uni.setClipboardData({
					data: txt,
					success: () => {
						uni.showToast({ title: this.tips.CopySuccess[this.lang], icon: 'none' })
						this.copied = true
					}
				})
			},
			openEditKeyModal(e) {
				const item = e.currentTarget.dataset.item
				this.showSendModal = false
				this.openType = item.client || 0
				this.showEditModal = true
				this.editRecordData = item
				this.multiIndex = item.multipleUsed == 0 ? 1 : 0
			},
			async submitEditKey() {
				const build = (d, t) => `${d} ${t || '00:00'}:00`
				const params = {
					client: this.openType,
					controlCode: this.editRecordData.controlcode,
					startDate: build(this.startDate, this.startTime),
					endDate: build(this.endDate, this.endTime),
					multipleUsed: this.multiOptions[this.multiIndex].value
				}
				try {
					const res = await u_updateRentKey(params)
					if (res.code === 1000) {
						this.editRecordData = {}
						this.showEditModal = false
						this.recordList = []
						this.recordPage = 1
						this.getRecordList()
						uni.showModal({ title: this.tips.Tip[this.lang], content: res.msg, showCancel: false })
					}
				} catch (e) {}
			}
		},
		onLoad() {
			uni.getSystemInfo({
				success: res => {
					this.screenHeight = res.windowHeight
					this.screenWidth = res.windowWidth
					this.statusBarHeight = res.statusBarHeight
				}
			})
			this.getCarList()
			this.getRecordList()
		},
		onReady() {
			this.initDateTime()
		},
		onShow() {
			this.lang = uni.getStorageSync('language') || 'enUs';
			const pageRoute = 'zoneCenter/sendKeyToRenter';
			uni.setNavigationBarTitle({ title: titles[pageRoute][this.lang] });
			this.multiOptions = [
				{ name: this.tips.Allow[this.lang], value: 1 },
				{ name: this.tips.Disallow[this.lang], value: 0 }
			];
			this.initDateTime();
		}
	}
</script>

<style scoped>
	/* ============================================================
	   1. 基础 & 滚动条
	   ============================================================ */
	::-webkit-scrollbar,
	scroll-view::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}

	/* ============================================================
	   2. 页面 — 原有天蓝渐变背景
	   ============================================================ */
	.sk-page {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 24rpx 24rpx 0;
		box-sizing: border-box;
		background: linear-gradient(145deg, #e3f2fd 0%, #e3f2fd 20%, #81d4fa 100%);
	}
	.sk-glow {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}
	.sk-glow--1 {
		width: 600rpx;
		height: 600rpx;
		top: -220rpx;
		right: -120rpx;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0) 70%);
	}
	.sk-glow--2 {
		width: 500rpx;
		height: 500rpx;
		bottom: 80rpx;
		left: -160rpx;
		background: radial-gradient(circle, rgba(179, 229, 252, 0.9), rgba(179, 229, 252, 0) 70%);
	}
	.sk-glow--3 {
		width: 420rpx;
		height: 420rpx;
		top: 38%;
		left: 50%;
		transform: translateX(-50%);
		background: radial-gradient(circle, rgba(33, 150, 243, 0.06), rgba(33, 150, 243, 0) 70%);
	}

	/* ============================================================
	   3. 主卡片外壳
	   ============================================================ */
	.sk-shell {
		position: relative;
		z-index: 1;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 16rpx;
		background: rgba(255, 255, 255, 0.58);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1rpx solid rgba(255, 255, 255, 0.88);
		border-radius: 32rpx;
		box-shadow: 0 24rpx 60rpx rgba(19, 96, 160, 0.12);
		overflow: hidden;
		box-sizing: border-box;
	}

	/* ============================================================
	   4. 顶部分段切换
	   ============================================================ */
	.sk-seg {
		flex-shrink: 0;
		display: flex;
		padding: 5rpx;
		margin-bottom: 14rpx;
		background: rgba(255, 255, 255, 0.74);
		border: 1rpx solid rgba(255, 255, 255, 0.96);
		border-radius: 18rpx;
		box-shadow: 0 4rpx 14rpx rgba(19, 96, 160, 0.05);
	}
	.sk-seg__item {
		flex: 1;
		padding: 20rpx 0;
		text-align: center;
		font-size: 27rpx;
		font-weight: 600;
		color: #5f7892;
		border-radius: 14rpx;
		transition: color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
	}
	.sk-seg__item--on {
		color: #ffffff;
		background: linear-gradient(135deg, #4facfe 0%, #1a8cf2 100%);
		box-shadow: 0 8rpx 18rpx rgba(26, 140, 242, 0.24);
	}

	/* ============================================================
	   5. 内容区
	   ============================================================ */
	.sk-body {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.sk-pane {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.sk-scroll {
		flex: 1;
		height: 0;
		width: 100%;
		padding: 4rpx 2rpx 6rpx;
		box-sizing: border-box;
	}

	/* ============================================================
	   6. 记录页筛选区
	   ============================================================ */
	.sk-filter {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		padding: 2rpx 2rpx 14rpx;
	}
	.sk-search {
		display: flex;
		align-items: center;
		height: 76rpx;
		padding: 0 22rpx;
		background: #ffffff;
		border: 1rpx solid #e7f1fa;
		border-radius: 14rpx;
		box-shadow: 0 4rpx 14rpx rgba(19, 96, 160, 0.04);
	}
	.sk-search__icon {
		flex-shrink: 0;
	}
	.sk-search__input {
		flex: 1;
		height: 100%;
		margin-left: 12rpx;
		font-size: 26rpx;
		color: #12283d;
	}
	.sk-filter__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 16rpx;
	}
	.sk-chips {
		display: flex;
		align-items: center;
	}
	.sk-chip {
		margin-right: 12rpx;
		padding: 9rpx 26rpx;
		font-size: 24rpx;
		color: #5f7892;
		background: rgba(255, 255, 255, 0.62);
		border: 1rpx solid #e7f1fa;
		border-radius: 999rpx;
		transition: all 0.2s ease;
	}
	.sk-chip--on {
		color: #1a8cf2;
		font-weight: 600;
		background: rgba(79, 172, 254, 0.12);
		border-color: rgba(79, 172, 254, 0.36);
	}
	.sk-total {
		font-size: 22rpx;
		color: #71869b;
	}
	.sk-total__num {
		margin: 0 6rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: #1a8cf2;
	}

	/* ============================================================
	   7. 车辆卡片
	   ============================================================ */
	.sk-car {
		display: flex;
		flex-direction: column;
		margin-bottom: 18rpx;
		background: #ffffff;
		border: 1rpx solid #eef4fb;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 20rpx rgba(19, 96, 160, 0.05);
		overflow: hidden;
	}
	.sk-car__head {
		display: flex;
		flex-direction: column;
		padding: 24rpx 24rpx 16rpx;
	}
	.sk-plate {
		display: flex;
		align-items: center;
		align-self: flex-start;
		max-width: 100%;
		padding: 6rpx 16rpx 6rpx 12rpx;
		background: #f3f9ff;
		border: 1rpx solid #dcecfb;
		border-radius: 14rpx;
		box-sizing: border-box;
	}
	.sk-plate--sm {
		padding: 4rpx 14rpx;
		border-radius: 12rpx;
	}
	.sk-plate__icon {
		width: 30rpx;
		height: 24rpx;
		margin-right: 10rpx;
		opacity: 0.5;
	}
	.sk-plate__text {
		font-size: 31rpx;
		font-weight: 700;
		color: #0f3d6e;
		letter-spacing: 1rpx;
	}
	.sk-plate--sm .sk-plate__text {
		font-size: 28rpx;
	}
	.sk-car__model {
		margin-top: 10rpx;
		font-size: 23rpx;
		line-height: 32rpx;
		color: #7b90a6;
	}
	.sk-specs {
		padding: 0 24rpx;
	}
	.sk-spec {
		display: flex;
		align-items: flex-start;
		min-height: 68rpx;
		padding: 14rpx 0;
		border-top: 1rpx solid #f2f7fc;
	}
	.sk-spec__k {
		flex: 0 0 210rpx;
		font-size: 23rpx;
		line-height: 36rpx;
		color: #7c91a6;
	}
	.sk-spec__v {
		flex: 1;
		min-width: 0;
		font-size: 26rpx;
		line-height: 36rpx;
		font-weight: 500;
		color: #16324f;
		word-break: break-all;
	}
	.sk-car__foot {
		display: flex;
		justify-content: flex-end;
		padding: 16rpx 24rpx 20rpx;
	}
	.sk-btn-sm {
		height: 64rpx;
		line-height: 64rpx;
		padding: 0 40rpx;
		font-size: 25rpx;
		font-weight: 600;
		letter-spacing: 0.5rpx;
		color: #ffffff;
		background: linear-gradient(135deg, #4facfe 0%, #1a8cf2 100%);
		border-radius: 32rpx;
		box-shadow: 0 8rpx 18rpx rgba(26, 140, 242, 0.2);
		transition: opacity 0.2s ease;
	}
	.sk-btn-sm:active {
		opacity: 0.88;
	}

	/* 空态 */
	.sk-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 96rpx 0 80rpx;
	}
	.sk-empty__ring {
		width: 150rpx;
		height: 150rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.72);
		border: 1rpx solid #e7f1fa;
		border-radius: 50%;
		box-shadow: 0 8rpx 24rpx rgba(19, 96, 160, 0.06);
	}
	.sk-empty__icon {
		width: 72rpx;
		height: 60rpx;
		opacity: 0.35;
	}
	.sk-empty__text {
		margin-top: 22rpx;
		font-size: 25rpx;
		letter-spacing: 0.5rpx;
		color: #8399ad;
	}

	/* ============================================================
	   8. 使用记录卡片
	   ============================================================ */
	.sk-rec {
		margin-bottom: 18rpx;
		padding: 24rpx 24rpx 18rpx;
		background: #ffffff;
		border: 1rpx solid #eef4fb;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 20rpx rgba(19, 96, 160, 0.05);
	}
	.sk-rec__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.sk-tag {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		padding: 5rpx 16rpx;
		font-size: 21rpx;
		border-radius: 999rpx;
	}
	.sk-tag__dot {
		width: 10rpx;
		height: 10rpx;
		margin-right: 8rpx;
		border-radius: 50%;
	}
	.sk-tag--on {
		color: #0aa06e;
		background: #effaf5;
		border: 1rpx solid #d8f2e7;
	}
	.sk-tag--on .sk-tag__dot {
		background: #0aa06e;
	}
	.sk-tag--off {
		color: #c2515a;
		background: #fdf3f4;
		border: 1rpx solid #f7dfe2;
	}
	.sk-tag--off .sk-tag__dot {
		background: #c2515a;
	}
	.sk-rec__meta {
		margin-top: 14rpx;
		font-size: 24rpx;
		color: #5d7488;
	}
	.sk-rec__user {
		font-weight: 600;
		color: #16324f;
	}
	.sk-rec__dot {
		margin: 0 8rpx;
		color: #c3d1dd;
	}
	.sk-rec__phone {
		color: #7b90a6;
		letter-spacing: 0.5rpx;
	}
	.sk-rec__period {
		display: flex;
		align-items: center;
		margin-top: 14rpx;
		padding: 12rpx 16rpx;
		background: #f7fafd;
		border-radius: 12rpx;
		font-size: 23rpx;
		color: #5f7892;
	}
	.sk-rec__arrow {
		margin: 0 10rpx;
		color: #a9bccf;
	}
	.sk-rec__ops {
		display: flex;
		align-items: center;
		margin-top: 14rpx;
		padding-top: 14rpx;
		border-top: 1rpx solid #f3f8fc;
	}
	.sk-flex {
		flex: 1;
	}
	.sk-link {
		font-size: 24rpx;
		font-weight: 600;
		color: #1a8cf2;
	}
	.sk-op {
		margin-left: 12rpx;
		padding: 8rpx 20rpx;
		font-size: 22rpx;
		border-radius: 999rpx;
	}
	.sk-op--ghost {
		color: #3a7fb9;
		background: #f4f9fe;
		border: 1rpx solid #e3f0fb;
	}
	.sk-op--danger {
		color: #c2515a;
		background: #fdf5f6;
		border: 1rpx solid #f7e2e4;
	}
	.sk-link:active,
	.sk-op:active {
		opacity: 0.7;
	}

	/* ============================================================
	   9. 底部主按钮
	   ============================================================ */
	.sk-footbar {
		flex-shrink: 0;
		padding: 12rpx 2rpx 20rpx;
	}
	.sk-cta {
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		font-size: 30rpx;
		font-weight: 600;
		letter-spacing: 1rpx;
		color: #ffffff;
		background: linear-gradient(135deg, #4facfe 0%, #1a8cf2 100%);
		border-radius: 44rpx;
		box-shadow: 0 14rpx 28rpx rgba(26, 140, 242, 0.26);
		transition: opacity 0.2s ease;
	}
	.sk-cta:active {
		opacity: 0.9;
	}

	/* ============================================================
	   10. 底部弹窗
	   ============================================================ */
	.sk-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(10, 40, 70, 0.36);
		z-index: 998;
	}
	.sk-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		padding: 0 30rpx;
		background: rgba(255, 255, 255, 0.985);
		border-radius: 36rpx 36rpx 0 0;
		border-top: 1rpx solid rgba(255, 255, 255, 0.9);
		box-shadow: 0 -20rpx 60rpx rgba(19, 96, 160, 0.18);
	}
	.sk-grabber {
		width: 64rpx;
		height: 8rpx;
		margin: 14rpx auto 2rpx;
		background: #dbe7f2;
		border-radius: 4rpx;
	}
	.sk-sheet__inner {
		max-height: 74vh;
		display: flex;
		flex-direction: column;
	}
	.sk-sheet__head {
		position: relative;
		flex-shrink: 0;
		padding: 22rpx 0 16rpx;
	}
	.sk-sheet__title {
		font-size: 33rpx;
		font-weight: 700;
		letter-spacing: 0.5rpx;
		color: #16324f;
	}
	.sk-close {
		position: absolute;
		right: 0;
		top: 16rpx;
		width: 56rpx;
		height: 56rpx;
		line-height: 56rpx;
		text-align: center;
		font-size: 24rpx;
		color: #7b90a6;
		background: #f2f7fc;
		border-radius: 50%;
	}
	.sk-close:active {
		background: #eaf3fb;
	}
	.sk-sheet__body {
		flex: 1;
		min-height: 0;
	}
	.sk-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 100rpx;
		padding: 14rpx 0;
		border-bottom: 1rpx solid #f2f7fc;
	}
	.sk-row__label {
		flex: 0 0 200rpx;
		font-size: 25rpx;
		line-height: 34rpx;
		color: #7c91a6;
	}
	.sk-row__ctl {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
	.sk-row__ctl--pickers {
		justify-content: flex-end;
		white-space: nowrap;
	}
	.sk-input-wrap {
		position: relative;
		flex: 1;
		min-width: 0;
	}
	.sk-input {
		width: 100%;
		height: 62rpx;
		line-height: 62rpx;
		padding: 0 16rpx;
		box-sizing: border-box;
		font-size: 26rpx;
		color: #16324f;
		text-align: right;
		background: #f8fbfe;
		border: 1rpx solid #eff5fb;
		border-radius: 10rpx;
	}
	.sk-static {
		flex: 1;
		font-size: 26rpx;
		line-height: 62rpx;
		text-align: right;
		color: #3f5872;
		word-break: break-all;
	}
	.sk-picker {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		max-width: 100%;
		height: 62rpx;
		line-height: 62rpx;
		font-size: 26rpx;
		color: #16324f;
	}
	.sk-picker--gap {
		margin-left: 24rpx;
	}
	.sk-caret {
		margin-left: 8rpx;
		font-size: 24rpx;
		line-height: 62rpx;
		color: #a9bccf;
	}
	.sk-drop {
		position: absolute;
		top: 70rpx;
		left: 0;
		right: 0;
		z-index: 9999;
		overflow: hidden;
		background: #ffffff;
		border: 1rpx solid #e7f1fa;
		border-radius: 14rpx;
		box-shadow: 0 16rpx 40rpx rgba(19, 96, 160, 0.12);
	}
	.sk-drop__item {
		height: 76rpx;
		line-height: 76rpx;
		padding: 0 22rpx;
		font-size: 26rpx;
		color: #16324f;
		border-bottom: 1rpx solid #f3f8fc;
	}
	.sk-drop__item:active {
		background: #f4f9fe;
	}
	.sk-sheet__foot {
		flex-shrink: 0;
		padding: 20rpx 0 22rpx;
	}
	.sk-submit {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 600;
		letter-spacing: 1rpx;
		color: #ffffff;
		background: linear-gradient(135deg, #4facfe 0%, #1a8cf2 100%);
		border: none;
		border-radius: 44rpx;
		box-shadow: 0 14rpx 28rpx rgba(26, 140, 242, 0.26);
	}
	.sk-submit::after {
		border: none;
	}
	.sk-submit:active {
		opacity: 0.9;
	}

	/* ============================================================
	   11. 组件穿透（保留原有 picker 皮肤）
	   ============================================================ */
	::v-deep uni-scroll-view,
	::v-deep .uni-scroll-view-content {
		overscroll-behavior: none;
	}
	::v-deep picker {
		color: #16324f;
		font-size: 26rpx;
	}
	::v-deep picker .uni-picker-container {
		background: rgba(255, 255, 255, 0.98) !important;
	}
	::v-deep picker .uni-picker-header {
		background: rgba(255, 255, 255, 0.98) !important;
		border-bottom: 1rpx solid #eef4fb !important;
	}
	::v-deep picker .uni-picker-body {
		background: rgba(255, 255, 255, 0.98) !important;
	}
	::v-deep picker .uni-picker-item {
		color: #16324f !important;
	}
	::v-deep picker .uni-picker-item.uni-picker-item-selected {
		color: #1a8cf2 !important;
	}

	/* ============================================================
	   12. 安全区适配
	   ============================================================ */
	@supports (padding-bottom: env(safe-area-inset-bottom)) {
		.sk-footbar {
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		}
		.sk-sheet__foot {
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		}
	}
</style>