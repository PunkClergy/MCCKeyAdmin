<template>
  <view class="container">

    <!-- 自定义头部 -->
    <view 
      class="custom-header" 
      :style="{
        paddingTop: height_from_head + 'px',
        paddingLeft: capsule_distance_to_the_right + 'px',
        height: head_height + 'px'
      }"
    >
      <view class="custom-header-outer-layer">
        <image 
          class="custom-header-outer-layer-image" 
          src="/static/images/home.png"
          @tap="handleBackHome"
        />
        <view class="custom-header-outer-layer-title">个人中心</view>
        <view class="custom-header-outer-layer-user_name">
          <!-- 修复：把 v-else 包在一个 view 里 -->
          <text v-if="account" @tap="handleOnExistingAccountTap">{{account}}</text>
          <view v-else @tap="handleOnExistingAccountTap">
            <text>请登录</text>
            <image src="/static/images/right_1.png" />
          </view>
        </view>
      </view>
    </view>

    <!-- 滚动内容 -->
    <scroll-view 
      class="content" 
      scroll-y
      :style="{
        top: '90px',
        bottom: tabBarHeight + 'px'
      }"
      @scrolltolower="onReachBottom"
    >
      <view class="my-content-list-container">
        <view class="my-content-list-inner">
          <view 
            v-for="(item, index) in contentList" 
            :key="item.id"
            :data-info="item"
            class="my-content-list-item"
            :class="index === contentList.length - 1 ? 'my-content-list-item_last' : ''"
            @tap="handleFunExe"
          >
            <view class="my-content-list-item__left">
              <text class="my-content-list-item__text">{{item.text}}</text>
            </view>
            <image src="/static/images/right_1.png" class="my-content-list-item__arrow" mode="widthFix" />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部tabbar -->
    <view class="tabbar" :style="{ height: tabBarHeight + 'px' }">
      <view 
        class="tab-item" 
        :class="currentTab === index ? 'active' : ''"
        v-for="(item, index) in tabList" 
        :key="index"
        @tap="handleSwitchTabNavigation"
        :data-index="index"
      >
        <image 
          :src="`https://k1sw.wiselink.net.cn/img/${item.selectedIconPath}`" 
          class="tab-icon" 
          mode="widthFix"
          v-if="currentTab === index"
        />
        <image 
          :src="`https://k1sw.wiselink.net.cn/img/${item.iconPath}`" 
          class="tab-icon" 
          mode="widthFix"
          v-else
        />
        <text>{{item.text}}</text>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="float-button">
      <button 
        open-type="contact" 
        :show-message-card="true"
        send-message-title="我想咨询问题"
        send-message-path="/pages/index/index"
        class="hidden-contact-btn"
        @contact="handleContact"
      />
      <image src="https://k1sw.wiselink.net.cn/img/app2.0/desk/consulting.png" />
      <image 
        src="/static/images/tel400.png" 
        style="width: 80rpx;height: 80rpx;" 
        @tap="handleMakePhoneCallWithConfirm"
      />
    </view>

    <!-- 二维码弹窗 -->
    <view class="qr-group-container" v-if="join_the_group_modal">
      <view class="qr-group-mask" @tap="handleQRClose">
        <view class="qr-group-close" @tap="handleQRClose">×</view>
        <view class="qr-group-preview-content">
          <image 
            catchtap="handleQRShowImageMask" 
            class="qr-group-preview-img" 
            :src="personal_qr_code" 
            mode="widthFix"
          />
          <text class="qr-group-preview-desc">请点击、长按添加官方客服，获取体验权限！</text>
        </view>
      </view>
    </view>

  </view>
</template>
<script>
import { u_getQrcodeImg, u_navlist20, u_mylist } from '@/api/index'

