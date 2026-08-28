<template>
	<view class="page-wrap">
		<!-- 空状态：管控规则列表为空时展示 -->
		<view v-if="showAgreementList.length === 0" class="empty-wrap">
			<text class="empty-txt">暂无管控规则，请点击底部新增</text>
		</view>

		<!-- 管控规则列表容器 -->
		<view v-else class="agreement-list">
			<!-- 单条管控规则卡片，循环渲染展示 -->
			<view class="agreement-item" v-for="(item) in showAgreementList" :key="item.id">
				<!-- 卡片头部：标题 + 编辑、删除按钮 -->
				<view class="item-top">
					<text class="item-title">{{ item.title }}</text>
					<view class="item-operate">
						<view class="edit-btn" @click.stop="openEditPopup(item)">编辑</view>
						<view class="del-btn" @click.stop="handleDelete(item)">删除</view>
					</view>
				</view>

				<view class="item-row">
					<text class="label">时间段</text>
					<text class="value">{{ item.starttime || '-' }} ~ {{ item.endtime || '-' }}</text>
				</view>

				<view class="item-row">
					<text class="label">生效星期</text>
					<text class="value">{{ formatWeekDay(item.dayofweek) }}</text>
				</view>

				<view class="item-row">
					<text class="label">使用权限</text>
					<text class="value allowuse-tag" :class="{ enable: item.allowuse === 1 }">
						{{ item.allowuse === 1 ? '允许' : '不允许' }}
					</text>
				</view>

				<view class="item-row" v-if="item.bak">
					<text class="label">备注</text>
					<text class="value">{{ item.bak }}</text>
				</view>

				<view class="item-row car-row-wrap" v-if="item.vehids">
					<text class="label">已绑定车辆</text>
					<text class="view-car-mini-btn" @click.stop="openViewCarPopup(item)">已绑车辆</text>
				</view>

				<view class="item-btn-wrap">
					<button class="bind-car-btn" @click.stop="openCarPopup(item)">绑定车辆</button>
				</view>
			</view>
		</view>

		<!-- 底部固定新增管控规则按钮 -->
		<view class="btn-bottom-wrap">
			<button class="add-btn" @click="openAddPopup">新增管控</button>
		</view>

		<!-- 新增/编辑规则弹窗组件 -->
		<view class="popup-mask" v-if="popupShow" @click="closePopup">
			<view class="popup-box" @click.stop>
				<view class="popup-header">
					<text class="popup-title">{{ isEdit ? '修改规则' : '新增规则' }}</text>
					<view class="close-icon" @click="closePopup">×</view>
				</view>
				<scroll-view scroll-y class="popup-body">
					<view class="form-item">
						<text class="form-label">标题</text>
						<input class="form-input" v-model="formData.title" placeholder="请输入规则标题"
							placeholder-class="input-placeholder" />
					</view>

					<view class="form-item">
						<text class="form-label">是否允许使用</text>
						<picker :value="allowusePickerIndex" :range="allowuseRange" @change="onAllowuseChange">
							<view class="picker-view">
								<text>{{ formData.allowuse === 1 ? '允许' : '不允许' }}</text>
								<text class="picker-arrow">⌄</text>
							</view>
						</picker>
					</view>

					<view class="form-row-two">
						<view class="form-item flex-item">
							<text class="form-label">开始时间</text>
							<picker mode="time" :value="formData.starttime" @change="onStartTimeChange">
								<view class="picker-view">
									<text>{{ formData.starttime || '选择时间' }}</text>
									<text class="picker-arrow">⌄</text>
								</view>
							</picker>
						</view>
						<view class="form-item flex-item">
							<text class="form-label">结束时间</text>
							<picker mode="time" :value="formData.endtime" @change="onEndTimeChange">
								<view class="picker-view">
									<text>{{ formData.endtime || '选择时间' }}</text>
									<text class="picker-arrow">⌄</text>
								</view>
							</picker>
						</view>
					</view>

					<view class="form-item">
						<text class="form-label">生效星期</text>
						<view class="week-select-wrap">
							<view class="week-item" v-for="(w,idx) in weekList" :key="idx"
								:class="{active:selectedWeekIndexList.includes(idx)}" @click="toggleWeek(idx)">
								{{w}}
							</view>
						</view>
					</view>

					<view class="form-item">
						<text class="form-label">备注</text>
						<textarea class="form-textarea" v-model="formData.bak" placeholder="请填写备注信息"
							placeholder-class="input-placeholder" auto-height></textarea>
					</view>
				</scroll-view>
				<view class="popup-btns">
					<button class="btn-cancel" @click="closePopup">取消</button>
					<button class="btn-save" @click="handleSave">保存</button>
				</view>
			</view>
		</view>

		<!-- 绑定车辆多选弹窗 -->
		<view class="popup-mask" v-if="carPopupShow" @click="closeCarPopup">
			<view class="popup-box car-popup" @click.stop>
				<view class="popup-header">
					<text class="popup-title">绑定车辆</text>
					<view class="close-icon" @click="closeCarPopup">×</view>
				</view>
				<scroll-view scroll-y class="popup-body car-scroll">
					<view class="car-item" v-for="car in carList" :key="car.id" @click="toggleCar(car)">
						<view class="car-checkbox" :class="{checked:selectedCarIdList.includes(car.id)}"></view>
						<text class="car-name">{{car.platenumber}}</text>
					</view>
				</scroll-view>
				<view class="popup-btns">
					<button class="btn-cancel" @click="closeCarPopup">取消</button>
					<button class="btn-save" @click="confirmBindCar">确定</button>
				</view>
			</view>
		</view>

		<!-- 已绑车辆只读查看弹窗 -->
		<view class="popup-mask" v-if="viewCarPopupShow" @click="closeViewCarPopup">
			<view class="popup-box car-popup" @click.stop>
				<view class="popup-header">
					<text class="popup-title">已绑定车辆</text>
					<view class="close-icon" @click="closeViewCarPopup">×</view>
				</view>
				<scroll-view scroll-y class="popup-body car-scroll">
					<view v-if="viewCarArr.length === 0" class="empty-car">
						<text>暂未绑定任何车辆</text>
					</view>
					<view class="view-car-item" v-for="car in viewCarArr" :key="car.id">
						<text class="plate-text">{{car.platenumber}}</text>
					</view>
				</scroll-view>
				<view class="popup-btns">
					<button class="btn-single" @click="closeViewCarPopup">关闭</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_scheduledCarApiList,
		u_scheduledAddUpdate,
		u_scheduledDel,
		u_carList
	} from '@/api/index';

	// 常量
	const API_SUCCESS_CODE = 1000;
	const WEEK_LIST = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	const ALLOWUSE_RANGE = ['不允许', '允许'];

	export default {
		data() {
			return {
				agreementList: [],
				popupShow: false,
				isEdit: false,
				allowusePickerIndex: 0,
				weekList: WEEK_LIST,
				allowuseRange: ALLOWUSE_RANGE,
				selectedWeekIndexList: [],
				formData: {},

				carPopupShow: false,
				currentRuleItem: null,
				carList: [],
				selectedCarIdList: [],

				viewCarPopupShow: false,
				viewCarArr: []
			};
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: '管控规则列表'
			});
		},
		onShow() {
			this.fetchAgreementData();
			this.fetchCarList();
		},
		computed: {
			showAgreementList() {
				return Array.isArray(this.agreementList) ? this.agreementList : [];
			}
		},
		methods: {
			/**
			 * 格式化星期字符串
			 * @param {String} str "0,1,2"
			 * @returns {String}
			 */
			formatWeekDay(str) {
				if (!str) return '-';
				const arr = str.split(',');
				return arr.map(n => WEEK_LIST[Number(n)] ?? '').filter(Boolean).join(' · ');
			},

			/**
			 * 解析dayofweek字符串到选中数组
			 * @param {String} str
			 */
			parseDayOfWeek(str) {
				if (!str) {
					this.selectedWeekIndexList = [];
					return;
				}
				this.selectedWeekIndexList = str.split(',').map(item => Number(item)).filter(n => !isNaN(n));
			},

			buildDayOfWeek() {
				return this.selectedWeekIndexList.join(',');
			},

			toggleWeek(idx) {
				const pos = this.selectedWeekIndexList.indexOf(idx);
				if (pos > -1) {
					this.selectedWeekIndexList.splice(pos, 1);
				} else {
					this.selectedWeekIndexList.push(idx);
				}
			},

			/**
			 * 获取提交表单对象
			 */
			getSubmitForm() {
				return {
					id: this.formData?.id || '',
					title: (this.formData?.title || '').trim(),
					starttime: this.formData?.starttime || '',
					endtime: this.formData?.endtime || '',
					dayofweek: this.buildDayOfWeek(),
					vehids: this.formData?.vehids || '',
					allowuse: Number(this.formData?.allowuse ?? 0),
					bak: (this.formData?.bak || '').trim()
				};
			},

			/**
			 * 简单表单校验
			 */
			validateForm() {
				const submit = this.getSubmitForm();
				if (!submit.title) {
					uni.showToast({
						title: '请输入规则标题',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			async fetchAgreementData() {
				this.agreementList = [];
				try {
					const res = await u_scheduledCarApiList({});
					if (res.code === API_SUCCESS_CODE && Array.isArray(res.content)) {
						this.agreementList = res.content;
					}
				} catch (err) {
					uni.showToast({
						title: '获取管控列表失败',
						icon: 'none'
					});
				}
			},

			async fetchCarList() {
				try {
					const res = await u_carList({});
					if (res?.code === API_SUCCESS_CODE) {
						this.carList = Array.isArray(res.content) ? res.content : [];
					}
				} catch (err) {
					uni.showToast({
						title: '获取车辆列表失败',
						icon: 'none'
					});
				}
			},

			openAddPopup() {
				this.isEdit = false;
				this.resetForm();
				this.popupShow = true;
			},

			openEditPopup(item) {
				this.isEdit = true;
				this.formData = {
					...item
				};
				this.allowusePickerIndex = Number(item.allowuse || 0);
				this.parseDayOfWeek(item.dayofweek);
				this.popupShow = true;
			},

			closePopup() {
				this.popupShow = false;
			},

			resetForm() {
				this.formData = {};
				this.allowusePickerIndex = 0;
				this.selectedWeekIndexList = [];
			},

			onAllowuseChange(e) {
				const idx = Number(e.target.value);
				this.allowusePickerIndex = idx;
				this.formData.allowuse = idx;
			},

			onStartTimeChange(e) {
				this.formData.starttime = e.target.value;
			},

			onEndTimeChange(e) {
				this.formData.endtime = e.target.value;
			},

			async handleSave() {
				if (!this.validateForm()) return;
				const temp = this.getSubmitForm();
				try {
					const res = await u_scheduledAddUpdate({
						...temp
					});
					if (res.code === API_SUCCESS_CODE) {
						this.closePopup();
						this.fetchAgreementData();
						uni.showToast({
							title: res?.msg || '保存成功',
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: res?.msg || '保存失败',
							icon: 'none'
						});
					}
				} catch (err) {
					uni.showToast({
						title: '网络异常，保存失败',
						icon: 'none'
					});
				}
			},

			handleDelete(item) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该管控规则吗？删除后不可恢复',
					success: async (res) => {
						if (res.confirm) {
							try {
								const delRes = await u_scheduledDel({
									scheduledId: item.id
								});
								if (delRes.code === API_SUCCESS_CODE) {
									uni.showToast({
										title: delRes?.msg || '删除成功',
										icon: 'none'
									});
									this.fetchAgreementData();
								} else {
									uni.showToast({
										title: delRes?.msg || '删除失败',
										icon: 'none'
									});
								}
							} catch (err) {
								uni.showToast({
									title: '网络异常，删除失败',
									icon: 'none'
								});
							}
						}
					}
				})
			},

			openCarPopup(item) {
				this.currentRuleItem = item;
				if (item.vehids) {
					this.selectedCarIdList = item.vehids.split(',').map(s => Number(s)).filter(n => !isNaN(n));
				} else {
					this.selectedCarIdList = [];
				}
				this.carPopupShow = true;
			},

			closeCarPopup() {
				this.carPopupShow = false;
				this.currentRuleItem = null;
				this.selectedCarIdList = [];
			},

			toggleCar(car) {
				const idx = this.selectedCarIdList.indexOf(car.id);
				if (idx > -1) {
					this.selectedCarIdList.splice(idx, 1);
				} else {
					this.selectedCarIdList.push(car.id);
				}
			},

			async confirmBindCar() {
				if (!this.currentRuleItem) return;
				const vehStr = this.selectedCarIdList.join(',');
				// 复用form对象，更新vehids
				this.formData = {
					...this.currentRuleItem
				};
				this.formData.vehids = vehStr;
				const submitParam = this.getSubmitForm();
				try {
					const res = await u_scheduledAddUpdate({
						...submitParam
					});
					if (res?.code === API_SUCCESS_CODE) {
						uni.showToast({
							title: res?.msg || '绑定成功',
							icon: 'none'
						});
						this.fetchAgreementData();
					} else {
						uni.showToast({
							title: res?.msg || '绑定失败',
							icon: 'none'
						});
					}
				} catch (err) {
					uni.showToast({
						title: '网络异常，绑定失败',
						icon: 'none'
					});
				}
				this.closeCarPopup();
			},

			openViewCarPopup(item) {
				if (!item.vehids) {
					this.viewCarArr = [];
				} else {
					const idArr = item.vehids.split(',').map(s => Number(s)).filter(n => !isNaN(n));
					this.viewCarArr = this.carList.filter(c => idArr.includes(c.id));
				}
				this.viewCarPopupShow = true;
			},

			closeViewCarPopup() {
				this.viewCarPopupShow = false;
				this.viewCarArr = [];
			}
		}
	};
