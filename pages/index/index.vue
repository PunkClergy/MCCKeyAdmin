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
		<view class="layout-content" :style="contentStyle">
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
			<view class="data-center-section">
				<view class="data-center-card">
					<view class="data-center-card__item" v-for="(stat, idx) in dataCenter" :key="idx">
						<text class="data-center-card__num" :style="{color: stat.fontColor}">{{stat.count}}</text>
						<text class="data-center-card__label">{{stat.name}}</text>
					</view>
				</view>
			</view>
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
			<view class="car-life-section">
				<view class="car-life-card">
					<view class="car-life-header">
						<view class="car-life-header__left">
							<text class="car-life-header__title">{{videoMultiName}}</text>
							<text class="car-life-header__subtitle">{{videoMultiSubtitle}}</text>
						</view>
					</view>
					<view class="car-life-tabs">
						<text v-for="(item, index) in tabCarList" :key="index" class="car-life-tab"
							:class="{'car-life-tab--active': activeTabIndex === index}"
							@click="handleTabCarClick(item?.value,index)">
							{{ item.name }}
						</text>
					</view>
					<view class="car-life-grid">
						<view class="car-life-item-wrap" v-for="(item, index) in guideVideoList" :key="index">
							<view class="car-life-card-item__cover-wrap">
								<view class="video-wrapper">
									<image v-if="!item.showVideo" class="video-thumbnail" :src="item.poster"
										mode="aspectFill" @tap="loadAndPlayVideo(index)" />
									<view v-if="!item.showVideo" class="play-icon-wrapper"
										@tap.stop="loadAndPlayVideo(index)">
										<image src="/static/images/play.png" class="play-icon" mode="widthFix" />
									</view>
									<DomVideoPlayer v-else ref="domVideoPlayer" @play="onVideoPlay(index)"
										:src="item.videoSrc" :poster="item.poster" :autoplay="false" preload="none"
										:loop="true" :controls="true" style="width:100%;height:100%;display:block;" />
								</view>
							</view>
							<view class="car-life-card-item__info">
								<text class="car-life-card-item__title">{{ item.title || item.desc }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 自定义tabbar -->
		<view class="layout-tabbar" :style="tabbarStyle">
			<view class="layout-tabbar__item" v-for="(item, index) in tabList" :key="item.menuId || index"
				@click="handleTabClick(item,index)">
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
		u_videoList,
		u_videoFeedOption
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
				// ========== 视频播放器相关 ==========
				videoMultiName: '',
				videoMultiSubtitle: '',
				activeTabIndex: 0, // 默认选中第一个：全部
				tabCarList: [{
						label: '全部'
					},
					{
						label: '车辆养护'
					},
					{
						label: '用车技巧'
					},
					{
						label: '安全出行'
					}
				], //视频标签
				guideVideoList: [], // 使用指南视频列表
				currentPlayingIndex: -1, // 当前正在播放的视频下标，-1代表无播放
				_programmaticPlay: false, // 标记是否代码自动触发播放，区分用户手动点击
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
			this.fetchGuideVideoList()
			this.fetchVideoFeedOption()
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
			async fetchVideoFeedOption() {
				try {
					const res = await u_videoFeedOption({});
					if (res?.content) {
						this.videoMultiName = res?.content?.multiName
						this.videoMultiSubtitle = res?.content?.multiSubtitle
						this.tabCarList = res?.content?.paramList
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
			 * 获取使用指南视频列表
			 * 对返回数据做预处理：初始化视频状态字段、拼接封面图完整url
			 */
			async fetchGuideVideoList(evt = '') {
				try {
					const res = await u_videoList({
						type: evt
					});
					if (res.code === 1000) {
						this.guideVideoList = res.content.map(item => ({
							...item,
							videoSrc: '', // 视频播放地址，点击后才赋值，懒加载
							poster: item.preview ? `${this.baseImageUrl}img/${item.preview}` : '',
							showVideo: false // false展示缩略图，true渲染视频播放器
						}));
					}
				} catch (e) {
					/* ignore */
				}
			},
			// 切换视频标签
			handleTabCarClick(evt, index) {
				this.activeTabIndex = index
				this.fetchGuideVideoList(evt)
			},
			/**
			 * 暂停除exceptIndex以外的所有视频播放器
			 * 关键逻辑：同一时间只允许一个视频播放，处理ref可能是数组/单个实例兼容
			 * @param {Number} exceptIndex 不需要暂停的视频下标
			 */
			pauseOtherVideos(exceptIndex) {
				const players = this.$refs.domVideoPlayer;
				if (!players) return;
				// 统一转为数组，兼容单条/多条ref返回值
				const list = Array.isArray(players) ? players : [players];
				list.forEach((player, idx) => {
					if (idx === exceptIndex || !player) return;
					let videoEl = null;
					// 组件实例获取内部video dom节点
					if (player.$el) {
						videoEl = player.$el.querySelector?.('video') || player.$el;
					} else if (player.tagName && player.tagName.toLowerCase() === 'video') {
						// 如果拿到的直接是video原生dom
						videoEl = player;
					}
					// 优先调用原生video pause方法
					if (videoEl && typeof videoEl.pause === 'function') {
						try {
							videoEl.pause();
						} catch (e) {
							console.warn(`暂停视频 ${idx} 失败:`, e);
						}
					} else {
						// 降级：调用自定义组件暴露pause方法
						if (typeof player.pause === 'function') {
							try {
								player.pause();
							} catch (e) {
								console.warn(`组件 pause 方法调用失败 ${idx}:`, e);
							}
						}
					}
				});
			},
			/**
			 * 加载并播放指定下标视频，懒加载视频源，点击才初始化播放器
			 * @param {Number} index 当前点击视频下标
			 */
			loadAndPlayVideo(index) {
				const item = this.guideVideoList[index];
				if (!item) return;
				// 当前视频已经在播放，直接返回，避免重复执行
				if (this.currentPlayingIndex === index && item.showVideo) {
					return;
				}
				// 第一步：暂停其他所有视频
				this.pauseOtherVideos(index);
				// 更新全局播放标记
				this.currentPlayingIndex = index;
				// 播放器已经初始化完成，直接调用play播放
				if (item.showVideo) {
					const player = this.$refs.domVideoPlayer[index];
					if (player && typeof player.play === 'function') {
						this._programmaticPlay = true;
						try {
							const playPromise = player.play();
							if (playPromise && typeof playPromise.then === 'function') {
								playPromise
									.then(() => {
										this._programmaticPlay = false;
									})
									.catch(err => {
										this._programmaticPlay = false;
										console.warn(`视频 ${index} 播放失败:`, err.message);
									});
							} else {
								this._programmaticPlay = false;
							}
						} catch (e) {
							this._programmaticPlay = false;
							console.warn(`视频 ${index} 播放异常:`, e);
						}
					}
					return;
				}
				// 首次点击：懒加载，赋值视频源，开启播放器组件渲染
				const realUrl = `${this.baseImageUrl}img/${item.filepath}`;
				this.$set(item, 'showVideo', true);
				this.$set(item, 'videoSrc', realUrl);
				// nextTick等待dom渲染完成之后调用play
				this.$nextTick(() => {
					const player = this.$refs.domVideoPlayer[index];
					if (player && typeof player.play === 'function') {
						this._programmaticPlay = true;
						try {
							const playPromise = player.play();
							if (playPromise && typeof playPromise.then === 'function') {
								playPromise
									.then(() => {
										this._programmaticPlay = false;
									})
									.catch(err => {
										this._programmaticPlay = false;
										console.warn(`视频 ${index} 首次播放失败:`, err.message);
									});
							} else {
								this._programmaticPlay = false;
							}
						} catch (e) {
							this._programmaticPlay = false;
							console.warn(`视频 ${index} 播放异常:`, e);
						}
					} else {
						console.warn(`视频播放器 ${index} 未就绪`);
					}
				});
			},
			/**
			 * 视频组件play事件回调
			 * _programmaticPlay=true代表代码自动播放，不做处理；用户手动点击播放按钮时，暂停其他视频
			 * @param {Number} playingIndex 当前播放视频下标
			 */
			onVideoPlay(playingIndex) {
				if (this._programmaticPlay) {
					return;
				}
				// 用户手动触发播放，暂停其余视频
				if (this.currentPlayingIndex !== playingIndex) {
					this.pauseOtherVideos(playingIndex);
					this.currentPlayingIndex = playingIndex;
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
			handleTabClick(evt, index) {
				const url = evt?.pagePath
				if (url) uni.redirectTo({
					url: `/${url}`
				});
			},
		}
	};
</script>
<style lang="scss" scoped>
	@import './index.scss';
</style>