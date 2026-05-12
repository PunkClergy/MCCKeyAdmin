<template>
	<view class="page-container">
		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stats-item">
				<text class="stats-num risky">{{ totalCount }}</text>
				<text class="stats-label">{{ tips.TotalCars[lang] }}</text>
			</view>
			<view class="stats-item">
				<text class="stats-num risky"
					:style="{ color: todayCount > 0 ? '#fa4143' : '' }">{{ todayCount }}</text>
				<text class="stats-label">{{ tips.NeedMaintenance[lang] }}</text>
			</view>
		</view>

		<!-- 保养列表 -->
		<view class="record-list-container">
			<view class="record-list">
				<view class="list-title">
					<text>{{ tips.CarMaintenanceReminder[lang] }}</text>
					<view class="filter-btn" @tap="openFilterModal">{{ tips.Filter[lang] }} 📋</view>
				</view>

				<view class="record-item" v-for="(item, idx) in filteredRecords" :key="idx" :data-record="item">
					<view class="record-left">
						<text class="record-title">{{ item.carModel }}（{{ item.carNumber }}）</text>
						<text class="record-desc" :style="{ color: item.remainingMileage > 0 ? '' : '#fa4143' }">
							{{ tips.RemainingMaintenance[lang] }}: {{ item.remainingMileage }}{{ tips.KM[lang] }}
						</text>
						<view class="mileage-row">
							<text class="mileage-text">{{ tips.TotalMileage[lang] }}:
								{{ item.totalMileage }}{{ tips.KM[lang] }}</text>
							<text class="calibrate-btn" @tap="openCalibrateModal"
								:data-record="item">{{ tips.Calibrate[lang] }}</text>
						</view>
						<text class="cycle-text">{{ tips.MaintenanceCycle[lang] }}:
							{{ item.maintenanceCycle }}{{ tips.KM[lang] }}</text>
						<text class="record-time">{{ tips.RecordTime[lang] }}：{{ item.warningTime }}</text>
					</view>
					<view class="record-right">
						<view class="nav-btn" @tap="handleMaintenanceConfirm" :data-record="item"
							v-if="item.maintenanceStatus === 'pending'">
							{{ tips.MaintenanceConfirm[lang] }}
						</view>
					</view>
				</view>

				<view class="empty" v-if="filteredRecords.length === 0">{{ tips.NoMaintenanceRecords[lang] }}</view>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<view class="filter-modal" v-if="showFilterModal">
			<view class="modal-mask" @tap="closeFilterModal"></view>
			<view class="modal-content">
				<view class="modal-title">{{ tips.FilterConditions[lang] }}</view>
				<view class="filter-item">
					<text class="filter-label">{{ tips.MaintenanceStatus[lang] }}：</text>
					<picker mode="selector" :range="maintenanceStatusOptions" range-key="name"
						:value="selectedStatusIndex" @change="onStatusChange">
						<view class="picker-input">{{ selectedStatus.name || tips.PleaseSelectStatus[lang] }}</view>
					</picker>
				</view>
				<view class="filter-item">
					<text class="filter-label">{{ tips.PlateNumber[lang] }}：</text>
					<input class="input-box" :placeholder="tips.PleaseEnterPlate[lang]" v-model="inputCarNumber"
						@input="onCarNumberInput" :focus="focusCarInput" />
					<view class="car-list" v-if="carCandidateList.length > 0">
						<view class="car-item" v-for="(item, idx) in carCandidateList" :key="idx" @tap="selectCarNumber"
							:data-carnumber="item.carNumber">
							{{ item.carModel }}（{{ item.carNumber }}）
						</view>
					</view>
				</view>
				<view class="btn-group">
					<button class="reset-btn" @tap="resetFilter">{{ tips.Reset[lang] }}</button>
					<button class="confirm-btn" @tap="confirmFilter">{{ tips.Confirm[lang] }}</button>
				</view>
			</view>
		</view>

		<!-- 里程校准弹窗 -->
		<view class="calibrate-modal" v-if="showCalibrateModal">
			<view class="modal-mask" @tap="closeCalibrateModal"></view>
			<view class="calibrate-content">
				<view class="modal-title">{{ tips.MileageCalibration[lang] }}</view>
				<view class="calibrate-input-wrap">
					<input class="calibrate-input" type="number" :placeholder="tips.PleaseEnterCalibrateMileage[lang]"
						v-model="calibrateValue" />
					<text class="unit-text">km</text>
				</view>
				<view class="btn-group">
					<button class="cancel-btn" @tap="closeCalibrateModal">{{ tips.Cancel[lang] }}</button>
					<button class="confirm-btn" @tap="confirmCalibrate">{{ tips.Confirm[lang] }}</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		tips
	} from '@/utils/langtips.js'
	import {
		titles
	} from '@/utils/langtitle.js'
	import {
		u_carList,
		u_maintained,
		u_calibrateTotalMileage
	} from '@/api/index'

	export default {
		data() {
			return {
				lang: 'zhCn',
				tips: tips,

				totalCount: 0,
				todayCount: 0,
				maintenanceStatusOptions: [{
						name: '全部',
						value: 'all'
					},
					{
						name: '待保养',
						value: 'pending'
					},
					{
						name: '已保养',
						value: 'done'
					}
				],
				selectedStatusIndex: 0,
				selectedStatus: {
					name: '全部',
					value: 'all'
				},
				showFilterModal: false,
				inputCarNumber: '',
				carCandidateList: [],
				focusCarInput: false,
				filteredRecords: [],
				carList: [],
				showCalibrateModal: false,
				calibrateValue: '',
				currentCalibrateRecord: null
			}
		},
		onLoad() {
			this.lang = uni.getStorageSync('language') || 'zhCn';
			this.loadCarMaintenanceList();
		},
		onShow() {
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'zoneCenter/maintainRemind'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
			this.maintenanceStatusOptions = [{
					name: this.tips.All[this.lang],
					value: 'all'
				},
				{
					name: this.tips.PendingMaintenance[this.lang],
					value: 'pending'
				},
				{
					name: this.tips.Maintained[this.lang],
					value: 'done'
				}
			]
			this.selectedStatus = {
				name: this.tips.All[this.lang],
				value: 'all'
			}
		},
		methods: {
			async loadCarMaintenanceList() {
				try {
					const {
						code,
						content = []
					} = await u_carList({})
					if (code !== 1000) return

					let pendingCount = 0
					const list = content.map(item => {
						const remaining = Number(item.distanceMaintainMileage) || 0
						if (remaining < 0) pendingCount++

						return {
							sn: item.sn || '',
							carNumber: item.platenumber || '-',
							carModel: `${item.vehicleSerialName || ''}${item.vehicleModeName || ''}` || '-',
							warningTime: item.mileageTime || '',
							remainingMileage: remaining,
							totalMileage: item.totalMileage || 0,
							maintenanceCycle: item.maintainMileageInterval || 0,
							maintenanceStatus: remaining > 0 ? 'done' : 'pending'
						}
					})

					this.carList = list
					this.filteredRecords = list
					this.totalCount = content.length
					this.todayCount = pendingCount
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
			onStatusChange(e) {
				const idx = e.detail.value
				this.selectedStatusIndex = idx
				this.selectedStatus = this.maintenanceStatusOptions[idx]
			},
			onCarNumberInput(e) {
				const val = e.detail.value.trim().toUpperCase()
				this.inputCarNumber = val
				if (!val) return this.carCandidateList = []

				const matched = this.carList.filter(i =>
					i.carNumber.toUpperCase().includes(val) || i.carModel.includes(val)
				)
				const unique = Array.from(new Set(matched.map(i => i.carNumber)))
					.map(num => matched.find(i => i.carNumber === num))
				this.carCandidateList = unique
			},
			selectCarNumber(e) {
				this.inputCarNumber = e.currentTarget.dataset.carnumber
				this.carCandidateList = []
			},
			resetFilter() {
				this.selectedStatusIndex = 0
				this.selectedStatus = {
					name: this.tips.All[this.lang],
					value: 'all'
				}
				this.inputCarNumber = ''
				this.carCandidateList = []
				this.filteredRecords = [...this.carList]
				this.showFilterModal = false
			},
			confirmFilter() {
				let result = [...this.carList]
				const {
					value
				} = this.selectedStatus
				const keyword = this.inputCarNumber.trim().toUpperCase()

				if (value !== 'all') result = result.filter(i => i.maintenanceStatus === value)
				if (keyword) result = result.filter(i => i.carNumber.toUpperCase().includes(keyword))

				this.filteredRecords = result
				this.showFilterModal = false
				this.carCandidateList = []
				uni.showToast({
					title: `${tips.FilteredOut[lang]}${result.length}${tips.Records[lang]}`,
					icon: 'none'
				})
			},

			async handleMaintenanceConfirm(e) {
				const record = e.currentTarget.dataset.record
				uni.showModal({
					title: this.tips.WarmTip[this.lang],
					content: this.tips.ConfirmMaintenanceCompleted[this.lang],
					confirmText: this.tips.Confirm[this.lang],
					cancelText: this.tips.Cancel[this.lang],
					success: async (res) => {
						if (!res.confirm) return
						try {
							uni.showLoading({
								title: this.tips.Submitting[this.lang]
							})
							const {
								code
							} = await u_maintained({
								sn: record.sn,
								totalMileage: record.totalMileage
							})
							if (code === 1000) {
								uni.showToast({
									title: this.tips.MaintenanceSuccess[this.lang],
									icon: 'none'
								})
								this.loadCarMaintenanceList()
							} else {
								uni.showToast({
									title: this.tips.OperationFailed[this.lang],
									icon: 'none'
								})
							}
						} catch (e) {} finally {
							uni.hideLoading()
						}
					}
				})
			},

			openCalibrateModal(e) {
				const record = e.currentTarget.dataset.record
				this.showCalibrateModal = true
				this.calibrateValue = String(record.totalMileage)
				this.currentCalibrateRecord = record
			},
			closeCalibrateModal() {
				this.showCalibrateModal = false
				this.calibrateValue = ''
			},
			async confirmCalibrate() {
				const mileage = Number(this.calibrateValue)
				if (!this.currentCalibrateRecord || isNaN(mileage) || mileage < 0) {
					return uni.showToast({
						title: this.tips.PleaseEnterValidMileage[this.lang],
						icon: 'none'
					})
				}

				try {
					uni.showLoading({
						title: this.tips.Calibrating[this.lang]
					})
					const {
						code
					} = await u_calibrateTotalMileage({
						sn: this.currentCalibrateRecord.sn,
						totalMileage: mileage
					})
					if (code === 1000) {
						uni.showToast({
							title: this.tips.CalibrateSuccess[this.lang],
							icon: 'none'
						})
						this.showCalibrateModal = false
						this.loadCarMaintenanceList()
					} else {
						uni.showToast({
							title: this.tips.CalibrateFailed[this.lang],
							icon: 'none'
						})
					}
				} catch (e) {} finally {
					uni.hideLoading()
				}
			}
		}
	}
</script>

<style scoped>
	page {
		background: #f5f7fa;
		height: 100vh
	}

	.page-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #EFF1FC
	}

	.stats-card {
		display: flex;
		margin: 20rpx 30rpx;
		padding: 30rpx 0;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05)
	}

	.stats-item {
		flex: 1;
		text-align: center
	}

	.stats-num {
		font-size: 44rpx;
		font-weight: 700;
		margin-bottom: 10rpx
	}

	.stats-label {
		font-size: 24rpx;
		color: #999
	}

	.record-list-container {
		margin: 0 30rpx;
		flex: 1;
		overflow-y: auto;
		padding-bottom: 20rpx
	}

	.list-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		font-size: 32rpx;
		font-weight: 700;
		position: sticky;
		top: 0;
		background: #f5f7fa
	}

	.filter-btn {
		font-size: 24rpx;
		padding: 8rpx 16rpx;
		background: #f5f5f5;
		border-radius: 8rpx
	}

	.record-item {
		display: flex;
		justify-content: space-between;
		background: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		border-left: 6rpx solid #fa4143
	}

	.record-left {
		flex: 1
	}

	.record-title {
		font-size: 28rpx;
		font-weight: 700;
		display: block;
		margin-bottom: 8rpx
	}

	.record-desc {
		font-size: 28rpx;
		display: block;
		margin-bottom: 8rpx
	}

	.mileage-row {
		display: flex;
		align-items: center;
		margin-bottom: 4rpx;
		font-size: 24rpx;
		color: #666
	}

	.calibrate-btn {
		color: #1989fa;
		font-size: 24rpx;
		padding: 2rpx 8rpx;
		background: #f0f8ff;
		border-radius: 4rpx;
		margin-left: 8rpx
	}

	.cycle-text,
	.record-time {
		font-size: 24rpx;
		color: #666;
		display: block;
		margin-bottom: 4rpx
	}

	.record-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end
	}

	.nav-btn {
		color: #007aff;
		font-size: 26rpx
	}

	.empty {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
		font-size: 28rpx
	}

	.filter-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 999
	}

	.modal-mask {
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5)
	}

	.modal-content {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 92%;
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
		padding: 30rpx;
		max-height: 80vh;
		overflow-y: auto
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: 700;
		margin-bottom: 30rpx;
		text-align: center
	}

	.filter-item {
		margin-bottom: 24rpx
	}

	.filter-label {
		font-size: 28rpx;
		margin-bottom: 12rpx;
		display: block
	}

	.picker-input,
	.input-box {
		height: 80rpx;
		line-height: 80rpx;
		border: 1rpx solid #eee;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 26rpx
	}

	.car-list {
		max-height: 200rpx;
		overflow-y: auto;
		border: 1rpx solid #eee;
		border-top: none;
		background: #fff
	}

	.car-item {
		padding: 20rpx;
		font-size: 26rpx;
		border-bottom: 1rpx solid #f5f5f5
	}

	.btn-group {
		display: flex;
		gap: 20rpx;
		margin-top: 40rpx
	}

	.reset-btn {
		flex: 1;
		height: 80rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 28rpx
	}

	.confirm-btn {
		flex: 1;
		height: 80rpx;
		background: #fa4143;
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx
	}

	.calibrate-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000
	}

	.calibrate-content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		max-width: 500rpx;
		background: #fff;
		border-radius: 16rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15)
	}

	.calibrate-input-wrap {
		margin-bottom: 30rpx
	}

	.calibrate-input {
		width: 100%;
		height: 88rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx
	}

	.unit-text {
		position: absolute;
		right: 20rpx;
		top: 30rpx;
		font-size: 26rpx;
		color: #999
	}

	.cancel-btn {
		flex: 1;
		height: 80rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 28rpx
	}
</style>