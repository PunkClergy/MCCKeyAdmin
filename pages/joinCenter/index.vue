<template>
	<view class="page-not-open">
		<!-- 简化自定义头部：只保留 logo 和 WiseLink Auto Global -->
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

		<!-- 页面主体，给tabbar留出底部安全距离，同时留出header顶部padding -->
		<view class="content-wrap" :style="contentStyle">
			<view class="main-text">暂未开通此功能</view>
			<view class="sub-text">敬请期待后续版本</view>
			<button class="back-button" @click="handleBack">返回</button>
		</view>

		<!-- 公共底部tabbar，和首页保持统一 -->
		<CustomTabbar :tab-list="tabList" :current-tab="currentTab" :base-image-url="baseImageUrl"
			:tabbar-height="tabbarBaseHeight" :safe-area-bottom="safeAreaBottom" @tab-click="onTabbarClick" />
	</view>
</template>
<script>
	import {
		u_navlist20,
	} from '@/api/index';
	// 引入tabbar组件，和首页路径保持一致
	import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
	const IMG_BASE_URL = 'https://k1sw.wiselink.net.cn/';

	export default {
		name: 'PageNotOpen',
		components: {
			CustomTabbar
		},
		data() {
			return {
				// 头部布局 与首页对齐
				statusBarHeight: 0,
				customTitleHeight: 44,
				// 和首页参数对齐
				tabbarBaseHeight: 90,
				safeAreaBottom: 0,
				currentTab: 2,
				baseImageUrl: IMG_BASE_URL,
				tabList: []
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
				const top = this.statusBarHeight + this.customTitleHeight
				const bottom = this.tabbarBaseHeight + this.safeAreaBottom
				return {
					paddingTop: `${top}px`,
					paddingBottom: `${bottom}px`
				}
			}
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
			// 获取底部导航数据，和首页一致
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
			handleBack() {
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
	@import "@/pages/index/index.scss";

	.page-not-open {
		width: 100%;
		min-height: 100vh;
		background: #f5f7fa;
	}

	.content-wrap {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 60rpx;
	}

	.main-text {
		font-size: 34rpx;
		color: #303133;
		font-weight: 500;
	}

	.sub-text {
		font-size: 26rpx;
		color: #909399;
		margin-top: 20rpx;
	}

	.back-button {
		margin-top: 70rpx;
		width: 260rpx;
	}
</style>