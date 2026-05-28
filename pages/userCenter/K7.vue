<template>
	<!-- 页面根容器，整体布局 -->
	<view class="page-container">
		<!-- 上半部分：一个完整大卡片 -->
		<view class="content-box">
			<!-- 主卡片容器，承载所有功能模块 -->
			<view class="main-card">
				<!-- 1. IDC + Code 输入区域 -->
				<view class="form-section">
					<!-- 设备IDC输入项 -->
					<view class="form-item">
						<text class="label">设备号：</text>
						<!-- 双向绑定IDC输入框 -->
						<input v-model="form.idc" class="input" placeholder="请输入设备号(SN)" />
					</view>
					<!-- 设备Code输入项 -->
					<view class="form-item">
						<text class="label">检验码：</text>
						<!-- 双向绑定Code输入框 -->
						<input v-model="form.code" class="input" placeholder="请输入检验码(CODE)" />
					</view>
					<!-- 绑定设备按钮：未输入完整/已绑定时禁用 -->
					<button class="bind-btn" :disabled="!form.idc || !form.code || isBind" @click="bindDevice">
						开始检测
					</button>
				</view>

				<!-- 模块分隔线 -->
				<view class="divider"></view>

				<!-- 2. 图片上传模块 -->
				<view class="upload-section">
					<!-- 上传模块标题 -->
					<view class="upload-title">现场图片上传</view>
					<!-- 上传说明文字 -->
					<view class="upload-subtitle">请拍照上传：车辆名牌、ACC、常火、打铁、主机及回避器、安装位置（最少4张，可多传）</view>

					<!-- 图片列表滚动容器 -->
					<scroll-view scroll-y class="upload-scroll-area">
						<view class="upload-list">
							<!-- 循环渲染已选择的图片 -->
							<view class="upload-item" v-for="(item, idx) in imgList" :key="idx">
								<image :src="item" mode="aspectFill" class="upload-img"></image>
							</view>
							<!-- 图片添加按钮，点击选择图片 -->
							<view class="upload-add" @click="chooseImage">
								<text class="add-icon">+</text>
							</view>
						</view>
					</scroll-view>

					<!-- 确认上传按钮：未绑定/图片不足4张/已上传/上传中时禁用 -->
					<button class="upload-btn" :disabled="!isBind || imgList.length < 4 || isUploadSuccess || uploading"
						@click="uploadImages">
						确认上传图片
					</button>
				</view>

				<view class="divider"></view>

				<!-- 3. 功能检测：仅保留网络模式 -->
				<view class="test-section">
					<view class="step-title">
						<text :class="['step-text', networkStepDone ? 'done' : '']">网络模式检测</text>
					</view>

					<!-- 网络模式检测模块 -->
					<view class="mode-section" :style="{pointerEvents: networkStepDone ? 'none' : 'auto'}">
						<view class="mode-header">
							<text>网络模式</text>
							<text class="tip" v-if="networkStepDone">✅ 已完成</text>
						</view>
						<view class="btn-group">
							<view class="btn-item click-effect" @click="checkAndTest('lock','network')">
								<text>开锁</text>
								<text class="status"
									:class="networkStatus.lockStatus">{{ statusText(networkStatus.lockStatus) }}</text>
							</view>
							<view class="btn-item click-effect" @click="checkAndTest('unlock','network')">
								<text>关锁</text>
								<text class="status"
									:class="networkStatus.unlockStatus">{{ statusText(networkStatus.unlockStatus) }}</text>
							</view>
							<view class="btn-item click-effect" @click="checkAndTest('findCar','network')">
								<text>寻车</text>
								<text class="status"
									:class="networkStatus.findCarStatus">{{ statusText(networkStatus.findCarStatus) }}</text>
							</view>
							<view class="btn-item click-effect" @click="checkAndTest('risk','network')">
								<text>风控拦截</text>
								<text class="status"
									:class="networkStatus.riskStatus">{{ statusText(networkStatus.riskStatus) }}</text>
							</view>
							<view class="btn-item click-effect" @click="checkAndTest('cancelRisk','network')">
								<text>取消拦截</text>
								<text class="status"
									:class="networkStatus.cancelRiskStatus">{{ statusText(networkStatus.cancelRiskStatus) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 日志：独立区块 -->
		<view class="log-box">
			<view class="log-title">测试日志</view>
			<scroll-view scroll-y class="log-content">
				<view class="log-item" v-for="(item, idx) in logList" :key="idx">{{ item }}</view>
			</scroll-view>
		</view>

		<!-- 固定底部按钮 -->
		<view class="fixed-submit">
			<button class="submit-btn" :disabled="!canSubmit" @click="submitCheck">
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
		data() {
			return {
				// 表单数据：设备SN + 检验码
				form: {
					idc: '856020072',
					code: '655058'
				},
				isBind: false, // 是否已绑定设备
				isUploadSuccess: false, // 图片是否全部上传成功
				uploading: false, // 控制上传中状态，防止重复点击
				imgList: [], // 本地选择的图片临时路径列表

				// 网络模式各项检测状态
				networkStatus: {
					lockStatus: '',
					unlockStatus: '',
					findCarStatus: '',
					riskStatus: '',
					cancelRiskStatus: ''
				},

				logList: [], // 日志展示列表
				SNinfo: {
					sn: '856020072',
					code: '655058'
				} // 设备绑定后返回的设备信息
			}
		},

		// 监听：修复 networkStepDone 实时刷新
		watch: {
			networkStepDone(newVal) {
				if (newVal) {
					this.addLog('🎉 网络模式全部检测完成！可提交检测')
				}
			}
		},

		// 计算属性：状态自动判断
		computed: {
			// 网络模式是否全部检测完成
			networkStepDone() {
				const s = this.networkStatus
				return s.lockStatus === 'success' &&
					s.unlockStatus === 'success' &&
					s.findCarStatus === 'success' &&
					s.riskStatus === 'success' &&
					s.cancelRiskStatus === 'success'
			},

			// 提交条件：绑定设备 + 图片上传成功 + 网络检测全部完成
			canSubmit() {
				return this.isBind && this.isUploadSuccess && this.networkStepDone
			}
		},

		methods: {
			/**
			 * 统一操作前置校验
			 * @return {Boolean} 校验通过返回true，否则false
			 */
			checkCanOperate() {
				// 1. 必须输入SN和CODE
				if (!this.form.idc || !this.form.code) {
					uni.showToast({
						title: '请先输入IDC和Code码',
						icon: 'none'
					})
					return false
				}
				// 2. 必须先绑定设备
				if (!this.isBind) {
					uni.showToast({
						title: '请先绑定设备',
						icon: 'none'
					})
					return false
				}
				// 3. 必须先完成图片上传
				if (!this.isUploadSuccess) {
					uni.showToast({
						title: '请先上传图片',
						icon: 'none'
					})
					return false
				}
				return true
			},

			/**
			 * 绑定设备接口请求
			 */
			async bindDevice() {
				// 非空校验
				if (!this.form.idc || !this.form.code) {
					uni.showToast({
						title: '请输入SN和验证码',
						icon: 'none'
					})
					return
				}

				uni.showLoading({
					title: '绑定中...'
				})

				try {
					// 调用绑定接口
					const res = await u_getBluetoothKey({
						sn: this.form.idc,
						code: this.form.code
					})

					if (res.code === 1000) {
						// 绑定成功
						this.isBind = true
						this.SNinfo = res.content || {}
						this.addLog('✅ 设备绑定成功，可以上传图片')
						uni.showToast({
							title: '绑定成功',
							icon: 'none'
						})
					} else {
						// 绑定失败
						uni.showToast({
							title: res.msg || '绑定失败',
							icon: 'none'
						})
					}
				} catch (err) {
					// 接口异常捕获
					console.error('绑定设备异常：', err)
					uni.showToast({
						title: '绑定请求异常',
						icon: 'none'
					})
				} finally {
					// 无论成功失败都关闭loading
					uni.hideLoading()
				}
			},

			/**
			 * 选择本地图片/拍照
			 */
			async chooseImage() {
				try {
					const res = await uni.chooseImage({
						count: 9, // 最多9张
						sizeType: ['compressed'], // 压缩图
						sourceType: ['album', 'camera'] // 相册+拍照
					})
					// 覆盖式更新图片列表
					this.imgList = res.tempFilePaths
				} catch (err) {
					console.log('选择图片取消或失败：', err)
				}
			},

			/**
			 * 批量上传图片：循环调用，全部成功后才执行成功逻辑
			 */
			async uploadImages() {
				// 基础校验
				if (this.imgList.length < 4) {
					uni.showToast({
						title: '至少上传4张图片',
						icon: 'none'
					})
					return
				}
				if (!this.SNinfo?.sn) {
					uni.showToast({
						title: '设备信息异常，请重新绑定',
						icon: 'none'
					})
					return
				}

				// 上锁：上传中禁止重复点击
				this.uploading = true
				uni.showLoading({
					title: '开始上传图片...'
				})

				// 循环上传所有图片，等待全部完成
				for (let i = 0; i < this.imgList.length; i++) {
					const filePath = this.imgList[i]
					uni.showLoading({
						title: `正在上传第 ${i+1}/${this.imgList.length} 张`
					})

					// 单张上传，失败直接抛出异常，终止整个上传
					try {
						await this.uploadSingleImage(filePath)
					} catch (err) {
						uni.hideLoading()
						uni.showToast({
							title: `第${i+1}张上传失败，上传终止`,
							icon: 'none'
						})
						this.addLog(`❌ 第${i+1}张图片上传失败：${err}`)
						this.uploading = false
						return
					}
				}

				// ======================
				// 所有图片全部上传成功
				// ======================
				uni.hideLoading()
				this.isUploadSuccess = true
				this.uploading = false

				// 你要求的成功后统一执行逻辑
				this.addLog('✅ 图片上传成功！可开始功能检测')
				uni.showToast({
					title: '上传成功',
					icon: 'none'
				})
			},

			/**
			 * 单张图片上传（Promise化，支持异步等待）
			 * @param {String} filePath 图片临时路径
			 * @return Promise
			 */
			uploadSingleImage(filePath) {
				return new Promise((resolve, reject) => {
					// 获取用户token
					const userInfo = uni.getStorageSync('user_info') || {}
					const token = userInfo.token || ''

					// 执行上传
					uni.uploadFile({
						url: 'https://k1sw.wiselink.net.cn/k7Api/uploadInstallImg',
						filePath: filePath,
						name: 'installImgs',
						header: {
							token
						},
						formData: {
							sn: this.SNinfo.sn
						},

						// 上传成功
						success: (uploadRes) => {
							try {
								const data = JSON.parse(uploadRes.data)
								// 接口返回成功
								if (data.code === 1000) {
									resolve(true)
								} else {
									reject(data.msg || '上传失败')
								}
							} catch (e) {
								reject('返回数据解析失败')
							}
						},

						// 上传失败
						fail: () => reject('网络异常，上传失败')
					})
				})
			},

			/**
			 * 检测前校验 + 执行测试
			 * @param {String} type 操作类型
			 * @param {String} mode 模式：network
			 */
			// 策略模式：根据 type + mode 分发不同执行逻辑
			checkAndTest(type, mode) {
				// 前置统一校验
				if (!this.checkCanOperate()) return;

				const strategy = {
					// --------------------
					// network 网络模式
					// --------------------
					"lock_network": () => {
						this.testAction(3, "network");
					},
					"unlock_network": () => {
						this.testAction(1, "network");
					},
					"findCar_network": () => {
						this.testAction(5, "network");
					},
					"risk_network": () => {
						this.testAction(8, "network");
					},
					"cancelRisk_network": () => {
						this.testAction(6, "network");
					},
				};

				// 拼接策略KEY：type_mode
				const key = `${type}_${mode}`;

				// 执行对应策略
				if (strategy[key]) {
					strategy[key]();
				}
			},

			/**
			 * 执行功能测试
			 * @param {String} type 测试项
			 * @param {String} mode 模式
			 */
			async testAction(type, mode) {
				console.log(type)
				if (mode == 'network') {
					this.setStatus(type, mode, 'testing')
					this.addLog(`🚗【网络】开始${this.actionText(type)} → IDC:${this.form.idc}`)
					const res = await u_operation({
						sn: this.SNinfo?.sn,
						operationType: type,
						code: this.SNinfo?.code,
						_timestamp: Date.now()
					});
					console.log(res)
					if (res?.code == 1000) {
						console.log(res.code)

						// 风控相关操作弹窗提示
						if ((type === 8 || type === 6) && mode === 'network') {
							uni.showModal({
								title: '请确认车辆启动状态',
								content: `${this.actionText(type)}指令已执行，请启动车辆后选择实际状态`,
								confirmText: '已正常启动',
								cancelText: '无法启动',
								showCancel: true,
								success: (res) => {
									console.log('用户选择结果：', res)

									// ====================
									// 点击：已正常启动
									// ====================
									if (res.confirm) {
										if (type == 8) {
											// 8：启动成功 = 失败
											this.addLog(`❌ ${this.actionText(type)} → 车辆启动成功，检测失败`)
											this.setStatus(type, 'network', 'fail')
										} else if (type == 6) {
											// 6：启动成功 = 成功
											this.addLog(`✅ ${this.actionText(type)} → 车辆启动成功，检测成功`)
											this.setStatus(type, 'network', 'success')
										}
									}

									// ====================
									// 点击：无法启动
									// ====================
									else if (res.cancel) {
										if (type == 8) {
											// 8：启动失败 = 成功
											this.addLog(`✅ ${this.actionText(type)} → 车辆无法启动，检测成功`)
											this.setStatus(type, 'network', 'success')
										} else if (type == 6) {
											// 6：启动失败 = 失败
											this.addLog(`❌ ${this.actionText(type)} → 车辆无法启动，检测失败`)
											this.setStatus(type, 'network', 'fail')
										}
									}
								}
							})
						} else {
							this.setStatus(type, mode, 'success')
							this.addLog(`${ '✅' }【网络】${this.actionText(type)} ${'成功'}`)
						}

					} else {
						this.setStatus(type, 'network', 'fail')
						this.addLog(`❌ ${this.actionText(type)} → ${res?.msg}`)
					}
				}
			},

			/**
			 * 统一设置测试状态（修复：使用 $set 保证响应式）
			 * @param {String} type 操作类型
			 * @param {String} mode 模式
			 * @param {String} status 状态值：testing/success/fail
			 */
			setStatus(type, mode, status) {
				const keyMap = {
					3: 'lockStatus',
					1: 'unlockStatus',
					5: 'findCarStatus',
					8: 'riskStatus',
					6: 'cancelRiskStatus'
				}
				// 核心修复：强制 Vue 监听对象变更
				this.$set(this.networkStatus, keyMap[type], status)
			},

			/**
			 * 提交最终检测结果
			 */
			submitCheck() {
				uni.showModal({
					title: '提交成功',
					content: '设备全流程检测已完成！',
					showCancel: false
				})
				this.addLog('✅ 检测流程全部完成，已提交')
			},

			/**
			 * 状态文本转换
			 */
			statusText(s) {
				return s === 'testing' ? '测试中' :
					s === 'success' ? '成功' :
					s === 'fail' ? '失败' : ''
			},

			/**
			 * 操作文本转换
			 */
			actionText(t) {
				return {
					3: '关锁',
					1: '开锁',
					5: '寻车',
					8: '风控拦截',
					6: '取消拦截'
				} [t] || t
			},

			/**
			 * 添加日志（自动追加时间）
			 * @param {String} text 日志内容
			 */
			addLog(text) {
				const time = new Date().toLocaleTimeString()
				this.logList.unshift(`[${time}] ${text}`)
			}
		}
	}
</script>

<style scoped>
	.page-container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #f5f7fa;
		box-sizing: border-box;
		padding-bottom: 100rpx;
	}

	.content-box {
		flex: 0 0 70%;
		overflow-y: auto;
		padding: 30rpx 20rpx 0;
	}

	.main-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.divider {
		height: 1rpx;
		background: #f0f0f0;
		margin: 40rpx 0;
	}

	.log-box {
		flex: 0 0 25%;
		background: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin: 30rpx 20rpx 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.fixed-submit {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100rpx;
		background: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		padding: 0 20rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.submit-btn {
		width: 100%;
		height: 70rpx;
		background: #007aff;
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		border-radius: 12rpx;
	}

	.submit-btn[disabled] {
		background: #ccc !important;
	}

	.form-item {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.label {
		width: 150rpx;
		font-size: 28rpx;
		color: #333;
	}

	.input {
		flex: 1;
		height: 70rpx;
		border: 2rpx solid #eee;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
	}

	.bind-btn,
	.upload-btn {
		width: 100%;
		color: #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		padding: 14rpx 0;
	}

	.bind-btn {
		background: #007aff;
		margin-top: 10rpx;
	}

	.upload-btn {
		background: #07c160;
	}

	button[disabled] {
		background: #ccc !important;
		color: #fff !important;
	}

	.upload-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.upload-subtitle {
		font-size: 24rpx;
		color: #fa8c16;
		margin-bottom: 20rpx;
		line-height: 1.4;
	}

	.upload-scroll-area {
		max-height: 380rpx;
		background: #fafbfc;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 24rpx;
		box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #eee;
	}

	.upload-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.upload-item {
		width: 150rpx;
		height: 150rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.upload-img {
		width: 100%;
		height: 100%;
	}

	.upload-add {
		width: 150rpx;
		height: 150rpx;
		border: 2rpx dashed #ccc;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
	}

	.add-icon {
		font-size: 40rpx;
		color: #999;
	}

	.step-title {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
		font-size: 30rpx;
		font-weight: bold;
	}

	.step-text {
		color: #333;
	}

	.step-text.done {
		color: #00b42a;
	}

	.mode-section {
		margin-bottom: 24rpx;
	}

	.mode-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 29rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
		color: #007aff;
	}

	.tip {
		font-size: 24rpx;
		color: #999;
		font-weight: normal;
	}

	.can-operate {
		pointer-events: auto;
	}

	.btn-group {
		gap: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.btn-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 24rpx;
		background: #fafafa;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.04);
	}

	.click-effect:active {
		background: #eee;
		transform: scale(0.98);
	}

	.status {
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		min-width: 100rpx;
		text-align: center;
	}

	.status.testing {
		background: #fff7e6;
		color: #fa8c16;
	}

	.status.success {
		background: #e6ffed;
		color: #00b42a;
	}

	.status.fail {
		background: #fff2f0;
		color: #ff4d4f;
	}

	.log-title {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 12rpx;
	}

	.log-content {
		flex: 1;
		width: 100%;
		box-sizing: border-box;
		background: #f9f9f9;
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
</style>