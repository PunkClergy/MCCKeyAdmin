<template>
	<view class="container" style="background-color:#F5F7FA;height: `${c_screen_height}px`">
		<view class="record-container"
			:style="{height: `${c_screen_height-(navBarHeight + statusBarHeight + 10)}px`}">
			<!-- Tab切换 -->
			<view class="record-tabs">
				<view class="record-tabs-item" 
					:style="{backgroundColor:c_activeTab==1?'#1677ff':'#e8eef6',color:c_activeTab==1?'#ffffff':'#555555'}"
					@tap="handleSwitchTab(1)">
					发送钥匙
				</view>
				<view class="record-tabs-item" 
					:style="{backgroundColor:c_activeTab==2?'#1677ff':'#e8eef6',color:c_activeTab==2?'#ffffff':'#555555'}"
					@tap="handleSwitchTab(2)">
					使用记录
				</view>
			</view>



			<!-- Tab1 发送钥匙列表 -->
			<view v-if="c_activeTab == 1">
				<view class="record-tabs-1">
					<view class="search-box">
						<icon type="search" size="16" class="search-icon" />
						<input placeholder="车牌号/设备号" class="search-input" @blur="bindblurSeaGetList" />
					</view>
				</view>
				<view class="tabs-1-conut">共有{{g_total}}条记录</view>
				<scroll-view scroll-y
					:style="{height:`${c_screen_height-(navBarHeight + statusBarHeight + 10 + 50)}px`}"
					@scrolltolower="handleLower" refresher-enabled="true" :refresher-triggered="g_triggered"
					@refresherrefresh="handleRefresh">
					<view v-for="(item,index) in g_items" :key="index" class="content-item">
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
						</view>
						<view class="content-item-info">
							<view class="info-item" :class="[item.vin?.length > 15 ? 'long-info-item' : '']">
								<label>车架号 ：</label>
								<text>{{item.vin||'-'}}</text>
							</view>
							<view class="info-item" :class="[item.sn?.length > 15 ? 'long-info-item' : '']">
								<label>设备号 ：</label>
								<text>{{item.sn}}</text>
							</view>
						</view>
						<view class="content-item-footer">
							<view class="footer-left">
								<!-- 修复undefined报错：增加兜底 item.driverList || [] -->
								<view v-for="(g_item,gindex) in (item.driverList || [])" :key="gindex"
									style="display: flex;gap: 15rpx;line-height: 45rpx;flex-direction: column;">
									<view style="display: flex;gap: 10rpx;">
										<text>{{g_item.drivername}}</text>
										<text>{{g_item.drivermobile}}</text>
										<text style="color:#1b64b1;" @tap="handleShowSendKeyModal" :data-item="item"
											:data-gitem="g_item">发送钥匙</text>
									</view>
									<view>
										<label>生效周期 ：</label>
										<text style="font-size: 22rpx;font-weight: 500;">{{g_item.rentstartdate}} -
											{{g_item.rentenddate}}</text>
									</view>
								</view>
							</view>
							<view class="footer-right" style="display: flex;gap: 10rpx;">
								<view v-if="!item.driverList" class="footer-right-btn" :data-item="item"
									@tap="handleShowSendNetKeyModal">
									<text>去绑定司机</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- Tab2 使用记录 -->
			<view v-if="c_activeTab == 2">
				<view class="record-tabs-1">
					<view class="search-box">
						<icon type="search" size="16" class="search-icon" />
						<input placeholder="车牌号/设备号/使用人" class="search-input" @blur="bindblurSea" />
					</view>
				</view>
				<view class="tabs-1-conut">共有{{y_total}}条记录</view>
				<scroll-view class="content-container" scroll-y="true"
					:style="{top:`${25 + 5 + 8 + 10 + 10 + searchBarHeight}px`}" @scrolltolower="handleKeyLower"
					refresher-enabled="true" :refresher-triggered="y_triggered" @refresherrefresh="handleKeyRefresh">
					<view v-for="(item,index) in y_items" :key="index" class="content-card">
						<view class="card-head">
							<view class="card-head-left">
								<text>{{item.platenumber}}</text>
								<text>{{item.personname}}</text>
								<text class="split-line"></text>
								<text class="phone-text">{{item.mobile}}</text>
							</view>
							<view class="card-head-right">
								<text v-if="item.status" style="color: #7b7b7c;">已取消</text>
								<text v-else>使用中</text>
							</view>
						</view>
						<view class="card-info">
							<time-line
								:events="[ {createdate: (item.startdate || '-') + ' 至 ' + (item.enddate || '-')}]" />
						</view>
						<view class="card-footer1" v-if="!item.status"
							style="display: flex;justify-content: space-between;">
							<view>
								<text @tap="handleEditKey" :data-item="item" style="float: left;">修改</text>
							</view>
							<view style="display: flex;flex-direction: row;">
								<text @tap="handleCopy" :data-item="item">{{ copied ? '已复制' : '复制链接' }}</text>
								<text @tap="handleCance" :data-item="item">取消用车</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>

	<!-- 发送电子钥匙弹窗 -->
	<view class="modal-wrap" v-if="c_send_key_show_momal">
		<view class="modal-mask" @tap="handleHideSengKeyModal"></view>
		<view class="modal-base-map">
			<form @submit="handleFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>发送电子钥匙</text>
						<image src="/static/images/right_1.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>车牌号</label>
							<view class="modal-form-region">{{cellData.platenumber}}</view>
						</view>
						<view class="middle-form-item">
							<label>使用人</label>
							<view class="modal-form-region">{{cellData.personName}}</view>
						</view>
						<view class="middle-form-item">
							<label>是否允许多人使用</label>
							<view class="modal-form-region">
								<picker mode="selector" :range="pickerList" range-key="name"
									@change="handleOnPickerChange" :value="pickerIndex">
									<text>{{pickerList[pickerIndex].name}}</text>
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

	<!-- 修改电子钥匙弹窗 -->
	<view class="modal-wrap" v-if="c_edit_key_show_momal">
		<view class="modal-mask" @tap="handleHideEditKeyModal"></view>
		<view class="modal-base-map">
			<form @submit="handleFormEdit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>修改</text>
						<image src="/static/images/right_1.png" @tap="handleHideEditKeyModal" />
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>车牌号</label>
							<view class="modal-form-region">{{g_edit_info.platenumber}}</view>
						</view>
						<view class="middle-form-item">
							<label>使用人</label>
							<view class="modal-form-region"><text>{{g_edit_info.personname}}</text></view>
						</view>
						<view class="middle-form-item">
							<label>手机号</label>
							<view class="modal-form-region"><text>{{g_edit_info.mobile}}</text></view>
						</view>
						<view class="middle-form-item">
							<label>开始时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="startDate" @change="bindTimeChange">
									<view class="form-item-text"><text>{{startDate}}</text></view>
								</picker>
								<picker mode="time" data-index="startTime" @change="bindTimeChange">
									<view class="form-item-text"><text>{{startTime}}</text></view>
								</picker>
							</view>
						</view>
						<view class="middle-form-item">
							<label>结束时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="endDate" @change="bindTimeChange">
									<view class="form-item-text"><text>{{endDate}}</text></view>
								</picker>
								<picker mode="time" data-index="endTime" @change="bindTimeChange">
									<view class="form-item-text"><text>{{endTime}}</text></view>
								</picker>
							</view>
						</view>
						<view class="middle-form-item">
							<label>是否允许多人使用</label>
							<view class="modal-form-region">
								<picker mode="selector" :range="pickerList" range-key="name"
									@change="handleOnPickerChange" :value="pickerIndex">
									<text>{{pickerList[pickerIndex].name}}</text>
								</picker>
							</view>
						</view>
						<view class="middle-form-item">
							<label>打开方式</label>
							<view class="modal-form-region">
								<radio-group class="radio-group" @change="handleOnRadioChange">
									<label class="radio-item">
										<radio value="1" :checked="radioValue ==1" />
										<text class="radio-label">智车钥</text>
									</label>
									<label class="radio-item">
										<radio value="0" :checked="radioValue ==0" />
										<text class="radio-label">智信通</text>
									</label>
								</radio-group>
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

	<!-- 绑定司机弹窗 -->
	<view class="modal-wrap" v-if="net_send_key_show_momal">
		<view class="modal-mask" @tap="handleHideSengKeyModal"></view>
		<view class="modal-base-map">
			<form @submit="handleNetFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>绑定司机</text>
						<image src="/static/images/right_1.png" @tap="handleHideSengKeyModal" />
					</view>
					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>车牌号</label>
							<view class="modal-form-region">{{cellData.platenumber}}</view>
						</view>
						<view class="middle-form-item">
							<label>绑定司机</label>
							<view class="modal-form-region">
								<input placeholder="请输入使用人" name='personName'
									style="text-align: right;font-size: 28rpx;" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>手机号</label>
							<view class="modal-form-region">
								<input placeholder="请输入手机号" name='mobile' style="text-align: right;font-size: 28rpx;" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>开始时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="startDate" @change="bindTimeChange">
									<view class="form-item-text"><text>{{startDate}}</text></view>
								</picker>
								<picker mode="time" data-index="startTime" @change="bindTimeChange">
									<view class="form-item-text"><text>{{startTime}}</text></view>
								</picker>
							</view>
						</view>
						<view class="middle-form-item">
							<label>结束时间</label>
							<view class="modal-form-region">
								<picker mode="date" data-index="endDate" @change="bindTimeChange">
									<view class="form-item-text"><text>{{endDate}}</text></view>
								</picker>
								<picker mode="time" data-index="endTime" @change="bindTimeChange">
									<view class="form-item-text"><text>{{endTime}}</text></view>
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
</template>

