<template>
	<!-- 页面根容器 -->
	<view class="device-check-page">
		<view class="content-wrapper">
			<view class="main-content-card">

				<!-- ===== 设备绑定 ===== -->
				<view class="device-bind-section">
					<view class="form-item">
						<text class="form-label">{{tips.DeviceSN[lang]}}：</text>
						<input v-model="checkForm.idc" class="form-input" :placeholder="tips.PleaseEnterSN[lang]" />
					</view>
					<view class="form-item">
						<text class="form-label">{{tips.CodeLabel[lang]}}：</text>
						<input v-model="checkForm.code" class="form-input" :placeholder="tips.PleaseEnterCode[lang]" />
					</view>
					<button class="bind-device-btn" :disabled="!checkForm.idc || !checkForm.code || isDeviceBound"
						@tap="handleDeviceBind">{{tips.StartCheck[lang]}}</button>
				</view>

				<view class="section-divider"></view>

				<!-- ===== 图片上传 ===== -->
				<view class="image-upload-section">
					<view class="upload-title">{{tips.UploadScenePhotos[lang]}}</view>
					<view class="upload-tip">{{tips.UploadTipK7[lang]}}</view>

					<!-- 分类上传区（7个独立分组，一一对应后端7个字段） -->
					<view class="category-upload-wrapper">
						<!-- 1. 车辆名牌 -->
						<view class="upload-item">
							<view class="upload-label">{{tips.VehicleNamePlateReq[lang]}}</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/vehicle_nameplate.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/vehicle_nameplate.png"
										class="preview-image"></image>
									<view class="demo-badge">{{tips.SampleBadge[lang]}}</view>
								</view>
								<view class="image-item" v-for="(item, index) in imageGroups.namePlate" :key="index">
									<image :src="item" class="preview-image" @tap="previewUploadImg" :data-url="item">
									</image>
									<view class="delete-btn" @tap.stop="deleteImage" data-group="namePlate"
										:data-index="index">×</view>
								</view>
								<view class="add-image-btn" @tap="chooseGroupImage" data-group="namePlate" data-max="9">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>

						<!-- 2. 钥匙焊接图 -->
						<view class="upload-item">
							<view class="upload-label">{{tips.KeyWeldingReq[lang]}}</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/key_welding_diagram.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/key_welding_diagram.png"
										class="preview-image"></image>
									<view class="demo-badge">{{tips.SampleBadge[lang]}}</view>
								</view>
								<view class="image-item" v-for="(item, index) in imageGroups.acc" :key="index">
									<image :src="item" class="preview-image" @tap="previewUploadImg" :data-url="item">
									</image>
									<view class="delete-btn" @tap.stop="deleteImage" data-group="acc"
										:data-index="index">×</view>
								</view>
								<view class="add-image-btn" @tap="chooseGroupImage" data-group="acc" data-max="9">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>

						<!-- 3. 风控线束图 -->
						<view class="upload-item">
							<view class="upload-label">{{tips.RiskWiringReq[lang]}}</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/risk_control_wiring.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/risk_control_wiring.png"
										class="preview-image"></image>
									<view class="demo-badge">{{tips.SampleBadge[lang]}}</view>
								</view>
								<view class="image-item" v-for="(item, index) in imageGroups.constant" :key="index">
									<image :src="item" class="preview-image" @tap="previewUploadImg" :data-url="item">
									</image>
									<view class="delete-btn" @tap.stop="deleteImage" data-group="constant"
										:data-index="index">×</view>
								</view>
								<view class="add-image-btn" @tap="chooseGroupImage" data-group="constant" data-max="9">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>

						<!-- 4. 回避器图 -->
						<view class="upload-item">
							<view class="upload-label">{{tips.AvoiderReq[lang]}}</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/avoider_diagram.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/avoider_diagram.png"
										class="preview-image"></image>
									<view class="demo-badge">{{tips.SampleBadge[lang]}}</view>
								</view>
								<view class="image-item" v-for="(item, index) in imageGroups.ground" :key="index">
									<image :src="item" class="preview-image" @tap="previewUploadImg" :data-url="item">
									</image>
									<view class="delete-btn" @tap.stop="deleteImage" data-group="ground"
										:data-index="index">×</view>
								</view>
								<view class="add-image-btn" @tap="chooseGroupImage" data-group="ground" data-max="9">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>

						<!-- 5. ACC接线图 独立分组 accWiring -->
						<view class="upload-item">
							<view class="upload-label">{{tips.AccWiringReq[lang]}}</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/acc_wiring_diagram.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/acc_wiring_diagram.png"
										class="preview-image"></image>
									<view class="demo-badge">{{tips.SampleBadge[lang]}}</view>
								</view>
								<view class="image-item" v-for="(item, index) in imageGroups.accWiring" :key="index">
									<image :src="item" class="preview-image" @tap="previewUploadImg" :data-url="item">
									</image>
									<view class="delete-btn" @tap.stop="deleteImage" data-group="accWiring"
										:data-index="index">×</view>
								</view>
								<view class="add-image-btn" @tap="chooseGroupImage" data-group="accWiring" data-max="9">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>

						<!-- 6. 常火接线图 独立分组 constantPower -->
						<view class="upload-item">
							<view class="upload-label">{{tips.ConstantPowerReq[lang]}}</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/constant_power_wiring.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/constant_power_wiring.png"
										class="preview-image"></image>
									<view class="demo-badge">{{tips.SampleBadge[lang]}}</view>
								</view>
								<view class="image-item" v-for="(item, index) in imageGroups.constantPower"
									:key="index">
									<image :src="item" class="preview-image" @tap="previewUploadImg" :data-url="item">
									</image>
									<view class="delete-btn" @tap.stop="deleteImage" data-group="constantPower"
										:data-index="index">×</view>
								</view>
								<view class="add-image-btn" @tap="chooseGroupImage" data-group="constantPower"
									data-max="9">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>

						<!-- 7. 应急感应区域图 独立分组 emergencyArea -->
						<view class="upload-item">
							<view class="upload-label">{{tips.EmergencyReq[lang]}}</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/emergency_sensing_area.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/emergency_sensing_area.png"
										class="preview-image"></image>
									<view class="demo-badge">{{tips.SampleBadge[lang]}}</view>
								</view>
								<view class="image-item" v-for="(item, index) in imageGroups.emergencyArea"
									:key="index">
									<image :src="item" class="preview-image" @tap="previewUploadImg" :data-url="item">
									</image>
									<view class="delete-btn" @tap.stop="deleteImage" data-group="emergencyArea"
										:data-index="index">×</view>
								</view>
								<view class="add-image-btn" @tap="chooseGroupImage" data-group="emergencyArea"
									data-max="9">
									<text class="add-icon">+</text>
								</view>
							</view>
						</view>
					</view>

					<button class="confirm-upload-btn"
						:disabled="!isDeviceBound || !allRequiredImgReady || isImageUploaded || isUploading"
						@tap="handleBatchUploadImages">{{tips.ConfirmUploadPhotos[lang]}}</button>
				</view>

				<view class="section-divider"></view>

				<!-- ===== 网络检测 ===== -->
				<view class="network-check-section">
					<view class="section-title"><text
							:class="['title-text', isNetworkTestFinished ? 'finished' : '']">{{tips.NetworkModeCheck[lang]}}</text></view>
					<view class="network-test-container"
						:style="{pointerEvents: isNetworkTestFinished ? 'none' : 'auto'}">
						<view class="test-header"><text>{{tips.NetworkModeActions[lang]}}</text><text class="finish-tip"
								v-if="isNetworkTestFinished">✅ {{tips.CompletedBadge[lang]}}</text></view>
						<view class="test-btn-group">
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="lock">
								<text>{{tips.UnlockCmd[lang]}}</text>
								<text :class="['test-status', networkTestStatus.lockStatus]">
									<text v-if="networkTestStatus.lockStatus ==='success'">{{tips.TestSuccess[lang]}}</text>
									<text v-if="networkTestStatus.lockStatus ==='testing'">{{tips.Testing[lang]}}</text>
									<text v-if="networkTestStatus.lockStatus ==='fail'">{{tips.TestFailed[lang]}}</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="unlock">
								<text>{{tips.LockCmd[lang]}}</text>
								<text :class="['test-status', networkTestStatus.unlockStatus]">
									<text v-if="networkTestStatus.unlockStatus ==='success'">{{tips.TestSuccess[lang]}}</text>
									<text v-if="networkTestStatus.unlockStatus ==='testing'">{{tips.Testing[lang]}}</text>
									<text v-if="networkTestStatus.unlockStatus ==='fail'">{{tips.TestFailed[lang]}}</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="findCar">
								<text>{{tips.FindCarCmd[lang]}}</text>
								<text :class="['test-status', networkTestStatus.findCarStatus]">
									<text v-if="networkTestStatus.findCarStatus ==='success'">{{tips.TestSuccess[lang]}}</text>
									<text v-if="networkTestStatus.findCarStatus ==='testing'">{{tips.Testing[lang]}}</text>
									<text v-if="networkTestStatus.findCarStatus ==='fail'">{{tips.TestFailed[lang]}}</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="risk">
								<text>{{tips.RiskBlockCmd[lang]}}</text>
								<text :class="['test-status', networkTestStatus.riskStatus]">
									<text v-if="networkTestStatus.riskStatus ==='success'">{{tips.TestSuccess[lang]}}</text>
									<text v-if="networkTestStatus.riskStatus ==='testing'">{{tips.Testing[lang]}}</text>
									<text v-if="networkTestStatus.riskStatus ==='fail'">{{tips.TestFailed[lang]}}</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="cancelRisk">
								<text>{{tips.CancelBlockCmd[lang]}}</text>
								<text :class="['test-status', networkTestStatus.cancelRiskStatus]">
									<text v-if="networkTestStatus.cancelRiskStatus ==='success'">{{tips.TestSuccess[lang]}}</text>
									<text v-if="networkTestStatus.cancelRiskStatus ==='testing'">{{tips.Testing[lang]}}</text>
									<text v-if="networkTestStatus.cancelRiskStatus ==='fail'">{{tips.TestFailed[lang]}}</text>
								</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 日志 ===== -->
		<view class="test-log-section">
			<view class="log-title">{{tips.TestLog[lang]}}</view>
			<scroll-view scroll-y class="log-content-container" id="logScroll">
				<view class="log-item" v-for="(item, index) in testLogList" :key="index">{{item}}</view>
			</scroll-view>
		</view>

		<!-- ===== 底部提交 ===== -->
		<view class="fixed-submit-bar">
			<button class="submit-check-btn" :disabled="!canSubmitFinalCheck"
				@tap="handleSubmitFinalCheck">{{tips.SubmitCheck[lang]}}</button>
		</view>
	</view>
