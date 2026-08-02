import { testLanguage } from "./_harness.ts";

testLanguage(
  "vue",
  {
    "single file component": `<script setup lang="ts">
import { computed, ref } from "vue";

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<template>
  <button class="counter" @click="count++">{{ doubled }}</button>
</template>

<style scoped>
.counter {
  color: #09f;
}
</style>`,

    template: `<template>
  <div id="app" class="wrap" data-role=main>
    <h1>{{ title }}</h1>
    <img src="/logo.svg" alt="Logo" />
    <hr>
  </div>
</template>`,

    comments: `<template>
  <!-- the header -->
  <!-- TODO: extract a component -->
  <p>a &amp; b &lt; c</p>
</template>`,

    interpolation: `<template>
  <p>{{ user.name }}</p>
  <p>{{ "Total: " + total.toFixed(2) }}</p>
  <p>{{ items.length }} left</p>
  <p>{{ price * 1.2 }}</p>
</template>`,

    "list rendering": `<template>
  <ul class="list">
    <li v-for="(item, index) in items" :key="item.id" @click="select(item)">
      <span :class="{ active: item.id === current }">{{ index }}. {{ item.label }}</span>
    </li>
  </ul>
</template>`,

    conditionals: `<template>
  <section>
    <p v-if="state === 'loading'">Loading</p>
    <p v-else-if="error">{{ error.message }}</p>
    <p v-else>Ready</p>
    <aside v-show="open" v-cloak>Details</aside>
    <span v-pre>literal</span>
  </section>
</template>`,

    "form bindings": `<template>
  <form @submit.prevent="save">
    <input v-model.trim="form.name" type="text" required />
    <input v-model.number="form.age" type="number" />
    <textarea v-model.lazy="form.bio"></textarea>
    <select v-model="form.role">
      <option v-for="r in roles" :value="r">{{ r }}</option>
    </select>
    <button type="submit" :disabled="busy">Save</button>
  </form>
</template>`,

    "event handlers": `<template>
  <div>
    <input @keyup.enter="submit" @keyup.esc="cancel" />
    <button v-on:click.prevent.stop="reset">Reset</button>
    <a v-on:[eventName]="handle" href="#">go</a>
    <video @ended="next" .muted="isMuted"></video>
  </div>
</template>`,

    slots: `<template>
  <BaseLayout>
    <template #header>
      <h1>Title</h1>
    </template>
    <template v-slot:default="slotProps">
      <p>{{ slotProps.text }}</p>
    </template>
    <template #footer="{ year }">
      <small>&copy; {{ year }}</small>
    </template>
  </BaseLayout>
</template>`,

    "dynamic component": `<template>
  <component :is="currentTab" v-bind="tabProps" :[dynamicKey]="value" />
  <KeepAlive>
    <component :is="Async" />
  </KeepAlive>
  <div v-html="rawHtml"></div>
  <div v-text="plain"></div>
  <div v-memo="[valueA, valueB]"></div>
  <div v-once>{{ neverUpdates }}</div>
</template>`,

    "script options api": `<script>
// the counter component
export default {
  name: "Counter",
  props: { start: { type: Number, default: 0 } },
  data() {
    return { count: this.start };
  },
  methods: {
    /* bump the counter */
    inc(by = 1) {
      this.count += by;
    },
  },
};
</script>`,

    "script setup typescript": `<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { User } from "./types";

const user = ref<User | undefined>();

// load once mounted
onMounted(async () => {
  const res = await fetch("/api/user");
  user.value = (await res.json()) as User;
});
</script>`,

    "style scoped": `<style scoped>
/* the card */
.card {
  display: flex;
  color: rgb(0 0 0 / 60%);
  background: url("bg.png");
}

.card::after {
  content: "*";
}
</style>`,

    "style scss": `<style lang="scss" scoped>
$brand: #09f;

.card {
  color: $brand;

  &:hover {
    color: $brand;
  }

  .title {
    font-weight: 600;
  }
}
</style>`,

    "custom blocks": `<docs>
Renders the counter.
</docs>

<i18n>
en: hello
</i18n>`,
  },
  [
    {
      text: `"Total: "`,
      judges: "other",
      shj: "str",
      why: "Shiki leaves the inside of an interpolation unscoped, so a string literal there reads as plain text to it; we hand the expression to `js`, which finds it",
    },
    {
      text: `"slotProps"`,
      judges: "other",
      shj: "str",
      why: "Shiki scopes a slot prop binding as a destructuring pattern while it scopes every other directive value as a string; we treat every attribute value alike",
    },
    {
      text: `"{ year }"`,
      judges: "other",
      shj: "str",
      why: "same as `v-slot:default`: the destructured form of a slot prop is still an attribute value to us",
    },
  ],
);
