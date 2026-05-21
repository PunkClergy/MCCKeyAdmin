<template>
	<view class="container">
		<!-- 1. IDC + Code 输入（始终显示） -->
		<view class="form-box">
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

		<!-- 2. 图片上传（始终显示） -->
		<view class="upload-box">
			<view class="upload-title">现场图片上传</view>
			<view class="upload-list">
				<view class="upload-item" v-for="(item, idx) in imgList" :key="idx">
					<image :src="item" mode="aspectFill" class="upload-img"></image>
				</view>
				<view class="upload-add" @click="chooseImage" v-if="imgList.length < 3">
					<text class="add-icon">+</text>
				</view>
			</view>
			<button class="upload-btn" :disabled="!isBind || imgList.length === 0 || isUploadSuccess"
				@click="uploadImages">
				确认上传图片
			</button>
		</view>

		<!-- 3. 功能检测（始终显示） -->
		<view class="test-box">
			<view class="mode-tabs">
				<view class="tab-item" :class="{active: currentMode === 'network'}"
					@click="checkAndSwitchMode('network')">
					网络模式
				</view>
				<view class="tab-item" :class="{active: currentMode === 'ble'}" @click="checkAndSwitchMode('ble')">
					蓝牙模式
				</view>
			</view>

			<view class="btn-group">
				<view class="btn-item click-effect" @click="checkAndTest('lock')">
					<text>关锁</text>
					<text class="status" :class="lockStatus">{{ statusText(lockStatus) }}</text>
				</view>
				<view class="btn-item click-effect" @click="checkAndTest('unlock')">
					<text>开锁</text>
					<text class="status" :class="unlockStatus">{{ statusText(unlockStatus) }}</text>
				</view>
				<view class="btn-item click-effect" @click="checkAndTest('findCar')">
					<text>寻车</text>
					<text class="status" :class="findCarStatus">{{ statusText(findCarStatus) }}</text>
				</view>
				<!-- 风控拦截 - 仅网络模式显示 -->
				<view class="btn-item click-effect" v-if="currentMode === 'network'" @click="checkAndTest('risk')">
					<text>风控拦截</text>
					<text class="status" :class="riskStatus">{{ statusText(riskStatus) }}</text>
				</view>
				<!-- 取消拦截 - 仅网络模式显示 -->
				<view class="btn-item click-effect" v-if="currentMode === 'network'"
					@click="checkAndTest('cancelRisk')">
					<text>取消拦截</text>
					<text class="status" :class="cancelRiskStatus">{{ statusText(cancelRiskStatus) }}</text>
				</view>
			</view>
		</view>

		<!-- 日志 -->
		<view class="log-box">
			<view class="log-title">测试日志</view>
			<scroll-view scroll-y class="log-content">
				<view class="log-item" v-for="(item, idx) in logList" :key="idx">{{ item }}</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
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
				currentMode: 'network',
				lockStatus: '',
				unlockStatus: '',
				findCarStatus: '',
				riskStatus: '', // 风控拦截状态
				cancelRiskStatus: '', // 取消拦截状态
				logList: []
			}
		},
		computed: {
			canTest() {
				return this.isBind && this.isUploadSuccess
			}
		},
		methods: {
			// 统一校验是否可操作
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

			// 绑定设备
			bindDevice() {
				this.isBind = true
				this.addLog(`✅ 绑定成功 → IDC: ${this.form.idc}  Code: ${this.form.code}`)
				uni.showToast({
					title: '绑定成功',
					icon: 'none'
				})
			},

			// 选择图片（带校验）
			chooseImage() {
				if (!this.isBind) {
					uni.showToast({
						title: '请先绑定设备',
						icon: 'none'
					})
					return
				}
				uni.chooseImage({
					count: 3 - this.imgList.length,
					success: (res) => {
						this.imgList = [...this.imgList, ...res.tempFilePaths]
					}
				})
			},

			// 上传图片
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

			// 切换模式（带校验）
			checkAndSwitchMode(mode) {
				if (!this.checkCanOperate()) return
				this.currentMode = mode
				this.resetStatus()
				this.addLog(`🔘 切换至【${mode === 'network' ? '网络' : '蓝牙'}】模式`)
			},

			// 测试功能（带校验）
			checkAndTest(type) {
				if (!this.checkCanOperate()) return
				this.testAction(type)
			},

			// 执行测试
			async testAction(type) {
				this.setStatus(type, 'testing')
				this.addLog(`🚗 开始${this.actionText(type)} → IDC:${this.form.idc}`)

				let success = true
				await new Promise(r => setTimeout(r, 1200))

				this.setStatus(type, success ? 'success' : 'fail')
				this.addLog(`${success ? '✅' : '❌'} ${this.actionText(type)} ${success ? '成功' : '失败'}`)

				// 风控拦截/取消拦截 成功后弹出弹窗
				if (success && (type === 'risk' || type === 'cancelRisk')) {
					uni.showModal({
						title: '检测结果',
						content: `${this.actionText(type)}已完成`,
						confirmText: '已启动',
						cancelText: '未启动',
						showCancel: true
					})
				}
			},

			// 工具方法
			setStatus(type, s) {
				const map = {
					lock: 'lockStatus',
					unlock: 'unlockStatus',
					findCar: 'findCarStatus',
					risk: 'riskStatus',
					cancelRisk: 'cancelRiskStatus'
				}
				this[map[type]] = s
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
			resetStatus() {
				this.lockStatus = this.unlockStatus = this.findCarStatus = this.riskStatus = this.cancelRiskStatus = ''
			},
			addLog(text) {
				const time = new Date().toLocaleTimeString()
				this.logList.unshift(`[${time}] ${text}`)
			}
		}
	}
</script>

<style scoped>
	.container {
		padding: 25rpx;
		background: #f5f7fa;
		min-height: 100vh;
	}

	.title {
		font-size: 38rpx;
		font-weight: bold;
		text-align: center;
		margin: 20rpx 0 30rpx;
	}

	.form-box {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
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

	.bind-btn {
		width: 100%;
		background: #007aff;
		color: #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		padding: 14rpx 0;
		margin-top: 10rpx;
	}

	.bind-btn[disabled] {
		background: #ccc !important;
	}

	.upload-box {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.upload-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.upload-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 20rpx;
	}

	.upload-item {
		width: 150rpx;
		height: 150rpx;
		border-radius: 12rpx;
		overflow: hidden;
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
	}

	.add-icon {
		font-size: 40rpx;
		color: #999;
	}

	.upload-btn {
		width: 100%;
		background: #07c160;
		color: #fff;
		border-radius: 10rpx;
		font-size: 28rpx;
		padding: 14rpx 0;
	}

	.upload-btn[disabled] {
		background: #ccc !important;
	}

	.mode-tabs {
		display: flex;
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 8rpx;
		margin-bottom: 24rpx;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 22rpx;
		border-radius: 8rpx;
		font-size: 29rpx;
	}

	.tab-item.active {
		background: #007aff;
		color: #fff;
		font-weight: bold;
	}

	.test-box {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
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

	.log-box {
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
	}

	.log-title {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.log-content {
		height: 420rpx;
		background: #f9f9f9;
		border-radius: 10rpx;
		padding: 20rpx;
	}

	.log-item {
		font-size: 24rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 6rpx;
	}
</style>