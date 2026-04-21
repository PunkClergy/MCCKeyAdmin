<template>
  <view class="container">
    <custom-header title="角色列表与权限绑定" />

    <view class="record-container">
      <!-- TAB切换 -->
      <view class="record-tabs">
        <view 
          class="record-tabs-item" 
          :style="{ backgroundImage: `url(${c_activeTab === 1 ? s_background_tabs_active_1 : s_background_tabs_1})` }"
          @tap="handleSwitchTab('角色列表')"
        >
          角色列表
        </view>
        <view 
          class="record-tabs-item" 
          :style="{ backgroundImage: `url(${c_activeTab === 2 ? s_background_tabs_2 : s_background_tabs_active_2})` }"
          @tap="handleSwitchTab('新增角色')"
        >
          {{ btnState }}角色
        </view>
      </view>

      <!-- 列表 -->
      <block v-if="c_activeTab === 1">
        <scroll-view 
          scroll-y 
          class="list-scroll"
          @scrolltolower="handleLower"
        >
          <view class="content-item" v-for="(item, index) in g_items" :key="index">
            <view class="content-item-head">
              <view class="head-left">
                <view class="left-category">
                  <text>{{ item.name }}</text>
                </view>
              </view>
              <view class="head-right">
                <image src="/static/images/home/_edit.png" @tap="handleEdit(item)" />
                <image src="/static/images/home/_delete.png" @tap="handleDelete(item.id)" />
              </view>
            </view>
            <view class="content-item-info">
              <view class="info-item" :class="item.bak?.length > 15 ? 'long-info-item' : ''">
                <label>说明：</label>
                <text>{{ item.bak || '-' }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </block>

      <!-- 新增/修改 -->
      <block v-if="c_activeTab === 2">
        <scroll-view scroll-y class="form-scroll">
          <view class="long-range-control-car">
            <view class="card-head">
              <text>基础信息</text>
            </view>

            <view class="long-range-control-car-subitem">
              <label>角色名称<text>*</text></label>
              <view class="card-info-item-input">
                <input 
                  placeholder="请输入角色名称" 
                  v-model="params.name" 
                />
              </view>
            </view>

            <view class="long-range-control-car-subitem">
              <label>说明</label>
              <view class="card-info-item-input">
                <input 
                  placeholder="请输入说明" 
                  v-model="params.bak" 
                />
              </view>
            </view>

            <view style="height:30rpx"></view>

            <view class="card-head">
              <text>权限设置</text>
            </view>

            <view class="long-range-control-car-subitem">
              <view class="tree-container">
                <view class="node" v-for="item in tree" :key="item.id">
                  <!-- 一级 -->
                  <view class="node-header">
                    <view 
                      class="arrow" 
                      :class="item.isExpanded ? 'expanded' : ''" 
                      v-if="item.children.length"
                      @tap="toggleExpand(item.id)"
                    >
                      ▶
                    </view>
                    <view 
                      class="checkbox" 
                      :class="{ checked: item.checked, indeterminate: item.indeterminate }"
                      @tap="handleCheck(item.id)"
                    >
                      <view class="checkmark" v-if="item.checked">✓</view>
                      <view class="indeterminate-line" v-if="item.indeterminate"></view>
                    </view>
                    <text class="node-name">{{ item.name }}</text>
                  </view>

                  <!-- 二级 -->
                  <view class="children" v-if="item.children.length && item.isExpanded">
                    <view class="child-node" v-for="child1 in item.children" :key="child1.id">
                      <view class="node-header">
                        <view 
                          class="arrow" 
                          :class="child1.isExpanded ? 'expanded' : ''" 
                          v-if="child1.children.length"
                          @tap="toggleExpand(child1.id)"
                        >
                          ▶
                        </view>
                        <view 
                          class="checkbox" 
                          :class="{ checked: child1.checked, indeterminate: child1.indeterminate }"
                          @tap="handleCheck(child1.id)"
                        >
                          <view class="checkmark" v-if="child1.checked">✓</view>
                          <view class="indeterminate-line" v-if="child1.indeterminate"></view>
                        </view>
                        <text class="node-name">{{ child1.name }}</text>
                      </view>

                      <!-- 三级 -->
                      <view class="children" v-if="child1.children.length && child1.isExpanded">
                        <view class="child-node" v-for="child2 in child1.children" :key="child2.id">
                          <view class="node-header">
                            <view 
                              class="arrow" 
                              :class="child2.isExpanded ? 'expanded' : ''" 
                              v-if="child2.children.length"
                              @tap="toggleExpand(child2.id)"
                            >
                              ▶
                            </view>
                            <view 
                              class="checkbox" 
                              :class="{ checked: child2.checked, indeterminate: child2.indeterminate }"
                              @tap="handleCheck(child2.id)"
                            >
                              <view class="checkmark" v-if="child2.checked">✓</view>
                              <view class="indeterminate-line" v-if="child2.indeterminate"></view>
                            </view>
                            <text class="node-name">{{ child2.name }}</text>
                          </view>

                          <!-- 四级 -->
                          <view class="children" v-if="child2.children.length && child2.isExpanded">
                            <view class="child-node" v-for="child3 in child2.children" :key="child3.id">
                              <view class="node-header">
                                <view 
                                  class="arrow" 
                                  :class="child3.isExpanded ? 'expanded' : ''" 
                                  v-if="child3.children.length"
                                  @tap="toggleExpand(child3.id)"
                                >
                                  ▶
                                </view>
                                <view 
                                  class="checkbox" 
                                  :class="{ checked: child3.checked, indeterminate: child3.indeterminate }"
                                  @tap="handleCheck(child3.id)"
                                >
                                  <view class="checkmark" v-if="child3.checked">✓</view>
                                  <view class="indeterminate-line" v-if="child3.indeterminate"></view>
                                </view>
                                <text class="node-name">{{ child3.name }}</text>
                              </view>

                              <!-- 五级 -->
                              <view class="children" v-if="child3.children.length && child3.isExpanded">
                                <view class="child-node" v-for="child4 in child3.children" :key="child4.id">
                                  <view class="node-header">
                                    <view 
                                      class="checkbox" 
                                      :class="{ checked: child4.checked }"
                                      @tap="handleCheck(child4.id)"
                                    >
                                      <view class="checkmark" v-if="child4.checked">✓</view>
                                    </view>
                                    <text class="node-name">{{ child4.name }}</text>
                                  </view>
                                </view>
                              </view>
                            </view>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <view class="card-footer">
              <view @tap="handleSubmit">确认{{ btnState }}</view>
            </view>
          </view>
        </scroll-view>
      </block>
    </view>
  </view>
</template>

<script>
// import { _handleWindowInfo, _handleDeviceInfo } from '@/utils/public'
// import { showLoading, hideLoading, showToast } from '@/utils/Inspect/tips'
import {
  u_roleapidel,
  u_getMenuTree,
  u_roleapiaddOrUpdate,
  u_roleapiList,
  u_setMenuTree
} from '@/api/index'

export default {
  data() {
    return {
      c_screen_height: 0,
      c_screen_width: 0,
      statusBarHeight:  0,
      navBarHeight: 44,
      searchBarHeight: 80,
      totalNavHeight: ( 0) + ( 44),

      g_page: 1,
      g_items: [],
      g_total: 0,

      c_tabs: [{ name: '账 号列表', value: '1' }, { name: '新增账号', value: '2' }],
      c_activeTab: 2,
      params: {},
      btnState: '新增',
      id: '',
      tree: [],

      s_background_picture_of_the_front_page: '',
      s_background_tabs_1: '',
      s_background_tabs_2: '',
      s_background_tabs_active_1: '',
      s_background_tabs_active_2: ''
    }
  },

  onLoad(options) {
    if (options?.status) {
      this.c_activeTab = 2
      this.inittMenuTree()
    }
    this.initList()
  },

  onShow() {
    this.initialiImageBaseConversion()
    this.inittMenuTree()
  },

  methods: {
    // 切换选中
    handleCheck(id) {
      this.toggleCheck(this.tree, id)
      this.updateParentStates(this.tree)
      this.tree = [...this.tree]
    },

    // 切换展开
    toggleExpand(id) {
      this.toggleNodeExpand(this.tree, id)
      this.tree = [...this.tree]
    },

    toggleNodeExpand(nodes, targetId) {
      nodes.forEach(node => {
        if (node.id === targetId) {
          node.isExpanded = !node.isExpanded
        } else if (node.children) {
          this.toggleNodeExpand(node.children, targetId)
        }
      })
    },

    toggleCheck(nodes, targetId) {
      nodes.forEach(node => {
        if (node.id === targetId) {
          node.checked = !node.checked
          this.toggleChildren(node.children, node.checked)
        } else if (node.children) {
          this.toggleCheck(node.children, targetId)
        }
      })
    },

    toggleChildren(children, checked) {
      if (!children) return
      children.forEach(child => {
        child.checked = checked
        this.toggleChildren(child.children, checked)
      })
    },

    updateParentStates(nodes) {
      nodes.forEach(node => {
        if (node.children?.length) {
          this.checkParentState(node)
          this.updateParentStates(node.children)
        }
      })
    },

    checkParentState(node) {
      const allChecked = node.children.every(c => c.checked)
      const someChecked = node.children.some(c => c.checked || c.indeterminate)
      node.checked = allChecked
      node.indeterminate = !allChecked && someChecked
    },

    // 背景图
    initialiImageBaseConversion() {
      const imageMap = [
        { path: '/static/images/home/car-bg.png', key: 's_background_picture_of_the_front_page' },
        { path: '/static/images/home/1-1.png', key: 's_background_tabs_1' },
        { path: '/static/images/home/2-1.png', key: 's_background_tabs_active_1' },
        { path: '/static/images/home/1-2.png', key: 's_background_tabs_2' },
        { path: '/static/images/home/2-2.png', key: 's_background_tabs_active_2' }
      ]

      const promises = imageMap.map(item => {
        return new Promise(resolve => {
          uni.getFileSystemManager().readFile({
            filePath: item.path,
            encoding: 'base64',
            success: res => {
              resolve({ [item.key]: `data:image/png;base64,${res.data}` })
            }
          })
        })
      })

      Promise.all(promises).then(results => {
        const data = results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        Object.assign(this, data)
      })
    },

    // 列表
    async initList() {
      // showLoading()
      try {
        const res = await u_roleapiList()
		console.log(res,'22222')
        if (res.code === 1000) {
          if (this.g_page > 1 && res.content.length === 0) {
            // showToast(`已加载全部：${this.g_items.length} 条`)
          }
          this.g_items = this.g_items.concat(res.content)
          this.g_total = Number(res.count || 0).toLocaleString()
        }
      } catch (e) {}
      // hideLoading()
    },

    handleLower() {},

    // 刷新
    handleRefresh() {
      this.g_page = 1
      this.g_items = []
      this.initList()
    },

    // 获取选中权限
    getCheckedIds(treeData) {
      const ids = []
      const traverse = nodes => {
        nodes.forEach(n => {
          if (n.checked) ids.push(n.id)
          if (n.children?.length) traverse(n.children)
        })
      }
      traverse(treeData)
      return ids
    },

    // 设置权限
    async handleSetMenuTree(roleId) {
      try {
        const menuIds = this.getCheckedIds(this.tree).toString()
        await u_setMenuTree({ roleId, menuIds })
      } catch (e) {}
    },

    // 提交
    async handleSubmit() {
      if (!this.params.name) {
        // showToast('请输入角色名称')
        return
      }
      // showLoading()
      try {
        const res = await u_roleapiaddOrUpdate({ ...this.params, id: this.id })
        if (res.code !== 1000) {
          // showToast(res.msg)
          return
        }
        // showToast('操作成功')
        this.c_activeTab = 1
        this.params = {}
        this.btnState = '新增'
        this.g_page = 1
        this.g_items = []
        this.initList()
        this.handleSetMenuTree(res.content.id)
      } catch (e) {
        // showToast('提交失败')
      }
      // hideLoading()
    },

    // 编辑
    handleEdit(item) {
      this.btnState = '修改'
      this.id = item.id
      this.params = { name: item.name, bak: item.bak }
      this.c_activeTab = 2
      this.inittMenuTree()
    },

    // 切换TAB
    handleSwitchTab(flag) {
      if (flag === '角色列表') {
        this.c_activeTab = 1
        this.btnState = '新增'
        this.params = {}
        this.id = ''
      } else {
        this.c_activeTab = 2
        this.inittMenuTree()
      }
    },

    // 删除
    async handleDelete(id) {
      try {
        const res = await u_roleapidel({ id })
        if (res.code === 1000) {
          this.g_page = 1
          this.g_items = []
          this.initList()
        }
      } catch (e) {}
    },

    // 转换菜单
    convertMenuData(originalData) {
      const convertNode = node => {
        const res = {
          id: node.id,
          name: node.name,
          checked: !!node.checked,
          indeterminate: false,
          isExpanded: true,
          children: []
        }
        if (node.children?.length) {
          node.children.forEach(c => {
            const child = convertNode(c)
            if (child) res.children.push(child)
          })
        }
        return res
      }

      const result = [{
        id: 1,
        name: '全部',
        checked: false,
        indeterminate: false,
        isExpanded: true,
        children: []
      }]

      originalData.forEach(item => {
        if (item.parentid === -1 && item.isdelete === 0) {
          result[0].children.push(convertNode(item))
        }
      })
      return result
    },

    // 获取权限树
    async inittMenuTree() {
      try {
        const res = await u_getMenuTree({ roleId: this.id || '' })
        if (res.code === 1000) {
          this.tree = this.convertMenuData(res.content)
        }
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
/* 你的样式全部保留，我已优化自动高度 */
.container {
  height: 100vh;
  padding: 10rpx 4rpx;
  box-sizing: border-box;
}

.record-container {
  width: 96%;
  margin: 0 auto;
  height: calc(100% - 130rpx);
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.record-tabs {
  display: flex;
  height: 50px;
}

.record-tabs-item {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  font-weight: bold;
  font-size: 28rpx;
  color: #010101;
}

.list-scroll,
.form-scroll {
  flex: 1;
  overflow-y: auto;
}

.content-item {
  margin: 10rpx;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.content-item-head {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 20rpx 15rpx;
}

.head-right {
  display: flex;
  gap: 40rpx;
}

.head-right image {
  width: 30rpx;
  height: 30rpx;
}

.content-item-info {
  padding: 10rpx;
}

.info-item {
  font-size: 24rpx;
  color: #333;
}

.long-info-item {
  width: 100%;
}

.long-range-control-car {
  padding: 20rpx;
}

.card-head {
  font-weight: bold;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.long-range-control-car-subitem {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 20rpx 0;
}

.long-range-control-car-subitem label {
  font-size: 26rpx;
  color: #333;
}

.long-range-control-car-subitem label text {
  color: red;
}

.card-footer {
  text-align: center;
  margin: 30rpx 0;
}

.card-footer view {
  width: 40%;
  margin: 0 auto;
  background: linear-gradient(88deg, #1576dc, #1b64b1);
  color: #fff;
  padding: 10rpx;
  border-radius: 36rpx;
  font-weight: bold;
  font-size: 34rpx;
}

.tree-container {
  padding: 10rpx 0;
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.arrow {
  font-size: 24rpx;
  margin-right: 10rpx;
  transition: 0.3s;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ccc;
  border-radius: 6rpx;
  margin-right: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #07c160;
  border-color: #07c160;
}

.checkmark {
  color: #fff;
  font-size: 28rpx;
}

.indeterminate-line {
  width: 20rpx;
  height: 4rpx;
  background: #07c160;
}

.children {
  margin-left: 20rpx;
  border-left: 2rpx solid #eee;
  padding-left: 20rpx;
}

.node-name {
  font-size: 24rpx;
  color: #333;
}
</style>