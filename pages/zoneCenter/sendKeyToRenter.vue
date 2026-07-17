<template>
	<view class="page-wrap" :style="{ height: screenHeight + 'px' }">
		<view class="main-card">
			<!-- 顶部Tab切换 -->
			<view class="tab-header">
				<view class="tab-item" :class="activeTab === 1 && 'tab-active'" @tap="activeTab = 1">
					{{tips.SendKey[lang]}}
					<view class="tab-line"></view>
				</view>
				<view class="tab-item" :class="activeTab === 2 && 'tab-active'" @tap="activeTab = 2">
					{{tips.UsageLogs[lang]}}
					<view class="tab-line"></view>
				</view>
			</view>

			<!-- Tab1 下发车钥匙列表 -->
			<block v-if="activeTab === 1">
				<scroll-view scroll-y class="scroll-container" @scrolltolower="loadCarList">
					<view class="car-item" v-for="(item, idx) in carList" :key="idx" >
						<!-- 卡片头部 -->
						<view class="item-head">
							<view class="head-left">
								<view class="plate-wrap">
									<image src="/static/car_icon.png" class="car-icon" />
									<text class="plate-text">{{ item.platenumber }}</text>
								</view>
								<text class="model-text" v-if="!item.bluetoothKey">
									{{ item.vehicleSerialName || '-' }} {{ item.vehicleModeName || '' }}
								</text>
							</view>
						</view>
						<!-- 车辆信息区域 -->
						<view class="info-wrap">
							<view class="info-row" :class="item.vin.length > 15 && 'info-row-full'" v-if="!item.bluetoothKey">
								<label class="info-label">{{tips.VIN[lang]}}：</label>
								<text class="info-value">{{ item.vin || '-' }}</text>
							</view>
							<view class="info-row" :class="item.xsgw.length > 15 && 'info-row-full'" v-if="!item.bluetoothKey">
								<label class="info-label">{{tips.FuelCapacity[lang]}}：</label>
								<text class="info-value">{{ item.xsgw ? item.xsgw + 'L' : '-' }}</text>
							</view>
							<view class="info-row" :class="item.carOwnerName.length > 15 && 'info-row-full'" v-if="!item.bluetoothKey">
								<label class="info-label">{{tips.DevicePlatform[lang]}}：</label>
								<text class="info-value">{{ item.carOwnerName || '-' }}</text>
							</view>
							<view class="info-row" :class="item.sn.length > 15 && 'info-row-full'">
								<label class="info-label">{{tips.DeviceID[lang]}}：</label>
								<text class="info-value">{{ item.sn || '-' }}</text>
							</view>
						</view>
						<!-- 操作按钮 -->
						<view class="item-footer">
							<view></view>
							<view class="btn-primary" :data-item="item" @tap="openSendKeyModal">
								<text>{{tips.SendKey[lang]}}</text>
							</view>
						</view>
					</view>
					<!-- 空状态 -->
					<view class="empty-tip" v-if="carList.length < 1">
						<text class="empty-text">{{tips.NoData[lang]}}</text>
					</view>
				</scroll-view>
			</block>

			<!-- Tab2 使用记录 已修复滚动 -->
			<block v-if="activeTab === 2">
				<view class="filter-area">
					<!-- 搜索框 -->
					<view class="search-input-wrap">
						<icon type="search" size="32rpx" class="search-icon" />
						<input class="search-input" :placeholder="tips.PlateDeviceUser[lang]" @blur="onSearchBlur" />
					</view>
					<!-- 状态筛选标签 -->
					<view class="status-tabs">
						<view class="status-tab" :class="recordStatus == 0 && 'status-active'" @tap="changeRecordStatus" data-id="0">
							{{tips.InUse[lang]}}
						</view>
						<view class="status-tab" :class="recordStatus == 1 && 'status-active'" @tap="changeRecordStatus" data-id="1">
							{{tips.Expired[lang]}}
						</view>
					</view>
					<view class="total-count">{{tips.Total[lang]}} {{recordTotal}} {{tips.Records[lang]}}</view>
				</view>
				<scroll-view scroll-y class="scroll-container" @scrolltolower="loadRecordList">
					<view class="record-card" v-for="(item, idx) in recordList" :key="idx">
						<view class="card-header">
							<view class="header-left">
								<text class="plate">{{ item.platenumber }}</text>
								<text class="user-name">{{ item.personname }}</text>
								<view class="split-line"></view>
								<text class="phone">{{ item.mobile }}</text>
							</view>
							<view class="header-right">
								<text class="tag-normal" v-if="item.status == 0">{{tips.InUse[lang]}}</text>
								<text class="tag-expire" v-else>{{tips.Expired[lang]}}</text>
							</view>
						</view>
						<view class="card-date">
							{{ (item.startdate || '-') }} ~ {{(item.enddate || '-') }}
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
			</block>
		</view>

		<!-- 底部全局下发钥匙按钮 -->
		<view class="fixed-bottom-btn" @tap="openGlobalSendModal">
			<text>{{tips.SendKey[lang]}}</text>
		</view>

		<!-- 下发钥匙弹窗 -->
		<view class="modal-mask" v-if="showSendModal" @tap="closeSendKeyModal"></view>
		<view class="modal-popup" v-if="showSendModal" :style="{ bottom: showSearchList ? 250 : 0 + 'rpx' }">
			<form @submit="submitSendKey">
				<view class="modal-inner">
					<view class="modal-head">
						<text class="modal-title">{{ tips.SendKey[lang] }}</text>
						<image src="/static/images/right_1.png" class="close-icon" @tap="closeSendKeyModal" />
					</view>
					<scroll-view scroll-y class="modal-body">
						<view class="form-item">
							<label class="form-label">{{ tips.PlateNo[lang] }}</label>
							<view class="form-value">
								<view v-if="isManualInput" class="input-box">
									<input 
										class="form-input" 
										@focus="onInputFocus" 
										@blur="onInputBlur" 
										:placeholder="tips.EnterPlateNo[lang]" 
										name="platenumber" 
										:value="searchKeyword"
										@input="onSearchInput" 
										confirm-type="search" 
									/>
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
									<text>{{ multiOptions[multiIndex].name }}</text>
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

		<!-- 编辑钥匙弹窗 -->
		<view class="modal-mask" v-if="showEditModal" @tap="closeEditKeyModal"></view>
		<view class="modal-popup" v-if="showEditModal">
			<form @submit="submitEditKey">
				<view class="modal-inner">
					<view class="modal-head">
						<text class="modal-title">{{ tips.Edit[lang] }}</text>
						<image src="/static/images/right_1.png" class="close-icon" @tap="closeEditKeyModal" />
					</view>
					<scroll-view scroll-y class="modal-body">
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
									<text>{{ multiOptions[multiIndex].name }}</text>
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
import { titles } from '@/utils/langtitle.js'
import { tips } from '@/utils/langtips.js'
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
/* 全局滚动条隐藏 */
::-webkit-scrollbar,
scroll-view::-webkit-scrollbar {
	width: 0;
	height: 0;
	display: none;
}

