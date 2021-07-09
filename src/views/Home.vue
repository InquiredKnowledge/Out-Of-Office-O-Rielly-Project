<template>
  <!-- home is just the place where the calendar/sidebars live -->
  <div class="home">
    <Calendar />
  </div>
</template>

<script>
// @ is an alias to /src
import Calendar from "@/components/Calendar";

export default {
  name: "Home",
  components: {
    Calendar,
  },
};
</script>
