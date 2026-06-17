1. 本次已调整的项目文件

- `manifest.json`
  - 关闭 `autoSdkPermissions`，避免 DCloud/三方 SDK 自动合并后台定位权限。
  - 手动保留前台定位、蓝牙、相机、网络等必要权限。
  - 不再显式添加 `android.permission.ACCESS_BACKGROUND_LOCATION`。
  - 将 `minSdkVersion` 从 35 调整为 23，避免只支持极少数 Android 设备。
- `pages.json`
  - 将定位权限说明改为“仅在使用地图功能时获取当前位置”。
- `unpackage/res/icons/`
  - 补齐 Android/iOS 启动图标尺寸，避免安装后显示默认 HBuilder 图标。
- `nativeResources/android/AndroidManifest.xml`
  - 增加后台定位权限移除声明，云打包可合并；离线打包时需手动同步到原生工程 Manifest。不要把后台定位写进 `permissions` 数组。