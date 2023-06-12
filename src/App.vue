<template>
  <div id="app">
    <!-- 当 router-view 被解析的时候就会触发 router.beforeEach -->
    <router-view />
  </div>
</template>

<script lang="ts">
export default {
  name: 'App'
}
</script>
