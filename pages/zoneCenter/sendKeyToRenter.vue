<template>
	<view class="container"
		:style="{ backgroundImage: `url(${s_background_picture_of_the_front_page})`, height: `${c_screen_height}px` }">
		<custom-header title="发送电子钥匙" />

		<view class="record-container"
			:style="{ height: `${c_screen_height - (navBarHeight + statusBarHeight + 10)}px`, marginTop: `${navBarHeight + statusBarHeight}px` }">
			<!-- 切换部分 -->
			<view class="record-tabs" @tap="handleSwitchTab">
				<view class="record-tabs-item"
					:style="{ backgroundImage: `url(${c_activeTab == 1 ? s_background_tabs_active_1 : s_background_tabs_1})` }">
					发送钥匙</view>
				<view class="record-tabs-item"
					:style="{ backgroundImage: `url(${c_activeTab == 2 ? s_background_tabs_2 : s_background_tabs_active_2})` }">
					使用记录</view>
			</view>

			<!-- 详情区域部分 -->
			<block v-if="c_activeTab == 1">
				<scroll-view scroll-y
					:style="{ height: `${c_screen_height - (navBarHeight + statusBarHeight + 10 + 50)}px` }"
					@scrolltolower="handleLower" @refresherrefresh="handleRefresh" :refresher-enabled="true"
					:refresher-triggered="g_triggered">
					<view v-for="(item, index) in g_items" :key="index" class="content-item">
						<view class="content-item-head">
							<view class="head-left">
								<view class="left-category">
									<image src="/static/car_icon.png" />
									<text>{{ item.platenumber }}</text>
								</view>
								<view class="left-model" v-if="!item.bluetoothKey">
									{{ item.vehicleSerialName || '-' }}{{ item.vehicleModeName || '' }}111
								</view>
							</view>
						</view>

						<view class="content-item-info">
							<view class="info-item" :class="item.vin.length > 15 ? 'long-info-item' : ''"
								v-if="!item.bluetoothKey">
								<label>车架号 ：</label>
								<text>{{ item.vin || '-' }}</text>
							</view>
							<view class="info-item" :class="item.xsgw.length > 15 ? 'long-info-item' : ''"
								v-if="!item.bluetoothKey">
								<label>油箱容积 ：</label>
								<text>{{ item.xsgw ? item.xsgw + 'L' : '-' }}</text>
							</view>
							<view class="info-item" :class="item.carOwnerName.length > 15 ? 'long-info-item' : ''"
								v-if="!item.bluetoothKey">
								<label>设备平台 ：</label>
								<text>{{ item.carOwnerName || '-' }}</text>
							</view>
							<view class="info-item" :class="item.sn.length > 15 ? 'long-info-item' : ''">
								<label>设备号 ：</label>
								<text>{{ item.sn || '-' }}</text>
							</view>
						</view>

						<view class="content-item-footer">
							<view class="footer-left"></view>
							<view class="footer-right">
								<view class="footer-right-btn" :data-item="item" @tap="handleShowSendKeyModal">
									<text>发送钥匙</text>
								</view>
							</view>
						</view>
					</view>

					<view v-if="g_items.length < 1"
						style="display: flex;justify-content: center;margin-top: 20rpx;font-size: 24rpx;">
						暂无数据
					</view>
				</scroll-view>
			</block>

			<block v-if="c_activeTab == 2">
				<view class="record-tabs-1" style="display: flex;flex-direction: column;">
					<view class="search-box">
						<icon type="search" size="16" class="search-icon" />
						<input placeholder="车牌号/设备号/使用人" class="search-input" @blur="bindblurSea" />
					</view>

					<view class="picker-container custom-arrow-picker"
						style="width: 92%;font-size: 24rpx;display: flex;flex-direction: row;gap: 20rpx;align-items: center;">
						<view>全部状态：</view>
						<view style="display: flex;flex-direction: row;gap: 10rpx;">
							<view @tap="handleOnStatusChange" data-id="0"
								:style="{ backgroundColor: his_state == 0 ? '#F56F48' : '#7B7C7C', borderRadius: '24rpx', color: '#fff', padding: '10rpx 20rpx' }">
								使用中
							</view>
							<view @tap="handleOnStatusChange" data-id="1"
								:style="{ backgroundColor: his_state == 1 ? '#F56F48' : '#7B7C7C', borderRadius: '24rpx', color: '#fff', padding: '10rpx 20rpx' }">
								已过期
							</view>
						</view>
					</view>
				</view>

				<view class="tabs-1-conut">共有{{ y_total }}条记录</view>

				<scroll-view class="content-container" scroll-y
					:style="{ top: `${25 + 5 + 8 + 10 + 10 + searchBarHeight}px` }" @scrolltolower="handleKeyLower"
					@refresherrefresh="handleKeyRefresh" :refresher-enabled="true" :refresher-triggered="y_triggered">
					<view v-for="(item, index) in y_items" :key="index" class="content-card">
						<view class="card-head">
							<view class="card-head-left">
								<text>{{ item.platenumber }}</text>
								<text>{{ item.personname }}</text>
								<text class="split-line"></text>
								<text class="phone-text">{{ item.mobile }}</text>
							</view>
							<view class="card-head-right">
								<text v-if="item.status" style="color: #7b7b7c;">已取消</text>
								<text v-else>使用中</text>
							</view>
						</view>

						<view class="card-info">
							<time-line
								:events="[{ createdate: (item.startdate || '-') + ' 至 ' + (item.enddate || '-') }]" />
						</view>

						<view class="card-footer1" style="display: flex;justify-content: space-between;">
							<block v-if="!item.status">
								<view>
									<text @tap="handleEditKey" :data-item="item" style="float: left;">修改</text>
								</view>
								<view style="display: flex;flex-direction: row;">
									<text @tap="handleCopy" :data-item="item">{{ copied ? '已复制' : '复制链接' }}</text>
									<text @tap="handleCance" :data-item="item">取消用车</text>
								</view>
							</block>
							<block v-else>
								<view></view>
								<view style="display: flex;flex-direction: row;">
									<text @tap="handleViewPhotos" :data-item="item">查看照片</text>
								</view>
							</block>
						</view>
					</view>
				</scroll-view>
			</block>
		</view>
	</view>

	<!-- 发送电子钥匙弹窗 -->
	<block>
		<view class="modal-mask" v-if="c_send_key_show_momal" @tap="handleHideSengKeyModal"></view>
		<view class="modal-base-map" v-if="c_send_key_show_momal"
			:style="{ bottom: `${flag_item_state ? 250 : 0}rpx` }">
			<form @submit="handleFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>发送电子钥匙</text>
						<image src="/static/images/right_1.png" @tap="handleHideSengKeyModal" />
					</view>

					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>车牌号</label>
							<view class="modal-form-region" style="position: relative;">
								<view v-if="all_send" style="position: relative;">
									<input @focus="onInputFocus" @blur="onInputBlur" class="temporary"
										placeholder="请输入车牌号" name="platenumber" :value="keyword" @input="onInputChange"
										confirm-type="search" />
									<view v-if="g_items_temporary.length > 0 && keyword.trim() !== ''"
										class="g_items_temporary">
										<view v-for="(item, index) in g_items_temporary" :key="index"
											@tap="handleQueRen" :data-item="item" class="item-card-footer">
											{{ item.platenumber }}
										</view>
									</view>
								</view>
								<text v-else>{{ cellData.platenumber }}</text>
							</view>
						</view>

						<view class="middle-form-item">
							<label>使用人</label>
							<view class="modal-form-region">
								<input @focus="onInputFocus" @blur="onInputBlur" placeholder="请输入使用人" name="personName"
									style="text-align: right;font-size: 28rpx;" />
							</view>
						</view>

						<view class="middle-form-item">
							<label>手机号</label>
							<view class="modal-form-region">
								<input @focus="onInputFocus" @blur="onInputBlur" placeholder="请输入手机号" name="mobile"
									style="text-align: right;font-size: 28rpx;" />
							</view>
						</view>

						<view class="middle-form-item">
							<label>开始时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="startDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ startDate }}</text>
									</view>
								</picker>
								<picker mode="time" data-index="startTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ startTime }}</text>
									</view>
								</picker>
							</view>
						</view>

						<view class="middle-form-item">
							<label>结束时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="endDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ endDate }}</text>
									</view>
								</picker>
								<picker mode="time" data-index="endTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ endTime }}</text>
									</view>
								</picker>
							</view>
						</view>

						<view class="middle-form-item">
							<label>是否允许多人使用</label>
							<view class="modal-form-region">
								<picker mode="selector" :range="pickerList" range-key="name"
									@change="handleOnPickerChange" :value="pickerIndex">
									<text>{{ pickerList[pickerIndex].name }}</text>
								</picker>
							</view>
						</view>

						<view class="middle-form-item">
							<label>备注</label>
							<view class="modal-form-region">
								<input placeholder="请输入车位号或车辆位置" name="bak"
									style="text-align: right;font-size: 28rpx;" />
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

	<!-- 修改电子钥匙 -->
	<block>
		<view class="modal-mask" v-if="c_edit_key_show_momal" @tap="handleHideEditKeyModal"></view>
		<view class="modal-base-map" v-if="c_edit_key_show_momal">
			<form @submit="handleFormEdit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>修改</text>
						<image src="/static/images/right_1.png" @tap="handleHideEditKeyModal" />
					</view>

					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>车牌号</label>
							<view class="modal-form-region">
								{{ g_edit_info.platenumber }}
							</view>
						</view>

						<view class="middle-form-item">
							<label>使用人</label>
							<view class="modal-form-region">
								<text>{{ g_edit_info.personname }}</text>
							</view>
						</view>

						<view class="middle-form-item">
							<label>手机号</label>
							<view class="modal-form-region">
								<text>{{ g_edit_info.mobile }}</text>
							</view>
						</view>

						<view class="middle-form-item">
							<label>开始时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="startDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ startDate }}</text>
									</view>
								</picker>
								<picker mode="time" data-index="startTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ startTime }}</text>
									</view>
								</picker>
							</view>
						</view>

						<view class="middle-form-item">
							<label>结束时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="endDate" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ endDate }}</text>
									</view>
								</picker>
								<picker mode="time" data-index="endTime" @change="bindTimeChange">
									<view class="form-item-text">
										<text>{{ endTime }}</text>
									</view>
								</picker>
							</view>
						</view>

						<view class="middle-form-item">
							<label>是否允许多人使用</label>
							<view class="modal-form-region">
								<picker mode="selector" :range="pickerList" range-key="name"
									@change="handleOnPickerChange" :value="pickerIndex">
									<text>{{ pickerList[pickerIndex].name }}</text>
								</picker>
							</view>
						</view>

						<view class="middle-form-item">
							<label>打开方式</label>
							<view class="modal-form-region">
								<radio-group class="radio-group" @change="handleOnRadioChange">
									<label class="radio-item">
										<radio value="1" :checked="radioValue == 1" />
										<text class="radio-label">智车钥</text>
									</label>
									<label class="radio-item">
										<radio value="0" :checked="radioValue == 0" />
										<text class="radio-label">智信通</text>
									</label>
								</radio-group>
							</view>
						</view>

						<view class="middle-form-item">
							<label>备注</label>
							<view class="modal-form-region">
								<text>{{ g_edit_info.bak || '-' }}</text>
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

	<view class="card-footer">
		<view @tap="handleSendSubmit">发送钥匙</view>
	</view>
