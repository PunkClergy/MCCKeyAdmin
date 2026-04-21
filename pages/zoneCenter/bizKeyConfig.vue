<template>
	<view class="container">

		<scroll-view class="content-container" scroll-y @scrolltolower="handleLower">
			<block v-for="(item, index) in g_items" :key="index">
				<view class="content-item">
					<view class="content-item-head">
						<view class="head-left">
							<view class="left-category">
								<text>{{ item.realname }}</text>
							</view>
							<view class="left-model"></view>
						</view>
					</view>

					<view class="content-item-info">
						<view class="info-item" :class="item.username?.length > 15 ? 'long-info-item' : ''">
							<label>账号 ：</label>
							<text>{{ item.username || '-' }}</text>
						</view>
						<view class="info-item" :class="item.mobile?.length > 15 ? 'long-info-item' : ''">
							<label>联系电话 ：</label>
							<text>{{ item.mobile || '-' }}</text>
						</view>
						<view class="info-item long-info-item" v-if="type">
							<label>
								已绑定车辆 ：
								<text data-all="all" :data-item="item.vehList" :data-id="item.id"
									@tap="handleUnbind">解绑所有车辆</text>
							</label>
							<view v-for="(g_item, g_index) in item.vehList" :key="g_index">
								<text>{{ g_item.platenumber }}</text>
								&nbsp;
								<text :data-item="g_item" :data-id="item.id" @tap="handleUnbind">解绑</text>
							</view>
						</view>
					</view>

					<view class="content-item-footer" v-if="type">
						<view class="footer-left"></view>
						<view class="footer-right">
							<view class="footer-right-btn" :data-item="item" @tap="handleSelectJump">
								<text>绑定车辆</text>
							</view>
						</view>
					</view>
				</view>
			</block>
		</scroll-view>
	</view>
</template>

