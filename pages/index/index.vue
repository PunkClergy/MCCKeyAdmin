<template>
	<view class="layout-root">
		<!-- 自定义头部 -->
		<view class="layout-header" :style="headerStyle">
			<view class="layout-header__status-bar" :style="{height: statusBarHeight + 'px'}"></view>
			<view class="layout-header__title-wrap">
				<view class="layout-header__brand">
					<view class="brand-logo-box">
						<image class="brand-logo-img" src="/static/images/logo.png" />
					</view>
					<view class="brand-info">
						<text class="brand-info__title">WiseLink Auto Global</text>
						<text class="brand-info__sub">Fleet Digital Key</text>
					</view>
				</view>
				<view class="layout-header__phone">{{userInfo?.companyName ||userInfo?.username }}</view>
			</view>
		</view>
		<!-- 页面主体内容 -->
		<view class="layout-content" :style="contentStyle">
			<!-- banner区域：左右边距和头部统一15rpx -->
			<view class="banner-section" v-if="bannerList.length">
				<swiper class="banner-swiper" :style="{height: bannerHeight + 'px'}" :indicator-dots="true"
					:autoplay="true" :interval="3000" :duration="500">
					<swiper-item v-for="(item, index) in bannerList" :key="index">
						<image :data-item="item"
							:src="baseImageUrl + '/img/' + (item.fileType == 1 ? item.img : item.videoImg)"
							class="banner-img" mode="aspectFill" data-flag="banner" @load="updateBannerHeight" />
					</swiper-item>
				</swiper>
			</view>
			<!-- 数据中心：单个圆角大卡片，内部横向4个数据 -->
			<view class="data-center-section">
				<view class="data-center-card">
					<view class="data-center-card__item" v-for="(stat, idx) in dataCenter" :key="idx">
						<text class="data-center-card__num" :style="{color: stat.fontColor}">{{stat.count}}</text>
						<text class="data-center-card__label">{{stat.name}}</text>
					</view>
				</view>
			</view>
			<!-- 常用服务板块：全部包裹在service-card卡片内 -->
			<view class="service-section">
				<view class="service-card">
					<view class="service-header">
						<view class="service-header__left">
							<text class="service-header__title">{{zoneMultiName}}</text>
							<text class="service-header__subtitle">{{zoneMultiSubtitle}}</text>
						</view>
						<view class="service-header__more" @click="handleAllService">
							<text class="service-header__more-text">{{expand?'收起':'展开'}}</text>
						</view>
					</view>
					<view class="service-grid">
						<view class="service-grid__item" v-for="(item, idx) in (expand?allServiceList:serviceList)"
							:key="idx" @click="handleServiceClick(item)">
							<view class="service-grid__icon" :style="{backgroundColor: item.bgcolor}">
								<image class="service-grid__icon-text" :src="baseImageUrl + '/img/' + item.icon" />
							</view>
							<text class="service-grid__name">{{item.multiName}}</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 车生活板块：全部包裹在 car-life-card 卡片内 -->
			<view class="car-life-section">
				<view class="car-life-card">
					<view class="car-life-header">
						<view class="car-life-header__left">
							<text class="car-life-header__title">使用指南</text>
							<text class="car-life-header__subtitle">精选用车知识与服务指南</text>
						</view>
					</view>
					<view class="car-life-tabs">
						<text class="car-life-tab car-life-tab--active">全部</text>
						<text class="car-life-tab">车辆养护</text>
						<text class="car-life-tab">用车技巧</text>
						<text class="car-life-tab">安全出行</text>
					</view>
					<view class="car-life-grid">
						<!-- 每个item独立外层卡片 car‑life‑item‑wrap -->
						<view class="car-life-item-wrap" v-for="(item, idx) in carLifeList" :key="idx"
							@click="handleCarLifeClick(item)">
							<!-- 竖版 宽9 : 高16  padding‑top:16/9*100% =177.78% -->
							<view class="car-life-card-item__cover-wrap">
								<view class="car-life-card-item__cover">
									<image :src="baseImageUrl + '/img/' + item?.preview"></image>
									<view class="car-life-card-item__tag" v-if="item.typename">{{item.typename}}</view>
								</view>
							</view>
							<view class="car-life-card-item__info">
								<text class="car-life-card-item__title">{{item.title}}</text>
								<view class="car-life-card-item__meta">
									<text class="car-life-card-item__time">{{item.lang}}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 自定义tabbar -->
		<view class="layout-tabbar" :style="tabbarStyle">
			<view class="layout-tabbar__item" v-for="(item, index) in tabList" :key="item.menuId || index"
				@click="handleTabClick(index)">
				<view class="layout-tabbar__icon">
					<image class="tabbar-icon-img" :src="
	          index === currentTab
	            ? baseImageUrl + '/img/' + item.selectedIconPath
	            : baseImageUrl + '/img/' + item.iconPath
	        " mode="aspectFit" />
				</view>
				<text class="layout-tabbar__text" :class="{ active: index === currentTab }">
					{{ item.multiText }}
				</text>
			</view>
		</view>



	</view>
