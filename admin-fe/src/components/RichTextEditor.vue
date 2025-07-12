<template>
    <div class="space-y-2">
      <!-- Toolbar -->
      <div v-if="editor" class="flex flex-wrap gap-2 border p-2 rounded bg-gray-100">
        <button
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'bg-blue-500 text-white': editor?.isActive?.('bold') }"
          class="px-2 py-1 rounded border"
        >
          Bold
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'bg-blue-500 text-white': editor?.isActive?.('italic') }"
          class="px-2 py-1 rounded border"
        >
          Italic
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'bg-blue-500 text-white': editor?.isActive?.('heading', { level: 2 }) }"
          class="px-2 py-1 rounded border"
        >
          H2
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'bg-blue-500 text-white': editor?.isActive?.('bulletList') }"
          class="px-2 py-1 rounded border"
        >
          • List
        </button>
      </div>
  
      <!-- Editor Content -->
      <EditorContent v-if="editor" :editor="editor" class="border p-3 min-h-[200px] rounded" />
    </div>
  </template>
  
  <script>
  import { EditorContent, useEditor } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  
  export default {
    name: 'RichTextEditor',
    components: {
      EditorContent
    },
    props: {
      modelValue: {
        type: String,
        default: ''
      }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        editor: null
      }
    },
    mounted() {
      this.editor = useEditor({
        content: this.modelValue,
        extensions: [
          StarterKit
        ],
        onUpdate: ({ editor }) => {
          this.$emit('update:modelValue', editor.getHTML())
        }
      })
    },
    beforeUnmount() {
      if (this.editor) {
        this.editor.destroy()
      }
    }
  }
  </script>
  
  <style scoped>
  /* Optional styling */
  </style>
  