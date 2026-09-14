<template>
	<view class="layout-root">
		<!-- 自定义头部，和首页结构样式完全对齐 -->
		<view class="layout-header" :style="headerStyle">
			<view class="layout-header__status-bar" :style="{height: statusBarHeight + 'px'}"></view>
			<view class="layout-header__title-wrap">
				<view class="layout-header__brand">
					<view class="brand-logo-box">
						<image class="brand-logo-img" src="/static/images/logo.png" />
					</view>
					<view class="brand-info">
						<text class="brand-info__title">WiseLink Auto Global</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 主体区域，paddingTop预留header、paddingBottom预留tabbar -->
		<view class="layout-content" :style="contentStyle">
			<!-- 表单主体 / 成功页 二选一，一屏提交 -->
			<view v-if="!isSuccess" class="form-card">
				<view class="title">Light-Asset Unmanned Model for Car & RV Rental | Multisite</view>
				<view class="desc">
					Traditional car rental company will stop at night directly! FDK Unmanned car rental create new model
					with 24hours pick up and return ,making use of the available car at night ,breaking the working
					hours limitation and improving order
				</view>

				<view class="question-block">
					<view class="q-text">Do you have existing connections with car-rental companies?</view>
					<input class="input-box" v-model="formData.q1" placeholder="Enter your answer." />
				</view>

				<view class="contact-title">Contact information</view>
				<view class="contact-desc">We'll contact you about your fleet management inquiry. Your information is
					secure and never shared.</view>

				<input class="input-box" v-model="formData.fullName" placeholder="Full name" />
				<input class="input-box" v-model="formData.whatsapp" placeholder="WhatsApp number" />
				<input class="input-box" v-model="formData.company" placeholder="Company name (Optional)" />
				<input class="input-box" v-model="formData.email" placeholder="Email" />
				<input class="input-box" v-model="formData.workEmail" placeholder="Work email (Optional)" />
				<input class="input-box" v-model="formData.phone" placeholder="Phone number" />


				<button class="submit-btn" @click="handleSubmit">Submit</button>
			</view>

			<!-- 提交成功页面 -->
			<view v-if="isSuccess" class="success-card">
				<view class="brand-name">Wiselink FDK</view>
				<view class="success-title">Thanks, you're all set.</view>
				<view class="success-desc">You may now access and use our APP in guest mode.</view>
				<view class="tip-text">Your information has been submitted to Wiselink FDK, and our specialist will
					contact you shortly. </view>
				<button class="view-web-btn" @click="goWeb">GO Home</button>
			</view>
		</view>

		<!-- 公共底部tabbar，和首页完全一致 -->
		<CustomTabbar :tab-list="tabList" :current-tab="currentTab" :base-image-url="baseImageUrl"
			:tabbar-height="tabbarBaseHeight" :safe-area-bottom="safeAreaBottom" @tab-click="onTabbarClick" />
	</view>
</template>

