<template>
	<view class="container" :style="{ height: screenHeight + 'px' }">
		<view class="record-container">
			<view class="record-tabs">
				<view class="record-tabs-item" :class="activeTab == 1 && 'active'" @tap="activeTab = 1">发送钥匙</view>
				<view class="record-tabs-item" :class="activeTab == 2 && 'active'" @tap="activeTab = 2">使用记录</view>
			</view>

			<block v-if="activeTab == 1">
				<scroll-view scroll-y class="scroll-full" @scrolltolower="loadCarList">
					<view v-for="(item, idx) in carList" :key="idx" class="content-item">
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
							<view class="info-item" :class="item.vin.length > 15 && 'long-info-item'"
								v-if="!item.bluetoothKey">
								<label>车架号：</label><text>{{ item.vin || '-' }}</text>
							</view>
							<view class="info-item" :class="item.xsgw.length > 15 && 'long-info-item'"
								v-if="!item.bluetoothKey">
								<label>油箱容积：</label><text>{{ item.xsgw ? item.xsgw + 'L' : '-' }}</text>
							</view>
							<view class="info-item" :class="item.carOwnerName.length > 15 && 'long-info-item'"
								v-if="!item.bluetoothKey">
								<label>设备平台：</label><text>{{ item.carOwnerName || '-' }}</text>
							</view>
							<view class="info-item" :class="item.sn.length > 15 && 'long-info-item'">
								<label>设备号：</label><text>{{ item.sn || '-' }}</text>
							</view>
						</view>
						<view class="content-item-footer">
							<view class="footer-left"></view>
							<view class="footer-right">
								<view class="footer-right-btn" :data-item="item" @tap="openSendKeyModal">
									<text>发送钥匙</text>
								</view>
							</view>
						</view>
					</view>
					<view v-if="carList.length < 1"
						style="display:flex;justify-content:center;margin-top:20rpx;font-size:24rpx;">
						暂无数据
					</view>
				</scroll-view>
			</block>

			<block v-if="activeTab == 2">
				<view class="record-tabs-1" style="display:flex;flex-direction:column;gap:10rpx;">
					<view class="search-box">
						<icon type="search" size="16" class="search-icon" />
						<input placeholder="车牌号/设备号/使用人" class="search-input" @blur="onSearchBlur" />
					</view>
					<view class="picker-container">
						<view class="picker-btns">
							<view class="picker-btn" :class="recordStatus == 0 && 'active'" @tap="changeRecordStatus"
								data-id="0">
								使用中
							</view>
							<view class="picker-btn" :class="recordStatus == 1 && 'active'" @tap="changeRecordStatus"
								data-id="1">
								已过期
							</view>
						</view>
					</view>
				</view>
				<view class="tabs-1-conut">共有{{ recordTotal }}条记录</view>
				<scroll-view scroll-y class="scroll-full" @scrolltolower="loadRecordList">
					<view v-for="(item, idx) in recordList" :key="idx" class="content-card">
						<view class="card-head">
							<view class="card-head-left">
								<text>{{ item.platenumber }}</text>
								<text>{{ item.personname }}</text>
								<text class="split-line"></text>
								<text class="phone-text">{{ item.mobile }}</text>
							</view>
							<view class="card-head-right">
								<text v-if="item.status" style="color:#7b7b7c;">已取消</text>
								<text v-else>使用中</text>
							</view>
						</view>
						<view class="card-info">
							<time-line
								:events="[{ createdate: (item.startdate || '-') + ' 至 ' + (item.enddate || '-') }]" />
						</view>
						<view class="card-footer1" style="display:flex;justify-content:space-between;">
							<block v-if="!item.status">
								<view>
									<text @tap="openEditKeyModal" :data-item="item" style="float:left;">修改</text>
								</view>
								<view style="display:flex;flex-direction:row;">
									<text @tap="copyLink" :data-item="item">{{ copied ? '已复制' : '复制链接' }}</text>
									<text @tap="cancelRentKey" :data-item="item">取消用车</text>
								</view>
							</block>
							<block v-else>
								<view></view>
								<view style="display:flex;flex-direction:row;">
									<text @tap="previewImages" :data-item="item">查看照片</text>
								</view>
							</block>
						</view>
					</view>
				</scroll-view>
			</block>
		</view>
	</view>

	<view class="modal-mask" v-if="showSendModal" @tap="closeSendKeyModal"></view>
	<view class="modal-base-map" v-if="showSendModal" :style="{ bottom: showSearchList ? 250 : 0 + 'rpx' }">
		<form @submit="submitSendKey">
			<view class="modal-container">
				<view class="modal-container-head">
					<text>发送电子钥匙</text>
					<image src="/static/images/right_1.png" @tap="closeSendKeyModal" />
				</view>
				<view class="modal-container-middle">
					<view class="middle-form-item">
						<label>车牌号</label>
						<view class="modal-form-region" style="position:relative;">
							<view v-if="isManualInput" style="position:relative;">
								<input @focus="onInputFocus" @blur="onInputBlur" class="temporary" placeholder="请输入车牌号"
									name="platenumber" :value="searchKeyword" @input="onSearchInput"
									confirm-type="search" />
								<view v-if="searchList.length > 0 && searchKeyword.trim() !== ''"
									class="g_items_temporary">
									<view v-for="(item, idx) in searchList" :key="idx" @tap="selectPlate"
										:data-item="item" class="item-card-footer">
										{{ item.platenumber }}
									</view>
								</view>
							</view>
							<text v-else>{{ selectCarData.platenumber }}</text>
						</view>
					</view>
					<view class="middle-form-item">
						<label>使用人</label>
						<view class="modal-form-region">
							<input @focus="onInputFocus" @blur="onInputBlur" placeholder="请输入使用人" name="personName"
								style="text-align:right;font-size:28rpx;" />
						</view>
					</view>
					<view class="middle-form-item">
						<label>手机号</label>
						<view class="modal-form-region">
							<input @focus="onInputFocus" @blur="onInputBlur" placeholder="请输入手机号" name="mobile"
								style="text-align:right;font-size:28rpx;" />
						</view>
					</view>
					<view class="middle-form-item">
						<label>开始时间</label>
						<view class="modal-form-region">
							<picker mode="date" data-index="startDate" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ startDate }}</text>
								</view>
							</picker>
							<picker mode="time" data-index="startTime" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ startTime }}</text>
								</view>
							</picker>
						</view>
					</view>
					<view class="middle-form-item">
						<label>结束时间</label>
						<view class="modal-form-region">
							<picker mode="date" data-index="endDate" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ endDate }}</text>
								</view>
							</picker>
							<picker mode="time" data-index="endTime" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ endTime }}</text>
								</view>
							</picker>
						</view>
					</view>
					<view class="middle-form-item">
						<label>是否允许多人使用</label>
						<view class="modal-form-region">
							<picker mode="selector" :range="multiOptions" range-key="name" @change="changeMultiSelect"
								:value="multiIndex">
								<text>{{ multiOptions[multiIndex].name }}</text>
							</picker>
						</view>
					</view>
					<view class="middle-form-item">
						<label>备注</label>
						<view class="modal-form-region">
							<input placeholder="请输入车位号或车辆位置" name="bak" style="text-align:right;font-size:28rpx;" />
						</view>
					</view>
				</view>
				<view class="modal-container-footer">
					<button form-type="submit">确认</button>
				</view>
			</view>
		</form>
	</view>

	<view class="modal-mask" v-if="showEditModal" @tap="closeEditKeyModal"></view>
	<view class="modal-base-map" v-if="showEditModal">
		<form @submit="submitEditKey">
			<view class="modal-container">
				<view class="modal-container-head">
					<text>修改</text>
					<image src="/static/images/right_1.png" @tap="closeEditKeyModal" />
				</view>
				<view class="modal-container-middle">
					<view class="middle-form-item">
						<label>车牌号</label>
						<view class="modal-form-region">{{ editRecordData.platenumber }}</view>
					</view>
					<view class="middle-form-item">
						<label>使用人</label>
						<view class="modal-form-region">
							<text>{{ editRecordData.personname }}</text>
						</view>
					</view>
					<view class="middle-form-item">
						<label>手机号</label>
						<view class="modal-form-region">
							<text>{{ editRecordData.mobile }}</text>
						</view>
					</view>
					<view class="middle-form-item">
						<label>开始时间</label>
						<view class="modal-form-region">
							<picker mode="date" data-index="startDate" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ startDate }}</text>
								</view>
							</picker>
							<picker mode="time" data-index="startTime" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ startTime }}</text>
								</view>
							</picker>
						</view>
					</view>
					<view class="middle-form-item">
						<label>结束时间</label>
						<view class="modal-form-region">
							<picker mode="date" data-index="endDate" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ endDate }}</text>
								</view>
							</picker>
							<picker mode="time" data-index="endTime" @change="changeDateTime">
								<view class="form-item-text">
									<text>{{ endTime }}</text>
								</view>
							</picker>
						</view>
					</view>
					<view class="middle-form-item">
						<label>是否允许多人使用</label>
						<view class="modal-form-region">
							<picker mode="selector" :range="multiOptions" range-key="name" @change="changeMultiSelect"
								:value="multiIndex">
								<text>{{ multiOptions[multiIndex].name }}</text>
							</picker>
						</view>
					</view>
					<view class="middle-form-item">
						<label>备注</label>
						<view class="modal-form-region">
							<text>{{ editRecordData.bak || '-' }}</text>
						</view>
					</view>
				</view>
				<view class="modal-container-footer">
					<button form-type="submit">确认</button>
				</view>
			</view>
		</form>
	</view>
	<view class="card-footer">
		<view @tap="openGlobalSendModal">发送钥匙</view>
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
				screenHeight: 0,
				screenWidth: 0,
				statusBarHeight: 0,
				carPage: 1,
				carList: [],
				imgDomain: 'https://fin3.wiselink.net.cn/fin/',
				recordList: [],
				recordPage: 1,
				activeTab: 1,
				showSendModal: false,
				startDate: '',
				startTime: '',
				endDate: '',
				endTime: '',
				copied: false,
				showEditModal: false,
				editRecordData: {},
				isManualInput: false,
				recordStatus: '0',
				searchKeyword: '',
				multiOptions: [{
					name: '允许',
					value: 1
				}, {
					name: '不允许',
					value: 0
				}],
				multiIndex: 0,
				openType: 1,
				searchList: [],
				showSearchList: false,
				searchTimer: null,
				selectCarData: {},
				vehId: '',
				recordTotal: 0,
				searchParam: ''
			}
		},
		methods: {
			changeOpenType(e) {
				this.openType = e.detail.value
			},
			changeMultiSelect(e) {
				this.multiIndex = e.detail.value
			},
			onSearchInput(e) {
				const val = e.detail.value.trim()
				this.searchKeyword = val
				clearTimeout(this.searchTimer)
				this.searchTimer = setTimeout(() => {
					this.doSearchFilter(val)
				}, 500)
			},
			onInputBlur() {
				this.showSearchList = false
			},
			onInputFocus() {
				this.showSearchList = true
			},
			doSearchFilter(keyword) {
				if (!keyword) {
					this.searchList = []
					return
				}
				const lower = keyword.toLowerCase()
				this.searchList = this.carList.filter(i => i?.platenumber?.toLowerCase().includes(lower))
			},
			selectPlate(e) {
				this.searchKeyword = e.currentTarget.dataset.item.platenumber
				this.searchList = []
			},
			changeRecordStatus(e) {
				this.recordStatus = e.currentTarget.dataset.id
				this.recordPage = 1
				this.recordList = []
				this.getRecordList()
			},
			openGlobalSendModal() {
				this.showEditModal = false
				this.showSendModal = true
				this.isManualInput = true
				this.openType = 1
			},
			initDateTime() {
				const fmtDate = d => {
					const y = d.getFullYear()
					const m = (d.getMonth() + 1).toString().padStart(2, '0')
					const day = d.getDate().toString().padStart(2, '0')
					return `${y}-${m}-${day}`
				}
				const fmtTime = d => {
					const h = d.getHours().toString().padStart(2, '0')
					const mi = d.getMinutes().toString().padStart(2, '0')
					return `${h}:${mi}`
				}
				const now = new Date()
				const tomorrow = new Date(now)
				tomorrow.setDate(now.getDate() + 1)
				this.startDate = fmtDate(now)
				this.endDate = fmtDate(tomorrow)
				this.startTime = fmtTime(now)
				this.endTime = fmtTime(now)
			},
			openSendKeyModal(e) {
				const item = e.currentTarget.dataset.item
				this.selectCarData = item
				this.showEditModal = false
				this.showSendModal = true
				this.vehId = item.id
				this.openType = 1
			},
			closeSendKeyModal() {
				this.selectCarData = {}
				this.searchKeyword = ''
				this.showSendModal = false
				this.isManualInput = false
			},
			closeEditKeyModal() {
				this.showEditModal = false
				this.editRecordData = {}
			},
			loadCarList() {
				this.carPage++
				this.getCarList()
			},
			loadRecordList() {
				this.recordPage++
				this.getRecordList()
			},
			async getCarList() {
				try {
					const res = await u_carList({
						page: this.carPage
					})
					if (res.code === 1000) this.carList = this.carList.concat(res.content)
				} catch (e) {}
			},
			onSearchBlur(e) {
				this.searchParam = e.detail.value
				this.recordPage = 1
				this.recordList = []
				this.getRecordList()
			},
			async getRecordList() {
				try {
					const res = await u_rentRecord({
						page: this.recordPage,
						status: this.recordStatus,
						comParam: this.searchParam || ''
					})
					this.recordTotal = res.count || 0
					this.recordList = [...this.recordList, ...res.content]
				} catch (e) {}
			},
			previewImages(e) {
				const item = e.currentTarget.dataset.item
				if (!item) return
				const imgs = [item.img1, item.img2, item.img3, item.img4, item.img5].filter(Boolean)
				if (!imgs.length) return uni.showToast({
					title: '暂无照片',
					icon: 'none'
				})
				const urls = imgs.map(u => this.imgDomain + u.replace(/\\/g, '/'))
				uni.previewImage({
					urls
				})
			},
			async submitSendKey(e) {
				const form = e.detail.value
				if (!form.personName) return uni.showToast({
					title: '请输入使用人',
					icon: 'none'
				})
				if (!form.mobile) return uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				})
				const build = (d, t) => `${d} ${t || '00:00'}:00`
				const params = {
					vehId: this.vehId || '',
					client: this.openType,
					startDate: build(this.startDate, this.startTime),
					endDate: build(this.endDate, this.endTime),
					personName: form.personName,
					mobile: form.mobile,
					bak: form.bak,
					platenumber: form.platenumber || '',
					multipleUsed: this.multiOptions[this.multiIndex].value
				}
				try {
					const res = await u_sendRentKey(params)
					if (res.code !== 1000) throw new Error(res.msg)
					this.showSendModal = false
					this.carList = []
					this.recordList = []
					this.recordPage = 1
					setTimeout(() => {
						this.getCarList()
						this.getRecordList()
					}, 1000)
					uni.showModal({
						title: '发送成功',
						content: res.msg,
						showCancel: false
					})
				} catch (err) {
					uni.showToast({
						title: err.message || '发送失败',
						icon: 'none'
					})
				}
			},
			changeDateTime(e) {
				this[e.currentTarget.dataset.index] = e.detail.value
			},
			async cancelRentKey(e) {
				try {
					const code = e.currentTarget.dataset.item.controlcode
					const res = await u_cancelRentKey({
						controlCode: code
					})
					if (res.code === 1000) {
						this.recordList = []
						this.recordPage = 1
						this.getRecordList()
					}
				} catch (e) {}
			},
			copyLink(e) {
				const txt = e.currentTarget.dataset.item.simplecode
				uni.setClipboardData({
					data: txt,
					success: () => this.copied = true
				})
			},
			openEditKeyModal(e) {
				const item = e.currentTarget.dataset.item
				this.showSendModal = false
				this.openType = item.client || 0
				this.showEditModal = true
				this.editRecordData = item
				this.multiIndex = item.multipleUsed == 0 ? 1 : 0
			},
			async submitEditKey() {
				const build = (d, t) => `${d} ${t || '00:00'}:00`
				const params = {
					client: this.openType,
					controlCode: this.editRecordData.controlcode,
					startDate: build(this.startDate, this.startTime),
					endDate: build(this.endDate, this.endTime),
					multipleUsed: this.multiOptions[this.multiIndex].value
				}
				try {
					const res = await u_updateRentKey(params)
					if (res.code === 1000) {
						this.editRecordData = {}
						this.showEditModal = false
						this.recordList = []
						this.recordPage = 1
						this.getRecordList()
						uni.showModal({
							title: '温馨提示',
							content: res.msg,
							showCancel: false
						})
					}
				} catch (e) {}
			}
		},
		onLoad() {
			uni.getSystemInfo({
				success: res => {
					this.screenHeight = res.windowHeight
					this.screenWidth = res.windowWidth
					this.statusBarHeight = res.statusBarHeight
				}
			})
			this.getCarList()
			this.getRecordList()
		},
		onReady() {
			this.initDateTime()
		},
		onShow() {
			this.initDateTime()
		}
	}
