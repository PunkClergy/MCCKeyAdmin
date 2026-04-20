<template>
	<view class="container" style="background: linear-gradient({{bgcolor}}, #fff)">
		<!-- 自定义头部 -->
		<view class="custom-header"
			style="padding-top: {{height_from_head}}px;padding-left: {{capsule_distance_to_the_right}}px; height: {{head_height}}px;">
			<view class="custom-header-outer-layer">
				<image class="custom-header-outer-layer-image" src="/static/QRCode_1400.png"
					@tap="handleBackHome"></image>
				<view class="custom-header-outer-layer-title">{{title_name}}</view>
				<view class="custom-header-outer-layer-user_name">
					<text v-if="account">{{account}}</text>
					<text v-else @tap="handleOnExistingAccountTap">请登录</text>
					<image v-else @tap="handleOnExistingAccountTap" src="/static/QRCode_1400.png" />
				</view>
			</view>
			<view style="font-size: {{stfontSize||11}}px;width: 98%;padding: 0 {{capsule_distance_to_the_right}}px;">
				{{subtitle}}
			</view>
		</view>

		<!-- 滚动内容 -->
		<scroll-view class="content" scroll-y="true" style="top: {{90}}px; bottom: {{tabBarHeight}}px;">
			<!-- 轮播图 -->
			<view class="swiper-container">
				<swiper indicator-dots="false" autoplay="true" interval="3000" duration="500"
					:style="`height: ${s_banner_height}px`">
					<swiper-item v-for="(item,index) in g_banner_image" :key="index">
						<image @tap="handleJumpInfo" :data-item="item"
							:src="c_link + '/img/' + (item.fileType==1?item.img:item.videoImg)" class="banner-img"
							mode="widthFix" data-flag="banner" @load="LoadOnUseGuideImageLoad" />
					</swiper-item>
				</swiper>
			</view>

			<!-- 公告 -->
			<view class="notice" v-if="isShowInfo">
				<view class="notice-outer-layer" @tap="handleNotice">
					<view class="notice-content">
						温馨提示：请提醒用车人，若遇无网络时，点击页面右上角「···」并刷新当前页面，即可进入【紧急开关锁】页面；<text>若需长时间处于无信号覆盖区域，建议随身携带实体钥匙备用。</text>
					</view>
				</view>
			</view>

			<!-- 专区入口 -->
			<view class="special-zone-container">
				<view class="special-zone" v-for="(item,index) in groupedZoneList" :key="index"
					:style="`--item-count: ${item.list.length}`">
					<view class="zone-item" v-for="(zoneItem,idx) in item.list" :key="idx">
						<view class="zone-out" :style="{backgroundColor: zoneItem.bgcolor}" :data-info="zoneItem"
							@tap="handleGetMenuList">
							<image class="zone-img" :src="'https://k1sw.wiselink.net.cn/img/' + zoneItem.icon" />
							<view class="zone-text-area">
								<view class="zone-name">{{zoneItem.name}}</view>
								<view class="zone-desc">{{zoneItem.bak}}</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 使用指南 -->
			<view class="full-width-swiper" v-if="fullBannerList.length>0">
				<view class="full-width-use">
					<image src="/static/QRCode_1400.png" />
					<text>使用指南</text>
				</view>
				<swiper indicator-dots="false" autoplay="true" interval="4000" duration="500"
					:style="`height: ${s_use_height}px`">
					<swiper-item v-for="(item,index) in fullBannerList" :key="index" :data-info="item">
						<image :src="'https://k1sw.wiselink.net.cn/img/' + item.imgpath" class="full-banner-img"
							data-flag="use" :data-url="item.bookPath" :data-title="item.title" @tap="handlePlayVideo"
							@load="LoadOnUseGuideImageLoad" mode="widthFix"></image>
					</swiper-item>
				</swiper>
			</view>
		</scroll-view>

		<!-- 底部tabbar -->
		<view class="tabbar" :style="`height: ${tabBarHeight}px`">
			<view class="tab-item" :class="currentTab === index ? 'active' : ''" v-for="(item,index) in tabList"
				:key="index" @tap="handleSwitchTabNavigation" :data-index="index">
				<image class="tab-icon" mode="widthFix"
					:src="'https://k1sw.wiselink.net.cn/img/' + item.selectedIconPath" v-if="currentTab === index" />
				<image class="tab-icon" mode="widthFix" :src="'https://k1sw.wiselink.net.cn/img/' + item.iconPath"
					v-else />
				<text>{{item.text}}</text>
			</view>
		</view>

		<!-- 悬浮按钮 -->
		<view class="float-button">
			<button open-type="contact" class="hidden-contact-btn"></button>
			<image src="https://k1sw.wiselink.net.cn/img/app2.0/desk/consulting.png" />
			<image src="/static/QRCode_1400.png" style="width: 80rpx;height: 80rpx;"
				@tap="handleMakePhoneCallWithConfirm" />
		</view>

		<!-- 二维码弹窗 -->
		<view class="qr-group-container" v-if="join_the_group_modal">
			<view class="qr-group-mask" @tap="handleQRClose">
				<view class="qr-group-close" @tap="handleQRClose">×</view>
				<view class="qr-group-preview-content">
					<image catchtap="handleQRShowImageMask" class="qr-group-preview-img" :src="personal_qr_code"
						mode="widthFix"></image>
					<text class="qr-group-preview-desc">请点击、长按添加官方客服，获取体验权限！</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_getHomeArea,


		u_bannerlist20,
		u_getQrcodeImg,
		u_navlist20,
		u_booklist
		
	} from '@/api/index'


	export default {
		data() {
			return {
				tabBarHeight: 80,
				currentTab: 0,
				c_link: 'https://k1sw.wiselink.net.cn/',
				g_banner_image: [],
				s_banner_height: '',
				join_the_group_modal: false,
				fullBannerList: [],
				title_name: '',
				bgcolor: '#fff',
				height_from_head: '',
				zoneList: [{
					id: 1,
					name: '钥匙分享',
					bgcolor: '#EFF1FC',
					icon: 'privateCar.png'
				}, ],
				tabList: [],
				isShowInfo: false,
				servicePhone: '400-090-5050',
				head_height: '',
				capsule_distance_to_the_right: '',
				s_background_picture_of_the_front_page: '',
				personal_qr_code: '',
				groupedZoneList: [],
				account: '',
				subtitle: '',
				stfontSize: '',
				s_use_height: ''
			}
		},
		methods: {
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
				const targetPath = fileType === 1 ?
					localPath :
					`${IMG_BASE_URL}${img || ''}`;
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
					url: navigateUrl,
					fail: (err) => {
						console.error('页面跳转失败:', err);
						uni.showToast({
							title: '跳转失败，请重试',
							icon: 'none'
						});
					}
				});
			},
			handleMakePhoneCallWithConfirm() {
				uni.showModal({
					title: '拨打电话',
					content: `是否拨打客服电话：${this.servicePhone}`,
					confirmText: '拨打',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.makePhoneCall({
								phoneNumber: this.servicePhone,
								fail(err) {
									if (err.errMsg !== 'makePhoneCall:fail cancel') {
										uni.showToast({
											title: '拨号失败，请稍后重试',
											icon: 'none'
										});
									}
								}
							});
						}
					}
				});
			},
			handleOnExistingAccountTap() {
				uni.navigateTo({
					url: '/pages/system/managerLoginView/loginView'
				})
			},
			initSystemInfo() {
				const {
					statusBarHeight: s
				} = uni.getWindowInfo()
				const m = uni.getMenuButtonBoundingClientRect()
				if (!m) return
				const n = m.height + (m.top - s) * 2
				const c = uni.getWindowInfo().screenWidth - m.right
				this.height_from_head = s
				this.head_height = s + n
				this.capsule_distance_to_the_right = c
			},
			initialiImageBaseConversion() {
				const list = [{
					path: "/static/images/index/bg.png",
					key: "s_background_picture_of_the_front_page"
				}];
				const fs = uni.getFileSystemManager();
				Promise.all(list.map(item => new Promise(resolve => {
					fs.readFile({
						filePath: item.path,
						encoding: 'base64',
						success: d => resolve({
							[item.key]: `data:image/png;base64,${d.data}`
						})
					})
				}))).then(res => {
					if (res[0]) this.s_background_picture_of_the_front_page = res[0]
						.s_background_picture_of_the_front_page
				});
			},
			async initialGetBanner() {
				try {
					const d = await byGet(`${this.c_link}${u_bannerlist20.URL}`, {
						terminalId: 0
					});
					if (d?.data?.content) this.g_banner_image = d.data.content
				} catch (e) {
					console.error(e)
				}
			},
			initLoginStatus() {
				uni.getStorage({
					key: 'userKey',
					success: res => {
						this.account = res?.data?.companyName || res?.data?.username
					},
					fail: err => console.error("获取失败", err)
				});
			},
			async initQrCode() {
				const res = await byGet(this.c_link + u_getQrcodeImg.URL, {})
				if (res.statusCode === 200) this.personal_qr_code = res.data.content.img
			},
			async initBottomDirectory() {
				const res = await byGet(this.c_link + u_navlist20.URL, {})
				if (res.statusCode === 200) this.tabList = res.data.content
			},
			async initZoneInfo() {
				const res = await byGet(this.c_link + u_getHomeArea.URL, {})
				if (res.statusCode === 200) {
					this.zoneList = res.data.content
					this.groupZoneByXu()
				}
			},
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
			async initBookList() {
				const res = await byGet(this.c_link + u_booklist.URL, {})
				if (res.statusCode === 200) this.fullBannerList = res.data.content
			},
			LoadOnUseGuideImageLoad(e) {
				try {
					const {
						width: w,
						height: h
					} = e.detail
					if (!w || !h) return
					const {
						windowWidth
					} = uni.getSystemInfoSync()
					const hh = h / w * windowWidth
					const f = e.currentTarget.dataset.flag
					if (f === 'use') this.s_use_height = hh
					if (f === 'banner') this.s_banner_height = hh
				} catch (e) {
					console.error('imgLoadErr', e)
				}
			},
			handlePlayVideo(e) {
				const {
					url,
					title
				} = e.currentTarget.dataset
				if (url) {
					uni.navigateTo({
						url: `/pages/watchVideos/index?url=${encodeURI(url)}&title=${title || '使用指南'}`
					})
				}
			},
			async inIsShowInfo() {
				const res = await byGet(this.c_link + u_isShowInfo.URL, {})
				if (res.statusCode === 200) this.isShowInfo = res.data.content
			},
			handleShowContact() {
				this.join_the_group_modal = true
			},
			handleQRClose() {
				this.join_the_group_modal = false
			},
			handleQRShowImageMask() {
				uni.previewMedia({
					sources: [{
						url: this.personal_qr_code,
						type: 'image'
					}]
				})
			},
			handleSwitchTabNavigation(e) {
				const idx = e.currentTarget.dataset.index
				const url = this.tabList[idx]?.pagePath
				if (!url) return
				const cur = getCurrentPages().at(-1)?.route
				if (cur && cur !== url.split('?')[0]) uni.redirectTo({
					url: `/${url}`
				})
			},
			handleBackHome() {
				uni.redirectTo({
					url: '/pages/index/index'
				})
			},
			handleGetMenuList(e) {
				if (!isLogin()) return uni.redirectTo({
					url: '/pages/system/managerLoginView/loginView'
				})
				const path = e.currentTarget.dataset.info?.path
				if (/desk/.test(path)) {
					uni.switchTab({
						url: path
					})
				} else {
					uni.navigateTo({
						url: `/${path}`
					})
				}
			},
			handleNotice() {},
			async initGetHomeArea() {
				const ReturnData = await u_getHomeArea({});
				console.log(ReturnData)
			}
		},
		onLoad(options) {
			this.initGetHomeArea()
			return
			this.initialiImageBaseConversion()
			this.initialGetBanner()
			this.initBottomDirectory()
			this.initZoneInfo()
			this.initBookList()

			this.title_name = options?.name
			this.bgcolor = options?.bgcolor
			this.subtitle = options?.subtitle
			this.stfontSize = options?.stfontSize

			uni.setStorageSync('cacheFields', {
				title_name: this.title_name,
				bgcolor: this.bgcolor,
				subtitle: this.subtitle,
				stfontSize: this.stfontSize
			})
		},
		onShow() {
			this.initSystemInfo()
			this.inIsShowInfo()
			try {
				const cache = uni.getStorageSync('cacheFields') || {}
				Object.assign(this, cache)
			} catch (e) {
				console.error(e)
			}
		},
		onReady() {
			this.initLoginStatus()
			this.initQrCode()
		}
	}
