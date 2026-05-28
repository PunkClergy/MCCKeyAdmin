<template>
	<!-- 页面根容器：设备检测全流程主页面 -->
	<view class="device-check-page">
		<!-- 内容主体区域：表单 + 上传 + 功能检测 -->
		<view class="content-wrapper">
			<!-- 主内容卡片：统一视觉容器 -->
			<view class="main-content-card">

				<!-- ==================== 1. 设备信息绑定模块 ==================== -->
				<view class="device-bind-section">
					<view class="form-item">
						<text class="form-label">设备号：</text>
						<input v-model="checkForm.idc" class="form-input" placeholder="请输入设备号(SN)" />
					</view>

					<view class="form-item">
						<text class="form-label">检验码：</text>
						<input v-model="checkForm.code" class="form-input" placeholder="请输入检验码(CODE)" />
					</view>

					<!-- 绑定设备按钮：未输入完整/已绑定时禁用 -->
					<button class="bind-device-btn" :disabled="!checkForm.idc || !checkForm.code || isDeviceBound"
						@click="handleDeviceBind">
						开始检测
					</button>
				</view>

				<!-- 模块分隔线 -->
				<view class="section-divider"></view>

				<!-- ==================== 2. 现场图片上传模块 ==================== -->
				<view class="image-upload-section">
					<view class="upload-title">现场图片上传</view>
					<view class="upload-tip">
						请拍照上传：车辆名牌、ACC、常火、打铁、主机及回避器、安装位置（最少4张，可多传）
					</view>

					<!-- 图片列表滚动容器 -->
					<scroll-view scroll-y class="upload-scroll-container">
						<view class="image-list">
							<!-- 已上传图片 -->
							<view class="image-item" v-for="(imagePath, index) in selectedImageList" :key="index">
								<image :src="imagePath" mode="aspectFill" class="preview-image"></image>
							</view>

							<!-- 添加图片按钮 -->
							<view class="add-image-btn" @click="handleChooseImage">
								<text class="add-icon">+</text>
							</view>
						</view>
					</scroll-view>

					<!-- 确认上传按钮 -->
					<button class="confirm-upload-btn"
						:disabled="!isDeviceBound || selectedImageList.length < 4 || isImageUploaded || isUploading"
						@click="handleBatchUploadImages">
						确认上传图片
					</button>
				</view>

				<view class="section-divider"></view>

				<!-- ==================== 3. 网络模式功能检测 ==================== -->
				<view class="network-check-section">
					<view class="section-title">
						<text :class="['title-text', isNetworkTestFinished ? 'finished' : '']">
							网络模式检测
						</text>
					</view>

					<!-- 网络检测操作区 -->
					<view class="network-test-container"
						:style="{ pointerEvents: isNetworkTestFinished ? 'none' : 'auto' }">
						<view class="test-header">
							<text>网络模式操作</text>
							<text class="finish-tip" v-if="isNetworkTestFinished">✅ 已完成</text>
						</view>

						<view class="test-btn-group">
							<view class="test-btn-item click-effect" @click="handleNetworkTest('lock')">
								<text>开锁</text>
								<text class="test-status" :class="networkTestStatus.lockStatus">
									{{ getTestStatusText(networkTestStatus.lockStatus) }}
								</text>
							</view>

							<view class="test-btn-item click-effect" @click="handleNetworkTest('unlock')">
								<text>关锁</text>
								<text class="test-status" :class="networkTestStatus.unlockStatus">
									{{ getTestStatusText(networkTestStatus.unlockStatus) }}
								</text>
							</view>

							<view class="test-btn-item click-effect" @click="handleNetworkTest('findCar')">
								<text>寻车</text>
								<text class="test-status" :class="networkTestStatus.findCarStatus">
									{{ getTestStatusText(networkTestStatus.findCarStatus) }}
								</text>
							</view>

							<view class="test-btn-item click-effect" @click="handleNetworkTest('risk')">
								<text>风控拦截</text>
								<text class="test-status" :class="networkTestStatus.riskStatus">
									{{ getTestStatusText(networkTestStatus.riskStatus) }}
								</text>
							</view>

							<view class="test-btn-item click-effect" @click="handleNetworkTest('cancelRisk')">
								<text>取消拦截</text>
								<text class="test-status" :class="networkTestStatus.cancelRiskStatus">
									{{ getTestStatusText(networkTestStatus.cancelRiskStatus) }}
								</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- ==================== 实时日志展示模块 ==================== -->
		<view class="test-log-section">
			<view class="log-title">测试日志</view>
			<scroll-view scroll-y class="log-content-container">
				<view class="log-item" v-for="(log, index) in testLogList" :key="index">
					{{ log }}
				</view>
			</scroll-view>
		</view>

		<!-- ==================== 底部固定提交按钮 ==================== -->
		<view class="fixed-submit-bar">
			<button class="submit-check-btn" :disabled="!canSubmitFinalCheck" @click="handleSubmitFinalCheck">
				提交检测
			</button>
		</view>
	</view>
