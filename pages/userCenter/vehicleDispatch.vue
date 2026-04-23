<template>
  <view class="container">
    <custom-header title="车辆调度" />

    <view class="record-container">
      <!-- 切换部分 -->
      <view class="record-tabs">
        <view class="record-tabs-item" :class="c_activeTab == 1 ? 'active' : ''" @click="() => c_activeTab = 1">
          车辆调度列表
        </view>
        <view class="record-tabs-item" :class="c_activeTab == 2 ? 'active' : ''" @click="() => c_activeTab = 2">
          {{ btnState }}调度
        </view>
      </view>

      <!-- 列表 -->
      <view class="scroll-wrapper" v-if="c_activeTab === 1">
        <scroll-view scroll-y @scrolltolower="handleLower">
          <view class="content-item" v-for="item in g_items" :key="item.id">
            <view class="content-item-head">
              <view class="head-left">
                <view class="left-category">
                  <text>{{ item.plateNumber }}</text>
                </view>
                <view class="left-split_line"></view>
                <view class="left-model">
                  {{ item.carSerial || '-' }} {{ item.carModle || '-' }}
                </view>
              </view>
              <view class="head-right">
                <text class="btn-text blue" @click="handleEdit(item)">编辑</text>
                <text class="btn-text red" @click="handleDelete(item)">删除</text>
              </view>
            </view>

            <view class="content-item-info">
              <view class="info-item" :class="item.storeName?.length > 15 ? 'long-info-item' : ''">
                <label>无人门店名称：</label>
                <text>{{ item.storeName || '-' }}</text>
              </view>
              <view class="info-item" :class="item.dispatcher?.length > 15 ? 'long-info-item' : ''">
                <label>调度人：</label>
                <text>{{ item.dispatcher || '-' }}</text>
              </view>
              <view class="info-item" :class="item.startdate?.length > 15 ? 'long-info-item' : ''">
                <label>开始时间：</label>
                <text>{{ item.startdate || '' }}</text>
              </view>
              <view class="info-item" :class="item.enddate?.length > 15 ? 'long-info-item' : ''">
                <label>结束时间：</label>
                <text>{{ item.enddate || '' }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 新增/修改 -->
      <view class="scroll-wrapper" v-else>
        <scroll-view scroll-y>
          <view class="card-info">
            <view class="card-info-item">
              <label>车牌号<text>*</text></label>
              <view class="card-info-item-input">
                <picker mode="selector" :range="pickerOptions" range-key="label" @change="handleClOnPickerChange">
                  <input :value="params.plateNumber||params.platenumber?params.plateNumber||params.platenumber:'请选择车牌号'" disabled />
                </picker>
              </view>
            </view>

            <view class="card-info-item" v-if="params.plateNumber||params.platenumber">
              <label>车系<text>*</text></label>
              <view class="card-info-item-input">
                <input :value="params.vehicleSerialName||params.carSerial" disabled />
              </view>
            </view>
            <view class="card-info-item" v-if="params.plateNumber||params.platenumber">
              <label>车型<text>*</text></label>
              <view class="card-info-item-input">
                <input disabled :value="params.vehicleModeName||params.carModle" />
              </view>
            </view>

            <view class="card-info-item">
              <label>无人门店<text>*</text></label>
              <view class="card-info-item-input">
                <picker mode="selector" :range="md_pickerOptions" range-key="label" @change="handleMdOnPickerChange">
                  <input disabled :value="params.storeName?params.storeName:'请选择门店'" />
                </picker>
              </view>
            </view>

            <view class="card-info-item">
              <label>开始时间<text>*</text></label>
              <view class="card-info-item-input">
                <picker mode="date" @change="handleOnDateChange2">
                  <view class="picker">{{ startdate || '请选择开始日期' }}</view>
                </picker>
              </view>
            </view>
            <view class="card-info-item" v-if="startdate">
              <label></label>
              <view class="card-info-item-input">
                <picker mode="time" @change="handleOnTimeChange2">
                  <view class="picker">{{ starttime || '请选择开始时间' }}</view>
                </picker>
              </view>
            </view>

            <view class="card-info-item">
              <label>结束时间<text>*</text></label>
              <view class="card-info-item-input">
                <picker mode="date" @change="handleOnDateChange1">
                  <view class="picker">{{ enddate || '请选择结束日期' }}</view>
                </picker>
              </view>
            </view>
            <view class="card-info-item" v-if="enddate">
              <label></label>
              <view class="card-info-item-input">
                <picker mode="time" @change="handleOnTimeChange1">
                  <view class="picker">{{ endtime || '请选择结束时间' }}</view>
                </picker>
              </view>
            </view>

            <view class="card-info-item">
              <label>调度人姓名<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入调度人姓名" v-model="params.dispatcher" />
              </view>
            </view>
          </view>

          <view class="card-footer">
            <view @click="handleSubmit">确认{{ btnState }}</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  u_carStoreList,
  u_carStoreApiaddOrUpdate,
  u_carStoreApidel,
  u_carList,
  u_houseFlowList
} from '@/api/index.js'

