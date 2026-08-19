<template>
	<!-- 页面根容器 -->
	<view class="device-check-page">
		<view class="content-wrapper">
			<view class="main-content-card">

				<!-- ===== 设备绑定 ===== -->
				<view class="device-bind-section">
					<view class="form-item">
						<text class="form-label">设备号：</text>
						<input v-model="checkForm.idc" class="form-input" placeholder="请输入设备号(SN)" />
					</view>
					<view class="form-item">
						<text class="form-label">CODE：</text>
						<input v-model="checkForm.code" class="form-input" placeholder="请输入CODE码(CODE)" />
					</view>
					<button class="bind-device-btn" :disabled="!checkForm.idc || !checkForm.code || isDeviceBound"
						@tap="handleDeviceBind">开始检测</button>
				</view>

				<view class="section-divider"></view>

				<!-- ===== 图片上传 ===== -->
				<view class="image-upload-section">
					<view class="upload-title">现场图片上传</view>
					<view class="upload-tip">7类图片全部必填：车辆铭牌、钥匙焊接图、风控线束图、回避器图、ACC接线图、常火接线图、应急感应区域图，每组至少上传1张，每组可上传多张</view>

					<!-- 分类上传区（7个独立分组，一一对应后端7个字段） -->
					<view class="category-upload-wrapper">
						<!-- 1. 车辆名牌 -->
						<view class="upload-item">
							<view class="upload-label">车辆名牌（必填）</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/vehicle_nameplate.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/vehicle_nameplate.png"
										class="preview-image"></image>
									<view class="demo-badge">示例</view>
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
							<view class="upload-label">钥匙焊接图（必填）</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/key_welding_diagram.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/key_welding_diagram.png"
										class="preview-image"></image>
									<view class="demo-badge">示例</view>
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
							<view class="upload-label">风控线束图（必填）</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/risk_control_wiring.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/risk_control_wiring.png"
										class="preview-image"></image>
									<view class="demo-badge">示例</view>
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
							<view class="upload-label">回避器图（必填）</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/avoider_diagram.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/avoider_diagram.png"
										class="preview-image"></image>
									<view class="demo-badge">示例</view>
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
							<view class="upload-label">ACC接线图（必填）</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/acc_wiring_diagram.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/acc_wiring_diagram.png"
										class="preview-image"></image>
									<view class="demo-badge">示例</view>
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
							<view class="upload-label">常火接线图（必填）</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/constant_power_wiring.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/constant_power_wiring.png"
										class="preview-image"></image>
									<view class="demo-badge">示例</view>
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
							<view class="upload-label">应急感应区域图（必填）</view>
							<view class="image-list">
								<view class="image-item demo-image-item" @tap="previewDemoImg"
									data-src="https://k1sw.wiselink.net.cn/img/app2.0/k7/emergency_sensing_area.png">
									<image src="https://k1sw.wiselink.net.cn/img/app2.0/k7/emergency_sensing_area.png"
										class="preview-image"></image>
									<view class="demo-badge">示例</view>
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
						@tap="handleBatchUploadImages">确认上传图片</button>
				</view>

				<view class="section-divider"></view>

				<!-- ===== 网络检测 ===== -->
				<view class="network-check-section">
					<view class="section-title"><text
							:class="['title-text', isNetworkTestFinished ? 'finished' : '']">网络模式检测</text></view>
					<view class="network-test-container"
						:style="{pointerEvents: isNetworkTestFinished ? 'none' : 'auto'}">
						<view class="test-header"><text>网络模式操作</text><text class="finish-tip"
								v-if="isNetworkTestFinished">✅ 已完成</text></view>
						<view class="test-btn-group">
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="lock">
								<text>开锁</text>
								<text :class="['test-status', networkTestStatus.lockStatus]">
									<text v-if="networkTestStatus.lockStatus ==='success'">成功</text>
									<text v-if="networkTestStatus.lockStatus ==='testing'">测试中</text>
									<text v-if="networkTestStatus.lockStatus ==='fail'">失败</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="unlock">
								<text>关锁</text>
								<text :class="['test-status', networkTestStatus.unlockStatus]">
									<text v-if="networkTestStatus.unlockStatus ==='success'">成功</text>
									<text v-if="networkTestStatus.unlockStatus ==='testing'">测试中</text>
									<text v-if="networkTestStatus.unlockStatus ==='fail'">失败</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="findCar">
								<text>寻车</text>
								<text :class="['test-status', networkTestStatus.findCarStatus]">
									<text v-if="networkTestStatus.findCarStatus ==='success'">成功</text>
									<text v-if="networkTestStatus.findCarStatus ==='testing'">测试中</text>
									<text v-if="networkTestStatus.findCarStatus ==='fail'">失败</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="risk">
								<text>风控拦截</text>
								<text :class="['test-status', networkTestStatus.riskStatus]">
									<text v-if="networkTestStatus.riskStatus ==='success'">成功</text>
									<text v-if="networkTestStatus.riskStatus ==='testing'">测试中</text>
									<text v-if="networkTestStatus.riskStatus ==='fail'">失败</text>
								</text>
							</view>
							<view class="test-btn-item click-effect" @tap="handleNetworkTest" data-type="cancelRisk">
								<text>取消拦截</text>
								<text :class="['test-status', networkTestStatus.cancelRiskStatus]">
									<text v-if="networkTestStatus.cancelRiskStatus ==='success'">成功</text>
									<text v-if="networkTestStatus.cancelRiskStatus ==='testing'">测试中</text>
									<text v-if="networkTestStatus.cancelRiskStatus ==='fail'">失败</text>
								</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 日志 ===== -->
		<view class="test-log-section">
			<view class="log-title">测试日志</view>
			<scroll-view scroll-y class="log-content-container" id="logScroll">
				<view class="log-item" v-for="(item, index) in testLogList" :key="index">{{item}}</view>
			</scroll-view>
		</view>

		<!-- ===== 底部提交 ===== -->
		<view class="fixed-submit-bar">
			<button class="submit-check-btn" :disabled="!canSubmitFinalCheck"
				@tap="handleSubmitFinalCheck">提交检测</button>
		</view>
	</view>