/* 页面容器 */
.page-wrap {
	background-color: #f5f7fa;
	padding: 20rpx 16rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
}

/* 主内容卡片 */
.main-card {
	width: 100%;
	flex: 1;
	background-color: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 1rpx 6rpx rgba(0,0,0,0.04);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* Tab头部 */
.tab-header {
	display: flex;
	position: relative;
	background: #ffffff;
	flex-shrink: 0;
}
.tab-item {
	flex: 1;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: 500;
	color: #6b7280;
	position: relative;
	transition: all 0.24s ease;
}
.tab-active {
	color: #1677ff;
	font-weight: 600;
}
.tab-line {
	position: absolute;
	bottom: 0;
	width: 80rpx;
	height: 6rpx;
	border-radius: 3rpx;
	background: transparent;
	transition: all 0.24s ease;
}
.tab-active .tab-line {
	background: #1677ff;
}

/* 滚动容器 核心修复滚动失效 */
.scroll-container {
	flex: 1;
	padding: 16rpx 16rpx 120rpx;
	box-sizing: border-box;
	height: 0;
	overflow: hidden;
}

/* 车辆卡片项 */
.car-item {
	background: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 1rpx 6rpx rgba(0,0,0,0.04);
	margin-bottom: 20rpx;
	overflow: hidden;
	border: 1rpx solid #eee;
}
.item-head {
	padding: 24rpx 24rpx 16rpx;
	border-bottom: 1rpx solid #e5e7eb;
}
.head-left {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.plate-wrap {
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.car-icon {
	width: 36rpx;
	height: 28rpx;
}
.plate-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #1f2937;
}
.model-text {
	font-size: 26rpx;
	color: #6b7280;
}
.info-wrap {
	padding: 16rpx 24rpx;
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx 20rpx;
	border-bottom: 1rpx solid #e5e7eb;
}
.info-row {
	width: calc(50% - 12rpx);
	font-size: 26rpx;
	display: flex;
}
.info-row-full {
	width: 100%;
}
.info-label {
	color: #9ca3af;
	min-width: 140rpx;
}
.info-value {
	color: #1f2937;
	flex: 1;
}
.item-footer {
	padding: 20rpx 24rpx;
	display: flex;
	justify-content: flex-end;
}
.btn-primary {
	padding: 10rpx 32rpx;
	background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
	color: #fff;
	font-size: 26rpx;
	border-radius: 24rpx;
}

/* 空状态 */
.empty-tip {
	padding: 80rpx 0;
	display: flex;
	justify-content: center;
}
.empty-text {
	font-size: 28rpx;
	color: #9ca3af;
}

/* ========== 记录筛选区域 修复压缩问题 flex-shrink:0 ========== */
.filter-area {
	padding: 16rpx 20rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	flex-shrink: 0;
}
.search-input-wrap {
	display: flex;
	align-items: center;
	background: #f3f4f6;
	border-radius: 24rpx;
	padding: 14rpx 24rpx;
	gap: 12rpx;
}
.search-icon {
	color: #9ca3af;
}
.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #1f2937;
}
.status-tabs {
	display: flex;
	gap: 16rpx;
}
.status-tab {
	padding: 10rpx 28rpx;
	font-size: 26rpx;
	border-radius: 24rpx;
	background: #f3f4f6;
	color: #6b7280;
	transition: all 0.2s;
}
.status-active {
	background: #e6f0ff;
	color: #1677ff;
}
.total-count {
	font-size: 24rpx;
	color: #9ca3af;
}

/* 记录卡片 */
.record-card {
	background: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 1rpx 6rpx rgba(0,0,0,0.04);
	padding: 24rpx;
	margin-bottom: 20rpx;
	border: 1rpx solid #eee;
}
.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #e5e7eb;
	margin-bottom: 16rpx;
}
.header-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
	font-size: 28rpx;
	color: #1f2937;
}
.split-line {
	width: 1rpx;
	height: 40rpx;
	background: #e5e7eb;
}
.phone {
	color: #6b7280;
	font-size: 26rpx;
}
.tag-normal {
	padding: 6rpx 16rpx;
	font-size: 24rpx;
	border-radius: 8rpx;
	background: #e6f0ff;
	color: #1677ff;
}
.tag-expire {
	padding: 6rpx 16rpx;
	font-size: 24rpx;
	border-radius: 8rpx;
	background: #f2f3f5;
	color: #86909c;
}
.card-date {
	font-size: 26rpx;
	color: #6b7280;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #e5e7eb;
	margin-bottom: 16rpx;
}
.card-op {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 26rpx;
}
.op-text {
	color: #1677ff;
}
.op-group {
	display: flex;
	gap: 12rpx;
}
.op-btn {
	padding: 8rpx 20rpx;
	border-radius: 12rpx;
	font-size: 24rpx;
}
.op-copy {
	border: 1rpx solid #1677ff;
	color: #1677ff;
}
.op-cancel {
	border: 1rpx solid #f53f3f;
	color: #f53f3f;
}
.op-view {
	border: 1rpx solid #6b7280;
	color: #6b7280;
}

