<template>
	<view class="container">
		<view class="record-container">
			<view class="record-tabs">
				<view class="record-tabs-item" :class="{ active: c_activeTab == 1 }" @tap="switchToList">
					{{ tips.CarList[lang] }}
				</view>
				<view class="record-tabs-item" :class="{ active: c_activeTab == 2 }" @tap="switchToForm">
					{{ btnState }}{{ tips.Car[lang] }}
				</view>
			</view>

			<block v-if="c_activeTab == 1">
				<view class="record-tabs-1">
					<view class="search-box">
						<icon type="search" size="16" class="search-icon" />
						<input :placeholder="tips.SearchPlaceholder[lang]" class="search-input" @blur="bindblurSea" />
					</view>
				</view>

				<view class="tabs-1-conut">
					<view>{{ tips.TotalRecords[lang] }}{{ g_total }}{{ tips.Items[lang] }}</view>
					<view class="select-all" v-if="g_flagMulti">
						<text>{{ tips.SelectAll[lang] }}</text>
						<checkbox style="transform: scale(0.9);" @tap="handleAllC" :checked="all_c" />
					</view>
				</view>

				<view class="scroll-wrapper">
					<scroll-view scroll-y class="scroll-view">
						<view class="content-item" v-for="(item, index) in g_items" :key="index">
							<view class="content-item-head">
								<view class="head-left">
									<view class="left-category">
										<text>{{ item.platenumber }}</text>
									</view>
									<view class="left-split_line"></view>
									<view class="left-model">
										{{ item.vehicleSerialName || '-' }}{{ item.vehicleModeName || '' }}
									</view>
								</view>
								<view class="head-right" v-if="!g_flagMulti">
									<view class="btn-icon" :data-item="item" @tap="handleEdit">{{ tips.Edit[lang] }}
									</view>
									<view class="btn-icon" :data-item="item" @tap="handleDelete">{{ tips.Delete[lang] }}
									</view>
								</view>
								<view v-else>
									<checkbox-group :data-item="item" @change="handleChangeBlack">
										<checkbox style="transform: scale(1);" :checked="item.checked" />
									</checkbox-group>
								</view>
							</view>
							<view class="content-item-info">
								<view class="info-item" :class="item.sn && item.sn.length > 15 ? 'long-info-item' : ''">
									<label>{{ tips.DeviceSN[lang] }}：</label>
									<text>{{ item.sn || '-' }}</text>
								</view>
								<view class="info-item long-info-item">
									<label>{{ tips.EffectivePeriod[lang] }}：</label>
									<text>{{ item.startDate || '' }}-{{ item.endDate || '' }}</text>
								</view>
							</view>
							<view class="content-item-footer" v-if="g_source && !g_flagMulti">
								<view class="select-car-btn" :data-item="item" @tap="handleSelectJump">
									{{ tips.SelectThisCar[lang] }}
								</view>
							</view>
						</view>
						<view class="empty" v-if="g_items.length === 0">{{ tips.NoData[lang] }}</view>
					</scroll-view>
				</view>
			</block>

			<block v-else>
				<view class="scroll-wrapper">
					<scroll-view scroll-y class="scroll-view">
						<view class="card-info">
							<view class="card-info-item">
								<label>{{ tips.PlateNumber[lang] }}<text>*</text></label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterPlate[lang]" v-model="params.platenumber"
										data-item="platenumber" @input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>{{ tips.DeviceSN[lang] }}<text>*</text></label>
								<view class="card-info-item-input">
									<text v-if="id !== ''">{{ params.sn || tips.Empty[lang] }}</text>
									<input v-else :placeholder="tips.PleaseEnterSN[lang]" v-model="params.paramsn"
										data-item="sn" @input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>code<text>*</text></label>
								<view class="card-info-item-input">
									<text v-if="id !== ''">{{ params.code || tips.Empty[lang] }}</text>
									<input v-else :placeholder="tips.PleaseEnterCode[lang]" v-model="params.code"
										data-item="code" @input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>{{ tips.VehicleSeries[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterSeries[lang]"
										v-model="params.vehicleSerialName" data-item="vehicleSerialName"
										@input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>{{ tips.VehicleModel[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterModel[lang]" v-model="params.vehicleModeName"
										data-item="vehicleModeName" @input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>{{ tips.ModelYear[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterYear[lang]" v-model="params.ccdate"
										data-item="ccdate" @input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>{{ tips.TotalMileage[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterTotalMileage[lang]"
										v-model="params.totalMileage" data-item="totalMileage"
										@input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>{{ tips.MaintainMileage[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterMaintainMileage[lang]"
										v-model="params.maintainMileage" data-item="maintainMileage"
										@input="handleBindinput" />
								</view>
							</view>

							<view class="card-info-item">
								<label>{{ tips.MaintainInterval[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterMaintainInterval[lang]"
										v-model="params.maintainMileageInterval" data-item="maintainMileageInterval"
										@input="handleBindinput" />
								</view>
							</view>
						</view>

						<view class="card-footer">
							<view @tap="handleSubmit">{{ tips.Confirm[lang] }}{{ btnState }}</view>
						</view>
					</scroll-view>
				</view>
			</block>
		</view>

		<view class="levitation-button" v-if="c_activeTab == 1 && g_flagMulti && g_black.length > 0"
			@tap="handleJumpBlackInfo">
			<text>{{ tips.Confirm[lang] }}</text>
		</view>
	</view>
</template>

<script>
	import {
		u_carList,
		u_addOrUpdateCar,
		u_carapiDeleteCar
	} from '@/api/index'
	import {
		tips
	} from '@/utils/langtips.js'
	import {
		titles
	} from '@/utils/langtitle.js'
	export default {
		data() {
			return {
				lang: 'zhCn',
				tips: tips,
				c_activeTab: 1,
				g_page: 1,
				g_items: [],
				params: {},
				btnState: '新增',
				id: '',
				batterylift: '一键启动',
				carOwnerName: '智信通',
				brakingType: 1,
				all_c: false,
				g_source: '',
				g_flagMulti: false,
				info: null,
				allParams: '',
				type: '',
				name: '',
				desc: '',
				comParam: '',
				g_total: '0',
				g_black: [],
				g_platenumbers: []
			}
		},
		onLoad(options) {
			this.lang = uni.getStorageSync('language') || 'zhCn';
			this.initCarryParams(options)
			this.initList()
		},
		onShow() {
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'zoneCenter/sendKeyToRenter'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
			this.btnState = this.tips.Add[this.lang]
		},
		methods: {
			switchToList() {
				this.c_activeTab = 1
				this.clearForm()
			},
			switchToForm() {
				this.c_activeTab = 2
				this.clearForm()
			},
			clearForm() {
				this.btnState = this.tips.Add[this.lang];
				this.id = ''
				this.params = {
					platenumber: '',
					sn: '',
					code: '',
					vehicleSerialName: '',
					vehicleModeName: '',
					ccdate: '',
					totalMileage: '',
					maintainMileage: '',
					maintainMileageInterval: ''
				}
			},
			bindblurSea(evt) {
				this.comParam = evt.detail.value
				this.g_page = 1
				this.g_items = []
				this.initList()
			},
			async handleDelete(evt) {
				const info = evt.currentTarget.dataset.item
				uni.showModal({
					title: this.tips.Tips[this.lang],
					content: this.tips.ConfirmDelete[this.lang],
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await u_carapiDeleteCar({
									sn: info?.sn,
									code: info?.code
								})
								if (result.code === 1000) {
									uni.showToast({
										title: result.msg
									})
									this.c_activeTab = 1
									this.g_page = 1
									this.g_items = []
									this.initList()
								}
							} catch (e) {}
						}
					}
				})
			},
			handleChangeBlack(evt) {
				const targetItem = evt.currentTarget.dataset.item || {}
				const {
					id
				} = targetItem
				if (!id) return
				const idx = this.g_items.findIndex(i => i.id === id)
				if (idx === -1) return
				const list = [...this.g_items]
				list[idx].checked = !list[idx].checked
				this.all_c = list.every(i => i.checked)
				const checked = list.filter(i => i.checked)
				this.g_items = list
				this.g_black = checked.map(i => i.id).filter(Boolean)
				this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
			},
			handleAllC() {
				if (this.g_items.length === 0) return uni.showToast({
					title: this.tips.NoData[this.lang],
					icon: 'none'
				})
				const target = !this.all_c
				const newItems = this.g_items.map(i => ({
					...i,
					checked: target
				}))
				const checked = newItems.filter(i => i.checked)
				this.g_items = newItems
				this.all_c = target
				this.g_black = checked.map(i => i.id).filter(Boolean)
				this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
			},
			handleJumpBlackInfo() {
				uni.reLaunch({
					url: `${this.g_source}?black=${this.g_black}&type=${this.type}&name=${this.name}&platenumbers=${this.g_platenumbers}&info=${JSON.stringify(this.info)}`
				})
			},
			scanCode() {
				uni.scanCode({
					success: (res) => {
						this.params.sn = res.result
					}
				})
			},
			initCarryParams(evt) {
				const {
					source,
					flagMulti,
					info,
					allParams,
					type,
					name,
					desc
				} = evt
				this.g_source = source
				this.g_flagMulti = flagMulti
				this.info = info ? JSON.parse(info) : null
				this.allParams = allParams
				this.type = type
				this.name = name
				this.desc = desc
			},
			handleSelectJump(evt) {
				const {
					item
				} = evt.currentTarget.dataset
				const url = this.allParams ?
					`${this.g_source}?datails=${JSON.stringify(item)}&allParams=${this.allParams}&type=${this.type}` :
					`${this.g_source}?datails=${JSON.stringify(item)}`
				uni.redirectTo({
					url
				})
			},
			async initList() {
				try {
					const param = {
						page: this.g_page,
						pageSize: 1000,
						comParam: this.comParam || ''
					}
					const res = await u_carList(param)
					if (res.code === 1000) {
						this.g_items = this.g_items.concat(res.content || [])
						this.g_total = Number(res.count || 0).toLocaleString()
						const vehList = this.desc ? JSON.parse(this.desc).vehList : []
						const snSet = new Set(vehList.map(i => i.sn))
						this.g_items = this.g_items.map(item => ({
							...item,
							checked: !!snSet.has(item.sn)
						}))
						this.all_c = this.g_items.every(i => i.checked)
						const checked = this.g_items.filter(i => i.checked)
						this.g_black = checked.map(i => i.id).filter(Boolean)
						this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
					}
				} catch (e) {}
			},
			handleBindinput(evt) {
				const key = evt.currentTarget.dataset.item
				this.params[key] = evt.detail.value
			},
			async handleSubmit() {
				const param = {
					...this.params,
					brakingType: this.brakingType,
					batterylift: this.batterylift,
					carOwnerName: this.carOwnerName,
					id: this.id || ''
				}
				if (!param.platenumber) return uni.showToast({
					title: this.tips.PleaseEnterPlate[this.lang],
					icon: 'none'
				})
				if (!param.sn) return uni.showToast({
					title: this.tips.PleaseEnterSN[this.lang],
					icon: 'none'
				})
				try {
					uni.showLoading()
					const res = await u_addOrUpdateCar(param)
					if (res.code === 1000) {
						uni.showToast({
							title: res.msg
						})
						this.switchToList()
					}
				} catch (e) {} finally {
					uni.hideLoading()
				}
			},
			handleEdit(evt) {
				const info = evt.currentTarget.dataset.item
				this.c_activeTab = 2
				this.btnState = this.tips.Edit[this.lang];
				this.id = info.id
				this.params = {
					maintainMileage: info.maintainMileage || '',
					maintainMileageInterval: info.maintainMileageInterval || '',
					totalMileage: info.totalMileage || '',
					vehicleSerialName: info.vehicleSerialName || '',
					vehicleModeName: info.vehicleModeName || '',
					ccdate: info.ccdate || '',
					platenumber: info.platenumber || '',
					sn: info.sn || '',
					code: info.code || ''
				}
			}
		}
	}
</script>

<style scoped>
	page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #EFF1FC;
	}

	.container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 10rpx;
		box-sizing: border-box;
	}

	.record-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.record-tabs {
		display: flex;
		background: #f8f8f8;
	}

	.record-tabs-item {
		flex: 1;
		padding: 24rpx 0;
		text-align: center;
		font-size: 28rpx;
		font-weight: bold;
		color: #666;
	}

	.record-tabs-item.active {
		background-color: #6a9bee;
		color: #fff;
	}

	.search-box {
		display: flex;
		align-items: center;
		border: 1rpx solid #eee;
		border-radius: 40rpx;
		padding: 12rpx 20rpx;
		margin: 20rpx;
	}

	.search-input {
		flex: 1;
		font-size: 24rpx;
		margin-left: 10rpx;
	}

	.tabs-1-conut {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20rpx 20rpx;
		color: #666;
		font-size: 24rpx;
	}

	.tabs-1-conut>view:first-child {
		flex: 1;
		text-align: center;
	}

	.select-all {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.scroll-wrapper {
		flex: 1;
		overflow: hidden;
	}

	.scroll-view {
		height: 100%;
	}

	.content-item {
		margin: 20rpx;
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.content-item-head {
		display: flex;
		justify-content: space-between;
		padding: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.left-category {
		font-size: 26rpx;
		font-weight: bold;
	}

	.left-split_line {
		width: 1rpx;
		height: 28rpx;
		background: #ddd;
	}

	.left-model {
		font-size: 24rpx;
		color: #333;
	}

	.head-right {
		display: flex;
		gap: 20rpx;
	}

	.btn-icon {
		color: #1677ff;
		font-size: 24rpx;
	}

	.content-item-info {
		padding: 20rpx;
		font-size: 24rpx;
		color: #333;
	}

	.info-item {
		margin-bottom: 12rpx;
	}

	.long-info-item {
		width: 100%;
	}

	.content-item-footer {
		padding: 20rpx 24rpx;
		display: flex;
		justify-content: flex-end;
		border-top: 1rpx solid #f5f5f5;
	}

	.select-car-btn {
		background: #1677ff;
		color: #fff;
		padding: 12rpx 24rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		line-height: 1.2;
	}

	.empty {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
	}

	.card-info {
		padding: 20rpx;
	}

	.card-info-item {
		display: flex;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		font-size: 26rpx;
	}

	.card-info-item label {
		color: #333;
	}

	.card-info-item label text {
		color: red;
	}

	.card-info-item-input {
		color: #666;
		max-width: 50%;
		text-align: right;
	}

	.card-footer {
		text-align: center;
		padding: 30rpx 0;
	}

	.card-footer view {
		background: #1677ff;
		color: #fff;
		padding: 20rpx 60rpx;
		border-radius: 50rpx;
		font-size: 30rpx;
		font-weight: bold;
		display: inline-block;
	}

	.levitation-button {
		position: fixed;
		bottom: 60rpx;
		left: 0;
		right: 0;
		text-align: center;
	}

	.levitation-button text {
		background: #1677ff;
		color: #fff;
		padding: 20rpx 80rpx;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: bold;
	}
</style>