<template>
  <div>
    <nav style="margin: 24px 0; text-align: center;">
      <NuxtLink to="/" style="margin: 0 16px;">Basic</NuxtLink>
      <NuxtLink to="/hook" style="margin: 0 16px;">Hook</NuxtLink>
      <NuxtLink to="/extension" style="margin: 0 16px;">Extension Demo</NuxtLink>
    </nav>
    <slot />
  </div>
</template>

<script setup lang="ts">
// No script needed for basic layout
</script>

<style scoped>
nav {
  font-size: 1.1em;
}
</style>