</script>

<style scoped>
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
	}

	.custom-header {
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.custom-header-outer-layer {
		display: flex;
		justify-content: flex-start;
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
		color: #333;
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
		color: #333;
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

	.swiper-container {
		width: 100%;
		padding: 0 10rpx;
		box-sizing: border-box;
	}

	.banner-img {
		width: 100%;
		height: auto;
		border-radius: 20rpx;
	}

	.special-zone-container {
		width: 100%;
		box-sizing: border-box;
		padding: 0 10rpx;
		margin-top: 20rpx;
	}

	.special-zone {
		width: 100%;
		display: flex;
		flex-wrap: nowrap;
		align-items: flex-start;
		box-sizing: border-box;
		margin-bottom: 20rpx;
		gap: 5rpx;
	}

	.zone-item {
		width: calc((100% - (max(var(--item-count, 3), 3) - 1) * 5rpx) / max(var(--item-count, 3), 3));
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
	}

	.zone-out {
		width: 100%;
		height: calc(180rpx - clamp(0rpx, (var(--item-count, 3) - 3) * 30rpx, 80rpx));
		min-height: 100rpx;
		border-radius: 32rpx;
		margin-bottom: 10rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 15rpx;
		box-sizing: border-box;
		padding: 0 10rpx;
		border: 1rpx solid #f1f1f1;
	}

	.zone-img {
		width: calc(50rpx - clamp(0rpx, (var(--item-count, 3) - 3) * 8rpx, 20rpx));
		height: calc(50rpx - clamp(0rpx, (var(--item-count, 3) - 3) * 8rpx, 20rpx));
		object-fit: contain;
		flex-shrink: 0;
	}

	.zone-text-area {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.zone-name {
		font-weight: bold;
		font-size: calc(24rpx - clamp(0rpx, (var(--item-count, 3) - 3) * 3rpx, 8rpx));
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
	}

	.zone-desc {
		font-size: calc(20rpx - clamp(0rpx, (var(--item-count, 3) - 3) * 3rpx, 6rpx));
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
	}

	.full-width-swiper {
		width: 100%;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.full-width-use {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.full-width-use image {
		width: 13rpx;
		height: 34rpx;
		background: linear-gradient(-45deg, #8C94FD, #B5D6FF, #2964B8, #8FB6F6);
		box-shadow: 0rpx 5rpx 5rpx 0rpx rgba(178, 195, 221, 0.5);
		border-radius: 6rpx;
		opacity: 0.8;
	}

	.full-width-use text {
		font-weight: bold;
		font-size: 32rpx;
		color: #333;
	}

	.full-banner-img {
		width: 100%;
		height: 200rpx;
		border-radius: 20rpx;
	}

	.tabbar {
		width: 100%;
		background-color: #fff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		position: fixed;
		bottom: 0;
		left: 0;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		z-index: 100;
		box-sizing: border-box;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 25%;
	}

	.tab-icon {
		width: 50rpx;
		height: 50rpx;
		margin-bottom: 10rpx;
	}

	.tab-item text {
		font-size: 24rpx;
		color: #999;
	}

	.tab-item.active text {
		color: #3498db;
	}

	.float-button {
		position: fixed;
		right: 20rpx;
		top: 75%;
		transform: translateY(-50%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
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

	.notice {
		width: 98%;
		background-color: #EFF1FC;
		display: flex;
		align-items: center;
		margin: 30rpx auto;
		border-radius: 20rpx;
	}

	.notice-outer-layer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 95%;
		margin: auto;
	}

	.notice-content {
		font-size: 22rpx;
		color: #504F4F;
		line-height: 35rpx;
		padding: 15rpx 5rpx;
	}
</style>