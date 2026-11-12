<template>
	<view class="ck-page">
		<view class="ck-shell">
			<!-- ===== 顶部切换（固定） ===== -->
			<view class="ck-seg">
				<view class="ck-seg__item" :class="{ 'ck-seg__item--active': c_activeTab == 1 }" @tap="switchToList">
					{{ tips.CarList[lang] }}
				</view>
				<view class="ck-seg__item" :class="{ 'ck-seg__item--active': c_activeTab == 2 }" @tap="switchToForm">
					{{ btnState }}{{ tips.Car[lang] }}
				</view>
			</view>

			<!-- ===== 列表视图 ===== -->
			<view class="ck-pane" v-if="c_activeTab == 1">
				<view class="ck-toolbar">
					<view class="ck-search">
						<icon type="search" size="14" color="#4facfe" class="ck-search__icon" />
						<input class="ck-search__input" :placeholder="tips.SearchPlaceholder[lang]" placeholder-style="color:#a9bccf" @blur="bindblurSea" />
					</view>
					<view class="ck-meta">
						<text class="ck-meta__text">{{ tips.TotalRecords[lang] }}</text>
						<text class="ck-meta__count">{{ g_total }}</text>
						<text class="ck-meta__text">{{ tips.Items[lang] }}</text>
						<view class="ck-meta__spacer"></view>
						<view class="ck-selectall" v-if="g_flagMulti">
							<text>{{ tips.SelectAll[lang] }}</text>
							<checkbox class="ck-checkbox" @tap="handleAllC" :checked="all_c" color="#4facfe" />
						</view>
					</view>
				</view>

				<scroll-view class="ck-scroll" scroll-y show-scrollbar="false">
					<view class="ck-card" v-for="(item, index) in g_items" :key="index">
						<view class="ck-card__head">
							<view class="ck-plate">{{ item.platenumber }}</view>
							<view class="ck-model">{{ item.vehicleSerialName || '-' }}{{ item.vehicleModeName || '' }}</view>
							<view class="ck-actions" v-if="!g_flagMulti">
								<view class="ck-action" :data-item="item" @tap="handleEdit">{{ tips.Edit[lang] }}</view>
								<view class="ck-action ck-action--danger" :data-item="item" @tap="handleDelete">{{ tips.Delete[lang] }}</view>
							</view>
							<view class="ck-check" v-else>
								<checkbox-group :data-item="item" @change="handleChangeBlack">
									<checkbox class="ck-checkbox" :checked="item.checked" color="#4facfe" />
								</checkbox-group>
							</view>
						</view>
						<view class="ck-card__body">
							<view class="ck-row">
								<text class="ck-row__k">{{ tips.DeviceSN[lang] }}</text>
								<text class="ck-row__v">{{ item.sn || '-' }}</text>
							</view>
							<view class="ck-row">
								<text class="ck-row__k">{{ tips.EffectivePeriod[lang] }}</text>
								<text class="ck-row__v">{{ item.startDate || '' }}-{{ item.endDate || '' }}</text>
							</view>
						</view>
						<view class="ck-card__foot" v-if="g_source && !g_flagMulti">
							<view class="ck-ghost" :data-item="item" @tap="handleSelectJump">{{ tips.SelectThisCar[lang] }}</view>
						</view>
					</view>
					<view class="ck-empty" v-if="g_items.length === 0">
						<text class="ck-empty__text">{{ tips.NoData[lang] }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- ===== 表单视图（新增 / 编辑） ===== -->
			<view class="ck-pane" v-else>
				<scroll-view class="ck-scroll" scroll-y show-scrollbar="false">
					<view class="ck-form-card">
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.PlateNumber[lang] }}<text class="ck-req">*</text></text>
							<view class="ck-field__ctl">
								<input class="ck-input" :placeholder="tips.PleaseEnterPlate[lang]" placeholder-style="color:#a9bccf"
									v-model="params.platenumber" data-item="platenumber" @input="handleBindinput" />
							</view>
						</view>
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.DeviceSN[lang] }}<text class="ck-req">*</text></text>
							<view class="ck-field__ctl">
								<text v-if="id !== ''" class="ck-static">{{ params.sn || tips.Empty[lang] }}</text>
								<input v-else class="ck-input" :placeholder="tips.PleaseEnterSN[lang]" placeholder-style="color:#a9bccf"
									v-model="params.paramsn" data-item="sn" @input="handleBindinput" />
							</view>
						</view>
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.CodeLabel[lang] }}<text class="ck-req">*</text></text>
							<view class="ck-field__ctl">
								<text v-if="id !== ''" class="ck-static">{{ params.code || tips.Empty[lang] }}</text>
								<input v-else class="ck-input" :placeholder="tips.PleaseEnterCode[lang]" placeholder-style="color:#a9bccf"
									v-model="params.code" data-item="code" @input="handleBindinput" />
							</view>
						</view>
					</view>
					<view class="ck-form-card">
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.VehicleSeries[lang] }}</text>
							<view class="ck-field__ctl">
								<input class="ck-input" :placeholder="tips.PleaseEnterSeries[lang]" placeholder-style="color:#a9bccf"
									v-model="params.vehicleSerialName" data-item="vehicleSerialName" @input="handleBindinput" />
							</view>
						</view>
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.VehicleModel[lang] }}</text>
							<view class="ck-field__ctl">
								<input class="ck-input" :placeholder="tips.PleaseEnterModel[lang]" placeholder-style="color:#a9bccf"
									v-model="params.vehicleModeName" data-item="vehicleModeName" @input="handleBindinput" />
							</view>
						</view>
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.ModelYear[lang] }}</text>
							<view class="ck-field__ctl">
								<input class="ck-input" :placeholder="tips.PleaseEnterYear[lang]" placeholder-style="color:#a9bccf"
									v-model="params.ccdate" data-item="ccdate" @input="handleBindinput" />
							</view>
						</view>
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.TotalMileage[lang] }}</text>
							<view class="ck-field__ctl">
								<input class="ck-input" :placeholder="tips.PleaseEnterTotalMileage[lang]" placeholder-style="color:#a9bccf"
									v-model="params.totalMileage" data-item="totalMileage" @input="handleBindinput" />
							</view>
						</view>
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.MaintainMileage[lang] }}</text>
							<view class="ck-field__ctl">
								<input class="ck-input" :placeholder="tips.PleaseEnterMaintainMileage[lang]" placeholder-style="color:#a9bccf"
									v-model="params.maintainMileage" data-item="maintainMileage" @input="handleBindinput" />
							</view>
						</view>
						<view class="ck-field">
							<text class="ck-field__label">{{ tips.MaintainInterval[lang] }}</text>
							<view class="ck-field__ctl">
								<input class="ck-input" :placeholder="tips.PleaseEnterMaintainInterval[lang]" placeholder-style="color:#a9bccf"
									v-model="params.maintainMileageInterval" data-item="maintainMileageInterval" @input="handleBindinput" />
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="ck-footer">
					<view class="ck-primary" @tap="handleSubmit">{{ tips.Confirm[lang] }}{{ btnState }}</view>
				</view>
			</view>
		</view>

		<!-- 悬浮多选确认（仅列表多选态） -->
		<view class="ck-float" v-if="c_activeTab == 1 && g_flagMulti && g_black.length > 0">
			<view class="ck-primary ck-primary--float" @tap="handleJumpBlackInfo">{{ tips.Confirm[lang] }}</view>
		</view>
	</view>
