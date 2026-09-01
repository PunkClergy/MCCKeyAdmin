<!-- pages/login/login.vue -->
<template>
	<!-- index.wxml -->
	<view class="container">
		<!-- <CustomNavBar title="登录" /> -->
		<!-- 上部分：登录区域 -->
		<view class="login-area">
			<!-- Logo 区域 -->
			<view class="logo-container fade-in">
				<view class="logo-wrapper">
					<image src="/static/images/logo.png" class="logo-img" />
					<text class="logo-text">{{tips.footInfo[lang]}}</text>
				</view>
			</view>

			<!-- 切换标签：账号登录 / 游客登录 -->
			<view class="tab-switch">
				<view class="tab-item" :class="{active: loginType === 'account'}" @tap="loginType = 'account'">
					{{tips.AccountLogin?.[lang] || 'Account Login'}}
				</view>
				<view class="tab-item" :class="{active: loginType === 'guest'}" @tap="loginType = 'guest'">
					{{tips.GuestLogin?.[lang] || 'Guest Login'}}
				</view>
			</view>

			<!-- 登录方式选择 -->
			<view class="input-group">
				<!-- 账号登录表单 -->
				<view v-if="loginType === 'account'" class="account-form-wrap">
					<view class="input-item">
						<view class="input-label">{{tips.Account[lang]}}</view>
						<input class="input-field" :placeholder="tips.EnterAccountPhone[lang]" v-model="username" />
					</view>
					<view class="input-item">
						<view class="input-label">{{tips.Password[lang]}}</view>
						<input class="input-field" :placeholder="tips.EnterPassword[lang]" v-model="password"
							:password="true" />
					</view>
					<view class="btn-wrap">
						<button class="login-btn" @tap="handleLogin">{{tips.Login[lang]||'Login'}}</button>
						<text class="register" @tap="handleRegister">{{tips.RegisterAccount[lang]}}</text>
					</view>
				</view>

				<!-- 游客登录视图 -->
				<view v-if="loginType === 'guest'">
					<button class="guest-login-btn" @tap="handleGuestLogin" :disabled="isSubmitting">
						{{tips.GuestLogin?.[lang] || 'Guest Login'}}
					</button>
				</view>
			</view>
		</view>
		<!-- 下部分：信息展示 -->
		<view class="info-area">
			<view class="info-card">
				<text class="product-name">{{tips.footInfo[lang]}}</text>
				<view style="font-size: 26rpx; color: #575658">{{tips.BPlatformIntro[lang]}}</view>
				<view class="contact-info">
					<text class="company-name">{{tips.footInfo[lang]}}</text>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		login,
		u_getQrcodeImg,
		u_visitorLogin
	} from '@/api';
	import {
		titles
	} from '@/utils/langtitle.js'
	import {
		tips
	} from '@/utils/langtips.js'
	export default {
		data() {
			return {
				username: '',
				password: '',
				isSubmitting: false,
				init_qr_code: '',
				tips: tips,
				lang: 'zhCn',
				loginType: 'account' // account账号登录 / guest游客登录
			};
		},
		components: {

		},
		mounted() {
			this.infinityGetQrcodeImg()
		},
		onShow() {
			this.handleGetCurrentLanguage()
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'login/index'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
		},
		methods: {
			handleGetCurrentLanguage() {
				let currentLang = uni.getStorageSync('lang') || 'zh-CN';
			},
			// 预览图片
			handlePreviewImage(evt) {
				uni.previewMedia({
					sources: [{
						url: this.init_qr_code,
						// 图片路径
						type: 'image'
					}]
				});
			},
			handlePreviewImage() {
				if (this.init_qr_code) {
					uni.previewImage({
						urls: [this.init_qr_code],
						longPressActions: {
							itemList: ['保存图片到相册'],
							success: (data) => {}
						}
					});
				}
			},
			async infinityGetQrcodeImg() {
				console.log(111)
				try {
					const response = await u_getQrcodeImg();
					if (response?.code == 1000) {
						this.init_qr_code = response?.content?.img
					}
				} catch (error) {
					uni.showToast({
						title: '查询失败',
						icon: 'none'
					});
				}
			},
			async handleLogin() {
				if (!this.username || !this.password) {
					uni.showToast({
						title: this.tips.EnterUsernameAndPwd[this.lang],
						icon: 'none'
					});
					return;
				}
				this.isSubmitting = true;
				try {
					const response = await login({
						username: this.username,
						password: this.password,
						type: 2
					});
					uni.setStorageSync('token', response.content.token);
					uni.setStorageSync('user_info', response.content);
					uni.removeStorageSync('is_guest');
					// 跳转到首页或其他页面
					uni.reLaunch({
						url: '/pages/index/index'
					});
				} catch (error) {
					uni.showToast({
						title: this.tips.LoginFailCheckInfo[this.lang],
						icon: 'none'
					});
				} finally {
					this.isSubmitting = false;
				}
			},
			// 游客登录
			async handleGuestLogin() {
				this.isSubmitting = true;
				try {
					// ==========这里替换为你的游客登录接口==========
					const res = await u_visitorLogin()
					uni.setStorageSync('token', res.content.token)
					uni.setStorageSync('user_info', res.content)
					uni.reLaunch({
						url: '/pages/index/index'
					})
				} catch (err) {

				} finally {
					this.isSubmitting = false
				}
			},
			handleRegister() {
				console.log(1111)
				uni.navigateTo({
					url: '/pages/userCenter/register'
				})
			}
		}
	};
