<template>
  <router-view></router-view>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
}
</style> 