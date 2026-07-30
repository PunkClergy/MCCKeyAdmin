<template>
	<view class="page-wrap" :style="{ height: screenHeight + 'px' }">
		<!-- 装饰性背景光效（适配天蓝背景） -->
		<view class="glow-bg glow-1"></view>
		<view class="glow-bg glow-2"></view>
		<view class="glow-bg glow-3"></view>

		<!-- ========== 主卡片：flex列，占据全部空间 ========== -->
		<view class="main-card">
			<!-- 顶部Tab切换（固定高度） -->
			<view class="tab-header">
				<view class="tab-item" :class="activeTab === 1 && 'tab-active'" @tap.stop="switchTab(1)">
					<text class="tab-label">{{tips.SendKey[lang]}}</text>
					<view class="tab-line"></view>
				</view>
				<view class="tab-item" :class="activeTab === 2 && 'tab-active'" @tap.stop="switchTab(2)">
					<text class="tab-label">{{tips.UsageLogs[lang]}}</text>
					<view class="tab-line"></view>
				</view>
			</view>

			<!-- ====== 内容区域：flex:1，撑满剩余空间 ====== -->
			<view class="tab-content">
				<!-- Tab1：车辆列表 -->
				<view v-if="activeTab === 1" class="tab-panel tab-panel-1">
					<scroll-view scroll-y class="scroll-container" @scrolltolower="loadCarList" :show-scrollbar="false">
						<view class="car-item" v-for="(item, idx) in carList" :key="idx">
							<!-- 卡片头部 -->
							<view class="item-head">
								<view class="head-left">
									<view class="plate-wrap">
										<image src="/static/car_icon.png" class="car-icon" mode="aspectFit" />
										<text class="plate-text">{{ item.platenumber }}</text>
									</view>
									<text class="model-text" v-if="!item.bluetoothKey">
										{{ item.vehicleSerialName || '-' }} {{ item.vehicleModeName || '' }}
									</text>
								</view>
							</view>
							<!-- 车辆信息 -->
							<view class="info-wrap">
								<view class="info-row" :class="item.vin.length > 15 && 'info-row-full'" v-if="!item.bluetoothKey">
									<label class="info-label">{{tips.VIN[lang]}}</label>
									<text class="info-value">{{ item.vin || '-' }}</text>
								</view>
								<view class="info-row" :class="item.xsgw.length > 15 && 'info-row-full'" v-if="!item.bluetoothKey">
									<label class="info-label">{{tips.FuelCapacity[lang]}}</label>
									<text class="info-value">{{ item.xsgw ? item.xsgw + 'L' : '-' }}</text>
								</view>
								<view class="info-row" :class="item.carOwnerName.length > 15 && 'info-row-full'" v-if="!item.bluetoothKey">
									<label class="info-label">{{tips.DevicePlatform[lang]}}</label>
									<text class="info-value">{{ item.carOwnerName || '-' }}</text>
								</view>
								<view class="info-row" :class="item.sn.length > 15 && 'info-row-full'">
									<label class="info-label">{{tips.DeviceID[lang]}}</label>
									<text class="info-value">{{ item.sn || '-' }}</text>
								</view>
							</view>
							<!-- 操作按钮 -->
							<view class="item-footer">
								<view></view>
								<view class="btn-primary" :data-item="item" @tap="openSendKeyModal">
									<text>{{tips.SendKey[lang]}}</text>
									<view class="btn-shimmer"></view>
								</view>
							</view>
						</view>
						<!-- 空状态 -->
						<view class="empty-tip" v-if="carList.length < 1">
							<view class="empty-icon">🚗</view>
							<text class="empty-text">{{tips.NoData[lang]}}</text>
						</view>
					</scroll-view>
				</view>

				<!-- Tab2：使用记录 -->
				<view v-if="activeTab === 2" class="tab-panel tab-panel-2">
					<view class="filter-area">
						<!-- 搜索框 -->
						<view class="search-input-wrap">
							<input class="search-input" :placeholder="tips.PlateDeviceUser[lang]" @blur="onSearchBlur" />
						</view>
						<!-- 状态筛选 -->
						<view class="status-tabs">
							<view class="status-tab" :class="recordStatus == 0 && 'status-active'" @tap="changeRecordStatus" data-id="0">
								{{tips.InUse[lang]}}
							</view>
							<view class="status-tab" :class="recordStatus == 1 && 'status-active'" @tap="changeRecordStatus" data-id="1">
								{{tips.Expired[lang]}}
							</view>
						</view>
						<view class="total-count">{{tips.Total[lang]}} <text class="count-num">{{recordTotal}}</text> {{tips.Records[lang]}}</view>
					</view>
					<scroll-view scroll-y class="scroll-container" @scrolltolower="loadRecordList" :show-scrollbar="false">
						<view class="record-card" v-for="(item, idx) in recordList" :key="idx">
							<view class="card-header">
								<view class="header-left">
									<text class="plate">{{ item.platenumber }}</text>
									<view class="divider-dot"></view>
									<text class="user-name">{{ item.personname }}</text>
									<view class="divider-dot"></view>
									<text class="phone">{{ item.mobile }}</text>
								</view>
								<view class="header-right">
									<text class="tag-normal" v-if="item.status == 0">{{tips.InUse[lang]}}</text>
									<text class="tag-expire" v-else>{{tips.Expired[lang]}}</text>
								</view>
							</view>
							<view class="card-date">
								{{ (item.startdate || '-') }} ~ {{ (item.enddate || '-') }}
							</view>
							<view class="card-op">
								<block v-if="!item.status">
									<text class="op-text" @tap="openEditKeyModal" :data-item="item">{{tips.Edit[lang]}}</text>
									<view class="op-group">
										<text class="op-btn op-copy" @tap="copyLink" :data-item="item">
											{{ copied ? tips.Copied[lang] : tips.CopyLink[lang] }}
										</text>
										<text class="op-btn op-cancel" @tap="cancelRentKey" :data-item="item">{{tips.CancelCarUse[lang]}}</text>
									</view>
								</block>
								<block v-else>
									<view></view>
									<view class="op-group">
										<text class="op-btn op-view" @tap="previewImages" :data-item="item">{{tips.ViewPhotos[lang]}}</text>
									</view>
								</block>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- ====== 底部固定按钮：在卡片内部，flex-shrink:0 ====== -->
			<view class="fixed-bottom-btn" @tap="openGlobalSendModal">
				<text class="btn-label">{{tips.SendKey[lang]}}</text>
			</view>
		</view>

		<!-- ====== 下发钥匙弹窗 ====== -->
		<view class="modal-mask" v-if="showSendModal" @tap="closeSendKeyModal"></view>
		<view class="modal-popup" v-if="showSendModal" :style="{ bottom: showSearchList ? 250 : 0 + 'rpx' }">
			<form @submit="submitSendKey">
				<view class="modal-inner">
					<view class="modal-head">
						<text class="modal-title">{{ tips.SendKey[lang] }}</text>
						<view class="close-icon" @tap="closeSendKeyModal">✕</view>
					</view>
					<scroll-view scroll-y class="modal-body" :show-scrollbar="false">
						<view class="form-item">
							<label class="form-label">{{ tips.PlateNo[lang] }}</label>
							<view class="form-value">
								<view v-if="isManualInput" class="input-box">
									<input class="form-input" @focus="onInputFocus" @blur="onInputBlur"
									:placeholder="tips.EnterPlateNo[lang]" name="platenumber" :value="searchKeyword"
									@input="onSearchInput" confirm-type="search" />
									<view v-if="searchList.length > 0 && searchKeyword.trim() !== ''" class="search-drop">
										<view class="drop-item" v-for="(item, idx) in searchList" :key="idx" @tap="selectPlate" :data-item="item">
											{{ item.platenumber }}
										</view>
									</view>
								</view>
								<text v-else class="static-text">{{ selectCarData.platenumber }}</text>
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.User[lang] }}</label>
							<view class="form-value">
								<input class="form-input" @focus="onInputFocus" @blur="onInputBlur" :placeholder="tips.EnterUser[lang]" name="personName" />
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.StartTime[lang] }}</label>
							<view class="form-value picker-row">
								<picker mode="date" data-index="startDate" @change="changeDateTime">
									<view class="picker-box"><text>{{ startDate }}</text></view>
								</picker>
								<picker mode="time" data-index="startTime" @change="changeDateTime">
									<view class="picker-box"><text>{{ startTime }}</text></view>
								</picker>
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.EndTime[lang] }}</label>
							<view class="form-value picker-row">
								<picker mode="date" data-index="endDate" @change="changeDateTime">
									<view class="picker-box"><text>{{ endDate }}</text></view>
								</picker>
								<picker mode="time" data-index="endTime" @change="changeDateTime">
									<view class="picker-box"><text>{{ endTime }}</text></view>
								</picker>
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.MultiUserAllowed[lang] }}</label>
							<view class="form-value">
								<picker mode="selector" :range="multiOptions" range-key="name" @change="changeMultiSelect" :value="multiIndex">
									<text class="picker-text">{{ multiOptions[multiIndex].name }}</text>
								</picker>
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.Remark[lang] }}</label>
							<view class="form-value">
								<input class="form-input" :placeholder="tips.EnterParkingPos[lang]" name="bak" />
							</view>
						</view>
					</scroll-view>
					<view class="modal-footer">
						<button form-type="submit" class="submit-btn">{{ tips.Confirm[lang] }}</button>
					</view>
				</view>
			</form>
		</view>

		<!-- ====== 编辑钥匙弹窗 ====== -->
		<view class="modal-mask" v-if="showEditModal" @tap="closeEditKeyModal"></view>
		<view class="modal-popup" v-if="showEditModal">
			<form @submit="submitEditKey">
				<view class="modal-inner">
					<view class="modal-head">
						<text class="modal-title">{{ tips.Edit[lang] }}</text>
						<view class="close-icon" @tap="closeEditKeyModal">✕</view>
					</view>
					<scroll-view scroll-y class="modal-body" :show-scrollbar="false">
						<view class="form-item">
							<label class="form-label">{{ tips.PlateNo[lang] }}</label>
							<view class="form-value static-text">{{ editRecordData.platenumber }}</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.User[lang] }}</label>
							<view class="form-value static-text">{{ editRecordData.personname }}</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.StartTime[lang] }}</label>
							<view class="form-value picker-row">
								<picker mode="date" data-index="startDate" @change="changeDateTime">
									<view class="picker-box"><text>{{ startDate }}</text></view>
								</picker>
								<picker mode="time" data-index="startTime" @change="changeDateTime">
									<view class="picker-box"><text>{{ startTime }}</text></view>
								</picker>
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.EndTime[lang] }}</label>
							<view class="form-value picker-row">
								<picker mode="date" data-index="endDate" @change="changeDateTime">
									<view class="picker-box"><text>{{ endDate }}</text></view>
								</picker>
								<picker mode="time" data-index="endTime" @change="changeDateTime">
									<view class="picker-box"><text>{{ endTime }}</text></view>
								</picker>
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.MultiUserAllowed[lang] }}</label>
							<view class="form-value">
								<picker mode="selector" :range="multiOptions" range-key="name" @change="changeMultiSelect" :value="multiIndex">
									<text class="picker-text">{{ multiOptions[multiIndex].name }}</text>
								</picker>
							</view>
						</view>
						<view class="form-item">
							<label class="form-label">{{ tips.Remark[lang] }}</label>
							<view class="form-value static-text">{{ editRecordData.bak || '-' }}</view>
						</view>
					</scroll-view>
					<view class="modal-footer">
						<button form-type="submit" class="submit-btn">{{ tips.Confirm[lang] }}</button>
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
				multiOptions: [{ name: '允许', value: 1 }, { name: '不允许', value: 0 }],
				multiIndex: 0,
				openType: 1,
				searchList: [],
				showSearchList: false,
				searchTimer: null,
				selectCarData: {},
				vehId: '',
				recordTotal: 0,
				searchParam: '',
				lang: 'zhCn',
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
			this.lang = uni.getStorageSync('language') || 'zhCn';
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
	   1. 全局重置 & 滚动条
	   ============================================================ */
	::-webkit-scrollbar,
	scroll-view::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}

	/* ============================================================
	   2. 页面容器 — 明亮天蓝背景
	   ============================================================ */
	.page-wrap {
		background: linear-gradient(145deg, #e3f2fd 0%, #e3f2fd 20%, #81d4fa 100%);
		padding: 20rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	/* 装饰性光晕背景 */
	.glow-bg {
		position: absolute;
		border-radius: 50%;
		filter: blur(120rpx);
		pointer-events: none;
		opacity: 0.25;
	}
	.glow-1 {
		width: 600rpx;
		height: 600rpx;
		top: -200rpx;
		right: -100rpx;
		background: radial-gradient(circle, #ffffff, transparent 70%);
	}
	.glow-2 {
		width: 500rpx;
		height: 500rpx;
		bottom: 100rpx;
		left: -150rpx;
		background: radial-gradient(circle, #b3e5fc, transparent 70%);
	}
	.glow-3 {
		width: 400rpx;
		height: 400rpx;
		top: 40%;
		left: 50%;
		transform: translateX(-50%);
		background: radial-gradient(circle, rgba(33, 150, 243, 0.08), transparent 70%);
	}

	/* ============================================================
	   3. 主卡片 — 半透明白色毛玻璃，flex列撑满
	   ============================================================ */
	.main-card {
		width: 100%;
		flex: 1;
		/* 关键：flex列，让内容区域和按钮各司其职 */
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.5);
		backdrop-filter: blur(24rpx);
		-webkit-backdrop-filter: blur(24rpx);
		border-radius: 24rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.5);
		box-shadow: 0 20rpx 60rpx rgba(33, 150, 243, 0.08);
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	/* ============================================================
	   4. Tab 头部 — 科技蓝强调
	   ============================================================ */
	.tab-header {
		display: flex;
		position: relative;
		background: transparent;
		flex-shrink: 0;
		/* 固定高度，不被压缩 */
		padding: 0 32rpx;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.1);
	}
	.tab-item {
		flex: 1;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 500;
		color: rgba(13, 71, 161, 0.5);
		position: relative;
		transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		letter-spacing: 0.5rpx;
	}
	.tab-label {
		transition: all 0.35s ease;
	}
	.tab-active .tab-label {
		color: #0d47a1;
		font-weight: 600;
		text-shadow: 0 0 20rpx rgba(33, 150, 243, 0.15);
	}
	.tab-line {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 48rpx;
		height: 4rpx;
		border-radius: 4rpx;
		background: transparent;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.tab-active .tab-line {
		background: linear-gradient(90deg, #1976d2, #42a5f5);
		width: 64rpx;
		box-shadow: 0 0 20rpx rgba(33, 150, 243, 0.3);
	}

	/* ============================================================
	   5. 内容区域 — flex:1，撑满剩余空间
	   ============================================================ */
	.tab-content {
		flex: 1;
		position: relative;
		overflow: hidden;
		/* 作为绝对定位子元素的参考容器 */;
	}

	/* ============================================================
	   6. Tab Panel — 绝对定位填满父容器，内部flex列
	   ============================================================ */
	.tab-panel {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* ============================================================
	   7. 滚动容器 — flex:1 撑满 panel
	   ============================================================ */
	.scroll-container {
		flex: 1;
		/* 关键：配合 height:0 让 scroll-view 在 flex 中正确滚动 */
		height: 0;
		padding: 20rpx 20rpx 24rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	/* ============================================================
	   8. Tab2 筛选区 — 固定高度，不压缩
	   ============================================================ */
	.filter-area {
		flex-shrink: 0;
		padding: 16rpx 20rpx 12rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.05);
	}

	/* ============================================================
	   9. 车辆卡片
	   ============================================================ */
	.car-item {
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(12rpx);
		-webkit-backdrop-filter: blur(12rpx);
		border-radius: 20rpx;
		margin-bottom: 24rpx;
		overflow: hidden;
		border: 1rpx solid rgba(33, 150, 243, 0.1);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}
	.car-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2rpx;
		background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.3), transparent);
		opacity: 0;
		transition: opacity 0.4s ease;
	}
	.car-item:active {
		transform: scale(0.98);
		border-color: rgba(33, 150, 243, 0.25);
	}
	.car-item:active::before {
		opacity: 1;
	}
	.item-head {
		padding: 24rpx 24rpx 16rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.05);
	}
	.head-left {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		flex: 1;
	}
	.plate-wrap {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}
	.car-icon {
		width: 40rpx;
		height: 32rpx;
		opacity: 0.8;
		filter: brightness(0) invert(0.2);
	}
	.plate-text {
		font-size: 34rpx;
		font-weight: 700;
		color: #0d47a1;
		letter-spacing: 1rpx;
		text-shadow: 0 0 20rpx rgba(33, 150, 243, 0.1);
	}
	.model-text {
		font-size: 24rpx;
		color: rgba(13, 71, 161, 0.5);
		font-weight: 400;
	}
	.status-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: #00e676;
		box-shadow: 0 0 30rpx rgba(0, 230, 118, 0.4);
		flex-shrink: 0;
		margin-top: 6rpx;
		animation: pulse-green 2s ease-in-out infinite;
	}
	@keyframes pulse-green {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
			box-shadow: 0 0 30rpx rgba(0, 230, 118, 0.3);
		}
		50% {
			opacity: 0.7;
			transform: scale(0.85);
			box-shadow: 0 0 60rpx rgba(0, 230, 118, 0.6);
		}
	}
	.info-wrap {
		padding: 18rpx 24rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx 20rpx;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.05);
	}
	.info-row {
		width: calc(50% - 12rpx);
		font-size: 24rpx;
		display: flex;
		align-items: center;
		padding: 4rpx 0;
	}
	.info-row-full {
		width: 100%;
	}
	.info-label {
		color: rgba(13, 71, 161, 0.4);
		min-width: 130rpx;
		font-weight: 400;
		font-size: 22rpx;
		letter-spacing: 0.3rpx;
	}
	.info-value {
		color: #0d47a1;
		flex: 1;
		font-weight: 450;
		word-break: break-all;
	}
	.item-footer {
		padding: 16rpx 24rpx 20rpx;
		display: flex;
		justify-content: flex-end;
	}

	/* ============================================================
	   10. 按钮 — 科技蓝渐变 + 流光
	   ============================================================ */
	.btn-primary {
		padding: 14rpx 44rpx;
		background: linear-gradient(135deg, #1976d2, #42a5f5);
		color: #fff;
		font-size: 26rpx;
		font-weight: 600;
		border-radius: 40rpx;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4rpx 30rpx rgba(33, 150, 243, 0.25);
		transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		letter-spacing: 1rpx;
	}
	.btn-primary:active {
		transform: scale(0.94);
		box-shadow: 0 2rpx 20rpx rgba(33, 150, 243, 0.4);
	}
	.btn-shimmer {
		position: absolute;
		top: 0;
		left: -100%;
		width: 60%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transform: skewX(-20deg);
		animation: shimmer 3s infinite;
	}
	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 200%;
		}
	}

	/* ============================================================
	   11. 空状态
	   ============================================================ */
	.empty-tip {
		padding: 100rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}
	.empty-icon {
		font-size: 80rpx;
		opacity: 0.3;
	}
	.empty-text {
		font-size: 28rpx;
		color: rgba(13, 71, 161, 0.25);
		font-weight: 400;
	}

	/* ============================================================
	   12. 筛选区域样式
	   ============================================================ */
	.search-input-wrap {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 40rpx;
		padding: 14rpx 24rpx;
		gap: 14rpx;
		border: 1rpx solid rgba(33, 150, 243, 0.08);
		transition: border 0.3s ease;
	}
	.search-input-wrap:focus-within {
		border-color: rgba(33, 150, 243, 0.3);
		box-shadow: 0 0 20rpx rgba(33, 150, 243, 0.05);
	}
	.search-icon {
		font-size: 28rpx;
		opacity: 0.4;
	}
	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #0d47a1;
		background: transparent;
	}
	.search-input::placeholder {
		color: rgba(13, 71, 161, 0.3);
	}
	.status-tabs {
		display: flex;
		gap: 16rpx;
	}
	.status-tab {
		padding: 10rpx 32rpx;
		font-size: 24rpx;
		border-radius: 40rpx;
		background: rgba(255, 255, 255, 0.3);
		color: rgba(13, 71, 161, 0.5);
		transition: all 0.3s ease;
		border: 1rpx solid transparent;
	}
	.status-active {
		background: rgba(33, 150, 243, 0.08);
		color: #1976d2;
		border-color: rgba(33, 150, 243, 0.15);
		box-shadow: 0 0 20rpx rgba(33, 150, 243, 0.05);
	}
	.total-count {
		font-size: 22rpx;
		color: rgba(13, 71, 161, 0.3);
	}
	.count-num {
		color: #0d47a1;
		font-weight: 600;
		margin: 0 4rpx;
	}

	/* ============================================================
	   13. 记录卡片
	   ============================================================ */
	.record-card {
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(12rpx);
		-webkit-backdrop-filter: blur(12rpx);
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		border: 1rpx solid rgba(33, 150, 243, 0.06);
		transition: all 0.3s ease;
	}
	.record-card:active {
		transform: scale(0.98);
		border-color: rgba(33, 150, 243, 0.12);
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 14rpx;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.05);
		margin-bottom: 14rpx;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 28rpx;
		color: #0d47a1;
		flex-wrap: wrap;
	}
	.divider-dot {
		width: 4rpx;
		height: 4rpx;
		border-radius: 50%;
		background: rgba(13, 71, 161, 0.1);
	}
	.plate {
		font-weight: 600;
		color: #0d47a1;
	}
	.user-name {
		color: rgba(13, 71, 161, 0.6);
		font-size: 26rpx;
	}
	.phone {
		color: rgba(13, 71, 161, 0.4);
		font-size: 24rpx;
	}
	.header-right {
		flex-shrink: 0;
	}
	.tag-normal {
		padding: 6rpx 20rpx;
		font-size: 22rpx;
		border-radius: 30rpx;
		background: rgba(0, 230, 118, 0.08);
		color: #00c853;
		border: 1rpx solid rgba(0, 230, 118, 0.1);
	}
	.tag-expire {
		padding: 6rpx 20rpx;
		font-size: 22rpx;
		border-radius: 30rpx;
		background: rgba(244, 67, 54, 0.06);
		color: #d32f2f;
		border: 1rpx solid rgba(244, 67, 54, 0.08);
	}
	.card-date {
		font-size: 24rpx;
		color: rgba(13, 71, 161, 0.5);
		padding-bottom: 14rpx;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.05);
		margin-bottom: 14rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}
	.date-icon {
		font-size: 22rpx;
	}
	.card-op {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 24rpx;
	}
	.op-text {
		color: #1976d2;
		font-weight: 500;
		padding: 8rpx 4rpx;
	}
	.op-group {
		display: flex;
		gap: 12rpx;
	}
	.op-btn {
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
		font-size: 22rpx;
		font-weight: 500;
		transition: all 0.3s ease;
	}
	.op-copy {
		background: rgba(33, 150, 243, 0.06);
		color: #1976d2;
		border: 1rpx solid rgba(33, 150, 243, 0.08);
	}
	.op-cancel {
		background: rgba(244, 67, 54, 0.04);
		color: #d32f2f;
		border: 1rpx solid rgba(244, 67, 54, 0.06);
	}
	.op-view {
		background: rgba(255, 255, 255, 0.3);
		color: rgba(13, 71, 161, 0.5);
		border: 1rpx solid rgba(33, 150, 243, 0.05);
	}
	.op-btn:active {
		transform: scale(0.92);
	}

	/* ============================================================
	   14. 底部固定按钮 — 在卡片内部，不被滚动带走
	   ============================================================ */
	.fixed-bottom-btn {
		width: 80%;
		margin: 0 auto 28rpx;
		flex-shrink: 0;
		/* 关键：不被压缩，始终在卡片底部 */
		text-align: center;
		padding: 20rpx 0;
		background: linear-gradient(135deg, #1976d2, #42a5f5);
		color: #fff;
		font-size: 32rpx;
		font-weight: 600;
		border-radius: 60rpx;
		box-shadow: 0 8rpx 40rpx rgba(33, 150, 243, 0.3);
		position: relative;
		overflow: hidden;
		letter-spacing: 2rpx;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1rpx solid rgba(255, 255, 255, 0.2);
		/* 移除 sticky / fixed 定位，完全靠 flex 控制位置 */
		position: static;
	}
	.fixed-bottom-btn:active {
		transform: scale(0.94);
		box-shadow: 0 4rpx 30rpx rgba(33, 150, 243, 0.5);
	}
	.btn-glow {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1), transparent 70%);
		animation: glow-rotate 8s linear infinite;
	}
	@keyframes glow-rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.btn-label {
		position: relative;
		z-index: 1;
	}

	/* ============================================================
	   15. 弹窗 — 白色毛玻璃
	   ============================================================ */
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8rpx);
		-webkit-backdrop-filter: blur(8rpx);
		z-index: 998;
		animation: fadeIn 0.25s ease;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.modal-popup {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(40rpx);
		-webkit-backdrop-filter: blur(40rpx);
		border-radius: 32rpx 32rpx 0 0;
		z-index: 999;
		padding: 32rpx 28rpx;
		border-top: 1rpx solid rgba(33, 150, 243, 0.1);
		animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}
	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	.modal-inner {
		max-height: 74vh;
		display: flex;
		flex-direction: column;
	}
	.modal-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 24rpx;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.06);
		margin-bottom: 20rpx;
		flex-shrink: 0;
	}
	.modal-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #0d47a1;
		letter-spacing: 1rpx;
		text-shadow: 0 0 20rpx rgba(33, 150, 243, 0.05);
	}
	.close-icon {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: rgba(13, 71, 161, 0.3);
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		transition: all 0.3s ease;
	}
	.close-icon:active {
		transform: rotate(90deg);
		background: rgba(33, 150, 243, 0.04);
	}
	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 16rpx;
	}
	.form-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 18rpx 0;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.04);
		min-height: 76rpx;
	}
	.form-label {
		font-size: 26rpx;
		color: rgba(13, 71, 161, 0.4);
		min-width: 150rpx;
		font-weight: 400;
	}
	.form-value {
		flex: 1;
		text-align: right;
		font-size: 28rpx;
		color: #0d47a1;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
	.form-input {
		text-align: right;
		width: 100%;
		font-size: 28rpx;
		color: #0d47a1;
		background: transparent;
		padding: 4rpx 0;
	}
	.form-input::placeholder {
		color: rgba(13, 71, 161, 0.2);
	}
	.input-box {
		position: relative;
		width: 100%;
	}
	.search-drop {
		position: absolute;
		top: 60rpx;
		right: 0;
		left: 0;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(20rpx);
		border-radius: 16rpx;
		border: 1rpx solid rgba(33, 150, 243, 0.06);
		box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.04);
		z-index: 9999;
		overflow: hidden;
	}
	.drop-item {
		height: 76rpx;
		line-height: 76rpx;
		padding: 0 24rpx;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.03);
		font-size: 28rpx;
		color: #0d47a1;
		transition: background 0.2s ease;
	}
	.drop-item:active {
		background: rgba(33, 150, 243, 0.04);
	}
	.picker-row {
		display: flex;
		gap: 16rpx;
		justify-content: flex-end;
	}
	.picker-box {
		padding: 8rpx 24rpx;
		background: rgba(255, 255, 255, 0.4);
		border-radius: 20rpx;
		border: 1rpx solid rgba(33, 150, 243, 0.04);
		font-size: 26rpx;
		color: #0d47a1;
		min-width: 120rpx;
		text-align: center;
	}
	.picker-text {
		color: #0d47a1;
	}
	.static-text {
		color: rgba(13, 71, 161, 0.5);
		font-size: 26rpx;
	}
	.modal-footer {
		padding-top: 20rpx;
		flex-shrink: 0;
	}
	.submit-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #1976d2, #42a5f5);
		color: #fff;
		font-size: 32rpx;
		font-weight: 600;
		border-radius: 40rpx;
		border: none;
		box-shadow: 0 4rpx 30rpx rgba(33, 150, 243, 0.25);
		transition: all 0.3s ease;
		letter-spacing: 2rpx;
	}
	.submit-btn:active {
		transform: scale(0.96);
		box-shadow: 0 2rpx 20rpx rgba(33, 150, 243, 0.4);
	}

	/* ============================================================
	   16. uni-app 组件穿透
	   ============================================================ */
	::v-deep uni-scroll-view,
	::v-deep .uni-scroll-view-content {
		overscroll-behavior: none;
	}
	::v-deep picker {
		color: #0d47a1;
		font-size: 26rpx;
	}
	::v-deep picker .uni-picker-container {
		background: rgba(255, 255, 255, 0.98) !important;
	}
	::v-deep picker .uni-picker-header {
		background: rgba(255, 255, 255, 0.98) !important;
		border-bottom: 1rpx solid rgba(33, 150, 243, 0.06) !important;
	}
	::v-deep picker .uni-picker-body {
		background: rgba(255, 255, 255, 0.98) !important;
	}
	::v-deep picker .uni-picker-item {
		color: #0d47a1 !important;
	}
	::v-deep picker .uni-picker-item.uni-picker-item-selected {
		color: #1976d2 !important;
	}

	/* ============================================================
	   17. 响应式微调
	   ============================================================ */
	@media screen and (max-width: 375px) {
		.plate-text {
			font-size: 30rpx;
		}
		.form-label {
			min-width: 120rpx;
			font-size: 24rpx;
		}
		.info-label {
			min-width: 100rpx;
			font-size: 20rpx;
		}
		.info-value {
			font-size: 22rpx;
		}
	}

	/* safe-area 底部适配 — 按钮在卡片内部，由卡片自身处理 */
	@supports (padding-bottom: env(safe-area-inset-bottom)) {
		.main-card {
			padding-bottom: env(safe-area-inset-bottom);
		}
		.fixed-bottom-btn {
			margin-bottom: calc(28rpx + env(safe-area-inset-bottom));
		}
		.modal-popup {
			padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
		}
	}
</style>