export default {
  data() {
    return {
      g_page: 1,
      g_items: [],
      c_activeTab: 1,
      params: {},
      btnState: '新增',
      id: '',

      startdate: '',
      starttime: '',
      enddate: '',
      endtime: '',

      pickerOptions: [],
      md_pickerOptions: []
    }
  },
  onLoad(options) {
    this.initList()
  },
  onShow() {
    this.handleSeach()
  },
  methods: {
    // 列表加载
    async initList() {
      try {
        const res = await u_carStoreList({
          page: this.g_page
        })
        if (res.code === 1000) {
          const list = res.content || []
          this.g_items = this.g_items.concat(list)
        }
      } catch (e) {}
    },

    // 加载更多
    handleLower() {
      this.g_page++
      this.initList()
    },

    // 时间选择
    handleOnDateChange1(e) {
      this.enddate = e.detail.value
    },
    handleOnTimeChange1(e) {
      this.endtime = e.detail.value
    },
    handleOnDateChange2(e) {
      this.startdate = e.detail.value
    },
    handleOnTimeChange2(e) {
      this.starttime = e.detail.value
    },

    // 提交
    async handleSubmit() {
      const param = {
        ...this.params,
        startdate: `${this.startdate} ${this.starttime}`,
        enddate: `${this.enddate} ${this.endtime}`,
        id: this.id || ''
      }
      try {
        const res = await u_carStoreApiaddOrUpdate(param)
        if (res.code === 1000) {
          this.c_activeTab = 1
          this.params = {}
          this.btnState = '新增'
          this.id = ''
          this.startdate = ''
          this.starttime = ''
          this.enddate = ''
          this.endtime = ''
          this.g_page = 1
          this.g_items = []
          this.initList()
        }
      } catch (e) {}
    },

    // 编辑
    handleEdit(item) {
      const { createdate, ...newObj } = item
      const [startdate, starttime] = (item.startdate || '').split(' ')
      const [enddate, endtime] = (item.enddate || '').split(' ')

      this.c_activeTab = 2
      this.btnState = '修改'
      this.id = item.id
      this.params = { ...newObj }
      this.startdate = startdate || ''
      this.starttime = starttime || ''
      this.enddate = enddate || ''
      this.endtime = endtime || ''
    },

    // 删除
    async handleDelete(item) {
      try {
        const res = await u_carStoreApidel({ id: item.id })
        if (res.code === 1000) {
          this.g_items = []
          this.g_page = 1
          this.initList()
        }
      } catch (e) {}
    },

    // 获取车辆/门店数据
    async handleSeach() {
      try {
        const res = await u_carList({})
        if (res.code === 1000) {
          this.pickerOptions = (res.content || []).map(item => ({
            ...item,
            label: `${item.platenumber || ''} - ${item.vehicleSerialName || ''} - ${item.vehicleModeName || ''}`
          }))
        }
      } catch (e) {}

      try {
        const res = await u_houseFlowList({})
        if (res.code === 1000) {
          this.md_pickerOptions = (res.content || []).map(item => ({
            ...item,
            label: item.name || ''
          }))
        }
      } catch (e) {}
    },

    // 车辆选择
    handleClOnPickerChange(evt) {
      const info = this.pickerOptions[evt.detail.value]
      if (!info) return
      this.params = {
        ...this.params,
        vehid: info.id,
        vehicleSerialName: info.vehicleSerialName,
        vehicleModeName: info.vehicleModeName,
        platenumber: info.platenumber
      }
    },

    // 门店选择
    handleMdOnPickerChange(evt) {
      const info = this.md_pickerOptions[evt.detail.value]
      if (!info) return
      this.params = {
        ...this.params,
        storeid: info.id,
        storeName: info.name
      }
    }
  }
}
</script>

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.container {
  width: 100%;
  height: 100vh;
  background-color: #EFF1FC;
  display: flex;
  flex-direction: column;
}

.record-container {
  flex: 1;
  width: 96%;
  margin: 10rpx auto;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.record-tabs {
  display: flex;
  height: 50px;
  flex-shrink: 0;
}

.record-tabs-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #000;
}

.record-tabs-item.active {
  background: linear-gradient(88deg, #1576dc, #1b64b1);
  color: #fff;
  border-radius: 12rpx;
}

.scroll-wrapper {
  flex: 1;
  overflow: hidden;
}

scroll-view {
  height: 100%;
}

.content-item {
  margin: 15rpx;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.content-item-head {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 20rpx 15rpx;
  align-items: center;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.left-category {
  font-weight: bold;
  font-size: 26rpx;
  color: #333;
}

.left-split_line {
  width: 1rpx;
  height: 28rpx;
  background: #797979;
}

.left-model {
  font-size: 24rpx;
  color: #333;
}

.head-right {
  display: flex;
  gap: 20rpx;
}

.btn-text {
  font-size: 26rpx;
}

.btn-text.blue {
  color: #1576dc;
}

.btn-text.red {
  color: #f56c6c;
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

.card-info {
  padding-bottom: 20rpx;
}

.card-info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.card-info-item label {
  font-size: 26rpx;
  color: #333;
}

.card-info-item label text {
  color: red;
}

.picker {
  font-size: 26rpx;
  color: #333;
}

.card-info input {
  text-align: right;
  font-size: 26rpx;
  color: #333;
}

.card-footer {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}

.card-footer view {
  width: 40%;
  padding: 10rpx;
  background: linear-gradient(88deg, #1576dc, #1b64b1);
  border-radius: 36rpx;
  color: #fff;
  text-align: center;
  font-size: 34rpx;
}
</style>