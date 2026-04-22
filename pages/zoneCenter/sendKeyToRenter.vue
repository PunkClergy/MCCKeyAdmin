<template>
	<view class="container" :style="{ height: `${c_screen_height}px` }">
		<view class="record-container">
			<!-- 切换部分 -->
			<view class="record-tabs">
				<view class="record-tabs-item" :class="c_activeTab == 1 ? 'active' : ''" @tap="c_activeTab = 1">
					发送钥匙
				</view>
				<view class="record-tabs-item" :class="c_activeTab == 2 ? 'active' : ''" @tap="c_activeTab = 2">
					使用记录
				</view>
			</view>

			<!-- 详情区域部分 -->
			<block v-if="c_activeTab == 1">
				<scroll-view scroll-y class="scroll-full" @scrolltolower="handleLower">
					<view v-for="(item, index) in g_items" :key="index" class="content-item">
						<view class="content-item-head">
							<view class="head-left">
								<view class="left-category">
									<image src="/static/car_icon.png" />
									<text>{{ item.platenumber }}</text>
								</view>
								<view class="left-model" v-if="!item.bluetoothKey">
									{{ item.vehicleSerialName || '-' }}{{ item.vehicleModeName || '' }}
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
				<view class="record-tabs-1" style="display: flex;flex-direction: column;gap: 10rpx;">
					<view class="search-box">
						<icon type="search" size="16" class="search-icon" />
						<input placeholder="车牌号/设备号/使用人" class="search-input" @blur="bindblurSea" />
					</view>

					<view class="picker-container">
						<view class="picker-btns">
							<view class="picker-btn" :class="his_state == 0 ? 'active' : ''" @tap="handleOnStatusChange"
								data-id="0">
								使用中
							</view>
							<view class="picker-btn" :class="his_state == 1 ? 'active' : ''" @tap="handleOnStatusChange"
								data-id="1">
								已过期
							</view>
						</view>
					</view>
				</view>

				<view class="tabs-1-conut">共有{{ y_total }}条记录</view>
				<scroll-view scroll-y class="scroll-full" @scrolltolower="handleKeyLower">
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
				g_page: 1,
				g_items: [],
				c_fin3_link: 'https://fin3.wiselink.net.cn/fin/',
				y_items: [],
				y_page: 1,
				y_triggered: false,
				c_activeTab: 1,
				g_triggered: false,
				c_send_key_show_momal: false,
				startDate: '2025-03-20',
				startTime: '19:00',
				endDate: '2025-03-20',
				endTime: '19:00',
				copied: false,
				c_edit_key_show_momal: false,
				g_edit_info: {},
				all_send: false,
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
				comParam: ''
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
				this.getKeySendingList()
			},
			handleSendSubmit() {
				this.c_edit_key_show_momal = false
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
			handleShowSendKeyModal(evt) {
				const info = evt.currentTarget.dataset.item
				this.cellData = info
				this.c_edit_key_show_momal = false
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
				try {
					const param = {
						page: this.g_page
					}
					const res = await u_carList(param)
					if (res.code === 1000) {
						this.g_items = this.g_items.concat(res.content)
					}
				} catch (e) {}
			},
			bindblurSea(evt) {
				this.comParam = evt.detail.value
				this.y_triggered = false
				this.y_page = 1
				this.y_items = []
				this.getKeySendingList()
			},
			async getKeySendingList() {
				try {
					const params = {
						page: this.y_page,
						status: this.his_state,
						comParam: this.comParam || ''
					}
					const res = await u_rentRecord(params)
					this.y_total = res.count || 0
					this.y_items = [...this.y_items, ...res.content]
				} catch (e) {}
			},
			handleViewPhotos(evt) {
				const info = evt?.currentTarget?.dataset?.item
				if (!info) return
				const g_images = [info.img1, info.img2, info.img3, info.img4, info.img5].filter(img => img != null &&
					img !== '')
				if (g_images.length < 1) {
					uni.showToast({
						title: '暂无照片',
						icon: 'none'
					})
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
					uni.showToast({
						title: validationError.message,
						icon: 'none'
					})
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
					uni.showToast({
						title: error.message || '请求失败',
						icon: 'none'
					})
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
						controlCode: evt.currentTarget.dataset.item.controlcode
					}
					const res = await u_cancelRentKey(params)
					if (res.code === 1000) {
						this.y_items = []
						this.y_page = 1
						this.getKeySendingList()
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
			handleEditKey(evt) {
				this.c_send_key_show_momal = false
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
			uni.getSystemInfo({
				success: (res) => {
					this.c_screen_height = res.windowHeight
					this.c_screen_width = res.windowWidth
					this.statusBarHeight = res.statusBarHeight
				}
			})
			this.getOrderList()
			this.getKeySendingList()
		},
		onReady() {
			this.handleCurrentDate()
		},
		onShow() {
			this.handleCurrentDate()
		},
	}
</script>

<style scoped>
	/* 全局去除滚动条 */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}

	scroll-view::-webkit-scrollbar {
		display: none;
	}

	.container {
		height: 100vh;
		padding: 10rpx 4rpx;
		background-color: #f7f9fc;
		box-sizing: border-box;
	}

	.record-container {
		width: 96%;
		margin: auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #EFF1FC;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		gap: 15rpx;
	}

	.record-tabs {
		display: flex;
		height: 50px;
		background-color: #f8f9fa;
		border-radius: 12rpx 12rpx 0 0;
		flex-shrink: 0;
	}

	.record-tabs-item {
		border-radius: 12rpx;
		width: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		transition: all 0.3s;
	}

	.record-tabs-item.active {
		background-color: #6a9bee;
		color: #fff;
	}

	.record-tabs-1 {
		flex-shrink: 0;
		padding: 0rpx 10rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		border: 1px solid #f0f0f0;
		border-radius: 40rpx;
		padding: 4px 12px;
		width: 96%;
		background-color: #f8f9fa;
		flex-shrink: 0;
	}

	.tabs-1-conut {
		flex-shrink: 0;
		padding: 0rpx 10px;
		text-align: center;
		font-size: 22rpx;
		color: #999;
	}

	.scroll-full {
		flex: 1;
		width: 100%;
		gap: 10rpx;
	}

	.content-item {
		margin: 15rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
	}

	.content-item-head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-bottom: 1px solid #f5f5f5;
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
		font-weight: 500;
		font-size: 26rpx;
		color: #555;
		gap: 10rpx;
	}

	.left-category image {
		width: 30rpx;
		height: 24rpx;
	}

	.left-model {
		font-size: 24rpx;
		color: #666;
	}

	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f5f5f5;
	}

	.info-item {
		flex: 0 0 48%;
		font-size: 24rpx;
		color: #666;
	}

	.long-info-item {
		flex-basis: 100% !important;
	}

	.content-item-footer {
		display: flex;
		padding: 15rpx;
		justify-content: space-between;
	}

	.footer-right-btn {
		background-color: #6a9bee;
		color: #fff;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
		font-size: 22rpx;
		font-weight: 500;
	}

	.content-card {
		border: 1px solid #f0f0f0;
		margin: 12rpx;
		padding: 12rpx;
		border-radius: 8rpx;
		background-color: #fff;
	}

	.card-head {
		border-bottom: 1px solid #f5f5f5;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.card-head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
		font-weight: 500;
		font-size: 26rpx;
		color: #555;
	}

	.split-line {
		border-left: 1px solid #f0f0f0;
		width: 1px;
		height: 35rpx;
	}

	.card-info {
		border-bottom: 1px solid #f5f5f5;
	}

	.card-footer1 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
		font-size: 22rpx;
		padding-top: 10rpx;
	}

	.card-footer1 text {
		border: 1px solid #f0f0f0;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		background-color: #6a9bee;
		color: #fff;
		margin-left: 10rpx;
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
		border-radius: 20rpx 20rpx 0 0;
		z-index: 999;
		padding: 20rpx;
	}

	.modal-container {
		max-height: 70vh;
		display: flex;
		flex-direction: column;
	}

	.modal-container-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
		border-bottom: 1px solid #f5f5f5;
		margin-bottom: 20rpx;
	}

	.modal-container-head text {
		font-weight: 500;
		font-size: 34rpx;
		color: #555;
	}

	.modal-container-head image {
		width: 24rpx;
		height: 24rpx;
	}

	.modal-container-middle {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding-bottom: 20rpx;
	}

	.modal-container-footer {
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-container-footer button {
		background: linear-gradient(88deg, #6a9bee, #5a8de1);
		border-radius: 36rpx;
		font-weight: 500;
		font-size: 34rpx;
		color: #fff;
		width: 50%;
		height: 90%;
		border: none;
	}

	.middle-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 90%;
		margin: 0 auto;
	}

	.middle-form-item label {
		font-weight: 500;
		font-size: 28rpx;
		color: #666;
		min-width: 120rpx;
	}

	.modal-form-region {
		flex: 1;
		text-align: right;
		color: #666;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		font-size: 26rpx;
	}

	.temporary {
		text-align: right;
		font-size: 28rpx;
		width: 100%;
		color: #666;
	}

	.g_items_temporary {
		position: absolute;
		top: 60rpx;
		left: 0;
		right: 0;
		background: #fff;
		z-index: 10000;
		border-radius: 10rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.item-card-footer {
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 10rpx;
		border-bottom: 1px solid #f5f5f5;
		color: #666;
	}

	.radio-group {
		display: flex;
		gap: 60rpx;
	}

	.radio-item {
		display: flex;
		align-items: center;
		font-size: 30rpx;
		color: #666;
	}

	.card-footer {
		position: fixed;
		bottom: 120rpx;
		width: 100%;
		display: flex;
		justify-content: center;
		z-index: 10;
	}

	.card-footer view {
		width: 40%;
		background: linear-gradient(88deg, #6a9bee, #5a8de1);
		padding: 10rpx;
		border-radius: 36rpx;
		color: #fff;
		text-align: center;
		font-weight: 500;
		font-size: 30rpx;
	}

	.picker-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		gap: 20rpx;
		align-items: center;
		font-size: 26rpx;
		color: #333;
		margin-top: 8rpx;
	}

	.picker-btns {
		display: flex;
		flex-direction: row;
		gap: 16rpx;
	}

	.picker-btn {
		background-color: #e8ebf2;
		color: #666;
		border-radius: 30rpx;
		padding: 10rpx 24rpx;
		font-size: 24rpx;
		transition: all 0.2s ease;
	}

	.picker-btn.active {
		background-color: #6a9bee;
		color: #fff;
	}

	.search-input {
		font-size: 24rpx;
	}

	.card-head-right {
		font-size: 24rpx;
		font-weight: bold;
	}
</style>