</template>

<script>
	import {
		u_carList,
		u_addOrUpdateCar,
		u_carapiDeleteCar
	} from '@/api/index'
	import {
		tips
	} from '@/utils/langtips.js'
	import {
		titles
	} from '@/utils/langtitle.js'
	export default {
		data() {
			return {
				lang: 'enUs',
				tips: tips,
				c_activeTab: 1,
				g_page: 1,
				g_items: [],
				params: {},
				btnState: '',
				id: '',
				batterylift: '一键启动',
				carOwnerName: '智信通',
				brakingType: 1,
				all_c: false,
				g_source: '',
				g_flagMulti: false,
				info: null,
				allParams: '',
				type: '',
				name: '',
				desc: '',
				comParam: '',
				g_total: '0',
				g_black: [],
				g_platenumbers: []
			}
		},
		onLoad(options) {
			this.initCarryParams(options)
			
		},
		onShow() {
			this.initList()
			this.lang = uni.getStorageSync('language') || 'enUs'
			const pageRoute = 'zoneCenter/carKeyConfig'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
			this.btnState = this.tips.Add[this.lang]
		},
		methods: {
			switchToList() {
				this.c_activeTab = 1
				this.clearForm()
			},
			switchToForm() {
				this.c_activeTab = 2
				this.clearForm()
			},
			clearForm() {
				this.btnState = this.tips.Add[this.lang];
				this.id = ''
				this.params = {
					platenumber: '',
					sn: '',
					code: '',
					vehicleSerialName: '',
					vehicleModeName: '',
					ccdate: '',
					totalMileage: '',
					maintainMileage: '',
					maintainMileageInterval: ''
				}
			},
			bindblurSea(evt) {
				this.comParam = evt.detail.value
				this.g_page = 1
				this.g_items = []
				this.initList()
			},
			async handleDelete(evt) {
				const info = evt.currentTarget.dataset.item
				uni.showModal({
					title: this.tips.Tips[this.lang],
					content: this.tips.ConfirmDelete[this.lang],
					confirmText: this.tips.Confirm[this.lang],
					cancelText: this.tips.Cancel[this.lang],
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await u_carapiDeleteCar({
									sn: info?.sn,
									code: info?.code
								})
								if (result.code === 1000) {
									uni.showToast({
										title: result.msg
									})
									this.c_activeTab = 1
									this.g_page = 1
									this.g_items = []
									this.initList()
								}
							} catch (e) {}
						}
					}
				})
			},
			handleChangeBlack(evt) {
				const targetItem = evt.currentTarget.dataset.item || {}
				const { id } = targetItem
				if (!id) return
				const idx = this.g_items.findIndex(i => i.id === id)
				if (idx === -1) return
				const list = [...this.g_items]
				list[idx].checked = !list[idx].checked
				this.all_c = list.every(i => i.checked)
				const checked = list.filter(i => i.checked)
				this.g_items = list
				this.g_black = checked.map(i => i.id).filter(Boolean)
				this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
			},
			handleAllC() {
				if (this.g_items.length === 0) return uni.showToast({
					title: this.tips.NoData[this.lang],
					icon: 'none'
				})
				const target = !this.all_c
				const newItems = this.g_items.map(i => ({
					...i,
					checked: target
				}))
				const checked = newItems.filter(i => i.checked)
				this.g_items = newItems
				this.all_c = target
				this.g_black = checked.map(i => i.id).filter(Boolean)
				this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
			},
			handleJumpBlackInfo() {
				uni.redirectTo({
					url: `${this.g_source}?black=${this.g_black}&type=${this.type}&name=${this.name}&platenumbers=${this.g_platenumbers}&info=${JSON.stringify(this.info)}`
				})
			},
			initCarryParams(evt) {
				const { source, flagMulti, info, allParams, type, name, desc } = evt
				this.g_source = source
				this.g_flagMulti = flagMulti
				this.info = info ? JSON.parse(info) : null
				this.allParams = allParams
				this.type = type
				this.name = name
				this.desc = desc
			},
			handleSelectJump(evt) {
				const { item } = evt.currentTarget.dataset
				const url = this.allParams ?
					`${this.g_source}?datails=${JSON.stringify(item)}&allParams=${this.allParams}&type=${this.type}` :
					`${this.g_source}?datails=${JSON.stringify(item)}`
				uni.redirectTo({
					url
				})
			},
			async initList() {
				try {
					const param = {
						page: this.g_page,
						pageSize: 1000,
						comParam: this.comParam || ''
					}
					const res = await u_carList(param)
					if (res.code === 1000) {
						this.g_items = this.g_items.concat(res.content || [])
						this.g_total = Number(res.count || 0).toLocaleString()
						const vehList = this.desc ? JSON.parse(this.desc).vehList : []
						const snSet = new Set(vehList.map(i => i.sn))
						this.g_items = this.g_items.map(item => ({
							...item,
							checked: !!snSet.has(item.sn)
						}))
						this.all_c = this.g_items.every(i => i.checked)
						const checked = this.g_items.filter(i => i.checked)
						this.g_black = checked.map(i => i.id).filter(Boolean)
						this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
					}
				} catch (e) {}
			},
			handleBindinput(evt) {
				const key = evt.currentTarget.dataset.item
				this.params[key] = evt.detail.value
			},
			async handleSubmit() {
				const param = {
					...this.params,
					brakingType: this.brakingType,
					batterylift: this.batterylift,
					carOwnerName: this.carOwnerName,
					isDirectReg: 1,
					id: this.id || ''
				}
				if (!param.platenumber) return uni.showToast({
					title: this.tips.PleaseEnterPlate[this.lang],
					icon: 'none'
				})
				if (!param.sn) return uni.showToast({
					title: this.tips.PleaseEnterSN[this.lang],
					icon: 'none'
				})
				try {
					uni.showLoading()
					const res = await u_addOrUpdateCar(param)
					if (res.code === 1000) {
						uni.showToast({
							title: res.msg
						})
						this.switchToList()
						this.initList()
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				} catch (e) {} finally {
					uni.hideLoading()
				}
			},
			handleEdit(evt) {
				const info = evt.currentTarget.dataset.item
				this.c_activeTab = 2
				this.btnState = this.tips.Edit[this.lang];
				this.id = info.id
				this.params = {
					maintainMileage: info.maintainMileage || '',
					maintainMileageInterval: info.maintainMileageInterval || '',
					totalMileage: info.totalMileage || '',
					vehicleSerialName: info.vehicleSerialName || '',
					vehicleModeName: info.vehicleModeName || '',
					ccdate: info.ccdate || '',
					platenumber: info.platenumber || '',
					sn: info.sn || '',
					code: info.code || ''
				}
			}
		}
	}
