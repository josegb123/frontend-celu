import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => {
    //objetos y datos estaticos
    return {
      count: 1,
    }
  },
  getters: {
    //valores computados
    times2: (state) => state.count * 2,
  },
  actions: {
    //funciones, sincronas o asincronas
    increment(val = 1) {
      this.count += val
    },
    decrement(val = 1) {
      this.count -= val
    },
  },
})
