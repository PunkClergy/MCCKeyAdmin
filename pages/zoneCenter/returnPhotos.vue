<template>
	<view class="page-root">
		<image class="bg-img" src="/static/images/background.jpg"></image>
		<!-- <view class="status-safe-bar" :style="{ height: statusBarHeight + 'px' }"></view> -->
		<view class="container">
			<view class="page_title">{{tips.ClickUploadPhoto[lang]}}</view>
			<scroll-view scroll-y :style="{ height: showHeight + 'px', marginTop: '20rpx' }" :scroll-y="canScroll">
				<button id="1" :style="{ 
            height: (750 - 2 * leftGap) / 1.6 + 'rpx', 
            width: 750 - 2 * leftGap + 'rpx', 
            lineHeight: (750 - 2 * leftGap) / 1.6 + 'rpx' 
          }" class="info-btn1" hover-class="btn_tapcolor" @tap="inputCardBtnTap">
					<image class="arrow" mode="aspectFill" :src="firstTempFilePaths[0] || ''"></image>
					<text>{{tips.FrontPhoto[lang]}}</text>
				</button>
				<button id="2" :style="{ 
            height: (750 - 2 * leftGap) / 1.6 + 'rpx', 
            width: 750 - 2 * leftGap + 'rpx', 
            lineHeight: (750 - 2 * leftGap) / 1.6 + 'rpx' 
          }" class="info-btn" hover-class="btn_tapcolor" @tap="inputCardBtnTap">
					<text>{{tips.RearPhoto[lang]}}</text>
					<image class="arrow" mode="aspectFill" :src="secondTempFilePaths[0] || ''"></image>
				</button>
				<button id="3" :style="{ 
            height: (750 - 2 * leftGap) / 1.6 + 'rpx', 
            width: 750 - 2 * leftGap + 'rpx', 
            lineHeight: (750 - 2 * leftGap) / 1.6 + 'rpx' 
          }" class="info-btn" hover-class="btn_tapcolor" @tap="inputCardBtnTap">
					<text>{{tips.LeftSidePhoto[lang]}}</text>
					<image class="arrow" mode="aspectFill" :src="thirdTempFilePaths[0] || ''"></image>
				</button>
				<button id="4" :style="{ 
            height: (750 - 2 * leftGap) / 1.6 + 'rpx', 
            width: 750 - 2 * leftGap + 'rpx', 
            lineHeight: (750 - 2 * leftGap) / 1.6 + 'rpx' 
          }" class="info-btn" hover-class="btn_tapcolor" @tap="inputCardBtnTap">
					<text>{{tips.RightSidePhoto[lang]}}</text>
					<image class="arrow" mode="aspectFill" :src="fourthTempFilePaths[0] || ''"></image>
				</button>
				<button id="5" :style="{ 
            height: (750 - 2 * leftGap) / 1.6 + 'rpx', 
            width: 750 - 2 * leftGap + 'rpx', 
            lineHeight: (750 - 2 * leftGap) / 1.6 + 'rpx' 
          }" class="info-btn" hover-class="btn_tapcolor" @tap="inputCardBtnTap">
					<text>{{tips.KeyPositionPhoto[lang]}}</text>
					<image class="arrow" mode="aspectFill" :src="fifthTempFilePaths[0] || ''"></image>
				</button>
			</scroll-view>
			<button class="submit_btn" :style="{ bottom: (safeBottom + 10) + 'px' }" hover-class="btn_tapcolor"
				@tap="submitBtnTap">
				{{tips.SubmitAndFinish[lang]}}
			</button>
		</view>
	</view>
