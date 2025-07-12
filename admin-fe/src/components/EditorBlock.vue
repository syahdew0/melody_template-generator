<template>
    <div id="editorjs" class="bg-white border rounded shadow-sm p-4"></div>
  </template>
  
  <script>
  import EditorJS from '@editorjs/editorjs'
  import Header from '@editorjs/header'
  import List from '@editorjs/list'
  import ImageTool from '@editorjs/image'
  
  export default {
    name: 'EditorBlock',
    props: {
      content: Object
    },
    emits: ['update'],
    data() {
      return {
        editor: null
      }
    },
    mounted() {
      this.editor = new EditorJS({
        holder: 'editorjs',
        autofocus: true,
        data: this.content,
        tools: {
          header: Header,
          list: List,
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: '/api/upload/image', // POST: FormData file
                byUrl: '/api/upload/image-by-url' // POST: JSON { url: '' }
              }
            }
          }
        },
        onChange: async () => {
          const output = await this.editor.save()
          this.$emit('update', output)
        }
      })
    },
    beforeUnmount() {
      if (this.editor && this.editor.destroy) {
        this.editor.destroy()
      }
    }
  }
  </script>
  
  <style scoped>
  #editorjs {
    min-height: 300px;
  }
  </style>