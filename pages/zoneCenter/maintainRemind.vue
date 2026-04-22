<template>
	<view class="page-container">
		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stats-item">
				<text class="stats-num risky">{{ totalCount }}</text>
				<text class="stats-label">车辆总数</text>
			</view>
			<view class="stats-item">
				<text class="stats-num risky"
					:style="{ color: todayCount > 0 ? '#fa4143' : '' }">{{ todayCount }}</text>
				<text class="stats-label">辆车需要保养</text>
			</view>
		</view>

		<!-- 保养列表 -->
		<view class="record-list-container">
			<view class="record-list">
				<view class="list-title">
					<text>车辆保养提醒</text>
					<view class="filter-btn" @tap="openFilterModal">筛选 📋</view>
				</view>

				<view class="record-item" v-for="(item, idx) in filteredRecords" :key="idx" :data-record="item">
					<view class="record-left">
						<text class="record-title">{{ item.carModel }}（{{ item.carNumber }}）</text>
						<text class="record-desc" :style="{ color: item.remainingMileage > 0 ? '' : '#fa4143' }">
							离保养里程: {{ item.remainingMileage }}公里
						</text>
						<view class="mileage-row">
							<text class="mileage-text">总里程: {{ item.totalMileage }}公里</text>
							<text class="calibrate-btn" @tap="openCalibrateModal" :data-record="item">校准</text>
						</view>
						<text class="cycle-text">保养周期: {{ item.maintenanceCycle }}公里</text>
						<text class="record-time">记录时间：{{ item.warningTime }}</text>
					</view>
					<view class="record-right">
						<view class="nav-btn" @tap="handleMaintenanceConfirm" :data-record="item"
							v-if="item.maintenanceStatus === 'pending'">
							保养确认
						</view>
					</view>
				</view>

				<view class="empty" v-if="filteredRecords.length === 0">暂无符合条件的保养提醒记录</view>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<view class="filter-modal" v-if="showFilterModal">
			<view class="modal-mask" @tap="closeFilterModal"></view>
			<view class="modal-content">
				<view class="modal-title">筛选条件</view>
				<view class="filter-item">
					<text class="filter-label">保养状态：</text>
					<picker mode="selector" :range="maintenanceStatusOptions" range-key="name"
						:value="selectedStatusIndex" @change="onStatusChange">
						<view class="picker-input">{{ selectedStatus.name || '请选择状态' }}</view>
					</picker>
				</view>
				<view class="filter-item">
					<text class="filter-label">车牌号：</text>
					<input class="input-box" placeholder="请输入车牌号" v-model="inputCarNumber" @input="onCarNumberInput"
						:focus="focusCarInput" />
					<view class="car-list" v-if="carCandidateList.length > 0">
						<view class="car-item" v-for="(item, idx) in carCandidateList" :key="idx" @tap="selectCarNumber"
							:data-carnumber="item.carNumber">
							{{ item.carModel }}（{{ item.carNumber }}）
						</view>
					</view>
				</view>
				<view class="btn-group">
					<button class="reset-btn" @tap="resetFilter">重置</button>
					<button class="confirm-btn" @tap="confirmFilter">确认筛选</button>
				</view>
			</view>
		</view>

		<!-- 里程校准弹窗 -->
		<view class="calibrate-modal" v-if="showCalibrateModal">
			<view class="modal-mask" @tap="closeCalibrateModal"></view>
			<view class="calibrate-content">
				<view class="modal-title">里程校准</view>
				<view class="calibrate-input-wrap">
					<input class="calibrate-input" type="number" placeholder="请输入校准里程" v-model="calibrateValue" />
					<text class="unit-text">km</text>
				</view>
				<view class="btn-group">
					<button class="cancel-btn" @tap="closeCalibrateModal">取消</button>
					<button class="confirm-btn" @tap="confirmCalibrate">确认</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_carList,
		u_maintained,
		u_calibrateTotalMileage
	} from '@/api/index'

	export default {
		data() {
			return {
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
			this.loadCarMaintenanceList()
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

			// 筛选弹窗
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
					name: '全部',
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
					title: `筛选出${result.length}条记录`,
					icon: 'none'
				})
			},

			// 保养确认
			async handleMaintenanceConfirm(e) {
				const record = e.currentTarget.dataset.record
				uni.showModal({
					title: '温馨提示',
					content: '确认已完成保养？',
					success: async (res) => {
						if (!res.confirm) return
						try {
							uni.showLoading({
								title: '提交中...'
							})
							const {
								code
							} = await u_maintained({
								sn: record.sn,
								totalMileage: record.totalMileage
							})
							if (code === 1000) {
								uni.showToast({
									title: '保养成功',
									icon: 'none'
								})
								this.loadCarMaintenanceList()
							} else {
								uni.showToast({
									title: '操作失败',
									icon: 'none'
								})
							}
						} catch (e) {} finally {
							uni.hideLoading()
						}
					}
				})
			},

			// 里程校准
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
						title: '请输入有效里程',
						icon: 'none'
					})
				}

				try {
					uni.showLoading({
						title: '校准中...'
					})
					const {
						code
					} = await u_calibrateTotalMileage({
						sn: this.currentCalibrateRecord.sn,
						totalMileage: mileage
					})
					if (code === 1000) {
						uni.showToast({
							title: '校准成功',
							icon: 'none'
						})
						this.showCalibrateModal = false
						this.loadCarMaintenanceList()
					} else {
						uni.showToast({
							title: '校准失败',
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
		width: 100%;
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