<script>
	import {
		u_navlist20
	} from '@/api/index';
	import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
	const IMG_BASE_URL = 'https://k1sw.wiselink.net.cn/';
	export default {
		name: "RentalLeadForm",
		components: {
			CustomTabbar
		},
		data() {
			return {
				// 布局参数，与首页保持统一
				statusBarHeight: 0,
				customTitleHeight: 44,
				tabbarBaseHeight: 90,
				safeAreaBottom: 0,
				currentTab: 2,
				baseImageUrl: IMG_BASE_URL,
				tabList: [],

				// 表单状态
				isSuccess: false,
				checked: true,
				formData: {
					q1: '',
					fullName: '',
					whatsapp: '',
					company: '',
					email: '',
					workEmail: '',
					phone: ''
				}
			}
		},
		computed: {
			headerStyle() {
				const totalHeaderHeight = this.statusBarHeight + this.customTitleHeight
				return {
					height: `${totalHeaderHeight}px`
				}
			},
			contentStyle() {
				const top = this.statusBarHeight + this.customTitleHeight + 10
				const bottom = this.tabbarBaseHeight + this.safeAreaBottom + 10
				return {
					paddingTop: `${top}px`,
					paddingBottom: `${bottom}px`
				}
			},
		},
		onLoad() {
			this.getSystemHeight()
			this.fetchNavlist()
		},
		methods: {
			getSystemHeight() {
				const sys = uni.getSystemInfoSync()
				this.statusBarHeight = sys.statusBarHeight || 0
				this.safeAreaBottom = sys.safeAreaInsets?.bottom || 0
			},
			// 获取tabbar菜单
			async fetchNavlist() {
				try {
					const res = await u_navlist20({});
					if (res?.content) {
						this.tabList = res.content
					}
				} catch (e) {
					/* ignore */
				}
			},
			handleSubmit() {
				const {
					q1,
					fullName,
					whatsapp,
					email
				} = this.formData;

				// 1. 强制必填项校验
				if (!fullName?.trim()) {
					uni.showToast({
						title: 'Please enter your full name',
						icon: 'none'
					});
					return;
				}

				// 2. WhatsApp / Email 至少填写一个
				const waVal = whatsapp?.trim();
				const emailVal = email?.trim();
				if (!waVal && !emailVal) {
					uni.showToast({
						title: 'Please fill in WhatsApp number or Email',
						icon: 'none'
					});
					return;
				}

				// 3. 如果填了邮箱，则校验邮箱格式
				if (emailVal) {
					const regEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
					if (!regEmail.test(emailVal)) {
						uni.showToast({
							title: 'Please input valid Email',
							icon: 'none'
						});
						return;
					}
				}

				console.log('提交表单数据：', this.formData)
				// 接口请求成功后切换成功页
				this.isSuccess = true
			},

			goWeb() {
				uni.redirectTo({
					url: '/pages/index/index'
				})
			},
			// tabbar点击事件，复用首页逻辑
			onTabbarClick({
				item,
				index
			}) {
				if (!item?.pagePath) return
				const {
					pagePath,
					text
				} = item
				const targetUrl = `/${pagePath}`
				const navigateApi = text == 'K7' ? uni.navigateTo : uni.redirectTo
				navigateApi({
					url: targetUrl
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.layout-root {
		width: 100%;
		height: 100vh;
		box-sizing: border-box;
		background-color: #f6f8fb;
	}

	/* ========== 头部 完全复用首页header样式 ========== */
	.layout-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 999;
		display: flex;
		flex-direction: column;
		background: #ffffff;
	}

	.layout-header__status-bar {
		width: 100%;
	}

	.layout-header__title-wrap {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6rpx 15rpx;
		box-sizing: border-box;
	}

	.layout-header__brand {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10rpx;
	}

	.brand-logo-box {
		background-color: #f6f8fb;
		border-radius: 10rpx;
		width: 80rpx;
		height: 80rpx;
	}

	.brand-logo-img {
		width: 100%;
		height: 100%;
	}

	.brand-info {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.brand-info__title {
		font-size: 34rpx;
		font-weight: bold;
		color: #2c2c2c;
	}

	/* ========== 内容区 ========== */
	.layout-content {
		width: 100%;
		height: 100vh;
		box-sizing: border-box;
		overflow-y: auto;
		padding: 32rpx;
	}

	.form-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 40rpx 32rpx;
	}

	.title {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 24rpx;
		color: #222;
	}

	.desc {
		font-size: 28rpx;
		color: #444;
		line-height: 1.6;
		margin-bottom: 40rpx;
		text-align: center;
	}

	.question-block {
		margin-bottom: 40rpx;
	}

	.q-text {
		font-size: 30rpx;
		color: #333;
		margin-bottom: 16rpx;
	}

	.input-box {
		border-bottom: 1px solid #cccccc;
		height: 80rpx;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 24rpx;
	}

	.contact-title {
		font-size: 34rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
	}

	.info-icon {
		color: #666;
		font-size: 30rpx;
	}

	.contact-desc {
		font-size: 28rpx;
		color: #444;
		margin-bottom: 32rpx;
	}

	.divider {
		height: 1px;
		background: #ddd;
		margin: 32rpx 0;
	}

	.policy-title {
		font-size: 34rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 16rpx;
	}

	.policy-text {
		font-size: 26rpx;
		color: #555;
		line-height: 1.5;
	}

	.link-row {
		margin: 20rpx 0;
	}

	.link {
		display: block;
		color: #1677ff;
		font-size: 28rpx;
		margin: 8rpx 0;
	}

	.checkbox-row {
		display: flex;
		margin: 32rpx 0;
		align-items: flex-start;
	}

	.check-text {
		flex: 1;
		font-size: 26rpx;
		color: #444;
		margin-left: 16rpx;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #1677ff;
		color: #fff;
		border-radius: 12rpx;
		font-size: 32rpx;
	}

	.success-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 40rpx 32rpx;
		text-align: center;
	}

	.brand-name {
		font-size: 32rpx;
		color: #666;
		margin-bottom: 16rpx;
	}

	.success-title {
		font-size: 38rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.success-desc {
		font-size: 28rpx;
		color: #444;
		margin-bottom: 32rpx;
	}

	.tip-text {
		font-size: 26rpx;
		color: #555;
		line-height: 1.5;
		margin-bottom: 40rpx;
	}

	.view-web-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #1677ff;
		color: #fff;
		border-radius: 12rpx;
		font-size: 32rpx;
	}
</style>