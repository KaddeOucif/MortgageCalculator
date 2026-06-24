<template>
  <div class="input-widget">
    <div class="input-widget-header">
      <label :for="inputId">{{ label }}</label>
      <span v-if="unit" class="unit-badge">{{ unit }}</span>
    </div>
    <input
      type="range"
      class="range-input"
      :id="`${inputId}-range`"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="handleRangeInput"
    >
    <div class="input-with-unit">
      <input
        type="number"
        class="number-input"
        :id="inputId"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        @input="handleNumberInput"
      >
      <span v-if="unit" class="input-unit">{{ unit }}</span>
    </div>
    <div v-if="hint" class="tooltip-hint">{{ hint }}</div>
  </div>
</template>

<script>
let sliderIdCounter = 0;

export default {
  name: 'SliderInput',
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
      default: 1,
    },
    unit: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      inputId: `slider-input-${++sliderIdCounter}`,
    };
  },
  methods: {
    clamp(value) {
      return Math.min(this.max, Math.max(this.min, value));
    },
    handleRangeInput(event) {
      this.$emit('update:modelValue', Number(event.target.value));
    },
    handleNumberInput(event) {
      const value = Number(event.target.value);
      if (Number.isNaN(value)) return;
      this.$emit('update:modelValue', this.clamp(value));
    },
  },
};
</script>

<style scoped>
.input-widget {
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-primary-soft) 0%, rgba(6, 182, 212, 0.05) 100%);
  border: 1px solid rgba(79, 70, 229, 0.12);
  border-radius: var(--radius-md);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.input-widget:hover {
  border-color: rgba(79, 70, 229, 0.25);
  box-shadow: 0 2px 12px rgba(79, 70, 229, 0.08);
}

.input-widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
}

.input-widget-header label {
  margin-bottom: 0;
  font-weight: 600;
  color: var(--color-text);
}

.unit-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  background: rgba(79, 70, 229, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
}

.number-input {
  flex: 1;
}

.input-unit {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  white-space: nowrap;
}
</style>
