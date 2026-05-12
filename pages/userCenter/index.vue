<template>
	<view class="container">
		<scroll-view class="content" scroll-y>
			<view class="my-content-list-container">
				<view class="my-content-list-inner">
					<view v-for="(item, index) in contentList" :key="item.id" :data-info="item"
						class="my-content-list-item"
						:class="index === contentList.length - 1 ? 'my-content-list-item_last' : ''"
						@tap="handleFunExe">
						<view class="my-content-list-item__left">
							<text class="my-content-list-item__text">
								{{ item['text' + lang] || item.text }}
							</text>
						</view>
						<image src="/static/images/right_1.png" class="my-content-list-item__arrow" mode="widthFix" />
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="tabbar" :style="{ height: tabBarHeight + 'px' }">
			<view class="tab-item" :class="currentTab === index ? 'active' : ''" v-for="(item, index) in tabList"
				:key="index" @tap="handleSwitchTabNavigation" :data-index="index">
				<image :src="`https://k1sw.wiselink.net.cn/img/${item.selectedIconPath}`" class="tab-icon"
					mode="widthFix" v-if="currentTab === index" />
				<image :src="`https://k1sw.wiselink.net.cn/img/${item.iconPath}`" class="tab-icon" mode="widthFix"
					v-else />
				<text>{{ item['text' + lang.replace('-', '')] || item.text }}</text>
			</view>
		</view>

		<view class="float-button">
			<image src="/static/images/tel400.png" style="width: 80rpx;height: 80rpx;"
				@tap="handleMakePhoneCallWithConfirm" />
		</view>
	</view>
</template>