</template>
<script>
	import { tips } from '@/utils/langtips.js'
	import { titles } from '@/utils/langtitle.js'
	export default {
		name: 'UploadPhoto',
		data() {
			return {
				tips: tips,
				lang: 'zhCn',
				showHeight: 0,
				cardWidth: 0,
				showPhoneHeight: 0,
				showPhoneWidth: 0,
				canScroll: true,
				firstTempFilePaths: [],
				secondTempFilePaths: [],
				thirdTempFilePaths: [],
				fourthTempFilePaths: [],
				fifthTempFilePaths: [],
				leftGap: 40,
				uploadTask: null,
				code: '',
				showType: 0,
				currentViewType: 0,
				currentCardType: 0,
				statusBarHeight: 0,
				safeBottom: 0
			};
		},
		onReady() {
			// 获取系统信息
			uni.getSystemInfo({
				success: (res) => {
					this.statusBarHeight = res.statusBarHeight || 0;
					this.safeBottom = res.safeAreaInsets && typeof res.safeAreaInsets.bottom === 'number' ? res
						.safeAreaInsets.bottom : 0;
					// #ifdef APP-PLUS
					if (typeof plus !== 'undefined') {
						plus.navigator.setStatusBarStyle('light');
						plus.navigator.setStatusBarBackground('#000000');
					}
					// #endif
					this.showPhoneHeight = res.windowHeight;
					this.showPhoneWidth = res.windowWidth;
					this.showHeight = res.windowHeight - this.statusBarHeight - this.safeBottom - res
						.windowWidth / 750 * (70 + 150);
					this.cardWidth = res.windowWidth - res.windowWidth / 750 * (750 - 80);
				}
			});
		},
		onLoad(options) {
			this.showType = options.type || 0;
			this.code = options.code || '';
			this.vehId = options.vehId
		},
		onShow() {
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'zoneCenter/returnPhotos'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
			this.currentViewType = 0;
			this.currentCardType = 0;
		},
		methods: {
			/**
			 * 显示提示框
			 */
			showToast(msg) {
				uni.showToast({
					title: msg,
					icon: 'none',
					duration: 2000
				});
			},
			/**
			 * 显示加载框
			 */
			showLoading(msg) {
				uni.showLoading({
					title: msg,
					mask: true
				});
			},
			/**
			 * 隐藏加载框
			 */
			hideLoading() {
				uni.hideLoading();
			},
			/**
			 * 显示模态框
			 */
			showModal(msg, showCancel, callback) {
				uni.showModal({
					title: this.tips.Tip[this.lang],
					content: msg,
					showCancel: showCancel || false,
					success: (res) => {
						if (callback) {
							callback(res.confirm);
						}
					}
				});
			},
			/**
			 * 判断是否为空
			 */
			isEmpty(obj) {
				const ret = typeof obj === "undefined" || obj === null || obj === "" || !obj;
				return ret;
			},
			/**
			 * 上传图片按钮点击 - 原生拍照/选图
			 */
			inputCardBtnTap(e) {
				const viewType = e.currentTarget.id;
				// 原生选择图片/拍照
				uni.chooseImage({
					count: 1, // 仅选择1张
					sizeType: ['original', 'compressed'], // 原图/压缩图
					sourceType: ['album', 'camera'], // 相册/相机
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						// 根据按钮ID更新对应图片路径
						switch (viewType) {
							case '1':
								this.firstTempFilePaths = [tempFilePath];
								break;
							case '2':
								this.secondTempFilePaths = [tempFilePath];
								break;
							case '3':
								this.thirdTempFilePaths = [tempFilePath];
								break;
							case '4':
								this.fourthTempFilePaths = [tempFilePath];
								break;
							case '5':
								this.fifthTempFilePaths = [tempFilePath];
								break;
						}
						this.showToast(this.tips.ImageSelectSuccess[this.lang]);
					},
					fail: (err) => {
						if (err.errMsg.includes('auth')) {
							this.showModal(this.tips.CameraAlbumPermissionRequired[this.lang], true, (confirm) => {
								if (confirm) {
									uni.openSetting();
								}
							});
						} else {
							this.showToast(this.tips.ImageSelectFailedRetry[this.lang]);
						}
					}
				});
			},
			/**
			 * 上传图片
			 */
			uploadImg2(url, code, fileName, filePath) {
				if (this.isEmpty(filePath)) {
					this.showToast(this.tips.ImagePathEmpty[this.lang]);
					return;
				}
				this.showLoading(this.tips.Uploading[this.lang]);
				// 构造请求头
				const header = {
					'content-type': 'multipart/form-data'
				};
				// ========= 这里修改：直接从缓存 user_info 获取，不再读app.data
				const userInfo = uni.getStorageSync('user_info');
				if (!this.isEmpty(userInfo)) {
					header['username'] = userInfo.username;
					header['token'] = userInfo.token;
					header['timestamp'] = Date.parse(new Date());
				}
				// 上传文件
				this.uploadTask = uni.uploadFile({
					url: url,
					filePath: filePath,
					name: fileName,
					header: header,
					formData: {
						code,
						vehId: this.vehId
					},
					success: (res) => {
						this.hideLoading();
						if (res && res.statusCode === 200) {
							try {
								const data = JSON.parse(res.data);
								if (data.code === 1000) {
									this.showToast(this.tips.UploadSuccess[this.lang]);
								} else {
									this.showModal(data.msg || this.tips.UploadFailedRetry[this.lang]);
								}
							} catch (e) {
								this.showModal(this.tips.DataParseFailedRetry[this.lang]);
							}
						} else {
							this.showModal(this.tips.NetworkImageUploadFailed[this.lang]);
						}
					},
					fail: () => {
						this.hideLoading();
						this.showModal(this.tips.UploadFailedCheckNetwork[this.lang]);
					}
				});
			},
			/**
			 * 提交按钮点击
			 */
			submitBtnTap() {
				// 校验所有图片是否上传
				if (!this.firstTempFilePaths[0]) {
					this.showToast(this.tips.NeedFrontPhoto[this.lang]);
					return;
				} else if (!this.secondTempFilePaths[0]) {
					this.showToast(this.tips.NeedRearPhoto[this.lang]);
					return;
				} else if (!this.thirdTempFilePaths[0]) {
					this.showToast(this.tips.NeedLeftPhoto[this.lang]);
					return;
				} else if (!this.fourthTempFilePaths[0]) {
					this.showToast(this.tips.NeedRightPhoto[this.lang]);
					return;
				} else if (!this.fifthTempFilePaths[0]) {
					this.showToast(this.tips.NeedKeyPhoto[this.lang]);
					return;
				}
				const uploadUrl = 'http://192.168.10.100:8689/renterApi/saveImg';
				const code = this.code;
				// 批量上传所有图片
				this.uploadImg2(uploadUrl, code, "img1Arr", this.firstTempFilePaths[0]);
				this.uploadImg2(uploadUrl, code, "img2Arr", this.secondTempFilePaths[0]);
				this.uploadImg2(uploadUrl, code, "img3Arr", this.thirdTempFilePaths[0]);
				this.uploadImg2(uploadUrl, code, "img4Arr", this.fourthTempFilePaths[0]);
				this.uploadImg2(uploadUrl, code, "img5Arr", this.fifthTempFilePaths[0]);
				// 提交完成，调用还车接口
				this.carManagerFinish();
			},
			/**
			 * 车辆管理提交完成
			 */
			carManagerFinish() {
				this.showLoading(this.tips.Submitting[this.lang]);
				const param = {
					code: this.code
				};
				// 构造请求头
				const header = {
					'content-type': 'application/x-www-form-urlencoded'
				};
				// ========= 这里同样修改：从缓存 user_info 获取
				const userInfo = uni.getStorageSync('user_info');
				if (!this.isEmpty(userInfo)) {
					header['username'] = userInfo.username;
					header['token'] = userInfo.token;
					header['timestamp'] = Date.parse(new Date());
				}
				// 提交数据
				uni.request({
					timeout: 20000,
					url: `https://k1sw.wiselink.net.cn/renterApi/returnCar`,
					data: param,
					header: header,
					method: 'POST',
					success: (res) => {
						this.hideLoading();
						if (res && res.statusCode === 200) {
							const data = res.data;
							if (data.code === 1000) {
								// 清除缓存
								uni.removeStorage({
									key: 'scene',
									success() {
									},
									fail(err) {
									}
								});
								// 跳转首页
								uni.redirectTo({
									url: '/pages/index/index',
									success() {
									},
									fail(err) {
									}
								});
								this.showModal(data.msg || this.tips.SubmitSuccessMsg[this.lang]);
							} else {
								this.showModal(data.msg || this.tips.SubmitFailedRetry[this.lang]);
							}
						} else {
							this.showToast(this.tips.NetworkException[this.lang]);
						}
					},
					fail: () => {
						this.hideLoading();
						this.showToast(this.tips.SubmitFailedCheckNetwork[this.lang]);
					}
				});
			}
		}
	};