</template>

<script>
	import {
		u_operation
	} from '@/api/index'
	// const { byGet, byPost } = require('../../../utils/request/http')

	const MAX_LOG_COUNT = 50;

	export default {
		data() {
			return {
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
						title: `该分类最多上传${max}张`,
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
						title: '7类图片每类至少上传一张',
						icon: 'none'
					});
					return;
				}
				if (!deviceInfo?.sn) {
					uni.showToast({
						title: '设备信息异常，请重新绑定',
						icon: 'none'
					});
					return;
				}

				this.isUploading = true;
				uni.showLoading({
					title: '开始上传图片...'
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
								title: `正在上传...`
							});
							await this.uploadSingleImage(filePath, groupKey);
						}
					}

					this.isImageUploaded = true
					this.$nextTick(() => {
						this.updateImgReadyState();
						this.checkCanSubmit();
					})
					this.appendTestLog('✅ 图片全部上传成功！可开始功能检测');
					uni.showToast({
						title: '上传成功',
						icon: 'none'
					});
				} catch (error) {
					this.appendTestLog(`❌ 图片上传失败：${error}`);
					uni.showToast({
						title: '上传失败，请重试',
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
						reject('分组异常');
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
								else reject(data.msg || '上传失败');
							} catch (e) {
								reject('数据解析异常');
							}
						},
						fail: () => reject('网络异常')
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
					this.appendTestLog('🎉 网络模式全部检测完成！可提交检测');
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
						title: '请先输入设备号和检验码',
						icon: 'none'
					});
					return false;
				}
				if (!isDeviceBound) {
					uni.showToast({
						title: '请先绑定设备',
						icon: 'none'
					});
					return false;
				}
				if (!isImageUploaded) {
					uni.showToast({
						title: '请先上传现场图片',
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
							title: '请输入完整的设备号和检验码',
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
							title: '结果',
							content: checkRes?.data?.msg || '校验返回1000，终止绑定流程',
							showCancel: false
						});
						return;
					}

					uni.showLoading({
						title: '设备绑定中...',
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
						this.appendTestLog('✅ 设备绑定成功，可进行图片上传');
						uni.showModal({
							title: '结果',
							content: bindResult?.msg,
							showCancel: false
						});
					} else {
						uni.showModal({
							title: '结果',
							content: bindResult.msg || '设备绑定失败',
							showCancel: false
						});
					}
				} catch (error) {
					console.error('设备绑定全流程异常：', error);
					uni.showModal({
						title: '结果',
						content: '绑定请求异常，请检查网络后重试',
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
					this.appendTestLog(`❌【网络】${actionName} 失败：设备信息缺失`);
					return;
				}
				this.setTestStatus(command, 'testing');
				this.appendTestLog(`🚗【网络】开始${actionName} → 设备号：${checkForm.idc}`);
				uni.showLoading({
					title: '指令执行中...'
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
					this.appendTestLog(`✅【网络】${actionName} 成功`);
				} else {
					this.setTestStatus(command, 'fail');
					this.appendTestLog(`❌【网络】${actionName} 失败：${resData.msg || '未知原因'}`);
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
					title: '提交检测结果中...'
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
							title: '提交成功',
							content: '设备全流程检测已完成！',
							showCancel: false,
							success: () => {
								uni.redirectTo({
									url: '/pages/index/index'
								});
							}
						});
					} else {
						uni.showToast({
							title: resData.msg || '提交失败',
							icon: 'none'
						});
						this.appendTestLog(`❌ 提交失败：${resData.msg || '未知错误'}`);
					}
				} catch (err) {
					console.error('提交检测结果失败：', err);
					uni.showToast({
						title: '请求异常，请重试',
						icon: 'none'
					});
					this.appendTestLog('❌ 检测结果提交失败：网络或接口异常');
				} finally {
					uni.hideLoading();
				}
			},
			getTestStatusText(status) {
				const map = {
					testing: '测试中',
					success: '成功',
					fail: '失败'
				};
				return map[status] || '';
			},
			getTestActionText(command) {
				const map = {
					3: '开锁',
					1: '关锁',
					5: '寻车',
					8: '风控拦截',
					6: '取消拦截'
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