</template>

<script>
	import {
		u_getBluetoothKey,
		u_uploadInstallImg,
		u_operation
	} from '@/api/index'

	export default {
		/**
		 * 设备检测页面
		 * 功能：设备绑定 → 图片上传 → 网络功能检测 → 提交检测结果
		 */
		name: 'DeviceCheckPage',

		data() {
			return {
				// 检测表单：设备SN + 校验码
				checkForm: {
					idc: '',
					code: ''
				},

				// 设备绑定状态
				isDeviceBound: false,
				// 设备信息（绑定成功后返回）
				deviceInfo: {
					sn: '',
					code: ''
				},

				// 图片上传相关
				selectedImageList: [], // 已选择的本地图片临时路径
				isImageUploaded: false, // 图片是否全部上传成功
				isUploading: false, // 上传中状态，防止重复提交

				// 网络模式各项检测状态
				networkTestStatus: {
					lockStatus: '',
					unlockStatus: '',
					findCarStatus: '',
					riskStatus: '',
					cancelRiskStatus: ''
				},

				// 测试日志列表
				testLogList: []
			}
		},

		watch: {
			/**
			 * 监听网络检测是否全部完成
			 */
			isNetworkTestFinished(newVal) {
				if (newVal) {
					this.appendTestLog('🎉 网络模式全部检测完成！可提交检测')
				}
			}
		},

		computed: {
			/**
			 * 网络模式是否全部检测完成
			 * @return {Boolean}
			 */
			isNetworkTestFinished() {
				const status = this.networkTestStatus
				return (
					status.lockStatus === 'success' &&
					status.unlockStatus === 'success' &&
					status.findCarStatus === 'success' &&
					status.riskStatus === 'success' &&
					status.cancelRiskStatus === 'success'
				)
			},

			/**
			 * 是否满足最终提交条件
			 * 条件：设备已绑定 + 图片已上传 + 网络检测全部完成
			 * @return {Boolean}
			 */
			canSubmitFinalCheck() {
				return this.isDeviceBound && this.isImageUploaded && this.isNetworkTestFinished
			}
		},

		methods: {
			/**
			 * 统一操作前置校验
			 * 校验规则：
			 * 1. 必须输入SN和CODE
			 * 2. 必须先绑定设备
			 * 3. 必须先完成图片上传
			 * @return {Boolean} 校验通过返回true
			 */
			validateBeforeOperate() {
				// 1. 校验SN和CODE
				if (!this.checkForm.idc || !this.checkForm.code) {
					uni.showToast({
						title: '请先输入设备号和检验码',
						icon: 'none'
					})
					return false
				}

				// 2. 校验设备是否绑定
				if (!this.isDeviceBound) {
					uni.showToast({
						title: '请先绑定设备',
						icon: 'none'
					})
					return false
				}

				// 3. 校验图片是否上传
				if (!this.isImageUploaded) {
					uni.showToast({
						title: '请先上传现场图片',
						icon: 'none'
					})
					return false
				}

				return true
			},

			/**
			 * 绑定设备
			 * 调用接口获取设备密钥
			 */
			async handleDeviceBind() {
				// 非空校验
				if (!this.checkForm.idc || !this.checkForm.code) {
					uni.showToast({
						title: '请输入完整的设备号和检验码',
						icon: 'none'
					})
					return
				}

				uni.showLoading({
					title: '设备绑定中...'
				})

				try {
					// 调用绑定接口
					const res = await u_getBluetoothKey({
						sn: this.checkForm.idc,
						code: this.checkForm.code
					})

					if (res.code === 1000) {
						// 绑定成功
						this.isDeviceBound = true
						this.deviceInfo = res.content || {}
						this.appendTestLog('✅ 设备绑定成功，可进行图片上传')
						uni.showToast({
							title: '绑定成功',
							icon: 'none'
						})
					} else {
						// 绑定失败
						uni.showToast({
							title: res.msg || '设备绑定失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('设备绑定接口异常：', error)
					uni.showToast({
						title: '绑定请求异常',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},

			/**
			 * 选择图片（拍照/相册）
			 * 最多选择9张，自动压缩
			 */
			async handleChooseImage() {
				try {
					const res = await uni.chooseImage({
						count: 9,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					})
					// 覆盖更新图片列表
					this.selectedImageList = res.tempFilePaths
				} catch (error) {
					console.log('选择图片取消或失败：', error)
				}
			},

			/**
			 * 批量上传图片
			 * 必须 ≥4张，全部上传成功后才标记完成
			 */
			async handleBatchUploadImages() {
				// 基础校验
				if (this.selectedImageList.length < 4) {
					uni.showToast({
						title: '至少上传4张现场图片',
						icon: 'none'
					})
					return
				}
				if (!this.deviceInfo?.sn) {
					uni.showToast({
						title: '设备信息异常，请重新绑定',
						icon: 'none'
					})
					return
				}

				// 锁定上传状态
				this.isUploading = true
				uni.showLoading({
					title: '开始上传图片...'
				})

				try {
					// 循环上传所有图片
					const total = this.selectedImageList.length
					for (let i = 0; i < total; i++) {
						const path = this.selectedImageList[i]
						uni.showLoading({
							title: `正在上传第 ${i + 1}/${total} 张`
						})
						await this.uploadSingleImage(path)
					}

					// 全部上传成功
					this.isImageUploaded = true
					this.appendTestLog('✅ 图片全部上传成功！可开始功能检测')
					uni.showToast({
						title: '上传成功',
						icon: 'none'
					})
				} catch (error) {
					this.appendTestLog(`❌ 图片上传失败：${error}`)
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
					this.isUploading = false
				}
			},

			/**
			 * 单张图片上传（Promise封装）
			 * @param {String} filePath 图片临时路径
			 * @return Promise
			 */
			uploadSingleImage(filePath) {
				return new Promise((resolve, reject) => {
					// 获取用户登录令牌
					const userInfo = uni.getStorageSync('user_info') || {}
					const token = userInfo.token || ''

					uni.uploadFile({
						url: 'https://k1sw.wiselink.net.cn/k7Api/uploadInstallImg',
						filePath,
						name: 'installImgs',
						header: {
							token
						},
						formData: {
							sn: this.deviceInfo.sn
						},

						success: (uploadRes) => {
							try {
								const data = JSON.parse(uploadRes.data)
								if (data.code === 1000) resolve()
								else reject(data.msg || '上传失败')
							} catch (e) {
								reject('数据解析异常')
							}
						},

						fail: () => reject('网络异常')
					})
				})
			},

			/**
			 * 网络检测统一入口
			 * @param {String} testType 检测类型
			 */
			handleNetworkTest(testType) {
				if (!this.validateBeforeOperate()) return

				// 策略映射：操作类型 → 接口指令码
				const commandMap = {
					lock: 3,
					unlock: 1,
					findCar: 5,
					risk: 8,
					cancelRisk: 6
				}

				const command = commandMap[testType]
				if (!command) return

				this.executeNetworkTestAction(command, testType)
			},

			/**
			 * 执行网络测试指令
			 * @param {Number} command 接口指令
			 * @param {String} testType 操作类型
			 */
			async executeNetworkTestAction(command, testType) {
				// 1. 设置测试中状态
				this.setTestStatus(command, 'testing')
				const actionName = this.getTestActionText(command)
				this.appendTestLog(`🚗【网络】开始${actionName} → 设备号：${this.checkForm.idc}`)

				// 2. 调用操作接口
				const res = await u_operation({
					sn: this.deviceInfo?.sn,
					operationType: command,
					code: this.deviceInfo?.code,
					_timestamp: Date.now()
				})

				// 3. 接口返回成功
				if (res?.code === 1000) {
					// 风控类操作需要弹窗确认车辆状态
					if (command === 8 || command === 6) {
						this.showRiskConfirmModal(command, actionName)
					} else {
						this.setTestStatus(command, 'success')
						this.appendTestLog(`✅【网络】${actionName} 成功`)
					}
				} else {
					// 接口失败
					this.setTestStatus(command, 'fail')
					this.appendTestLog(`❌【网络】${actionName} 失败：${res?.msg}`)
				}
			},

			/**
			 * 风控操作确认弹窗
			 * @param {Number} command 指令
			 * @param {String} actionName 操作名称
			 */
			showRiskConfirmModal(command, actionName) {
				uni.showModal({
					title: '请确认车辆启动状态',
					content: `${actionName}指令已执行，请启动车辆后选择实际状态`,
					confirmText: '已正常启动',
					cancelText: '无法启动',
					success: (res) => {
						if (res.confirm) {
							// 已启动
							const status = command === 8 ? 'fail' : 'success'
							const logMsg =
								command === 8 ?
								'车辆启动成功 → 检测失败' :
								'车辆启动成功 → 检测成功'
							this.appendTestLog(
								`${status === 'success' ? '✅' : '❌'}【网络】${actionName} ${logMsg}`)
							this.setTestStatus(command, status)
						} else if (res.cancel) {
							// 未启动
							const status = command === 8 ? 'success' : 'fail'
							const logMsg =
								command === 8 ?
								'车辆无法启动 → 检测成功' :
								'车辆无法启动 → 检测失败'
							this.appendTestLog(
								`${status === 'success' ? '✅' : '❌'}【网络】${actionName} ${logMsg}`)
							this.setTestStatus(command, status)
						}
					}
				})
			},

			/**
			 * 统一设置测试状态（保证响应式）
			 * @param {Number} command 指令码
			 * @param {String} status 状态：testing / success / fail
			 */
			setTestStatus(command, status) {
				const statusKeyMap = {
					3: 'lockStatus',
					1: 'unlockStatus',
					5: 'findCarStatus',
					8: 'riskStatus',
					6: 'cancelRiskStatus'
				}
				const key = statusKeyMap[command]
				if (key) this.$set(this.networkTestStatus, key, status)
			},

			/**
			 * 提交最终检测结果
			 * 调用接口：http://fin3.wiselink.net.cn/fin/deviceTes/saveResult
			 * 参数：
			 * idc: 设备idc
			 * checkType: 0蓝牙 1网络
			 * checkState: 0失败 1成功
			 */
			async handleSubmitFinalCheck() {
				// 接口必填参数
				const idc = this.checkForm.idc;
				const checkType = 1; // 1=网络模式（你当前只有网络检测）
				const checkState = 1; // 1=成功（走到这里说明全部检测通过）

				// 显示加载
				uni.showLoading({
					title: '提交检测结果中...'
				});

				try {
					// 调用提交接口
					const res = await uni.request({
						url: 'http://fin3.wiselink.net.cn/fin/deviceTes/saveResult',
						method: 'GET',
						data: {
							idc,
							checkType,
							checkState
						}
					});

					// 接口返回成功（根据实际接口返回格式判断）
					console.log('提交检测结果接口返回：', res);

					// 提示成功
					uni.showModal({
						title: '提交成功',
						content: '设备全流程检测已完成！',
						showCancel: false,
						success: () => {
							uni.redirectTo({
								url: '/pages/index/index'
							})
						}
					});

				} catch (err) {
					console.error('提交检测结果失败：', err);
					uni.showToast({
						title: '提交失败，请重试',
						icon: 'none'
					});
					this.appendTestLog('❌ 检测结果提交失败：网络或接口异常');
				} finally {
					uni.hideLoading();
				}
			},

			/**
			 * 获取状态显示文本
			 */
			getTestStatusText(status) {
				return {
					testing: '测试中',
					success: '成功',
					fail: '失败'
				} [status] || ''
			},

			/**
			 * 获取操作名称文本
			 */
			getTestActionText(command) {
				return {
					3: '开锁',
					1: '关锁',
					5: '寻车',
					8: '风控拦截',
					6: '取消拦截'
				} [command] || command
			},

			/**
			 * 追加日志（自动带时间）
			 * @param {String} content 日志内容
			 */
			appendTestLog(content) {
				const time = new Date().toLocaleTimeString()
				this.testLogList.unshift(`[${time}] ${content}`)
			}
		}
	}
</script>

<style scoped>
	/* 页面根容器 */
	.device-check-page {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f7fa;
		box-sizing: border-box;
		padding-bottom: 100rpx;
	}

	/* 内容主体 */
	.content-wrapper {
		flex: 0 0 70%;
		overflow-y: auto;
		padding: 30rpx 20rpx 0;
	}

	/* 主内容卡片 */
	.main-content-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	/* 模块分隔线 */
	.section-divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 40rpx 0;
	}

	/* 表单项目 */
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

	/* 绑定设备按钮 */
	.bind-device-btn {
		width: 100%;
		background-color: #007aff;
		color: #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		padding: 14rpx 0;
		margin-top: 10rpx;
	}

	/* 图片上传模块 */
	.image-upload-section .upload-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.image-upload-section .upload-tip {
		font-size: 24rpx;
		color: #fa8c16;
		margin-bottom: 20rpx;
		line-height: 1.4;
	}

	/* 图片上传滚动容器 */
	.upload-scroll-container {
		max-height: 380rpx;
		background-color: #fafbfc;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 24rpx;
		box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #eee;
	}

	/* 图片列表 */
	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.image-item {
		width: 150rpx;
		height: 150rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.preview-image {
		width: 100%;
		height: 100%;
	}

	/* 添加图片按钮 */
	.add-image-btn {
		width: 150rpx;
		height: 150rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
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

	/* 按钮禁用状态 */
	button[disabled] {
		background-color: #ccc !important;
		color: #fff !important;
	}

	/* 网络检测模块标题 */
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

	/* 网络检测容器 */
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

	/* 检测按钮组 */
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

	/* 检测状态标签 */
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

	/* 日志模块 */
	.test-log-section {
		flex: 0 0 25%;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin: 30rpx 20rpx 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.log-title {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
	}

	.log-content-container {
		flex: 1;
		width: 100%;
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

	/* 底部固定提交栏 */
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

	.submit-check-btn[disabled] {
		background-color: #ccc !important;
	}
</style>