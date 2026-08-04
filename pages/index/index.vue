<template>
	<view class="container">
		<view class="custom-header" :style="headerStyle">
			<view class="custom-header-outer-layer">
				<image class="custom-header-outer-layer-image" src="/static/images/logo.png" @tap="handleBackHome">
				</image>
				<view class="custom-header-outer-layer-title">WiseLink Auto Global</view>
				<view class="custom-header-outer-layer_user_name">
					<text v-if="account">{{ account }}</text>
					<view v-else @tap="handleOnExistingAccountTap" class="login-wrapper">
						<text>{{ tips.PleaseLogin[lang] }}</text>
						<image src="/static/images/right_1.png" />
					</view>
				</view>
			</view>
			<view class="subtitle" :style="{ fontSize: (stfontSize || 11) + 'px' }">
				{{ subtitle }}
			</view>
		</view>
		<scroll-view class="content" scroll-y :style="contentStyle">
			<!-- ====== 轮播图 ====== -->
			<view class="swiper-container">
				<swiper indicator-dots="false" autoplay interval="3000" duration="500"
					:style="{ height: s_banner_height + 'px' }">
					<!-- 遍历 banners 数据，图片地址由 fileType 决定（直接图片或视频封面） -->
					<swiper-item v-for="(item, index) in g_banner_image" :key="index">
						<image @tap="handleJumpInfo" :data-item="item"
							:src="c_link + '/img/' + (item.fileType == 1 ? item.img : item.videoImg)" class="banner-img"
							mode="widthFix" data-flag="banner" @load="LoadOnUseGuideImageLoad" />
					</swiper-item>
				</swiper>
			</view>

			<!-- ====== 功能专区（卡片样式，与使用指南视觉统一） ====== -->
			<view class="special-zone-container">
				<!-- 区块头部：蓝色装饰条 + 标题 -->
				<view class="zone-header">
					<view class="zone-header-left">
						<view class="blue-mark"></view>
						<text class="zone-title">功能专区</text>
					</view>
					<view class="zone-more">更多专区</view>
				</view>
				<!-- 功能项列表：按 serial_number 分组，每行两个 -->
				<view class="special-zone" v-for="(item, index) in groupedZoneList" :key="index">
					<view class="zone-item" v-for="(zoneItem, idx) in item.list" :key="idx">
						<view class="zone-out"
							:style="{ backgroundColor: zoneItem.bgcolor, border: zoneItem.namezhCn ? '1rpx solid #f0f0f0' : 'none' }"
							:data-info="zoneItem" @tap="handleGetMenuList">
							<!-- 功能图标 -->
							<image class="zone-img" :src="'https://k1sw.wiselink.net.cn/img/' + zoneItem.icon" />
							<!-- 功能名称和描述（多语言支持） -->
							<view class="zone-text-area">
								<view class="zone-name">{{ zoneItem['name' + lang] }}</view>
								<view class="zone-desc">{{ zoneItem['subtitle' + lang] }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="guide-wrapper" v-if="fullBannerList.length > 0">
				<!-- 卡片头部：蓝色装饰图标 + “使用指南”文本（多语言） -->
				<view class="guide-header">
					<image src="/static/images/useGuideIcon.png" />
					<text>{{ tips.UserGuide[lang] }}</text>
				</view>

				<!-- 循环渲染每一个视频项 -->
				<view class="guide-item" v-for="(item, index) in fullBannerList" :key="index">
					<!-- 添加 controls 属性以提供播放控制条 -->
					<video :src="item.videoUrl || ''" style="width: 100%;" controls></video>
					<!-- 视频描述：假设字段为 title 或 desc，根据实际接口结构调整 -->
					<view class="guide-desc">{{ item.title || item.desc || '视频说明' }}</view>
				</view>
			</view>
		</scroll-view>

		<!-- ============================================================
			底部 TabBar（固定定位）
			从接口获取菜单列表，高亮当前选中项，点击切换页面
		============================================================ -->
		<view class="tabbar" :style="{ height: tabBarHeight + 'px' }">
			<view class="tab-item" :class="currentTab === index ? 'active' : ''" v-for="(item, index) in tabList"
				:key="index" @tap="handleSwitchTabNavigation" :data-index="index">
				<!-- 选中/未选中状态显示不同图标 -->
				<image class="tab-icon" mode="widthFix"
					:src="'https://k1sw.wiselink.net.cn/img/' + item.selectedIconPath" v-if="currentTab === index" />
				<image class="tab-icon" mode="widthFix" :src="'https://k1sw.wiselink.net.cn/img/' + item.iconPath"
					v-else />
				<text>{{ item['text' + lang] }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	// ================================================================
	// 导入依赖：polyfill、API 接口、多语言提示词
	// ================================================================
	import 'url-search-params-polyfill';
	import {
		u_getHomeArea, // 获取功能专区数据
		u_bannerlist20, // 获取轮播图
		u_getQrcodeImg, // 获取个人二维码（暂时未使用）
		u_navlist20, // 获取底部导航菜单
		u_booklist, // 获取使用指南列表
		u_isShowInfo // 获取信息展示开关（未完全使用）
	} from '@/api/index'
	import {
		tips
	} from '@/utils/langtips.js'

	export default {
		data() {
			return {
				// -------- UI 相关 --------
				tabBarHeight: 80, // 底部 tabBar 高度（px）
				currentTab: 0, // 当前选中的 tab 索引
				c_link: 'https://k1sw.wiselink.net.cn/', // 图片资源基础 URL

				// -------- 轮播图 --------
				g_banner_image: [], // 轮播图数据列表
				s_banner_height: '', // 轮播图动态计算的高度（根据图片宽高比）

				// -------- 使用指南 --------
				fullBannerList: [], // 使用指南视频列表

				// -------- 头部适配 --------
				bgcolor: '#fff', // 背景色（暂未使用）
				height_from_head: 30, // 状态栏高度
				head_height: 88, // 整个头部高度（状态栏+标题栏）
				capsule_distance_to_the_right: 15, // 胶囊按钮右侧间距（用于适配不同机型）

				// -------- 功能专区 --------
				zoneList: [], // 原始功能列表（从接口获取）
				groupedZoneList: [], // 按 serial_number 分组后的功能列表

				// -------- 底部导航 --------
				tabList: [], // 菜单列表

				// -------- 其他 --------
				servicePhone: '400-090-5050', // 客服电话（暂未用）
				personal_qr_code: '', // 个人二维码（暂未用）
				account: '', // 当前登录用户名/公司名
				subtitle: '', // 副标题（来自路由参数）
				stfontSize: '', // 副标题字体大小（来自路由参数）
				tips: tips, // 多语言提示词对象
				lang: 'zhCn', // 当前语言，默认中文
				isShowInfo: null // 信息展示开关（从接口获取）
			}
		},
		computed: {
			/**
			 * 头部样式：动态计算内边距和高度
			 * 使用 initSystemInfo 中获取的状态栏高度和胶囊按钮位置
			 */
			headerStyle() {
				return {
					paddingTop: this.height_from_head + 'px',
					paddingLeft: this.capsule_distance_to_the_right + 'px',
					paddingRight: this.capsule_distance_to_the_right + 'px',
					height: this.head_height + 'px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center'
				}
			},
			/**
			 * 内容区域样式：根据头部和底部高度定位
			 */
			contentStyle() {
				return {
					top: this.head_height + 'px',
					bottom: this.tabBarHeight + 'px'
				}
			}
		},
		methods: {
			// ---------- 系统信息初始化 ----------
			/**
			 * 获取状态栏高度和胶囊按钮位置，计算头部高度和边距
			 * 用于适配刘海屏等异形屏
			 */
			initSystemInfo() {
				try {
					const {
						statusBarHeight,
						screenWidth
					} = uni.getWindowInfo()
					const menu = uni.getMenuButtonBoundingClientRect()
					if (!menu) return
					const headerHeight = menu.height + (menu.top - statusBarHeight) * 2
					const rightPadding = screenWidth - menu.right
					this.height_from_head = statusBarHeight
					this.head_height = statusBarHeight + headerHeight
					this.capsule_distance_to_the_right = rightPadding
				} catch (e) {
					console.log('获取状态栏信息失败')
				}
			},

			// ---------- 轮播图点击跳转 ----------
			/**
			 * 点击轮播图跳转：若 fileType==1 直接跳转本地路径，否则跳转 webView 显示图片
			 * @param {Event} evt - 点击事件对象，携带 item 数据
			 */
			handleJumpInfo(evt) {
				const {
					item = {}
				} = evt?.currentTarget?.dataset || {};
				const {
					fileType,
					path: localPath,
					img
				} = item;
				const IMG_BASE_URL = 'https://k3a.wiselink.net.cn/img/';
				const targetPath = fileType === 1 ? localPath : `${IMG_BASE_URL}${img || ''}`;
				const navigateUrl = fileType === 1 ? targetPath :
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

			// ---------- 拨打电话（暂未使用） ----------
			handleMakePhoneCallWithConfirm() {
				uni.showModal({
					title: '拨打电话',
					content: `是否拨打客服电话：${this.servicePhone}`,
					success: (res) => {
						if (res.confirm) uni.makePhoneCall({
							phoneNumber: this.servicePhone
						});
					}
				});
			},

			// ---------- 未登录点击跳转登录 ----------
			handleOnExistingAccountTap() {
				uni.navigateTo({
					url: '/pages/login/index'
				})
			},

			// ---------- 数据获取 ----------
			/**
			 * 获取轮播图数据
			 */
			async initialGetBanner() {
				try {
					const d = await u_bannerlist20({
						terminalId: 0
					});
					if (d?.content) this.g_banner_image = d.content
				} catch (e) {}
			},

			/**
			 * 从本地存储读取用户信息，显示用户名
			 */
			initLoginStatus() {
				uni.getStorage({
					key: 'user_info',
					success: res => {
						this.account = res?.data?.companyName || res?.data?.username
					}
				});
			},

			/**
			 * 获取个人二维码（暂未使用）
			 */
			async initQrCode() {
				try {
					const res = await u_getQrcodeImg({})
					if (res.statusCode === 200) this.personal_qr_code = res.content.img
				} catch (e) {}
			},

			/**
			 * 获取底部导航菜单
			 */
			async initBottomDirectory() {
				try {
					const res = await u_navlist20({})
					if (res.code === 1000) this.tabList = res.content
				} catch (e) {}
			},

			/**
			 * 获取功能专区列表，并分组
			 */
			async initZoneInfo() {
				try {
					const ReturnData = await u_getHomeArea({});
					if (ReturnData.code === 1000) {
						this.zoneList = ReturnData.content;
						this.groupZoneByXu()
					}
				} catch (e) {}
			},

			/**
			 * 将功能列表按 serial_number 分组
			 * 每组显示为一行两个
			 */
			groupZoneByXu() {
				const map = {}
				this.zoneList.forEach(item => {
					const k = item.serial_number || 1
					if (!map[k]) map[k] = []
					map[k].push(item)
				})
				this.groupedZoneList = Object.keys(map).sort((a, b) => a - b).map(k => ({
					serial_number: +k,
					list: map[k]
				}))
			},

			/**
			 * 获取使用指南列表
			 */
			async initBookList() {
				try {
					const res = await u_booklist({})
					if (res.code === 1000) this.fullBannerList = res.content
				} catch (e) {}
			},

			// ---------- 图片加载完成回调 ----------
			/**
			 * 轮播图或使用指南图片加载完成后，根据宽高比计算高度
			 * 使轮播图自适应屏幕宽度
			 * @param {Event} e - 图片加载事件
			 */
			LoadOnUseGuideImageLoad(e) {
				try {
					const {
						width,
						height
					} = e.detail
					if (!width || !height) return
					const {
						windowWidth
					} = uni.getSystemInfoSync()
					const h = height / width * windowWidth
					const f = e.currentTarget.dataset.flag
					if (f === 'banner') this.s_banner_height = h
				} catch (e) {}
			},

			/**
			 * 获取信息展示开关（暂未完全使用）
			 */
			async inIsShowInfo() {
				try {
					const res = await u_isShowInfo({})
					if (res.code === 1000) this.isShowInfo = res.content
				} catch (e) {}
			},

			// ---------- 导航切换 ----------
			/**
			 * 底部 Tab 点击切换：根据索引跳转到对应页面
			 * @param {Event} e - 点击事件
			 */
			handleSwitchTabNavigation(e) {
				const idx = e.currentTarget.dataset.index
				const url = this.tabList[idx]?.pagePath
				if (url) uni.redirectTo({
					url: `/${url}`
				})
			},

			/**
			 * Logo 点击返回首页
			 */
			handleBackHome() {
				uni.redirectTo({
					url: '/pages/index/index'
				})
			},

			/**
			 * 功能专区点击处理：若已登录则跳转，否则跳转登录
			 * @param {Event} e - 点击事件，携带功能区 id 和路径
			 */
			handleGetMenuList(e) {
				if (this.account) {
					// 存储功能区 id 供后续页面使用
					uni.setStorage({
						key: 'funAreaId',
						data: e?.currentTarget?.dataset?.info?.id,
					})
					const path = e.currentTarget.dataset.info?.path
					uni.navigateTo({
						url: `${path}`
					})
				} else {
					uni.redirectTo({
						url: '/pages/login/index'
					})
				}
			},
		},

		// ---------- 生命周期 ----------
		onLoad(options) {
			// 初始化 UI 适配
			this.initSystemInfo()
			// 加载各模块数据
			this.initialGetBanner()
			this.initBottomDirectory()
			this.initZoneInfo()
			this.initBookList()
			// 从路由参数获取副标题和字体大小
			this.subtitle = options?.subtitle
			this.stfontSize = options?.stfontSize
		},

		/**
		 * 页面显示时：清除缓存的功能区 id，获取信息展示开关，
		 * 并根据系统语言设置当前语言（优先使用缓存）
		 */
		onShow() {
			uni.removeStorageSync('funAreaId');
			this.inIsShowInfo()
			const cacheLang = uni.getStorageSync('language')
			if (cacheLang) {
				this.lang = cacheLang
				return
			}
			// 无缓存时根据平台设置默认语言
			const systemInfo = uni.getSystemInfoSync()
			const platform = systemInfo.platform
			if (platform === 'ios') {
				this.lang = 'zhCn'
				uni.setStorageSync('language', 'zhCn')
			} else {
				const language = systemInfo.language
				const [prefix, suffix] = language.split(/[-_]/)
				const processedSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase()
				this.lang = prefix.toLowerCase() + processedSuffix
				uni.setStorageSync('language', this.lang)
			}
		},

		/**
		 * 页面渲染完成：读取用户登录状态和二维码
		 */
		onReady() {
			this.initLoginStatus()
			this.initQrCode()
		}
	}
</script>

<style scoped>
	/* ================================================================
	       全局样式重置：隐藏滚动条
	       ================================================================ */
	::-webkit-scrollbar {
		display: none;
	}

	/* ================================================================
	       页面容器：全屏，浅蓝色背景，防止溢出
	       ================================================================ */
	.container {
		width: 100vw;
		min-height: 100vh;
		background: #ADD8E6;
		box-sizing: border-box;
		overflow: hidden;
	}

	/* ================================================================
	       自定义头部（完全原始样式，无额外美化）
	       固定定位，透明背景，内容由 JS 动态控制
	       ================================================================ */
	.custom-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
		background: transparent;
		box-sizing: border-box;
	}

	/* 头部外层：flex 水平布局，间距 20rpx */
	.custom-header-outer-layer {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 20rpx;
	}

	/* Logo 图标尺寸 */
	.custom-header-outer-layer-image {
		width: 46rpx;
		height: 46rpx;
	}

	/* 标题：占据剩余空间，加粗 */
	.custom-header-outer-layer-title {
		flex: 1;
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	/* 用户名区域：水平排列 */
	.custom-header-outer-layer_user_name {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	/* 未登录时的“请登录”包装器 */
	.login-wrapper {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	/* 用户名或“请登录”文字样式 */
	.custom-header-outer-layer_user_name text {
		font-size: 28rpx;
		color: #333;
	}

	/* 右侧箭头图标 */
	.custom-header-outer-layer_user_name image {
		width: 26rpx;
		height: 26rpx;
	}

	/* 副标题：位于头部下方，颜色略浅 */
	.subtitle {
		margin-top: 6rpx;
		color: #666;
		width: 100%;
		font-size: 24rpx;
	}

	/* ================================================================
	       内容区域（滚动）：
	       固定定位，避开头部和底部，内边距保持内容与边缘距离
	       ================================================================ */
	.content {
		position: fixed;
		left: 0;
		width: 100%;
		box-sizing: border-box;
		padding: 0 20rpx 30rpx;
		-webkit-overflow-scrolling: touch;
	}

	/* ================================================================
	       轮播图容器：与顶部有间距
	       ================================================================ */
	.swiper-container {
		width: 100%;
		margin-top: 20rpx;
	}

	/* 轮播图片：宽度100%，圆角 */
	.banner-img {
		width: 100%;
		border-radius: 24rpx;
	}

	/* ================================================================
	       功能专区 — 卡片样式（白色背景，圆角，阴影）
	       ================================================================ */
	.special-zone-container {
		width: 100%;
		margin-top: 30rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		padding: 24rpx 24rpx 24rpx;
		box-sizing: border-box;
	}

	/* 区域头部：标题 + 蓝色装饰条 */
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

	/* 蓝色装饰条（渐变） */
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

	/* 功能网格：每行两列，间距 20rpx */
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

	/* 每个功能项卡片：圆角，flex 水平排列，带背景色或边框 */
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

	/* 点击反馈：轻微缩放和阴影变化 */
	.zone-out:active {
		transform: scale(0.96);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	/* 功能图标 */
	.zone-img {
		width: 64rpx;
		height: 44rpx;
		flex-shrink: 0;
	}

	/* 文字区域：垂直排列，左对齐 */
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
		font-size: 22rpx;
		color: #64748B;
		line-height: 1.4;
		margin-top: 4rpx;
	}

	/* ================================================================
	       使用指南大卡片（与功能专区风格一致）
	       头部被提取到外层，内容循环渲染
	       ================================================================ */
	.guide-wrapper {
		width: 100%;
		margin-top: 30rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		padding: 24rpx 24rpx 10rpx;
		box-sizing: border-box;
	}

	/* 卡片头部：蓝色装饰条 + 标题 */
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

	/* 每个视频项 */
	.guide-item {
		margin-bottom: 24rpx;
	}

	.guide-item:last-child {
		margin-bottom: 0;
	}

	/* 视频描述文字 */
	.guide-desc {
		font-size: 30rpx;
		color: #333;
		margin-top: 12rpx;
	}

	/* ================================================================
	       底部 TabBar：固定底部，水平均匀分布
	       ================================================================ */
	.tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #ADD8E6;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.08);
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
		width: 46rpx;
		height: 46rpx;
	}

	/* 默认文字颜色为灰色 */
	.tab-item text {
		font-size: 22rpx;
		color: #999;
	}

	/* 选中状态文字颜色为蓝色 */
	.tab-item.active text {
		color: #3498db;
	}
</style>