<template>
	<view class="container">
		<view class="record-container">
			<scroll-view scroll-y class="list-scroll">
				<view class="content-item" v-for="(item, index) in g_items" :key="index">
					<view class="content-item-head">
						<view class="head-left">
							<view class="left-category">
								<text>{{ item.realname||'-' }}</text>
								<text v-if="item.acquiescent"
									style="font-size:22rpx;padding:4rpx;border-radius:6rpx;background:#f0f0f0;color:#575656;margin-left:20rpx;">
									{{tips.SuperAdmin[lang]}}
								</text>
							</view>
						</view>
						<view class="head-right">
							<text class="text-btn edit" @tap="handleEdit(item)">{{tips.Edit[lang]}}</text>
							<text class="text-btn delete" @tap="handleDelete(item.id)">{{tips.Delete[lang]}}</text>
						</view>
					</view>

					<view class="content-item-info">
						<view class="info-item" :class="item.username?.length>15 ? 'long-info-item' : ''">
							<label>{{tips.Account[lang]}}：</label>
							<text>{{ item.username || '-' }}</text>
						</view>
						<view class="info-item" :class="item.roleName?.length>15 ? 'long-info-item' : ''">
							<label>{{tips.Role[lang]}}：</label>
							<text>{{ item.roleName || '-' }}</text>
						</view>
						<view class="info-item" :class="item.mobile?.length>15 ? 'long-info-item' : ''">
							<label>{{tips.Phone[lang]}}：</label>
							<text>{{ item.mobile || '-' }}</text>
						</view>
					</view>
				</view>

				<view v-if="g_items.length < 1" class="empty-tip">
					{{tips.NoData[lang]}}
				</view>
			</scroll-view>

			<view class="levitation-button" @tap="handleJumpInfo">
				<text>{{tips.Add[lang]}}</text>
			</view>
		</view>

		<!-- 弹窗 -->
		<view class="modal-mask" v-if="c_send_key_show_momal" @tap="handleHideSengKeyModal"></view>
		<view class="modal-base-map" v-if="c_send_key_show_momal">
			<form @submit="handleFormSubmit">
				<view class="modal-container">
					<view class="modal-container-head">
						<text>{{ user_text }}</text>
						<image src="/static/images/home/right_1.png" @tap="handleHideSengKeyModal" />
					</view>

					<view class="modal-container-middle">
						<view class="middle-form-item">
							<label>{{tips.Name[lang]}}</label>
							<view class="modal-form-region">
								<input :placeholder="tips.EnterName[lang]" v-model="formData.realname"
									name="realname" />
							</view>
						</view>

						<view class="middle-form-item">
							<label>{{tips.Username[lang]}}</label>
							<view class="modal-form-region">
								<input :placeholder="tips.EnterUsername[lang]" v-model="formData.username"
									name="username" />
							</view>
						</view>
						<view class="middle-form-item">
							<label>{{tips.Password[lang]}}</label>
							<view class="modal-form-region">
								<input :placeholder="tips.EnterPassword[lang]" v-model="formData.password"
									name="password" />
							</view>
						</view>

						<view class="middle-form-item">
							<label>{{tips.Role[lang]}}</label>
							<view class="modal-form-region">
								<picker mode="selector" :range="roleArray" range-key="name"
									@change="handleBindPickerChange">
									<view class="picker">
										{{ new_role.name || tips.SelectRole[lang] }}
									</view>
								</picker>
							</view>
						</view>
					</view>

					<view class="modal-container-footer">
						<button form-type="submit">{{tips.Confirm[lang]}}</button>
					</view>
				</view>
			</form>
		</view>
	</view>
</template>