</template>

<script>
	import {
		u_operation
	} from '@/api/index'
	import {
		tips
	} from '@/utils/langtips.js'
	// const { byGet, byPost } = require('../../../utils/request/http')

	const MAX_LOG_COUNT = 50;

	export default {
		data() {
			return {
				tips: tips,
				lang: 'zhCn',
				checkForm: {
					idc: '',
					code: ''
				},
				isDeviceBound: false,
				deviceInfo: {
					sn: '',
					code: ''
				},
				imageGroups: {
					namePlate: [],
					acc: [],
					constant: [],
					ground: [],
					accWiring: [],
					constantPower: [],
					emergencyArea: []
				},
				allRequiredImgReady: false,
				isImageUploaded: false,
				isUploading: false,
				networkTestStatus: {
					lockStatus: '',
					unlockStatus: '',
					findCarStatus: '',
					riskStatus: '',
					cancelRiskStatus: ''
				},
				testLogList: [],
				isNetworkTestFinished: false,
				canSubmitFinalCheck: false,
				c_k1sw_link: 'https://k1sw.wiselink.net.cn/',
				isShowDemo: false,
				isSubmitting: false
			}
		},
		onShow() {
			this.lang = uni.getStorageSync('language') || 'zhCn'
		},
		methods: {
			toggleDemo() {
				this.isShowDemo = !this.isShowDemo
			},
			previewDemoImg(e) {
				const src = e.currentTarget.dataset.src;
				uni.previewImage({
					urls: [src]
				})
			},
			previewUploadImg(e) {
				const url = e.currentTarget.dataset.url;
				uni.previewImage({
					urls: [url],
					current: url
				})
			},
			deleteImage(e) {
				const {
					group,
					index
				} = e.currentTarget.dataset;
				const currentList = this.imageGroups[group];
				const newList = currentList.filter((_, i) => i !== index);
				this.$set(this.imageGroups, group, newList)
				this.$nextTick(() => {
					this.updateImgReadyState();
					if (this.isImageUploaded) {
						this.isImageUploaded = false;
					}
					this.checkCanSubmit();
				})
			},
			updateImgReadyState() {
				const {
					imageGroups
				} = this;
				const ready = imageGroups.namePlate.length > 0 &&
					imageGroups.acc.length > 0 &&
					imageGroups.constant.length > 0 &&
					imageGroups.ground.length > 0 &&
					imageGroups.accWiring.length > 0 &&
					imageGroups.constantPower.length > 0 &&
					imageGroups.emergencyArea.length > 0;
				this.allRequiredImgReady = ready
			},
			chooseGroupImage(e) {
				const {
					group,
					max
				} = e.currentTarget.dataset;
				const current = this.imageGroups[group];
				const remain = max - current.length;
				if (remain <= 0) {
					uni.showToast({
						title: this.tips.MaxImagesPerCategory[this.lang].replace('{n}', max),
						icon: 'none'
					})
					return;
				}
				uni.chooseImage({
					count: remain,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const newList = [...current, ...res.tempFilePaths];
						this.$set(this.imageGroups, group, newList)
						this.$nextTick(() => {
							this.updateImgReadyState();
							if (this.isImageUploaded) {
								this.isImageUploaded = false;
							}
						})
					}
				})
			},
			async handleBatchUploadImages() {
				const {
					imageGroups,
					deviceInfo
				} = this;
				if (!this.checkAllRequiredImages()) {
					uni.showToast({
						title: this.tips.SevenPhotosEachRequired[this.lang],
						icon: 'none'
					});
					return;
				}
				if (!deviceInfo?.sn) {
					uni.showToast({
						title: this.tips.DeviceInfoAbnormalRebind[this.lang],
						icon: 'none'
					});
					return;
				}

				this.isUploading = true;
				uni.showLoading({
					title: this.tips.StartingUploadImages[this.lang]
				});

				try {
					const groups = [
						'namePlate',
						'acc',
						'constant',
						'ground',
						'accWiring',
						'constantPower',
						'emergencyArea'
					];

					for (const groupKey of groups) {
						const imgList = this.imageGroups[groupKey];
						if (!imgList || imgList.length === 0) continue;
						for (const filePath of imgList) {
							uni.showLoading({
								title: this.tips.UploadingImages[this.lang]
							});
							await this.uploadSingleImage(filePath, groupKey);
						}
					}

					this.isImageUploaded = true
					this.$nextTick(() => {
						this.updateImgReadyState();
						this.checkCanSubmit();
					})
					this.appendTestLog('✅ ' + this.tips.AllImagesUploaded[this.lang]);
					uni.showToast({
						title: this.tips.UploadSuccess[this.lang],
						icon: 'none'
					});
				} catch (error) {
					this.appendTestLog('❌ ' + this.tips.ImageUploadFailedPrefix[this.lang] + error);
					uni.showToast({
						title: this.tips.UploadFailedRetry[this.lang],
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
					this.isUploading = false;
				}
			},
			uploadSingleImage(filePath, groupKey) {
				return new Promise((resolve, reject) => {
					const userInfo = uni.getStorageSync('userKey') || {};
					const token = userInfo.token || '';

					const groupNameMap = {
						namePlate: 'vehicle_nameplate',
						acc: 'key_welding_diagram',
						constant: 'risk_control_wiring',
						ground: 'avoider_diagram',
						accWiring: 'acc_wiring_diagram',
						constantPower: 'constant_power_wiring',
						emergencyArea: 'emergency_sensing_area'
					};

					const fieldName = groupNameMap[groupKey];
					if (!fieldName) {
						reject(this.tips.GroupAbnormal[this.lang]);
						return;
					}

					uni.uploadFile({
						url: 'https://k1sw.wiselink.net.cn/k7Api/uploadInstallImg',
						filePath: filePath,
						name: fieldName,
						header: {
							token
						},
						formData: {
							sn: this.deviceInfo.sn
						},
						success: (uploadRes) => {
							try {
								const data = JSON.parse(uploadRes.data);
								if (data.code === 1000) resolve();
								else reject(data.msg || this.tips.UploadFailedRetry[this.lang]);
							} catch (e) {
								reject(this.tips.ParseException[this.lang]);
							}
						},
						fail: () => reject(this.tips.NetworkException[this.lang])
					});
				});
			},
			checkAllRequiredImages() {
				return this.allRequiredImgReady;
			},
			checkCanSubmit() {
				const {
					networkTestStatus,
					isDeviceBound,
					isImageUploaded
				} = this;
				const {
					lockStatus,
					unlockStatus,
					findCarStatus,
					riskStatus,
					cancelRiskStatus
				} = networkTestStatus;
				const allTestFinish = lockStatus === 'success' && unlockStatus === 'success' &&
					findCarStatus === 'success' && riskStatus === 'success' &&
					cancelRiskStatus === 'success';
				this.isNetworkTestFinished = allTestFinish
				const canSubmit = isDeviceBound && isImageUploaded && allTestFinish;
				this.canSubmitFinalCheck = canSubmit
				if (allTestFinish) {
					this.appendTestLog('🎉 ' + this.tips.AllTestsComplete[this.lang]);
				}
			},
			validateBeforeOperate() {
				const {
					checkForm,
					isDeviceBound,
					isImageUploaded
				} = this;
				if (!checkForm.idc || !checkForm.code) {
					uni.showToast({
						title: this.tips.PleaseInputIdcAndCode[this.lang],
						icon: 'none'
					});
					return false;
				}
				if (!isDeviceBound) {
					uni.showToast({
						title: this.tips.PleaseBindDeviceFirst[this.lang],
						icon: 'none'
					});
					return false;
				}
				if (!isImageUploaded) {
					uni.showToast({
						title: this.tips.PleaseUploadScenePhotos[this.lang],
						icon: 'none'
					});
					return false;
				}
				return true;
			},
			async handleDeviceBind() {
				const CHECK_URL = 'https://k1sw.wiselink.net.cn/k7Api/isIdcCheck';
				const BIND_URL = 'https://k1sw.wiselink.net.cn/k7Api/getBluetoothKey';

				const {
					isSubmitting,
					checkForm
				} = this;
				if (isSubmitting) return;
				this.isSubmitting = true;

				try {
					const userInfo = uni.getStorageSync('userKey') || {};
					const token = userInfo.token || '';
					const {
						idc,
						code
					} = checkForm || {};

					if (!idc || !code) {
						uni.showToast({
							title: this.tips.PleaseInputIdcAndCode[this.lang],
							icon: 'none'
						});
						return;
					}

					const checkRes = await new Promise((resolve, reject) => {
						uni.request({
							url: CHECK_URL,
							method: 'GET',
							data: {
								idc
							},
							header: {
								token
							},
							success: res => resolve(res),
							fail: err => reject(err)
						});
					});

					if (checkRes?.data?.code === 1000) {
						uni.showModal({
							title: this.tips.ResultTitle[this.lang],
							content: checkRes?.data?.msg || this.tips.CheckAbortMsg[this.lang],
							showCancel: false
						});
						return;
					}

					uni.showLoading({
						title: this.tips.BindDeviceProcessing[this.lang],
						mask: true
					});

					const bindResult = await new Promise((resolve, reject) => {
						uni.request({
							url: BIND_URL,
							method: 'GET',
							data: {
								sn: idc,
								code
							},
							header: {
								token
							},
							success: res => resolve(res.data),
							fail: err => reject(err)
						});
					});

					if (bindResult.code === 1000) {
						this.isDeviceBound = true
						this.deviceInfo = bindResult.content || {}
						this.$nextTick(() => {
							this.updateImgReadyState();
							this.checkCanSubmit();
						})
						this.appendTestLog('✅ ' + this.tips.DeviceBoundSuccessLog[this.lang]);
						uni.showModal({
							title: this.tips.ResultTitle[this.lang],
							content: bindResult?.msg,
							showCancel: false
						});
					} else {
						uni.showModal({
							title: this.tips.ResultTitle[this.lang],
							content: bindResult.msg || this.tips.BindDeviceFailed[this.lang],
							showCancel: false
						});
					}
				} catch (error) {
					console.error('设备绑定全流程异常：', error);
					uni.showModal({
						title: this.tips.ResultTitle[this.lang],
						content: this.tips.BindRequestError[this.lang],
						showCancel: false
					});
				} finally {
					uni.hideLoading();
					this.isSubmitting = false;
				}
			},
			handleNetworkTest(e) {
				if (!this.validateBeforeOperate()) return;
				const testType = e.currentTarget.dataset.type;
				const commandMap = {
					lock: 3,
					unlock: 1,
					findCar: 5,
					risk: 8,
					cancelRisk: 6
				};
				const command = commandMap[testType];
				if (!command) return;
				this.executeNetworkTestAction(command, testType);
			},
			async executeNetworkTestAction(command, testType) {
				const {
					deviceInfo,
					checkForm,
					c_k1sw_link
				} = this;
				const actionName = this.getTestActionText(command);
				if (!deviceInfo?.sn) {
					this.appendTestLog(`❌ ${this.tips.LogNetworkTag[this.lang]} ${actionName} ${this.tips.DeviceMissing[this.lang]}`);
					return;
				}
				this.setTestStatus(command, 'testing');
				this.appendTestLog('🚗 ' + this.tips.LogNetworkTag[this.lang] + ' ' + this.tips.StartActionLog[this.lang].replace('{action}', actionName).replace('{idc}', checkForm.idc));
				uni.showLoading({
					title: this.tips.ExecutingCommand[this.lang]
				});

				const reqUrl = `${c_k1sw_link}${u_operation.URL}`;
				const reqData = {
					sn: deviceInfo.sn,
					operationType: command,
					code: deviceInfo.code,
					_timestamp: Date.now()
				};
				const response = await u_operation(reqData)
				const resData = response.data || {};
				if (resData.code === 1000) {
					this.setTestStatus(command, 'success');
					this.appendTestLog('✅ ' + this.tips.LogNetworkTag[this.lang] + ' ' + this.tips.ActionSuccessLog[this.lang].replace('{action}', actionName));
				} else {
					this.setTestStatus(command, 'fail');
					this.appendTestLog('❌ ' + this.tips.LogNetworkTag[this.lang] + ' ' + this.tips.ActionFailLog[this.lang].replace('{action}', actionName).replace('{reason}', resData.msg || this.tips.UnknownReason[this.lang]));
				}

				setTimeout(() => {
					uni.hideLoading();
				}, 8000);
			},
			setTestStatus(command, status) {
				const statusKeyMap = {
					3: 'lockStatus',
					1: 'unlockStatus',
					5: 'findCarStatus',
					8: 'riskStatus',
					6: 'cancelRiskStatus'
				};
				const key = statusKeyMap[command];
				if (key) {
					this.$set(this.networkTestStatus, key, status)
					this.checkCanSubmit();
				}
			},
			async handleSubmitFinalCheck() {
				const {
					checkForm
				} = this;
				const idc = checkForm.idc;
				const checkType = 1,
					checkState = 1;
				const userInfo = uni.getStorageSync('userKey') || {};
				const token = userInfo.token || '';

				uni.showLoading({
					title: this.tips.SubmittingCheckResult[this.lang]
				});
				try {
					const res = await new Promise((resolve, reject) => {
						uni.request({
							url: 'https://fin3.wiselink.net.cn/fin/deviceTest/saveResult',
							method: 'GET',
							data: {
								idc,
								checkType,
								checkState,
								test: 'wiselink'
							},
							header: {
								token
							},
							success: resolve,
							fail: reject
						});
					});
					const resData = res?.data || {};
					if (resData.code === 1000) {
						uni.showModal({
							title: this.tips.SubmitSuccessTitle[this.lang],
							content: this.tips.CheckCompletedContent[this.lang],
							showCancel: false,
							success: () => {
								uni.redirectTo({
									url: '/pages/index/index'
								});
							}
						});
					} else {
						uni.showToast({
							title: resData.msg || this.tips.SubmitFailedToast[this.lang],
							icon: 'none'
						});
						this.appendTestLog('❌ ' + this.tips.SubmitFailedToast[this.lang] + '：' + (resData.msg || this.tips.UnknownError[this.lang]));
					}
				} catch (err) {
					console.error('提交检测结果失败：', err);
					uni.showToast({
						title: this.tips.RequestExceptionRetry[this.lang],
						icon: 'none'
					});
					this.appendTestLog('❌ ' + this.tips.SubmitResultFailedLog[this.lang]);
				} finally {
					uni.hideLoading();
				}
			},
			getTestStatusText(status) {
				const map = {
					testing: this.tips.Testing[this.lang],
					success: this.tips.TestSuccess[this.lang],
					fail: this.tips.TestFailed[this.lang]
				};
				return map[status] || '';
			},
			getTestActionText(command) {
				const map = {
					3: this.tips.UnlockCmd[this.lang],
					1: this.tips.LockCmd[this.lang],
					5: this.tips.FindCarCmd[this.lang],
					8: this.tips.RiskBlockCmd[this.lang],
					6: this.tips.CancelBlockCmd[this.lang]
				};
				return map[command] || command;
			},
			appendTestLog(content) {
				const time = new Date().toLocaleTimeString();
				let logList = [`[${time}] ${content}`, ...this.testLogList];
				if (logList.length > MAX_LOG_COUNT) {
					logList = logList.slice(0, MAX_LOG_COUNT);
				}
				this.testLogList = logList
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('#logScroll').scrollOffset((res) => {
						if (res && res.node) {
							res.node.scrollTo(0, 0)
						}
					}).exec()
				})
			}
		}
	}
