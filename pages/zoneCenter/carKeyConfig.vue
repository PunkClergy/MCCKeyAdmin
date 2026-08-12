<template>
	<view class="container">
		<view class="record-container">
			<!-- ===== 顶部标签页：固定 ===== -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="{ active: c_activeTab == 1 }" @tap="switchToList">
					{{ tips.CarList[lang] }}
				</view>
				<view class="record-tabs-item" :class="{ active: c_activeTab == 2 }" @tap="switchToForm">
					{{ btnState }}{{ tips.Car[lang] }}
				</view>
			</view>

			<!-- ===== 列表视图 ===== -->
			<block v-if="c_activeTab == 1">
				<!-- 固定头部：搜索 + 统计 -->
				<view class="list-header">
					<view class="search-box">
						<icon type="search" size="16" class="search-icon" color="#4facfe" />
						<input :placeholder="tips.SearchPlaceholder[lang]" class="search-input" @blur="bindblurSea" />
					</view>
					<view class="tabs-1-conut">
						<view class="total-records">{{ tips.TotalRecords[lang] }}<text class="highlight-number">{{ g_total }}</text>{{ tips.Items[lang] }}</view>
						<view class="select-all" v-if="g_flagMulti">
							<text>{{ tips.SelectAll[lang] }}</text>
							<checkbox style="transform: scale(0.9);" @tap="handleAllC" :checked="all_c" color="#4facfe" />
						</view>
					</view>
				</view>

				<!-- 滚动列表 -->
				<view class="scroll-wrapper">
					<scroll-view scroll-y class="scroll-view" show-scrollbar="false">
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
									<view class="btn-icon" :data-item="item" @tap="handleEdit">{{ tips.Edit[lang] }}</view>
									<view class="btn-icon delete" :data-item="item" @tap="handleDelete">{{ tips.Delete[lang] }}</view>
								</view>
								<view v-else>
									<checkbox-group :data-item="item" @change="handleChangeBlack">
										<checkbox style="transform: scale(1);" :checked="item.checked" color="#4facfe" />
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
						<view class="empty" v-if="g_items.length === 0">
							<text>{{ tips.NoData[lang] }}</text>
						</view>
					</scroll-view>
				</view>
			</block>

			<!-- ===== 表单视图（新增/编辑） ===== -->
			<block v-else>
				<!-- 滚动表单内容（不包含底部按钮） -->
				<view class="scroll-wrapper form-scroll">
					<scroll-view scroll-y class="scroll-view" show-scrollbar="false">
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
									<input :placeholder="tips.PleaseEnterSeries[lang]" v-model="params.vehicleSerialName"
										data-item="vehicleSerialName" @input="handleBindinput" />
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
									<input :placeholder="tips.PleaseEnterTotalMileage[lang]" v-model="params.totalMileage"
										data-item="totalMileage" @input="handleBindinput" />
								</view>
							</view>
							<view class="card-info-item">
								<label>{{ tips.MaintainMileage[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterMaintainMileage[lang]" v-model="params.maintainMileage"
										data-item="maintainMileage" @input="handleBindinput" />
								</view>
							</view>
							<view class="card-info-item">
								<label>{{ tips.MaintainInterval[lang] }}</label>
								<view class="card-info-item-input">
									<input :placeholder="tips.PleaseEnterMaintainInterval[lang]" v-model="params.maintainMileageInterval"
										data-item="maintainMileageInterval" @input="handleBindinput" />
								</view>
							</view>
						</view>
						<!-- 底部占位，避免内容被按钮遮挡 -->
						<view style="height: 20rpx;"></view>
					</scroll-view>
				</view>

				<!-- 固定底部确认按钮 -->
				<view class="card-footer" >
					<view @tap="handleSubmit" class="primary-btn">{{ tips.Confirm[lang] }}{{ btnState }}</view>
				</view>
			</block>
		</view>

		<!-- 悬浮多选确认按钮（仅列表） -->
		<view class="levitation-button" v-if="c_activeTab == 1 && g_flagMulti && g_black.length > 0"
			@tap="handleJumpBlackInfo">
			<text class="primary-btn">{{ tips.Confirm[lang] }}</text>
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
				btnState: '',
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
			this.initCarryParams(options)
			
		},
		onShow() {
			this.initList()
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'zoneCenter/carKeyConfig'
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
					confirmText: this.tips.Confirm[this.lang],
					cancelText: this.tips.Cancel[this.lang],
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
				const { id } = targetItem
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
				uni.redirectTo({
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
				const { source, flagMulti, info, allParams, type, name, desc } = evt
				this.g_source = source
				this.g_flagMulti = flagMulti
				this.info = info ? JSON.parse(info) : null
				this.allParams = allParams
				this.type = type
				this.name = name
				this.desc = desc
			},
			handleSelectJump(evt) {
				const { item } = evt.currentTarget.dataset
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
					isDirectReg: 1,
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
						this.initList()
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
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

<style>
	/* 全局背景：渐变天蓝色 */
	page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(145deg, #e3f2fd 0%, #e3f2fd 20%, #81d4fa 100%);
		box-sizing: border-box;
	}

	/* 滚动条美化 */
	.scroll-view::-webkit-scrollbar {
		width: 4px;
	}
	.scroll-view::-webkit-scrollbar-track {
		background: transparent;
	}
	.scroll-view::-webkit-scrollbar-thumb {
		background: rgba(79, 172, 254, 0.5);
		border-radius: 10px;
	}

	.container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		box-sizing: border-box;
		min-height: 0; /* 防止内容撑开 */
	}

	/* 主卡片：毛玻璃，固定高度由 flex 分配，内容不溢出 */
	.record-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.45);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 48rpx;
		border: 1px solid rgba(255, 255, 255, 0.6);
		box-shadow: 0 20px 60px rgba(0, 150, 200, 0.15);
		overflow: hidden;
		min-height: 0; /* flex 收缩 */
	}

	/* ===== 标签页：固定 ===== */
	.record-tabs {
		display: flex;
		background: rgba(255, 255, 255, 0.3);
		padding: 12rpx;
		margin: 20rpx 20rpx 10rpx 20rpx;
		border-radius: 60rpx;
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		flex-shrink: 0;
		position: relative;
		z-index: 5;
	}

	.record-tabs-item {
		flex: 1;
		padding: 20rpx 0;
		text-align: center;
		font-size: 28rpx;
		font-weight: 600;
		color: #5a7a8a;
		border-radius: 40rpx;
		transition: all 0.3s ease;
		letter-spacing: 0.5px;
	}

	.record-tabs-item.active {
		background: linear-gradient(135deg, #4facfe 0%, #00c6fb 100%);
		color: #fff;
		box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
	}

	/* ===== 列表固定头部 ===== */
	.list-header {
		flex-shrink: 0;
	}

	.search-box {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: 60rpx;
		padding: 12rpx 24rpx;
		margin: 20rpx 20rpx 10rpx 20rpx;
		box-shadow: 0 4px 15px rgba(0, 150, 255, 0.05);
		transition: all 0.3s ease;
	}
	.search-box:focus-within {
		box-shadow: 0 4px 20px rgba(79, 172, 254, 0.15);
		border-color: #4facfe;
	}
	.search-input {
		flex: 1;
		font-size: 28rpx;
		margin-left: 10rpx;
		color: #2c3e50;
	}

	.tabs-1-conut {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30rpx 20rpx 30rpx;
		color: #5a7a8a;
		font-size: 26rpx;
	}
	.total-records .highlight-number {
		color: #4facfe;
		font-weight: 700;
		margin: 0 6rpx;
		font-size: 30rpx;
	}
	.select-all {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	/* ===== 滚动容器（列表 & 表单共用） ===== */
	.scroll-wrapper {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.scroll-view {
		flex: 1;
		/* 不使用 height:100%，改用 flex 自动填充 */
		width: 100%;
		padding-bottom: 10rpx;
		box-sizing: border-box;
	}

	/* ===== 列表卡片 ===== */
	.content-item {
		margin: 20rpx;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-radius: 28rpx;
		border: 1px solid rgba(255, 255, 255, 0.8);
		box-shadow: 0 8px 30px rgba(0, 100, 200, 0.06);
		transition: all 0.3s ease;
		overflow: hidden;
	}
	.content-item:active {
		transform: scale(0.98);
		box-shadow: 0 4px 15px rgba(0, 100, 200, 0.12);
	}
	.content-item-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 30rpx;
		border-bottom: 1px solid rgba(0, 0, 0, 0.02);
	}
	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	.left-category {
		font-size: 30rpx;
		font-weight: 700;
		color: #1a2a3a;
	}
	.left-split_line {
		width: 2rpx;
		height: 28rpx;
		background: rgba(0, 0, 0, 0.08);
	}
	.left-model {
		font-size: 26rpx;
		color: #5a7a8a;
		font-weight: 500;
	}
	.head-right {
		display: flex;
		gap: 16rpx;
	}
	.btn-icon {
		padding: 6rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: #4facfe;
		background: rgba(79, 172, 254, 0.1);
		transition: all 0.2s ease;
	}
	.btn-icon:active {
		transform: scale(0.92);
		background: rgba(79, 172, 254, 0.2);
	}
	.btn-icon.delete {
		color: #ff6b6b;
		background: rgba(255, 107, 107, 0.1);
	}
	.btn-icon.delete:active {
		background: rgba(255, 107, 107, 0.2);
	}
	.content-item-info {
		padding: 20rpx 30rpx;
		font-size: 26rpx;
		color: #2c3e50;
	}
	.info-item {
		display: flex;
		margin-bottom: 10rpx;
	}
	.info-item label {
		color: #5a7a8a;
		width: 140rpx;
		flex-shrink: 0;
	}
	.info-item text {
		color: #1a2a3a;
		font-weight: 500;
	}
	.content-item-footer {
		padding: 16rpx 30rpx 24rpx 30rpx;
		display: flex;
		justify-content: flex-end;
		border-top: 1px solid rgba(0, 0, 0, 0.02);
	}

	/* ===== 通用按钮 ===== */
	.primary-btn,
	.select-car-btn,
	.card-footer view,
	.levitation-button text {
		background: linear-gradient(135deg, #4facfe 0%, #00c6fb 100%);
		box-shadow: 0 8px 25px rgba(79, 172, 254, 0.35);
		color: #fff;
		font-weight: 600;
		border: none;
		border-radius: 60rpx;
		padding: 16rpx 40rpx;
		font-size: 28rpx;
		transition: all 0.3s ease;
		letter-spacing: 0.5px;
		text-align: center;
		display: inline-block;
	}
	.primary-btn:active,
	.select-car-btn:active,
	.card-footer view:active,
	.levitation-button text:active {
		transform: scale(0.94);
		box-shadow: 0 4px 15px rgba(79, 172, 254, 0.5);
	}

	/* ===== 空状态 ===== */
	.empty {
		text-align: center;
		padding: 80rpx 0;
		color: #5a7a8a;
		font-size: 28rpx;
	}

	/* ===== 表单卡片 ===== */
	.card-info {
		padding: 10rpx 30rpx;
	}
	.card-info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.03);
	}
	.card-info-item label {
		color: #1a2a3a;
		font-weight: 600;
		font-size: 28rpx;
		width: 160rpx;
		flex-shrink: 0;
	}
	.card-info-item label text {
		color: #ff6b6b;
		margin-left: 4rpx;
	}
	.card-info-item-input {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}
	.card-info-item-input input,
	.card-info-item-input text {
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.8);
		border-radius: 40rpx;
		padding: 16rpx 24rpx;
		font-size: 28rpx;
		color: #1a2a3a;
		width: 100%;
		max-width: 400rpx;
		text-align: right;
		transition: all 0.3s ease;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
	}
	.card-info-item-input input:focus {
		border-color: #4facfe;
		box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1), 0 4px 15px rgba(79, 172, 254, 0.05);
		background: rgba(255, 255, 255, 0.9);
	}
	.card-info-item-input text {
		background: transparent;
		border: none;
		padding: 16rpx 0;
		color: #5a7a8a;
	}

	/* ===== 表单底部固定按钮 ===== */
	.card-footer {
		flex-shrink: 0;
		text-align: center;
		padding: 20rpx 0 30rpx 0;
		/* background: rgba(255, 255, 255, 0.7); */
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-top: 1px solid rgba(255, 255, 255, 0.5);
		
		
	}

	/* ===== 悬浮多选按钮（仅列表） ===== */
	.levitation-button {
		position: fixed;
		bottom: 40rpx;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		z-index: 999;
		pointer-events: none;
	}
	.levitation-button text {
		pointer-events: auto;
		padding: 20rpx 80rpx;
		font-size: 32rpx;
		box-shadow: 0 12px 35px rgba(79, 172, 254, 0.45);
	}

	/* ===== 复选框样式 ===== */
	checkbox .wx-checkbox-input,
	checkbox .uni-checkbox-input {
		border-radius: 8rpx !important;
		border-color: #4facfe !important;
	}
	checkbox .wx-checkbox-input.wx-checkbox-input-checked,
	checkbox .uni-checkbox-input.uni-checkbox-input-checked {
		background: #4facfe !important;
		border-color: #4facfe !important;
	}
</style>