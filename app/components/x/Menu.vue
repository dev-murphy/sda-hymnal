<script lang="ts" setup>
withDefaults(
  defineProps<{
    direction?: "top" | "bottom";
    alignment?: "left" | "right" | "center";
  }>(),
  {
    direction: "bottom",
    alignment: "right",
  },
);

const isMenuOpen = ref(false);
const menuRef = useTemplateRef("menuRef");
onClickOutside(menuRef, () => {
  isMenuOpen.value = false;
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}
</script>

<template>
  <div ref="menuRef" class="relative">
    <slot :trigger-event="toggleMenu" :is-open="isMenuOpen" />

    <Transition name="fade">
      <div
        v-if="isMenuOpen"
        :class="[
          'absolute bg-white border border-neutral-300 shadow-md rounded-lg z-[100]',
          {
            'top-full translate-y-1': direction === 'bottom',
            'bottom-full -translate-y-1': direction === 'top',
            'left-0': alignment === 'left',
            'right-0': alignment === 'right',
            'left-1/2 -translate-x-1/2': alignment === 'center',
          },
        ]"
      >
        <slot name="menu" :trigger-event="toggleMenu" />
      </div>
    </Transition>
  </div>
</template>
