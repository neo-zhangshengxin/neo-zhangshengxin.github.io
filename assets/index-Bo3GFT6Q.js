(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function r(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(e){if(e.ep)return;e.ep=!0;const o=r(e);fetch(e.href,o)}})();const i={class:"markdown-body"},p=Vue.createStaticVNode(`<p><strong>最近做 iOS app submit 的时候报了一个警告，提示当前项目使用的 sdk 版本过低，4 月底后就不能再提交了，除非对它进行升级。目前项目构筑使用的 xcode 版本是 14.2，查询 <a href="https://developer.apple.com/cn/support/xcode/">https://developer.apple.com/cn/support/xcode/</a> 可以得知 14.2 对应的是 iOS 16.2 ，而 5 月开始最低的版本都已经要 17.0 以上了，因此着手准备升级工作。</strong></p><h3>警告信息</h3><p>SDK version issue. This app was built with the iOS 16.2 SDK. Starting April 29, 2024, all iOS and iPadOS apps must be built with the iOS 17 SDK or later, included in Xcode 15 or later, in order to be uploaded to App Store Connect or submitted for distribution. (90725)</p><h3>改 xcode 版本</h3><p>我司使用的是 microsoft app center，上面可以配置 xcode 的版本以及证书等信息。首先当然是改 xcode 的版本，如果能一次 build 成功的话，我们也就不必辛苦的搭建本地环境去构建了，我把 xcode 的版本升到了 15.2，然后发现失败了，于是开始本地调试</p><h3>找到并改正问题</h3><p>调试过程中我发现问题只要出现在 GoogleDataTransport 和 yoga 这两个 lib 上</p><p>GoogleDataTransport 报错的地方不少，但问题都一样，都是 <code class="">A function declaration without a prototype is deprecated in all versions of C</code></p><p>以下展示下报错的一处地方</p><pre><code class="language-m">GDTCORNetworkType GDTCORNetworkTypeMessage() {

#if !TARGET_OS_WATCH

  SCNetworkReachabilityFlags reachabilityFlags = [GDTCORReachability currentFlags];

  **if** ((reachabilityFlags &amp; kSCNetworkReachabilityFlagsReachable) ==

      kSCNetworkReachabilityFlagsReachable) {

    **if** (GDTCORReachabilityFlagsContainWWAN(reachabilityFlags)) {

      **return** GDTCORNetworkTypeMobile;

    } **else** {

      **return** GDTCORNetworkTypeWIFI;

    }

  }

#endif

  **return** GDTCORNetworkTypeUNKNOWN;

}
</code></pre><p>改动也很简单，在入参处加个 void 即可，即 <code class="">GDTCORNetworkType GDTCORNetworkTypeMessage(void)</code></p><hr><p>yoga 报的问题是 <code class="">Use of bitwise &#39;|&#39; with boolean operands</code></p><pre><code class="language-C++">node-&gt;setLayoutHadOverflow(

        node-&gt;getLayout().hadOverflow() |

        currentRelativeChild-&gt;getLayout().hadOverflow());
</code></pre><p>改动同样简单，| 改成 || 即可，即 <code class="">node-&gt;getLayout().hadOverflow() ||</code></p><p>以上问题全部改完后，项目确实能跑起来了</p><h3>应用在 micorsoft app center 等类似的分发工具上</h3><p>上面的改动都是对 Pods 文件夹下源码的改动，很显然，在大多数公司的工作流程中，直接改动生成的源码然后去构建是不现实的，比如我司使用的 app center 上，开发人员提交代码到特定分支上，然后 app center 会自动执行 <code class="">pod install</code> 命令，这样的话，问题仍没有解决。因此，针对 GoogleDataTransport 和 yoga，我使用了不同的解决策略</p><p>关于 GoogleDataTransport 的报错，其实是 CLANG_WARN_STRICT_PROTOTYPES 为 YES 的原因，可以在 Podfile 中把该配置改成 NO</p><pre><code class="language-Podfile">     installer.pods_project.targets.each do |target|
       if target.name.start_with? &quot;GoogleDataTransport&quot;
         target.build_configurations.each do |config|
           config.build_settings[&#39;CLANG_WARN_STRICT_PROTOTYPES&#39;] = &#39;NO&#39;
         end
       end
     end
</code></pre><p>Yoga 我目前使用的 1.14.0 版本，github 有 issue 提到 1.19.0 版本解决了这个问题，但由于 yoga 是绑定在 RN 下的，如果升级 yoga ，就需要升级 RN，代价太大 退而求其次，我将 yoga 的内容从 node_modules 搬到了 ios 文件夹下，然后把 | 改成 ||</p><pre><code class="language-Podfile">  # pod &#39;Yoga&#39;, :path =&gt; &#39;../node_modules/react-native/ReactCommon/yoga&#39;, :modular_headers =&gt; true
  pod &#39;Yoga&#39;, :path =&gt; &#39;./yoga&#39;, :modular_headers =&gt; true
</code></pre><p>以上的都提交到了 git 上后，app center 终于能成功出 build 了，下载下来后也不出现闪退等问题，改动成功</p><h3>总结</h3><p>作为一个 iOS 小白，能靠自己成功的解决升级 sdk 的问题，还是成就感满满的。虽然解决的方式有点像破屋子打补丁，如果有更好的解决方式，请不吝指教。</p>`,25),c=[p],d=Vue.defineComponent({__name:"interview",setup(s,{expose:t}){return t({frontmatter:{},excerpt:void 0}),(r,a)=>(Vue.openBlock(),Vue.createElementBlock("div",i,c))}}),l=Vue.defineComponent({__name:"App",setup(s){return(t,r)=>(Vue.openBlock(),Vue.createBlock(Vue.unref(d)))}}),u=Vue.createApp(l);u.mount("#app");
