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

2. 地图定位与 Google 加载解耦（修复分应用代理下无法唤起定位/白屏）

- `hybrid/html/js/risk.js`、`sendKey.js`、`trajectory.js`（车辆位置 / 车务取还车 / 车辆轨迹）
  - 将定位请求从 Google Maps 的 `initMap` 回调中抽出为独立函数 `requestGeolocation()`，页面 `DOMContentLoaded` 时即申请，不再依赖 `maps.googleapis.com` 是否加载成功。
  - 新增 `hasMyLocation` 标志做地图/定位双向兜底：谁先就绪都能正确渲染“我的位置”标记，`getCurrentPosition` 仍只调用一次，无竞态。
  - 原因：定位授权弹窗原先写在 Google 脚本回调内，Google 加载失败（如 v2rayNG 分应用代理未配 DNS）时连权限弹窗都无法触发，导致既无地图也无定位。
  - 注意：本改动只解决“权限/定位与地图强耦合”，Google 底图仍需网络可达（分应用代理需开启 Fake DNS + Sniffing）。

3. 定位权限降级：仅保留粗略定位（为 Google Play 上架合规）

- `manifest.json` 与离线工程 `app/src/main/AndroidManifest.xml`
  - 删除 `android.permission.ACCESS_FINE_LOCATION`（精确/GPS 定位），仅保留 `ACCESS_COARSE_LOCATION`（粗略定位）。
  - 保留 `modules.Geolocation` 与 `requiredPrivateInfos: getLocation`（粗略定位仍需要）。
- `hybrid/html/js/risk.js`、`sendKey.js`、`trajectory.js`
  - `getCurrentPosition` 的 `enableHighAccuracy` 由 `true` 改为 `false`，与只保留 COARSE 权限保持一致。
  - 说明：设备定位仅用于地图上显示“我的位置”蓝点及与车辆的大致距离；车辆位置来自服务器接口，删除精确定位不影响任何核心功能（地图、控车、轨迹照常）。
- 上架配套：上传新版后需在 Play Console → 数据安全（Data Safety）将位置声明改为仅“大致位置”。

> 打包提醒：改动源文件在 `hybrid/html/js/` 与 `manifest.json`，离线打包前需在 HBuilderX 重新发行同步进 assets；离线工程 `AndroidManifest.xml` 已直接同步，注意云端 `manifest.json` 打包时不要把 FINE 合并回来。

4. 修复 Google Play（AAB）安装后启动图白屏（AS 真机 debug 正常）

- 离线工程 `app/build.gradle`
  - 在 `android {}` 中新增：
    ```
    packaging {
        jniLibs {
            useLegacyPackaging = true
        }
    }
    ```
  - 根因：AAB 默认 `extractNativeLibs=false`，`.so` 不解压成真实文件；而 DCloud/Weex 引擎需按文件路径加载 `libweexjss.so`，找不到 → `framework.js` 初始化失败 → JS 层不启动 → 启动图后白屏。AS 直装 debug APK 会解压 `.so`，故真机正常、Play 安装白屏。
  - 效果：合并清单变为 `extractNativeLibs="true"`，安装时 `.so` 解压到真实路径，JS 引擎正常启动。已通过 `:app:processReleaseMainManifest` 验证合并清单值为 true。
  - 环境：AGP 8.12.0 / Gradle 8.14.3；AGP 8 用 `packaging`（`packagingOptions` 为其废弃别名，等效）。
  - 说明：本项为纯原生构建配置，不需要 HBuilderX 重新发行；但要让 JS/权限改动一并进包，仍需先在 HBuilderX 发行同步 assets，再在 AS 重新生成签名 AAB。

5. 修复 Google Play “不支持 16 KB 内存页面大小” 警告

- 根因：旧包（260707）上传时尚未加 `useLegacyPackaging=true`，为 AGP 默认 `extractNativeLibs=false` + release 又设 `zipAlignEnabled false`，导致 `.so` 以未压缩方式入包却未按 16 KB 对齐 → Play 判定不支持 16 KB。
- 现状核实：当前 SDK（5.07.82603）所有 arm64 `.so` 的 ELF 段本身均 ≥16 KB 对齐（16KB/64KB），库无需更换。
- 已做修改，离线工程 `app/build.gradle`：
  - `release.zipAlignEnabled` 由 `false` 改为 `true`（未压缩资源按页对齐更稳妥）。
  - `release` 增加 `ndk { abiFilters 'arm64-v8a', 'armeabi-v7a' }`：64 位 + 32 位，最大化设备覆盖；只去掉 x86/x86_64/armeabi（模拟器/极老架构）。debug 不限制，便于 x86 模拟器调试。
    - 说明：16 KB 页是 arm64 专属，armeabi-v7a（32 位、恒 4 KB 页）属豁免，不触发 16 KB 警告；故保留 32 位不影响合规。
    - 教训：曾一度只留 arm64-v8a，导致 Play 提示“不再支持 5,083 部设备”（32 位机型）。16 KB 并不要求去掉 32 位，遂加回 armeabi-v7a。
  - 叠加第 4 节的 `useLegacyPackaging=true`：`.so` 改为压缩存储、安装时解压，规避“未压缩未对齐”问题；解压后的库 ELF 已 16 KB 对齐，16 KB 设备正常加载。
- 验证：实跑 `:app:bundleRelease` 成功，解包 `app-release.aab` 确认包内含 `arm64-v8a` 与 `armeabi-v7a`（各 13 个库），其中 arm64 全部 ≥16 KB 对齐、0 个不合规。
- 结论：重新用当前工程打 AAB 上传即可清除该警告；白屏修复与 16 KB 兼容不冲突，同一包内同时满足。

6. 修复 Google Play “SoLoader SDK 版本有问题”（纯 64 位设备可能崩溃）

- 根因：`com.facebook.fresco:fresco:1.13.0` 传递引入 `com.facebook.soloader:soloader:0.6.0`，该老版本在仅 64 位架构设备上有已知崩溃 bug；Google Play 要求 ≥0.10.4。
- 离线工程 `app/build.gradle`：
  - 新增 `configurations.all { resolutionStrategy { force 'com.facebook.soloader:soloader:0.10.4' } }` 覆盖所有配置的传递版本；
  - 并在 dependencies 显式 `implementation 'com.facebook.soloader:soloader:0.10.4'`。
- 验证：`:app:dependencies` 显示全部 `soloader:0.6.0 -> 0.10.4`（并带 `nativeloader:0.10.4`）；`:app:bundleRelease` 构建成功。
- 提醒：SoLoader 由 0.6.0 跨到 0.10.4，Fresco 1.13.0 所用 API（`SoLoader.init/loadLibrary`）在新版仍兼容，编译通过；上架前建议真机冒烟一次（首页图片加载/相机扫码等走 Fresco 的路径）确认无 `NoSuchMethodError` 类运行时问题。