<template>
	<view class="container">
		<view class="record-container">
			<!-- 搜索框 -->
			<view class="search-wrapper">
				<view class="search-box">
					<uni-icons type="search" size="16" class="search-icon" />
					<input :placeholder="tips.PlateDeviceUser[lang]" class="search-input" @blur="bindblurSea" />
				</view>
			</view>

			<!-- 总数 -->
			<view class="total-tips">{{ tips.TotalRecords[lang] }}{{ y_total }} {{ tips.Records[lang] }}</view>

			<!-- 列表：自动占满剩余高度 -->
			<scroll-view class="list-container" scroll-y @scrolltolower="handleKeyLower">
				<view class="content-card" v-for="(item, index) in y_items" :key="index">
					<view class="card-head">
						<view class="card-head-left">
							<text>{{ item.platenumber }}</text>
							<text>{{ item.personname }}</text>
							<text class="split-line"></text>
							<text class="phone-text">{{ item.mobile }}</text>
						</view>
					</view>

					<view class="card-info">
						{{item.startdate}} ~ {{item.enddate}}
					</view>

					<view class="card-footer">
						<text @tap="handleViewPhotos(item)">{{ tips.ViewPhotos[lang] }}</text>
					</view>
				</view>

				<!-- 空数据 -->
				<view class="empty" v-if="y_items.length === 0">{{ tips.NoData[lang] }}</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import {
		tips
	} from '@/utils/langtips.js'
	import {
		titles
	} from '@/utils/langtitle.js'
	import {
		u_rentRecord
	} from '@/api/index'

	export default {
		data() {
			return {
				lang: 'zhCn',
				tips: tips,

				y_items: [],
				y_page: 1,
				y_total: 0,
				comParam: '',
				c_fin3_link: 'https://k1sw.wiselink.net.cn/img/'
			}
		},
		onLoad() {
			this.getKeySendingList()
		},
		onShow() {
			// 多语言 + 导航栏标题
			this.lang = uni.getStorageSync('language') || 'zhCn'
			const pageRoute = 'zoneCenter/rentRecordList'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
		},
		methods: {
			// 搜索
			async bindblurSea(e) {
				this.comParam = e.detail.value
				this.y_page = 1
				this.y_items = []
				await this.getKeySendingList()
			},
			// 加载更多
			async handleKeyLower() {
				this.y_page++
				await this.getKeySendingList()
			},
			// 获取列表
			async getKeySendingList() {
				try {
					const res = await u_rentRecord({
						page: this.y_page,
						status: 1,
						comParam: this.comParam,
						pageSize:10
					})
					if (res.code !== 1000) return

					if (this.y_page > 1 && !res.content.length) {
						uni.showToast({
							title: tips.LoadedAll[this.lang],
							icon: 'none'
						})
						return
					}
					this.y_total = res.count || 0
					this.y_items = this.y_page === 1 ? res.content : [...this.y_items, ...res.content]
				} catch (e) {}
			},
			// 预览图片
			handleViewPhotos(item) {
				const imgList = [item.img1, item.img2, item.img3, item.img4, item.img5].filter(Boolean)
				if (!imgList.length) {
					uni.showToast({
						title: tips.NoPhotos[this.lang],
						icon: 'none'
					})
					return
				}
				const urls = imgList.map(img => this.c_fin3_link + img.replace(/\\/g, '/'))
				uni.previewImage({
					urls
				})
			}
		}
	}
</script>

<style scoped>
	/* 最外层：全屏高度 */
	.container {
		height: 100vh;
		padding: 10rpx 4rpx;
		box-sizing: border-box;
		background-color: #EFF1FC;
	}

	/* 核心卡片：flex 纵向布局 */
	.record-container {
		width: 96%;
		margin: 0 auto;
		height: 100%;
		/* 关键 */
		border-radius: 12rpx;
		background: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* 搜索区：固定高度 */
	.search-wrapper {
		padding: 10rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		border: 1px solid #f0f0f0;
		border-radius: 40rpx;
		padding: 8rpx 16rpx;
		width: 92%;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 22rpx;
		padding: 4rpx;
	}

	/* 总数提示：固定高度 */
	.total-tips {
		text-align: center;
		font-size: 22rpx;
		color: #7b7c7c;
		padding: 10rpx 0;
	}

	/* 列表：自动占满剩余高度（核心） */
	.list-container {
		flex: 1;
		/* 关键：占满剩余高度 */
		width: 100%;
		height: 90%;
	}

	/* 卡片样式 */
	.content-card {
		border: 1px solid #f0f0f0;
		margin: 12rpx;
		padding: 12rpx;
		border-radius: 8rpx;
	}

	.card-head {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #f0f0f0;
		height: 60rpx;
	}

	.card-head-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
	}

	.phone-text {
		font-size: 24rpx;
		font-weight: 500;
		color: #333;
	}

	.split-line {
		width: 1px;
		height: 35rpx;
		background: #f0f0f0;
	}

	.card-info {
		padding: 10rpx 0;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
		font-size: 12px;
	}

	.card-footer {
		display: flex;
		justify-content: flex-end;
		padding: 10rpx 0;
	}

	.card-footer text {
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		background: #4587fd;
		color: #fff;
		font-size: 22rpx;
	}

	.empty {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
		font-size: 26rpx;
	}
</style>