<script>
	import {
		u_delChildUser,
		u_childUserList,
		u_addOrUpdateChildUser,
		u_roleapiList
	} from '@/api/index'
	import {
		titles
	} from '@/utils/langtitle.js'
	import {
		tips
	} from '@/utils/langtips.js'
	export default {
		data() {
			return {
				tips: tips,
				lang: 'zhCn',
				c_screen_height: 0,
				c_screen_width: 0,
				statusBarHeight: 0,
				navBarHeight: 44,
				searchBarHeight: 80,
				totalNavHeight: 44,

				g_page: 1,
				g_items: [],
				g_total: 0,

				c_activeTab: 1,
				id: '',

				c_send_key_show_momal: false,
				g_uesr_details: {},
				user_text: '新增',
				new_role: {},
				roleArray: [],

				formData: {
					realname: '',
					mobile: ''
				},
				s_background_picture_of_the_front_page: ''
			}
		},

		onLoad() {
			this.initList()
		},

		onShow() {
			this.initialiImageBaseConversion()
			this.handleRole()
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'zoneCenter/userRole'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
			this.user_text = this.tips.Add[this.lang]
		},

		methods: {
			// 背景图
			initialiImageBaseConversion() {
				const imageMap = [{
					path: '/static/images/home/car-bg.png',
					key: 's_background_picture_of_the_front_page'
				}]
				const promises = imageMap.map(item => {
					return new Promise(resolve => {
						uni.getFileSystemManager().readFile({
							filePath: item.path,
							encoding: 'base64',
							success: res => {
								this[item.key] = `data:image/png;base64,${res.data}`
								resolve()
							}
						})
					})
				})
				Promise.all(promises)
			},

			// 列表
			async initList() {
				try {
					const res = await u_childUserList({})
					if (res.code === 1000) {
						this.g_items = res.content
						this.g_total = Number(res.count || 0).toLocaleString()
					}
				} catch (e) {}
			},

			// 编辑
			handleEdit(item) {
				this.c_send_key_show_momal = true
				this.g_uesr_details = item
				this.user_text = this.tips.Edit[this.lang]
				this.new_role = {
					id: item.roleId,
					name: item.roleName
				}
				this.formData = {
					realname: item.realname,
					username: item?.username || item.mobile,
					password: item?.password
				}
			},

			// 删除
			handleDelete(id) {
				uni.showModal({
					title: this.tips.Tip[this.lang],
					content: this.tips.ConfirmDeleteUser[this.lang],
					confirmText: this.tips.Confirm[this.lang],
					cancelText: this.tips.Cancel[this.lang],
					success: async (res) => {
						if (!res.confirm) return
						try {
							const res = await u_delChildUser({
								id
							})
							if (res.code === 1000) {
								this.initList()
							}
						} catch (e) {}
					}
				})
			},

			// 新增弹窗
			handleJumpInfo() {
				this.c_send_key_show_momal = true
				this.user_text = this.tips.Add[this.lang]
				this.formData = {
					realname: '',
					mobile: ''
				}
				this.new_role = {}
			},

			// 关闭弹窗
			handleHideSengKeyModal() {
				this.c_send_key_show_momal = false
				this.user_text = this.tips.Tip[this.lang]
				this.g_uesr_details = {}
				this.new_role = {}
			},

			// 角色选择
			handleBindPickerChange(e) {
				const index = e.detail.value
				this.new_role = this.roleArray[index] || {}
			},

			// 获取角色
			async handleRole() {
				try {
					const res = await u_roleapiList({})
					if (res.code === 1000) {
						this.roleArray = res.content
					}
				} catch (e) {}
			},

			// 提交
			async handleFormSubmit(e) {
				const params = {
					...this.formData,
					id: this.g_uesr_details.id || '',
					roleId: this.new_role.id
				}


				if (!params.realname || !params.roleId || !params?.username || !params?.password) {
					return
				}

				try {
					const res = await u_addOrUpdateChildUser(params)
					if (res.code === 1000) {
						this.c_send_key_show_momal = false
						this.g_uesr_details = {}
						this.new_role = {}
						this.initList()
					}
				} catch (e) {}
			}
		}
	}
</script>

<style scoped>
	/* 核心：父容器使用 flex 布局自动占满 */
	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 10rpx 4rpx;
		box-sizing: border-box;
	}

	.record-container {
		flex: 1;
		/* 关键：自动占满剩余高度 */
		width: 96%;
		margin: 0 auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
	}

	/* 滚动区域占满容器剩余高度 */
	.list-scroll {
		flex: 1;
		height: 0;
		/* 兼容必备 */
	}

	.content-item {
		margin: 10rpx;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item-head {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx 15rpx;
	}

	.head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.head-right {
		display: flex;
		flex-direction: row;
		gap: 30rpx;
		align-items: center;
		justify-content: center;
	}

	/* 文字按钮样式 */
	.text-btn {
		font-size: 26rpx;
		padding: 8rpx 16rpx;
		border-radius: 6rpx;
	}

	.edit {
		color: #1576DC;
		background: #e8f4ff;
	}

	.delete {
		color: #fa4d4d;
		background: #fff0f0;
	}

	.content-item-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10rpx;
		gap: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.info-item {
		flex: 0 0 48%;
		font-size: 24rpx;
		color: #333;
	}

	.long-info-item {
		flex-basis: 100% !important;
	}

	.empty-tip {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 26rpx;
		color: #ccc;
		height: 80vh;
	}

	.levitation-button {
		position: absolute;
		bottom: 50rpx;
		width: 100%;
		display: flex;
		justify-content: center;
		z-index: 10;
	}

	.levitation-button text {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 75rpx;
		width: 40%;
		background: linear-gradient(88deg, #1576DC, #1B64B1);
		box-shadow: 0rpx 1rpx 13rpx 0rpx rgba(51, 63, 92, 0.31);
		border-radius: 36rpx;
		font-weight: bold;
		font-size: 32rpx;
		color: #FFFFFF;
	}

	/* 弹窗 */
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 998;
	}

	.modal-base-map {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		border-radius: 20rpx;
		z-index: 999;
		padding: 20rpx;
	}

	.modal-container {
		height: 40vh;
		display: flex;
		flex-direction: column;
	}

	.modal-container-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60rpx;
	}

	.modal-container-head text {
		font-weight: bold;
		font-size: 34rpx;
		color: #333;
	}

	.modal-container-head image {
		width: 24rpx;
		height: 24rpx;
	}

	.modal-container-middle {
		flex: 1;
		overflow-y: auto;
		width: 100%;
		padding: 40rpx 0;
	}

	.middle-form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 25rpx 0;
	}

	.middle-form-item label {
		font-weight: 60;
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		width: 120rpx;
		text-align: left;
	}

	.modal-form-region {
		flex: 1;
		text-align: right;
	}

	.modal-form-region input,
	.modal-form-region .picker {
		text-align: right;
		font-size: 28rpx;
		color: #333;
	}

	.modal-container-footer {
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-container-footer button {
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		border-radius: 36rpx;
		font-weight: bold;
		font-size: 34rpx;
		color: #fff;
		width: 50%;
		height: 90%;
		border: none;
	}
</style>