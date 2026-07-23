<template>
	<view class="container">
		<!-- 主内容区域 -->
		<view class="record-container">
			<!-- Tab切换 -->
			<view class="record-tabs" @tap="handleSwitchTab">
				<view class="record-tabs-item"
					:style="{backgroundColor: c_activeTab === 1 ? '#64B5F6' : '#fff',color: c_activeTab === 1 ? '#fff' : '#010101'}">
					车辆列表
				</view>
				<view class="record-tabs-item"
					:style="{backgroundColor: c_activeTab === 2 ? '#64B5F6' : '#fff',color: c_activeTab === 2 ? '#fff' : '#010101'}">
					{{ btnState }}车辆
				</view>
			</view>

			<!-- 车辆列表Tab -->
			<view v-if="c_activeTab === 1">
				<view class="record-tabs-1">
					<view class="search-box">
						<input placeholder="车牌号/设备号/车型/车系" class="search-input" @blur="bindblurSea"
							v-model="comParam" />
					</view>
				</view>
				<view class="tabs-1-conut" :style="{justifyContent: g_flagMulti ? 'space-between' : 'center'}">
					<view></view>
					<view>共有{{ g_total }}条记录</view>
				</view>
				<scroll-view scroll-y :style="{height: listScrollHeight + 'px'}" @scrolltolower="handleLower"
					refresher-enabled :refresher-triggered="g_triggered" @refresherrefresh="handleRefresh">
					<view v-for="item in g_items" :key="item.id" class="content-item">
						<view class="content-item-head">
							<view class="head-left">
								<view class="left-category">
									<image src="/static/car_icon.png" />
									<text>{{ item.platenumber }}</text>
								</view>
								<view class="left-split_line"></view>
								<view class="left-model">
									{{ item.vehicleSerialName || '-' }}{{ item.vehicleModeName || '' }}
								</view>
							</view>
							<view class="head-right" v-if="!g_flagMulti">
								<image src="/static/images/_edit.png" :data-item="item" @tap="handleEdit" />
								<image src="/static/images/_delete.png" :data-item="item" @tap="handleDelete" />
							</view>
						</view>
						<view class="content-item-info">
							<view class="info-item" :class="item.sn.length > 15 ? 'long-info-item' : ''">
								<label>设备号 ：</label>
								<text>{{ item.sn || '-' }}</text>
							</view>
						</view>
						<view class="content-item-footer" v-if="g_source">
							<view class="footer-left"></view>
							<view class="footer-right">
								<view class="footer-right-btn" :data-item="item" @tap="handleSelectJump"
									v-if="!g_flagMulti">
									<text>选择此车</text>
								</view>
								<checkbox-group @change="handleChangeBlack">
									<checkbox style="transform: scale(0.7);" />
								</checkbox-group>
							</view>
						</view>
						<view class="content-item-footer" v-else>
							<view class="footer-left" style="max-width: 70%;">
								<view v-for="(g_item, index) in item.driverList" :key="index">
									<view style="display: flex;gap: 15rpx;line-height: 50rpx;">
										<text>{{ g_item.drivername }}12</text>
										<text>{{ g_item.drivermobile }}</text>
										<text style="color:#1b64b1;" :data-item="g_item"
											@tap="handleUnBindDriver">解绑</text>
									</view>
									<view>
										<text style="font-size: 22rpx;font-weight: 500;">
											{{ g_item.rentstartdate }} - {{ g_item.rentenddate }}
										</text>
									</view>
								</view>
							</view>
							<view class="footer-right" style="display: flex;gap: 10rpx;">
								<view class="footer-right-btn" :data-item="item" @tap="handleShowSendNetKeyModal">
									<text>绑定用车人</text>
								</view>
							</view>
						</view>
					</view>
					<view v-if="g_items.length < 1" class="empty-tip">暂无车辆</view>
				</scroll-view>
			</view>

			<!-- 新增/修改车辆Tab -->
			<view v-if="c_activeTab === 2">
				<scroll-view scroll-y :style="{height: listScrollHeight + 'px'}">
					<view class="card-info">
						<view class="card-info-item">
							<label>车牌号<text style="color:red">*</text></label>
							<view class="card-info-item-input">
								<input placeholder="请输入车牌号" v-model="params.platenumber" data-item="platenumber"
									@input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>设备号<text style="color:red">*</text></label>
							<view class="card-info-item-input">
								<input placeholder="请输入设备号" v-model="params.sn" :disabled="!!id" data-item="sn"
									@input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>code<text style="color:red">*</text></label>
							<view class="card-info-item-input">
								<input placeholder="请输入code" v-model="params.code" :disabled="!!id" data-item="code"
									@input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>车系</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车系" v-model="params.vehicleSerialName"
									data-item="vehicleSerialName" @input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>车型</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车型" v-model="params.vehicleModeName" data-item="vehicleModeName"
									@input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>年款</label>
							<view class="card-info-item-input">
								<input placeholder="请输入年款" v-model="params.ccdate" data-item="ccdate"
									@input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>当前总里程(km)</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车辆当前里程" v-model="params.totalMileage" data-item="totalMileage"
									@input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>已保养里程(km)</label>
							<view class="card-info-item-input">
								<input placeholder="请输入已保养里程" v-model="params.maintainMileage"
									data-item="maintainMileage" @input="handleBindinput" />
							</view>
						</view>
						<view class="card-info-item">
							<label>保养周期里程(km)</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车辆保养周期里程" v-model="params.maintainMileageInterval"
									data-item="maintainMileageInterval" @input="handleBindinput" />
							</view>
						</view>
					</view>
					<view class="card-footer" @tap="handleSubmit">
						<text>确认{{ btnState }}</text>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 绑定用车人弹窗 -->
		<view v-if="net_send_key_show_momal">
			<view class="modal-mask" @tap="handleHideSengKeyModal"></view>
			<view class="modal-base-map">
				<form @submit="handleNetFormSubmit">
					<view class="modal-container">
						<view class="modal-container-head">
							<text>绑定用车人</text>
						</view>
						<view class="modal-container-middle">
							<view class="middle-form-item">
								<label>车牌号</label>
								<view class="modal-form-region">{{ cellData.platenumber }}</view>
							</view>
							<view class="middle-form-item">
								<label>绑定用车人</label>
								<view class="modal-form-region">
									<input placeholder="请输入使用人" name="personName"
										style="text-align: right;font-size: 28rpx;" />
								</view>
							</view>
							<view class="middle-form-item">
								<label>手机号</label>
								<view class="modal-form-region">
									<input placeholder="请输入手机号" name="mobile"
										style="text-align: right;font-size: 28rpx;" />
								</view>
							</view>
							<view class="middle-form-item">
								<label>开始时间</label>
								<view class="modal-form-region">
									<picker mode="date" data-index="startDate" @change="bindTimeChange">
										<view class="form-item-text"><text>{{ startDate }}</text></view>
									</picker>
									<picker mode="time" data-index="startTime" @change="bindTimeChange">
										<view class="form-item-text"><text>{{ startTime }}</text></view>
									</picker>
								</view>
							</view>
							<view class="middle-form-item">
								<label>结束时间</label>
								<view class="modal-form-region">
									<picker mode="date" data-index="endDate" @change="bindTimeChange">
										<view class="form-item-text"><text>{{ endDate }}</text></view>
									</picker>
									<picker mode="time" data-index="endTime" @change="bindTimeChange">
										<view class="form-item-text"><text>{{ endTime }}</text></view>
									</picker>
								</view>
							</view>
						</view>
						<view class="modal-container-footer">
							<button form-type="submit">确认</button>
						</view>
					</view>
				</form>
			</view>
		</view>

		<!-- 免责弹窗 -->
		<view v-if="showDisclaimerModal" class="modal-mask" @tap="closeDisclaimerModal">
			<view class="modal-wrap" @tap.stop>
				<view class="modal-title">免责条款</view>
				<view class="modal-content">
					设备安装完成后，建议您使用 K7 模块做基础预检，检测记录会留存存档，后续设备出现问题时，能帮助我们更快排查维修，给您更完善的售后保障～
					<text>若您选择【免检注册】，将会跳过本次 K7 预检流程。</text>
					<text
						class="warn-text">温馨小提示：如果未完成预检就注册设备，后续设备产生故障，我们将无法提供售后排查与维修服务，相关损失需要您自行承担，还请您仔细考虑后再确认哦。</text>
				</view>
				<view class="modal-buttons">
					<view class="btn-cancel" @tap="modalGoCheck">去检测</view>
					<view class="btn-confirm" @tap="modalSkipCheck">免检注册</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_wycRentVehicleList,
		u_addOrUpdateCar,
		u_carapiDeleteCar,
		u_bindOrUpdateDriver,
		u_unBindDriver
	} from '@/api/index'

	export default {
		data() {
			return {
				c_screen_height: 0,
				statusBarHeight: 0,
				navBarHeight: 44,

				g_page: 1,
				g_items: [],
				g_total: 0,
				g_triggered: false,
				isRefreshing: false,
				c_activeTab: 1,
				comParam: '',

				params: {},
				btnState: '新增',
				id: '',
				batterylift: '一键启动',
				carOwnerNameValue: '',
				carOwnerName: '智信通',

				g_source: '',
				g_flagMulti: '',

				net_send_key_show_momal: false,
				cellData: {},
				vehId: '',
				startDate: '2025-03-20',
				startTime: '19:00',
				endDate: '2025-03-20',
				endTime: '19:00',

				showDisclaimerModal: false
			}
		},
		computed: {
			recordContainerStyle() {
				const top = this.navBarHeight + this.statusBarHeight
				const height = this.c_screen_height - top
				return {
					height: `${height}px`,
					marginTop: `${top}px`
				}
			},
			listScrollHeight() {
				const base = this.c_screen_height - (this.navBarHeight + this.statusBarHeight + 10 + 50)
				return base
			}
		},
		onLoad(options) {
			this.initCarryParams(options)
			this.initList()
		},
		onShow() {
			this.initialiImageBaseConversion()
		},
		onReady() {
			this.handleCurrentDate()
		},
		methods: {
			bindblurSea() {
				this.g_page = 1
				this.g_items = []
				this.initList()
			},
			bindTimeChange(evt) {
				const category = evt.currentTarget.dataset.index
				this[category] = evt.detail.value
			},
			handleDelete(evt) {
				uni.showModal({
					title: '提示',
					content: '确认删除？',
					complete: async (res) => {
						if (res.confirm) {

							const param = {
								sn: info?.sn,
								code: info?.code
							}
							const response = await u_carapiDeleteCar(param)
							if (response.code === 1000) {
								this.c_activeTab = 1
								this.g_page = 1
								this.g_items = []
								this.initList()
							}

						}
					}
				})
			},
			initCarryParams(evt) {
				const {
					source,
					flagMulti
				} = evt
				this.g_source = source
				this.g_flagMulti = flagMulti
			},
			handleSelectJump(evt) {
				const item = evt.currentTarget.dataset.item
				uni.redirectTo({
					url: `${this.g_source}?datails=${JSON.stringify(item)}`
				})
			},
			handleShowSendNetKeyModal(evt) {
				const info = evt.currentTarget.dataset.item
				this.cellData = info
				this.net_send_key_show_momal = true
				this.vehId = info.id
			},
			handleHideSengKeyModal() {
				this.cellData = {}
				this.net_send_key_show_momal = false
			},
			handleCurrentDate() {
				const formatDate = (date) => {
					const year = date.getFullYear()
					const month = date.getMonth() + 1
					const day = date.getDate()
					return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
				}
				const formatTime = (date) => {
					const hours = date.getHours()
					const minutes = date.getMinutes()
					return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`
				}
				const now = new Date()
				const tomorrow = new Date(now)
				tomorrow.setDate(now.getDate() + 1)
				const currentDate = formatDate(now)
				const tomorrowDate = formatDate(tomorrow)
				const currentTime = formatTime(now)
				this.startDate = currentDate
				this.endDate = tomorrowDate
				this.startTime = currentTime
				this.endTime = currentTime
			},
			async handleNetFormSubmit(evt) {
				const {
					startDate,
					startTime,
					endDate,
					endTime,
					vehId
				} = this
				const formData = evt.detail.value
				const validations = [{
						field: formData.personName,
						message: '请输入使用人'
					},
					{
						field: formData.mobile,
						message: '请输入手机号'
					}
				]
				const validationError = validations.find(item => !item.field)
				if (validationError) {
					uni.showToast({
						title: validationError.message,
						icon: 'none'
					})
					return
				}
				const buildDateTime = (date, time) => `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim()
				const requestParams = {
					vehId,
					rentstartdate: buildDateTime(startDate, startTime),
					rentenddate: buildDateTime(endDate, endTime),
					drivername: formData.personName,
					drivermobile: formData.mobile
				}

				const response = await u_bindOrUpdateDriver(requestParams)
				console.log(response)
				if (response.code === 1000) {
					this.net_send_key_show_momal = false
					this.g_items = []
					this.initList()
					this.handleCurrentDate()
				}

			},
			async handleUnBindDriver(evt) {

				uni.showModal({
					title: '提示',
					content: '确认解绑？！',
					confirmText: '确认解绑',
					cancelText: '取消',
					success: async (res) => {
						if (!res.confirm) return
						const driverId = evt?.currentTarget?.dataset?.item?.id || ''
						const response = await u_unBindDriver({
							driverId
						})
						if (response?.code === 1000) {
							this.g_page = 1
							this.g_items = []
							this.initList()
						}
					}
				})



			},
			initialiImageBaseConversion() {
				const imageMap = [{
						path: '/assets/images/home/1-1.png',
						key: 's_background_tabs_1'
					},
					{
						path: '/assets/images/home/2-1.png',
						key: 's_background_tabs_active_1'
					},
					{
						path: '/assets/images/home/1-2.png',
						key: 's_background_tabs_2'
					},
					{
						path: '/assets/images/home/2-2.png',
						key: 's_background_tabs_active_2'
					}
				]
				const promises = imageMap.map(item => new Promise((resolve) => {
					uni.getFileSystemManager().readFile({
						filePath: item.path,
						encoding: 'base64',
						success: (res) => resolve({
							[item.key]: `data:image/png;base64,${res.data}`
						})
					})
				}))
				Promise.all(promises).then(results => {
					const dataToUpdate = results.reduce((acc, curr) => ({
						...acc,
						...curr
					}), {})
					Object.keys(dataToUpdate).forEach(key => {
						this[key] = dataToUpdate[key]
					})
				})
			},
			async initList() {
				const param = {
					page: this.g_page,
					comParam: this.comParam || ""
				}
				try {
					const response = await u_wycRentVehicleList(param)
					if (response.code === 1000) {
						if (!(this.g_page > 1 && response.data.content.length === 0)) {
							this.g_items = this.g_items.concat(response.content)
						}
						this.g_total = Number(response.count || 0)
					} else {
						console.error('车辆列表接口返回错误', response)
						uni.showToast({
							title: response.msg || '数据加载失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('车辆列表接口请求失败', error)
					uni.showToast({
						title: '网络请求异常',
						icon: 'none'
					})
				}
			},
			handleLower() {
				this.g_page += 1
				this.initList()
			},
			async handleRefresh() {
				if (this.isRefreshing) return
				this.isRefreshing = true
				this.g_triggered = true
				this.g_page = 1
				this.g_items = []
				try {
					await this.initList()
				} catch (err) {
					console.error('下拉刷新异常', err)
					uni.showToast({
						title: '刷新失败',
						icon: 'none'
					})
				} finally {
					setTimeout(() => {
						this.g_triggered = false
						this.isRefreshing = false
					}, 100)
				}
			},
			handleBindinput(evt) {
				const key = evt.currentTarget.dataset.item
				this.params[key] = evt.detail.value
			},
			async handleSubmit(evt) {
				console.log(evt, '222')
				// const apiUrl = getApp().data.k1swUrl + u_addOrUpdateCar.URL
				const param = {
					id: this.id || '',
					...this.params,
					isDirectReg: evt === 1 ? 1 : '',
					batterylift: this.batterylift,
					carOwnerName: this.carOwnerName === '智信通' ? this.carOwnerName : this.carOwnerNameValue
				}
				console.log(param, '0000000')
				const validations = [{
						field: param.platenumber,
						message: '请填写车牌号'
					},
					{
						field: param.sn,
						message: '请填写设备号'
					},
					{
						field: param.code,
						message: '请填写code'
					}
				]
				for (const item of validations) {
					console.log(1234567)
					if (!item.field?.trim()) {
						uni.showToast({
							title: item.message,
							icon: 'none'
						})
						return
					}
				}
				const response = await u_addOrUpdateCar(param)
				console.log(response)
				if (response.code === 1000) {
					this.c_activeTab = 1
					this.params = {}
					this.btnState = '新增'
					this.id = ''
					this.batterylift = '一键启动'
					this.carOwnerNameValue = ''
					this.carOwnerName = '智信通'
					this.g_items = []
					this.g_page = 1
					this.initList()
				} else if (response.code === 7000) {
					this.showDisclaimerModal = true
				} else {
					uni.showToast({
						title: response.msg,
						icon: 'none'
					})
				}

			},
			handleEdit(evt) {
				const info = evt.currentTarget.dataset.item
				this.c_activeTab = 2
				this.btnState = '修改'
				this.id = info?.id
				this.params = {
					maintainMileage: info?.maintainMileage || '',
					maintainMileageInterval: info?.maintainMileageInterval || '',
					totalMileage: info?.totalMileage || '',
					vehicleSerialName: info?.vehicleSerialName || "",
					vehicleModeName: info?.vehicleModeName || "",
					ccdate: info?.ccdate || "",
					introduction: info?.introduction || "",
					platenumber: info?.platenumber || "",
					vin: info?.vin || "",
					xsgw: info?.xsgw || "",
					sn: info?.sn || "",
					code: info?.code || ''
				}
				this.batterylift = info?.batterylift || '一键启动'
				this.carOwnerName = info?.carOwnerName
			},
			handleSwitchTab() {
				if (this.c_activeTab === 2) {
					this.c_activeTab = 1
					this.id = ''
					this.btnState = '新增'
					this.params = {}
				} else {
					this.c_activeTab = 2
				}
			},
			closeDisclaimerModal() {
				this.showDisclaimerModal = false
			},
			modalGoCheck() {
				this.closeDisclaimerModal()
				uni.redirectTo({
					url: '/pages/ToInternalStaff/K7/index'
				})
			},
			modalSkipCheck() {
				this.closeDisclaimerModal()
				this.handleSubmit(1)
			},
			handleChangeBlack() {}
		}
	}
</script>

<style scoped>
	page {
		background: #EFF5FF;
	}

	.container {
		min-height: 100vh;
		padding: 10rpx 4rpx;
		background: #EFF5FF;
	}

	.record-container {
		width: 96%;
		margin: auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.record-tabs {
		display: flex;
		height: 50px;
	}

	.record-tabs-item {
		border-radius: 12rpx;
		width: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		touch-action: pan-x;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 28rpx;
		color: #010101;
	}

	.record-tabs-1 {
		display: flex;
		padding: 10rpx;
		justify-content: space-between;
		align-items: center;
	}

	.tabs-1-conut {
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #7b7c7c;
		padding: 10px;
	}

	.content-item {
		margin: 15rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item-head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx 15rpx;
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.left-category {
		display: flex;
		align-items: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
		gap: 10rpx;
	}

	.left-category image {
		width: 43rpx;
		height: 35rpx;
	}

	.left-split_line {
		width: 1rpx;
		height: 28rpx;
		border-left: 1px solid #797979;
	}

	.left-model {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.head-right {
		display: flex;
		flex-direction: row;
		gap: 20rpx;
		align-items: center;
		justify-content: center;
	}

	.head-right image {
		width: 30rpx;
		height: 30rpx;
	}

	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.info-item {
		flex: 0 0 48%;
		box-sizing: border-box;
		word-wrap: break-word;
		transition: all 0.3s;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.long-info-item {
		flex-basis: 100% !important;
	}

	.content-item-footer {
		display: flex;
		padding: 15rpx;
		justify-content: space-between;
	}

	.footer-left {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
	}

	.footer-right {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.footer-right-btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 22rpx;
		color: #ffffff;
		background-color: #1b64b1;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
	}

	.card-info {
		flex: 1;
		overflow-y: auto;
	}

	.card-info-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx;
	}

	.card-info-item label {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		gap: 6rpx;
		align-items: flex-start;
		flex-shrink: 0;
		min-width: 160rpx;
	}

	.card-info-item-input {
		flex: 1;
		margin-left: 20rpx;
	}

	.card-info-item-input input {
		width: 100%;
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
		padding-left: 10rpx;
	}

	/* 提交按钮修复 */
	.card-footer {
		width: 90%;
		margin: 40rpx auto;
		border-radius: 36rpx;
		background: linear-gradient(88deg, #1576DC, #1B64B1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		padding: 24rpx 0;
		text-align: center;
	}

	.card-footer text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 34rpx;
		color: #fff;
	}

	.search-box {
		display: flex;
		align-items: center;
		border: 1px solid #f0f0f0;
		border-radius: 40rpx;
		padding: 4px 12px;
		width: 92%;
	}

	.search-input {
		flex: 1;
		border: none;
		background-color: transparent;
		outline: none;
		font-size: 22rpx;
	}

	.empty-tip {
		display: flex;
		justify-content: center;
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #333;
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 998;
	}

	.modal-base-map {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 20rpx;
		z-index: 999;
		padding: 20rpx;
	}

	.modal-container {
		height: 40vh;
		display: flex;
		flex-direction: column;
	}

	.modal-container-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
	}

	.modal-container-head text {
		font-weight: bold;
		font-size: 34rpx;
		color: #333333;
	}

	.modal-container-middle {
		flex: 1;
		overflow-y: auto;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 20rpx;
	}

	.middle-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 45rpx;
		width: 80%;
	}

	.middle-form-item label {
		font-family: PingFang SC;
		font-weight: 600;
		font-size: 28rpx;
		color: #333333;
	}

	.modal-form-region {
		display: flex;
		gap: 10rpx;
	}

	.form-item-text {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 4rpx;
		padding: 4rpx 2rpx 4rpx 10rpx;
		gap: 20rpx;
	}

	.form-item-text text {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: #7b7c7c;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.modal-container-footer {
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-container-footer button {
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
		width: 50%;
		height: 90%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-wrap {
		width: 82%;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		position: fixed;
		left: 9%;
		top: 30vh;
		z-index: 999;
	}

	.modal-title {
		text-align: center;
		font-size: 32rpx;
		font-weight: bold;
		padding: 30rpx 20rpx 10rpx;
		color: #333;
	}

	.modal-content {
		padding: 20rpx 30rpx;
		font-size: 24rpx;
		color: #555;
		line-height: 1.7;
	}

	.warn-text {
		display: block;
		margin-top: 16rpx;
		color: #f53f3f;
	}

	.modal-buttons {
		display: flex;
		border-top: 1rpx solid #eee;
	}

	.btn-cancel,
	.btn-confirm {
		flex: 1;
		text-align: center;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 30rpx;
	}

	.btn-cancel {
		color: #666;
		border-right: 1rpx solid #eee;
	}

	.btn-confirm {
		color: #1b64b1;
		font-weight: 500;
	}

	::v-deep .wx-checkbox-input {
		border: 1px solid #64B5F6 !important;
		border-radius: 3px;
	}

	::v-deep .wx-checkbox-input.wx-checkbox-input-checked {
		border: 1px solid #00cc66 !important;
		background-color: #00cc66 !important;
	}

	::v-deep .wx-checkbox-input.wx-checkbox-input-checked::before {
		color: #fff !important;
	}
</style>