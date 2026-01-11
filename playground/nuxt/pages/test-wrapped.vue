<script setup lang="tsx">
/** @jsxImportSource vue */
import type { PropType } from 'vue'
import { defineComponent, ref } from 'vue'
import { LayoutGroup, Reorder, motion, useMotionValue } from 'motion-v'

interface TodoItem {
  id: number
  text: string
  completed: boolean
  color: string
}

const COLORS = [
  '#ff0088',
  '#dd00ee',
  '#9911ff',
  '#1e75f7',
  '#0cdcf7',
  '#8df0cc',
]

const initialTodos: TodoItem[] = [
  {
    id: 0,
    text: 'Review project proposal',
    completed: false,
    color: COLORS[0],
  },
  { id: 1, text: 'Update documentation', completed: false, color: COLORS[1] },
  {
    id: 2,
    text: 'Schedule team meeting',
    completed: false,
    color: COLORS[2],
  },
  { id: 3, text: 'Test new features', completed: false, color: COLORS[3] },
  { id: 4, text: 'Deploy to staging', completed: false, color: COLORS[4] },
  { id: 5, text: 'Send weekly report', completed: false, color: COLORS[5] },
  {
    id: 6,
    text: 'Prepare presentation slides',
    completed: false,
    color: COLORS[0],
  },
  { id: 7, text: 'Review pull requests', completed: false, color: COLORS[1] },
]

const todos = ref<TodoItem[]>(initialTodos)

function toggleTodo(id: number) {
  const updated = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  )

  const targetTodo = updated.find(t => t.id === id)
  todos.value = updated

  if (targetTodo?.completed) {
    // Move completed to end after a delay for animation
    setTimeout(() => {
      const completed = todos.value.filter(t => t.completed)
      const uncompleted = todos.value.filter(t => !t.completed)
      todos.value = [...uncompleted, ...completed]
    }, 600)
  }
}

// ✅ 解决方案：包装组件版本
const Item = defineComponent({
  props: {
    // ⭐ 关键1：直接接收 todo 对象作为 value，保持引用稳定
    value: {
      type: Object as PropType<TodoItem>,
      required: true,
    },
    onToggle: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    const boxShadow = useMotionValue('0 1px 2px rgba(0,0,0,0.1)')
    const checkboxRef = ref<HTMLButtonElement | null>(null)

    return () => {
      // ⭐ 关键2：直接使用 props.value，不要解构
      const todo = props.value
      const { onToggle } = props
      console.log('todo', todo)
      return (
        <Reorder.Item
          value={props.value} // ⭐ 关键3：直接传递 props.value，保持引用
          class="todo-item"
          style={{ boxShadow }}
        >
          <button
            ref={checkboxRef}
            class="todo-checkbox"
            style={{
              borderColor: todo.color,
              backgroundColor: todo.completed ? todo.color : 'transparent',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            onPointerDownCapture={(e: PointerEvent) => {
              e.stopPropagation()
            }}
          >
            {todo.completed
              ? (
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 12 10"
                    fill="none"
                    style={{ display: 'block' }}
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                )
              : null}
          </button>
          <span class="todo-text-wrapper">
            <motion.span
              animate={{ opacity: todo.completed ? 0.45 : 1 }}
              transition={{ duration: 0.4 }}
              class="todo-text"
            >
              {todo.text}
            </motion.span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: todo.completed ? 1 : 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              class="todo-strikethrough"
              style={{ backgroundColor: todo.color }}
            />
          </span>
        </Reorder.Item>
      )
    }
  },
})
</script>

<template>
  <div class="todo-container">
    <LayoutGroup>
      <Reorder.Group
        v-model:values="todos"
        axis="y"
        class="todo-list"
        as="ul"
      >
        <!-- ⭐ 关键5：传递 todo 对象作为 value prop -->
        <Item
          v-for="todo in todos"
          :key="todo.id"
          :value="todo"
          @toggle="toggleTodo(todo.id)"
        />
      </Reorder.Group>
    </LayoutGroup>
  </div>
</template>

<style>
.todo-container {
  width: 100%;
  max-width: 340px;
  height: 240px;
  overflow: auto;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.todo-container::-webkit-scrollbar {
  width: 6px;
}

.todo-container::-webkit-scrollbar-track {
  background: transparent;
}

.todo-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background-color: #f9fafb;
  border-radius: 10px;
  cursor: grab;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s;
}

.todo-text-wrapper {
  position: relative;
  display: inline;
}

.todo-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.todo-strikethrough {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1.5px;
  transform-origin: left center;
  border-radius: 1px;
  pointer-events: none;
}
</style>
