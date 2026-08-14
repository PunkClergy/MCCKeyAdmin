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
								{{ item.multiText }}
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
				<text>{{ item.multiText }}</text>
			</view>
		</view>

		<!-- ========== 自定义语言选择弹窗 ========== -->
		<view class="lang-picker-mask" v-if="showLangPicker" @tap="closeLangPicker">
			<view class="lang-picker-container" @tap.stop>
				<view class="lang-picker-title">{{ lang === 'zhCn' ? '选择语言' : 'Select Language' }}</view>
				<scroll-view class="lang-picker-list" scroll-y>
					<view v-for="(item, idx) in langList" :key="idx" class="lang-picker-item"
						@tap="selectLanguage(item.value)">
						<text class="lang-picker-item__name">{{ item.name }}</text>
						<text v-if="lang === item.value" class="lang-picker-item__check">✓</text>
					</view>
				</scroll-view>
				<view class="lang-picker-footer">
					<view class="lang-picker-btn lang-picker-btn-cancel" @tap="closeLangPicker">
						{{ lang === 'zhCn' ? '取消' : 'Cancel' }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_navlist20,
		u_mylist,
		u_deleteAccount
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

				// 语言列表（提取为 data 属性，便于多处复用）
				langList: [{
						name: '中文', //中文【中国】
						value: 'zhCn'
					},
					{
						name: 'English', //英语(美式)【美国】
						value: 'enUs'
					},
					{
						name: 'Bahasa Melayu', //马来语【马来西亚】
						value: 'msMy'
					},
					{
						name: 'Português (Brasil)', //巴西葡萄牙语【巴西】
						value: 'ptBr'
					},
					{
						name: 'தமிழ் (Singapore)', //泰米尔语【新加坡】
						value: 'taSg'
					},
					{
						name: 'ภาษาไทย', //泰语【泰国】
						value: 'thTh'
					},
					{
						name: 'Bahasa Indonesia', //印度尼西亚语【印度尼西亚】
						value: 'idId'
					},
					{
						name: 'Te Reo Māori', //毛利语【新西兰】
						value: 'miNz'
					}
				],
				// 控制弹窗显示
				showLangPicker: false,
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

			// ========== 自定义语言弹窗相关 ==========
			// 显示弹窗
			showLangPickerModal() {
				this.showLangPicker = true
			},
			// 关闭弹窗（点击遮罩或取消按钮）
			closeLangPicker() {
				this.showLangPicker = false
			},
			// 选择语言
			async selectLanguage(value) {
				// 如果选择的是当前语言，不重复操作
				if (value === this.lang) {
					this.closeLangPicker()
					return
				}

				// 保存语言
				uni.setStorageSync('language', value)
				this.lang = value

				// 更新导航栏标题
				const pageRoute = 'userCenter/index'
				uni.setNavigationBarTitle({
					title: titles[pageRoute][value]
				})

				// 刷新列表数据（使列表文本按新语言显示）
				await this.initDirectoryStructure()
				await this.initBottomDirectory()

				// 关闭弹窗
				this.closeLangPicker()
			},

			handleFunExe(evt) {
				if (!this.account) return uni.redirectTo({
					url: '/pages/login/index'
				})

				const info = evt.currentTarget.dataset.info
				console.log(info,'22223344')
				if (!info?.pagePath) return

				// ===== 语言切换：使用自定义弹窗 =====
				if (info.pagePath === 'Language') {
					this.showLangPickerModal()
					return
				}

				if (info.pagePath === 'Exit') {
					console.log(tips,2222,tips.Tip)
					uni.showModal({
						title: tips.Tip[this.lang],
						content: tips.ExitClearCache[this.lang],
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

				if (info?.pagePath === 'Delete') {
					uni.showModal({
						title: this.lang === 'zhCn' ? '注销账号' : 'Delete Account',
						content: this.lang === 'zhCn' ?
							'警告：注销后数据永久清除，无法恢复！确定要注销吗？' :
							'Warning: All data will be permanently deleted. Are you sure?',
						// confirmText: this.lang === 'zhCn' ? '确认注销' : 'Confirm Delete',
						// cancelText: this.lang === 'zhCn' ? '取消' : 'Cancel',
						confirmColor: '#FF3B30',
						success: async (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: this.lang === 'zhCn' ? '注销中...' : 'Deleting...'
								})

								try {
									const res = await u_deleteAccount({})
									if (res.code === 1000) {
										uni.hideLoading()
										uni.showToast({
											title: this.lang === 'zhCn' ? '注销成功' :
												'Deleted successfully',
											icon: 'success'
										})
										uni.clearStorageSync()
										setTimeout(() => {
											uni.reLaunch({
												url: '/pages/index/index'
											})
										}, 1500)
									} else {
										uni.hideLoading()
										uni.showToast({
											title: res.msg || (this.lang === 'zhCn' ? '注销失败' :
												'Delete failed'),
											icon: 'none'
										})
									}
								} catch (err) {
									uni.hideLoading()
									uni.showToast({
										title: this.lang === 'zhCn' ? '网络异常' : 'Network error',
										icon: 'none'
									})
								}
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
		background-color: linear-gradient(145deg, #e3f2fd 0%, #81d4fa 80%, #81d4fa)
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
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #FFF;
		box-shadow: -2rpx -2rpx 10rpx -10rpx #81d4fa;
		display: flex;
		align-items: center;
		justify-content: space-around;
		z-index: 99;
		box-sizing: border-box;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
		padding: 12rpx 0;
	}

	.tab-icon {
		width: 50rpx;
		height: 50rpx;
	}

	.tab-item text {
		font-size: 26rpx;
		color: #333;
	}

	.tab-item.active text {
		color: #3498db;
		font-weight: bold;
	}

	.float-button {
		position: fixed;
		right: 24rpx;
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

	/* ========== 自定义语言弹窗样式 ========== */
	.lang-picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}

	.lang-picker-container {
		width: 85%;
		max-height: 70vh;
		background-color: #fff;
		border-radius: 32rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 30rpx 0 20rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
	}

	.lang-picker-title {
		text-align: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		padding: 0 30rpx 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.lang-picker-list {
		flex: 1;
		max-height: 400rpx;
		overflow-y: auto;
		padding: 10rpx 0;
	}

	.lang-picker-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 28rpx 40rpx;
		border-bottom: 1rpx solid #f5f5f5;
		font-size: 30rpx;
		color: #333;
	}

	.lang-picker-item:active {
		background-color: #f5f5f5;
	}

	.lang-picker-item__check {
		color: #3498db;
		font-size: 34rpx;
		font-weight: bold;
	}

	.lang-picker-footer {
		padding: 20rpx 30rpx 0;
		border-top: 1rpx solid #eee;
		display: flex;
		justify-content: center;
	}

	.lang-picker-btn {
		width: 100%;
		text-align: center;
		padding: 20rpx 0;
		font-size: 30rpx;
		border-radius: 40rpx;
		background-color: #f5f5f5;
		color: #666;
	}

	.lang-picker-btn-cancel:active {
		background-color: #e8e8e8;
	}
</style>