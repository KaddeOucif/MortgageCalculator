<template>
  <div class="currency-toggle segmented-control">
    <button
      v-for="option in options"
      :key="option"
      :class="{ active: modelValue === option }"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script>
import { CURRENCIES } from '../utils/currency.js';

export default {
  name: 'CurrencyToggle',
  props: {
    modelValue: {
      type: String,
      default: CURRENCIES.SEK,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      options: [CURRENCIES.SEK, CURRENCIES.EUR],
    };
  },
};
</script>