</script>

<style scoped>
	::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none
	}

	scroll-view::-webkit-scrollbar {
		display: none
	}

	.container {
		height: 100vh;
		padding: 10rpx 4rpx;
		background-color: #f7f9fc;
		box-sizing: border-box
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
		gap: 15rpx
	}

	.record-tabs {
		display: flex;
		height: 50px;
		background-color: #f8f9fa;
		border-radius: 12rpx 12rpx 0 0;
		flex-shrink: 0
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
		font-weight: 700;
		transition: all .3s
	}

	.record-tabs-item.active {
		background-color: #6a9bee;
		color: #fff
	}

	.record-tabs-1 {
		flex-shrink: 0;
		padding: 0 10rpx
	}

	.search-box {
		display: flex;
		align-items: center;
		border: 1px solid #f0f0f0;
		border-radius: 40rpx;
		padding: 4px 12px;
		width: 96%;
		background-color: #f8f9fa;
		flex-shrink: 0
	}

	.tabs-1-conut {
		flex-shrink: 0;
		padding: 0 10px;
		text-align: center;
		font-size: 22rpx;
		color: #999
	}

	.scroll-full {
		flex: 1;
		width: 100%;
		gap: 10rpx
	}

	.content-item {
		margin: 15rpx;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04)
	}

	.content-item-head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-bottom: 1px solid #f5f5f5;
		padding: 10rpx
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx
	}

	.left-category {
		display: flex;
		align-items: center;
		font-weight: 500;
		font-size: 26rpx;
		color: #555;
		gap: 10rpx
	}

	.left-category image {
		width: 30rpx;
		height: 24rpx
	}

	.left-model {
		font-size: 24rpx;
		color: #666
	}

	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f5f5f5
	}

	.info-item {
		flex: 0 0 48%;
		font-size: 24rpx;
		color: #666
	}

	.long-info-item {
		flex-basis: 100% !important
	}

	.content-item-footer {
		display: flex;
		padding: 15rpx;
		justify-content: space-between
	}

	.footer-right-btn {
		background-color: #6a9bee;
		color: #fff;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
		font-size: 22rpx;
		font-weight: 500
	}

	.content-card {
		border: 1px solid #f0f0f0;
		margin: 12rpx;
		padding: 12rpx;
		border-radius: 8rpx;
		background-color: #fff
	}

	.card-head {
		border-bottom: 1px solid #f5f5f5;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: space-between
	}

	.card-head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
		font-weight: 500;
		font-size: 26rpx;
		color: #555
	}

	.split-line {
		border-left: 1px solid #f0f0f0;
		width: 1px;
		height: 35rpx
	}

	.card-info {
		border-bottom: 1px solid #f5f5f5
	}

	.card-footer1 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
		font-size: 22rpx;
		padding-top: 10rpx
	}

	.card-footer1 text {
		border: 1px solid #f0f0f0;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		background-color: #6a9bee;
		color: #fff;
		margin-left: 10rpx
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, .4);
		z-index: 998
	}

	.modal-base-map {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
		z-index: 999;
		padding: 20rpx
	}

	.modal-container {
		max-height: 70vh;
		display: flex;
		flex-direction: column
	}

	.modal-container-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
		border-bottom: 1px solid #f5f5f5;
		margin-bottom: 20rpx
	}

	.modal-container-head text {
		font-weight: 500;
		font-size: 34rpx;
		color: #555
	}

	.modal-container-head image {
		width: 24rpx;
		height: 24rpx
	}

	.modal-container-middle {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding-bottom: 20rpx
	}

	.modal-container-footer {
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center
	}

	.modal-container-footer button {
		background: linear-gradient(88deg, #6a9bee, #5a8de1);
		border-radius: 36rpx;
		font-weight: 500;
		font-size: 34rpx;
		color: #fff;
		width: 50%;
		height: 90%;
		border: none
	}

	.middle-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 90%;
		margin: 0 auto
	}

	.middle-form-item label {
		font-weight: 500;
		font-size: 28rpx;
		color: #666;
		min-width: 120rpx
	}

	.modal-form-region {
		flex: 1;
		text-align: right;
		color: #666;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		font-size: 26rpx
	}

	.temporary {
		text-align: right;
		font-size: 28rpx;
		width: 100%;
		color: #666
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
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, .05)
	}

	.item-card-footer {
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 10rpx;
		border-bottom: 1px solid #f5f5f5;
		color: #666
	}

	.radio-group {
		display: flex;
		gap: 60rpx
	}

	.radio-item {
		display: flex;
		align-items: center;
		font-size: 30rpx;
		color: #666
	}

	.card-footer {
		position: fixed;
		bottom: 120rpx;
		width: 100%;
		display: flex;
		justify-content: center;
		z-index: 10
	}

	.card-footer view {
		width: 40%;
		background: linear-gradient(88deg, #6a9bee, #5a8de1);
		padding: 10rpx;
		border-radius: 36rpx;
		color: #fff;
		text-align: center;
		font-weight: 500;
		font-size: 30rpx
	}

	.picker-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		gap: 20rpx;
		align-items: center;
		font-size: 26rpx;
		color: #333;
		margin-top: 8rpx
	}

	.picker-btns {
		display: flex;
		flex-direction: row;
		gap: 16rpx
	}

	.picker-btn {
		background-color: #e8ebf2;
		color: #666;
		border-radius: 30rpx;
		padding: 10rpx 24rpx;
		font-size: 24rpx;
		transition: all .2s ease
	}

	.picker-btn.active {
		background-color: #6a9bee;
		color: #fff
	}

	.search-input {
		font-size: 24rpx
	}

	.card-head-right {
		font-size: 24rpx;
		font-weight: 700
	}
</style>