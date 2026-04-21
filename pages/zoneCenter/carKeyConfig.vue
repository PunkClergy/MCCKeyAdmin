<template>
  <view class="container">
    <view class="record-container">
      <view class="record-tabs">
        <view class="record-tabs-item" :class="{ active: c_activeTab == 1 }" @tap="switchToList">
          车辆列表
        </view>
        <view class="record-tabs-item" :class="{ active: c_activeTab == 2 }" @tap="switchToForm">
          {{ btnState }}车辆
        </view>
      </view>

      <block v-if="c_activeTab == 1">
        <view class="record-tabs-1">
          <view class="search-box">
            <icon type="search" size="16" class="search-icon" />
            <input placeholder="车牌号/设备号/车型/车系" class="search-input" @blur="bindblurSea" />
          </view>
        </view>

        <view class="tabs-1-conut">
          <view></view>
          <view>共有{{ g_total }}条记录</view>
          <view class="select-all" v-if="g_flagMulti">
            <text>全选</text>
            <checkbox style="transform: scale(0.9);" @tap="handleAllC" :checked="all_c" />
          </view>
        </view>

        <scroll-view scroll-y class="list-scroll">
          <view class="content-item" v-for="(item, index) in g_items" :key="index">
            <view class="content-item-head">
              <view class="head-left">
                <view class="left-category">
                  <text>{{ item.platenumber }}</text>
                </view>
                <view class="left-split_line"></view>
                <view class="left-model">{{ item.vehicleSerialName || '-' }}{{ item.vehicleModeName || '' }}</view>
              </view>
              <view class="head-right" v-if="!g_flagMulti">
                <view class="btn-icon" :data-item="item" @tap="handleEdit">编辑</view>
                <view class="btn-icon" :data-item="item" @tap="handleDelete">删除</view>
              </view>
              <view v-else>
                <checkbox-group :data-item="item" @change="handleChangeBlack">
                  <checkbox style="transform: scale(1);" :checked="item.checked" />
                </checkbox-group>
              </view>
            </view>
            <view class="content-item-info">
              <view class="info-item" :class="item.sn && item.sn.length > 15 ? 'long-info-item' : ''">
                <label>设备号：</label>
                <text>{{ item.sn || '-' }}</text>
              </view>
              <view class="info-item long-info-item">
                <label>生效周期：</label>
                <text>{{ item.startDate || '' }}-{{ item.endDate || '' }}</text>
              </view>
            </view>
            <view class="content-item-footer" v-if="g_source">
              <view class="footer-right">
                <view class="footer-right-btn" :data-item="item" @tap="handleSelectJump" v-if="!g_flagMulti">
                  <text>选择此车</text>
                </view>
              </view>
            </view>
          </view>
          <view class="empty" v-if="g_items.length === 0">暂无数据</view>
        </scroll-view>
      </block>

      <block v-else>
        <scroll-view scroll-y class="form-scroll">
          <view class="card-info">
            <view class="card-info-item">
              <label>车牌号<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入车牌号" v-model="params.platenumber" data-item="platenumber" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>设备号(sn)<text>*</text></label>
              <view class="card-info-item-input">
                <text v-if="id !== ''">{{ params.sn || '空' }}</text>
                <input v-else placeholder="请输入设备号" v-model="params.paramsn" data-item="sn" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>code<text>*</text></label>
              <view class="card-info-item-input">
                <text v-if="id !== ''">{{ params.code || '空' }}</text>
                <input v-else placeholder="请输入code" v-model="params.code" data-item="code" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>车系</label>
              <view class="card-info-item-input">
                <input placeholder="请输入车系" v-model="params.vehicleSerialName" data-item="vehicleSerialName" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>车型</label>
              <view class="card-info-item-input">
                <input placeholder="请输入车型" v-model="params.vehicleModeName" data-item="vehicleModeName" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>年款</label>
              <view class="card-info-item-input">
                <input placeholder="请输入年款" v-model="params.ccdate" data-item="ccdate" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>当前总里程(km)</label>
              <view class="card-info-item-input">
                <input placeholder="请输入车辆当前里程" v-model="params.totalMileage" data-item="totalMileage" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>已保养里程(km)</label>
              <view class="card-info-item-input">
                <input placeholder="请输入已保养里程" v-model="params.maintainMileage" data-item="maintainMileage" @input="handleBindinput" />
              </view>
            </view>

            <view class="card-info-item">
              <label>保养周期里程(km)</label>
              <view class="card-info-item-input">
                <input placeholder="请输入车辆保养周期里程" v-model="params.maintainMileageInterval" data-item="maintainMileageInterval" @input="handleBindinput" />
              </view>
            </view>
          </view>

          <view class="card-footer">
            <view @tap="handleSubmit">确认{{ btnState }}</view>
          </view>
        </scroll-view>
      </block>
    </view>

    <view class="levitation-button" v-if="c_activeTab == 1 && g_flagMulti && g_black.length > 0" @tap="handleJumpBlackInfo">
      <text>确定</text>
    </view>
  </view>
