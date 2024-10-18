<template>
  <el-container class="layout-container">
    <el-header> 
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="1">Symmetric encryption</el-menu-item>
        <el-menu-item index="2">Asymmetric encryption</el-menu-item>
        <el-menu-item index="3">Encoding and decoding</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <component :is="currentComponent" />
    </el-main>
    <!-- <el-footer height="30px">@copyright</el-footer> -->
  </el-container>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import EncryptDecrypt from './encrypt_decrypt.vue'
import EncodeDecode from './encode_decode.vue'
import RsaSm2 from './rsasm2.vue'

const activeIndex = ref('1')
const currentComponent = shallowRef(EncryptDecrypt)

const handleSelect = (index) => {
  activeIndex.value = index
  switch (index) {
    case '1':
      currentComponent.value = EncryptDecrypt
      break
    case '2':
      currentComponent.value = RsaSm2
      break
    case '3':
      currentComponent.value = EncodeDecode
      break
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
  padding: 0;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 0px;
}

.el-footer {
  background-color: #B3C0D1;
  color: #333;
  line-height: 30px;
  text-align: center;
}

.el-menu-demo {
  justify-content: center;
}
</style>