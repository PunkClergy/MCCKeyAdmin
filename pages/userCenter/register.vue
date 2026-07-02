<!-- pages/register/register.vue -->
<template>
	<view class="container">
		<view class="register-area">
			<!-- Logo 区域 -->
			<view class="logo-container fade-in">
				<view class="logo-wrapper">
					<image src="/static/images/logo.png" class="logo-img" />
					<text class="logo-text">{{tips.ZhiXinTong[lang]}}</text>
				</view>
				<text class="slogan">{{tips.ZhitongxinProvider[lang]}}</text>
			</view>

			<!-- 注册表单 -->
			<view class="input-group">
				<view class="input-item">
					<view class="input-label">{{tips.Account[lang]}}</view>
					<input class="input-field" :placeholder="tips.EnterAccountPhone[lang]" v-model="username" />
				</view>
				<view class="input-item">
					<view class="input-label">{{tips.Password[lang]}}</view>
					<input class="input-field" :placeholder="tips.EnterPassword[lang]" v-model="password"
						:password="true" />
				</view>
				<view class="input-item">
					<view class="input-label">{{tips.ConfirmPassword[lang]}}</view>
					<input class="input-field" :placeholder="tips.ReEnterPassword[lang]" v-model="confirmPassword"
						:password="true" />
				</view>


				<button class="register-btn" :disabled="isSubmitting"
					@tap="handleRegister">{{tips.Register[lang]}}</button>

				<view class="login-link">
					<text>{{langs.haveanaccount}}</text>
					<text class="link-text" @tap="goToLogin">{{tips.GoToLogin[lang]}}</text>
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
		</view>
	</view>
</template>

<script>
	import {
		titles
	} from '@/utils/langtitle.js'
	import {
		tips
	} from '@/utils/langtips.js'
	import {
		u_register
	} from '@/api';
	export default {
		data() {
			return {
				tips: tips,
				username: '',
				password: '',
				confirmPassword: '',
				phone: '',
				smsCode: '',
				isSubmitting: false,
				smsDisabled: false,
				smsBtnText: '',
				countdown: 60,
				langs: {},
			};
		},
		components: {},
		onShow() {
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'userCenter/register'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
		},
		methods: {



			// 表单验证
			validateForm() {
				if (!this.password) {
					uni.showToast({
						title: this.tips.EnterPassword[this.lang],
						icon: 'none'
					});
					return false;
				}
				if (this.password !== this.confirmPassword) {
					uni.showToast({
						title: this.tips.PwdNotMatch[this.lang],
						icon: 'none'
					});
					return false;
				}
				if (!this.username) {
					uni.showToast({
						title: this.tips.EnterAccountPhone[this.lang],
						icon: 'none'
					});
					return false;
				}

				return true;
			},

			// 注册处理
			async handleRegister() {
				if (this.isSubmitting) return;
				if (!this.validateForm()) return;
				this.isSubmitting = true;

				try {
					const response = await u_register({
						password: this.password,
						username: this.username,
					});
					console.log(response)
					if (response.code === 1000) {
						uni.showToast({
							title: this.tips.RegisterSuccess[this.lang]
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 3000);
					} else {
						uni.showToast({
							title: response.msg || this.tips.RegisterFail[this.lang],
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: this.tips.RequestFailRetry[this.lang],
						icon: 'none'
					});
				} finally {
					this.isSubmitting = false;
				}
			},

			// 跳转到登录页面
			goToLogin() {
				uni.navigateBack();
			}
		}
	};
</script>

<style>
	page {
		background-color: #252c3b;
		height: 100%;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.register-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
		/* justify-content: center; */
	}

	.logo-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
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

	.input-group {
		width: 90%;
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}

	.input-item {
		display: flex;
		flex-direction: row;
		height: 90rpx;
		background: white;
		border-radius: 10rpx;
		align-items: center;
		position: relative;
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
		padding-right: 20rpx;
	}

	.sms-btn {
		position: absolute;
		right: 10rpx;
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 20rpx;
		font-size: 26rpx;
		background: #4cd964;
		color: white;
		border-radius: 8rpx;
	}

	.sms-btn[disabled] {
		background: #cccccc;
	}

	.register-btn {
		width: 100%;
		background: #4cd964;
		color: white;
		margin-top: 20rpx;
	}

	.register-btn[disabled] {
		background: #a0e6ad;
	}

	.login-link {
		text-align: center;
		margin-top: 30rpx;
		font-size: 28rpx;
		color: #a3a1a1;
	}

	.link-text {
		color: #4cd964;
		margin-left: 10rpx;
		text-decoration: underline;
	}

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