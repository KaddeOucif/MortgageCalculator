<template>
  <SliderInput
    :model-value="displayValue"
    :label="label"
    :min="displayMin"
    :max="displayMax"
    :step="displayStep"
    :unit="currency"
    :hint="hint"
    @update:model-value="handleUpdate"
  />
</template>

<script>
import SliderInput from './SliderInput.vue';
import { toDisplayAmount, fromDisplayAmount } from '../utils/currency.js';

export default {
  name: 'MoneyInput',
  components: { SliderInput },
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      default: 10000,
    },
    currency: {
      type: String,
      required: true,
    },
    hint: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  computed: {
    displayValue() {
      return toDisplayAmount(this.modelValue, this.currency);
    },
    displayMin() {
      return toDisplayAmount(this.min, this.currency);
    },
    displayMax() {
      return toDisplayAmount(this.max, this.currency);
    },
    displayStep() {
      return Math.max(1, toDisplayAmount(this.step, this.currency));
    },
  },
  methods: {
    handleUpdate(displayAmount) {
      this.$emit('update:modelValue', fromDisplayAmount(displayAmount, this.currency));
    },
  },
};
</script>