<script>
	// import { showLoading, hideLoading, showToast } from '@/utils/Inspect/tips'
	// import { _handleWindowInfo, _handleDeviceInfo } from '@/utils/public'
	import {
		u_GetRole,
		u_carManagerList,
		u_vehBindCarManager,
		u_vehUnBindCarManager,
		u_carManagerapi_del
	} from '@/api/index'

	export default {
		data() {
			return {
				c_screen_height: 0,
				c_statusBarHeight: 0,
				c_navBarHeight: 44,
				c_searchBarHeight: 70,
				c_totalNavHeight: (0) +
					(44),

				g_page: 1,
				g_comParam: '',
				g_items: [],
				g_total: 0,
				type: 1,
				roleName: '',
				title_name: '',
				id: '',
				s_background_picture_of_the_front_page: ''
			}
		},

		onLoad(options) {
			this.initCarryParams(options)
		},

		onShow() {
			if (this.roleName) {
				this.initGetRole({
					name: this.roleName
				})
			}
		},

		onReady() {
			this.initialiImageBaseConversion()
		},

		methods: {
			async handleUnbind(e) {
				uni.showModal({
					title: '重要提示',
					content: '确定要解绑吗？',
					confirmText: '解绑',
					confirmColor: '#d9534f',
					success: async ({
						confirm
					}) => {
						if (!confirm) return

						const all = e?.currentTarget?.dataset?.all
						const flag = e?.currentTarget?.dataset?.item
						const userId = e?.currentTarget?.dataset?.id
						let vehIds = ''

						if (all) {
							vehIds = flag?.map(ele => ele?.id).join(',')
						} else {
							vehIds = flag?.id
						}

						try {
							const res = await u_vehUnBindCarManager({
								userId,
								vehIds
							})
							if (res.code === 1000) {
								// showToast(res.msg)
								this.initGetRole({
									name: this.roleName
								})
							} else {
								// showToast(res.msg)
							}
						} catch (e) {}
					}
				})
			},

			async initGetRole(evt) {
				try {
					const res = await u_GetRole({
						roleName: evt?.name || '',
						isAutoCreate: 1
					})
					if (res.code === 1000) {
						this.id = res.content.id
						this.roleName = evt?.name || ''
						this.getCarList()
					}
				} catch (e) {}
			},

			async initCarryParams(evt) {
				if (evt?.info && evt?.black) {
					const param = {
						userId: JSON.parse(evt?.info)?.id,
						vehIds: evt?.black
					}
					try {
						const res = await u_vehBindCarManager(param)
						if (res.code === 1000) {
							this.g_items = []
							this.g_page = 1
							this.type = 1
							this.initGetRole(evt)
							// showToast(res.msg)
						} else {
							// showToast(res.msg)
						}
					} catch (e) {}
				} else {
					this.initGetRole(evt)
				}
			},

			initialiImageBaseConversion() {
				const imageMap = [{
					path: '/static/images/home/car-bg.png',
					key: 's_background_picture_of_the_front_page'
				}]
				const promises = imageMap.map(item => {
					return new Promise((resolve) => {
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
				})
				Promise.all(promises).then(results => {
					const data = results.reduce((acc, curr) => ({
						...acc,
						...curr
					}), {})
					Object.assign(this, data)
				})
			},

			async getCarList() {
				try {
					const res = await u_carManagerList({
						roleId: this.id
					})
					if (res.code === 1000) {
						this.g_items = res.content
						this.g_total = Number(res.count || 0).toLocaleString()
					}
				} catch (e) {}
			},

			handleLower() {
				this.g_page++
				this.getCarList()
			},

			handleSelectJump(e) {
				const temp = {
					id: e?.currentTarget?.dataset?.item?.id
				}
				uni.navigateTo({
					url: `/pages/carManager/carList/carList?source=/pages/carManager/corpel/index&flagMulti=1&info=${JSON.stringify(temp)}&type=${this.type}&name=${this.title_name}&desc=${JSON.stringify(e?.currentTarget?.dataset?.item)}`
				})
			},

			handleBlur(e) {
				const val = e.detail.value
				if (val === this.g_comParam) return
				this.g_comParam = val
				this.g_page = 1
				this.g_items = []
				this.getCarList()
			},

			handleJumpBack() {
				uni.navigateBack()
			},

			handleJumpInfo() {
				uni.navigateTo({
					url: `/pages/system/roleSeparation/index?type=${this.id}&name=${this.roleName}`
				})
			},

			handleView(e) {
				const item = e.currentTarget.dataset.item
				uni.navigateTo({
					url: '/pages/carManager/carListAdd/index?flag=see&item=' + JSON.stringify(item)
				})
			},

			handleEdit(e) {
				const item = e.currentTarget.dataset.item
				uni.navigateTo({
					url: '/pages/carManager/corpelAdd/index?flag=edit&item=' + JSON.stringify(item)
				})
			},

			async handleDelete(e) {
				const item = e.currentTarget.dataset.item
				const index = e.currentTarget.dataset.index
				try {
					const res = await u_carManagerapi_del({
						id: item?.id
					})
					// hideLoading()
					if (res.code === 1000) {
						this.g_items = this.g_items.filter((_, i) => i !== index)
						// showToast(res.msg)
					} else {
						// showToast('请求失败')
					}
				} catch (e) {}
			}
		}
	}
</script>

<style scoped>
	.container {
		width: 100%;
		height: 95vh;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		position: relative;
	}

	.content-container {
		position: absolute;
		left: 0;
		right: 0;
		overflow-y: auto;
	}

	.content-item {
		margin: 15rpx;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item-head {
		display: flex;
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
		font-weight: bold;
		font-size: 26rpx;
		color: #333;
	}

	.left-model {
		font-size: 24rpx;
		color: #333;
	}

	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.info-item {
		flex: 0 0 48%;
		font-size: 24rpx;
		color: #333;
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
		background: #1B64B1;
		color: #fff;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
		font-size: 22rpx;
	}
</style>