<script>
	import {
		u_addOrUpdate,
		u_updateRentKey,
		u_wycRentVehicleList,
		u_rentRecord,
		u_sendRentKey,
		u_cancelRentKey,
		u_bindOrUpdateDriver
	} from '@/api/index'

	export default {
		data() {
			return {
				c_screen_height: 0,
				c_screen_width: 0,
				statusBarHeight: 0,
				navBarHeight: 44,
				s_background_tabs_1: '',
				s_background_tabs_2: '',
				s_background_tabs_active_1: '',
				s_background_tabs_active_2: '',
				s_background_picture_of_the_front_page: '',
				searchBarHeight: 80,
				g_page: 1,
				g_items: [],
				g_total: 0,
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
				net_send_key_show_momal: false,
				comParam: '',
				pickerList: [{
					name: "允许",
					value: 1
				}, {
					name: "不允许",
					value: 0
				}],
				pickerIndex: 0,
				radioValue: 1,
				cellData: {},
				vehId: '',
				y_total: 0
			}
		},
		methods: {
			handleOnRadioChange(e) {
				this.radioValue = e.target.value;
			},
			handleOnPickerChange(e) {
				this.pickerIndex = e.target.value;
			},
			handleBindCar() {
				uni.navigateTo({
					url: '/pages/carManager/netCarList/carList'
				});
			},
			handleCurrentDate() {
				const formatDate = (date) => {
					const y = date.getFullYear();
					const m = date.getMonth() + 1;
					const d = date.getDate();
					return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
				};
				const formatTime = (date) => {
					const h = date.getHours();
					const mi = date.getMinutes();
					return `${h < 10 ? '0' + h : h}:${mi < 10 ? '0' + mi : mi}`;
				};
				const now = new Date();
				const tomorrow = new Date(now);
				tomorrow.setDate(now.getDate() + 1);
				this.startDate = formatDate(now);
				this.endDate = formatDate(tomorrow);
				this.startTime = formatTime(now);
				this.endTime = formatTime(now);
			},
			handleShowSendKeyModal(evt) {
				const info = evt.currentTarget.dataset.item;
				const ginfo = evt.currentTarget.dataset.gitem;
				this.radioValue = 1;
				this.cellData = {
					...info,
					personName: ginfo?.drivername,
					mobile: ginfo?.drivermobile,
					...ginfo
				};
				this.c_send_key_show_momal = true;
				this.vehId = info.id;
			},
			handleShowSendNetKeyModal(evt) {
				const info = evt.currentTarget.dataset.item;
				this.cellData = info;
				this.net_send_key_show_momal = true;
				this.vehId = info.id;
			},
			handleHideSengKeyModal() {
				this.cellData = {};
				this.c_send_key_show_momal = false;
				this.net_send_key_show_momal = false;
			},
			handleHideEditKeyModal() {
				this.c_edit_key_show_momal = false;
				this.g_edit_info = {};
			},
			handleSwitchTab(targetTab) {
				// 点击当前激活tab，不切换
				if (this.c_activeTab === targetTab) return;
				this.c_activeTab = targetTab;
				this.comParam = '';
			},

			handleLower() {
				this.g_page++;
				this.getOrderList();
			},
			handleKeyLower() {
				this.y_page++;
				this.getKeySendingList();
			},
			handleRefresh() {
				this.g_triggered = false;
				this.g_page = 1;
				this.g_items = [];
				this.getOrderList();
			},
			handleKeyRefresh() {
				this.y_triggered = false;
				this.y_page = 1;
				this.y_items = [];
				this.getKeySendingList();
			},
			async getOrderList() {
				const param = {
					page: this.g_page,
					comParam: this.comParam
				};
				const response = await u_wycRentVehicleList(param);
				if (response.code == 1000) {
					this.g_items = response.content || [];
					this.g_total = Number(response.count || 0);
				}
			},
			bindblurSea(evt) {
				this.comParam = evt.target.value;
				this.y_triggered = false;
				this.y_page = 1;
				this.y_items = [];
				this.getKeySendingList();
			},
			bindblurSeaGetList(evt) {
				this.comParam = evt.target.value;
				this.g_triggered = false;
				this.g_page = 1;
				this.g_items = [];
				this.getOrderList();
			},
			async getKeySendingList() {
				const params = {
					page: this.y_page,
					comParam: this.comParam
				};
				const response = await u_rentRecord(params);
				const resp = response;
				this.y_total = resp.count || 0;
				this.y_items = [...this.y_items, ...(resp.content || [])];
			},
			async handleNetFormSubmit(evt) {
				const formData = evt.target.value;
				if (!formData.personName) return uni.showToast({
					title: '请输入使用人',
					icon: 'none'
				});
				if (!formData.mobile) return uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});

				const buildDateTime = (date, time) => `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim();
				const requestParams = {
					vehId: this.vehId,
					rentstartdate: buildDateTime(this.startDate, this.startTime),
					rentenddate: buildDateTime(this.endDate, this.endTime),
					drivername: formData.personName,
					drivermobile: formData.mobile
				};
				const res = await u_bindOrUpdateDriver(requestParams);
				if (res.data.code == 1000) {
					this.net_send_key_show_momal = false;
					this.g_items = [];
					this.y_items = [];
					this.y_page = 1;
					this.getKeySendingList();
					this.getOrderList();
					this.handleCurrentDate();
				}
			},
			async handleFormSubmit() {
				const buildDateTime = (date, time) => `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim();
				const requestParams = {
					vehId: this.vehId,
					client: this.radioValue || '',
					personName: this.cellData.personName,
					mobile: this.cellData?.mobile,
					startDate: this.cellData?.rentstartdate,
					endDate: this.cellData?.rentenddate,
					multipleUsed: this.pickerList[this.pickerIndex].value
				};
				const response = await u_sendRentKey(requestParams);
				if (response.code !== 1000) {
					return uni.showToast({
						title: response.data.msg,
						icon: 'none'
					});
				}
				this.c_send_key_show_momal = false;
				this.g_items = [];
				this.y_items = [];
				this.y_page = 1;
				this.getKeySendingList();
				this.getOrderList();
				uni.showModal({
					title: '温馨提示',
					content: response?.data?.msg,
					showCancel: false
				});
			},
			bindTimeChange(evt) {
				const key = evt.currentTarget.dataset.index;
				this[key] = evt.target.value;
			},
			async handleCance(evt) {
				const item = evt.currentTarget.dataset.item;
				const params = {
					controlCode: item.controlcode
				};
				const response = await u_cancelRentKey(params);
				if (response.code == 1000) {
					this.g_items = [];
					this.y_items = [];
					this.y_page = 1;
					this.getKeySendingList();
					this.getOrderList();
				} else {
					uni.showToast({
						title: response.data.msg,
						icon: 'none'
					});
				}
			},
			handleCopy(evt) {
				const code = evt.currentTarget.dataset.item.simplecode;
				uni.setClipboardData({
					data: code,
					success: () => {
						this.copied = true
					}
				});
			},
			handleEditKey(evt) {
				const item = evt.currentTarget.dataset.item;
				this.c_edit_key_show_momal = true;
				this.g_edit_info = item;
				this.radioValue = item?.client || 0;
				this.pickerIndex = Number(item.multipleUsed) == 0 ? 1 : 0;
			},
			async handleFormEdit() {
				const buildDateTime = (date, time) => `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim();
				const requestParams = {
					controlCode: this.g_edit_info.controlcode,
					startDate: buildDateTime(this.startDate, this.startTime),
					endDate: buildDateTime(this.endDate, this.endTime),
					client: this.radioValue || 0,
					multipleUsed: this.pickerList[this.pickerIndex].value
				};
				const res = await u_updateRentKey(requestParams);
				if (res.code == 1000) {
					this.g_edit_info = {};
					this.c_edit_key_show_momal = false;
					this.y_page = 1;
					this.y_items = [];
					this.getKeySendingList();
					uni.showModal({
						title: '温馨提示',
						content: res?.data?.msg,
						showCancel: false
					});
				}
			},
			onShareAppMessage() {
				return {
					title: '发送电子钥匙',
					path: '/pages/index/index?scene=' + this.controlcode
				};
			}
		},
		onLoad(options) {
			this.getOrderList()
			this.getKeySendingList()
		},
		onReady() {
			this.handleCurrentDate()
		},
		onShow() {
			this.handleCurrentDate()
		}
	}
</script>

<style>
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

	.left-model {
		font-family: PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
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

	.search-box {
		display: flex;
		align-items: center;
		border: 1px solid #f0f0f0;
		border-radius: 200rpx;
		padding: 4px 12px;
		width: 96%;
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
		z-index: 999;
		padding: 20rpx;
	}

	.modal-container {
		height: 50vh;
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
</style>