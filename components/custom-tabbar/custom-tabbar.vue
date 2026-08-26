<template>
	<view class="layout-tabbar" :style="tabbarStyle">
		<view class="layout-tabbar__item" v-for="(item, index) in tabList" :key="item.menuId || index"
			@click="handleItemClick(item, index)">
			<view class="layout-tabbar__icon">
				<image class="tabbar-icon-img" :src="
            index === currentTab
              ? baseImageUrl + '/img/' + item.selectedIconPath
              : baseImageUrl + '/img/' + item.iconPath
          " mode="aspectFit" />
			</view>
			<text class="layout-tabbar__text" :class="{ active: index === currentTab }">
				{{ item.multiText }}
			</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'CustomTabbar',
		props: {
			// tab列表数据
			tabList: {
				type: Array,
				default: () => []
			},
			// 当前激活tab下标
			currentTab: {
				type: Number,
				default: 0
			},
			// 图片基础地址
			baseImageUrl: {
				type: String,
				default: ''
			},
			// tabbar高度
			tabbarHeight: {
				type: Number,
				default: 90
			},
			// iphone底部安全距离
			safeAreaBottom: {
				type: Number,
				default: 0
			}
		},
		computed: {
			tabbarStyle() {
				return {
					height: `${this.tabbarHeight}px`
				}
			}
		},
		methods: {
			handleItemClick(item, index) {
				// 向父组件抛出事件
				this.$emit('tab-click', {
					item,
					index
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* ========== tabbar 修复版：图标文字下移，整体垂直居中 ========== */
	.layout-tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #ffffff;
		display: flex;
		justify-content: space-around;
		align-items: stretch;
		border-top: 1rpx solid #eeeeee;
		z-index: 999;
		box-sizing: border-box;
		// 安全区适配，兼容iphone底部横条
		padding-bottom: constant(safe-area-inset-bottom);

		&__item {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 6rpx;
			padding-top: 12rpx;
			padding-bottom: 12rpx;
			// 扩大点击热区，整个item可点击
			position: relative;
		}

		&__icon {
			width: 52rpx;
			height: 52rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			image {
				width: 92rpx;
				height: 102rpx;
			}
		}

		&__text {
			font-size: 26rpx;
			color: #666666;
			transition: color 0.2s ease;
			flex-shrink: 0;

			&.active {
				color: #1677ff;
				font-weight: 500;
			}
		}
	}
</style>