</template>

<script>
import {
  u_carList,
  u_addOrUpdateCar,
  u_carapiDeleteCar
} from '@/api/index'

export default {
  data() {
    return {
      c_activeTab: 1,
      g_page: 1,
      g_items: [],
      params: {},
      btnState: '新增',
      id: '',
      batterylift: '一键启动',
      carOwnerName: '智信通',
      brakingType: 1,
      all_c: false,
      g_source: '',
      g_flagMulti: false,
      info: null,
      allParams: '',
      type: '',
      name: '',
      desc: '',
      comParam: '',
      g_total: '0',
      g_black: [],
      g_platenumbers: []
    }
  },
  onLoad(options) {
    this.initCarryParams(options)
    this.initList()
  },
  methods: {
    // 切换到列表 → 清空表单、重置为新增
    switchToList() {
      this.c_activeTab = 1
      this.clearForm()
    },
    // 切换到表单 → 清空表单、设置为新增
    switchToForm() {
      this.c_activeTab = 2
      this.clearForm()
    },
    // 清空表单方法（核心修复）
    clearForm() {
      this.btnState = '新增'
      this.id = ''
      this.params = {
        platenumber: '',
        sn: '',
        code: '',
        vehicleSerialName: '',
        vehicleModeName: '',
        ccdate: '',
        totalMileage: '',
        maintainMileage: '',
        maintainMileageInterval: ''
      }
    },
    bindblurSea(evt) {
      this.comParam = evt.detail.value
      this.g_page = 1
      this.g_items = []
      this.initList()
    },
    async handleDelete(evt) {
      const info = evt.currentTarget.dataset.item
      uni.showModal({
        title: '提示',
        content: '确认删除？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await u_carapiDeleteCar({ sn: info?.sn, code: info?.code })
              if (result.code === 1000) {
                uni.showToast({ title: result.msg })
                this.c_activeTab = 1
                this.g_page = 1
                this.g_items = []
                this.initList()
              }
            } catch (e) {}
          }
        }
      })
    },
    handleChangeBlack(evt) {
      const targetItem = evt.currentTarget.dataset.item || {}
      const { id } = targetItem
      if (!id) return
      const idx = this.g_items.findIndex(i => i.id === id)
      if (idx === -1) return
      const list = [...this.g_items]
      list[idx].checked = !list[idx].checked
      this.all_c = list.every(i => i.checked)
      const checked = list.filter(i => i.checked)
      this.g_items = list
      this.g_black = checked.map(i => i.id).filter(Boolean)
      this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
    },
    handleAllC() {
      if (this.g_items.length === 0) return uni.showToast({ title: '暂无数据', icon: 'none' })
      const target = !this.all_c
      const newItems = this.g_items.map(i => ({ ...i, checked: target }))
      const checked = newItems.filter(i => i.checked)
      this.g_items = newItems
      this.all_c = target
      this.g_black = checked.map(i => i.id).filter(Boolean)
      this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
    },
    handleJumpBlackInfo() {
      uni.reLaunch({
        url: `${this.g_source}?black=${this.g_black}&type=${this.type}&name=${this.name}&platenumbers=${this.g_platenumbers}&info=${JSON.stringify(this.info)}`
      })
    },
    scanCode() {
      uni.scanCode({
        success: (res) => { this.params.sn = res.result }
      })
    },
    initCarryParams(evt) {
      const { source, flagMulti, info, allParams, type, name, desc } = evt
      this.g_source = source
      this.g_flagMulti = flagMulti
      this.info = info ? JSON.parse(info) : null
      this.allParams = allParams
      this.type = type
      this.name = name
      this.desc = desc
    },
    handleSelectJump(evt) {
      const { item } = evt.currentTarget.dataset
      const url = this.allParams
        ? `${this.g_source}?datails=${JSON.stringify(item)}&allParams=${this.allParams}&type=${this.type}`
        : `${this.g_source}?datails=${JSON.stringify(item)}`
      uni.redirectTo({ url })
    },
    async initList() {
      try {
        const param = { page: this.g_page, pageSize: 1000, comParam: this.comParam || '' }
        const res = await u_carList(param)
        if (res.code === 1000) {
          this.g_items = this.g_items.concat(res.content || [])
          this.g_total = Number(res.count || 0).toLocaleString()
          const vehList = this.desc ? JSON.parse(this.desc).vehList : []
          const snSet = new Set(vehList.map(i => i.sn))
          this.g_items = this.g_items.map(item => ({ ...item, checked: !!snSet.has(item.sn) }))
          this.all_c = this.g_items.every(i => i.checked)
          const checked = this.g_items.filter(i => i.checked)
          this.g_black = checked.map(i => i.id).filter(Boolean)
          this.g_platenumbers = checked.map(i => i.platenumber).filter(Boolean)
        }
      } catch (e) {}
    },
    handleBindinput(evt) {
      const key = evt.currentTarget.dataset.item
      this.params[key] = evt.detail.value
    },
    async handleSubmit() {
      const param = {
        ...this.params,
        brakingType: this.brakingType,
        batterylift: this.batterylift,
        carOwnerName: this.carOwnerName,
        id: this.id || ''
      }
      if (!param.platenumber) return uni.showToast({ title: '请输入车牌号', icon: 'none' })
      if (!param.sn) return uni.showToast({ title: '请输入设备号', icon: 'none' })
      try {
        uni.showLoading()
        const res = await u_addOrUpdateCar(param)
        if (res.code === 1000) {
          uni.showToast({ title: res.msg })
          this.switchToList()
        }
      } catch (e) {} finally { uni.hideLoading() }
    },
    // 编辑时自动填充数据（修复修改不生效）
    handleEdit(evt) {
      const info = evt.currentTarget.dataset.item
      this.c_activeTab = 2
      this.btnState = '修改'
      this.id = info.id
      this.params = {
        maintainMileage: info.maintainMileage || '',
        maintainMileageInterval: info.maintainMileageInterval || '',
        totalMileage: info.totalMileage || '',
        vehicleSerialName: info.vehicleSerialName || '',
        vehicleModeName: info.vehicleModeName || '',
        ccdate: info.ccdate || '',
        platenumber: info.platenumber || '',
        sn: info.sn || '',
        code: info.code || ''
      }
    }
  }
}
</script>

