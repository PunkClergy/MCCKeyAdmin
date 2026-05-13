<template>
	<view class="page-container">
		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stats-item">
				<text class="stats-num risky">{{ totalCount }}</text>
				<text class="stats-label">{{ $t('AbnormalRecordTotal') }}</text>
			</view>
			<view class="stats-item">
				<text class="stats-num risky">{{ todayCount }}</text>
				<text class="stats-label">{{ $t('TodayNewAbnormal') }}</text>
			</view>
		</view>

		<!-- 异常记录列表 -->
		<view class="record-list-container">
			<view class="record-list">
				<view class="list-title">
					<text>{{ $t('SuspectedRemovalAbnormal') }}</text>
					<view class="filter-btn" @click="openFilterModal">{{ $t('Filter') }} 📋</view>
				</view>

				<view class="record-item" v-for="item in filteredRecords" :key="item.recordId" @click="goRecordDetail"
					:data-record="item">
					<view class="record-left">
						<text class="record-time">{{ item.alarmtime }}</text>
						<text class="record-desc">⚠️ {{ $t('SuspectedRemoval') }}</text>
						<text class="record-vehicle">
							{{ $t('RelatedVehicle') }}：{{ item.vehicleSerialName }}{{ item.vehicleModeName }}（{{ item.platenumber }}）
						</text>
					</view>
					<view class="record-right">
						<button class="nav-btn" size="mini" @click.stop="showAddressModal" :data-record="item">
							{{ $t('ViewLocation') }}
						</button>
					</view>
				</view>

				<view class="empty" v-if="filteredRecords.length === 0">
					{{ $t('NoSuspectedRemovalRecords') }}
				</view>
			</view>
		</view>

		<!-- 地址信息弹窗 -->
		<view class="address-modal" v-if="showAddressPop">
			<view class="modal-mask" @click="closeAddressModal"></view>
			<view class="modal-content">
				<view class="modal-title">{{ $t('LocationInfo') }}</view>
				<view class="address-content">
					<text class="address-label">{{ $t('DetailedAddress') }}：</text>
					<text class="address-text">{{ currentAddress || $t('NoAddressInfo') }}</text>
				</view>
				<view class="btn-group">
					<button class="reset-btn" @click="closeAddressModal">{{ $t('Close') }}</button>
				</view>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<view class="filter-modal" v-if="showFilterModal">
			<view class="modal-mask" @click="closeFilterModal"></view>
			<view class="modal-content">
				<view class="modal-title">{{ $t('FilterConditions') }}</view>

				<!-- 日期 -->
				<view class="filter-item">
					<text class="filter-label">{{ $t('SelectDate') }}：</text>
					<picker mode="date" :value="selectedDate" @change="onDateChange">
						<view class="picker-input">{{ selectedDate || $t('SelectDate') }}</view>
					</picker>
				</view>

				<!-- 车牌号 -->
				<view class="filter-item">
					<text class="filter-label">{{ $t('LicensePlate') }}：</text>
					<input class="input-box" :placeholder="$t('EnterLicensePlate')" v-model="inputCarNumber"
						@input="onCarNumberInput" :focus="focusCarInput" />

					<view class="car-list" v-if="carCandidateList.length > 0">
						<view class="car-item" v-for="item in carCandidateList" :key="item.platenumber"
							@click="selectCarNumber" :data-carnumber="item.platenumber">
							{{ item.vehicleSerialName }}{{ item.vehicleModeName }}（{{ item.platenumber }}）
						</view>
					</view>
				</view>

				<!-- 按钮 -->
				<view class="btn-group">
					<button class="reset-btn" @click="resetFilter">{{ $t('Reset') }}</button>
					<button class="confirm-btn" @click="confirmFilter">{{ $t('ConfirmFilter') }}</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_dismantleAlarmList
	} from '@/api/index'
	import { titles } from '@/utils/langtitle.js'
	import { tips } from '@/utils/langtips.js'
	
	export default {
		data() {
			return {
				isSubscribed: false,
				totalCount: 0,
				todayCount: 0,
				warningRecords: [],
				showFilterModal: false,
				selectedDate: '',
				inputCarNumber: '',
				carCandidateList: [],
				focusCarInput: false,
				filteredRecords: [],
				showAddressPop: false,
				currentAddress: '',
				currentRecord: null,
				tips: tips,
				lang: 'zhCn',
			}
		},

		onLoad() {
			this.handleCarList()
		},
		
		onShow() {
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'zoneCenter/alarmDeviceRemove'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
		},
		
		// 多语言翻译方法
		methods: {
			$t(key) {
				return tips[key]?.[this.lang] || key
			},
			
			// 获取拆除报警列表
			async handleCarList(inputCarNumber, selectedDate) {
				const param = {
					plateNumber: inputCarNumber || '',
					startDate: selectedDate || ''
				}

				try {
					const res = await u_dismantleAlarmList(param)
					if (res.code === 1000) {
						const list = res.content || []
						const today = new Date().toLocaleDateString()

						const todayCount = list.filter(item => {
							if (!item.alarmtime) return false
							const itemDate = new Date(item.alarmtime).toLocaleDateString()
							return itemDate === today
						}).length

						const isAllEmpty = !inputCarNumber && !selectedDate

						this.warningRecords = list
						this.filteredRecords = [...this.warningRecords]
						this.inputCarNumber = ''
						this.selectedDate = ''

						if (isAllEmpty) {
							this.totalCount = res.count || 0
							this.todayCount = todayCount
						}

						this.closeFilterModal()
					}
				} catch (e) {}
			},

			openFilterModal() {
				this.showFilterModal = true
				this.focusCarInput = true
			},
			closeFilterModal() {
				this.showFilterModal = false
				this.carCandidateList = []
			},
			onDateChange(e) {
				this.selectedDate = e.detail.value
			},
			onCarNumberInput(e) {
				const inputVal = (e.detail.value || '').trim().toUpperCase()
				this.inputCarNumber = inputVal

				if (!inputVal) {
					this.carCandidateList = []
					return
				}

				const candidateList = this.warningRecords.filter(item => {
					const plate = (item.platenumber || '').toUpperCase()
					const name = item.vehicleSerialName || ''
					return plate.includes(inputVal) || name.includes(inputVal)
				})

				const uniqueList = Array.from(
					new Map(candidateList.map(item => [item.platenumber, item])).values()
				)

				this.carCandidateList = uniqueList
			},
			selectCarNumber(e) {
				const carno = e.currentTarget.dataset.carnumber
				this.inputCarNumber = carno
				this.carCandidateList = []
			},
			resetFilter() {
				this.selectedDate = ''
				this.inputCarNumber = ''
				this.carCandidateList = []
				this.filteredRecords = [...this.warningRecords]
			},
			confirmFilter() {
				this.handleCarList(this.inputCarNumber, this.selectedDate)
			},
			goRecordDetail(e) {
				const record = e.currentTarget.dataset.record
				uni.navigateTo({
					url: `/pages/recordDetail/recordDetail?recordId=${record.recordId}`
				})
			},
			showAddressModal(e) {
				const record = e.currentTarget.dataset.record
				this.currentRecord = record
				this.currentAddress = record.address || this.$t('NoAddressInfo')
				this.showAddressPop = true
			},
			closeAddressModal() {
				this.showAddressPop = false
			},
			openMapLocation() {
				const record = this.currentRecord
				if (!record) return

				const { latitude, longitude, vehicleSerialName, vehicleModeName, platenumber } = record

				uni.openLocation({
					latitude: Number(latitude),
					longitude: Number(longitude),
					name: `${vehicleSerialName}${vehicleModeName}（${platenumber}）${this.$t('SuspectedRemoval')}`,
					address: this.currentAddress,
					scale: 18,
					fail: () => {
						uni.showModal({
							title: this.$t('NavigationFailed'),
							content: this.$t('CannotOpenMap'),
							showCancel: false,
							confirmText: this.$t('Confirm')
						})
					}
				})
				this.closeAddressModal()
			}
		}
	}
