<template>
  <div
    ref="rootRef"
    class="base-select"
    :class="{ 'is-open': opened, 'is-focused': focused, 'is-disabled': disabled }"
    @keydown="handleKeydown"
  >
    <div
      class="base-select__control"
      :tabindex="disabled ? -1 : 0"
      role="combobox"
      :aria-expanded="opened"
      :aria-disabled="disabled"
      @click="toggleDropdown"
      @focus="focused = true"
      @blur="focused = false"
    >
      <input
        ref="inputRef"
        v-model="keyword"
        class="base-select__input"
        :placeholder="selectedLabel || placeholder"
        :disabled="disabled"
        :readonly="!filterable"
        @input="openDropdown"
        @focus="openDropdown"
      />
      <span class="base-select__arrow">⌄</span>
    </div>

    <div v-if="opened" class="base-select__dropdown" role="listbox">
      <div
        v-for="(option, index) in filteredOptions"
        :key="String(option.value)"
        class="base-select__option"
        :class="{
          'is-hovered': index === activeIndex,
          'is-selected': option.value === modelValue,
          'is-disabled': option.disabled
        }"
        role="option"
        :aria-selected="option.value === modelValue"
        @mouseenter="activeIndex = index"
        @mousedown.prevent="selectOption(option)"
      >
        <span class="base-select__label">{{ option.label }}</span>
      </div>
      <div v-if="!filteredOptions.length" class="base-select__empty">{{ emptyText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { BaseSelectOption } from "./types";
import "./base-select.css";

const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  options: BaseSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  filterable?: boolean;
  emptyText?: string;
}>(), {
  modelValue: null,
  placeholder: "请选择",
  disabled: false,
  filterable: true,
  emptyText: "暂无数据"
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  change: [option: BaseSelectOption | null];
}>();

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const opened = ref(false);
const focused = ref(false);
const keyword = ref("");
const activeIndex = ref(-1);

const selectedOption = computed(() => props.options.find(item => item.value === props.modelValue) || null);
const selectedLabel = computed(() => selectedOption.value?.label || "");
const filteredOptions = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  if (!props.filterable || !text || selectedLabel.value === keyword.value) return props.options;
  return props.options.filter(item => item.label.toLowerCase().includes(text));
});

watch(() => props.modelValue, () => {
  keyword.value = selectedLabel.value;
}, { immediate: true });

function openDropdown() {
  if (props.disabled) return;
  opened.value = true;
  setActiveToSelected();
}

function toggleDropdown() {
  if (props.disabled) return;
  opened.value ? closeDropdown() : openDropdown();
  nextTick(() => inputRef.value?.focus());
}

function closeDropdown() {
  opened.value = false;
  keyword.value = selectedLabel.value;
}

function setActiveToSelected() {
  const selectedIndex = filteredOptions.value.findIndex(item => item.value === props.modelValue && !item.disabled);
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : filteredOptions.value.findIndex(item => !item.disabled);
}

function moveActive(offset: number) {
  if (!opened.value) openDropdown();
  const list = filteredOptions.value;
  if (!list.length) return;
  let next = activeIndex.value;
  for (let i = 0; i < list.length; i += 1) {
    next = (next + offset + list.length) % list.length;
    if (!list[next].disabled) {
      activeIndex.value = next;
      return;
    }
  }
}

function selectOption(option: BaseSelectOption | undefined) {
  if (!option || option.disabled) return;
  emit("update:modelValue", option.value);
  emit("change", option);
  keyword.value = option.label;
  closeDropdown();
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveActive(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    moveActive(-1);
  } else if (event.key === "Enter") {
    event.preventDefault();
    selectOption(filteredOptions.value[activeIndex.value]);
  } else if (event.key === "Escape") {
    closeDropdown();
  }
}

function handleDocumentClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) closeDropdown();
}

onMounted(() => document.addEventListener("mousedown", handleDocumentClick));
onBeforeUnmount(() => document.removeEventListener("mousedown", handleDocumentClick));
</script>