<style scoped>
.container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 10rpx;
}
.record-container {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.1);
}
.record-tabs {
  display: flex;
  background: #f8f8f8;
}
.record-tabs-item {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
}
.record-tabs-item.active {
  color: #1677ff;
  background: #e8f3ff;
}
.search-box {
  display: flex;
  align-items: center;
  border: 1rpx solid #eee;
  border-radius: 40rpx;
  padding: 12rpx 20rpx;
  margin: 20rpx;
}
.search-input {
  flex: 1;
  font-size: 24rpx;
  margin-left: 10rpx;
}
.tabs-1-conut {
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx 20rpx;
  color: #666;
  font-size: 24rpx;
}
.select-all {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.list-scroll, .form-scroll {
  height: 70vh;
}
.content-item {
  margin: 20rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
  overflow: hidden;
}
.content-item-head {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.head-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.left-category {
  font-size: 26rpx;
  font-weight: bold;
}
.left-split_line {
  width: 1rpx;
  height: 28rpx;
  background: #ddd;
}
.left-model {
  font-size: 24rpx;
  color: #333;
}
.head-right {
  display: flex;
  gap: 20rpx;
}
.btn-icon {
  color: #1677ff;
  font-size: 24rpx;
}
.content-item-info {
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
}
.info-item {
  margin-bottom: 12rpx;
}
.long-info-item {
  width: 100%;
}
.footer-right-btn {
  background: #1677ff;
  color: #fff;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  margin-left: auto;
}
.empty {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
}
.card-info {
  padding: 20rpx;
}
.card-info-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 26rpx;
}
.card-info-item label {
  color: #333;
}
.card-info-item label text {
  color: red;
}
.card-info-item-input {
  color: #666;
  max-width: 50%;
  text-align: right;
}
.card-footer {
  text-align: center;
  padding: 30rpx 0;
}
.card-footer view {
  background: #1677ff;
  color: #fff;
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
  font-size: 30rpx;
  font-weight: bold;
  display: inline-block;
}
.levitation-button {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  right: 0;
  text-align: center;
}
.levitation-button text {
  background: #1677ff;
  color: #fff;
  padding: 20rpx 80rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>