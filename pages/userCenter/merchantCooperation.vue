<template>
  <view class="container">
    <custom-header title="私域流量合作" />

    <view class="record-container">
      <!-- 切换部分 -->
      <view class="record-tabs">
        <view class="record-tabs-item" :class="c_activeTab == 1 ? 'active' : ''" @click="() => c_activeTab = 1">
          合作商列表
        </view>
        <view class="record-tabs-item" :class="c_activeTab == 2 ? 'active' : ''" @click="() => c_activeTab = 2">
          {{ btnState }}合作商
        </view>
      </view>

      <!-- 列表 -->
      <view class="scroll-wrapper" v-if="c_activeTab === 1">
        <scroll-view scroll-y @scrolltolower="handleLower">
          <view class="content-item" v-for="item in g_items" :key="item.id">
            <view class="content-item-head">
              <view class="head-left">
                <view class="left-category">
                  <text>{{ item.name }}</text>
                </view>
                <view class="left-split_line"></view>
                <view class="left-model">
                  {{ item.housetype || '-' }}
                </view>
              </view>
              <view class="head-right" v-if="!g_flagMulti">
                <image src="/static/images/home/_edit.png" :data-item="item" @click="handleEdit" />
                <image src="/static/images/home/_delete.png" :data-item="item" @click="handleDelete" />
              </view>
            </view>

            <view class="content-item-info">
              <view class="info-item" :class="item.jobpersonname?.length > 15 ? 'long-info-item' : ''">
                <label>负责人 ：</label>
                <text>{{ item.jobpersonname || '-' }}</text>
              </view>
              <view class="info-item" :class="item.commission?.length > 15 ? 'long-info-item' : ''">
                <label>佣金 ：</label>
                <text>{{ item.commission || '-' }}</text>
              </view>
              <view class="info-item" :class="item.internalperformance?.length > 15 ? 'long-info-item' : ''">
                <label>内部绩效 ：</label>
                <text>{{ item.internalperformance || '' }}</text>
              </view>
              <view class="info-item" :class="item.qrcode?.length > 15 ? 'long-info-item' : ''">
                <label>二维码值 ：</label>
                <text>{{ item.qrcode || '' }}</text>
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
                <view class="footer-right-btn" :data-item="item" @click="handleSelectJump" v-if="!g_flagMulti">
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
      </view>

      <!-- 新增/修改 -->
      <view class="scroll-wrapper" v-else>
        <scroll-view scroll-y>
          <view class="card-info">
            <view class="card-info-item">
              <label>门店名称<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入门店名称" v-model="params.name" data-item="name" @input="handleBindinput" />
              </view>
            </view>
            <view class="card-info-item">
              <label>门店类型<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入门店类型" v-model="params.housetype" data-item="housetype" @input="handleBindinput" />
              </view>
            </view>
            <view class="card-info-item">
              <label>佣金<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入佣金" v-model="params.commission" data-item="commission" @input="handleBindinput" />
              </view>
            </view>
            <view class="card-info-item">
              <label>地址<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入地址" v-model="params.address" data-item="address" @input="handleBindinput" />
              </view>
            </view>
            <view class="card-info-item">
              <label>二维码值<text>*</text></label>
              <view class="card-info-item-input">
                <input placeholder="请输入二维码值" v-model="params.qrcode" data-item="qrcode" @input="handleBindinput" />
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
                <input placeholder="请输入负责人姓名" v-model="params.jobpersonname" data-item="jobpersonname" @input="handleBindinput" />
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
                <input placeholder="请输入内部绩效" v-model="params.internalperformance" data-item="internalperformance" @input="handleBindinput" />
              </view>
            </view>
          </view>
          <view class="card-footer">
            <view @click="handleSubmit">确认{{ btnState }}</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view class="levitation-button" v-if="c_activeTab == 1 && g_flagMulti && g_black.length > 0" @click="handleJumpBlackInfo">
      <text>确定</text>
    </view>
  </view>
</template>

<script>
import {
  u_houseFlowList,
  u_addOrUpdate,
  u_houseFlowDel
} from '@/api/index.js'

// import {
//   showLoading,
//   // hideLoading,
//   showToast
// } from '@/utils/Inspect/tips.js'

