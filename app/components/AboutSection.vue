<template>
  <section id="about" class="relative z-10 max-w-6xl mx-auto px-6 py-20">
    <div class="animate-fadeIn">
      <h2 class="lg:text-4xl text-2xl mb-8 flex items-center gap-4 uppercase">
        <span class="font-extrabold">{{ $t('about.title') }}</span>
      </h2>
      <div class="space-y-4">
        <p class="text-lg leading-relaxed mb-3">
          <i18n-t keypath="about.dp_warning" tag="span" scope="global">
            <template #link>
              <a target="_blank" href="https://en.wikipedia.org/wiki/Dynamic_programming" style="text-decoration: underline">Dynamic Programming</a>
            </template>
          </i18n-t><br >&nbsp;
        </p>
        <ClientOnly>
          <div v-if="locale === 'en'">
            Hi there! I’m DiamondPie, you can call me DiamondPie, DP, my true name, ... whatever you like!<br ><br >
            I’m an international student beginning my Bachelor of Science, majoring in
            <a
              href="https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/computer-science.html"
              target="_blank"
              rel="noopener noreferrer"
              class="link-tag"
            >Computer Science<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m4.95 3.05c.395.396.397.98.336 1.51l-.037.283c-.16 1.12-.605 2.775-1.242 4.156c-.31.672-.7 1.351-1.179 1.83c-.478.477-1.156.868-1.83 1.178c-1.38.637-3.035 1.082-4.155 1.242l-.282.037c-.53.06-1.118.056-1.51-.336c-.357-.357-.393-.875-.351-1.365l.032-.29l.019-.138c.16-1.12.605-2.775 1.242-4.156c.31-.672.7-1.351 1.179-1.83c.478-.478 1.157-.868 1.83-1.178c1.38-.637 3.035-1.082 4.155-1.242l.282-.037c.53-.06 1.115-.06 1.51.336Zm-1.712 1.712c-.908.155-2.323.55-3.4 1.047c-.597.276-1.023.548-1.252.777s-.501.655-.777 1.252c-.496 1.077-.892 2.492-1.047 3.4c.908-.155 2.323-.55 3.4-1.047c.597-.276 1.023-.548 1.252-.777s.502-.655.777-1.252c.496-1.077.893-2.492 1.047-3.4M12 11a1 1 0 1 1 0 2a1 1 0 0 1 0-2"/></g></svg></a>.
            I’m naturally more thoughtful than loud, but I genuinely enjoy meeting new people and learning about different
            <a id="perspectiveTrigger" href="#" class="link-tag perspective-trigger">perspectives<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M19 3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7.333L4 21.5c-.824.618-2 .03-2-1V6a3 3 0 0 1 3-3zm0 2H5a1 1 0 0 0-1 1v13l2.133-1.6a2 2 0 0 1 1.2-.4H19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m-8 7a1 1 0 0 1 .117 1.993L11 14H8a1 1 0 0 1-.117-1.993L8 12zm5-4a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2z"/></g></svg></a>.<span class="perspective-box-wrapper">
              <span id="perspectiveBox" class="perspective-box">
                <span class="perspective-box-inner">
                  ... the problem is not that the problems we face can’t be solved:<br >
                  the problem is, that we become so afraid of failure that we refuse to see our problems from a new <span style="background-color: rgb(201, 104, 0)">perspective</span>.<br >
                  And so we do the same things again, and again, and again...<br >
                  And therein, of course, we find exactly the failure we were looking for.<br >
                  —— <span style="font-weight: bold">"Superliminal"</span>
                </span>
              </span>
            </span><br >
            In my free time, I enjoy playing
            <a href="https://crafty.gg/@TryDiamondPie" target="_blank" rel="noopener noreferrer" class="link-tag">Minecraft<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11 2.423a2 2 0 0 1 1.842-.082l.158.082l3.33 1.922a2 2 0 0 1 .993 1.569l.007.163v3.846l3.33 1.922a2 2 0 0 1 .994 1.569l.006.163v3.846a2 2 0 0 1-.861 1.644l-.139.088l-3.33 1.922a2 2 0 0 1-1.842.082l-.158-.082L12 19.155l-3.33 1.922a2 2 0 0 1-1.843.082l-.157-.082l-3.33-1.922a2 2 0 0 1-.993-1.568l-.007-.164v-3.846a2 2 0 0 1 .861-1.644l.139-.088l3.33-1.922V6.077a2 2 0 0 1 .861-1.644l.139-.088zm0 12.31l-2.33 1.344v2.69L11 17.424zm2 0v2.69l2.33 1.345v-2.69zm6.66 0l-2.33 1.344v2.691l2.33-1.345zm-15.32-.001v2.69l2.33 1.346v-2.69zm11.99-3.077L14 13l2.33 1.345L18.66 13zm-8.66 0L5.34 13l2.33 1.345L10 13zm7.66-4.423L13 8.577v2.691l2.33-1.345zm-6.66 0v2.69L11 11.269v-2.69zM12 4.155L9.67 5.5L12 6.845L14.33 5.5z"/></g></svg></a>, making
            <a href="https://github.com/DiamondPie" target="_blank" rel="noopener noreferrer" class="link-tag" title="GitHub">useful and fun projects<Icon name="simple-icons:github" width="1em" height="1em" /></a>
            with Python, Java, or Node.js. I also like browsing
            <a href="https://space.bilibili.com/3546380782013073" target="_blank" rel="noopener noreferrer" class="link-tag">Bilibili<Icon name="simple-icons:bilibili" width="1em" height="1em" /></a>, experimenting with LLMs, city walking and travelling!<br >
            <a href="https://www.reddit.com/r/memes/" target="_blank" rel="noopener noreferrer" class="link-tag">Memes<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16M8.964 8.65a1.192 1.192 0 0 1 1.654-.953l.325.143l.44.202l.349.169l.39.196l.43.223l.462.251l.494.28l.249.145l.469.282l.428.268l.564.368l.464.318l.455.328l.083.061c.635.477.64 1.429.001 1.909l-.283.209l-.393.276l-.496.335l-.387.25l-.43.27l-.473.283q-.123.073-.252.147l-.498.282l-.466.253l-.43.224l-.39.196l-.505.242l-.4.181l-.202.088a1.192 1.192 0 0 1-1.651-.954l-.054-.499l-.03-.334l-.042-.599l-.024-.46l-.018-.506l-.01-.549v-.579l.01-.548l.018-.506l.024-.46l.042-.599l.071-.73zm1.884 1.355l-.027.467l-.021.525l-.012.58v.618l.012.58l.02.525l.028.467l.416-.21l.226-.118l.488-.262l.53-.299l.522-.309l.242-.148l.444-.28l.39-.255l-.392-.257l-.444-.281l-.496-.3a30 30 0 0 0-.793-.453l-.488-.262l-.442-.227z"/></g></svg></a> are my favorite too, but don’t spend too much time on them!😉<br ><br >
            I’m curious about how things <a rel="noopener noreferrer" class="link-tag">work</a>. I like solving problems step by step, and I try to approach challenges with <a rel="noopener noreferrer" class="link-tag">patience</a> rather than pressure.<br ><br >
            If you ever want to chat, collaborate, explore the city, or just grab a coffee - I’d be very happy to connect!
          </div>
          <div v-else>
            你好！我是 DiamondPie，你可以叫我 DiamondPie，DP，我的真名......随你喜欢！<br ><br >
            我是一名国际学生，正在攻读<a
              href="https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/computer-science.html"
              target="_blank"
              rel="noopener noreferrer"
              class="link-tag"
            >计算机科学<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m4.95 3.05c.395.396.397.98.336 1.51l-.037.283c-.16 1.12-.605 2.775-1.242 4.156c-.31.672-.7 1.351-1.179 1.83c-.478.477-1.156.868-1.83 1.178c-1.38.637-3.035 1.082-4.155 1.242l-.282.037c-.53.06-1.118.056-1.51-.336c-.357-.357-.393-.875-.351-1.365l.032-.29l.019-.138c.16-1.12.605-2.775 1.242-4.156c.31-.672.7-1.351 1.179-1.83c.478-.478 1.157-.868 1.83-1.178c1.38-.637 3.035-1.082 4.155-1.242l.282-.037c.53-.06 1.115-.06 1.51.336Zm-1.712 1.712c-.908.155-2.323.55-3.4 1.047c-.597.276-1.023.548-1.252.777s-.501.655-.777 1.252c-.496 1.077-.892 2.492-1.047 3.4c.908-.155 2.323-.55 3.4-1.047c.597-.276 1.023-.548 1.252-.777s.502-.655.777-1.252c.496-1.077.893-2.492 1.047-3.4M12 11a1 1 0 1 1 0 2a1 1 0 0 1 0-2"/></g></svg></a>
            专业的理学学士学位。<br >
            我偏爱安静，有时不太擅长交流，但我仍然真心喜欢结识新朋友，因为不同的<a id="perspectiveTrigger" href="#" class="link-tag perspective-trigger">视角<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M19 3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7.333L4 21.5c-.824.618-2 .03-2-1V6a3 3 0 0 1 3-3zm0 2H5a1 1 0 0 0-1 1v13l2.133-1.6a2 2 0 0 1 1.2-.4H19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m-8 7a1 1 0 0 1 .117 1.993L11 14H8a1 1 0 0 1-.117-1.993L8 12zm5-4a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2z"/></g></svg></a>总能让我看到更广阔的世界~<span class="perspective-box-wrapper">
              <span id="perspectiveBox" class="perspective-box">
                <span class="perspective-box-inner">
                  多数情况下，问题并不在于我们无法解决所面临的困境。<br >
                  而在于我们太在乎失败，以致拒绝用其他<span style="background-color: rgb(201, 104, 0)">视角</span>来看待困境。<br >
                  ... 因此，我们不断重蹈覆辙，不断重复过去的失败。<br >
                  —— <span style="font-weight: bold">《超阈限空间》</span>
                </span>
              </span>
            </span><br >
            空闲时间，我喜欢玩<a href="https://crafty.gg/@TryDiamondPie" target="_blank" rel="noopener noreferrer" class="link-tag">《我的世界》<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11 2.423a2 2 0 0 1 1.842-.082l.158.082l3.33 1.922a2 2 0 0 1 .993 1.569l.007.163v3.846l3.33 1.922a2 2 0 0 1 .994 1.569l.006.163v3.846a2 2 0 0 1-.861 1.644l-.139.088l-3.33 1.922a2 2 0 0 1-1.842.082l-.158-.082L12 19.155l-3.33 1.922a2 2 0 0 1-1.843.082l-.157-.082l-3.33-1.922a2 2 0 0 1-.993-1.568l-.007-.164v-3.846a2 2 0 0 1 .861-1.644l.139-.088l3.33-1.922V6.077a2 2 0 0 1 .861-1.644l.139-.088zm0 12.31l-2.33 1.344v2.69L11 17.424zm2 0v2.69l2.33 1.345v-2.69zm6.66 0l-2.33 1.344v2.691l2.33-1.345zm-15.32-.001v2.69l2.33 1.346v-2.69zm11.99-3.077L14 13l2.33 1.345L18.66 13zm-8.66 0L5.34 13l2.33 1.345L10 13zm7.66-4.423L13 8.577v2.691l2.33-1.345zm-6.66 0v2.69L11 11.269v-2.69zM12 4.155L9.67 5.5L12 6.845L14.33 5.5z"/></g></svg></a>，使用 Python、Java 或 Node.js 制作<a href="https://github.com/DiamondPie" target="_blank" rel="noopener noreferrer" class="link-tag" title="GitHub">有用又有趣的项目<Icon name="simple-icons:github" width="1em" height="1em" /></a>。<br >
            我也喜欢逛逛<a href="https://space.bilibili.com/3546380782013073" target="_blank" rel="noopener noreferrer" class="link-tag">Bilibili<Icon name="simple-icons:bilibili" width="1em" height="1em" /></a>，摆弄大语言模型，City Walk，以及旅行！<br >
            <a href="https://www.reddit.com/r/memes/" target="_blank" rel="noopener noreferrer" class="link-tag">网络迷因<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16M8.964 8.65a1.192 1.192 0 0 1 1.654-.953l.325.143l.44.202l.349.169l.39.196l.43.223l.462.251l.494.28l.249.145l.469.282l.428.268l.564.368l.464.318l.455.328l.083.061c.635.477.64 1.429.001 1.909l-.283.209l-.393.276l-.496.335l-.387.25l-.43.27l-.473.283q-.123.073-.252.147l-.498.282l-.466.253l-.43.224l-.39.196l-.505.242l-.4.181l-.202.088a1.192 1.192 0 0 1-1.651-.954l-.054-.499l-.03-.334l-.042-.599l-.024-.46l-.018-.506l-.01-.549v-.579l.01-.548l.018-.506l.024-.46l.042-.599l.071-.73zm1.884 1.355l-.027.467l-.021.525l-.012.58v.618l.012.58l.02.525l.028.467l.416-.21l.226-.118l.488-.262l.53-.299l.522-.309l.242-.148l.444-.28l.39-.255l-.392-.257l-.444-.281l-.496-.3a30 30 0 0 0-.793-.453l-.488-.262l-.442-.227z"/></g></svg></a>也是我的最爱，不过也要提醒自己别在上面浪费太多时间！😉<br ><br >
            我从小便好奇事情是如何<a rel="noopener noreferrer" class="link-tag">运作</a>的。我喜欢一步步解决问题，并且尽量用<a rel="noopener noreferrer" class="link-tag">耐心</a>而不是压力去面对挑战！<br ><br >
            如果你想聊天、合作、探索 City，或者只是喝杯咖啡 —— 不妨一起？
          </div>
        </ClientOnly>
        <PhotoGrid />
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import PhotoGrid from './AboutSection/PhotoGrid.vue'