</template>
<script>
	import {
		u_getHomeArea30,
		u_bannerlist20,
		u_dateReport,
		u_navlist20,
		u_videoList
	} from '@/api/index';
	const IMG_BASE_URL = 'https://k1sw.wiselink.net.cn/';
	export default {
		data() {
			return {
				// 布局相关的值
				statusBarHeight: 0,
				customTitleHeight: 44,
				tabbarBaseHeight: 90,
				safeAreaBottom: 0,
				// 用户信息
				userInfo: {},
				// 当前所选中的Tabar索引
				currentTab: 0,
				// img调用链接前缀
				baseImageUrl: IMG_BASE_URL,
				// 底部Tabar
				tabList: [],
				// banner列表
				bannerList: [],
				// banner高度
				bannerHeight: 0,
				// 数据中心统计
				dataCenter: [],
				// 功能专区标题
				zoneMultiName: '功能专区',
				// 功能专区副标题
				zoneMultiSubtitle: '功能专区副标题',
				// 功能专区是否展开
				expand: 0,
				// 常用服用全部数据
				allServiceList: [],
				// 常用服务宫格8项
				serviceList: [],
				// 底部两个大卡片
				serviceBottomList: [],
				// 车生活板块数据
				carLifeList: [{
						title: '雨季用车',
						time: '02:16',
						views: '1.2k',
						coverText: '🌧️',
						coverBgColor: '#e6f7ed',
						tag: '养护课堂',
						path: '/pages/car-life/detail'
					},
					{
						title: '电子钥匙如何安全授权给家人？',
						time: '03:25',
						views: '',
						coverText: '🔐',
						coverBgColor: '#e6f0ff',
						tag: '安全出行',
						path: '/pages/car-life/detail'
					},
					{
						title: '雨季用车，记得给爱车做这 3 项检查',
						time: '33',
						views: '44',
						coverText: '▶️',
						coverBgColor: '#fff4e6',
						tag: '',
						path: '/pages/car-life/detail'
					},
					{
						title: '电子钥匙如何安全',
						time: '11',
						views: '22',
						coverText: '🛡️',
						coverBgColor: '#f7f0ff',
						tag: '',
						path: '/pages/car-life/detail'
					}
				]
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
			},
			tabbarStyle() {
				return {
					height: `${this.tabbarBaseHeight}px`
				}
			}
		},
		onLoad() {
			this.getSystemHeight()
			this.getStorageUser()
		},
		onShow() {
			this.fetchBannerList()
			this.fetchZoneList()
			this.fetchDateReport()
			this.fetchNavlist()
			this.fetchVideoList()
		},
		methods: {
			getSystemHeight() {
				const sys = uni.getSystemInfoSync()
				this.statusBarHeight = sys.statusBarHeight || 0
				this.safeAreaBottom = sys.safeAreaInsets?.bottom || 0
			},
			getStorageUser() {
				uni.getStorage({
					key: 'user_info',
					success: res => {
						this.userInfo = res?.data || {};
					},
				});
			},
			async fetchBannerList() {
				try {
					const res = await u_bannerlist20({
						terminalId: 0
					});
					if (res?.content) {
						this.bannerList = res.content;
						this.bannerHeight = 0;
					}
				} catch (e) {
					/* ignore */
				}
			},
			/**
			 * 获取首页区域菜单数据
			 */
			async fetchZoneList() {
				try {
					const res = await u_getHomeArea30({});
					if (res?.code !== 1000) return;
					const info = res?.content ?? [];
					if (!Array.isArray(info)) return;
					const BottomList = [];
					for (const evt of info) {
						if (!evt) continue;
						this.zoneMultiName = evt.multiName ?? '';
						this.zoneMultiSubtitle = evt.multiSubtitle ?? '';
						const fdkChildren = Array.isArray(evt.children) ? evt.children : [];
						this.allServiceList = fdkChildren.map(ele => ({
							...ele
						}));
						this.serviceList = fdkChildren.slice(0, 12).map(element => ({
							...element
						}));
					}
				} catch (e) {
					/* ignore */
				}
			},
			/**
			 * 获取数据面板数据
			 */
			async fetchDateReport() {
				try {
					const res = await u_dateReport({});
					if (res?.content) {
						this.dataCenter = res?.content
					}
				} catch (e) {
					/* ignore */
				}
			},
			async fetchVideoList() {
				try {
					const res = await u_videoList({});
					if (res?.content) {
						this.carLifeList = res?.content
					}
				} catch (e) {
					/* ignore */
				}
			},
			/**
			 * 底部导航数据
			 */
			async fetchNavlist() {
				try {
					const res = await u_navlist20({});
					if (res?.content) {
						console.log(res, '111')
						this.tabList = res?.content
					}
				} catch (e) {
					/* ignore */
				}
			},
			/**
			 * 轮播图高度相关
			 */
			updateBannerHeight(e) {
				const {
					width,
					height
				} = e.detail;
				if (!width || !height) return;
				const {
					windowWidth
				} = uni.getSystemInfoSync();
				const realWidth = windowWidth - uni.upx2px(30);
				this.bannerHeight = (height / width) * realWidth;
			},
			switchTab(index) {
				console.log('切换tab', index)
			},
			handleServiceClick(item) {
				if (item.path) {
					uni.navigateTo({
						url: item.path
					})
				}
			},
			// 功能专区的展开和收起方法
			handleAllService() {
				this.expand = !this.expand
			},
			// 车生活 - 点击卡片
			handleCarLifeClick(item) {
				console.log('点击车生活内容', item)
				if (item.path) {
					uni.navigateTo({
						url: item.path
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import './index.scss';
</style>