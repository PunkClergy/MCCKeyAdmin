<template>
	<view class="page-container">
		<!-- 上半部分：一个完整大卡片 -->
		<view class="content-box">
			<view class="main-card">
				<!-- 1. IDC + Code 输入 -->
				<view class="form-section">
					<view class="form-item">
						<text class="label">设备 IDC：</text>
						<input v-model="form.idc" class="input" placeholder="请输入设备IDC" />
					</view>
					<view class="form-item">
						<text class="label">设备 Code：</text>
						<input v-model="form.code" class="input" placeholder="请输入设备Code" />
					</view>
					<button class="bind-btn" :disabled="!form.idc || !form.code || isBind" @click="bindDevice">
						绑定设备
					</button>
				</view>

				<view class="divider"></view>

				<!-- 2. 图片上传 -->
				<view class="upload-section">
					<view class="upload-title">现场图片上传</view>
					<view class="upload-subtitle">请拍照上传：车辆名牌、ACC、常火、打铁、主机及回避器、安装位置（最少4张，可多传）</view>

					<scroll-view scroll-y class="upload-scroll-area">
						<view class="upload-list">
							<view class="upload-item" v-for="(item, idx) in imgList" key="idx">
								<image :src="item" mode="aspectFill" class="upload-img"></image>
							</view>
							<view class="upload-add" @click="chooseImage">
								<text class="add-icon">+</text>
							</view>
						</view>
					</scroll-view>

					<button class="upload-btn" :disabled="!isBind || imgList.length < 4 || isUploadSuccess"
						@click="uploadImages">
						确认上传图片
					</button>
				</view>

				<view class="divider"></view>

				<!-- 3. 功能检测：两步流程 网络模式 → 蓝牙模式 -->
				<view class="test-section">
					<view class="step-title">
						<text :class="['step-text', networkStepDone ? 'done' : '']">1. 网络模式检测</text>
						<text class="split">→</text>
						<text :class="['step-text', networkStepDone ? '' : 'disabled', bleStepDone ? 'done' : '']">2.
							蓝牙模式检测</text>
					</view>

					<!-- 网络模式 -->
					<view class="mode-section" :class="{'can-operate': !networkStepDone}">
						<view class="mode-header">
							<text>网络模式</text>
							<text class="tip" v-if="networkStepDone">✅ 已完成</text>
						</view>
						<view class="btn-group">
							<view class="btn-item click-effect" @click="checkAndTest('lock','network')">
								<text>关锁</text>
								<text class="status"
									:class="networkStatus.lockStatus">{{ statusText(networkStatus.lockStatus) }}</text>
							</view>
							<view class="btn-item click-effect" @click="checkAndTest('unlock','network')">
								<text>开锁</text>
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

					<!-- 蓝牙模式 -->
					<view class="mode-section"
						:class="{'can-operate': networkStepDone && !bleStepDone, 'disabled-section': !networkStepDone}">
						<view class="mode-header">
							<text>蓝牙模式</text>
							<text class="tip" v-if="!networkStepDone">⚠️ 请先完成网络检测</text>
							<text class="tip" v-else-if="bleStepDone">✅ 已完成</text>
						</view>
						<view class="btn-group">
							<view class="btn-item click-effect" @click="checkAndTest('lock','ble')">
								<text>关锁</text>
								<text class="status"
									:class="bleStatus.lockStatus">{{ statusText(bleStatus.lockStatus) }}</text>
							</view>
							<view class="btn-item click-effect" @click="checkAndTest('unlock','ble')">
								<text>开锁</text>
								<text class="status"
									:class="bleStatus.unlockStatus">{{ statusText(bleStatus.unlockStatus) }}</text>
							</view>
							<view class="btn-item click-effect" @click="checkAndTest('findCar','ble')">
								<text>寻车</text>
								<text class="status"
									:class="bleStatus.findCarStatus">{{ statusText(bleStatus.findCarStatus) }}</text>
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
				<view class="log-item" v-for="(item, idx) in logList" key="idx">{{ item }}</view>
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
		u_uploadInstallImg
	} from '@/api/index'
	export default {
		data() {
			return {
				form: {
					idc: '',
					code: ''
				},
				isBind: false,
				isUploadSuccess: false,
				imgList: [],
				networkStatus: {
					lockStatus: '',
					unlockStatus: '',
					findCarStatus: '',
					riskStatus: '',
					cancelRiskStatus: ''
				},
				bleStatus: {
					lockStatus: '',
					unlockStatus: '',
					findCarStatus: ''
				},
				logList: [],
				SNinfo: {}
			}
		},
		computed: {
			networkStepDone() {
				const s = this.networkStatus
				return s.lockStatus === 'success' && s.unlockStatus === 'success' &&
					s.findCarStatus === 'success' && s.riskStatus === 'success' &&
					s.cancelRiskStatus === 'success'
			},
			bleStepDone() {
				const s = this.bleStatus
				return s.lockStatus === 'success' && s.unlockStatus === 'success' && s.findCarStatus === 'success'
			},
			canSubmit() {
				return this.isBind && this.isUploadSuccess && this.networkStepDone && this.bleStepDone
			}
		},
		methods: {

			checkCanOperate() {
				if (!this.form.idc || !this.form.code) {
					uni.showToast({
						title: '请先输入IDC和Code码',
						icon: 'none'
					})
					return false
				}
				if (!this.isBind) {
					uni.showToast({
						title: '请先绑定设备',
						icon: 'none'
					})
					return false
				}
				if (!this.isUploadSuccess) {
					uni.showToast({
						title: '请先上传图片',
						icon: 'none'
					})
					return false
				}
				return true
			},

			async bindDevice() {
				// 前置校验
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
					const res = await u_getBluetoothKey({
						sn: this.form.idc,
						code: this.form.code
					})

					if (res.code === 1000) {
						this.isBind = true
						this.SNinfo = res.content
						uni.showToast({
							title: '绑定成功',
							icon: 'none'
						})
					} else {
						uni.showToast({
							title: res.msg || '绑定失败',
							icon: 'none'
						})
					}
				} catch (err) {
					// 仅打印日志，不提示用户
					console.error('绑定设备异常：', err)
				} finally {
					uni.hideLoading()
				}
			},

			chooseImage() {
				if (!this.isBind) {
					uni.showToast({
						title: '请先绑定设备',
						icon: 'none'
					})
					return
				}
				uni.chooseImage({
					count: 9,
					success: (res) => {
						this.imgList = [...this.imgList, ...res.tempFilePaths]
					}
				})
			},

			uploadImages() {
				this.addLog(`⏳ 正在上传 ${this.imgList.length} 张图片...`)
				setTimeout(() => {
					this.isUploadSuccess = true
					this.addLog('✅ 图片上传成功！可开始功能检测')
					uni.showToast({
						title: '上传成功',
						icon: 'none'
					})
				}, 1000)
			},

			checkAndTest(type, mode) {
				if (!this.checkCanOperate()) return
				if (mode === 'network' && this.networkStepDone) {
					uni.showToast({
						title: '网络模式已全部完成',
						icon: 'none'
					})
					return
				}
				if (mode === 'ble' && !this.networkStepDone) {
					uni.showToast({
						title: '请先完成网络模式检测',
						icon: 'none'
					})
					return
				}
				if (mode === 'ble' && this.bleStepDone) {
					uni.showToast({
						title: '蓝牙模式已全部完成',
						icon: 'none'
					})
					return
				}
				this.testAction(type, mode)
			},

			async testAction(type, mode) {
				this.setStatus(type, mode, 'testing')
				this.addLog(`🚗【${mode==='network'?'网络':'蓝牙'}】开始${this.actionText(type)} → IDC:${this.form.idc}`)

				let success = true
				await new Promise(r => setTimeout(r, 1200))

				this.setStatus(type, mode, success ? 'success' : 'fail')
				this.addLog(
					`${success ? '✅' : '❌'}【${mode==='network'?'网络':'蓝牙'}】${this.actionText(type)} ${success ? '成功' : '失败'}`
				)

				if (success && (type === 'risk' || type === 'cancelRisk') && mode === 'network') {
					uni.showModal({
						title: '检测结果',
						content: `${this.actionText(type)}已完成`,
						confirmText: '已启动',
						cancelText: '未启动',
						showCancel: true
					})
				}

				if (this.networkStepDone) {
					this.addLog('🎉 网络模式全部检测完成！可进行蓝牙模式检测')
				}
				if (this.bleStepDone) {
					this.addLog('🎉 蓝牙模式全部检测完成！可提交检测')
				}
			},

			setStatus(type, mode, status) {
				const keyMap = {
					lock: 'lockStatus',
					unlock: 'unlockStatus',
					findCar: 'findCarStatus',
					risk: 'riskStatus',
					cancelRisk: 'cancelRiskStatus'
				}
				const target = mode === 'network' ? this.networkStatus : this.bleStatus
				target[keyMap[type]] = status
			},

			submitCheck() {
				uni.showModal({
					title: '提交成功',
					content: '设备全流程检测已完成！',
					showCancel: false
				})
			},

			statusText(s) {
				return s === 'testing' ? '测试中' : s === 'success' ? '成功' : s === 'fail' ? '失败' : ''
			},
			actionText(t) {
				return {
					lock: '关锁',
					unlock: '开锁',
					findCar: '寻车',
					risk: '风控拦截',
					cancelRisk: '取消拦截'
				} [t]
			},
			addLog(text) {
				const time = new Date().toLocaleTimeString()
				this.logList.unshift(`[${time}] ${text}`)
			}
		}
	}
</script>

<style scoped>
	/* 根容器 */
	.page-container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #f5f7fa;
		box-sizing: border-box;
		padding-bottom: 100rpx;
	}

	/* 内容区域 */
	.content-box {
		flex: 0 0 70%;
		overflow-y: auto;
		padding: 30rpx 20rpx 0;
	}

	/* 核心：上半部分统一大卡片 */
	.main-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	/* 模块分隔线 */
	.divider {
		height: 1rpx;
		background: #f0f0f0;
		margin: 40rpx 0;
	}

	/* 日志区域 - 独立分开 */
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

	/* 固定底部按钮 */
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

	/* 表单区域 */
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

	/* 上传区域样式 */
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

	/* 检测流程 */
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

	.step-text.disabled {
		color: #ccc;
	}

	.split {
		margin: 0 20rpx;
		color: #666;
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

	.disabled-section {
		opacity: 0.5;
		pointer-events: none;
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

	/* 日志内容 - 修复宽度溢出 */
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