</script>
<style>
	page {
		background-color: #252c3b;
		height: 100%;
	}

	/* index.wxss */
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	/* 登录区域 */
	.login-area {
		flex: 4;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
		gap: 40rpx;
	}

	.logo-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.logo-wrapper {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.logo-img {
		width: 60rpx;
		height: 60rpx;
		border-radius: 22rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}

	.logo-text {
		color: white;
		font-size: 32rpx;
	}

	.slogan {
		font-size: 30rpx;
		color: #a3a1a1;
		font-weight: 500;
		margin-top: 20rpx;
	}

	/* 切换标签样式 */
	.tab-switch {
		width: 90%;
		display: flex;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 12rpx;
		overflow: hidden;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		font-size: 30rpx;
		color: #cccccc;
		padding: 20rpx 0;
	}

	.tab-item.active {
		background: #ffffff;
		color: #252c3b;
		font-weight: 500;
	}

	/* 表单样式 */
	.form-container {
		width: 92%;
		margin: 0 auto;
		transition: all 0.3s ease;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 60rpx;
		width: 90%;
	}

	.account-form-wrap {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}

	.input-item {
		display: flex;
		flex-direction: row;
		height: 90rpx;
		background: white;
		border-radius: 10rpx;
		align-items: center;
	}

	.input-label {
		min-width: 150rpx;
		font-size: 30rpx;
		margin-left: 25rpx;
		color: #a4a4a4;
	}

	.input-field {
		margin-left: 10rpx;
		width: 100%;
		height: 100%;
		text-align: left;
		color: #4a4a4a;
		font-size: 30rpx;
	}

	.btn-wrap {
		margin-top: 20rpx;
	}

	.login-btn {
		width: 100%;
		background: #4cd964;
		color: white;
	}

	.guest-login-btn {
		width: 100%;
		background: #406299;
		color: #fff;
	}

	.login-tip {
		color: white;
		font-size: 24rpx;
	}

	.wx-login-container {
		width: 96%;
	}

	/* 微信登录按钮 */
	.wx-login-btn {
		color: #fff;
		font-size: 34rpx;
		font-weight: 500;
		background: #4cd964;
		width: 100%;
	}

	/* 信息展示区域 */
	.info-area {
		flex: 3;
		padding: 40rpx 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}

	.info-card {
		width: 96%;
		background: #fff;
		padding: 30rpx 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	}

	.product-name {
		display: block;
		font-size: 26rpx;
		color: #333;
		margin-bottom: 20rpx;
	}

	.product-en {
		font-size: 24rpx;
	}

	.core-title {
		display: block;
		font-size: 28rpx;
		color: #2d3436;
		font-weight: 600;
		margin-bottom: 30rpx;
	}

	.function-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.function-item {
		display: flex;
		align-items: center;
		padding: 5rpx 0;
		font-size: 24rpx;
		color: #333;
	}

	.function-item::before {
		content: '';
		width: 12rpx;
		height: 12rpx;
		background: #4cd964;
		border-radius: 50%;
		margin-right: 16rpx;
	}

	.contact-info {
		text-align: center;
		color: #333;
		margin-top: 40rpx;
	}

	.company-name {
		display: block;
		font-size: 24rpx;
		margin-bottom: 16rpx;
	}

	.contact-details {
		font-size: 24rpx;
		line-height: 1;
	}

	/* 动画 */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	.fade-in {
		animation: fadeIn 0.6s ease-in;
	}

	/* 交互状态 */
	.button-hover {
		opacity: 0.9;
	}

	.btn_tapcolor {
		opacity: 0.8;
	}

	.register {
		float: right;
		margin-top: 20rpx;
		color: #fff;
		font-size: 26rpx;
	}
</style>