<template>
  <!-- 高级版欢迎 Loading 页面 -->
  <view class="welcome-page">
    <!-- 主内容区 -->
    <view class="content">
      <!-- 主标题 -->
      <view class="main-title">欢迎使用</view>
      
      <!-- 加载动画 -->
      <view class="loader">
        <view class="circle"></view>
      </view>
      
      <!-- 描述文字 -->
      <view class="desc">正在为您准备优质服务...</view>
    </view>

    <!-- 底部版权 -->
    <view class="footer">© 2025 技术支持</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      timer: null
    }
  },
  onLoad() {
    // 3秒后跳转
    this.timer = setTimeout(() => {
      uni.redirectTo({
        url: '/pages/zoneCenter/index'
      })
    }, 3000)
  },
  onUnload() {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped>
/* 全屏渐变背景 */
.welcome-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 内容居中 */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 主标题 */
.main-title {
  font-size: 56rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 70rpx;
  letter-spacing: 4rpx;
  animation: fadeIn 1.2s ease;
}

/* 加载动画容器 */
.loader {
  margin-bottom: 40rpx;
  animation: fadeIn 1.5s ease;
}

/* 旋转圆圈 */
.circle {
  width: 70rpx;
  height: 70rpx;
  border: 5rpx solid rgba(52, 152, 219, 0.2);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}

/* 描述文字 */
.desc {
  font-size: 28rpx;
  color: #7f8c8d;
  animation: fadeIn 1.8s ease;
}

/* 底部版权 */
.footer {
  position: absolute;
  bottom: 60rpx;
  font-size: 24rpx;
  color: #95a5a6;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 旋转动画 */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>