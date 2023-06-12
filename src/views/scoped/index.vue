<template>
  <div>
    <h1 class="box">Scoped 和 :deep 的原理</h1>
    <hr>
    <ComA></ComA>
  </div>
</template>

<script lang="ts">
import ComA from './component/ComA.vue';
export default {
  name: 'ScopedIndex',

  components: {
    ComA
  }
}
</script>

<style scoped>

/*.box[data-v-34b5fa2d] {*/
/*  color: red;*/
/*}*/


.box {
  color: red;
}
</style>
