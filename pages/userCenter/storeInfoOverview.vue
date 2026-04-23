<template>
  <!-- 背景图换成纯色背景 -->
  <view class="container">
    <custom-header title="无人门店信息" />

    <!-- 主容器：flex 垂直布局 -->
    <view class="record-container">
      <!-- tab 固定高度 -->
      <view class="record-tabs">
        <view class="record-tabs-item" :class="c_activeTab == 1 ? 'active' : ''" @tap="c_activeTab = 1">
          门店列表
        </view>
        <view class="record-tabs-item" :class="c_activeTab == 2 ? 'active' : ''" @tap="c_activeTab = 2">
          {{ btnState }}门店
        </view>
      </view>

      <!-- 滚动区域：自动占满剩余高度（核心修复） -->
      <view class="scroll-wrapper">
        <!-- 列表 -->
        <scroll-view v-if="c_activeTab == 1" scroll-y @scrolltolower="handleLower">
          <view v-for="item in g_items" :key="item.id" class="content-item">
            <view class="content-item-head">
              <view class="head-left">
                <view class="left-category">
                  <text>{{ item.name }}</text>
                </view>
                <view class="left-split_line"></view>
                <view class="left-model">{{ item.rentcompany || '-' }}</view>
              </view>
              <view class="head-right" v-if="!g_flagMulti">
                <image src="/static/images/_edit.png" :data-item="item" @tap="handleEdit" />
                <image src="/static/images/_delete.png" :data-item="item" @tap="handleDelete" />
              </view>
            </view>

            <view class="content-item-info">
              <view class="info-item" :class="item.jobpersonname?.length > 15 ? 'long-info-item' : ''">
                <label>负责人 ：</label>
                <text>{{ item.jobpersonname || '-' }}</text>
              </view>
              <view class="info-item" :class="item.rentprice?.length > 15 ? 'long-info-item' : ''">
                <label>租赁价格 ：</label>
                <text>{{ item.rentprice || '-' }}</text>
              </view>
              <view class="info-item" :class="item.internalperformance?.length > 15 ? 'long-info-item' : ''">
                <label>内部绩效 ：</label>
                <text>{{ item.internalperformance || '' }}</text>
              </view>
              <view class="info-item" :class="item.parkingstallscount?.length > 15 ? 'long-info-item' : ''">
                <label>车位数量 ：</label>
                <text>{{ item.parkingstallscount || '' }}</text>
              </view>
              <view class="info-item" :class="item.signdate?.length > 15 ? 'long-info-item' : ''">
                <label>签约时间 ：</label>
                <text>{{ item.signdate || '-' }}</text>
              </view>
              <view class="info-item" :class="item.rentstartdate?.length > 15 ? 'long-info-item' : ''">
                <label>租赁开始日期 ：</label>
                <text>{{ item.rentstartdate || '' }}</text>
              </view>
              <view class="info-item" :class="item.rentenddate?.length > 15 ? 'long-info-item' : ''">
                <label>租赁结束日期 ：</label>
                <text>{{ item.rentenddate || '' }}</text>
              </view>
              <view class="info-item" :class="item.address?.length > 15 ? 'long-info-item' : ''">
                <label>地址 ：</label>
                <text>{{ item.address || '' }}</text>
              </view>
            </view>

            <view class="content-item-footer" v-if="g_source">
              <view class="footer-left"></view>
              <view class="footer-right">
                <view class="footer-right-btn" :data-item="item" @tap="handleSelectJump" v-if="!g_flagMulti">
                  <text>选择此车</text>
                </view>
                <view v-else>
                  <checkbox-group :data-item="item" @change="handleChangeBlack">
                    <checkbox style="transform: scale(0.7);" />
                  </checkbox-group>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 表单 -->
        <scroll-view v-else scroll-y>
          <view class="card-info">
            <view class="card-info-item">
              <label>无人门店名称<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入无人门店名称" v-model="params.name" />
              </view>
            </view>
            <view class="card-info-item">
              <label>地址<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入地址" v-model="params.address" />
              </view>
            </view>
            <view class="card-info-item">
              <label>租赁公司<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入租赁公司名称" v-model="params.rentcompany" />
              </view>
            </view>
            <view class="card-info-item">
              <label>租赁价格<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入租赁价格" v-model="params.rentprice" />
              </view>
            </view>
            <view class="card-info-item">
              <label>租赁开始日期<text>*</text></label>
              <view class="card-info-item-input">
                <picker mode="date" @change="handleOnDateChange2">
                  <view class="picker">{{ rentstartdate || '请选择租赁开始日期' }}</view>
                </picker>
              </view>
            </view>
            <view class="card-info-item">
              <label>租赁结束日期<text>*</text></label>
              <view class="card-info-item-input">
                <picker mode="date" @change="handleOnDateChange1">
                  <view class="picker">{{ rentenddate || '请选择租赁结束日期' }}</view>
                </picker>
              </view>
            </view>
            <view class="card-info-item">
              <label>负责人姓名<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入负责人姓名" v-model="params.jobpersonname" />
              </view>
            </view>
            <view class="card-info-item">
              <label>签约时间<text>*</text></label>
              <view class="card-info-item-input">
                <picker mode="date" @change="handleOnDateChange3">
                  <view class="picker">{{ signdate || '请选择签约日期' }}</view>
                </picker>
              </view>
            </view>
            <view class="card-info-item">
              <label>内部绩效<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入内部绩效" v-model="params.internalperformance" />
              </view>
            </view>
            <view class="card-info-item">
              <label>车位数量<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入车位数量" v-model="params.parkingstallscount" />
              </view>
            </view>
          </view>
          <view class="card-footer">
            <view @tap="handleSubmit">确认{{ btnState }}</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view class="levitation-button" v-if="c_activeTab==1&&g_flagMulti&&g_black.length>0" @tap="handleJumpBlackInfo">
      <text>确定</text>
    </view>
  </view>
