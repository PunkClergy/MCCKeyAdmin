<template>
  <view class="container">
    <view class="record-container">
      <!-- 搜索框 -->
      <view class="search-wrapper">
        <view class="search-box">
          <uni-icons type="search" size="16" class="search-icon" />
          <input 
            placeholder="车牌号/设备号/使用人" 
            class="search-input" 
            @blur="bindblurSea" 
          />
        </view>
      </view>

      <!-- 总数 -->
      <view class="total-tips">共有{{ y_total }}条记录</view>

      <!-- 列表：自动占满剩余高度 -->
      <scroll-view 
        class="list-container" 
        scroll-y
        @scrolltolower="handleKeyLower"
      >
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
            <time-line :events="[{
              createdate: `${item.startdate || '-'} 至 ${item.enddate || '-'}`
            }]" />
          </view>

          <view class="card-footer">
            <text @tap="handleViewPhotos(item)">查看照片</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { u_rentRecord } from '@/api/index'

export default {
  data() {
    return {
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
          comParam: this.comParam
        })
        if (res.code !== 1000) return
        
        if (this.y_page > 1 && !res.content.length) {
          uni.showToast({ title: '已加载全部', icon: 'none' })
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
        uni.showToast({ title: '暂无照片', icon: 'none' })
        return
      }
      const urls = imgList.map(img => this.c_fin3_link + img.replace(/\\/g, '/'))
      uni.previewImage({ urls })
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
  height: 100%; /* 关键 */
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
  flex: 1; /* 关键：占满剩余高度 */
  width: 100%;
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
</style>