<script>
	import {
		u_navlist20,
		u_mylist
	} from '@/api/index'
	import {
		titles
	} from '@/utils/langtitle.js'
	import {
		tips
	} from '@/utils/langtips.js'

	export default {
		data() {
			return {
				tabBarHeight: 80,
				currentTab: 2,
				c_link: 'https://k1sw.wiselink.net.cn/',
				tabList: [],
				contentList: [],
				servicePhone: '+86400-090-5050',
				height_from_head: 0,
				head_height: 0,
				capsule_distance_to_the_right: 0,
				account: '',
				lang: 'zhCn',
			}
		},

		onLoad() {
			this.initBottomDirectory()
			this.initDirectoryStructure()
		},

		onShow() {
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'userCenter/index'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
			this.initSystemInfo()
		},

		onReady() {
			this.initLoginStatus()
		},

		methods: {
			handleMakePhoneCallWithConfirm() {
				uni.showModal({
					title: tips.MakeACall[this.lang],
					content: `${tips.DoYouWantToCallCustomerService[this.lang]}：${this.servicePhone}`,
					confirmText: tips.Call[this.lang],
					cancelText: tips.Cancel[this.lang],
					success: (res) => {
						if (res.confirm) {
							uni.makePhoneCall({
								phoneNumber: this.servicePhone,
								fail: (err) => {
									if (err.errMsg !== 'makePhoneCall:fail cancel') {
										uni.showToast({
											title: tips.DialFailed[this.lang],
											icon: 'none'
										})
									}
								}
							})
						}
					}
				})
			},

			initSystemInfo() {
				const {
					statusBarHeight: s,
					screenWidth
				} = uni.getWindowInfo()
				const m = uni.getMenuButtonBoundingClientRect()
				if (!m) return
				const n = m.height + (m.top - s) * 2
				const c = screenWidth - m.right
				this.height_from_head = s
				this.head_height = s + n
				this.capsule_distance_to_the_right = c
			},

			initLoginStatus() {
				try {
					const res = uni.getStorageSync('user_info')
					this.account = res?.companyName || res?.username || ''
				} catch (e) {}
			},

			async initBottomDirectory() {
				try {
					const res = await u_navlist20({})
					if (res.code === 1000) {
						this.tabList = res.content
						this.currentTab = res.content?.length - 1
					}
				} catch (e) {}
			},

			handleOnExistingAccountTap() {
				uni.navigateTo({
					url: '/pages/system/managerLoginView/loginView'
				})
			},

			async initDirectoryStructure() {
				try {
					const res = await u_mylist({})
					console.log(res)
					if (res.code === 1000) {
						this.contentList = res.content
					}
				} catch (e) {}
			},

			handleSwitchTabNavigation(evt) {
				const idx = evt.currentTarget.dataset.index
				const item = this.tabList[idx]
				if (!item?.pagePath) return
				const targetUrl = item.pagePath
				uni.redirectTo({
					url: `/${targetUrl}`
				})
			},

			handleBackHome() {
				uni.redirectTo({
					url: '/pages/index/index'
				})
			},

			handleFunExe(evt) {
				if (!this.account) return uni.redirectTo({
					url: '/pages/login/index'
				})

				const info = evt.currentTarget.dataset.info
				if (!info?.pagePath) return

				if (info.pagePath === 'Language') {
					const langList = [{
							name: '中文',
							value: 'zhCn'
						},
						{
							name: 'English',
							value: 'enUs'
						}
					]
					uni.showActionSheet({
						itemList: langList.map(item => item.name),
						success: async (res) => {
							const {
								name,
								value
							} = langList[res.tapIndex]

							uni.setStorageSync('language', value)
							this.lang = value

							const pageRoute = 'userCenter/index'
							uni.setNavigationBarTitle({
								title: titles[pageRoute][value]
							})

							await this.initDirectoryStructure()
							await this.initBottomDirectory()
						}
					})
					return
				}

				if (info.pagePath === 'Exit') {
					uni.showModal({
						title: tips.Tip[this.lang],
						content: tips.ExitClearCache[this.lang],
						confirmText: tips.Confirm[this.lang],
						cancelText: tips.Cancel[this.lang],
						success: (res) => {
							if (res.confirm) {
								uni.clearStorageSync()
								uni.reLaunch({
									url: '/pages/index/index'
								})
							}
						}
					})
					return
				}

				uni.navigateTo({
					url: `/${info.pagePath}`
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
	}

	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		align-items: center;
		height: 100vh;
		background-color: #F3F9FD;
	}

	.custom-header {
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.custom-header-outer-layer {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 25rpx;
	}

	.custom-header-outer-layer-image {
		width: 45rpx;
		height: 49rpx;
	}

	.custom-header-outer-layer-title {
		font-weight: bold;
		font-size: 36rpx;
		color: #333333;
	}

	.custom-header-outer-layer-user_name {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 5rpx;
	}

	.custom-header-outer-layer-user_name text {
		font-weight: 500;
		font-size: 28rpx;
		color: #333333;
	}

	.custom-header-outer-layer-user_name image {
		width: 26rpx;
		height: 26rpx;
	}

	.content {
		width: 100%;
		position: absolute;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.my-content-list-container {
		width: 96%;
		margin: 0 auto;
	}

	.my-content-list-inner {
		width: 94%;
		background-color: #fff;
		margin: 0 auto;
		border-radius: 20rpx;
		padding: 20rpx;
	}

	.my-content-list-item {
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #CDD5DA;
	}

	.my-content-list-item_last {
		border-bottom: none;
	}

	.my-content-list-item__left {
		display: flex;
		gap: 20rpx;
		flex-direction: row;
		align-items: center;
	}

	.my-content-list-item__text {
		font-weight: bold;
		font-size: 28rpx;
		color: #333333;
	}

	.my-content-list-item__arrow {
		width: 25rpx;
		height: 25rpx;
	}

	.tabbar {
		width: 100%;
		background-color: #fff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		position: fixed;
		bottom: 0;
		left: 0;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
		box-sizing: border-box;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 25%;
	}

	.tab-icon {
		width: 50rpx;
		height: 50rpx;
		margin-bottom: 10rpx;
	}

	.tab-item text {
		font-size: 24rpx;
		color: #999;
	}

	.tab-item.active text {
		color: #3498db;
	}

	.float-button {
		position: fixed;
		right: 20rpx;
		top: 75%;
		transform: translateY(-50%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		transition: all 0.2s ease;
		flex-direction: column;
		gap: 20rpx;
	}

	.float-button image {
		width: 111rpx;
		height: 123rpx;
	}

	.hidden-contact-btn {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 50%;
		opacity: 0;
		z-index: 10;
		background: none !important;
		border: none !important;
		padding: 0 !important;
		margin: 0 !important;
	}

	.qr-group-container {
		width: 100%;
		box-sizing: border-box;
	}

	.qr-group-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.9);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.qr-group-close {
		position: absolute;
		top: 12vh;
		right: 30rpx;
		color: white;
		font-size: 60rpx;
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 10;
	}

	.qr-group-preview-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 30rpx;
	}

	.qr-group-preview-img {
		max-width: 90%;
		max-height: 70vh;
		object-fit: contain;
		border-radius: 12rpx;
	}

	.qr-group-preview-desc {
		color: white;
		font-size: 24rpx;
		text-align: center;
		padding: 0 40rpx;
		line-height: 1.5;
	}
</style>