const { locale } = useI18n()

let mousedownHandler = null
let touchstartHandler = null
let clickHandler = null
let mouseupHandler = null
let touchendHandler = null
let currentTrigger = null

function teardown() {
  if (currentTrigger) {
    if (mousedownHandler) currentTrigger.removeEventListener('mousedown', mousedownHandler)
    if (touchstartHandler) currentTrigger.removeEventListener('touchstart', touchstartHandler)
    if (clickHandler) currentTrigger.removeEventListener('click', clickHandler)
    currentTrigger = null
  }
  if (mouseupHandler) document.removeEventListener('mouseup', mouseupHandler)
  if (touchendHandler) document.removeEventListener('touchend', touchendHandler)
  mousedownHandler = null
  touchstartHandler = null
  clickHandler = null
  mouseupHandler = null
  touchendHandler = null
}

async function setup() {
  teardown()
  await nextTick()
  const trigger = document.getElementById('perspectiveTrigger')
  const box = document.getElementById('perspectiveBox')
  if (!trigger || !box) return

  currentTrigger = trigger
  const DURATION = 500

  let rafId = null
  let startTime = null
  let isOpen = false

  function setProgress(ratio) {
    trigger.style.setProperty('--arc-pct', (ratio * 100).toFixed(2) + '%')
  }

  function resetArc(animate) {
    cancelAnimationFrame(rafId)
    rafId = null
    startTime = null
    trigger.classList.remove('arc-active')
    if (animate) {
      let start = null
      const currentPct = parseFloat(trigger.style.getPropertyValue('--arc-pct')) || 0
      function retract(now) {
        if (!start) start = now
        const ratio = Math.min((now - start) / 300, 1)
        trigger.style.setProperty('--arc-pct', (currentPct * (1 - ratio)).toFixed(2) + '%')
        if (ratio < 1) requestAnimationFrame(retract)
        else trigger.classList.remove('arc-active')
      }
      trigger.classList.add('arc-active')
      requestAnimationFrame(retract)
    } else {
      setProgress(0)
    }
  }

  function startArc() {
    trigger.classList.add('arc-active')
    startTime = performance.now()

    function tick(now) {
      const ratio = Math.min((now - startTime) / DURATION, 1)
      setProgress(ratio)
      if (ratio < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        rafId = null
        toggleBox()
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  function toggleBox() {
    isOpen = !isOpen
    box.classList.toggle('open', isOpen)
  }

  mousedownHandler = (e) => {
    e.preventDefault()
    if (isOpen) {
      toggleBox()
      trigger.classList.remove('arc-active')
      return
    }
    startArc()
  }
  trigger.addEventListener('mousedown', mousedownHandler)

  mouseupHandler = () => {
    if (rafId !== null) resetArc(true)
  }
  document.addEventListener('mouseup', mouseupHandler)

  touchstartHandler = (e) => {
    e.preventDefault()
    if (isOpen) {
      toggleBox()
      trigger.classList.remove('arc-active')
      return
    }
    startArc()
  }
  trigger.addEventListener('touchstart', touchstartHandler, { passive: false })

  touchendHandler = () => {
    if (rafId !== null) resetArc(true)
  }
  document.addEventListener('touchend', touchendHandler)

  clickHandler = (e) => e.preventDefault()
  trigger.addEventListener('click', clickHandler)
}

onMounted(setup)
watch(locale, setup)
onBeforeUnmount(teardown)
</script>

<style scoped>
.perspective-trigger {
  position: relative;
  cursor: pointer;
  isolation: isolate;
}
.perspective-trigger::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 0.6rem;
  padding: 2px;
  background: conic-gradient(
    from 0deg,
    white var(--arc-pct, 0%),
    transparent var(--arc-pct, 0%)
  );
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}
.perspective-trigger.arc-active::before {
  opacity: 1;
}
.perspective-box-wrapper {
  display: block;
}
.perspective-box {
  display: block;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition:
    max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.35s ease 0.05s,
    margin 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0;
}
.perspective-box.open {
  max-height: 500px;
  opacity: 1;
  margin: 0.6rem 0 0.4rem;
}
.perspective-box-inner {
  display: block;
  background: color-mix(in oklab, var(--accent-primary, #7c9ef5), transparent 88%);
  border-left: 2px solid var(--accent-primary, #7c9ef5);
  border-radius: 0.5rem;
  padding: 0.65rem 1rem;
  font-size: 0.92rem;
  line-height: 1.65;
  color: inherit;
}
</style>