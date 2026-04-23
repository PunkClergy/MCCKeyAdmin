<template>
	<view class="container" :style="{
    backgroundImage: `url(${s_background_picture_of_the_front_page})`,
    height: c_screen_height + 'px'
  }">

		<!-- 搜索框（正常显示，不遮挡） -->
		<view class="search-container">
			<view class="search-count">
				<text>共有{{g_total}}人员</text>
			</view>
		</view>

		<!-- 滚动列表（自动排在搜索框下方） -->
		<scroll-view
			class="content-container"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="g_triggered"
			@refresherrefresh="handleRefresh"
			@scrolltolower="handleLower"
		>
			<view v-for="(item, index) in g_items" :key="index">
				<view class="content-item">
					<view class="content-item-head">
						<view class="head-left">
							<view class="left-category">
								<text>{{item.realname}}
									<text v-if="item.acquiescent"
										style="font-size:22rpx;padding:4rpx;border-radius:6rpx;background:#f0f0f0;color:#575656;margin-left:20rpx;">超级管理员</text>
								</text>
							</view>
						</view>
					</view>

					<view class="content-item-info">
						<view class="info-item" :class="item.username?.length>8 ? 'long-info-item' : ''">
							<label>账号 ：</label>
							<text>{{item.username || '-'}}</text>
						</view>
						<view class="info-item" :class="item.username?.length>8 ? 'long-info-item' : ''">
							<label>角色 ：</label>
							<text>{{item.roleName || '-'}}</text>
						</view>
						<view class="info-item" :class="item.mobile?.length>15 ? 'long-info-item' : ''">
							<label>手机号 ：</label>
							<text>{{item.mobile || '-'}}</text>
						</view>
					</view>

					<view class="content-item-footer">
						<view class="footer-left"></view>
						<view class="footer-right">
							<view class="footer-right-btn" :data-item="item" @tap="handleSelectJump">
								<text>移交管理员</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { u_childUserList, u_transferAdminUser } from '@/api/index'

	export default {
		data() {
			return {
				c_screen_height: 0,
				c_statusBarHeight: 0,
				c_navBarHeight: 44,
				c_searchBarHeight: 40,
				c_totalNavHeight: 44,

				g_page: 1,
				g_comParam: '',
				g_items: [],
				g_triggered: false,
				g_total: 0,
				user: '',

				s_background_picture_of_the_front_page: ''
			}
		},

		onLoad(options) {
			uni.getSystemInfo({
				success: (res) => {
					this.c_screen_height = res.windowHeight
					this.c_statusBarHeight = res.statusBarHeight
					this.c_navBarHeight = res.platform === 'ios' ? 49 : 44
					this.c_totalNavHeight = this.c_statusBarHeight + this.c_navBarHeight
				}
			})
			this.getCarList()
		},

		onShow() {
			this.user = getApp()?.globalData?.userInfo?.username || ''
		},

		methods: {
			async getCarList() {
				try {
					const param = { page: this.g_page }
					const res = await u_childUserList(param)
					if (res.code === 1000) {
						let list = res.data?.content || res.content || []
						this.g_items = this.g_items.concat(list)
						this.g_total = res.data?.count || res.count || 0
					}
				} catch (e) {}
			},

			handleLower() {
				this.g_page++
				this.getCarList()
			},

			handleRefresh() {
				this.g_triggered = false
				this.g_page = 1
				this.g_items = []
				this.getCarList()
			},

			handleSelectJump(e) {
				const item = e.currentTarget.dataset.item
				const params = { targetUserId: item.id }

				uni.showModal({
					title: '提示',
					content: '确认移交管理员？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const res = await u_transferAdminUser(params)
								if (res.code === 1000) {
									uni.redirectTo({ url: '/pages/index/index' })
								}
							} catch (e) {}
						}
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
	}

	.search-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.search-count {
		width: 90%;
		text-align: center;
	}

	.search-count text {
		font-size: 22rpx;
		color: #7B7C7C;
	}

	/* 核心修复：取消绝对定位，正常流式布局 */
	.content-container {
		flex: 1;
		width: 100%;
	}

	.content-item {
		margin: 15rpx;
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item-head {
		display: flex;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx 15rpx;
	}

	.content-item-info {
		display: flex;
		flex-wrap: wrap;
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

	.content-item-footer {
		display: flex;
		padding: 15rpx;
		justify-content: space-between;
	}

	.footer-right-btn {
		background: #1B64B1;
		color: #fff;
		font-size: 22rpx;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
	}
</style>