</template>

<script>
import { u_houseFlowList, u_houseFlowApirAdd, u_unmannedStoreApidel } from '@/api/index'

export default {
  data() {
    return {
      c_screen_height: 0,
      c_screen_width: 0,
      statusBarHeight: 0,
      navBarHeight: 44,
      searchBarHeight: 80,
      totalNavHeight: 44,
      g_page: 1,
      g_items: [],
      g_triggered: false,
      c_activeTab: 1,
      params: {},
      btnState: '新增',
      id: '',
      batterylift: '一键启动',
      carOwnerNameValue: '',
      carOwnerName: '智信通',
      brakingType: 1,
      g_black: [],
      g_platenumbers: [],
      rentenddate: '',
      rentstartdate: '',
      signdate: '',
      g_source: '',
      g_flagMulti: false,
      info: null,
      allParams: '',
      type: '',
      name: ''
    }
  },
  onLoad(options) {
    this.initCarryParams(options);
    this.initList();
  },
  methods: {
    handleChangeBlack(evt) {
      const id = evt.currentTarget.dataset.item.id;
      const blackSet = new Set(this.g_black);
      const plateSet = new Set(this.g_platenumbers);
      const vehicle = this.g_items.find(item => item.id === id);
      if (!vehicle) return;
      if (blackSet.has(id)) {
        blackSet.delete(id);
        plateSet.delete(vehicle.platenumber);
      } else {
        blackSet.add(id);
        plateSet.add(vehicle.platenumber);
      }
      this.g_black = [...blackSet];
      this.g_platenumbers = [...plateSet];
    },
    handleJumpBlackInfo() {
      uni.reLaunch({
        url: `${this.g_source}?black=${this.g_black}&type=${this.type}&name=${this.name}&platenumbers=${this.g_platenumbers}&info=${JSON.stringify(this.info)}`
      });
    },
    scanCode() {
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          this.handleScanResult(res.result);
        }
      });
    },
    handleScanResult(result) {
      this.params = { ...this.params, sn: result };
    },
    initCarryParams(evt) {
      const { source, flagMulti, info, allParams, type, name } = evt;
      this.g_source = source;
      this.g_flagMulti = flagMulti;
      this.info = info && JSON.parse(info);
      this.allParams = allParams;
      this.type = type;
      this.name = name;
    },
    handleSelectJump(evt) {
      const item = evt.currentTarget.dataset.item;
      let url = '';
      if (this.allParams) {
        url = `${this.g_source}?datails=${JSON.stringify(item)}&allParams=${this.allParams}&type=${this.type}`;
      } else {
        url = `${this.g_source}?datails=${JSON.stringify(item)}`;
      }
      uni.redirectTo({ url });
    },
    async initList() {
      try {
        const res = await u_houseFlowList({ page: this.g_page });
        if (res.code === 1000) {
          let list = res.content || [];
          if (this.g_page > 1 && list.length === 0) {
            uni.showToast({ title: `已加载全部数据：共${this.g_items.length}条`, icon: 'none' });
          }
          this.g_items = this.g_items.concat(list);
        }
      } catch (e) {
        console.log("列表加载失败", e);
      }
    },
    handleLower() {
      this.g_page++;
      this.initList();
    },
    handleRefresh() {
      this.g_triggered = false;
      this.g_page = 1;
      this.g_items = [];
      this.initList();
    },
    handleOnDateChange1(e) { this.rentenddate = e.detail.value; },
    handleOnDateChange2(e) { this.rentstartdate = e.detail.value; },
    handleOnDateChange3(e) { this.signdate = e.detail.value; },
    async handleSubmit() {
      const param = {
        ...this.params,
        rentenddate: this.rentenddate,
        rentstartdate: this.rentstartdate,
        signdate: this.signdate,
        id: this.id || ''
      };
      try {
        const res = await u_houseFlowApirAdd(param);
        if (res.code === 1000) {
          this.c_activeTab = 1;
          this.btnState = '新增';
          this.id = '';
          this.params = {};
          this.rentenddate = '';
          this.rentstartdate = '';
          this.signdate = '';
          this.g_page = 1;
          this.g_items = [];
          this.initList();
        }
      } catch (e) {}
    },
    handleEdit(evt) {
      const info = evt.currentTarget.dataset.item;
      const { createdate, ...newObj } = info;
      this.c_activeTab = 2;
      this.btnState = '修改';
      this.id = info.id;
      this.params = { ...newObj };
      this.rentenddate = info.rentenddate;
      this.rentstartdate = info.rentstartdate;
      this.signdate = info.signdate;
    },
    async handleDelete(evt) {
      const id = evt.currentTarget.dataset.item.id;
      try {
        const res = await u_unmannedStoreApidel({ id });
        if (res.code === 1000) {
          this.g_items = [];
          this.g_page = 1;
          this.initList();
        }
      } catch (e) {}
    }
  }
}
</script>

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
}