</script>

<style lang="scss" scoped>
	page {
		background-color: #f4f6f9;
	}

	.page-wrap {
		min-height: 100vh;
		background-color: #f4f6f9;
		padding: 32rpx;
		padding-bottom: calc(32rpx + 160rpx);
		box-sizing: border-box;
	}

	.empty-wrap {
		padding: 160rpx 0;
		text-align: center;

		.empty-txt {
			font-size: 28rpx;
			color: #86909c;
		}
	}

	.agreement-list {
		.agreement-item {
			position: relative;
			background: #ffffff;
			border-radius: 24rpx;
			padding: 20rpx 30rpx;
			margin-bottom: 28rpx;
			box-shadow: 0 4rpx 22rpx rgba(0, 0, 0, 0.05);

			.item-top {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;

				.item-title {
					font-size: 34rpx;
					color: #1d2129;
					font-weight: 600;
					flex: 1;
				}

				.item-operate {
					display: flex;
					gap: 25rpx;

					.edit-btn {
						font-size: 26rpx;
						color: #1677ff;
					}

					.del-btn {
						font-size: 26rpx;
						color: #f53f3f;
					}
				}
			}

			.item-row {
				display: flex;
				font-size: 28rpx;
				color: #4e5969;
				line-height: 52rpx;
				margin-bottom: 10rpx;

				.label {
					flex-shrink: 0;
					color: #86909c;
					margin-right: 20rpx;
				}

				.value {
					flex: 1;
					color: #272e3b;

					&.allowuse-tag {
						&.enable {
							color: #00b42a;
						}

						color: #f53f3f;
					}
				}
			}

			.car-row-wrap {
				.view-car-mini-btn {
					font-size: 26rpx;
					color: #1677ff;
				}
			}

			.item-btn-wrap {
				margin-top: 24rpx;
				display: flex;
				gap: 20rpx;

				.bind-car-btn {
					width: 220rpx;
					height: 72rpx;
					line-height: 72rpx;
					background: #e8f3ff;
					color: #1677ff;
					font-size: 26rpx;
					border-radius: 14rpx;
					border: none;
					margin: 0;

					&::after {
						border: none;
					}
				}
			}
		}
	}

	.btn-bottom-wrap {
		position: fixed;
		left: 32rpx;
		right: 32rpx;
		bottom: env(safe-area-inset-bottom, 30rpx);
		z-index: 100;

		.add-btn {
			width: 100%;
			height: 100rpx;
			line-height: 100rpx;
			background: linear-gradient(90deg, #1677ff, #4096ff);
			color: #fff;
			border-radius: 24rpx;
			font-size: 34rpx;
			font-weight: 600;
			border: none;
			margin: 0;
			box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.32);
			transition: all 0.2s ease;

			&::after {
				border: none;
			}

			&:active {
				transform: scale(0.97);
				box-shadow: 0 4rpx 14rpx rgba(22, 119, 255, 0.24);
			}
		}
	}

	.popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx 32rpx;
		box-sizing: border-box;

		.popup-box {
			width: 100%;
			background: #fff;
			border-radius: 32rpx;
			max-height: 84vh;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;

			&.car-popup {
				max-height: 70vh;
			}
		}
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		padding: 40rpx 32rpx 24rpx;
		box-sizing: border-box;

		.popup-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #1d2129;
		}

		.close-icon {
			position: absolute;
			right: 32rpx;
			top: 50%;
			transform: translateY(-50%);
			font-size: 44rpx;
			color: #86909c;
			width: 64rpx;
			height: 64rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.popup-body {
		padding: 0 32rpx;
		box-sizing: border-box;

		&.car-scroll {
			padding: 0;
		}
	}

	.form-item {
		margin-bottom: 32rpx;
		box-sizing: border-box;

		.form-label {
			display: block;
			font-size: 28rpx;
			color: #1d2129;
			margin-bottom: 14rpx;
			font-weight: 500;
		}

		.form-input,
		.picker-view {
			width: 100%;
			height: 84rpx;
			line-height: 84rpx;
			border: 1rpx solid #e5e6eb;
			border-radius: 16rpx;
			padding: 0 24rpx;
			font-size: 28rpx;
			box-sizing: border-box;
			background: #f7f8fa;
			display: flex;
			align-items: center;
			justify-content: space-between;
			transition: border-color 0.2s;

			&:focus {
				border-color: #1677ff;
				background: #ffffff;
			}
		}

		.form-textarea {
			width: 100%;
			min-height: 120rpx;
			border: 1rpx solid #e5e6eb;
			border-radius: 16rpx;
			padding: 20rpx 24rpx;
			font-size: 28rpx;
			box-sizing: border-box;
			background: #f7f8fa;
			transition: border-color 0.2s;

			&:focus {
				border-color: #1677ff;
				background: #ffffff;
			}
		}

		.picker-arrow {
			font-size: 30rpx;
			color: #86909c;
		}
	}

	.input-placeholder {
		color: #b4b9c3;
	}

	.form-row-two {
		display: flex;
		gap: 24rpx;
		box-sizing: border-box;

		.flex-item {
			flex: 1;
		}
	}

	.week-select-wrap {
		display: flex;
		justify-content: space-between;
		gap: 14rpx;
		box-sizing: border-box;

		.week-item {
			flex: 1;
			height: 72rpx;
			line-height: 72rpx;
			text-align: center;
			border-radius: 14rpx;
			background: #f4f6f9;
			font-size: 26rpx;
			color: #4e5969;
			border: 1rpx solid transparent;
			box-sizing: border-box;
			transition: all 0.2s ease;

			&:active {
				transform: scale(0.94);
			}

			&.active {
				background: #e8f3ff;
				color: #1677ff;
				border-color: #1677ff;
				font-weight: 500;
			}
		}
	}

	.popup-btns {
		display: flex;
		box-sizing: border-box;
		margin-top: 16rpx;

		.btn-cancel,
		.btn-save {
			flex: 1;
			height: 96rpx;
			line-height: 96rpx;
			border-radius: 0;
			border: none;
			margin: 0;
			font-size: 32rpx;
			font-weight: 500;
			transition: all 0.2s;

			&::after {
				border: none;
			}

			&:active {
				opacity: 0.82;
			}
		}

		.btn-cancel {
			background: #f2f3f5;
			color: #4e5969;
		}

		.btn-save {
			background: linear-gradient(90deg, #1677ff, #4096ff);
			color: #fff;
		}

		.btn-single {
			flex: 1;
			height: 96rpx;
			line-height: 96rpx;
			background: #1677ff;
			color: #fff;
			text-align: center;
			font-size: 32rpx;
			border: none;
			margin: 0;

			&::after {
				border: none;
			}
		}
	}

	.car-item {
		display: flex;
		align-items: center;
		padding: 32rpx;
		border-bottom: 1rpx solid #f0f2f5;

		.car-checkbox {
			width: 36rpx;
			height: 36rpx;
			border-radius: 8rpx;
			border: 1rpx solid #c9cdd4;
			margin-right: 24rpx;
			position: relative;

			&.checked {
				background: #1677ff;
				border-color: #1677ff;

				&::after {
					content: "✓";
					position: absolute;
					color: #fff;
					font-size: 24rpx;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
			}
		}

		.car-name {
			font-size: 30rpx;
			color: #1d2129;
		}
	}

	.view-car-item {
		padding: 32rpx;
		border-bottom: 1rpx solid #f0f2f5;

		.plate-text {
			font-size: 30rpx;
			color: #1d2129;
		}
	}

	.empty-car {
		padding: 80rpx 0;
		text-align: center;
		font-size: 28rpx;
		color: #86909c;
	}
</style>