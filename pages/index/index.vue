<template>
	<view class="welcome-page">
		<view class="content">
			<view class="main-title">{{ tips?.WelcomeUse?.[lang] }}</view>
			<view class="loader">
				<view class="circle"></view>
			</view>
			<view class="desc">{{ tips?.PreparingService?.[lang] }}...</view>
		</view>
		<view class="footer">© 2026 {{ tips?.ZhiXinTong?.[lang] }}</view>
	</view>
</template>

<script>
	import {
		tips
	} from '@/utils/langtips.js'
	export default {
		data() {
			return {
				tips: tips,
				timer: null,
				lang: '',
			}
		},
		onShow() {
		  const cacheLang = uni.getStorageSync('language')
		  if (cacheLang) {
		    this.lang = cacheLang
		    return
		  }
		
		  const systemInfo = uni.getSystemInfoSync()
		  const language = systemInfo?.language||'zh_CN' 
		  const [prefix, suffix] = language.split(/[-_]/);
		  const processedSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase()
		  const lang = prefix.toLowerCase() + processedSuffix
		  this.lang = lang
		  uni.setStorageSync('language', lang)
		},
		onLoad() {
			this.timer = setTimeout(() => {
				uni.redirectTo({
					url: '/pages/zoneCenter/index'
				})
			}, 3000)
		},
		onUnload() {
			clearTimeout(this.timer)
		}
	}
</script>

<style scoped>
	.welcome-page {
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.main-title {
		font-size: 58rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 80rpx;
		letter-spacing: 6rpx;
		animation: fadeIn 1.2s ease;
	}

	.loader {
		margin-bottom: 50rpx;
		animation: fadeIn 1.5s ease;
	}

	.circle {
		width: 76rpx;
		height: 76rpx;
		border: 5rpx solid rgba(255, 255, 255, 0.3);
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: rotate 1s linear infinite;
	}

	.desc {
		font-size: 30rpx;
		color: rgba(255, 255, 255, 0.9);
		animation: fadeIn 1.8s ease;
	}

	.footer {
		position: absolute;
		bottom: 60rpx;
		font-size: 25rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>