</script>

<style>
	/* ===== 页面底色：沿用天蓝渐变主题 ===== */
	page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(160deg, #eaf5fe 0%, #e3f2fd 34%, #b7e3fb 72%, #81d4fa 100%);
		box-sizing: border-box;
	}

	.ck-page {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 24rpx 24rpx 0;
		box-sizing: border-box;
	}

	.ck-shell {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 18rpx 18rpx 12rpx;
		background: rgba(255, 255, 255, 0.58);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1rpx solid rgba(255, 255, 255, 0.85);
		border-radius: 32rpx;
		box-shadow: 0 24rpx 60rpx rgba(19, 96, 160, 0.14);
		overflow: hidden;
		box-sizing: border-box;
	}

	/* ===== 顶部分段切换 ===== */
	.ck-seg {
		flex-shrink: 0;
		display: flex;
		padding: 6rpx;
		margin-bottom: 16rpx;
		background: rgba(255, 255, 255, 0.72);
		border: 1rpx solid rgba(255, 255, 255, 0.95);
		border-radius: 20rpx;
		box-shadow: 0 6rpx 18rpx rgba(19, 96, 160, 0.06);
	}
	.ck-seg__item {
		flex: 1;
		padding: 20rpx 0;
		text-align: center;
		font-size: 27rpx;
		font-weight: 600;
		color: #5f7892;
		border-radius: 16rpx;
		transition: color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
	}
	.ck-seg__item--active {
		color: #ffffff;
		background: linear-gradient(135deg, #4facfe 0%, #1a8cf2 100%);
		box-shadow: 0 10rpx 22rpx rgba(26, 140, 242, 0.26);
	}

	/* ===== 视图容器 ===== */
	.ck-pane {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.ck-toolbar {
		flex-shrink: 0;
	}

	.ck-search {
		display: flex;
		align-items: center;
		height: 76rpx;
		padding: 0 22rpx;
		background: #ffffff;
		border: 1rpx solid #e7f1fa;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 14rpx rgba(19, 96, 160, 0.04);
	}
	.ck-search__icon {
		flex-shrink: 0;
	}
	.ck-search__input {
		flex: 1;
		height: 100%;
		margin-left: 12rpx;
		font-size: 26rpx;
		color: #12283d;
	}

	.ck-meta {
		display: flex;
		align-items: center;
		padding: 18rpx 6rpx 14rpx;
	}
	.ck-meta__text {
		font-size: 24rpx;
		color: #71869b;
	}
	.ck-meta__count {
		margin: 0 6rpx;
		font-size: 30rpx;
		font-weight: 700;
		color: #1a8cf2;
	}
	.ck-meta__spacer {
		flex: 1;
	}
	.ck-selectall {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #3d5570;
	}
	.ck-checkbox {
		margin-left: 10rpx;
		transform: scale(0.88);
	}

	.ck-scroll {
		flex: 1;
		min-height: 0;
		width: 100%;
	}

	/* ===== 列表卡片 ===== */
	.ck-card {
		margin: 0 2rpx 24rpx;
		padding: 0 28rpx;
		background: #ffffff;
		border: 1rpx solid #eef4fb;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 20rpx rgba(19, 96, 160, 0.05);
	}
	.ck-card__head {
		display: flex;
		align-items: center;
		padding: 24rpx 0 20rpx;
	}
	.ck-plate {
		flex-shrink: 0;
		max-width: 60%;
		padding: 8rpx 18rpx;
		font-size: 28rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
		color: #0f2b46;
		background: rgba(79, 172, 254, 0.10);
		border: 1rpx solid rgba(79, 172, 254, 0.24);
		border-radius: 12rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ck-model {
		flex: 1;
		min-width: 0;
		margin-left: 16rpx;
		font-size: 24rpx;
		color: #8095aa;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ck-actions {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		margin-left: 12rpx;
	}
	.ck-action {
		padding: 8rpx 14rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: #1a8cf2;
		border-radius: 10rpx;
	}
	.ck-action:active {
		background: rgba(79, 172, 254, 0.12);
	}
	.ck-action--danger {
		color: #e2606a;
	}
	.ck-action--danger:active {
		background: rgba(226, 96, 106, 0.10);
	}
	.ck-check {
		flex-shrink: 0;
	}

	.ck-card__body {
		padding: 14rpx 0 18rpx;
		border-top: 1rpx solid #f4f8fc;
	}
	.ck-row {
		display: flex;
		align-items: flex-start;
		padding-top: 10rpx;
	}
	.ck-row__k {
		flex-shrink: 0;
		width: 210rpx;
		font-size: 24rpx;
		line-height: 38rpx;
		color: #71869b;
	}
	.ck-row__v {
		flex: 1;
		min-width: 0;
		font-size: 25rpx;
		line-height: 38rpx;
		color: #20364c;
		text-align: right;
		word-break: break-all;
	}

	.ck-card__foot {
		display: flex;
		justify-content: flex-end;
		padding: 16rpx 0 22rpx;
		border-top: 1rpx solid #f4f8fc;
	}
	.ck-ghost {
		padding: 10rpx 26rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: #1279d0;
		background: rgba(79, 172, 254, 0.07);
		border: 1rpx solid rgba(79, 172, 254, 0.40);
		border-radius: 999rpx;
	}
	.ck-ghost:active {
		background: rgba(79, 172, 254, 0.16);
	}

	.ck-empty {
		padding: 160rpx 0 200rpx;
		text-align: center;
	}
	.ck-empty__text {
		font-size: 26rpx;
		letter-spacing: 1rpx;
		color: #8399ad;
	}

	/* ===== 表单卡片 ===== */
	.ck-form-card {
		margin: 0 2rpx 24rpx;
		padding: 4rpx 28rpx;
		background: #ffffff;
		border: 1rpx solid #eef4fb;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 20rpx rgba(19, 96, 160, 0.05);
	}
	.ck-field {
		display: flex;
		align-items: center;
		min-height: 100rpx;
		border-bottom: 1rpx solid #f3f8fc;
	}
	.ck-field:last-child {
		border-bottom: none;
	}
	.ck-field__label {
		flex: 0 0 44%;
		font-size: 26rpx;
		line-height: 34rpx;
		color: #3d5570;
	}
	.ck-req {
		margin-left: 4rpx;
		font-size: 22rpx;
		color: #f06a72;
	}
	.ck-field__ctl {
		flex: 1;
		min-width: 0;
		display: flex;
		justify-content: flex-end;
	}
	.ck-input {
		flex: 1;
		min-width: 0;
		height: 68rpx;
		line-height: 68rpx;
		padding: 0 18rpx;
		box-sizing: border-box;
		font-size: 26rpx;
		color: #12283d;
		text-align: right;
		background: #f7fafd;
		border: 1rpx solid #edf3f9;
		border-radius: 12rpx;
	}
	.ck-input:focus {
		background: #ffffff;
		border-color: #8ecdfc;
	}
	.ck-static {
		flex: 1;
		min-width: 0;
		font-size: 26rpx;
		line-height: 68rpx;
		text-align: right;
		color: #5d748a;
		word-break: break-all;
	}

	/* ===== 主按钮 ===== */
	.ck-footer {
		flex-shrink: 0;
		padding: 18rpx 2rpx 26rpx;
	}
	.ck-primary {
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		font-size: 30rpx;
		font-weight: 600;
		letter-spacing: 1rpx;
		color: #ffffff;
		background: linear-gradient(135deg, #4facfe 0%, #1a8cf2 100%);
		border-radius: 44rpx;
		box-shadow: 0 14rpx 30rpx rgba(26, 140, 242, 0.28);
		transition: opacity 0.2s ease, transform 0.2s ease;
	}
	.ck-primary:active {
		opacity: 0.9;
		transform: scale(0.985);
	}

	/* ===== 悬浮多选确认 ===== */
	.ck-float {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 48rpx;
		z-index: 99;
		display: flex;
		justify-content: center;
		padding: 0 48rpx;
		pointer-events: none;
	}
	.ck-primary--float {
		min-width: 360rpx;
		padding: 0 70rpx;
		pointer-events: auto;
		box-shadow: 0 18rpx 36rpx rgba(26, 140, 242, 0.38);
	}

	/* ===== 复选框主题色 ===== */
	checkbox .wx-checkbox-input,
	checkbox .uni-checkbox-input {
		border-radius: 8rpx !important;
		border-color: #4facfe !important;
	}
	checkbox .wx-checkbox-input.wx-checkbox-input-checked,
	checkbox .uni-checkbox-input.uni-checkbox-input-checked {
		background: #4facfe !important;
		border-color: #4facfe !important;
	}
</style>