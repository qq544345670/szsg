<template>
  <div
    ref="rootRef"
    class="base-multi-select"
    :class="{ 'is-open': opened, 'is-focused': focused, 'is-disabled': disabled }"
    @keydown="handleKeydown"
  >
    <div
      class="base-multi-select__control"
      :tabindex="disabled ? -1 : 0"
      role="combobox"
      :aria-expanded="opened"
      :aria-disabled="disabled"
      @click="openAndFocus"
      @focus="focused = true"
      @blur="focused = false"
    >
      <div class="base-multi-select__tags">
        <span
          v-for="option in selectedOptions"
          :key="String(option.value)"
          class="base-multi-select__tag"
        >
          <span class="base-multi-select__tag-text">{{ option.label }}</span>
          <button
            class="base-multi-select__tag-remove"
            type="button"
            :disabled="disabled"
            @mousedown.prevent.stop="removeValue(option.value)"
          >
            ×
          </button>
        </span>
        <input
          ref="inputRef"
          v-model="keyword"
          class="base-multi-select__input"
          :placeholder="selectedOptions.length ? '' : placeholder"
          :disabled="disabled"
          @input="openDropdown"
          @focus="openDropdown"
        />
      </div>
      <span class="base-multi-select__arrow">⌄</span>
    </div>

    <div v-if="opened" class="base-multi-select__dropdown" role="listbox" aria-multiselectable="true">
      <div class="base-multi-select__actions">
        <div class="base-multi-select__action" @mousedown.prevent="selectAll">全选</div>
        <div class="base-multi-select__action" @mousedown.prevent="clearAll">清空</div>
      </div>

      <div
        v-for="(option, index) in filteredOptions"
        :key="String(option.value)"
        class="base-multi-select__option"
        :class="{
          'is-hovered': index === activeIndex,
          'is-selected': isSelected(option.value),
          'is-disabled': option.disabled
        }"
        role="option"
        :aria-selected="isSelected(option.value)"
        @mouseenter="activeIndex = index"
        @mousedown.prevent="toggleOption(option)"
      >
        <span class="base-multi-select__checkbox"></span>
        <span class="base-multi-select__label">{{ option.label }}</span>
      </div>
      <div v-if="!filteredOptions.length" class="base-multi-select__empty">{{ emptyText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { BaseMultiSelectOption } from "./types";
import "./base-select.css";

const props = withDefaults(defineProps<{
  modelValue?: Array<string | number>;
  options: BaseMultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
}>(), {
  modelValue: () => [],
  placeholder: "请选择",
  disabled: false,
  emptyText: "暂无数据"
});

const emit = defineEmits<{
  "update:modelValue": [value: Array<string | number>];
  change: [options: BaseMultiSelectOption[]];
}>();

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const opened = ref(false);
const focused = ref(false);
const keyword = ref("");
const activeIndex = ref(-1);

const selectedSet = computed(() => new Set(props.modelValue));
const selectedOptions = computed(() => props.options.filter(item => selectedSet.value.has(item.value)));
const filteredOptions = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  if (!text) return props.options;
  return props.options.filter(item => item.label.toLowerCase().includes(text));
});

function isSelected(value: string | number) {
  return selectedSet.value.has(value);
}

function emitValue(values: Array<string | number>) {
  const normalized = [...new Set(values)];
  emit("update:modelValue", normalized);
  emit("change", props.options.filter(item => normalized.includes(item.value)));
}

function openDropdown() {
  if (props.disabled) return;
  opened.value = true;
  if (activeIndex.value < 0) activeIndex.value = filteredOptions.value.findIndex(item => !item.disabled);
}

function openAndFocus() {
  if (props.disabled) return;
  openDropdown();
  nextTick(() => inputRef.value?.focus());
}

function closeDropdown() {
  opened.value = false;
  keyword.value = "";
}

function toggleOption(option: BaseMultiSelectOption | undefined) {
  if (!option || option.disabled) return;
  const values = props.modelValue.slice();
  const index = values.indexOf(option.value);
  if (index >= 0) values.splice(index, 1);
  else values.push(option.value);
  emitValue(values);
}

function removeValue(value: string | number) {
  if (props.disabled) return;
  emitValue(props.modelValue.filter(item => item !== value));
}

function selectAll() {
  if (props.disabled) return;
  const enabledValues = props.options.filter(item => !item.disabled).map(item => item.value);
  emitValue([...props.modelValue, ...enabledValues]);
}

function clearAll() {
  if (props.disabled) return;
  emitValue([]);
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
    toggleOption(filteredOptions.value[activeIndex.value]);
  } else if (event.key === "Escape") {
    closeDropdown();
  } else if (event.key === "Backspace" && !keyword.value && props.modelValue.length) {
    removeValue(props.modelValue[props.modelValue.length - 1]);
  }
}

function handleDocumentClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) closeDropdown();
}

onMounted(() => document.addEventListener("mousedown", handleDocumentClick));
onBeforeUnmount(() => document.removeEventListener("mousedown", handleDocumentClick));
</script>