</script>

<style scoped>
	page {
		background: #EFF1FC;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.page-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding-bottom: 30rpx;
		width: 100%;
		box-sizing: border-box;
	}

	.stats-card {
		display: flex;
		margin: 20rpx 30rpx;
		padding: 30rpx 0;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		width: calc(100% - 60rpx);
		box-sizing: border-box;
	}

	.stats-item {
		flex: 1;
		text-align: center;
	}

	.stats-num {
		font-size: 44rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		color: #fa4143;
	}

	.stats-label {
		font-size: 24rpx;
		color: #999;
	}

	.record-list-container {
		margin: 0 30rpx;
		width: calc(100% - 60rpx);
		box-sizing: border-box;
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.record-list {
		width: 100%;
	}

	.list-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 20rpx 0;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		position: sticky;
		top: 0;
		background: #f5f7fa;
		z-index: 5;
	}

	.filter-btn {
		font-size: 24rpx;
		padding: 8rpx 16rpx;
		background: #f5f5f5;
		color: #333;
		border-radius: 8rpx;
	}

	.record-item {
		display: flex;
		justify-content: space-between;
		background: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		border-left: 6rpx solid #fa4143;
		width: 100%;
		box-sizing: border-box;
	}

	.record-left {
		flex: 1;
	}

	.record-time {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
	}

	.record-desc {
		font-size: 28rpx;
		color: #fa4143;
		display: block;
		margin-bottom: 8rpx;
		font-weight: 500;
	}

	.record-vehicle {
		font-size: 24rpx;
		color: #666;
		display: block;
	}

	.record-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.nav-btn {
		background: #fa4143;
		color: #fff;
		border-radius: 20rpx;
		font-size: 24rpx;
	}

	.empty {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
		font-size: 28rpx;
		width: 100%;
	}

	.address-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
	}

	.address-content {
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
		min-height: 120rpx;
	}

	.address-label {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 10rpx;
		display: block;
	}

	.address-text {
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
	}

	.filter-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 999;
	}

	.modal-mask {
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
	}

	.modal-content {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
		padding: 30rpx;
		box-sizing: border-box;
		max-height: 80vh;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		text-align: center;
	}

	.filter-item {
		display: flex;
		flex-direction: column;
		margin-bottom: 24rpx;
	}

	.filter-label {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 12rpx;
	}

	.picker-input {
		height: 80rpx;
		line-height: 80rpx;
		border: 1rpx solid #eee;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 26rpx;
		color: #666;
	}

	.input-box {
		height: 80rpx;
		line-height: 80rpx;
		border: 1rpx solid #eee;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 26rpx;
		color: #666;
	}

	.car-list {
		width: 100%;
		max-height: 200rpx;
		overflow-y: auto;
		border: 1rpx solid #eee;
		border-top: none;
		border-radius: 0 0 8rpx 8rpx;
		margin-top: -1rpx;
		background: #fff;
	}

	.car-item {
		padding: 20rpx;
		font-size: 26rpx;
		color: #333;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.car-item:last-child {
		border-bottom: none;
	}

	.btn-group {
		display: flex;
		gap: 20rpx;
		margin-top: 40rpx;
	}

	.reset-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		background: #f5f5f5;
		color: #333;
		border-radius: 8rpx;
		font-size: 28rpx;
	}

	.confirm-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		background: #fa4143;
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
	}
</style>