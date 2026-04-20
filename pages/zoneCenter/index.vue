<template>
  <view class="container" :style="{ background: `linear-gradient(${bgcolor}, #fff)` }">
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
        <image class="custom-header-outer-layer-image" src="/static/images/home.png" @tap="handleBackHome"></image>
        <view class="custom-header-outer-layer-title">{{title_name}}</view>
        <view class="custom-header-outer-layer-user_name">
          <text v-if="account">{{account}}</text>
          <view v-else @tap="handleOnExistingAccountTap" class="login-wrapper">
            <text>请登录</text>
            <image src="/static/images/right_1.png" />
          </view>
        </view>
      </view>

      <view 
        class="subtitle" 
        :style="{
          fontSize: (stfontSize || 11) + 'px',
          padding: '0 ' + capsule_distance_to_the_right + 'px'
        }"
      >
        {{subtitle}}
      </view>
    </view>

    <!-- 滚动内容 -->
    <scroll-view 
      class="content" 
      scroll-y
      :style="{
        top: head_height + 'px',
        bottom: tabBarHeight + 'px'
      }"
    >
      <!-- 轮播图 -->
      <view class="swiper-container">
        <swiper 
          indicator-dots="false" 
          autoplay 
          interval="3000" 
          duration="500" 
          :style="{ height: s_banner_height + 'px' }"
        >
          <swiper-item v-for="(item,index) in g_banner_image" :key="index">
            <image 
              @tap="handleJumpInfo" 
              :data-item="item" 
              :src="c_link + '/img/' + (item.fileType==1?item.img:item.videoImg)" 
              class="banner-img" 
              mode="widthFix" 
              data-flag="banner" 
              @load="LoadOnUseGuideImageLoad" 
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 公告 -->
      <view class="notice" v-if="isShowInfo">
        <view class="notice-content">
          温馨提示：请提醒用车人，若遇无网络时，点击页面右上角「···」并刷新页面，即可进入【紧急开关锁】页面；
          若需长时间处于无信号覆盖区域，建议随身携带实体钥匙备用。
        </view>
      </view>

      <!-- 专区入口 -->
      <view class="special-zone-container">
        <view 
          class="special-zone" 
          v-for="(item,index) in groupedZoneList" 
          :key="index" 
          :style="{ '--item-count': item.list.length }"
        >
          <view class="zone-item" v-for="(zoneItem,idx) in item.list" :key="idx">
            <view 
              class="zone-out" 
              :style="{ backgroundColor: zoneItem.bgcolor }" 
              :data-info="zoneItem" 
              @tap="handleGetMenuList"
            >
              <image class="zone-img" :src="'https://k1sw.wiselink.net.cn/img/' + zoneItem.icon" />
              <view class="zone-text-area">
                <view class="zone-name">{{zoneItem.name}}</view>
                <view class="zone-desc">{{zoneItem.bak}}</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 使用指南 -->
      <view class="full-width-swiper" v-if="fullBannerList.length>0">
        <view class="full-width-use">
          <image src="/static/images/useGuideIcon.png" />
          <text>使用指南</text>
        </view>
        <swiper 
          indicator-dots="false" 
          autoplay 
          interval="4000" 
          duration="500" 
          :style="{ height: s_use_height + 'px' }"
        >
          <swiper-item v-for="(item,index) in fullBannerList" :key="index" :data-info="item">
            <image 
              :src="'https://k1sw.wiselink.net.cn/img/' + item.imgpath" 
              class="full-banner-img" 
              data-flag="use" 
              :data-url="item.bookPath" 
              :data-title="item.title" 
              @tap="handlePlayVideo" 
              @load="LoadOnUseGuideImageLoad" 
              mode="widthFix"
            />
          </swiper-item>
        </swiper>
      </view>
    </scroll-view>

    <!-- 底部tabbar -->
    <view class="tabbar" :style="{ height: tabBarHeight + 'px' }">
      <view 
        class="tab-item" 
        :class="currentTab === index ? 'active' : ''" 
        v-for="(item,index) in tabList" 
        :key="index" 
        @tap="handleSwitchTabNavigation" 
        :data-index="index"
      >
        <image 
          class="tab-icon" 
          mode="widthFix" 
          :src="'https://k1sw.wiselink.net.cn/img/' + item.selectedIconPath" 
          v-if="currentTab === index" 
        />
        <image 
          class="tab-icon" 
          mode="widthFix" 
          :src="'https://k1sw.wiselink.net.cn/img/' + item.iconPath" 
          v-else 
        />
        <text>{{item.text}}</text>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="float-button">
      <button open-type="contact" class="hidden-contact-btn"></button>
      <image src="https://k1sw.wiselink.net.cn/img/app2.0/desk/consulting.png" />
      <image src="/static/images/tel400.png" @tap="handleMakePhoneCallWithConfirm" />
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
import 'url-search-params-polyfill';
import {
  u_getHomeArea,
  u_bannerlist20,
  u_getQrcodeImg,
  u_navlist20,
  u_booklist,
  u_isShowInfo
} from '@/api/index'

