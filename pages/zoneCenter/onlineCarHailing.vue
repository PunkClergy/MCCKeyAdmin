<template>
	<view class="container">
		<!-- 主内容区域 -->
		<view class="record-container"
			:style="`height: ${c_screen_height-(navBarHeight + statusBarHeight)}px;margin-top: ${navBarHeight + statusBarHeight}px;`">
			<!-- Tab切换 -->
			<view class="record-tabs" @tap="handleSwitchTab">
				<view class="record-tabs-item"
					:style="`background-color: ${c_activeTab == 1 ? '#000' : '#fff'}`">
					车辆列表</view>
				<view class="record-tabs-item"
					:style="`background-color: ${c_activeTab == 2 ? '#000' : '#fff'}`">
					{{btnState}}车辆
				</view>
			</view>

			<!-- 车辆列表Tab -->
			<block v-if="c_activeTab == 1">
				<view class="record-tabs-1" style="display: flex;flex-direction: column;">
					<view class="search-box">
						<input placeholder="车牌号/设备号/车型/车系" class="search-input" @blur="bindblurSea"
							v-model="comParam" />
					</view>
				</view>
				<view class="tabs-1-conut"
					:style="`display: flex;justify-content: ${g_flagMulti?'space-between':'center'}`">
					<view></view>
					<view>共有{{g_total}}条记录</view>
				</view>
				<scroll-view scroll-y :style="`height:${c_screen_height-(navBarHeight + statusBarHeight + 10 + 50)}px;`"
					@scrolltolower="handleLower" refresher-enabled :refresher-triggered="g_triggered"
					@refresherrefresh="handleRefresh">
					<block v-for="(item,index) in g_items" :key="index">
						<view class="content-item">
							<view class="content-item-head">
								<view class="head-left">
									<view class="left-category">
										<image src="/static/car_icon.png" />
										<text>{{item.platenumber}}</text>
									</view>
									<view class="left-split_line"></view>
									<view class="left-model">
										{{item.vehicleSerialName||'-'}}{{item.vehicleModeName||''}}
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
									<text>{{item.sn||'-'}}</text>
								</view>
							</view>
							<view class="content-item-footer" v-if="g_source">
								<view class="footer-left"></view>
								<view class="footer-right">
									<view class="footer-right-btn" :data-item="item" @tap="handleSelectJump"
										v-if="!g_flagMulti">
										<text>选择此车</text>
									</view>
									<checkbox-group :data-item="item" @change="handleChangeBlack">
										<checkbox style="transform: scale(0.7);" />
									</checkbox-group>
								</view>
							</view>
							<view class="content-item-footer" v-else>
								<view class="footer-left" style="max-width: 70%;">
									<block v-for="(g_item,index) in item.driverList" :key="index">
										<view style="display: flex;gap: 15rpx;line-height: 50rpx;">
											<text>{{g_item.drivername}}12</text>
											<text>{{g_item.drivermobile}}</text>
											<text style="color:#1b64b1;" :data-item="g_item"
												@tap="handleUnBindDriver">解绑</text>
										</view>
										<view>
											<text style="font-size: 22rpx;font-weight: 500;">{{g_item.rentstartdate}} -
												{{g_item.rentenddate}}</text>
										</view>
									</block>
								</view>
								<view class="footer-right" style="display: flex;gap: 10rpx;">
									<view class="footer-right-btn" :data-item="item" @tap="handleShowSendNetKeyModal">
										<text>绑定用车人</text>
									</view>
								</view>
							</view>
						</view>
					</block>
					<block v-if="g_items.length<1">
						<view
							style="display: flex;flex-direction: row;color: #333;justify-content: center;margin-top: 20rpx;font-size: 24rpx;">
							暂无车辆</view>
					</block>
				</scroll-view>
			</block>

			<!-- 新增/修改车辆Tab -->
			<block v-if="c_activeTab == 2">
				<scroll-view scroll-y
					:style="`height:${c_screen_height-(navBarHeight + statusBarHeight + 10 + 50)}px;`">
					<view class="card-info">
						<!-- 车牌号 -->
						<view class="card-info-item">
							<label>车牌号<text style="color:red">*</text></label>
							<view class="card-info-item-input">
								<input placeholder="请输入车牌号" v-model="params.platenumber" data-item="platenumber"
									@input="handleBindinput" />
							</view>
						</view>
						<!-- 设备号 -->
						<view class="card-info-item">
							<label>设备号<text style="color:red">*</text></label>
							<view class="card-info-item-input">
								<input placeholder="请输入设备号" v-model="params.sn" :disabled="!!id" data-item="sn"
									@input="handleBindinput" />
							</view>
						</view>
						<!-- code -->
						<view class="card-info-item">
							<label>code<text style="color:red">*</text></label>
							<view class="card-info-item-input">
								<input placeholder="请输入code" v-model="params.code" :disabled="!!id" data-item="code"
									@input="handleBindinput" />
							</view>
						</view>
						<!-- 车系 -->
						<view class="card-info-item">
							<label>车系</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车系" v-model="params.vehicleSerialName"
									data-item="vehicleSerialName" @input="handleBindinput" />
							</view>
						</view>
						<!-- 车型 -->
						<view class="card-info-item">
							<label>车型</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车型" v-model="params.vehicleModeName" data-item="vehicleModeName"
									@input="handleBindinput" />
							</view>
						</view>
						<!-- 年款 -->
						<view class="card-info-item">
							<label>年款</label>
							<view class="card-info-item-input">
								<input placeholder="请输入年款" v-model="params.ccdate" data-item="ccdate"
									@input="handleBindinput" />
							</view>
						</view>
						<!-- 当前总里程 -->
						<view class="card-info-item">
							<label>当前总里程(km)</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车辆当前里程" v-model="params.totalMileage" data-item="totalMileage"
									@input="handleBindinput" />
							</view>
						</view>
						<!-- 已保养里程 -->
						<view class="card-info-item">
							<label>已保养里程(km)</label>
							<view class="card-info-item-input">
								<input placeholder="请输入已保养里程" v-model="params.maintainMileage"
									data-item="maintainMileage" @input="handleBindinput" />
							</view>
						</view>
						<!-- 保养周期里程 -->
						<view class="card-info-item">
							<label>保养周期里程(km)</label>
							<view class="card-info-item-input">
								<input placeholder="请输入车辆保养周期里程" v-model="params.maintainMileageInterval"
									data-item="maintainMileageInterval" @input="handleBindinput" />
							</view>
						</view>
					</view>
					<view class="card-footer" @tap="handleSubmit">
						<text>确认{{btnState}}</text>
					</view>
				</scroll-view>
			</block>
		</view>
	</view>

	<!-- 绑定用车人弹窗 -->
	<block>
		<view class="modal-mask" v-if="net_send_key_show_momal" @tap="handleHideSengKeyModal"></view>
		<view class="modal-base-map" v-if="net_send_key_show_momal">
			<form @submit="handleNetFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>绑定用车人</text>
						<!-- <image src="/assets/images/home/right_1.png" @tap="handleHideSengKeyModal" /> -->
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>车牌号</label>
							<view class="modal-form-region">
								{{cellData.platenumber}}
							</view>
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
								<input placeholder="请输入手机号" name="mobile" style="text-align: right;font-size: 28rpx;" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>开始时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="startDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{startDate}}</text>
									</view>
								</picker>
								<picker mode="time" data-index="startTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{startTime}}</text>
									</view>
								</picker>
							</view>
						</view>
						<view class="middle-form-item">
							<label>结束时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="endDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{endDate}}</text>
									</view>
								</picker>
								<picker mode="time" data-index="endTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{endTime}}</text>
									</view>
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
	</block>

	<!-- 免责弹窗 -->
	<view class="modal-mask" v-if="showDisclaimerModal" @tap="closeDisclaimerModal">
		<view class="modal-wrap" @tap.stop>
			<view class="modal-title">免责条款</view>
			<view class="modal-content">
				设备安装完成后，建议您使用 K7 模块做基础预检，检测记录会留存存档，后续设备出现问题时，能帮助我们更快排查维修，给您更完善的售后保障～
				<text>若您选择【免检注册】，将会跳过本次 K7 预检流程。</text>
				<text class="warn-text">温馨小提示：如果未完成预检就注册设备，后续设备产生故障，我们将无法提供售后排查与维修服务，相关损失需要您自行承担，还请您仔细考虑后再确认哦。</text>
			</view>
			<view class="modal-buttons">
				<view class="btn-cancel" @tap="modalGoCheck">去检测</view>
				<view class="btn-confirm" @tap="modalSkipCheck">免检注册</view>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 车辆管理页面接口导入
	 * u_wycRentVehicleList: 获取租赁车辆列表接口
	 * u_addOrUpdateCar: 新增/编辑车辆接口
	 * u_carapiDeleteCar: 删除车辆接口
	 * u_bindOrUpdateDriver: 绑定/更新用车司机接口
	 * u_unBindDriver: 解绑车辆司机接口
	 */
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
				// 设备窗口信息
				c_screen_height: 0,
				c_screen_width: 0,
				statusBarHeight: 0,
				navBarHeight: 44,
				s_background_tabs_1: '',
				s_background_tabs_2: '',
				s_background_tabs_active_1: '',
				s_background_tabs_active_2: '',
				searchBarHeight: 80,
				totalNavHeight: (0) + (44),
				// 列表分页参数
				g_page: 1,
				g_items: [],
				g_total: 0,
				g_triggered: false,
				isRefreshing: false, // 新增刷新锁，防止并发卡死loading
				c_activeTab: 1,
				comParam: '',
				// 新增编辑车辆表单参数
				params: {},
				btnState: '新增',
				id: '',
				batterylift: '一键启动',
				carOwnerNameValue: '',
				carOwnerName: '智信通',
				// 页面跳转携带标识
				g_source: '',
				g_flagMulti: '',
				// 绑定用车人弹窗控制
				net_send_key_show_momal: false,
				cellData: {},
				vehId: '',
				// 用车人时间选择
				startDate: '2025-03-20',
				startTime: '19:00',
				endDate: '2025-03-20',
				endTime: '19:00',
				oilendDate: '',
				oilendTime: '',
				// 免责弹窗
				showDisclaimerModal: false
			}
		},
		onLoad(options) {
			// 接收页面跳转参数
			this.initCarryParams(options)
			// 初始化车辆列表
			this.initList()
		},
		onShow() {
			// 预转换tab背景图base64
			this.initialiImageBaseConversion()
		},
		onReady() {
			// 初始化当前日期时间
			this.handleCurrentDate()
		},
		methods: {
			/**
			 * 搜索输入框失焦，重置分页并刷新车辆列表
			 * @param {Object} evt 事件对象
			 */
			bindblurSea(evt) {
				this.g_page = 1
				this.g_items = []
				this.initList()
			},
			/**
			 * 日期/时间选择器变更回调
			 * @param {Object} evt 事件对象，dataset.index区分时间字段
			 */
			bindTimeChange(evt) {
				const category = evt.currentTarget.dataset.index
				const value = evt.detail.value
				this[category] = value
			},
			/**
			 * 删除车辆 - 调用u_carapiDeleteCar接口
			 * @param {Object} evt 事件对象，dataset.item为当前车辆数据
			 */
			handleDelete(evt) {
				uni.showModal({
					title: '提示',
					content: '确认删除？',
					complete: (res) => {
						if (res.confirm) {
							const info = evt.currentTarget.dataset.item
							const apiUrl = getApp().data.k1swUrl + u_carapiDeleteCar.URL
							const param = {
								sn: info?.sn,
								code: info?.code
							}
							byPost(apiUrl, param, (response) => {
								// 接口返回成功刷新列表
								if (response.data.code === 1000) {
									this.c_activeTab = 1
									this.g_page = 1
									this.g_items = []
									getApp().data.reflag = 1
									this.initList()
								}
							})
						}
					}
				})
			},
			/**
			 * 解析onLoad跳转携带参数
			 * @param {Object} evt 页面options参数
			 */
			initCarryParams(evt) {
				const {
					source,
					flagMulti,
					info
				} = evt
				this.g_source = source
				this.g_flagMulti = flagMulti
				if (info) this.info = JSON.parse(info)
			},
			/**
			 * 选中车辆跳转回来源页面
			 * @param {Object} evt 事件对象，dataset.item车辆详情
			 */
			handleSelectJump(evt) {
				const item = evt.currentTarget.dataset.item
				uni.redirectTo({
					url: `${this.g_source}?datails=${JSON.stringify(item)}`
				})
			},
			/**
			 * 打开绑定用车人弹窗，缓存当前车辆数据
			 * @param {Object} evt 事件对象，dataset.item车辆数据
			 */
			handleShowSendNetKeyModal(evt) {
				const info = evt.currentTarget.dataset.item
				this.cellData = info
				this.net_send_key_show_momal = true
				this.vehId = info.id
			},
			// 关闭绑定用车人弹窗，清空缓存车辆数据
			handleHideSengKeyModal() {
				this.cellData = {}
				this.net_send_key_show_momal = false
			},
			/**
			 * 初始化当前系统日期、次日日期、默认时分
			 */
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
				this.oilendDate = currentDate
				this.oilendTime = currentTime
				this.startDate = currentDate
				this.endDate = tomorrowDate
				this.startTime = currentTime
				this.endTime = currentTime
			},
			/**
			 * 提交绑定用车人表单 - 调用u_bindOrUpdateDriver接口
			 * @param {Object} evt form表单提交事件
			 */
			handleNetFormSubmit(evt) {
				const {
					startDate,
					startTime,
					endDate,
					endTime,
					vehId
				} = this
				const formData = evt.detail.value
				// 表单校验
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
					return
				}
				// 拼接起止时间
				const buildDateTime = (date, time) => `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim()
				const requestParams = {
					vehId,
					rentstartdate: buildDateTime(startDate, startTime),
					rentenddate: buildDateTime(endDate, endTime),
					drivername: formData.personName,
					drivermobile: formData.mobile
				}
				const baseURL = getApp().data.k1swUrl
				const submitRequest = async () => {
					try {
						byPost(`${baseURL}${u_bindOrUpdateDriver.URL}`, requestParams, (response) => {
							if (response.data.code === 1000) {
								// 绑定成功关闭弹窗刷新列表
								this.net_send_key_show_momal = false
								this.g_items = []
								this.initList()
								this.handleCurrentDate()
							}
						}, () => {})
					} catch (error) {
						console.error('绑定用车人接口异常：', error.message)
					}
				}
				submitRequest()
			},
			/**
			 * 解绑司机 - 调用u_unBindDriver接口
			 * @param {Object} evt 解绑按钮事件，dataset.item司机ID
			 */
			handleUnBindDriver(evt) {
				const driverId = evt?.currentTarget?.dataset?.item?.id || ''
				byPost(getApp().data.k1swUrl + u_unBindDriver.URL, {
					driverId
				}, (response) => {
					if (response?.data.code === 1000) {
						// 解绑成功重置列表
						this.g_page = 1
						this.g_items = []
						this.initList()
					}
				})
			},
			/**
			 * 预加载Tab背景图并转换base64
			 */
			initialiImageBaseConversion() {
				const _this = this
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
			/**
			 * 获取车辆列表接口 - u_wycRentVehicleList
			 * @async
			 * @desc 分页加载车辆数据，搜索、下拉刷新、触底加载共用
			 */
			async initList() {
				const param = {
					page: this.g_page,
					comParam: this.comParam || ""
				}
				try {
					// 调用车辆列表接口
					const response = await u_wycRentVehicleList(param)
					if (response.code === 1000) {
						// 非第一页无数据则不再追加
						if (!(this.g_page > 1 && response.data.content.length === 0)) {
							this.g_items = this.g_items.concat(response.content)
						}
						this.g_total = Number(response.count || 0).toLocaleString()
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
			// scroll-view触底，分页+1加载下一页
			handleLower() {
				this.g_page += 1
				this.initList()
			},
			// 下拉刷新核心修复方法，解决loading无法关闭
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
					// 无论成功失败强制关闭loading
					setTimeout(() => {
						this.g_triggered = false
						this.isRefreshing = false
					}, 100)
				}
			},
			/**
			 * 输入框双向绑定赋值到params表单对象
			 * @param {Object} evt input输入事件，dataset.item对应字段名
			 */
			handleBindinput(evt) {
				const key = evt.currentTarget.dataset.item
				this.params[key] = evt.detail.value
			},
			// 切换启动方式（废弃，保留兼容）
			handleBatterylift(evt) {
				this.batterylift = evt.currentTarget.dataset.item
			},
			// 切换所属平台
			handleCarOwnerName(evt) {
				this.carOwnerName = evt.currentTarget.dataset.item
			},
			// 自定义平台名称输入赋值
			handleCarOwnerNameBindinput(evt) {
				this.carOwnerNameValue = evt.detail.value
			},
			/**
			 * 提交新增/编辑车辆 - 调用u_addOrUpdateCar接口
			 * @param {Number} evt 1代表免检注册，其余正常提交
			 */
			handleSubmit(evt) {
				const apiUrl = getApp().data.k1swUrl + u_addOrUpdateCar.URL
				const param = {
					id: this.id || '',
					...this.params,
					isDirectReg: evt === 1 ? 1 : '',
					batterylift: this.batterylift,
					carOwnerName: this.carOwnerName === '智信通' ? this.carOwnerName : this.carOwnerNameValue
				}
				// 必填项校验
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
					if (!item.field?.trim()) {
						return
					}
				}

				byPost(apiUrl, param, (response) => {
					if (response.data.code === 1000) {
						// 提交成功切回列表页重置表单
						this.c_activeTab = 1
						this.params = {}
						this.btnState = '新增'
						this.id = ''
						this.batterylift = '一键启动'
						this.carOwnerNameValue = ''
						this.carOwnerName = '智信通'
						this.g_items = []
						this.g_page = 1
						getApp().data.reflag = 1
						this.initList()
					} else if (response.data.code === 7000) {
						// 需要弹出预检免责弹窗
						this.showDisclaimerModal = true
					} else {
						console.error('新增/编辑车辆失败', response.data.msg)
					}
				})
			},
			/**
			 * 编辑车辆，回显车辆数据到表单
			 * @param {Object} evt 编辑按钮事件，dataset.item车辆完整数据
			 */
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
			/**
			 * Tab切换事件
			 * @param {Object} e tab点击事件
			 */
			handleSwitchTab(e) {
				if (this.c_activeTab == 2) {
					this.c_activeTab = 1
					this.id = ''
					this.btnState = '新增'
					this.params = {}
				} else if (this.c_activeTab !== 2) {
					this.c_activeTab = 2
				}

			},
			// 关闭预检免责弹窗
			closeDisclaimerModal() {
				this.showDisclaimerModal = false
			},
			// 跳转K7设备检测页面
			modalGoCheck() {
				this.closeDisclaimerModal()
				uni.redirectTo({
					url: '/pages/ToInternalStaff/K7/index'
				})
			},
			// 免检注册，直接调用提交接口并传入标识1
			modalSkipCheck() {
				this.closeDisclaimerModal()
				this.handleSubmit(1)
			}
		}
	}
</script>

<style scoped>
	/* 全局页面浅蓝浅色背景 */
	page {
		background: #EFF5FF;
	}

	.container {
		min-height: 100vh;
		padding: 10rpx 4rpx;
	}

	.record-container {
		width: 96%;
		height: 90vh;
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

	/* 列表项 */
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

	/* 新增编辑卡片 */
	.card-info {
		flex: 1;
		overflow-y: auto;
	}

	.card-info-item {
		display: flex;
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
	}

	.card-info-item-input input {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}

	.card-footer {
		width: 90%;
		height: 50px;
		color: #fff;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: auto;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 34rpx;
		background-color: #1576dc;
		border-radius: 12rpx;
	}

	.card-footer view {
		width: 40%;
		background: linear-gradient(88deg, #1576DC, #1B64B1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		padding: 10rpx;
	}

	/* 搜索框 */
	.search-box {
		display: flex;
		align-items: center;
		border: 1px solid #f0f0f0;
		border-radius: 40rpx;
		padding: 4px 12px;
		width: 92%;
	}

	.search-icon {
		margin-right: 8px;
	}

	.search-input {
		flex: 1;
		border: none;
		background-color: transparent;
		outline: none;
		font-size: 22rpx;
	}

	/* 弹窗样式 */
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
		z-index: 998;
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

	.modal-container-head image {
		width: 24rpx;
		height: 24rpx;
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

	/* 免责弹窗 */
	.modal-wrap {
		width: 82%;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
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

	/* checkbox自定义 */
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