export default {
  data() {
    return {
      g_page: 1,
      g_items: [],
      c_activeTab: 1,
      params: {},
      btnState: '新增',
      id: '',
      g_source: '',
      g_flagMulti: false,
      info: null,
      allParams: '',
      type: '',
      name: '',
      rentenddate: '',
      rentstartdate: '',
      signdate: '',
      g_black: [],
      g_platenumbers: []
    }
  },
  onLoad(options) {
    this.initCarryParams(options)
    this.initList()
  },
  methods: {
    // 选择项
    handleChangeBlack(evt) {
      const id = evt.currentTarget.dataset.item.id
      const blackSet = new Set(this.g_black)
      const plateSet = new Set(this.g_platenumbers)
      const vehicle = this.g_items.find(item => item.id === id)
      if (!vehicle) return

      if (blackSet.has(id)) {
        blackSet.delete(id)
        plateSet.delete(vehicle.platenumber)
      } else {
        blackSet.add(id)
        plateSet.add(vehicle.platenumber)
      }
      this.g_black = [...blackSet]
      this.g_platenumbers = [...plateSet]
    },

    // 跳转
    handleJumpBlackInfo() {
      uni.reLaunch({
        url: `${this.g_source}?black=${this.g_black}&type=${this.type}&name=${this.name}&platenumbers=${this.g_platenumbers}&info=${JSON.stringify(this.info)}`
      })
    },

    // 扫码
    scanCode() {
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          this.handleScanResult(res.result)
        },
        fail: () => {
          // showToast('扫码失败')
        }
      })
    },

    handleScanResult(result) {
      this.params = {
        ...this.params,
        sn: result
      }
    },

    initCarryParams(evt) {
      const { source, flagMulti, info, allParams, type, name } = evt
      this.g_source = source
      this.g_flagMulti = flagMulti
      this.info = info ? JSON.parse(info) : null
      this.allParams = allParams
      this.type = type
      this.name = name
    },

    handleSelectJump(evt) {
      const item = evt.currentTarget.dataset.item
      if (this.allParams) {
        uni.redirectTo({
          url: `${this.g_source}?datails=${JSON.stringify(item)}&allParams=${this.allParams}&type=${this.type}`
        })
      } else {
        uni.redirectTo({
          url: `${this.g_source}?datails=${JSON.stringify(item)}`
        })
      }
    },

    // 列表
    async initList() {
      try {
        const res = await u_houseFlowList({
          page: this.g_page
        })
        if (res.code === 1000) {
          const list = res.content || []
          if (this.g_page > 1 && list.length === 0) {
            // showToast(`已加载全部数据：共${this.g_items.length}条`)
          }
          this.g_items = this.g_items.concat(list)
        }
      } catch (e) {}
    },

    // 触底加载
    handleLower() {
      this.g_page++
      this.initList()
    },

    // 输入
    handleBindinput(evt) {
      const key = evt.currentTarget.dataset.item
      this.params[key] = evt.detail.value
    },

    handleOnDateChange1(e) {
      this.rentenddate = e.detail.value
    },
    handleOnDateChange2(e) {
      this.rentstartdate = e.detail.value
    },
    handleOnDateChange3(e) {
      this.signdate = e.detail.value
    },

    // 提交
    async handleSubmit() {
      const param = {
        ...this.params,
        rentenddate: this.rentenddate,
        rentstartdate: this.rentstartdate,
        signdate: this.signdate,
        id: this.id || ''
      }

      // showLoading()
      try {
        const res = await u_addOrUpdate(param)
        // hideLoading()
        if (res.code === 1000) {
          this.c_activeTab = 1
          this.params = {}
          this.btnState = '新增'
          this.id = ''
          this.rentenddate = ''
          this.rentstartdate = ''
          this.signdate = ''
          this.g_page = 1
          this.g_items = []
          // showToast(res.msg)
          this.initList()
        } else {
          // showToast(res.msg)
        }
      } catch (e) {
        // hideLoading()
      }
    },

    // 编辑
    handleEdit(evt) {
      const info = evt.currentTarget.dataset.item
      const { createdate, ...newObj } = info
      this.c_activeTab = 2
      this.btnState = '修改'
      this.id = info.id
      this.params = { ...newObj }
      this.rentenddate = info.rentenddate
      this.rentstartdate = info.rentstartdate
      this.signdate = info.signdate
    },

    // 删除
    async handleDelete(evt) {
      const id = evt.currentTarget.dataset.item.id
      try {
        const res = await u_houseFlowDel({ id })
        if (res.code === 1000) {
          // showToast('删除成功')
          this.g_items = []
          this.g_page = 1
          this.initList()
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
}

.container {
  width: 100%;
  height: 100vh;
  background-color: #f5f7fa;
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

/* 以下为原有样式（已清理背景图） */
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

.head-right image {
  width: 30rpx;
  height: 30rpx;
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

.content-item-footer {
  display: flex;
  padding: 15rpx;
  justify-content: space-between;
}

.footer-right-btn {
  background: #1b64b1;
  color: #fff;
  border-radius: 8rpx;
  padding: 4rpx 15rpx;
  font-size: 22rpx;
}

.levitation-button {
  position: absolute;
  bottom: 50rpx;
  width: 100%;
  display: flex;
  justify-content: center;
}

.levitation-button text {
  width: 40%;
  height: 75rpx;
  background: linear-gradient(88deg, #1576dc, #1b64b1);
  border-radius: 36rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
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