/* 页面容器 */
.container {
  width: 100%;
  height: 100vh;
  background-color: #EFF1FC;
  display: flex;
  flex-direction: column;
}

/* 主体卡片：flex 垂直布局 */
.record-container {
  flex: 1;
  width: 96%;
  margin: 10rpx auto;
  border-radius: 12rpx;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* tab 高度固定 */
.record-tabs {
  display: flex;
  height: 50px;
  flex-shrink: 0;
}

.record-tabs-item {
  border-radius: 12rpx;
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: PingFang SC;
  font-weight: bold;
  font-size: 28rpx;
  color: #010101;
}

.record-tabs-item.active {
  background: linear-gradient(88deg, #1576dc, #1b64b1);
  color: #fff;
}

/* 滚动容器：自动占满剩余高度 */
.scroll-wrapper {
  flex: 1;
  overflow: hidden;
}

scroll-view {
  height: 100%;
}

/* 以下为原有样式 */
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
  font-family: PingFang SC;
  font-weight: bold;
  font-size: 26rpx;
  color: #333333;
  gap: 10rpx;
}

.left-split_line {
  width: 1rpx;
  height: 28rpx;
  border-left: 1px solid #797979;
}

.left-model {
  font-family: PingFang SC;
  font-weight: 500;
  font-size: 24rpx;
  color: #333333;
}

.head-right {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  align-items: center;
  justify-content: center;
}

.head-right image {
  width: 30rpx;
  height: 30rpx;
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
  box-sizing: border-box;
  word-wrap: break-word;
  font-family: PingFang SC;
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
  font-family: PingFang SC;
  font-weight: bold;
  font-size: 22rpx;
  color: #ffffff;
  background-color: #1b64b1;
  border-radius: 8rpx;
  padding: 4rpx 15rpx;
}

.levitation-button {
  position: absolute;
  bottom: 50rpx;
  width: 100%;
  display: flex;
  justify-content: center;
}

.levitation-button text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 75rpx;
  width: 40%;
  background: linear-gradient(88deg, #1576dc, #1b64b1);
  border-radius: 36rpx;
  font-family: PingFang SC;
  font-weight: bold;
  font-size: 32rpx;
  color: #ffffff;
}

.card-info {
  flex: 1;
  overflow-y: auto;
}

.card-info-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 20rpx;
}

.card-info-item label {
  font-family: PingFang SC;
  font-weight: 500;
  font-size: 26rpx;
  color: #333333;
  display: flex;
  gap: 6rpx;
  align-items: flex-start;
}

.card-info-item label text {
  color: red;
}

.picker {
  font-family: PingFang SC;
  font-weight: 500;
  font-size: 26rpx;
  color: #333333;
  display: flex;
  align-items: center;
}

.card-info input {
  text-align: right;
  font-family: PingFang SC;
  font-weight: 500;
  font-size: 26rpx;
  color: #333333;
}

.card-footer {
  height: 50px;
  color: white;
  text-align: center;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: PingFang SC;
  font-weight: bold;
  font-size: 34rpx;
  color: #FFFFFF;
  padding: 20rpx 0;
}

.card-footer view {
  width: 40%;
  background: linear-gradient(88deg, #1576DC, #1B64B1);
  border-radius: 36rpx;
  padding: 10rpx;
}
</style>