export default {
  data() {
    return {
      tabBarHeight: 100,
      currentTab: 0,
      c_link: 'https://k1sw.wiselink.net.cn/',
      g_banner_image: [],
      s_banner_height: '',
      join_the_group_modal: false,
      fullBannerList: [],
      title_name: '',
      bgcolor: '#fff',
      
      // ✅ 关键：给默认值，永远不会为空
      height_from_head: 20,
      head_height: 88,
      capsule_distance_to_the_right: 15,
      
      zoneList: [{
        id: 1,
        name: '钥匙分享',
        bgcolor: '#EFF1FC',
        icon: 'privateCar.png'
      }],
      tabList: [],
      isShowInfo: false,
      servicePhone: '400-090-5050',
      personal_qr_code: '',
      groupedZoneList: [],
      account: '',
      subtitle: '',
      stfontSize: '',
      s_use_height: ''
    }
  },
  methods: {
    initSystemInfo() {
      try {
        const { statusBarHeight } = uni.getWindowInfo()
        const menu = uni.getMenuButtonBoundingClientRect()
        if (!menu) return
        
        const headerHeight = menu.height + (menu.top - statusBarHeight) * 2
        const right = uni.getWindowInfo().screenWidth - menu.right
        
        // 赋值
        this.height_from_head = statusBarHeight
        this.head_height = statusBarHeight + headerHeight
        this.capsule_distance_to_the_right = right
      } catch (e) {
        console.log('获取状态栏信息失败')
      }
    },
    handleJumpInfo(evt) {
      const { item = {} } = evt?.currentTarget?.dataset || {};
      const { fileType, path: localPath, img } = item;
      const IMG_BASE_URL = 'https://k3a.wiselink.net.cn/img/';
      const targetPath = fileType === 1 ? localPath : `${IMG_BASE_URL}${img || ''}`;
      const navigateUrl = fileType === 1 ? targetPath : `/pages/agreementWebView/agreementWebView?url=${encodeURIComponent(targetPath)}`;
      if (!navigateUrl) {
        uni.showToast({ title: '跳转路径无效', icon: 'none' });
        return;
      }
      uni.navigateTo({ url: navigateUrl });
    },
    handleMakePhoneCallWithConfirm() {
      uni.showModal({
        title: '拨打电话',
        content: `是否拨打客服电话：${this.servicePhone}`,
        success: (res) => {
          if (res.confirm) uni.makePhoneCall({ phoneNumber: this.servicePhone });
        }
      });
    },
    handleOnExistingAccountTap() {
      uni.navigateTo({ url: '/pages/login/index' })
    },
    async initialGetBanner() {
      try {
        const d = await u_bannerlist20({ terminalId: 0 });
		console.log(d)
        if (d?.content) this.g_banner_image = d.content
      } catch (e) {}
    },
    initLoginStatus() {
      uni.getStorage({
        key: 'userKey',
        success: res => { this.account = res?.data?.companyName || res?.data?.username }
      });
    },
    async initQrCode() {
      try {
        const res = await u_getQrcodeImg({})
        if (res.statusCode === 200) this.personal_qr_code = res.content.img
      } catch (e) {}
    },
    async initBottomDirectory() {
      try {
        const res = await u_navlist20({})
        if (res.code === 1000) this.tabList = res.content
      } catch (e) {}
    },
    async initZoneInfo() {
      try {
        const ReturnData = await u_getHomeArea({});
		  console.log(ReturnData)
        if (ReturnData.code === 1000) {
          this.zoneList = ReturnData.content;
		  console.log(ReturnData)
          this.groupZoneByXu()
        }
      } catch (e) {}
    },
    groupZoneByXu() {
      const map = {}
      this.zoneList.forEach(item => {
        const k = item.serial_number || 1
        if (!map[k]) map[k] = []
        map[k].push(item)
      })
      this.groupedZoneList = Object.keys(map).sort((a, b) => a - b).map(k => ({
        serial_number: +k,
        list: map[k]
      }))
    },
    async initBookList() {
      try {
        const res = await u_booklist({})
        if (res.code === 1000) this.fullBannerList = res.content
      } catch (e) {}
    },
    LoadOnUseGuideImageLoad(e) {
      try {
        const { width, height } = e.detail
        if (!width || !height) return
        const { windowWidth } = uni.getSystemInfoSync()
        const h = height / width * windowWidth
        const f = e.currentTarget.dataset.flag
        if (f === 'use') this.s_use_height = h
        if (f === 'banner') this.s_banner_height = h
      } catch (e) {}
    },
    handlePlayVideo(e) {
      const { url, title } = e.currentTarget.dataset
      if (url) uni.navigateTo({ url: `/pages/watchVideos/index?url=${encodeURI(url)}&title=${title || '使用指南'}` })
    },
    async inIsShowInfo() {
      try {
        const res = await u_isShowInfo({})
        if (res.code === 1000) this.isShowInfo = res.content
      } catch (e) {}
    },
    handleQRClose() { this.join_the_group_modal = false },
    handleQRShowImageMask() {
      uni.previewMedia({ sources: [{ url: this.personal_qr_code, type: 'image' }] })
    },
    handleSwitchTabNavigation(e) {
      const idx = e.currentTarget.dataset.index
      const url = this.tabList[idx]?.pagePath
      if (url) uni.redirectTo({ url: `/${url}` })
    },
    handleBackHome() { uni.redirectTo({ url: '/pages/index/index' }) },
    handleGetMenuList(e) {
      const path = e.currentTarget.dataset.info?.path
      if (/desk/.test(path)) {
        uni.switchTab({ url: path })
      } else {
        uni.navigateTo({ url: `${path}` })
      }
    },
  },
  onLoad(options) {
    // ✅ 关键：onLoad 最先执行
    this.initSystemInfo()
    
    this.initialGetBanner()
    this.initBottomDirectory()
    this.initZoneInfo()
    this.initBookList()

    this.title_name = options?.name
    this.bgcolor = options?.bgcolor||'#FAF6E9'
    this.subtitle = options?.subtitle
    this.stfontSize = options?.stfontSize
  },
  onShow() {
    this.inIsShowInfo()
  },
  onReady() {
    this.initLoginStatus()
    this.initQrCode()
  }
}
</script>

