<template>
	<view class="container" :style="{ backgroundImage: `url(${s_background_picture_of_the_front_page})` }">
		<custom-header :title="pageType ? tips.UserGuide[lang] : tips.VideoMaterial[lang]" />

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
				<input :placeholder="tips.PleaseEnterName[lang]" @blur="handleBlur" class="search-input" />
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
							<label>{{tips.ParentChildNo[lang]}}：</label>
							<text>{{ item.dsx || '-' }}/{{ item.xsx }}</text>
						</view>
						<view class="info-item" :class="item.createusername?.length > 15 ? 'long-info-item' : ''"
							v-if="!pageType">
							<label>{{tips.CreatedBy[lang]}}：</label>
							<text>{{ item.createusername || '-' }}</text>
						</view>
						<view class="info-item" :class="item.fileTypeName?.length > 15 ? 'long-info-item' : ''">
							<label>{{tips.CategoryType[lang]}}：</label>
							<text>{{ item.fileTypeName || '-' }}</text>
						</view>
						<view class="info-item" :class="item.industryName?.length > 15 ? 'long-info-item' : ''">
							<label>{{tips.Industry[lang]}}：</label>
							<text>{{ item.industryName || '-' }}</text>
						</view>
						<view class="info-item long-info-item">
							<label>{{tips.CreatedTime[lang]}}：</label>
							<text>{{ item.createdate || '-' }}</text>
						</view>
						<view class="info-item long-info-item">
							<label>{{tips.Remark[lang]}}：</label>
							<text>{{ item.bak || '-' }}</text>
						</view>
					</view>

					<view class="content-item-footer">
						<view class="footer-left"></view>
						<view class="footer-right" style="display: flex;gap: 10rpx;">
							<view class="footer-right-btn" :data-item="item" @click="hadleView">
								<text>{{tips.View[lang]}}</text>
							</view>
							<button class="footer-right-btn" open-type="share" :data-item="item"
								style="height: 42rpx;">{{tips.ShareToFriend[lang]}}</button>
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
	import {
		tips
	} from '@/utils/langtips.js'

	const filter_sort = [{
			value: 'asc',
			name: 'asc'
		},
		{
			value: 'desc',
			name: 'desc'
		},
	]
	const filter_type = [{
			value: '',
			name: 'all'
		},
		{
			value: 1,
			name: 'image'
		},
		{
			value: 2,
			name: 'video'
		},
		{
			value: 3,
			name: 'document'
		},
		{
			value: 4,
			name: 'other'
		},
	]

	export default {
		data() {
			return {
				tips: tips,
				lang: 'zhCn',
				filterSortList: [],
				filterTypeList: [],
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
						name: '',
						btnRender: false,
						params: 'a',
						filter_work_status: filter_sort
					},
					{
						id: 2,
						name: '',
						btnRender: false,
						params: 'a',
						filter_work_status: filter_type
					},
					{
						id: 3,
						name: '',
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
			this.lang = uni.getStorageSync('language') || 'zhCn'
			this.buildFilters()
			this.initialQuickEntry()
		},
		methods: {
			buildFilters() {
				this.filterSortList = [
					{ value: 'asc', name: this.tips.SortAsc[this.lang] },
					{ value: 'desc', name: this.tips.SortDesc[this.lang] }
				]
				this.filterTypeList = [
					{ value: '', name: this.tips.All[this.lang] },
					{ value: 1, name: this.tips.TypeImage[this.lang] },
					{ value: 2, name: this.tips.TypeVideo[this.lang] },
					{ value: 3, name: this.tips.TypeDocument[this.lang] },
					{ value: 4, name: this.tips.TypeOther[this.lang] }
				]
				this.filter_aggregate[0].name = this.tips.SortDefault[this.lang]
				this.filter_aggregate[1].name = this.tips.AllTypes[this.lang]
				this.filter_aggregate[2].name = this.tips.AllIndustries[this.lang]
			},
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
						name: this.tips.All[this.lang]
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
						sourceList: this.filterSortList
					},
					'2': {
						targetKey: 'fileType',
						sourceList: this.filterTypeList
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
						title: this.tips.Copied[this.lang],
						icon: 'none'
					}),
					fail: () => uni.showToast({
						title: this.tips.CopyFailed[this.lang],
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