/* 底部固定按钮 */
.fixed-bottom-btn {
	width: 80%;
	margin: 30rpx auto;
	position: sticky;
	bottom: 30rpx;
	z-index: 10;
	text-align: center;
	padding: 16rpx;
	background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
	color: #fff;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 24rpx;
	box-shadow: 0 6rpx 20rpx rgba(22,119,255,0.3);
}

/* ========== 弹窗样式 ========== */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0,0,0,0.45);
	z-index: 998;
}
.modal-popup {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
	z-index: 999;
	padding: 32rpx 24rpx;
}
.modal-inner {
	max-height: 72vh;
	display: flex;
	flex-direction: column;
}
.modal-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 24rpx;
	border-bottom: 1rpx solid #e5e7eb;
	margin-bottom: 24rpx;
}
.modal-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #1f2937;
}
.close-icon {
	width: 32rpx;
	height: 32rpx;
}
.modal-body {
	flex: 1;
	overflow-y: auto;
	padding-bottom: 24rpx;
}
.form-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #e5e7eb;
}
.form-label {
	font-size: 28rpx;
	color: #6b7280;
	min-width: 160rpx;
}
.form-value {
	flex: 1;
	text-align: right;
	font-size: 28rpx;
	color: #1f2937;
}
.form-input {
	text-align: right;
	width: 100%;
}
.input-box {
	position: relative;
}
.search-drop {
	position: absolute;
	top: 70rpx;
	left: 0;
	right: 0;
	background: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
	z-index: 9999;
	overflow: hidden;
}
.drop-item {
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 20rpx;
	border-bottom: 1rpx solid #e5e7eb;
	font-size: 28rpx;
	color: #1f2937;
}
.picker-row {
	display: flex;
	gap: 16rpx;
	justify-content: flex-end;
}
.picker-box {
	padding: 10rpx 20rpx;
	background: #f3f4f6;
	border-radius: 12rpx;
}
.static-text {
	color: #6b7280;
}
.modal-footer {
	padding-top: 24rpx;
}
.submit-btn {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
	color: #fff;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 24rpx;
	border: none;
}

/* iOS滚动回弹兼容 */
::v-deep uni-scroll-view,
::v-deep .uni-scroll-view-content {
	overscroll-behavior: none;
}
</style>