<style scoped>
  ::-webkit-scrollbar { display: none; }
  .container {
    width: 100vw;
    min-height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
  }
  .custom-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background: transparent;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .custom-header-outer-layer {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 20rpx;
  }
  .custom-header-outer-layer-image {
    width: 46rpx;
    height: 46rpx;
  }
  .custom-header-outer-layer-title {
    flex: 1;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  .custom-header-outer-layer-user_name {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  .login-wrapper {
    display: flex;
    align-items: center;
    gap: 6rpx;
  }
  .custom-header-outer-layer-user_name text {
    font-size: 28rpx;
    color: #333;
  }
  .custom-header-outer-layer-user_name image {
    width: 26rpx;
    height: 26rpx;
  }
  .subtitle {
    margin-top: 6rpx;
    color: #666;
    width: 100%;
  }
  .content {
    position: fixed;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 20rpx;
  }
  .swiper-container {
    width: 100%;
    margin-top: 20rpx;
  }
  .banner-img {
    width: 100%;
    border-radius: 24rpx;
  }
  .notice {
    width: 100%;
    background: #EFF1FC;
    border-radius: 24rpx;
    padding: 24rpx 30rpx;
    box-sizing: border-box;
    margin: 24rpx 0;
  }
  .notice-content {
    font-size: 24rpx;
    color: #333;
    line-height: 1.6;
  }
  .special-zone-container {
    width: 100%;
  }
  .special-zone {
    display: flex;
    gap: 16rpx;
    margin-bottom: 20rpx;
  }
  .zone-item {
    flex: 1;
  }
  .zone-out {
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 32rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    border: 1rpx solid #f0f0f0;
  }
  .zone-img {
    width: 50rpx;
    height: 50rpx;
  }
  .zone-name {
    font-size: 24rpx;
    font-weight: bold;
    color: #333;
  }
  .zone-desc {
    font-size: 20rpx;
    color: #666;
  }
  .full-width-swiper {
    width: 100%;
    margin-top: 20rpx;
  }
  .full-width-use {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 20rpx;
  }
  .full-width-use image {
    width: 12rpx;
    height: 32rpx;
    border-radius: 6rpx;
  }
  .full-width-use text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  .full-banner-img {
    width: 100%;
    border-radius: 24rpx;
  }
  .tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 99;
  }
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
  }
  .tab-icon {
    width: 46rpx;
    height: 46rpx;
  }
  .tab-item text {
    font-size: 22rpx;
    color: #999;
  }
  .tab-item.active text {
    color: #3498db;
  }
  .float-button {
    position: fixed;
    right: 24rpx;
    bottom: 160rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    z-index: 999;
  }
  .float-button image {
    width: 88rpx;
    height: 88rpx;
  }
  .hidden-contact-btn {
    position: absolute;
    width: 100%;
    height: 50%;
    opacity: 0;
  }
  .qr-group-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr-group-close {
    position: absolute;
    top: 12vh;
    right: 40rpx;
    color: #fff;
    font-size: 60rpx;
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
  }
  .qr-group-preview-img {
    width: 70vw;
    border-radius: 16rpx;
  }
  .qr-group-preview-desc {
    color: #fff;
    font-size: 26rpx;
    text-align: center;
    margin-top: 30rpx;
  }
</style>