</script>
<style scoped>
	page {
		background-color: black;
		height: 100%;
		width: 100%;
		position: fixed;
	}
	.page-root {
		width: 100%;
		min-height: 100vh;
		position: relative;
		overflow: hidden;
	}
	.status-safe-bar {
		width: 100%;
		background-color: black;
		position: relative;
		z-index: 1;
	}
	.container {
		width: 100%;
		height: 100%;
		text-align: center;
		position: relative;
		font-weight: 200;
	}
	.page_title {
		margin-top: 25rpx;
		color: white;
		font-size: 25rpx;
	}
	.bg-img {
		width: 100%;
		height: 100%;
		position: fixed;
	}
	.info-btn1 {
		color: black;
		text-align: center;
		background-color: white;
		font-size: 25rpx;
		padding-left: 40rpx;
		padding-right: 40rpx;
		position: relative;
	}
	.info-btn {
		margin-top: 20rpx;
		color: black;
		text-align: center;
		background-color: white;
		font-size: 25rpx;
		padding-left: 40rpx;
		padding-right: 40rpx;
		position: relative;
	}
	.arrow {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
	}
	.btn_tapcolor {
		background-color: #575757;
	}
	.submit_btn {
		background-color: #045f33;
		height: 90rpx;
		color: white;
		font-size: 35rpx;
		line-height: 90rpx;
		margin-left: 40rpx;
		margin-right: 40rpx;
		position: fixed;
		width: 670rpx;
		bottom: 20rpx;
	}
</style>