export default {
  data() {
    return {
      tabBarHeight: 80,
      currentTab: 2,
      c_link: 'https://k1sw.wiselink.net.cn/',
      join_the_group_modal: false,
      tabList: [],
      contentList: [],
      servicePhone: '400-090-5050',
      
      height_from_head: 0,
      head_height: 0,
      capsule_distance_to_the_right: 0,
      account: '',
      personal_qr_code: ''
    }
  },

  onLoad() {
    this.initBottomDirectory()
    this.initDirectoryStructure()
  },

  onShow() {
    this.initSystemInfo()
  },

  onReady() {
    this.initLoginStatus()
    this.initQrCode()
  },

  methods: {
    // 拨打电话
    handleMakePhoneCallWithConfirm() {
      uni.showModal({
        title: '拨打电话',
        content: `是否拨打客服电话：${this.servicePhone}`,
        confirmText: '拨打',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: this.servicePhone,
              fail: (err) => {
                if (err.errMsg !== 'makePhoneCall:fail cancel') {
                  uni.showToast({ title: '拨号失败', icon: 'none' })
                }
              }
            })
          }
        }
      })
    },

    // 系统信息
    initSystemInfo() {
      const { statusBarHeight: s, screenWidth } = uni.getWindowInfo()
      const m = uni.getMenuButtonBoundingClientRect()
      if (!m) return
      const n = m.height + (m.top - s) * 2
      const c = screenWidth - m.right
      this.height_from_head = s
      this.head_height = s + n
      this.capsule_distance_to_the_right = c
    },

    // 登录状态
    initLoginStatus() {
      try {
        const res = uni.getStorageSync('userKey')
        this.account = res?.data?.companyName || res?.data?.username || ''
      } catch (e) {}
    },

    // 二维码
    async initQrCode() {
      try {
        const res = await u_getQrcodeImg({})
        if (res.code === 1000) {
          this.personal_qr_code = res.content.img
        }
      } catch (e) {}
    },

    // 底部导航
    async initBottomDirectory() {
      try {
        const res = await u_navlist20({})
        if (res.code === 1000) {
          this.tabList = res.content
          this.currentTab = res.content?.length - 1
        }
      } catch (e) {}
    },

    // 跳登录
    handleOnExistingAccountTap() {
      uni.navigateTo({ url: '/pages/system/managerLoginView/loginView' })
    },

    // 目录数据
    async initDirectoryStructure() {
      try {
        const res = await u_mylist({})
        if (res.code === 1000) {
          this.contentList = res.content
        }
      } catch (e) {}
    },

    // 显示二维码
    handleShowContact() {
      this.join_the_group_modal = true
    },

    // 关闭二维码
    handleQRClose() {
      this.join_the_group_modal = false
    },

    // 预览图片
    handleQRShowImageMask() {
      uni.previewMedia({
        sources: [{ url: this.personal_qr_code, type: 'image' }]
      })
    },

    // 切换tab
    handleSwitchTabNavigation(evt) {
      const idx = evt.currentTarget.dataset.index
      if (!idx) return
      const item = this.tabList[idx]
      if (!item?.pagePath) return
      const targetUrl = item.pagePath
      uni.redirectTo({ url: `/${targetUrl}` })
    },

    // 返回首页
    handleBackHome() {
      uni.redirectTo({ url: '/pages/index/index' })
    },

    // 点击功能
    handleFunExe(evt) {
      const info = evt.currentTarget.dataset.info
      if (!info || !info.pagePath) return
      uni.navigateTo({ url: `/${info.pagePath}` })
    },

    // 客服消息
    handleContact() {},

    // 触底
    onReachBottom() {}
  }
}
</script>

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
}

.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  align-items: center;
  height: 100vh;
  background-color: #F3F9FD;
}

.custom-header {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.custom-header-outer-layer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25rpx;
}

.custom-header-outer-layer-image {
  width: 45rpx;
  height: 49rpx;
}

.custom-header-outer-layer-title {
  font-weight: bold;
  font-size: 36rpx;
  color: #333333;
}

.custom-header-outer-layer-user_name {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5rpx;
}

.custom-header-outer-layer-user_name text {
  font-weight: 500;
  font-size: 28rpx;
  color: #333333;
}

.custom-header-outer-layer-user_name image {
  width: 26rpx;
  height: 26rpx;
}

.content {
  width: 100%;
  position: absolute;
  overflow-y: auto;
  box-sizing: border-box;
}

.my-content-list-container {
  width: 96%;
  margin: 0 auto;
}

.my-content-list-inner {
  width: 94%;
  background-color: #fff;
  margin: 0 auto;
  border-radius: 20rpx;
  padding: 20rpx;
}

.my-content-list-item {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #CDD5DA;
}

.my-content-list-item_last {
  border-bottom: none;
}

.my-content-list-item__left {
  display: flex;
  gap: 20rpx;
  flex-direction: row;
  align-items: center;
}

.my-content-list-item__text {
  font-weight: bold;
  font-size: 28rpx;
  color: #333333;
}

.my-content-list-item__arrow {
  width: 25rpx;
  height: 25rpx;
}

.tabbar {
  width: 100%;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  box-sizing: border-box;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 25%;
}

.tab-icon {
  width: 50rpx;
  height: 50rpx;
  margin-bottom: 10rpx;
}

.tab-item text {
  font-size: 24rpx;
  color: #999;
}

.tab-item.active text {
  color: #3498db;
}

.float-button {
  position: fixed;
  right: 20rpx;
  top: 75%;
  transform: translateY(-50%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.2s ease;
  flex-direction: column;
  gap: 20rpx;
}

.float-button image {
  width: 111rpx;
  height: 123rpx;
}

.hidden-contact-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  opacity: 0;
  z-index: 10;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.qr-group-container {
  width: 100%;
  box-sizing: border-box;
}

.qr-group-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.qr-group-close {
  position: absolute;
  top: 12vh;
  right: 30rpx;
  color: white;
  font-size: 60rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.qr-group-preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}

.qr-group-preview-img {
  max-width: 90%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 12rpx;
}

.qr-group-preview-desc {
  color: white;
  font-size: 24rpx;
  text-align: center;
  padding: 0 40rpx;
  line-height: 1.5;
}
</style>