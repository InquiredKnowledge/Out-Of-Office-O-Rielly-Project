<template>
  <v-app>
    <!-- navbar lives outside of v-main to function properly -->
    <Navbar :key="$route.fullPath" />
    <v-main>
      <router-view /><!-- router-view is saying let vue-router handle the routing -->
    </v-main>
  </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";
export default {
  name: "App",

  components: {
    Navbar,
  },

  data: () => ({
    //
  }),
};
</script>