</script>

<style scoped>
	/* 页面根容器 */
	.device-check-page {
		width: 100vw;
		height: 98vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f7fa;
		box-sizing: border-box;
		padding-bottom: 100rpx;
	}

	.content-wrapper {
		flex: 0 0 70%;
		overflow-y: auto;
		padding: 30rpx 20rpx 0;
	}

	.main-content-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.section-divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 40rpx 0;
	}

	/* 表单 */
	.form-item {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.form-label {
		width: 150rpx;
		font-size: 28rpx;
		color: #333;
	}

	.form-input {
		flex: 1;
		height: 70rpx;
		border: 2rpx solid #eee;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
	}

	.bind-device-btn {
		width: 100%;
		background-color: #007aff;
		color: #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		padding: 14rpx 0;
		margin-top: 10rpx;
	}

	/* 图片上传 */
	.upload-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #fa8c16;
		margin-bottom: 10rpx;
		line-height: 1.4;
	}

	/* 分类上传容器 */
	.category-upload-wrapper {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-bottom: 30rpx;
	}

	.upload-item {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.upload-label {
		font-size: 26rpx;
		font-weight: 500;
		color: #333;
		padding-left: 8rpx;
	}

	/* 图片列表 */
	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		align-items: flex-start;
	}

	.image-item {
		width: 145rpx;
		height: 145rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
		position: relative;
	}

	.preview-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* 示例图片特殊样式 */
	.demo-image-item {
		border: 2rpx solid #1890ff;
		box-sizing: border-box;
	}

	.demo-badge {
		position: absolute;
		top: 0;
		right: 0;
		background-color: rgba(24, 144, 255, 0.85);
		color: #fff;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 0 0 0 12rpx;
		line-height: 1.4;
		pointer-events: none;
		z-index: 1;
	}

	/* 删除按钮（用户图片右上角） */
	.delete-btn {
		position: absolute;
		top: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(255, 0, 0, 0.75);
		color: #fff;
		font-size: 30rpx;
		line-height: 40rpx;
		text-align: center;
		border-radius: 0 12rpx 0 12rpx;
		z-index: 2;
		pointer-events: auto;
	}

	.demo-image-item .delete-btn {
		display: none;
	}

	/* 添加按钮 */
	.add-image-btn {
		width: 145rpx;
		height: 145rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
		flex-shrink: 0;
	}

	.add-icon {
		font-size: 40rpx;
		color: #999;
	}

	/* 确认上传按钮 */
	.confirm-upload-btn {
		width: 100%;
		background-color: #07c160;
		color: #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		padding: 14rpx 0;
	}

	button[disabled] {
		background-color: #ccc !important;
		color: #fff !important;
	}

	/* 网络检测 */
	.section-title {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
		font-size: 30rpx;
		font-weight: bold;
	}

	.title-text {
		color: #333;
	}

	.title-text.finished {
		color: #00b42a;
	}

	.network-test-container {
		margin-bottom: 24rpx;
	}

	.test-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 29rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
		color: #007aff;
	}

	.finish-tip {
		font-size: 24rpx;
		color: #999;
		font-weight: normal;
	}

	.test-btn-group {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.test-btn-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 24rpx;
		background-color: #fafafa;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.04);
	}

	.click-effect:active {
		background-color: #eee;
		transform: scale(0.98);
	}

	.test-status {
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		min-width: 100rpx;
		text-align: center;
	}

	.test-status.testing {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.test-status.success {
		background-color: #e6ffed;
		color: #00b42a;
	}

	.test-status.fail {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	/* 日志 */
	.test-log-section {
		height: 300rpx;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin: 30rpx 20rpx 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.log-title {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
		flex-shrink: 0;
	}

	.log-content-container {
		width: 100%;
		height: 220rpx;
		box-sizing: border-box;
		background-color: #f9f9f9;
		border-radius: 10rpx;
		padding: 16rpx;
		box-shadow: inset 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
	}

	.log-item {
		width: 100%;
		box-sizing: border-box;
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 6rpx;
		word-break: break-all;
	}

	/* 底部提交 */
	.fixed-submit-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100rpx;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		padding: 0 20rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.submit-check-btn {
		width: 100%;
		height: 70rpx;
		background-color: #007aff;
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		border-radius: 12rpx;
	}

	.submit-check-btn:disabled {
		background-color: #ccc !important;
	}
</style>