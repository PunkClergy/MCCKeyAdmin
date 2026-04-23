<template>
	<view class="container" :style="{ backgroundImage: `url(${s_background_picture_of_the_front_page})` }">
		<custom-header :title="pageType ? '使用指南' : '视频物料'" />

		<view
			:style="{  width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }">
			<view class="search-drop"
				style="display: flex;flex-direction: row;justify-content: space-around;width: 100%;">
				<view v-for="(item, index) in filter_aggregate" :key="index">
					<drop-filter-com :data-id="item.id" :range="item.filter_work_status" :filter="item.name"
						@transmit="bindPickerChange" />
				</view>
			</view>

			<view class="search-box" style="margin-top: 10rpx;">
				<icon type="search" size="16" class="search-icon" />
				<input placeholder="请输入名称" @blur="handleBlur" class="search-input" />
			</view>
		</view>

		<view class="record-container"
			:style="{ height: c_screen_height - (navBarHeight + statusBarHeight) + 'px', marginTop: '10rpx' }">
			<scroll-view scroll-y :style="{ height: c_screen_height - (navBarHeight + statusBarHeight + 10) + 'px' }"
				@scrolltolower="handleLower" @refresherrefresh="handleRefresh" :refresher-enabled="true"
				:refresher-triggered="g_triggered">
				<view class="content-item" v-for="(item, index) in g_items" :key="index">
					<view class="content-item-head">
						<view class="head-left">
							<view class="left-category">
								<text>{{ item.title }}</text>
							</view>
						</view>
					</view>

					<view class="content-item-info">
						<view class="info-item" v-if="!pageType">
							<label>主/子序号：</label>
							<text>{{ item.dsx || '-' }}/{{ item.xsx }}</text>
						</view>
						<view class="info-item" :class="item.createusername?.length > 15 ? 'long-info-item' : ''"
							v-if="!pageType">
							<label>创建人：</label>
							<text>{{ item.createusername || '-' }}</text>
						</view>
						<view class="info-item" :class="item.fileTypeName?.length > 15 ? 'long-info-item' : ''">
							<label>类型：</label>
							<text>{{ item.fileTypeName || '-' }}</text>
						</view>
						<view class="info-item" :class="item.industryName?.length > 15 ? 'long-info-item' : ''">
							<label>行业：</label>
							<text>{{ item.industryName || '-' }}</text>
						</view>
						<view class="info-item long-info-item">
							<label>创建时间：</label>
							<text>{{ item.createdate || '-' }}</text>
						</view>
						<view class="info-item long-info-item">
							<label>备注：</label>
							<text>{{ item.bak || '-' }}</text>
						</view>
					</view>

					<view class="content-item-footer">
						<view class="footer-left"></view>
						<view class="footer-right" style="display: flex;gap: 10rpx;">
							<view class="footer-right-btn" :data-item="item" @click="hadleView">
								<text>查看</text>
							</view>
							<button class="footer-right-btn" open-type="share" :data-item="item"
								style="height: 42rpx;">分享给好友</button>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import {
		u_promotionalApi,
		u_promotionalApiWxBooklist,
		u_industryList
	} from '@/api/index.js'



	const filter_sort = [{
			value: 'asc',
			name: '升序'
		},
		{
			value: 'desc',
			name: '降序'
		},
	]
	const filter_type = [{
			value: '',
			name: '全部'
		},
		{
			value: 1,
			name: '图片'
		},
		{
			value: 2,
			name: '视频'
		},
		{
			value: 3,
			name: '文档'
		},
		{
			value: 4,
			name: '其他'
		},
	]

	export default {
		data() {
			return {
				c_screen_height: 0,
				c_screen_width: 0,
				statusBarHeight: 0,
				navBarHeight: 44,
				searchBarHeight: 80,
				totalNavHeight: (0) + (44),

				g_page: 1,
				g_items: [],
				g_param: {},
				g_triggered: false,
				pageType: 0,
				filter_industry: [],
				s_background_picture_of_the_front_page: '/static/images/home/car-bg.png',

				filter_aggregate: [{
						id: 1,
						name: '默认排序',
						btnRender: false,
						params: 'a',
						filter_work_status: filter_sort
					},
					{
						id: 2,
						name: '所有类型',
						btnRender: false,
						params: 'a',
						filter_work_status: filter_type
					},
					{
						id: 3,
						name: '所有行业',
						btnRender: false,
						params: 'a',
						filter_work_status: []
					},
				],
			}
		},
		onLoad(options) {
			this.pageType = options?.type || 0
			this.initList(this.pageType)
		},
		onShow() {
			this.initialQuickEntry()
		},
		methods: {
			async initialQuickEntry() {
				try {
					const res = await u_industryList({
						terminalId: -1
					})
					const content = res.content || []
					const info = content.map(({
						id,
						name
					}) => ({
						value: id,
						name
					}))
					const infoWithAll = [{
						value: '',
						name: '全部'
					}, ...info]

					this.filter_aggregate[2].filter_work_status = infoWithAll
					this.filter_industry = infoWithAll
				} catch (err) {}
			},
			bindPickerChange(evt) {
				const flag = evt?.currentTarget?.dataset?.id
				const key = evt?.detail?.key

				const config = {
					'1': {
						targetKey: 'sort',
						sourceList: filter_sort
					},
					'2': {
						targetKey: 'fileType',
						sourceList: filter_type
					},
					'3': {
						targetKey: 'industry',
						sourceList: this.filter_industry
					}
				}
				const setting = config[flag]
				if (!setting) return

				const selectedItem = setting.sourceList?.[key]
				if (!selectedItem) return

				this.g_param[setting.targetKey] = selectedItem.value

				const index = this.filter_aggregate.findIndex(item => item.id == flag)
				if (index !== -1) {
					this.filter_aggregate[index].name = selectedItem.name
				}

				this.g_page = 1
				this.g_items = []
				this.initList()
			},
			handleBlur(evt) {
				const inputValue = evt?.detail?.value ?? ''
				this.g_param.name = inputValue
				this.g_page = 1
				this.g_items = []
				this.initList()
			},
			async initList(isWxBooklist) {
				try {
					const param = {
						page: this.g_page,
						...this.g_param
					}
					const res = isWxBooklist ? await u_promotionalApiWxBooklist(param) : await u_promotionalApi(param)

					if (res.code === 1000) {
						this.g_items = this.g_items.concat(res.content || [])
					}
				} catch (e) {}
			},
			handleLower() {
				this.g_page++
				this.initList(this.pageType)
			},
			handleRefresh() {
				this.g_triggered = false
				this.g_page = 1
				this.g_items = []
				this.initList(this.pageType)
			},
			getLinkTypeByExtension(url) {
				const match = url.match(/\.([a-zA-Z0-9]+)(\?|#|$)/)
				if (!match) return 'unknown'
				const ext = match[1].toLowerCase()
				const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico']
				const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'flv', 'mkv']
				const documentExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'md', 'zip',
					'rar'
				]
				if (imageExtensions.includes(ext)) return 'image'
				if (videoExtensions.includes(ext)) return 'video'
				if (documentExtensions.includes(ext)) return 'document'
				return 'unknown'
			},
			hadleCopyLink(evt) {
				const info = evt.currentTarget.dataset.item
				const link = `${info?.title} https://k3a.wiselink.net.cn/img/${encodeURI(info.filepath)}`
				uni.setClipboardData({
					data: link,
					success: () => uni.showToast({
						title: '已复制',
						icon: 'none'
					}),
					fail: () => uni.showToast({
						title: '复制失败',
						icon: 'none'
					})
				})
			},
			hadleView(evt) {
				const path = `https://k3a.wiselink.net.cn/img/${evt.currentTarget.dataset.item.filepath}`
				uni.navigateTo({
					url: `/pages/agreementWebView/agreementWebView?url=${path}`
				})
			},
			onShareAppMessage(evt) {
				const info = `https://k3a.wiselink.net.cn/img/${encodeURI(evt.target.dataset.item?.filepath)}`
				return {
					title: evt.target.dataset.item?.title,
					path: `/pages/agreementWebView/agreementWebView?url=${info}`,
					imageUrl: info
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	/* 你的原有样式全部保留，我已整理干净 */
	.container {
		height: 100vh;
		padding: 10rpx 4rpx;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		position: relative;
		background-color: #EFF1FC
	}

	.record-container {
		width: 96%;
		margin: auto;
		position: relative;
		border-radius: 12rpx;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.content-item {
		margin: 15rpx;
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

	.left-category {
		display: flex;
		align-items: center;
		font-weight: bold;
		font-size: 26rpx;
		color: #333333;
		gap: 10rpx;
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
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
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
		display: flex;
		align-items: center;
		font-weight: bold;
		font-size: 22rpx;
		color: #ffffff;
		background-color: #1b64b1;
		border-radius: 8rpx;
		padding: 4rpx 15rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		border-radius: 200rpx;
		padding: 8px 12px;
		width: 90%;
	}

	.search-input {
		flex: 1;
		border: none;
		background-color: transparent;
		outline: none;
		font-size: 26rpx;
	}
</style>