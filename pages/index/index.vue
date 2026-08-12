<template>
	<view class="container">
		<!-- 自定义头部 -->
		<view class="custom-header" :style="headerStyle">
			<view class="custom-header-outer-layer">
				<image class="custom-header-outer-layer-image" src="/static/images/logo.png" @tap="goHome" />
				<view class="custom-header-outer-layer-title">WiseLink Auto Global</view>
				<view class="custom-header-outer-layer_user_name">
					<text v-if="userAccount">{{ userAccount }}</text>
					<view v-else @tap="goToLogin" class="login-wrapper">
						<text>{{ tips.PleaseLogin[lang] }}</text>
						<image src="/static/images/right_1.png" />
					</view>
				</view>
			</view>
			<view class="subtitle" :style="{ fontSize: (subtitleFontSize || 11) + 'px' }">
				{{ subtitleText }}
			</view>
		</view>

		<!-- 主内容（弹窗打开时模糊） -->
		<scroll-view class="content" :class="showZonePopup ? 'blur-content' : ''" scroll-y :style="contentStyle">
			<!-- 轮播 -->
			<view class="swiper-container">
				<swiper indicator-dots="false" autoplay interval="3000" duration="500"
					:style="{ height: bannerHeight + 'px' }">
					<swiper-item v-for="(item, index) in bannerList" :key="index">
						<image @tap="handleBannerClick" :data-item="item"
							:src="baseImageUrl + '/img/' + (item.fileType == 1 ? item.img : item.videoImg)"
							class="banner-img" mode="widthFix" data-flag="banner" @load="updateBannerHeight" />
					</swiper-item>
				</swiper>
			</view>

			<!-- 功能专区 -->
			<view class="special-zone-container" v-if="groupedZoneList.length">
				<view class="zone-header">
					<view class="zone-header-left">
						<view class="blue-mark"></view>
						<text class="zone-title">{{tips.FunctionZone[lang] }}</text>
					</view>
					<view class="zone-more" @tap="openZoneSelector">{{tips.MoreZones[lang]}}</view>
				</view>
				<view class="special-zone" v-for="(group, index) in groupedZoneList" :key="index">
					<view class="zone-item" v-for="(zone, idx) in group.list" :key="idx">
						<view class="zone-out"
							:style="{ backgroundColor: zone.bgcolor, border: zone.namezhCn ? '1rpx solid #f0f0f0' : 'none' }"
							:data-info="zone" @tap="handleZoneItemClick">
							<image class="zone-img" :src="baseImageUrl + '/img/' + zone.icon" />
							<view class="zone-text-area">
								<view class="zone-name">{{ zone.multiName }}</view>
								<view class="zone-desc">{{ zone.multiSubtitle }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 视频列表（一行两个，不足靠左） -->
			<view class="guide-wrapper" v-if="guideVideoList.length">
				<view class="guide-header">
					<image src="/static/images/useGuideIcon.png" />
					<text>{{ tips.UserGuide[lang] }}</text>
				</view>
				<view class="guide-list">
					<view class="guide-item" v-for="(item, index) in guideVideoList" :key="index">
						<!-- 视频容器 -->
						<view class="video-wrapper">
							<!-- 缩略图加载中的 loading -->
							<view v-if="item.thumbnailLoading" class="thumbnail-loading">
								<view class="loading-spinner"></view>
							</view>
							<!-- 缩略图（初始显示） -->
							<image v-if="!item.showVideo" class="video-thumbnail" :src="item.poster" mode="aspectFill"
								@tap="loadAndPlayVideo(index)" @load="handleThumbnailLoad(index)"
								@error="handleThumbnailError(index)" />
							<!-- 播放按钮（缩略图上） -->
							<view v-if="!item.showVideo" class="play-icon-wrapper" @tap.stop="loadAndPlayVideo(index)">
								<image src="/static/images/play.png" class="play-icon" mode="widthFix" />
							</view>
							<!-- 视频组件（加载后显示） -->
							<DomVideoPlayer v-else ref="domVideoPlayer" @play="onVideoPlay(index)" :src="item.videoSrc"
								:poster="item.poster" :autoplay="false" :preload="auto" :loop="true" :controls="true" preload="none"
								style="width:100%;height:100%;display:block;" />
						</view>
						<view class="guide-desc">{{ item.title || item.desc }}</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部 TabBar -->
		<view class="tabbar" :style="{ height: tabBarHeight + 'px' }">
			<view class="tab-item" :class="currentTab === index ? 'active' : ''" v-for="(item, index) in tabBarList"
				:key="index" @tap="switchTab" :data-index="index">
				<image class="tab-icon" mode="widthFix"
					:src="baseImageUrl + '/img/' + (currentTab === index ? item.selectedIconPath : item.iconPath)" />
				<text>{{ item.multiText }}</text>
			</view>
		</view>

		<!-- 专区选择弹窗 -->
		<view class="popup-mask" v-if="showZonePopup" @tap="closeZoneSelector">
			<view class="popup-panel" @tap.stop>
				<view class="popup-header">
					<text class="popup-title">{{tips.Pleaseselectthezoneyouwishtodisplay[lang]}}</text>
					<view class="popup-close-btn" @tap="closeZoneSelector">✕</view>
				</view>
				<scroll-view class="popup-list" scroll-y>
					<label class="popup-item" v-for="(item, index) in zoneSelectList" :key="index"
						@tap="toggleZoneSelection(item)">
						<checkbox :value="String(item.id)" :checked="isZoneSelected(item.id)" color="#4F7CFF"
							style="transform:scale(0.8); margin-right:20rpx;" />
						<image class="popup-item-icon" :src="baseImageUrl + '/img/' + item.icon" mode="widthFix" />
						<view class="popup-item-info">
							<text class="popup-item-name">{{ item.multiName }}</text>
							<text class="popup-item-desc">{{ item.multiSubtitle }}</text>
						</view>
					</label>
				</scroll-view>
				<view class="popup-footer">
					<button class="popup-btn cancel" @tap="closeZoneSelector">{{tips?.Cancel[lang]}}</button>
					<button class="popup-btn confirm" @tap="confirmZoneSelection">{{tips?.Confirm[lang]}}</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import 'url-search-params-polyfill';
	import {
		u_getHomeArea,
		u_bannerlist20,
		u_getQrcodeImg,
		u_navlist20,
		u_isShowInfo,
		u_leveOneMenu,
		u_setHomeMenu,
		u_videoList
	} from '@/api/index';
	import {
		tips
	} from '@/utils/langtips.js';

	const IMG_BASE_URL = 'https://k1sw.wiselink.net.cn/';
	const SERVICE_PHONE = '400-090-5050';

	export default {
		data() {
			return {
				tabBarHeight: 80,
				currentTab: 0,
				showZonePopup: false,
				userAccount: '',
				qrCodeImage: '',
				lang: 'zhCn',
				tips: tips,
				statusBarHeight: 30,
				headerHeight: 88,
				rightPadding: 15,
				subtitleText: '',
				subtitleFontSize: null,
				bannerList: [],
				bannerHeight: '',
				zoneList: [],
				selectedZoneIds: [],
				tempSelectedZoneIds: [],
				zoneSelectList: [],
				guideVideoList: [],
				currentPlayingIndex: -1,
				_programmaticPlay: false,
				tabBarList: [],
				showInfoFlag: null,
				baseImageUrl: IMG_BASE_URL,
				servicePhoneNumber: SERVICE_PHONE,
			};
		},

		computed: {
			headerStyle() {
				return {
					paddingTop: this.statusBarHeight + 'px',
					paddingLeft: this.rightPadding + 'px',
					paddingRight: this.rightPadding + 'px',
					height: this.headerHeight + 'px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
				};
			},
			contentStyle() {
				return {
					top: this.headerHeight + 'px',
					bottom: this.tabBarHeight + 'px',
				};
			},
			groupedZoneList() {
				const filtered = this.zoneList;
				const map = {};
				filtered.forEach(item => {
					const key = item.serial_number || 1;
					if (!map[key]) map[key] = [];
					map[key].push(item);
				});
				return Object.keys(map)
					.sort((a, b) => a - b)
					.map(key => ({
						serial_number: +key,
						list: map[key],
					}));
			},
		},

		methods: {
			// ---------- 初始化 ----------
			initSystemInfo() {
				try {
					const {
						statusBarHeight,
						screenWidth
					} = uni.getWindowInfo();
					const menu = uni.getMenuButtonBoundingClientRect();
					if (!menu) return;
					const headerHeight = menu.height + (menu.top - statusBarHeight) * 2;
					this.statusBarHeight = statusBarHeight;
					this.headerHeight = statusBarHeight + headerHeight;
					this.rightPadding = screenWidth - menu.right;
				} catch (e) {
					console.warn('获取系统信息失败');
				}
			},

			loadLanguage() {
				const cached = uni.getStorageSync('language');
				if (cached) {
					this.lang = cached;
					return;
				}
				const {
					platform,
					language
				} = uni.getSystemInfoSync();
				if (platform === 'ios') {
					this.lang = 'zhCn';
				} else {
					const [prefix, suffix] = language.split(/[-_]/);
					const processedSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
					this.lang = prefix.toLowerCase() + processedSuffix;
				}
				uni.setStorageSync('language', this.lang);
			},

			loadUserAccount() {
				uni.getStorage({
					key: 'user_info',
					success: res => {
						this.userAccount = res?.data?.companyName || res?.data?.username || '';
					},
				});
			},

			loadSelectedZoneIds() {
				if (this.selectedZoneIds.length === 0) {
					const saved = uni.getStorageSync('selectedZoneIds');
					if (saved && Array.isArray(saved) && saved.length) {
						this.selectedZoneIds = saved;
					}
				}
			},

			// ---------- API 请求 ----------
			async fetchBannerList() {
				try {
					const res = await u_bannerlist20({
						terminalId: 0
					});
					if (res?.content) this.bannerList = res.content;
				} catch (e) { /* ignore */ }
			},

			async fetchTabBarList() {
				try {
					const res = await u_navlist20({});
					if (res.code === 1000) this.tabBarList = res.content;
				} catch (e) { /* ignore */ }
			},

			async fetchZoneList() {
				try {
					const res = await u_getHomeArea({});
					if (res.code === 1000) {
						this.zoneList = res.content;
						this.selectedZoneIds = this.zoneList.map(item => item.id);
						uni.setStorageSync('selectedZoneIds', this.selectedZoneIds);
					}
				} catch (e) { /* ignore */ }
			},

			async fetchGuideVideoList() {
				try {
					const res = await u_videoList({});
					if (res.code === 1000) {
						this.guideVideoList = res.content.map(item => ({
							...item,
							videoSrc: '',
							poster: item.preview ? `${this.baseImageUrl}img/${item.preview}` : '',
							showVideo: false,
							thumbnailLoading: true,
						}));
					}
				} catch (e) { /* ignore */ }
			},

			async fetchQrCode() {
				try {
					const res = await u_getQrcodeImg({});
					if (res.statusCode === 200) this.qrCodeImage = res.content.img;
				} catch (e) { /* ignore */ }
			},

			async fetchShowInfo() {
				try {
					const res = await u_isShowInfo({});
					if (res.code === 1000) this.showInfoFlag = res.content;
				} catch (e) { /* ignore */ }
			},

			// ---------- 交互事件 ----------
			goHome() {
				uni.redirectTo({
					url: '/pages/index/index'
				});
			},

			goToLogin() {
				uni.navigateTo({
					url: '/pages/login/index'
				});
			},

			handleBannerClick(evt) {
				const {
					item = {}
				} = evt?.currentTarget?.dataset || {};
				const {
					fileType,
					path: localPath,
					img
				} = item;
				const targetPath = fileType === 1 ?
					localPath :
					`${this.baseImageUrl}img/${img || ''}`;
				const navigateUrl = fileType === 1 ?
					targetPath :
					`/pages/agreementWebView/agreementWebView?url=${encodeURIComponent(targetPath)}`;
				if (!navigateUrl) {
					uni.showToast({
						title: '跳转路径无效',
						icon: 'none'
					});
					return;
				}
				uni.navigateTo({
					url: navigateUrl
				});
			},

			updateBannerHeight(e) {
				const {
					width,
					height
				} = e.detail;
				if (!width || !height) return;
				const {
					windowWidth
				} = uni.getSystemInfoSync();
				this.bannerHeight = (height / width) * windowWidth;
			},

			handleZoneItemClick(e) {
				if (!this.userAccount) {
					uni.redirectTo({
						url: '/pages/login/index'
					});
					return;
				}
				const zone = e?.currentTarget?.dataset?.info || {};
				uni.setStorage({
					key: 'funAreaId',
					data: zone.id
				});
				if (zone.path) uni.navigateTo({
					url: `${zone.path}?name=${zone.multiName}`
				});
			},

			async openZoneSelector() {
				if (!this.userAccount) {
					uni.redirectTo({
						url: '/pages/login/index'
					});
					return;
				}
				try {
					const res = await u_leveOneMenu();
					this.zoneSelectList = res?.content || [];
					this.tempSelectedZoneIds = [...this.selectedZoneIds];
					this.showZonePopup = true;
				} catch (e) { /* ignore */ }
			},

			closeZoneSelector() {
				this.showZonePopup = false;
			},

			toggleZoneSelection(item) {
				const id = item.id;
				const index = this.tempSelectedZoneIds.indexOf(id);
				if (index > -1) {
					this.tempSelectedZoneIds.splice(index, 1);
				} else {
					this.tempSelectedZoneIds.push(id);
				}
			},

			isZoneSelected(id) {
				return this.tempSelectedZoneIds.includes(id);
			},

			async confirmZoneSelection() {
				if (!this.tempSelectedZoneIds.length) {
					return;
				}
				const response = await u_setHomeMenu({
					menuIds: this.tempSelectedZoneIds
				});
				if (response?.code == 1000) {
					this.fetchZoneList();
					this.closeZoneSelector();
				} else {
					uni.showToast({
						title: response.msg,
						icon: 'none'
					});
				}
			},

			switchTab(e) {
				const idx = e.currentTarget.dataset.index;
				const url = this.tabBarList[idx]?.pagePath;
				if (url) uni.navigateTo({
					url: `/${url}`
				});
			},

			// ---------- 缩略图加载事件 ----------
			handleThumbnailLoad(index) {
				this.guideVideoList[index].thumbnailLoading = false;
			},
			handleThumbnailError(index) {
				this.guideVideoList[index].thumbnailLoading = false;
			},

			// ---------- 【关键修复】暂停其他视频：直接操作原生 video 元素 ----------
			pauseOtherVideos(exceptIndex) {
				const players = this.$refs.domVideoPlayer;
				if (!players) return;
				// 确保是数组
				const list = Array.isArray(players) ? players : [players];
				list.forEach((player, idx) => {
					if (idx === exceptIndex || !player) return;
					// 尝试获取组件根元素下的 video 标签
					let videoEl = null;
					if (player.$el) {
						// 如果是 Vue 组件实例，通过 $el 查找 video
						videoEl = player.$el.querySelector?.('video') || player.$el;
					} else if (player.tagName && player.tagName.toLowerCase() === 'video') {
						// 如果本身就是 video 元素
						videoEl = player;
					}
					if (videoEl && typeof videoEl.pause === 'function') {
						try {
							videoEl.pause();
						} catch (e) {
							console.warn(`暂停视频 ${idx} 失败:`, e);
						}
					} else {
						// 降级：尝试调用组件的 pause 方法（如果存在）
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

			// ---------- 加载并播放视频 ----------
			loadAndPlayVideo(index) {
				const item = this.guideVideoList[index];
				if (!item) return;

				// 如果点击的是当前正在播放的视频，不重复操作
				if (this.currentPlayingIndex === index && item.showVideo) {
					return;
				}

				// 1. 立即暂停其他视频（并行执行，不阻塞）
				this.pauseOtherVideos(index);

				// 2. 更新当前播放索引
				this.currentPlayingIndex = index;

				// 3. 如果视频已加载，立即播放（同步执行）
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

				// 4. 首次加载：设置视频源，显示播放器
				item.thumbnailLoading = false;
				const realUrl = `${this.baseImageUrl}img/${item.filepath}`;
				this.$set(item, 'showVideo', true);
				this.$set(item, 'videoSrc', realUrl);

				// 等待 DOM 更新后立即播放
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

			// ---------- 视频播放事件（用户手动点击播放按钮） ----------
			onVideoPlay(playingIndex) {
				if (this._programmaticPlay) {
					return;
				}
				// 用户手动操作，暂停其他视频（不阻塞）
				if (this.currentPlayingIndex !== playingIndex) {
					this.pauseOtherVideos(playingIndex);
					this.currentPlayingIndex = playingIndex;
				}
			},
		},

		onLoad(options) {
			this.initSystemInfo();
			this.loadSelectedZoneIds();
			this.fetchBannerList();
			this.fetchTabBarList();
			this.fetchZoneList();
			this.fetchGuideVideoList();
			this.subtitleText = options?.subtitle || '';
			this.subtitleFontSize = options?.stfontSize || null;
		},

		onShow() {
			uni.removeStorageSync('funAreaId');
			this.loadLanguage();
			this.fetchShowInfo();
		},

		onReady() {
			this.loadUserAccount();
			this.fetchQrCode();
		},
	};
</script>

<style scoped>
	::-webkit-scrollbar {
		display: none;
	}

	.container {
		width: 100vw;
		min-height: 100vh;
		background: linear-gradient(145deg, #e3f2fd 0%, #81d4fa 80%, #81d4fa 100%);
		box-sizing: border-box;
		overflow: hidden;
	}

	.custom-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
		background: transparent;
		box-sizing: border-box;
	}

	.custom-header-outer-layer {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 20rpx;
	}

	.custom-header-outer-layer-image {
		width: 46rpx;
		height: 46rpx;
	}

	.custom-header-outer-layer-title {
		flex: 1;
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.custom-header-outer-layer_user_name {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.login-wrapper {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.custom-header-outer-layer_user_name text {
		font-size: 28rpx;
		color: #333;
	}

	.custom-header-outer-layer_user_name image {
		width: 26rpx;
		height: 26rpx;
	}

	.subtitle {
		margin-top: 6rpx;
		color: #666;
		width: 100%;
		font-size: 24rpx;
	}

	.content {
		position: fixed;
		left: 0;
		width: 100%;
		box-sizing: border-box;
		padding: 0 20rpx 30rpx;
		-webkit-overflow-scrolling: touch;
		transition: filter 0.3s ease;
	}

	.blur-content {
		filter: blur(8px);
		pointer-events: none;
	}

	.swiper-container {
		width: 100%;
		margin-top: 20rpx;
	}

	.banner-img {
		width: 100%;
		border-radius: 24rpx;
	}

	.special-zone-container {
		width: 100%;
		margin-top: 30rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		padding: 24rpx 24rpx 24rpx;
		box-sizing: border-box;
	}

	.zone-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.zone-header-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.blue-mark {
		display: block;
		width: 8rpx;
		height: 36rpx;
		background: linear-gradient(180deg, #4F7CFF, #6C5CE7);
		border-radius: 8rpx;
	}

	.zone-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1E293B;
	}

	.zone-more {
		font-size: 28rpx;
		color: #4F7CFF;
		font-weight: 500;
		padding: 8rpx 16rpx;
		transition: background 0.2s;
	}

	.zone-more:active {
		background: rgba(79, 124, 255, 0.2);
	}

	.special-zone {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		margin-bottom: 16rpx;
	}

	.special-zone:last-child {
		margin-bottom: 0;
	}

	.zone-item {
		width: 100%;
	}

	.zone-out {
		width: 100%;
		border-radius: 32rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16rpx;
		padding: 38rpx 24rpx;
		box-sizing: border-box;
		background: #FFFFFF;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		border: 1rpx solid rgba(0, 0, 0, 0.02) !important;
	}

	.zone-out:active {
		transform: scale(0.96);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.zone-img {
		width: 64rpx;
		height: 44rpx;
		flex-shrink: 0;
	}

	.zone-text-area {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}

	.zone-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #1E293B;
		line-height: 1.3;
	}

	.zone-desc {
		font-size: 20rpx;
		color: #64748B;
		line-height: 1.4;
		margin-top: 4rpx;
	}

	/* 视频列表样式 */
	.guide-wrapper {
		width: 100%;
		margin-top: 30rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		padding: 24rpx 24rpx 10rpx;
		box-sizing: border-box;
	}

	.guide-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.guide-header image {
		width: 12rpx;
		height: 32rpx;
		border-radius: 6rpx;
		background: #4F7CFF;
	}

	.guide-header text {
		font-size: 32rpx;
		font-weight: 700;
		color: #1E293B;
	}

	.guide-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		margin-top: 16rpx;
	}

	.guide-item {
		display: flex;
		flex-direction: column;
	}

	.video-wrapper {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 3;
		border-radius: 12rpx;
		overflow: hidden;
		background: #000;
	}

	.video-thumbnail {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
		background: #000;
		object-fit: cover;
	}

	.play-icon-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
		z-index: 2;
	}

	.play-icon {
		width: 80rpx;
		height: 80rpx;
		opacity: 0.9;
	}

	.guide-item video,
	.guide-item .dom-video-player {
		width: 100% !important;
		height: 100% !important;
		border-radius: 12rpx;
		background: #000;
		display: block;
	}

	.thumbnail-loading {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f0f0f0;
		z-index: 1;
		border-radius: 12rpx;
	}

	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 6rpx solid #e0e0e0;
		border-top: 6rpx solid #4F7CFF;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.guide-desc {
		font-size: 28rpx;
		color: #333;
		margin-top: 8rpx;
		line-height: 1.4;
		word-break: break-all;
	}

	.tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #81d4fa;
		box-shadow: -2rpx -2rpx 10rpx -10rpx #81d4fa;
		display: flex;
		align-items: center;
		justify-content: space-around;
		z-index: 99;
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

	/* 弹窗 */
	.popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 200;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.popup-panel {
		width: 100%;
		max-height: 75vh;
		background: #FFFFFF;
		border-radius: 32rpx 32rpx 0 0;
		padding: 30rpx 20rpx 20rpx;
		box-sizing: border-box;
		animation: slideUp 0.3s ease;
		display: flex;
		flex-direction: column;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 16rpx;
		flex-shrink: 0;
	}

	.popup-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1E293B;
	}

	.popup-close-btn {
		font-size: 40rpx;
		color: #999;
		padding: 10rpx;
	}

	.popup-list {
		max-height: 50vh;
		overflow-y: auto;
		flex: 1;
	}

	.popup-item {
		display: flex;
		align-items: center;
		padding: 20rpx 10rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.popup-item:active {
		background: #f8f8f8;
	}

	.popup-item-icon {
		width: 48rpx;
		height: 48rpx;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.popup-item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.popup-item-name {
		font-size: 30rpx;
		font-weight: 500;
		color: #1E293B;
	}

	.popup-item-desc {
		font-size: 24rpx;
		color: #94A3B8;
	}

	.popup-footer {
		display: flex;
		justify-content: space-between;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
		flex-shrink: 0;
		gap: 20rpx;
	}

	.popup-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 30rpx;
		border: none;
		text-align: center;
	}

	.popup-btn.cancel {
		background: #f5f5f5;
		color: #666;
	}

	.popup-btn.confirm {
		background: #4F7CFF;
		color: #fff;
	}

	.popup-btn:active {
		opacity: 0.8;
	}
</style>