</template>

<script>
	import 'url-search-params-polyfill';
	import {
		u_addOrUpdate,
		u_updateRentKey,
		u_carList,
		u_rentRecord,
		u_sendRentKey,
		u_cancelRentKey
	} from '@/api/index'

	export default {
		data() {
			return {
				c_screen_height: 0,
				c_screen_width: 0,
				statusBarHeight: 0,
				navBarHeight: 49,
				s_background_tabs_1: '',
				s_background_tabs_2: '',
				s_background_tabs_active_1: '',
				s_background_tabs_active_2: '',
				searchBarHeight: 80,
				totalNavHeight: (0) + (44),
				g_page: 1,
				g_items: [],
				c_fin3_link: 'https://fin3.wiselink.net.cn/fin/',
				y_items: [],
				y_page: 1,
				y_triggered: false,
				c_tabs: [{
						name: '报销记录',
						value: '1'
					},
					{
						name: '新增报销',
						value: '2'
					}
				],
				c_activeTab: 1,
				params: {},
				file: null,
				g_triggered: false,
				c_send_key_show_momal: false,
				startDate: '2025-03-20',
				startTime: '19:00',
				endDate: '2025-03-20',
				endTime: '19:00',
				copied: false,
				controlcode: '',
				c_edit_key_show_momal: false,
				g_edit_info: {},
				all_send: false,
				selectedIndex: 0,
				his_state: '0',
				keyword: '',
				pickerList: [{
						name: "允许",
						value: 1
					},
					{
						name: "不允许",
						value: 0
					}
				],
				pickerIndex: 0,
				radioValue: 1,
				g_items_temporary: [],
				flag_item_state: false,
				searchTimer: null,
				cellData: {},
				vehId: '',
				y_total: 0,
				comParam: '',
				s_background_picture_of_the_front_page: ''
			}
		},
		methods: {
			handleOnRadioChange(e) {
				this.radioValue = e.detail.value
			},
			handleOnPickerChange(e) {
				this.pickerIndex = e.detail.value
			},
			onInputChange(e) {
				const keyword = e.detail.value.trim()
				this.keyword = keyword
				clearTimeout(this.searchTimer)
				this.searchTimer = setTimeout(() => {
					this.filterData(keyword)
				}, 500)
			},
			onInputBlur() {
				this.flag_item_state = false
			},
			onInputFocus() {
				this.flag_item_state = true
			},
			filterData(keyword) {
				if (!keyword || keyword.trim() === '') {
					this.g_items_temporary = []
					return
				}
				const lowerKeyword = keyword.toLowerCase().trim()
				const matchedItems = this.g_items.filter(item => {
					if (!item || !item.platenumber) return false
					return item.platenumber.toLowerCase().includes(lowerKeyword)
				})
				this.g_items_temporary = matchedItems
			},
			handleQueRen(evt) {
				this.keyword = evt?.currentTarget?.dataset?.item?.platenumber
				this.g_items_temporary = []
			},
			handleOnStatusChange(evt) {
				this.his_state = evt?.currentTarget?.dataset?.id
				this.y_triggered = false
				this.y_page = 1
				this.y_items = []
				this.selectedIndex = evt?.detail?.value
				this.getKeySendingList()
			},
			handleSendSubmit() {
				this.c_send_key_show_momal = true
				this.all_send = true
				this.radioValue = 1
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
			async initialiImageBaseConversion() {
				const imageMap = [{
						path: '/assets/images/home/car-bg.png',
						key: 's_background_picture_of_the_front_page'
					},
					{
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
				const promises = imageMap.map(item =>
					new Promise((resolve) => {
						uni.getFileSystemManager().readFile({
							filePath: item.path,
							encoding: 'base64',
							success: (res) => {
								resolve({
									[item.key]: `data:image/png;base64,${res.data}`
								})
							}
						})
					})
				)
				const results = await Promise.all(promises)
				const dataToUpdate = results.reduce((acc, curr) => ({
					...acc,
					...curr
				}), {})
				Object.assign(this, dataToUpdate)
			},
			handleShowSendKeyModal(evt) {
				const info = evt.currentTarget.dataset.item
				this.cellData = info
				this.c_send_key_show_momal = true
				this.vehId = info.id
				this.radioValue = 1
			},
			handleHideSengKeyModal() {
				this.cellData = {}
				this.keyword = ''
				this.c_send_key_show_momal = false
				this.all_send = false
			},
			handleHideEditKeyModal() {
				this.c_edit_key_show_momal = false
				this.g_edit_info = {}
			},
			handleSwitchTab(e) {
				const flag = e.target.textContent
				if (flag == '发送钥匙') {
					this.c_activeTab = 1
				} else {
					this.c_activeTab = 2
				}
			},
			handleLower() {
				this.g_page++
				this.getOrderList()
			},
			handleKeyLower() {
				this.y_page++
				this.getKeySendingList()
			},
			handleRefresh() {
				this.g_triggered = false
				this.g_page = 1
				this.g_items = []
				this.getOrderList()
			},
			handleKeyRefresh() {
				this.y_triggered = false
				this.y_page = 1
				this.y_items = []
				this.getKeySendingList()
			},
			async getOrderList() {
				console.log(1111)
				// showLoading("加载中...")
				try {
					const param = {
						[u_addOrUpdate.page]: this.g_page
					}
					const res = await u_carList(param)
					if (res.code === 1000) {
						if (this.g_page > 1 && res.content.length === 0) {
							// showToast(`已加载全部数据：共${this.g_items.length}条`)
						}
						this.g_items = this.g_items.concat(res.content)
						this.g_total = Number(res.count || 0).toLocaleString()
					}
				} catch (e) {
					// showToast('请求失败，请稍后再试')
				} finally {
					// hideLoading()
				}
			},
			bindblurSea(evt) {
				this.comParam = evt.detail.value
				this.y_triggered = false
				this.y_page = 1
				this.y_items = []
				this.getKeySendingList()
			},
			async getKeySendingList() {
				// showLoading("加载中...")
				try {
					const params = {
						[u_rentRecord.page]: this.y_page,
						status: this.his_state,
						comParam: this.comParam || ''
					}
					const res = await u_rentRecord(params)
					if (this.y_page > 1 && res.content.length === 0) {
						// showToast(`已加载全部数据：共${this.y_items.length}条`)
						return
					}
					this.y_total = res.count || 0
					this.y_items = [...this.y_items, ...res.content]
				} catch (e) {
					// showToast("数据加载失败，请重试")
				} finally {
					// hideLoading()
				}
			},
			handleViewPhotos(evt) {
				const info = evt?.currentTarget?.dataset?.item
				if (!info) {
					// showToast('无效数据')
					return
				}
				const g_images = [info.img1, info.img2, info.img3, info.img4, info.img5].filter(img => img != null &&
					img !== '')
				if (g_images.length < 1) {
					// showToast('无可查看照片')
					return
				}
				const images = g_images.map(ele => this.c_fin3_link + ele.replace(/\\/g, "/"))
				uni.previewImage({
					urls: images
				})
			},
			async handleFormSubmit(evt) {
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
				const validationError = validations.find(({
					field
				}) => !field)
				if (validationError) {
					// showToast(validationError.message)
					return
				}
				const buildDateTime = (date, time) => `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim()
				const requestParams = {
					vehId: vehId || '',
					client: this.radioValue || '',
					startDate: buildDateTime(startDate, startTime),
					endDate: buildDateTime(endDate, endTime),
					personName: formData.personName,
					mobile: formData.mobile,
					bak: formData.bak,
					platenumber: formData?.platenumber || '',
					multipleUsed: this.pickerList[this.pickerIndex]?.value
				}
				try {
					const res = await u_sendRentKey(requestParams)
					if (res.code !== 1000) throw new Error(res.msg)
					this.c_send_key_show_momal = false
					this.g_items = []
					this.y_items = []
					this.y_page = 1
					this.vehId = ''
					setTimeout(() => {
						this.getKeySendingList()
						this.getOrderList()
					}, 1000)
					uni.showModal({
						title: '发送成功',
						content: res.msg,
						showCancel: false
					})
				} catch (error) {
					// showToast(error.message || '请求失败，请稍后重试')
				}
			},
			bindTimeChange(evt) {
				const category = evt.currentTarget.dataset.index
				const value = evt.detail.value
				this[category] = value
			},
			async handleCance(evt) {
				try {
					const params = {
						[u_cancelRentKey.controlCode]: evt.currentTarget.dataset.item.controlcode
					}
					const res = await u_cancelRentKey(params)
					if (res.code === 1000) {
						this.c_send_key_show_momal = false
						this.g_items = []
						this.y_items = []
						this.y_page = 1
						this.getKeySendingList()
						this.getOrderList()
					} else {
						// showToast(res.msg)
					}
				} catch (e) {}
			},
			handleCopy(evt) {
				const text = evt.currentTarget.dataset.item.simplecode
				uni.setClipboardData({
					data: text,
					success: () => {
						this.copied = true
					}
				})
			},
			handleForward(evt) {
				const controlcode = evt.currentTarget.dataset.item.controlcode
				const bak = evt?.currentTarget?.dataset?.item?.bak
				this.controlcode = controlcode
				this.bak = bak
			},
			handleEditKey(evt) {
				this.radioValue = evt?.currentTarget?.dataset?.item?.client || 0
				this.c_edit_key_show_momal = true
				this.g_edit_info = evt.currentTarget.dataset.item
				this.pickerIndex = Number(evt.currentTarget.dataset.item?.multipleUsed) == 0 ? 1 : 0
			},
			async handleFormEdit() {
				const {
					startDate,
					startTime,
					endDate,
					endTime,
					g_edit_info
				} = this
				const buildDateTime = (date, time) => `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim()
				const requestParams = {
					client: this.radioValue || 0,
					controlCode: g_edit_info.controlcode,
					startDate: buildDateTime(startDate, startTime),
					endDate: buildDateTime(endDate, endTime),
					multipleUsed: this.pickerList[this.pickerIndex]?.value
				}
				try {
					const res = await u_updateRentKey(requestParams)
					if (res.code === 1000) {
						this.g_edit_info = {}
						this.c_edit_key_show_momal = false
						this.y_triggered = false
						this.y_page = 1
						this.y_items = []
						this.vehId = ''
						this.getKeySendingList()
						uni.showModal({
							title: '温馨提示',
							content: res.msg,
							showCancel: false
						})
					}
				} catch (e) {}
			},
		},
		onLoad(options) {
			console.log(11122222)
			this.getOrderList()
			this.getKeySendingList()
		},
		onReady() {
			this.handleCurrentDate()
		},
		onShow() {
			this.initialiImageBaseConversion()
			this.handleCurrentDate()
		},
		onShareAppMessage() {
			return {
				title: `请前往${this.bak || '车主指定位置'}寻找车辆`,
				path: '/pages/index/index?scene=' + this.controlcode
			}
		}
	}
</script>

<style scoped>
	/* 你的原样式完全保留，无任何修改 */
	.container {
		height: 100vh;
		padding: 10rpx 4rpx;
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

	.tabs-1-title {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.tabs-1-title text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
	}

	.tabs-1-title image {
		width: 42rpx;
		height: 46rpx;
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
		padding: 10rpx;
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
		width: 40rpx;
		height: 40rpx;
	}

	.left-brand {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #1b64b1;
		background: #eef7ff;
		border-radius: 5rpx;
		padding: 0 15rpx;
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
		gap: 10rpx;
		align-items: center;
		justify-content: center;
	}

	.right-state {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
	}

	.right-special-state {
		border-radius: 8rpx;
		border: 1px solid #dd0b2d;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 20rpx;
		color: #dd0b2d;
		padding: 0 15rpx;
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

	.card-head {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 0 20rpx;
		height: 30px;
	}

	.card-head image {
		width: 40rpx;
		height: 30rpx;
	}

	.card-head text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 28rpx;
		color: #333333;
	}

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

	.card-info-item label text {
		color: red;
	}

	.picker {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
		display: flex;
		align-items: center;
	}

	.picker image {
		width: 30rpx;
		height: 30rpx;
	}

	.card-info input {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}

	.viewText {
		text-align: right;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 26rpx;
		color: #333333;
	}

	.card-info-item-tabs {}

	.card-info-item-tabs-btn {
		display: flex;
		gap: 10rpx;
		justify-content: flex-end;
	}

	.card-info-item-tabs-btn text {
		border-radius: 7rpx;
		border: 1px solid #7b7c7c;
		font-family: PingFang SC;
		font-weight: 500;
		padding: 6rpx 20rpx;
		font-size: 24rpx;
		color: #333333;
	}

	.tabs-footer {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 22rpx;
		color: #7b7c7c;
		display: flex;
	}

	.card-info-item-tips {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.tabs-active {
		background: #1b64b1;
		border-radius: 7rpx;
		color: #ffffff !important;
	}

	.card-footer {
		height: 50px;
		color: white;
		text-align: center;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 34rpx;
		color: #ffffff;
	}

	.card-footer view {
		width: 40%;
		background-color: #2196f3;
		padding: 10rpx;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
	}

	.card-upload {
		font-size: 26rpx;
		color: #7b7c7c;
		border: 1rpx solid #f0f0f0;
		padding: 0rpx 20rpx;
		border-radius: 8rpx;
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
	}

	.card-footer {
		position: absolute;
		text-align: center;
		bottom: 120rpx;
		width: 100%;
		display: flex;
		justify-content: center;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 30rpx;
		color: #ffffff;
	}

	.card-footer view {
		width: 40%;
		background-color: #2196f3;
		padding: 10rpx;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
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

	.levitation-button {
		position: absolute;
		bottom: 50rpx;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.levitation-button text {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 75rpx;
		width: 40%;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 32rpx;
		color: #ffffff;
	}

	.record-tabs-1 {
		display: flex;
		padding: 10rpx;
		justify-content: space-between;
		align-items: center;
		gap: 20rpx;
	}

	.tabs-1-title {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.tabs-1-title text {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
	}

	.tabs-1-title image {
		width: 42rpx;
		height: 46rpx;
	}

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

	.count-text {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 22rpx;
		color: #7b7c7c;
	}

	.tabs-1-conut {
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 22rpx;
		color: #7b7c7c;
		padding: 10px;
	}

	.content-container {
		position: absolute;
		bottom: 10rpx;
		left: 0;
		right: 0;
		overflow-y: auto;
	}

	.content-card {
		border: 1px solid #f0f0f0;
		margin: 12rpx;
		padding: 12rpx;
		border-radius: 8rpx;
	}

	.card-head {
		border-bottom: 1px solid #f0f0f0;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.card-head-left {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 20rpx;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
	}

	.phone-text {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
	}

	.card-head-right {
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 26rpx;
		color: #4587fd;
	}

	.split-line {
		border-left: 1px solid #f0f0f0;
		width: 1px;
		height: 35rpx;
	}

	.card-info {
		border-bottom: 1px solid #f0f0f0;
	}

	.card-footer1 {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 60rpx;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 22rpx;
		color: #333333;
		padding-top: 10rpx;
	}

	.card-footer1 text {
		border: 1px solid #f0f0f0;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		background-color: #4587fd;
		color: #fff;
	}

	.card-footer1 button {
		border: 1px solid #f0f0f0;
		border-radius: 8rpx;
		height: 58rpx;
		font-size: 22rpx;
		display: flex;
		justify-content: flex-end;
		background-color: #4587fd;
		color: #fff;
		margin: inherit;
	}

	.detection_button {
		position: absolute;
		bottom: 60px;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.detection_button text {
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 50rpx;
		font-family: PingFang SC;
		padding: 0rpx 100rpx;
		font-weight: bold;
		font-size: 30rpx;
		color: #ffffff;
		line-height: 76rpx;
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
		z-index: 998;
		padding: 20rpx;
	}

	.modal-container {
		height: 50vh;
		display: flex;
		flex-direction: column;
	}

	.modal-container-head {
		display: flex;
		justify-content: row;
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

	.form-item-text image {
		width: 30rpx;
		height: 30rpx;
	}

	.picker-container {
		width: 99rpx;
		height: 23rpx;
		font-family: PingFang SC;
		font-weight: bold;
		font-size: 25rpx;
		color: #333333;
		line-height: 29rpx;
	}

	.temporary {
		text-align: right;
		font-size: 28rpx;
	}

	.g_items_temporary {
		position: absolute;
		top: 60rpx;
		left: 0;
		right: 0;
		background-color: #fff;
		width: 100%;
		z-index: 10000;
		border-radius: 10rpx;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.item-card-footer {
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 10rpx;
		border-bottom: 1px solid #f5f5f5;
	}

	.radio-group {
		display: flex;
		gap: 60rpx;
	}

	.radio-item {
		display: flex;
		align-items: center;
		font-size: 30rpx;
	}

	.radio-label {
		margin-left: 10rpx;
		color: #666;
	}

	.radio-result {
		margin-top: 30rpx;
		padding: 20rpx;
		font-size: 28rpx;
		color: #666;
		background-color: #f8f8f8;
		border-radius: 8rpx;
	}
</style>